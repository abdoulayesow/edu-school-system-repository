import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

// Schema for reversing a payment
const reversePaymentSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
})

/**
 * POST /api/payments/[id]/review
 * Reverse a confirmed payment (for errors)
 *
 * Note: Payments are confirmed immediately upon recording.
 * This endpoint is used to reverse payments when errors are discovered.
 * The original payment remains in history, a reversal entry is created.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("payment_recording", "update")
  if (error) return error

  const { id } = await params

  try {
    // Get existing payment
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            paymentSchedules: {
              orderBy: { scheduleNumber: "asc" },
            },
            payments: {
              where: { status: "confirmed" },
            },
          },
        },
      },
    })

    if (!existingPayment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      )
    }

    // Check enrollment exists
    if (!existingPayment.enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found for this payment" },
        { status: 404 }
      )
    }

    // Only allow reversal of confirmed payments
    if (existingPayment.status !== "confirmed") {
      return NextResponse.json(
        { message: "Only confirmed payments can be reversed" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = reversePaymentSchema.parse(body)

    // Store enrollment reference for transaction (TypeScript flow analysis)
    const enrollment = existingPayment.enrollment

    // Reverse the payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get current balances
      const currentBalance = await tx.treasuryBalance.findFirst()
      if (!currentBalance) {
        throw new Error("SafeBalance not initialized")
      }

      // Calculate new balances based on payment method
      let newSafeBalance = currentBalance.safeBalance
      let newMobileMoneyBalance = currentBalance.mobileMoneyBalance

      if (existingPayment.method === "cash") {
        // Subtract from safe (cash is being "returned")
        newSafeBalance -= existingPayment.amount
        if (newSafeBalance < 0) {
          throw new Error("Insufficient funds in safe to reverse this payment")
        }
      } else if (existingPayment.method === "orange_money") {
        // Subtract from mobile money balance
        newMobileMoneyBalance -= existingPayment.amount
        if (newMobileMoneyBalance < 0) {
          throw new Error("Insufficient mobile money balance to reverse this payment")
        }
      }

      // Create reversal safe transaction
      const datePrefix = new Date().toISOString().split("T")[0].replace(/-/g, "")
      const existingCount = await tx.safeTransaction.count({
        where: {
          receiptNumber: {
            startsWith: `REV-${datePrefix}`,
          },
        },
      })
      const reversalReceiptNumber = `REV-${datePrefix}-${String(existingCount + 1).padStart(4, "0")}`

      await tx.safeTransaction.create({
        data: {
          type: "adjustment",
          direction: "out",
          amount: existingPayment.amount,
          safeBalanceAfter: newSafeBalance,
          bankBalanceAfter: currentBalance.bankBalance,
          mobileMoneyBalanceAfter: newMobileMoneyBalance,
          description: `Annulation paiement - ${existingPayment.receiptNumber}`,
          receiptNumber: reversalReceiptNumber,
          referenceType: "payment",
          referenceId: existingPayment.id,
          studentId: enrollment.studentId,
          recordedBy: session!.user.id,
          notes: validated.reason,
        },
      })

      // Update balances
      await tx.treasuryBalance.update({
        where: { id: currentBalance.id },
        data: {
          safeBalance: newSafeBalance,
          mobileMoneyBalance: newMobileMoneyBalance,
          updatedAt: new Date(),
        },
      })

      // Update payment status to reversed
      const payment = await tx.payment.update({
        where: { id },
        data: {
          status: "reversed",
          reviewedBy: session!.user.id,
          reviewedAt: new Date(),
          reviewNotes: validated.reason,
        },
        include: {
          recorder: { select: { id: true, name: true, email: true } },
          confirmer: { select: { id: true, name: true, email: true } },
          reviewer: { select: { id: true, name: true, email: true } },
          cashDeposit: true,
          paymentSchedule: true,
        },
      })

      // Recalculate payment schedules - some may now be unpaid
      const remainingPayments = enrollment.payments.filter(
        (p) => p.id !== id
      )
      const newTotalPaid = remainingPayments.reduce((sum, p) => sum + p.amount, 0)

      let runningTotal = 0
      for (const schedule of enrollment.paymentSchedules) {
        runningTotal += schedule.amount
        // Mark as unpaid if no longer covered by remaining payments
        await tx.paymentSchedule.update({
          where: { id: schedule.id },
          data: { isPaid: runningTotal <= newTotalPaid },
        })
      }

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
    console.error("Error reversing payment:", err)
    return NextResponse.json(
      { message: "Failed to reverse payment" },
      { status: 500 }
    )
  }
}
