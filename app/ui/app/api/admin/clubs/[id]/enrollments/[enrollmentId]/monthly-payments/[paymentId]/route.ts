import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const markPaidSchema = z.object({
  method: z.enum(["cash", "orange_money"]),
  notes: z.string().optional(),
})

type RouteParams = {
  params: Promise<{ id: string; enrollmentId: string; paymentId: string }>
}

/**
 * PATCH /api/admin/clubs/[id]/enrollments/[enrollmentId]/monthly-payments/[paymentId]
 * Mark a monthly payment as paid
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("club_enrollment", "create")
  if (error) return error

  try {
    const { id: clubId, enrollmentId, paymentId } = await params
    const body = await req.json()
    const validated = markPaidSchema.parse(body)

    // Find the monthly payment record
    const monthlyPayment = await prisma.clubMonthlyPayment.findUnique({
      where: { id: paymentId },
      include: {
        clubEnrollment: {
          include: {
            club: true,
            studentProfile: {
              include: {
                person: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    })

    if (!monthlyPayment) {
      return NextResponse.json(
        { message: "Monthly payment not found" },
        { status: 404 }
      )
    }

    // Verify it belongs to the correct club and enrollment
    if (
      monthlyPayment.clubEnrollment.clubId !== clubId ||
      monthlyPayment.clubEnrollmentId !== enrollmentId
    ) {
      return NextResponse.json(
        { message: "Monthly payment does not belong to this enrollment" },
        { status: 400 }
      )
    }

    if (monthlyPayment.isPaid) {
      return NextResponse.json(
        { message: "This month is already marked as paid" },
        { status: 400 }
      )
    }

    // Generate receipt number
    const today = new Date()
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, "")
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
    const receiptNumber = `CLB-${datePrefix}-${randomSuffix}`

    // Create ClubPayment and update ClubMonthlyPayment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the payment record
      const clubPayment = await tx.clubPayment.create({
        data: {
          clubId,
          clubEnrollmentId: enrollmentId,
          amount: monthlyPayment.amount,
          method: validated.method,
          status: "confirmed",
          receiptNumber,
          recordedBy: session!.user.id,
          recordedAt: new Date(),
          confirmedBy: session!.user.id,
          confirmedAt: new Date(),
          notes: validated.notes,
        },
      })

      // Update the monthly payment record
      const updatedMonthlyPayment = await tx.clubMonthlyPayment.update({
        where: { id: paymentId },
        data: {
          isPaid: true,
          paidAt: new Date(),
          clubPaymentId: clubPayment.id,
        },
      })

      return { clubPayment, monthlyPayment: updatedMonthlyPayment }
    })

    return NextResponse.json({
      message: "Payment recorded successfully",
      payment: result.clubPayment,
      monthlyPayment: result.monthlyPayment,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error marking monthly payment as paid:", err)
    return NextResponse.json(
      { message: "Failed to record payment" },
      { status: 500 }
    )
  }
}
