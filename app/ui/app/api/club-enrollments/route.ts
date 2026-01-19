import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { generateClubEnrollmentNumber } from "@/lib/club-helpers"

/**
 * POST /api/club-enrollments
 * Create a new club enrollment
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  try {
    const body = await req.json()
    const { clubId, studentId, status = "draft", payment, notes } = body

    if (!clubId || !studentId) {
      return NextResponse.json(
        { message: "Club ID and student ID are required" },
        { status: 400 }
      )
    }

    // Get student profile ID from person ID
    const student = await prisma.person.findUnique({
      where: { id: studentId },
      include: { studentProfile: true },
    })

    if (!student?.studentProfile) {
      return NextResponse.json(
        { message: "Student profile not found" },
        { status: 404 }
      )
    }

    const studentProfileId = student.studentProfile.id

    // Check if student is already enrolled in this club
    const existing = await prisma.clubEnrollment.findUnique({
      where: {
        clubId_studentProfileId: {
          clubId,
          studentProfileId,
        },
      },
      include: {
        club: {
          select: { name: true },
        },
      },
    })

    if (existing) {
      // Provide specific error message based on enrollment status
      if (existing.status === "active") {
        return NextResponse.json(
          {
            message: "Student is already actively enrolled in this club",
            existingEnrollment: {
              id: existing.id,
              enrollmentNumber: existing.enrollmentNumber,
              status: existing.status,
              enrolledAt: existing.enrolledAt,
            },
          },
          { status: 400 }
        )
      } else if (existing.status === "withdrawn" || existing.status === "cancelled") {
        return NextResponse.json(
          {
            message: `Student was previously enrolled in this club (status: ${existing.status}). Please contact an administrator if you need to re-enroll.`,
            existingEnrollment: {
              id: existing.id,
              enrollmentNumber: existing.enrollmentNumber,
              status: existing.status,
              enrolledAt: existing.enrolledAt,
            },
          },
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          {
            message: "Student has an existing enrollment record for this club",
            existingEnrollment: {
              id: existing.id,
              enrollmentNumber: existing.enrollmentNumber,
              status: existing.status,
              enrolledAt: existing.enrolledAt,
            },
          },
          { status: 400 }
        )
      }
    }

    // Get club details for fee calculation
    const club = await prisma.club.findUnique({
      where: { id: clubId },
    })

    if (!club) {
      return NextResponse.json(
        { message: "Club not found" },
        { status: 404 }
      )
    }

    // Check capacity
    if (club.capacity !== null) {
      const enrollmentCount = await prisma.clubEnrollment.count({
        where: { clubId, status: "active" },
      })

      if (enrollmentCount >= club.capacity) {
        return NextResponse.json(
          { message: "Club is at full capacity" },
          { status: 400 }
        )
      }
    }

    // Generate enrollment number
    const enrollmentNumber = await generateClubEnrollmentNumber()

    // Create enrollment
    const enrollment = await prisma.clubEnrollment.create({
      data: {
        clubId,
        studentProfileId,
        status,
        enrolledBy: session.user.id,
        totalFee: club.fee || 0,
        enrollmentNumber,
      },
      include: {
        club: {
          select: { id: true, name: true },
        },
        studentProfile: {
          include: {
            person: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    })

    // Only create payment if enrollment is active (not draft)
    // Drafts should not have payments until submitted
    if (status === "active" && payment && payment.amount > 0) {
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
      id: enrollment.id,
      enrollmentNumber: enrollment.enrollmentNumber,
      status: enrollment.status,
      club: enrollment.club,
      student: {
        id: enrollment.studentProfile.id,
        name: `${enrollment.studentProfile.person.firstName} ${enrollment.studentProfile.person.lastName}`,
      },
    })
  } catch (err) {
    console.error("Error creating club enrollment:", err)
    return NextResponse.json(
      { message: "Failed to create enrollment" },
      { status: 500 }
    )
  }
}
