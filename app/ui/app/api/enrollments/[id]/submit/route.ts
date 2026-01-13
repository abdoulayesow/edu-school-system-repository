import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
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
  const { session, error } = await requirePerm("student_enrollment", "update")
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

  // Parse body - FIX: Remove silent error handling that was swallowing payment data
  const body = await req.json().catch(() => ({}))
  if (body.paymentMade && body.paymentAmount && body.paymentMethod && body.receiptNumber) {
    paymentData = {
      paymentMade: true,
      paymentAmount: body.paymentAmount,
      paymentMethod: body.paymentMethod,
      receiptNumber: body.receiptNumber,
      transactionRef: body.transactionRef,
      receiptImageUrl: body.receiptImageUrl,
    }
    console.log("[Submit] Payment data extracted:", paymentData)
  } else if (body.paymentMade) {
    // User indicated payment but missing required fields - log for debugging
    console.warn("[Submit] Payment indicated but missing required fields:", {
      paymentMade: body.paymentMade,
      hasAmount: !!body.paymentAmount,
      hasMethod: !!body.paymentMethod,
      hasReceipt: !!body.receiptNumber
    })
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
    if (enrollment.createdBy !== session!.user.id) {
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

    // Determine status based on fee adjustment and payment amount
    const feeWasAdjusted = enrollment.adjustedTuitionFee !== null &&
      enrollment.adjustedTuitionFee !== enrollment.originalTuitionFee

    // Calculate minimum payment threshold (~11% of total tuition)
    const tuitionFee = enrollment.adjustedTuitionFee || enrollment.originalTuitionFee
    const minimumPaymentThreshold = Math.ceil(tuitionFee / 9)

    // Check if payment meets minimum threshold for auto-complete
    const paymentMeetsThreshold = paymentData &&
      paymentData.paymentAmount &&
      paymentData.paymentAmount >= minimumPaymentThreshold

    // Determine status:
    // - If fee was adjusted -> needs_review (requires director approval)
    // - If payment meets threshold (~11%) AND no fee adjustment -> completed (auto-complete)
    // - Otherwise -> submitted (pending)
    let newStatus: "submitted" | "needs_review" | "completed"
    if (feeWasAdjusted) {
      newStatus = "needs_review"
    } else if (paymentMeetsThreshold) {
      newStatus = "completed"  // Auto-complete when paid enough and no fee adjustment
    } else {
      newStatus = "submitted"
    }

    console.log("[Submit] Status determination:", {
      feeWasAdjusted,
      tuitionFee,
      minimumPaymentThreshold,
      paymentAmount: paymentData?.paymentAmount,
      paymentMeetsThreshold,
      newStatus
    })

    // Calculate auto-approval date (3 days from now) only if status is submitted
    const autoApproveAt = newStatus === "submitted"
      ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      : null

    // Calculate payment schedules
    const schedules = calculatePaymentSchedules(
      tuitionFee,
      enrollment.schoolYear.startDate
    )

    // Use transaction to update enrollment and create schedules
    const updated = await prisma.$transaction(async (tx) => {
      // Create or update student record if new student
      let studentId = enrollment.studentId
      if (!studentId) {
        // Generate student number INSIDE transaction with retry logic
        let studentNumber: string | undefined
        let retryCount = 0
        const maxRetries = 5

        while (retryCount < maxRetries) {
          // Pass offset for retries to increment beyond existing numbers
          studentNumber = await generateStudentNumber(enrollment.dateOfBirth, tx, retryCount)

          // Check if number already exists
          const existing = await tx.student.findUnique({
            where: { studentNumber }
          })

          if (!existing) break
          retryCount++
        }

        if (retryCount >= maxRetries) {
          throw new Error("Failed to generate unique student number after multiple attempts")
        }

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
          // Set approvedAt if auto-completing
          ...(newStatus === "completed" ? {
            approvedAt: new Date(),
            approvedBy: session!.user.id,
          } : {}),
          // Save enrolling person info if provided in body
          ...(body.enrollingPersonType ? {
            enrollingPersonType: body.enrollingPersonType,
            enrollingPersonName: body.enrollingPersonName,
            enrollingPersonRelation: body.enrollingPersonRelation,
            enrollingPersonPhone: body.enrollingPersonPhone,
            enrollingPersonEmail: body.enrollingPersonEmail,
          } : {}),
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
        // Payments are confirmed immediately - money is received
        const initialStatus = "confirmed"

        // Link to first payment schedule
        const firstScheduleId = createdSchedules[0]?.id

        // Get current treasury balance for tracking
        const currentBalance = await tx.treasuryBalance.findFirst()
        if (!currentBalance) {
          throw new Error("TreasuryBalance not initialized. Please contact administrator.")
        }

        // Update balances based on payment method
        if (paymentData.paymentMethod === "cash") {
          const newRegistryBalance = currentBalance.registryBalance + paymentData.paymentAmount

          // Create safe transaction for audit trail
          await tx.safeTransaction.create({
            data: {
              type: "student_payment",
              direction: "in",
              amount: paymentData.paymentAmount,
              registryBalanceAfter: newRegistryBalance,
              safeBalanceAfter: currentBalance.safeBalance,
              bankBalanceAfter: currentBalance.bankBalance,
              mobileMoneyBalanceAfter: currentBalance.mobileMoneyBalance,
              description: `Paiement scolarité - ${paymentData.receiptNumber}`,
              receiptNumber: paymentData.receiptNumber,
              referenceType: "payment",
              studentId: studentId,
              recordedBy: session!.user.id,
            },
          })

          // Update registry balance
          await tx.treasuryBalance.update({
            where: { id: currentBalance.id },
            data: {
              registryBalance: newRegistryBalance,
              updatedAt: new Date(),
            },
          })
        } else if (paymentData.paymentMethod === "orange_money") {
          const newMobileMoneyBalance = currentBalance.mobileMoneyBalance + paymentData.paymentAmount

          // Create safe transaction for audit trail
          await tx.safeTransaction.create({
            data: {
              type: "mobile_money_income",
              direction: "in",
              amount: paymentData.paymentAmount,
              registryBalanceAfter: currentBalance.registryBalance,
              safeBalanceAfter: currentBalance.safeBalance,
              bankBalanceAfter: currentBalance.bankBalance,
              mobileMoneyBalanceAfter: newMobileMoneyBalance,
              description: `Paiement Orange Money - ${paymentData.receiptNumber}`,
              receiptNumber: paymentData.receiptNumber,
              referenceType: "payment",
              studentId: studentId,
              recordedBy: session!.user.id,
            },
          })

          // Update mobile money balance
          await tx.treasuryBalance.update({
            where: { id: currentBalance.id },
            data: {
              mobileMoneyBalance: newMobileMoneyBalance,
              updatedAt: new Date(),
            },
          })
        }

        const payment = await tx.payment.create({
          data: {
            enrollmentId: id,
            paymentScheduleId: firstScheduleId,
            amount: paymentData.paymentAmount,
            method: paymentData.paymentMethod,
            receiptNumber: paymentData.receiptNumber,
            transactionRef: paymentData.transactionRef,
            receiptImageUrl: paymentData.receiptImageUrl,
            recordedBy: session!.user.id,
            status: initialStatus,
            confirmedBy: session!.user.id,
            confirmedAt: new Date(),
          },
        })
        console.log("[Submit] Payment created successfully:", payment.id, payment.receiptNumber)

        // Mark first schedule as paid if amount covers it
        if (firstScheduleId && createdSchedules[0] && paymentData.paymentAmount >= createdSchedules[0].amount) {
          await tx.paymentSchedule.update({
            where: { id: firstScheduleId },
            data: { isPaid: true },
          })
        }
      }

      return updatedEnrollment
    })

    // Get the complete enrollment with payment schedules and payments
    const complete = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        grade: true,
        schoolYear: true,
        student: true,
        paymentSchedules: {
          orderBy: { scheduleNumber: "asc" },
        },
        payments: {
          orderBy: { recordedAt: "desc" },
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
 * @param dateOfBirth - Student's date of birth for the birthday component
 * @param tx - Optional transaction client to use for database queries (for atomicity)
 * @param offset - Additional offset to add to sequence number (for retry logic)
 */
async function generateStudentNumber(
  dateOfBirth: Date | null,
  tx?: { student: { findFirst: typeof prisma.student.findFirst } },
  offset: number = 0
): Promise<string> {
  const db = tx || prisma
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
  const lastStudent = await db.student.findFirst({
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

  // Add offset for retry attempts (in case of collisions)
  return `${prefix}${(nextNumber + offset).toString().padStart(4, "0")}`
}
