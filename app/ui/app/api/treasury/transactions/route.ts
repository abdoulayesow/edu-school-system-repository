import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { SafeTransactionType, CashDirection } from "@prisma/client"

/**
 * GET /api/treasury/transactions
 * List safe transactions with pagination and filtering
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("safe_income", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get("limit") || "50")
  const offset = parseInt(searchParams.get("offset") || "0")
  const type = searchParams.get("type") as SafeTransactionType | null
  const direction = searchParams.get("direction") as CashDirection | null
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const search = searchParams.get("search")

  try {
    const where: Record<string, unknown> = {}

    if (type) where.type = type
    if (direction) where.direction = direction

    if (startDate || endDate) {
      where.recordedAt = {}
      if (startDate) (where.recordedAt as Record<string, Date>).gte = new Date(startDate)
      if (endDate) (where.recordedAt as Record<string, Date>).lte = new Date(endDate)
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { payerName: { contains: search, mode: "insensitive" } },
        { beneficiaryName: { contains: search, mode: "insensitive" } },
        { receiptNumber: { contains: search, mode: "insensitive" } },
      ]
    }

    const [transactions, total] = await Promise.all([
      prisma.safeTransaction.findMany({
        where,
        orderBy: { recordedAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          recorder: {
            select: {
              id: true,
              name: true,
            },
          },
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentNumber: true,
            },
          },
        },
      }),
      prisma.safeTransaction.count({ where }),
    ])

    return NextResponse.json({
      data: transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + transactions.length < total,
      },
    })
  } catch (err) {
    console.error("Error fetching transactions:", err)
    return NextResponse.json(
      { message: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}

// Schema for creating a transaction
const createTransactionSchema = z.object({
  type: z.enum([
    "student_payment",
    "club_payment",
    "other_income",
    "expense_payment",
  ]),
  amount: z.number().int().positive("Amount must be positive"),
  description: z.string().optional(),
  studentId: z.string().optional(),
  payerName: z.string().optional(),
  beneficiaryName: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * POST /api/treasury/transactions
 * Record a new safe transaction (income or expense)
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requirePerm("safe_income", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validation = createTransactionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data

    // Determine direction based on type
    const direction: CashDirection =
      data.type === "expense_payment" ? "out" : "in"

    // Get current balance
    const currentBalance = await prisma.treasuryBalance.findFirst()
    if (!currentBalance) {
      return NextResponse.json(
        { message: "Treasury not initialized. Please initialize the balance first." },
        { status: 400 }
      )
    }

    // For expenses, check sufficient funds
    if (direction === "out" && currentBalance.safeBalance < data.amount) {
      return NextResponse.json(
        {
          message: "Insufficient funds in safe",
          available: currentBalance.safeBalance,
          required: data.amount,
        },
        { status: 400 }
      )
    }

    // Generate receipt number
    const today = new Date()
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, "")
    const typePrefix = direction === "in" ? "REC" : "DEP"
    const count = await prisma.safeTransaction.count({
      where: {
        recordedAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        },
      },
    })
    const receiptNumber = `CAISSE-${datePrefix}-${typePrefix}-${String(count + 1).padStart(4, "0")}`

    // Calculate new balance
    const newSafeBalance =
      direction === "in"
        ? currentBalance.safeBalance + data.amount
        : currentBalance.safeBalance - data.amount

    const result = await prisma.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.safeTransaction.create({
        data: {
          type: data.type,
          direction,
          amount: data.amount,
          safeBalanceAfter: newSafeBalance,
          description: data.description,
          studentId: data.studentId,
          payerName: data.payerName,
          beneficiaryName: data.beneficiaryName,
          category: data.category,
          receiptNumber,
          recordedBy: session!.user.id,
          notes: data.notes,
        },
        include: {
          recorder: {
            select: { id: true, name: true },
          },
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentNumber: true,
            },
          },
        },
      })

      // Update balance
      await tx.treasuryBalance.update({
        where: { id: currentBalance.id },
        data: { safeBalance: newSafeBalance },
      })

      return transaction
    })

    return NextResponse.json(
      {
        message: "Transaction recorded successfully",
        transaction: result,
        newBalance: newSafeBalance,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("Error creating transaction:", err)
    return NextResponse.json(
      { message: "Failed to create transaction" },
      { status: 500 }
    )
  }
}
