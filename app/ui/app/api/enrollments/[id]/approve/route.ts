import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/enrollments/[id]/approve
 * Approve an enrollment (director only)
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireRole(["director"])
  if (error) return error

  const { id } = await params

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
    })

    if (!enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 404 }
      )
    }

    // Only allow approving submitted or needs_review enrollments
    if (!["submitted", "needs_review"].includes(enrollment.status)) {
      return NextResponse.json(
        { message: "Enrollment cannot be approved in current status" },
        { status: 400 }
      )
    }

    // Get the comment from the request body (required for completion)
    const body = await req.json().catch(() => ({}))
    const comment = body.comment

    if (!comment || typeof comment !== "string" || comment.trim() === "") {
      return NextResponse.json(
        { message: "A comment is required when completing an enrollment" },
        { status: 400 }
      )
    }

    const now = new Date()
    const updated = await prisma.enrollment.update({
      where: { id },
      data: {
        status: "completed",
        approvedAt: now,
        approvedBy: session.user.id,
        statusChangedAt: now,
        statusChangedBy: session.user.id,
        statusComment: comment.trim(),
        autoApproveAt: null, // Clear auto-approval since manually approved
      },
      include: {
        grade: true,
        schoolYear: true,
        student: true,
        paymentSchedules: {
          orderBy: { scheduleNumber: "asc" },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error("Error approving enrollment:", err)
    return NextResponse.json(
      { message: "Failed to approve enrollment" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/enrollments/[id]/reject
 * Reject an enrollment (director only)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireRole(["director"])
  if (error) return error

  const { id } = await params

  try {
    const body = await req.json().catch(() => ({}))
    const reason = body.reason || "No reason provided"

    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
    })

    if (!enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 404 }
      )
    }

    // Only allow rejecting submitted or needs_review enrollments
    if (!["submitted", "needs_review"].includes(enrollment.status)) {
      return NextResponse.json(
        { message: "Enrollment cannot be rejected in current status" },
        { status: 400 }
      )
    }

    // A reason/comment is required for rejection
    if (!reason || reason.trim() === "" || reason === "No reason provided") {
      return NextResponse.json(
        { message: "A reason is required when rejecting an enrollment" },
        { status: 400 }
      )
    }

    // Add a note with the rejection reason
    await prisma.enrollmentNote.create({
      data: {
        enrollmentId: id,
        title: "Enrollment Rejected",
        content: reason,
        createdBy: session.user.id,
      },
    })

    const now = new Date()
    const updated = await prisma.enrollment.update({
      where: { id },
      data: {
        status: "rejected",
        statusChangedAt: now,
        statusChangedBy: session.user.id,
        statusComment: reason.trim(),
        autoApproveAt: null,
      },
      include: {
        grade: true,
        schoolYear: true,
        notes: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error("Error rejecting enrollment:", err)
    return NextResponse.json(
      { message: "Failed to reject enrollment" },
      { status: 500 }
    )
  }
}
