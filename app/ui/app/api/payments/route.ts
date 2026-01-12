import { NextRequest, NextResponse } from "next/server"
import { requireSession, requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for creating a payment
const createPaymentSchema = z.object({
  enrollmentId: z.string().min(1),
  amount: z.number().positive(),
  method: z.enum(["cash", "orange_money"]),
  receiptNumber: z.string().min(1),
  transactionRef: z.string().optional(),
  receiptImageUrl: z.string().optional(),
  notes: z.string().optional(),
  paymentScheduleId: z.string().optional(),
})

/**
 * GET /api/payments
 * List all payments with filters
 */
export async function GET(req: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const method = searchParams.get("method")
  const enrollmentId = searchParams.get("enrollmentId")
  const studentId = searchParams.get("studentId")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const limit = parseInt(searchParams.get("limit") || "100")
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    // Build where clause
    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }
    if (method) {
      where.method = method
    }
    if (enrollmentId) {
      where.enrollmentId = enrollmentId
    }
    if (studentId) {
      where.enrollment = { studentId }
    }
    if (startDate || endDate) {
      where.recordedAt = {}
      if (startDate) {
        (where.recordedAt as Record<string, Date>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.recordedAt as Record<string, Date>).lte = new Date(endDate)
      }
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          recorder: { select: { id: true, name: true, email: true } },
          confirmer: { select: { id: true, name: true, email: true } },
          reviewer: { select: { id: true, name: true, email: true } },
          paymentSchedule: true,
          cashDeposit: true,
          enrollment: {
            select: {
              id: true,
              enrollmentNumber: true,
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  studentNumber: true,
                },
              },
              grade: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { recordedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.payment.count({ where }),
    ])

    return NextResponse.json({
      payments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + payments.length < total,
      },
    })
  } catch (err) {
    console.error("Error fetching payments:", err)
    return NextResponse.json(
      { message: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/payments
 * Create a new payment
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(["director", "accountant", "secretary"])
  if (error) return error

  try {
    const body = await req.json()
    const validated = createPaymentSchema.parse(body)

    // Verify enrollment exists and is in valid status
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: validated.enrollmentId },
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

    // All payments are confirmed immediately upon recording
    // The money is physically received (cash) or confirmed in account (Orange Money)
    // Parent receives receipt on the spot - payment is complete
    const initialStatus = "confirmed"

    // Create payment in a transaction
    // For cash payments: immediately add to registry balance (cash is physically received in registry box)
    // For Orange Money: immediately add to mobile money balance
    const payment = await prisma.$transaction(async (tx) => {
      // For cash payments, update registry balance immediately
      if (validated.method === "cash") {
        const currentBalance = await tx.treasuryBalance.findFirst()
        if (!currentBalance) {
          throw new Error("TreasuryBalance not initialized. Please contact administrator.")
        }

        const newRegistryBalance = currentBalance.registryBalance + validated.amount

        // Create safe transaction for audit trail
        await tx.safeTransaction.create({
          data: {
            type: "student_payment",
            direction: "in",
            amount: validated.amount,
            registryBalanceAfter: newRegistryBalance,
            safeBalanceAfter: currentBalance.safeBalance,
            bankBalanceAfter: currentBalance.bankBalance,
            mobileMoneyBalanceAfter: currentBalance.mobileMoneyBalance,
            description: `Paiement scolarité - ${validated.receiptNumber}`,
            receiptNumber: validated.receiptNumber,
            referenceType: "payment",
            studentId: enrollment.studentId,
            recordedBy: session!.user.id,
          },
        })

        // Update registry balance
        await tx.treasuryBalance.update({
          where: { id: currentBalance.id },
          data: {
            registryBalance: newRegistryBalance,
            updatedAt: new Date(),
          },
        })
      }

      // For Orange Money payments, update mobile money balance immediately
      if (validated.method === "orange_money") {
        const currentBalance = await tx.treasuryBalance.findFirst()
        if (!currentBalance) {
          throw new Error("TreasuryBalance not initialized. Please contact administrator.")
        }

        const newMobileMoneyBalance = currentBalance.mobileMoneyBalance + validated.amount

        // Create safe transaction for audit trail
        await tx.safeTransaction.create({
          data: {
            type: "mobile_money_income",
            direction: "in",
            amount: validated.amount,
            registryBalanceAfter: currentBalance.registryBalance,
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

        // Update mobile money balance
        await tx.treasuryBalance.update({
          where: { id: currentBalance.id },
          data: {
            mobileMoneyBalance: newMobileMoneyBalance,
            updatedAt: new Date(),
          },
        })
      }

      // Create the payment record
      const newPayment = await tx.payment.create({
        data: {
          enrollmentId: validated.enrollmentId,
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
          recorder: { select: { id: true, name: true, email: true } },
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

      // Update the SafeTransaction with the payment reference ID
      if (validated.method === "cash" || validated.method === "orange_money") {
        await tx.safeTransaction.updateMany({
          where: {
            receiptNumber: validated.receiptNumber,
            referenceType: "payment",
            referenceId: null,
          },
          data: {
            referenceId: newPayment.id,
          },
        })
      }

      // Mark payment schedules as paid based on total confirmed payments
      // Payment is confirmed immediately, so we update schedules now
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
