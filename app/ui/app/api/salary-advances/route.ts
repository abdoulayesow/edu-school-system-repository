import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { SafeTransactionType, CashDirection } from "@prisma/client"

const createAdvanceSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  amount: z.number().int().positive("Amount must be positive"),
  method: z.enum(["cash", "orange_money"]),
  reason: z.string().min(1, "Reason is required"),
  strategy: z.enum(["full", "spread", "custom"]),
  numberOfInstallments: z.number().int().positive().optional(),
})

/**
 * GET /api/salary-advances
 * List salary advances with optional filters
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("salary_advances", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  const status = searchParams.get("status")
  const strategy = searchParams.get("strategy")
  const search = searchParams.get("search")
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "100")), 500)
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"))

  try {
    const where: Record<string, unknown> = {}

    if (userId) where.userId = userId
    if (status) where.status = status
    if (strategy) where.strategy = strategy

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    }

    const include = {
      user: { select: { id: true, name: true, email: true, role: true } },
      disburser: { select: { id: true, name: true } },
      canceller: { select: { id: true, name: true } },
      recoupments: {
        include: {
          salaryPayment: {
            select: { id: true, month: true, year: true, paidAt: true },
          },
        },
        orderBy: { createdAt: "asc" as const },
      },
    }

    const [advances, total] = await Promise.all([
      prisma.salaryAdvance.findMany({
        where,
        include,
        orderBy: [{ createdAt: "desc" }],
        take: limit,
        skip: offset,
      }),
      prisma.salaryAdvance.count({ where }),
    ])

    // Compute stats
    const allActive = await prisma.salaryAdvance.findMany({
      where: { ...where, status: "active" },
      select: { remainingBalance: true },
    })

    // This month's recoupments
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    const thisMonthRecoupments = await prisma.advanceRecoupment.aggregate({
      where: {
        createdAt: { gte: thisMonthStart, lte: thisMonthEnd },
        salaryAdvance: where.userId ? { userId: where.userId as string } : undefined,
      },
      _sum: { amount: true },
    })

    const stats = {
      activeCount: allActive.length,
      totalOutstanding: allActive.reduce((sum, a) => sum + a.remainingBalance, 0),
      thisMonthRecoupments: thisMonthRecoupments._sum.amount ?? 0,
    }

    return NextResponse.json({
      advances,
      stats,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + advances.length < total,
      },
    })
  } catch (err) {
    console.error("Error fetching salary advances:", err)
    return NextResponse.json(
      { message: "Failed to fetch salary advances" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/salary-advances
 * Create a new salary advance (disburse from treasury)
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requirePerm("salary_advances", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validated = createAdvanceSchema.parse(body)

    // Validate spread strategy requires numberOfInstallments
    if (validated.strategy === "spread" && !validated.numberOfInstallments) {
      return NextResponse.json(
        { message: "Number of installments is required for spread strategy" },
        { status: 400 }
      )
    }

    const isCash = validated.method === "cash"

    // ---------------------------------------------------------------
    // ATOMIC TRANSACTION
    // All queries + mutations inside transaction to prevent races
    // ---------------------------------------------------------------
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get treasury balance (inside transaction for consistency)
      const currentBalance = await tx.treasuryBalance.findFirst()
      if (!currentBalance) {
        throw new Error("BALANCE_NOT_INITIALIZED")
      }

      // 2. Balance check (inside transaction — reads fresh balance)
      if (isCash) {
        if (currentBalance.registryBalance === 0) {
          throw new Error("CASH_REGISTER_CLOSED")
        }
        if (currentBalance.registryBalance < validated.amount) {
          throw new Error(`INSUFFICIENT_CASH:${currentBalance.registryBalance}:${validated.amount}`)
        }
      } else {
        if (currentBalance.mobileMoneyBalance < validated.amount) {
          throw new Error(`INSUFFICIENT_MOBILE:${currentBalance.mobileMoneyBalance}:${validated.amount}`)
        }
      }

      // 3. Get user name for transaction description
      const user = await tx.user.findUnique({
        where: { id: validated.userId },
        select: { name: true },
      })

      const newRegistryBalance = isCash
        ? currentBalance.registryBalance - validated.amount
        : currentBalance.registryBalance
      const newMobileMoneyBalance = !isCash
        ? currentBalance.mobileMoneyBalance - validated.amount
        : currentBalance.mobileMoneyBalance

      // 4. Create the advance
      const advance = await tx.salaryAdvance.create({
        data: {
          userId: validated.userId,
          amount: validated.amount,
          method: validated.method,
          reason: validated.reason,
          strategy: validated.strategy,
          numberOfInstallments: validated.numberOfInstallments ?? null,
          totalRecouped: 0,
          remainingBalance: validated.amount,
          status: "active",
          disbursedBy: session!.user.id,
          disbursedAt: new Date(),
        },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          disburser: { select: { id: true, name: true } },
        },
      })

      // 5. Create safe transaction for audit trail
      await tx.safeTransaction.create({
        data: {
          type: "salary_advance" as SafeTransactionType,
          direction: "out" as CashDirection,
          amount: validated.amount,
          registryBalanceAfter: newRegistryBalance,
          mobileMoneyBalanceAfter: newMobileMoneyBalance,
          safeBalanceAfter: currentBalance.safeBalance,
          bankBalanceAfter: currentBalance.bankBalance,
          description: `Avance salaire: ${user?.name ?? "Staff"}`,
          referenceType: "salary_advance",
          referenceId: advance.id,
          beneficiaryName: user?.name,
          category: "salary_advance",
          recordedBy: session!.user.id,
        },
      })

      // 6. Update treasury balance
      await tx.treasuryBalance.update({
        where: { id: currentBalance.id },
        data: isCash
          ? { registryBalance: newRegistryBalance }
          : { mobileMoneyBalance: newMobileMoneyBalance },
      })

      return advance
    })

    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }

    // Handle business logic errors thrown from inside transaction
    const msg = err instanceof Error ? err.message : ""
    if (msg === "BALANCE_NOT_INITIALIZED") {
      return NextResponse.json(
        { message: "Treasury not initialized. Please initialize the balance first." },
        { status: 400 }
      )
    }
    if (msg === "CASH_REGISTER_CLOSED") {
      return NextResponse.json(
        { message: "La caisse est fermée. Veuillez d'abord effectuer l'ouverture journalière." },
        { status: 400 }
      )
    }
    if (msg.startsWith("INSUFFICIENT_CASH:")) {
      const [, available, required] = msg.split(":")
      return NextResponse.json(
        { message: "Fonds insuffisants dans la caisse", available: Number(available), required: Number(required) },
        { status: 400 }
      )
    }
    if (msg.startsWith("INSUFFICIENT_MOBILE:")) {
      const [, available, required] = msg.split(":")
      return NextResponse.json(
        { message: "Solde Orange Money insuffisant", available: Number(available), required: Number(required) },
        { status: 400 }
      )
    }

    console.error("Error creating salary advance:", err)
    return NextResponse.json(
      { message: "Failed to create salary advance" },
      { status: 500 }
    )
  }
}
