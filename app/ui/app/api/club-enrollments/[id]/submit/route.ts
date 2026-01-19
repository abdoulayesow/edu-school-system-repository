import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ id: string }> }

/**
 * POST /api/club-enrollments/[id]/submit
 * Submit a club enrollment (finalize it)
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession()
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json()
    const { payment, notes } = body

    const enrollment = await prisma.clubEnrollment.findUnique({
      where: { id },
      include: {
        club: true,
        studentProfile: {
          include: {
            person: {
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

    if (!enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 404 }
      )
    }

    // Update enrollment status to active
    const updated = await prisma.clubEnrollment.update({
      where: { id },
      data: {
        status: "active",
        syncVersion: { increment: 1 },
      },
    })

    // Create payment if provided
    if (payment && payment.amount > 0) {
      await prisma.payment.create({
        data: {
          amount: payment.amount,
          method: payment.method,
          receiptNumber: payment.receiptNumber,
          transactionRef: payment.transactionRef,
          notes: notes || null,
          recordedBy: session.user.id,
          clubEnrollmentId: enrollment.id,
          paymentType: "club",
        },
      })
    }

    return NextResponse.json({
      id: updated.id,
      enrollmentNumber: updated.id,
      status: updated.status,
      club: enrollment.club,
      student: {
        id: enrollment.studentProfile.id,
        name: `${enrollment.studentProfile.person.firstName} ${enrollment.studentProfile.person.lastName}`,
      },
    })
  } catch (err) {
    console.error("Error submitting enrollment:", err)
    return NextResponse.json(
      { message: "Failed to submit enrollment" },
      { status: 500 }
    )
  }
}
