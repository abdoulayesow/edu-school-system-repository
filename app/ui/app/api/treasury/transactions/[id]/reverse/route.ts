import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { SafeTransactionType, CashDirection } from "@prisma/client"

/**
 * Transaction Reversal API
 *
 * Industry-standard approach: Never modify historical transactions.
 * Instead, create reversal entries with the current date.
 *
 * Only director or accountant can reverse transactions.
 * TODO: Add "chief_accountant" role when implemented
 */

interface RouteParams {
  params: Promise<{ id: string }>
}

const reverseTransactionSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  correctAmount: z.number().int().positive().optional(),
  correctMethod: z.enum(["cash", "orange_money"]).optional(),
})

/**
 * POST /api/treasury/transactions/[id]/reverse
 * Reverse a transaction and optionally create a correction
 * Creates an offsetting transaction with opposite direction
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  // Only directors and accountants can reverse transactions
  const { session, error } = await requireRole(["director", "accountant"])
  if (error) return error

  const { id } = await params

  try {
    const body = await req.json()
    const validated = reverseTransactionSchema.parse(body)

    const result = await prisma.$transaction(async (tx) => {
      // Find the original transaction
      const originalTx = await tx.safeTransaction.findUnique({
        where: { id },
      })

      if (!originalTx) {
        throw new Error("Transaction not found")
      }

      // Cannot reverse a reversal transaction
      if (originalTx.isReversal) {
        throw new Error("Cannot reverse a reversal transaction")
      }

      // Check if already reversed
      const existingReversal = await tx.safeTransaction.findFirst({
        where: {
          originalTransactionId: id,
          isReversal: true,
        },
      })

      if (existingReversal) {
        throw new Error("This transaction has already been reversed")
      }

      // Get current balance
      const currentBalance = await tx.safeBalance.findFirst()
      if (!currentBalance) {
        throw new Error("SafeBalance not initialized")
      }

      // Calculate reversal impact (opposite direction)
      let newSafeBalance = currentBalance.safeBalance
      let newBankBalance = currentBalance.bankBalance
      let newMobileMoneyBalance = currentBalance.mobileMoneyBalance

      // Determine which balance to adjust based on transaction type
      if (
        originalTx.type === "mobile_money_income" ||
        originalTx.type === "mobile_money_payment" ||
        originalTx.type === "mobile_money_fee"
      ) {
        // Mobile money transaction reversal
        if (originalTx.direction === "in") {
          newMobileMoneyBalance -= originalTx.amount
        } else {
          newMobileMoneyBalance += originalTx.amount
        }
      } else if (originalTx.type === "bank_deposit") {
        // Bank deposit reversal: money goes back to safe, out of bank
        newSafeBalance += originalTx.amount
        newBankBalance -= originalTx.amount
      } else if (originalTx.type === "bank_withdrawal") {
        // Bank withdrawal reversal: money goes out of safe, back to bank
        newSafeBalance -= originalTx.amount
        newBankBalance += originalTx.amount
      } else {
        // Safe transaction reversal (student_payment, expense_payment, etc.)
        if (originalTx.direction === "in") {
          newSafeBalance -= originalTx.amount
        } else {
          newSafeBalance += originalTx.amount
        }
      }

      // Validate that balances don't go negative
      if (newSafeBalance < 0 || newBankBalance < 0 || newMobileMoneyBalance < 0) {
        throw new Error(
          `Reversal would result in negative balance (Safe: ${newSafeBalance.toLocaleString()} GNF, Bank: ${newBankBalance.toLocaleString()} GNF, Mobile Money: ${newMobileMoneyBalance.toLocaleString()} GNF)`
        )
      }

      // Determine reversal transaction type
      let reversalType: SafeTransactionType
      if (originalTx.type === "student_payment") {
        reversalType = "reversal_student_payment"
      } else if (originalTx.type === "expense_payment") {
        reversalType = "reversal_expense_payment"
      } else if (originalTx.type === "bank_deposit" || originalTx.type === "bank_withdrawal") {
        reversalType = "reversal_bank_deposit"
      } else if (
        originalTx.type === "mobile_money_income" ||
        originalTx.type === "mobile_money_payment" ||
        originalTx.type === "mobile_money_fee"
      ) {
        reversalType = "reversal_mobile_money"
      } else {
        reversalType = "adjustment" // Fallback for other types
      }

      // Create reversal transaction
      const reversalTx = await tx.safeTransaction.create({
        data: {
          type: reversalType,
          direction: (originalTx.direction === "in" ? "out" : "in") as CashDirection,
          amount: originalTx.amount,
          safeBalanceAfter: newSafeBalance,
          bankBalanceAfter: newBankBalance,
          mobileMoneyBalanceAfter: newMobileMoneyBalance,
          description: `ANNULATION: ${originalTx.description || "Transaction"}`,
          referenceType: originalTx.referenceType,
          referenceId: originalTx.referenceId,
          studentId: originalTx.studentId,
          payerName: originalTx.payerName,
          beneficiaryName: originalTx.beneficiaryName,
          category: originalTx.category,
          isReversal: true,
          reversalReason: validated.reason,
          reversedBy: session!.user.id,
          reversedAt: new Date(),
          originalTransactionId: originalTx.id,
          recordedBy: session!.user.id,
          notes: `Annulé par ${session!.user.name || session!.user.email}. Raison: ${validated.reason}`,
        },
      })

      // Create correction transaction if correctAmount or correctMethod is provided
      let correctionTx = null

      if (validated.correctAmount !== undefined || validated.correctMethod !== undefined) {
        const correctionAmount = validated.correctAmount ?? originalTx.amount
        const isOrangeMoney = validated.correctMethod === "orange_money"

        // Determine correction transaction type and update balances
        let correctionType: SafeTransactionType
        if (isOrangeMoney) {
          correctionType = "mobile_money_income"
          newMobileMoneyBalance += correctionAmount
        } else {
          correctionType = "student_payment"
          newSafeBalance += correctionAmount
        }

        correctionTx = await tx.safeTransaction.create({
          data: {
            type: correctionType,
            direction: "in",
            amount: correctionAmount,
            safeBalanceAfter: newSafeBalance,
            bankBalanceAfter: newBankBalance,
            mobileMoneyBalanceAfter: newMobileMoneyBalance,
            description: `CORRECTION: ${originalTx.description || "Transaction"} (correction de ${originalTx.id.slice(-8)})`,
            referenceType: originalTx.referenceType,
            referenceId: originalTx.referenceId,
            studentId: originalTx.studentId,
            payerName: originalTx.payerName,
            recordedBy: session!.user.id,
            notes: `Correction suite à annulation. Montant corrigé: ${correctionAmount.toLocaleString()} GNF${validated.correctMethod ? `, Méthode: ${validated.correctMethod}` : ""}`,
          },
        })
      }

      // Update balances
      await tx.safeBalance.update({
        where: { id: currentBalance.id },
        data: {
          safeBalance: newSafeBalance,
          bankBalance: newBankBalance,
          mobileMoneyBalance: newMobileMoneyBalance,
          updatedAt: new Date(),
        },
      })

      return {
        reversalTx,
        correctionTx,
        newBalances: {
          safeBalance: newSafeBalance,
          bankBalance: newBankBalance,
          mobileMoneyBalance: newMobileMoneyBalance,
        },
      }
    })

    return NextResponse.json(
      {
        message: "Transaction annulée avec succès",
        reversal: result.reversalTx,
        correction: result.correctionTx,
        balances: result.newBalances,
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Erreur de validation", errors: err.errors },
        { status: 400 }
      )
    }
    const errorMessage = err instanceof Error ? err.message : "Échec de l'annulation de la transaction"
    console.error("Error reversing transaction:", err)
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * GET /api/treasury/transactions/[id]/reverse
 * Get reversal history for a transaction
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director", "accountant", "secretary"])
  if (error) return error

  const { id } = await params

  try {
    // Get the original transaction and any reversals
    const transaction = await prisma.safeTransaction.findUnique({
      where: { id },
      include: {
        reversals: {
          include: {
            recorder: { select: { id: true, name: true, email: true } },
          },
          orderBy: { recordedAt: "desc" },
        },
        originalTransaction: {
          select: {
            id: true,
            type: true,
            amount: true,
            description: true,
            recordedAt: true,
          },
        },
        recorder: { select: { id: true, name: true, email: true } },
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      transaction,
      isReversed: transaction.reversals.length > 0,
      isReversal: transaction.isReversal,
      reversalCount: transaction.reversals.length,
    })
  } catch (err) {
    console.error("Error fetching transaction reversal history:", err)
    return NextResponse.json(
      { message: "Failed to fetch reversal history" },
      { status: 500 }
    )
  }
}
