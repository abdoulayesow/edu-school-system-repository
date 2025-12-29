import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/enrollments/[id]/cancel
 * Cancel a draft enrollment (requires a reason/comment)
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession()
  if (error) return error

  const { id } = await params

  try {
    const body = await req.json().catch(() => ({}))
    const reason = body.reason

    // Validate that a reason is provided
    if (!reason || typeof reason !== "string" || reason.trim() === "") {
      return NextResponse.json(
        { message: "A reason is required when cancelling an enrollment" },
        { status: 400 }
      )
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
    })

    if (!enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 404 }
      )
    }

    // Only allow cancelling draft enrollments
    if (enrollment.status !== "draft") {
      return NextResponse.json(
        { message: "Only draft enrollments can be cancelled" },
        { status: 400 }
      )
    }

    // Only allow the creator or a director to cancel
    const isDirector = session.user.role === "director"
    const isCreator = enrollment.createdBy === session.user.id

    if (!isDirector && !isCreator) {
      return NextResponse.json(
        { message: "You are not authorized to cancel this enrollment" },
        { status: 403 }
      )
    }

    // Add a note with the cancellation reason
    await prisma.enrollmentNote.create({
      data: {
        enrollmentId: id,
        title: "Enrollment Cancelled",
        content: reason.trim(),
        createdBy: session.user.id,
      },
    })

    const now = new Date()
    const updated = await prisma.enrollment.update({
      where: { id },
      data: {
        status: "cancelled",
        statusChangedAt: now,
        statusChangedBy: session.user.id,
        statusComment: reason.trim(),
        draftExpiresAt: null, // Clear draft expiration
      },
      include: {
        grade: true,
        schoolYear: true,
        student: true,
        paymentSchedules: {
          orderBy: { scheduleNumber: "asc" },
        },
        payments: {
          include: {
            recorder: { select: { name: true, email: true } },
          },
          orderBy: { recordedAt: "desc" },
        },
        notes: {
          include: {
            author: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        creator: { select: { name: true, email: true } },
        approver: { select: { name: true, email: true } },
      },
    })

    // Calculate payment summary
    const totalPaid = updated.payments
      .filter((p) => p.status === "confirmed")
      .reduce((sum, p) => sum + p.amount, 0)

    const tuitionFee = updated.adjustedTuitionFee || updated.originalTuitionFee
    const remainingBalance = tuitionFee - totalPaid

    return NextResponse.json({
      ...updated,
      tuitionFee,
      totalPaid,
      remainingBalance,
    })
  } catch (err) {
    console.error("Error cancelling enrollment:", err)
    return NextResponse.json(
      { message: "Failed to cancel enrollment" },
      { status: 500 }
    )
  }
}
