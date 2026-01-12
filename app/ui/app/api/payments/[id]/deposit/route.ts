import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

// Schema for recording a cash deposit
const cashDepositSchema = z.object({
  bankReference: z.string().min(1, "Bank reference is required"),
  depositDate: z.string().transform((s) => new Date(s)),
  depositedByName: z.string().optional(), // "Me" or name
  bankName: z.string().optional(),
})

/**
 * POST /api/payments/[id]/deposit
 * Record a cash deposit for a payment
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireRole(["director", "accountant"])
  if (error) return error

  const { id } = await params

  try {
    // Get existing payment
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: { cashDeposit: true },
    })

    if (!existingPayment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      )
    }

    // Only allow deposit for cash payments
    if (existingPayment.method !== "cash") {
      return NextResponse.json(
        { message: "Can only record deposit for cash payments" },
        { status: 400 }
      )
    }

    // Only allow deposit for confirmed cash payments (cash in safe, moving to bank)
    if (existingPayment.status !== "confirmed") {
      return NextResponse.json(
        { message: "Payment must be confirmed before bank deposit" },
        { status: 400 }
      )
    }

    // Check if deposit already exists
    if (existingPayment.cashDeposit) {
      return NextResponse.json(
        { message: "Deposit already recorded for this payment" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = cashDepositSchema.parse(body)

    // Create deposit and update payment status in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get current safe balance
      const currentBalance = await tx.safeBalance.findFirst()
      if (!currentBalance) {
        throw new Error("SafeBalance not initialized. Please contact administrator.")
      }

      // Validate sufficient funds in safe
      if (currentBalance.safeBalance < existingPayment.amount) {
        throw new Error(
          `Insufficient funds in safe. Available: ${currentBalance.safeBalance} GNF, Required: ${existingPayment.amount} GNF`
        )
      }

      // Calculate new balances
      const newSafeBalance = currentBalance.safeBalance - existingPayment.amount
      const newBankBalance = currentBalance.bankBalance + existingPayment.amount

      // Create cash deposit record
      const deposit = await tx.cashDeposit.create({
        data: {
          paymentId: id,
          bankReference: validated.bankReference,
          depositDate: validated.depositDate,
          depositedBy: session!.user.id,
          depositedByName: validated.depositedByName || session!.user.name || "Unknown",
          bankName: validated.bankName,
        },
      })

      // Create BankTransfer record
      const bankTransfer = await tx.bankTransfer.create({
        data: {
          type: "deposit",
          amount: existingPayment.amount,
          bankName: validated.bankName || "Banque",
          bankReference: validated.bankReference,
          safeBalanceBefore: currentBalance.safeBalance,
          safeBalanceAfter: newSafeBalance,
          bankBalanceBefore: currentBalance.bankBalance,
          bankBalanceAfter: newBankBalance,
          transferDate: validated.depositDate,
          recordedBy: session!.user.id,
          carriedBy: validated.depositedByName || session!.user.name || "Unknown",
          notes: `Dépôt banque - Paiement ${existingPayment.receiptNumber}`,
        },
      })

      // Create SafeTransaction for audit trail
      const datePrefix = new Date().toISOString().split("T")[0].replace(/-/g, "")
      const existingCount = await tx.safeTransaction.count({
        where: {
          receiptNumber: {
            startsWith: `DEPOT-${datePrefix}`,
          },
        },
      })
      const receiptNumber = `DEPOT-${datePrefix}-${String(existingCount + 1).padStart(4, "0")}`

      await tx.safeTransaction.create({
        data: {
          type: "bank_deposit",
          direction: "out",
          amount: existingPayment.amount,
          safeBalanceAfter: newSafeBalance,
          bankBalanceAfter: newBankBalance,
          description: `Dépôt banque - Paiement ${existingPayment.receiptNumber}`,
          receiptNumber: receiptNumber,
          recordedBy: session!.user.id,
          referenceType: "payment",
          referenceId: existingPayment.id,
          notes: `Référence banque: ${validated.bankReference}`,
        },
      })

      // Update SafeBalance
      await tx.safeBalance.update({
        where: { id: currentBalance.id },
        data: {
          safeBalance: newSafeBalance,
          bankBalance: newBankBalance,
          updatedAt: new Date(),
        },
      })

      // Payment stays confirmed - bank deposit is just a treasury operation
      // (moving cash from safe to bank account)
      const payment = await tx.payment.update({
        where: { id },
        data: { status: "confirmed" }, // Keep as confirmed
        include: {
          recorder: { select: { id: true, name: true, email: true } },
          cashDeposit: {
            include: {
              depositor: { select: { id: true, name: true, email: true } },
            },
          },
          enrollment: {
            select: {
              id: true,
              enrollmentNumber: true,
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      })

      return payment
    })

    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error recording deposit:", err)
    return NextResponse.json(
      { message: "Failed to record deposit" },
      { status: 500 }
    )
  }
}
