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

    // Only allow approving submitted or review_required enrollments
    if (!["submitted", "review_required"].includes(enrollment.status)) {
      return NextResponse.json(
        { message: "Enrollment cannot be approved in current status" },
        { status: 400 }
      )
    }

    const updated = await prisma.enrollment.update({
      where: { id },
      data: {
        status: "approved",
        approvedAt: new Date(),
        approvedBy: session.user.id,
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

    // Only allow rejecting submitted or review_required enrollments
    if (!["submitted", "review_required"].includes(enrollment.status)) {
      return NextResponse.json(
        { message: "Enrollment cannot be rejected in current status" },
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

    const updated = await prisma.enrollment.update({
      where: { id },
      data: {
        status: "rejected",
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
