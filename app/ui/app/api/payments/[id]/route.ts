import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

// Schema for updating a payment
const updatePaymentSchema = z.object({
  amount: z.number().positive().optional(),
  receiptNumber: z.string().min(1).optional(),
  transactionRef: z.string().optional(),
  receiptImageUrl: z.string().optional(),
  notes: z.string().optional(),
  paymentScheduleId: z.string().optional(),
})

/**
 * GET /api/payments/[id]
 * Get a single payment by ID
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("payment_recording", "view")
  if (error) return error

  const { id } = await params

  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        recorder: { select: { id: true, name: true, email: true } },
        confirmer: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true, email: true } },
        paymentSchedule: true,
        cashDeposit: {
          include: {
            depositor: { select: { id: true, name: true, email: true } },
            verifier: { select: { id: true, name: true, email: true } },
          },
        },
        enrollment: {
          select: {
            id: true,
            enrollmentNumber: true,
            originalTuitionFee: true,
            adjustedTuitionFee: true,
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
            payments: {
              where: { status: "confirmed" },
              select: { amount: true },
            },
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      )
    }

    // Check enrollment exists
    if (!payment.enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found for this payment" },
        { status: 404 }
      )
    }

    // Calculate balance info
    const tuitionFee = payment.enrollment.adjustedTuitionFee || payment.enrollment.originalTuitionFee
    const totalPaid = payment.enrollment.payments.reduce((sum, p) => sum + p.amount, 0)
    const remainingBalance = tuitionFee - totalPaid

    return NextResponse.json({
      ...payment,
      balanceInfo: {
        tuitionFee,
        totalPaid,
        remainingBalance,
      },
    })
  } catch (err) {
    console.error("Error fetching payment:", err)
    return NextResponse.json(
      { message: "Failed to fetch payment" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/payments/[id]
 * Update a payment (only if not confirmed)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("payment_recording", "update")
  if (error) return error

  const { id } = await params

  try {
    // Get existing payment
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            payments: {
              where: {
                status: "confirmed",
                id: { not: id },
              },
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

    // Can only update payments that are not confirmed
    if (existingPayment.status === "confirmed") {
      return NextResponse.json(
        { message: "Cannot update a confirmed payment" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = updatePaymentSchema.parse(body)

    // If updating amount, validate it doesn't exceed remaining balance
    if (validated.amount) {
      const tuitionFee = existingPayment.enrollment.adjustedTuitionFee || existingPayment.enrollment.originalTuitionFee
      const totalPaidOthers = existingPayment.enrollment.payments.reduce((sum, p) => sum + p.amount, 0)
      const remainingBalance = tuitionFee - totalPaidOthers

      if (validated.amount > remainingBalance) {
        return NextResponse.json(
          { message: `Amount exceeds remaining balance of ${remainingBalance} GNF` },
          { status: 400 }
        )
      }
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: validated,
      include: {
        recorder: { select: { id: true, name: true, email: true } },
        confirmer: { select: { id: true, name: true, email: true } },
        paymentSchedule: true,
      },
    })

    return NextResponse.json(payment)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating payment:", err)
    return NextResponse.json(
      { message: "Failed to update payment" },
      { status: 500 }
    )
  }
}
