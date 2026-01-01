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
        autoConfirmAt,
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
