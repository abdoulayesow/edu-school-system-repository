import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/students/[id]/balance
 * Get payment balance for a student
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const schoolYearId = searchParams.get("schoolYearId")

  try {
    // Get student basic info (middleName, gender, phone come from enrollment)
    const student = await prisma.student.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studentNumber: true,
        dateOfBirth: true,
        email: true,
      },
    })

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      )
    }

    // Get enrollment filter
    let enrollmentFilter: Record<string, unknown> = {
      studentId: id,
      status: "completed",
    }

    if (schoolYearId) {
      enrollmentFilter.schoolYearId = schoolYearId
    } else {
      // Get active school year
      const activeYear = await prisma.schoolYear.findFirst({
        where: { isActive: true },
      })
      if (activeYear) {
        enrollmentFilter.schoolYearId = activeYear.id
      }
    }

    // Get enrollment with payments and schedule
    const enrollment = await prisma.enrollment.findFirst({
      where: enrollmentFilter,
      include: {
        grade: {
          select: { id: true, name: true },
        },
        schoolYear: {
          select: { id: true, name: true },
        },
        payments: {
          orderBy: { recordedAt: "desc" },
          include: {
            recorder: { select: { name: true } },
          },
        },
        paymentSchedules: {
          orderBy: { scheduleNumber: "asc" },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json({
        student,
        enrollment: null,
        balance: null,
        message: "No active enrollment found",
      })
    }

    // Calculate balance
    const tuitionFee = enrollment.adjustedTuitionFee || enrollment.originalTuitionFee
    const confirmedPayments = enrollment.payments.filter((p) => p.status === "confirmed")
    const pendingPayments = enrollment.payments.filter((p) =>
      ["pending_deposit", "deposited", "pending_review"].includes(p.status)
    )

    const totalPaid = confirmedPayments.reduce((sum, p) => sum + p.amount, 0)
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
    const remainingBalance = tuitionFee - totalPaid
    const paymentPercentage = Math.round((totalPaid / tuitionFee) * 100)

    // Determine payment status
    const now = new Date()
    const enrollmentStart = new Date(enrollment.createdAt)
    const monthsEnrolled = Math.max(
      1,
      (now.getFullYear() - enrollmentStart.getFullYear()) * 12 +
        (now.getMonth() - enrollmentStart.getMonth()) +
        1
    )
    const expectedPaymentPercentage = Math.min(100, monthsEnrolled * 10)

    let paymentStatus = "on_time"
    if (paymentPercentage >= 100) {
      paymentStatus = "complete"
    } else if (paymentPercentage > expectedPaymentPercentage + 10) {
      paymentStatus = "in_advance"
    } else if (paymentPercentage < expectedPaymentPercentage) {
      paymentStatus = "late"
    }

    // Calculate schedule progress
    const scheduleProgress = enrollment.paymentSchedules.map((schedule) => {
      const paidAmount = enrollment.payments
        .filter((p) => p.paymentScheduleId === schedule.id && p.status === "confirmed")
        .reduce((sum, p) => sum + p.amount, 0)

      return {
        ...schedule,
        paidAmount,
        isPaid: paidAmount >= schedule.amount,
        remainingAmount: Math.max(0, schedule.amount - paidAmount),
      }
    })

    return NextResponse.json({
      // Merge student basic info with enrollment-specific info (middleName, gender, phone, photoUrl)
      student: {
        ...student,
        middleName: enrollment.middleName,
        gender: enrollment.gender,
        phone: enrollment.phone,
        photoUrl: enrollment.photoUrl,
        dateOfBirth: enrollment.dateOfBirth || student.dateOfBirth,
      },
      enrollment: {
        id: enrollment.id,
        enrollmentNumber: enrollment.enrollmentNumber,
        grade: enrollment.grade,
        schoolYear: enrollment.schoolYear,
        // Parent/Guardian information
        fatherName: enrollment.fatherName,
        fatherPhone: enrollment.fatherPhone,
        fatherEmail: enrollment.fatherEmail,
        motherName: enrollment.motherName,
        motherPhone: enrollment.motherPhone,
        motherEmail: enrollment.motherEmail,
        address: enrollment.address,
        // Enrolling person
        enrollingPersonType: enrollment.enrollingPersonType,
        enrollingPersonName: enrollment.enrollingPersonName,
        enrollingPersonRelation: enrollment.enrollingPersonRelation,
        enrollingPersonPhone: enrollment.enrollingPersonPhone,
        enrollingPersonEmail: enrollment.enrollingPersonEmail,
      },
      balance: {
        tuitionFee,
        totalPaid,
        totalPending,
        remainingBalance,
        paymentPercentage,
        paymentStatus,
        expectedPaymentPercentage,
      },
      payments: enrollment.payments,
      scheduleProgress,
    })
  } catch (err) {
    console.error("Error fetching student balance:", err)
    return NextResponse.json(
      { message: "Failed to fetch student balance" },
      { status: 500 }
    )
  }
}
