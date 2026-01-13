import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ id: string; enrollmentId: string }> }

/**
 * DELETE /api/admin/activities/[id]/enrollments/[enrollmentId]
 * Remove a student from an activity
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("schedule", "delete")
  if (error) return error

  try {
    const { id, enrollmentId } = await params

    // Verify enrollment exists and belongs to this activity
    const enrollment = await prisma.activityEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        payments: true,
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 404 }
      )
    }

    if (enrollment.activityId !== id) {
      return NextResponse.json(
        { message: "Enrollment does not belong to this activity" },
        { status: 400 }
      )
    }

    // Check if there are any confirmed payments
    const hasConfirmedPayments = enrollment.payments.some(
      (p) => p.status === "confirmed"
    )

    if (hasConfirmedPayments) {
      // Instead of deleting, mark as withdrawn
      await prisma.activityEnrollment.update({
        where: { id: enrollmentId },
        data: { status: "withdrawn" },
      })
      return NextResponse.json({ message: "Enrollment marked as withdrawn (has payments)" })
    }

    // Delete enrollment and any pending payments
    await prisma.activityEnrollment.delete({
      where: { id: enrollmentId },
    })

    return NextResponse.json({ message: "Enrollment removed" })
  } catch (err) {
    console.error("Error removing enrollment:", err)
    return NextResponse.json(
      { message: "Failed to remove enrollment" },
      { status: 500 }
    )
  }
}
