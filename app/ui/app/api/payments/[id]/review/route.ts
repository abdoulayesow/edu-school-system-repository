import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

// Schema for reviewing a payment
const reviewPaymentSchema = z.object({
  action: z.enum(["approve", "reject"]),
  notes: z.string().optional(),
})

/**
 * POST /api/payments/[id]/review
 * Review (approve/reject) a payment
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireRole(["director"])
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

    // Only allow review for deposited or pending_review status
    if (!["deposited", "pending_review"].includes(existingPayment.status)) {
      return NextResponse.json(
        { message: "Payment is not ready for review" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = reviewPaymentSchema.parse(body)

    const newStatus = validated.action === "approve" ? "confirmed" : "rejected"

    // Update payment with review info
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id },
        data: {
          status: newStatus,
          reviewedBy: session!.user.id,
          reviewedAt: new Date(),
          reviewNotes: validated.notes,
          confirmedBy: validated.action === "approve" ? session!.user.id : null,
          confirmedAt: validated.action === "approve" ? new Date() : null,
        },
        include: {
          recorder: { select: { id: true, name: true, email: true } },
          confirmer: { select: { id: true, name: true, email: true } },
          reviewer: { select: { id: true, name: true, email: true } },
          cashDeposit: true,
          paymentSchedule: true,
        },
      })

      // If approved and has payment schedule, mark schedule as paid
      if (validated.action === "approve" && existingPayment.paymentScheduleId) {
        // Calculate total paid including this payment
        const totalPaid = existingPayment.enrollment.payments.reduce((sum, p) => sum + p.amount, 0) + existingPayment.amount

        // Find which schedules should be marked as paid
        let runningTotal = 0
        for (const schedule of existingPayment.enrollment.paymentSchedules) {
          runningTotal += schedule.amount
          if (runningTotal <= totalPaid && !schedule.isPaid) {
            await tx.paymentSchedule.update({
              where: { id: schedule.id },
              data: { isPaid: true },
            })
          }
        }
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
    console.error("Error reviewing payment:", err)
    return NextResponse.json(
      { message: "Failed to review payment" },
      { status: 500 }
    )
  }
}
