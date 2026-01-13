import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for creating a payment
const createPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(["cash", "orange_money"]),
  receiptNumber: z.string().min(1),
  transactionRef: z.string().optional(),
  receiptImageUrl: z.string().optional(),
  notes: z.string().optional(),
  paymentScheduleId: z.string().optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/enrollments/[id]/payments
 * Get all payments for an enrollment
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("student_enrollment", "view")
  if (error) return error

  const { id } = await params

  try {
    const payments = await prisma.payment.findMany({
      where: { enrollmentId: id },
      include: {
        recorder: { select: { name: true, email: true } },
        confirmer: { select: { name: true, email: true } },
        paymentSchedule: true,
      },
      orderBy: { recordedAt: "desc" },
    })

    return NextResponse.json(payments)
  } catch (err) {
    console.error("Error fetching payments:", err)
    return NextResponse.json(
      { message: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/enrollments/[id]/payments
 * Record a new payment for an enrollment
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("student_enrollment", "update")
  if (error) return error

  const { id } = await params

  try {
    // Verify enrollment exists and is in valid status
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        paymentSchedules: {
          orderBy: { scheduleNumber: "asc" },
        },
        payments: {
          where: { status: "confirmed" },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 404 }
      )
    }

    // Only allow payments for submitted or approved enrollments
    if (!["submitted", "needs_review", "completed"].includes(enrollment.status)) {
      return NextResponse.json(
        { message: "Cannot record payment for enrollment in current status" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = createPaymentSchema.parse(body)

    // Calculate total already paid
    const totalPaid = enrollment.payments.reduce((sum, p) => sum + p.amount, 0)
    const tuitionFee = enrollment.adjustedTuitionFee || enrollment.originalTuitionFee
    const remainingBalance = tuitionFee - totalPaid

    if (validated.amount > remainingBalance) {
      return NextResponse.json(
        { message: `Amount exceeds remaining balance of ${remainingBalance} GNF` },
        { status: 400 }
      )
    }

    // Determine which payment schedule this covers
    let paymentScheduleId = validated.paymentScheduleId
    if (!paymentScheduleId) {
      // Find the first unpaid schedule
      const unpaidSchedule = enrollment.paymentSchedules.find((s) => !s.isPaid)
      if (unpaidSchedule) {
        paymentScheduleId = unpaidSchedule.id
      }
    }

    // Payments are confirmed immediately - money is received
    const initialStatus = "confirmed"

    // Create the payment with treasury tracking
    const payment = await prisma.$transaction(async (tx) => {
      // Get current safe balance for treasury tracking
      const currentBalance = await tx.treasuryBalance.findFirst()
      if (currentBalance) {
        // Update balances based on payment method
        if (validated.method === "cash") {
          const newSafeBalance = currentBalance.safeBalance + validated.amount
          await tx.safeTransaction.create({
            data: {
              type: "student_payment",
              direction: "in",
              amount: validated.amount,
              safeBalanceAfter: newSafeBalance,
              bankBalanceAfter: currentBalance.bankBalance,
              mobileMoneyBalanceAfter: currentBalance.mobileMoneyBalance,
              description: `Paiement scolarité - ${validated.receiptNumber}`,
              receiptNumber: validated.receiptNumber,
              referenceType: "payment",
              studentId: enrollment.studentId,
              recordedBy: session!.user.id,
            },
          })
          await tx.treasuryBalance.update({
            where: { id: currentBalance.id },
            data: { safeBalance: newSafeBalance, updatedAt: new Date() },
          })
        } else if (validated.method === "orange_money") {
          const newMobileMoneyBalance = currentBalance.mobileMoneyBalance + validated.amount
          await tx.safeTransaction.create({
            data: {
              type: "mobile_money_income",
              direction: "in",
              amount: validated.amount,
              safeBalanceAfter: currentBalance.safeBalance,
              bankBalanceAfter: currentBalance.bankBalance,
              mobileMoneyBalanceAfter: newMobileMoneyBalance,
              description: `Paiement Orange Money - ${validated.receiptNumber}`,
              receiptNumber: validated.receiptNumber,
              referenceType: "payment",
              studentId: enrollment.studentId,
              recordedBy: session!.user.id,
            },
          })
          await tx.treasuryBalance.update({
            where: { id: currentBalance.id },
            data: { mobileMoneyBalance: newMobileMoneyBalance, updatedAt: new Date() },
          })
        }
      }

      // Create the payment record
      const newPayment = await tx.payment.create({
        data: {
          enrollmentId: id,
          paymentScheduleId,
          amount: validated.amount,
          method: validated.method,
          receiptNumber: validated.receiptNumber,
          transactionRef: validated.transactionRef,
          receiptImageUrl: validated.receiptImageUrl,
          notes: validated.notes,
          recordedBy: session!.user.id,
          status: initialStatus,
          confirmedBy: session!.user.id,
          confirmedAt: new Date(),
        },
        include: {
          recorder: { select: { name: true, email: true } },
        },
      })

      // Mark payment schedule as paid if applicable
      if (paymentScheduleId) {
        const allConfirmedPayments = [...enrollment.payments, { amount: validated.amount }]
        const newTotalPaid = allConfirmedPayments.reduce((sum, p) => sum + p.amount, 0)

        let runningTotal = 0
        for (const schedule of enrollment.paymentSchedules) {
          runningTotal += schedule.amount
          if (runningTotal <= newTotalPaid && !schedule.isPaid) {
            await tx.paymentSchedule.update({
              where: { id: schedule.id },
              data: { isPaid: true },
            })
          }
        }
      }

      return newPayment
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating payment:", err)
    return NextResponse.json(
      { message: "Failed to record payment" },
      { status: 500 }
    )
  }
}
