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

    // Generate enrollment number
    const enrollmentNumber = await generateClubEnrollmentNumber()

    // Use transaction to ensure capacity check and enrollment creation are atomic
    const result = await prisma.$transaction(async (tx) => {
      // Check capacity within transaction
      if (club.capacity !== null) {
        const enrollmentCount = await tx.clubEnrollment.count({
          where: { clubId, status: "active" },
        })

        if (enrollmentCount >= club.capacity) {
          throw new Error("Club is at full capacity")
        }
      }

      // Create enrollment
      const enrollment = await tx.clubEnrollment.create({
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
        // Validate payment method is provided
        if (!payment.method || (payment.method !== "cash" && payment.method !== "orange_money")) {
          throw new Error("Valid payment method is required when recording a payment")
        }

        await tx.payment.create({
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

      return enrollment
    })

    const enrollment = result

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

    // Handle specific error messages from transaction
    const errorMessage = err instanceof Error ? err.message : "Failed to create enrollment"
    const statusCode = errorMessage === "Club is at full capacity" ||
                       errorMessage === "Valid payment method is required when recording a payment"
                       ? 400
                       : 500

    return NextResponse.json(
      { message: errorMessage },
      { status: statusCode }
    )
  }
}
