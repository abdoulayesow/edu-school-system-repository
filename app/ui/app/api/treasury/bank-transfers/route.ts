import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { BankTransferType } from "@prisma/client"

/**
 * GET /api/treasury/bank-transfers
 * List bank transfers with pagination and filtering
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("bank_transfers", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get("limit") || "50")
  const offset = parseInt(searchParams.get("offset") || "0")
  const type = searchParams.get("type") as BankTransferType | null
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  try {
    const where: Record<string, unknown> = {}

    if (type) where.type = type

    if (startDate || endDate) {
      where.transferDate = {}
      if (startDate) (where.transferDate as Record<string, Date>).gte = new Date(startDate)
      if (endDate) (where.transferDate as Record<string, Date>).lte = new Date(endDate)
    }

    const [transfers, total] = await Promise.all([
      prisma.bankTransfer.findMany({
        where,
        orderBy: { transferDate: "desc" },
        skip: offset,
        take: limit,
        include: {
          recorder: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.bankTransfer.count({ where }),
    ])

    return NextResponse.json({
      data: transfers,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + transfers.length < total,
      },
    })
  } catch (err) {
    console.error("Error fetching bank transfers:", err)
    return NextResponse.json(
      { message: "Failed to fetch bank transfers" },
      { status: 500 }
    )
  }
}

// Schema for creating a bank transfer
const createBankTransferSchema = z.object({
  type: z.enum(["deposit", "withdrawal"]),
  amount: z.number().int().positive("Amount must be positive"),
  bankName: z.string().optional(),
  bankReference: z.string().optional(),
  carriedBy: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * POST /api/treasury/bank-transfers
 * Record a bank transfer (deposit or withdrawal)
 *
 * Deposit: Safe → Bank (decreases safe, increases bank)
 * Withdrawal: Bank → Safe (decreases bank, increases safe)
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requirePerm("bank_transfers", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validation = createBankTransferSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data

    // Get current balance
    const currentBalance = await prisma.treasuryBalance.findFirst()
    if (!currentBalance) {
      return NextResponse.json(
        { message: "Treasury not initialized. Please initialize the balance first." },
        { status: 400 }
      )
    }

    // Check sufficient funds
    if (data.type === "deposit" && currentBalance.safeBalance < data.amount) {
      return NextResponse.json(
        {
          message: "Insufficient funds in safe for deposit",
          available: currentBalance.safeBalance,
          required: data.amount,
        },
        { status: 400 }
      )
    }

    if (data.type === "withdrawal" && currentBalance.bankBalance < data.amount) {
      return NextResponse.json(
        {
          message: "Insufficient funds in bank for withdrawal",
          available: currentBalance.bankBalance,
          required: data.amount,
        },
        { status: 400 }
      )
    }

    // Calculate new balances
    const newSafeBalance =
      data.type === "deposit"
        ? currentBalance.safeBalance - data.amount
        : currentBalance.safeBalance + data.amount

    const newBankBalance =
      data.type === "deposit"
        ? currentBalance.bankBalance + data.amount
        : currentBalance.bankBalance - data.amount

    const result = await prisma.$transaction(async (tx) => {
      // Create bank transfer record
      const transfer = await tx.bankTransfer.create({
        data: {
          type: data.type,
          amount: data.amount,
          bankName: data.bankName,
          bankReference: data.bankReference,
          safeBalanceBefore: currentBalance.safeBalance,
          safeBalanceAfter: newSafeBalance,
          bankBalanceBefore: currentBalance.bankBalance,
          bankBalanceAfter: newBankBalance,
          carriedBy: data.carriedBy,
          recordedBy: session!.user.id,
          notes: data.notes,
        },
        include: {
          recorder: {
            select: { id: true, name: true },
          },
        },
      })

      // Create safe transaction for audit trail
      await tx.safeTransaction.create({
        data: {
          type: data.type === "deposit" ? "bank_deposit" : "bank_withdrawal",
          direction: data.type === "deposit" ? "out" : "in",
          amount: data.amount,
          safeBalanceAfter: newSafeBalance,
          bankBalanceAfter: newBankBalance,
          description:
            data.type === "deposit"
              ? `Dépôt en banque${data.bankName ? ` - ${data.bankName}` : ""}`
              : `Retrait de banque${data.bankName ? ` - ${data.bankName}` : ""}`,
          referenceType: "bank_transfer",
          referenceId: transfer.id,
          recordedBy: session!.user.id,
          notes: data.notes,
        },
      })

      // Update balances
      await tx.treasuryBalance.update({
        where: { id: currentBalance.id },
        data: {
          safeBalance: newSafeBalance,
          bankBalance: newBankBalance,
        },
      })

      return transfer
    })

    return NextResponse.json(
      {
        message:
          data.type === "deposit"
            ? "Bank deposit recorded successfully"
            : "Bank withdrawal recorded successfully",
        transfer: result,
        balances: {
          safe: newSafeBalance,
          bank: newBankBalance,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("Error creating bank transfer:", err)
    return NextResponse.json(
      { message: "Failed to create bank transfer" },
      { status: 500 }
    )
  }
}
