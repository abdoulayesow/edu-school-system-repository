import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { generateClubEnrollmentNumber } from "@/lib/club-helpers"

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

    // Generate enrollment number if it doesn't exist (for drafts)
    const enrollmentNumber = enrollment.enrollmentNumber || await generateClubEnrollmentNumber()

    // Update enrollment status to active
    const updated = await prisma.clubEnrollment.update({
      where: { id },
      data: {
        status: "active",
        enrollmentNumber,
        syncVersion: { increment: 1 },
      },
    })

    // Create payment if provided
    if (payment && payment.amount > 0) {
      // Validate payment method is provided
      if (!payment.method || (payment.method !== "cash" && payment.method !== "orange_money")) {
        return NextResponse.json(
          { message: "Valid payment method is required when recording a payment" },
          { status: 400 }
        )
      }

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
      enrollmentNumber: updated.enrollmentNumber,
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
