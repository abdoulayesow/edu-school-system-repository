import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { calculatePaymentSchedules } from "@/lib/enrollment/calculations"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/enrollments/[id]/submit
 * Submit an enrollment for approval
 * Creates payment schedules and sets auto-approval date
 * Optionally creates payment record if payment was made during enrollment
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession()
  if (error) return error

  const { id } = await params

  // Parse request body for payment data (optional)
  let paymentData: {
    paymentMade: boolean
    paymentAmount?: number
    paymentMethod?: "cash" | "orange_money"
    receiptNumber?: string
    transactionRef?: string
    receiptImageUrl?: string
  } | null = null

  try {
    const body = await req.json().catch(() => ({}))
    if (body.paymentMade && body.paymentAmount && body.paymentMethod && body.receiptNumber) {
      paymentData = {
        paymentMade: body.paymentMade,
        paymentAmount: body.paymentAmount,
        paymentMethod: body.paymentMethod,
        receiptNumber: body.receiptNumber,
        transactionRef: body.transactionRef,
        receiptImageUrl: body.receiptImageUrl,
      }
    }
  } catch {
    // No payment data in request, continue
  }

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        grade: true,
        schoolYear: true,
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 404 }
      )
    }

    // Only allow submitting drafts
    if (enrollment.status !== "draft") {
      return NextResponse.json(
        { message: "Enrollment has already been submitted" },
        { status: 400 }
      )
    }

    // Only the creator can submit
    if (enrollment.createdBy !== session.user.id) {
      return NextResponse.json(
        { message: "Cannot submit this enrollment" },
        { status: 403 }
      )
    }

    // Validate required fields
    const errors: string[] = []
    if (!enrollment.firstName) errors.push("First name is required")
    if (!enrollment.lastName) errors.push("Last name is required")
    if (!enrollment.fatherName && !enrollment.motherName) {
      errors.push("At least one parent name is required")
    }
    if (!enrollment.phone && !enrollment.fatherPhone && !enrollment.motherPhone) {
      errors.push("At least one phone number is required")
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { message: "Validation failed", errors },
        { status: 400 }
      )
    }

    // Determine status based on whether fee was adjusted
    const requiresReview = enrollment.adjustedTuitionFee !== null &&
      enrollment.adjustedTuitionFee !== enrollment.originalTuitionFee

    const newStatus = requiresReview ? "needs_review" : "submitted"

    // Calculate auto-approval date (3 days from now) if not requiring review
    const autoApproveAt = requiresReview
      ? null
      : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

    // Calculate payment schedules
    const tuitionFee = enrollment.adjustedTuitionFee || enrollment.originalTuitionFee
    const schedules = calculatePaymentSchedules(
      tuitionFee,
      enrollment.schoolYear.startDate
    )

    // Generate student number if this is a new student
    let studentNumber: string | undefined
    if (!enrollment.studentId) {
      studentNumber = await generateStudentNumber(enrollment.dateOfBirth)
    }

    // Use transaction to update enrollment and create schedules
    const updated = await prisma.$transaction(async (tx) => {
      // Create or update student record if new student
      let studentId = enrollment.studentId
      if (!studentId) {
        const student = await tx.student.create({
          data: {
            studentNumber,
            firstName: enrollment.firstName,
            lastName: enrollment.lastName,
            email: enrollment.email,
            dateOfBirth: enrollment.dateOfBirth,
            guardianName: enrollment.fatherName || enrollment.motherName,
            guardianPhone: enrollment.fatherPhone || enrollment.motherPhone,
            guardianEmail: enrollment.fatherEmail || enrollment.motherEmail,
            status: "active",
          },
        })
        studentId = student.id
      }

      // Update enrollment
      const updatedEnrollment = await tx.enrollment.update({
        where: { id },
        data: {
          status: newStatus,
          studentId,
          submittedAt: new Date(),
          autoApproveAt,
          draftExpiresAt: null, // Clear draft expiration
        },
        include: {
          grade: true,
          schoolYear: true,
          student: true,
        },
      })

      // Create payment schedules
      const createdSchedules = []
      for (const schedule of schedules) {
        const created = await tx.paymentSchedule.create({
          data: {
            enrollmentId: id,
            scheduleNumber: schedule.scheduleNumber,
            amount: schedule.amount,
            months: schedule.months,
            dueDate: schedule.dueDate,
          },
        })
        createdSchedules.push(created)
      }

      // Create payment record if payment was made during enrollment
      if (paymentData && paymentData.paymentMade && paymentData.paymentAmount && paymentData.paymentMethod && paymentData.receiptNumber) {
        // Determine initial status based on payment method
        const initialStatus = paymentData.paymentMethod === "cash" ? "pending_deposit" : "pending_review"
        const autoConfirmAt = paymentData.paymentMethod === "orange_money"
          ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
          : null

        // Link to first payment schedule
        const firstScheduleId = createdSchedules[0]?.id

        await tx.payment.create({
          data: {
            enrollmentId: id,
            paymentScheduleId: firstScheduleId,
            amount: paymentData.paymentAmount,
            method: paymentData.paymentMethod,
            receiptNumber: paymentData.receiptNumber,
            transactionRef: paymentData.transactionRef,
            receiptImageUrl: paymentData.receiptImageUrl,
            recordedBy: session.user.id,
            status: initialStatus,
            autoConfirmAt,
          },
        })
      }

      return updatedEnrollment
    })

    // Get the complete enrollment with payment schedules
    const complete = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        grade: true,
        schoolYear: true,
        student: true,
        paymentSchedules: {
          orderBy: { scheduleNumber: "asc" },
        },
      },
    })

    return NextResponse.json({
      ...complete,
      studentNumber: complete?.student?.studentNumber,
    })
  } catch (err) {
    console.error("Error submitting enrollment:", err)
    return NextResponse.json(
      { message: "Failed to submit enrollment" },
      { status: 500 }
    )
  }
}

/**
 * Generate unique student number: STD-YYYY-DDMMYYYY-XXXX
 * where YYYY is current year, DDMMYYYY is student's birthday, XXXX is sequence
 */
async function generateStudentNumber(dateOfBirth: Date | null): Promise<string> {
  const year = new Date().getFullYear()

  // Format birthday as DDMMYYYY, use default if not provided
  let birthdayStr = "00000000"
  if (dateOfBirth) {
    const day = dateOfBirth.getDate().toString().padStart(2, "0")
    const month = (dateOfBirth.getMonth() + 1).toString().padStart(2, "0")
    const birthYear = dateOfBirth.getFullYear().toString()
    birthdayStr = `${day}${month}${birthYear}`
  }

  const prefix = `STD-${year}-${birthdayStr}-`

  // Get the last student number for this year
  const yearPrefix = `STD-${year}-`
  const lastStudent = await prisma.student.findFirst({
    where: {
      studentNumber: { startsWith: yearPrefix },
    },
    orderBy: { studentNumber: "desc" },
  })

  let nextNumber = 1
  if (lastStudent?.studentNumber) {
    // Extract the last segment after the final dash
    const parts = lastStudent.studentNumber.split("-")
    const lastNumber = parseInt(parts[parts.length - 1], 10)
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1
    }
  }

  return `${prefix}${nextNumber.toString().padStart(4, "0")}`
}
