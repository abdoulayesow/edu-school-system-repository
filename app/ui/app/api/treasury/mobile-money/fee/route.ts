import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { SafeTransactionType, CashDirection } from "@prisma/client"

const recordFeeSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
})

/**
 * POST /api/treasury/mobile-money/fee
 * Record a Mobile Money transaction fee
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requirePerm("safe_balance", "update")
  if (error) return error

  try {
    const body = await req.json()
    const validated = recordFeeSchema.parse(body)

    const result = await prisma.$transaction(async (tx) => {
      const currentBalance = await tx.treasuryBalance.findFirst()
      if (!currentBalance) {
        throw new Error("SafeBalance not initialized")
      }

      if (currentBalance.mobileMoneyBalance < validated.amount) {
        throw new Error("Insufficient mobile money balance")
      }

      const newMobileMoneyBalance = currentBalance.mobileMoneyBalance - validated.amount

      // Create fee transaction
      const feeTransaction = await tx.safeTransaction.create({
        data: {
          type: "mobile_money_fee" as SafeTransactionType,
          direction: "out" as CashDirection,
          amount: validated.amount,
          safeBalanceAfter: currentBalance.safeBalance,
          bankBalanceAfter: currentBalance.bankBalance,
          description: validated.description || "Frais Orange Money",
          recordedBy: session!.user.id,
        },
      })

      // Update balance
      await tx.treasuryBalance.update({
        where: { id: currentBalance.id },
        data: {
          mobileMoneyBalance: newMobileMoneyBalance,
          updatedAt: new Date(),
        },
      })

      return { feeTransaction, newMobileMoneyBalance }
    })

    return NextResponse.json(
      {
        message: "Fee recorded successfully",
        transaction: result.feeTransaction,
        newBalance: result.newMobileMoneyBalance,
      },
      { status: 201 }
    )
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error recording fee:", err)
    return NextResponse.json(
      { message: err.message || "Failed to record fee" },
      { status: 500 }
    )
  }
}
