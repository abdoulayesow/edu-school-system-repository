import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
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
  const { error } = await requireSession()
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
  const { session, error } = await requireSession()
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

    // Determine initial status based on payment method
    // Cash: pending_deposit (needs bank deposit first)
    // Orange Money: pending_review (can be reviewed immediately, auto-confirm after 24h)
    const initialStatus = validated.method === "cash" ? "pending_deposit" : "pending_review"
    const autoConfirmAt = validated.method === "orange_money"
      ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      : null

    // Create the payment
    const payment = await prisma.payment.create({
      data: {
        enrollmentId: id,
        paymentScheduleId,
        amount: validated.amount,
        method: validated.method,
        receiptNumber: validated.receiptNumber,
        transactionRef: validated.transactionRef,
        receiptImageUrl: validated.receiptImageUrl,
        notes: validated.notes,
        recordedBy: session.user.id,
        status: initialStatus,
        autoConfirmAt,
      },
      include: {
        recorder: { select: { name: true, email: true } },
      },
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
