import { NextRequest, NextResponse } from "next/server"
import { requireSession, requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for updating an enrollment (draft)
// firstName and lastName are optional - only required when submitting for approval
const updateEnrollmentSchema = z.object({
  // Student info - optional for drafts (allow empty strings)
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  photoUrl: z.string().optional(),
  birthCertificateUrl: z.string().optional(),
  // Parent info
  fatherName: z.string().optional(),
  fatherPhone: z.string().optional(),
  fatherEmail: z.string().email().optional().or(z.literal("")),
  motherName: z.string().optional(),
  motherPhone: z.string().optional(),
  motherEmail: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  // Financial
  adjustedTuitionFee: z.number().positive().optional(),
  adjustmentReason: z.string().optional(),
  // Wizard progress
  currentStep: z.number().min(1).max(6).optional(),
  // Grade change
  gradeId: z.string().optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/enrollments/[id]
 * Get a single enrollment with all related data
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        grade: true,
        schoolYear: true,
        student: true,
        paymentSchedules: {
          orderBy: { scheduleNumber: "asc" },
        },
        payments: {
          include: {
            recorder: { select: { name: true, email: true } },
          },
          orderBy: { recordedAt: "desc" },
        },
        notes: {
          include: {
            author: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        creator: { select: { name: true, email: true } },
        approver: { select: { name: true, email: true } },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 404 }
      )
    }

    // Calculate payment summary
    const totalPaid = enrollment.payments
      .filter((p) => p.status === "confirmed")
      .reduce((sum, p) => sum + p.amount, 0)

    const tuitionFee = enrollment.adjustedTuitionFee || enrollment.originalTuitionFee
    const remainingBalance = tuitionFee - totalPaid

    return NextResponse.json({
      ...enrollment,
      tuitionFee,
      totalPaid,
      remainingBalance,
    })
  } catch (err) {
    console.error("Error fetching enrollment:", err)
    return NextResponse.json(
      { message: "Failed to fetch enrollment" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/enrollments/[id]
 * Update an enrollment (auto-save during wizard)
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession()
  if (error) return error

  const { id } = await params

  try {
    // First check if enrollment exists and user can edit it
    const existing = await prisma.enrollment.findUnique({
      where: { id },
      include: { grade: true },
    })

    if (!existing) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 404 }
      )
    }

    // Only allow editing non-approved enrollments
    // Directors can edit any enrollment
    // Creators can edit their own enrollments that haven't been approved/rejected/cancelled
    const isDirector = session.user.role === "director"
    const isCreator = existing.createdBy === session.user.id
    const isDraft = existing.status === "draft"
    const isEditable = ["draft", "submitted", "needs_review"].includes(existing.status)

    if (!isDirector && (!isEditable || !isCreator)) {
      return NextResponse.json(
        { message: "Cannot edit this enrollment" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validated = updateEnrollmentSchema.parse(body)

    // Prepare update data
    const updateData: Record<string, unknown> = {}

    // Copy validated fields - firstName/lastName are required in schema, use empty strings for drafts
    if (validated.firstName !== undefined) {
      updateData.firstName = validated.firstName && validated.firstName.trim() ? validated.firstName : ""
    }
    if (validated.lastName !== undefined) {
      updateData.lastName = validated.lastName && validated.lastName.trim() ? validated.lastName : ""
    }
    if (validated.dateOfBirth !== undefined) {
      updateData.dateOfBirth = validated.dateOfBirth ? new Date(validated.dateOfBirth) : null
    }
    if (validated.gender !== undefined) updateData.gender = validated.gender
    if (validated.phone !== undefined) updateData.phone = validated.phone
    if (validated.email !== undefined) updateData.email = validated.email || null
    if (validated.photoUrl !== undefined) updateData.photoUrl = validated.photoUrl
    if (validated.birthCertificateUrl !== undefined) updateData.birthCertificateUrl = validated.birthCertificateUrl
    if (validated.fatherName !== undefined) updateData.fatherName = validated.fatherName
    if (validated.fatherPhone !== undefined) updateData.fatherPhone = validated.fatherPhone
    if (validated.fatherEmail !== undefined) updateData.fatherEmail = validated.fatherEmail || null
    if (validated.motherName !== undefined) updateData.motherName = validated.motherName
    if (validated.motherPhone !== undefined) updateData.motherPhone = validated.motherPhone
    if (validated.motherEmail !== undefined) updateData.motherEmail = validated.motherEmail || null
    if (validated.address !== undefined) updateData.address = validated.address
    if (validated.currentStep !== undefined) updateData.currentStep = validated.currentStep

    // Handle grade change
    if (validated.gradeId && validated.gradeId !== existing.gradeId) {
      const newGrade = await prisma.grade.findUnique({
        where: { id: validated.gradeId },
      })
      if (!newGrade) {
        return NextResponse.json(
          { message: "Grade not found" },
          { status: 404 }
        )
      }
      updateData.gradeId = validated.gradeId
      updateData.originalTuitionFee = newGrade.tuitionFee
      // Reset adjusted fee if grade changes
      updateData.adjustedTuitionFee = null
      updateData.adjustmentReason = null
    }

    // Handle fee adjustment (requires director review)
    if (validated.adjustedTuitionFee !== undefined) {
      updateData.adjustedTuitionFee = validated.adjustedTuitionFee
      updateData.adjustmentReason = validated.adjustmentReason || null
    }

    // Extend draft expiration on each save
    if (isDraft) {
      const newExpiry = new Date()
      newExpiry.setDate(newExpiry.getDate() + 10)
      updateData.draftExpiresAt = newExpiry
    }

    const updated = await prisma.enrollment.update({
      where: { id },
      data: updateData,
      include: {
        grade: true,
        schoolYear: true,
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating enrollment:", err)
    return NextResponse.json(
      { message: "Failed to update enrollment" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/enrollments/[id]
 * Delete a draft enrollment
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession()
  if (error) return error

  const { id } = await params

  try {
    const existing = await prisma.enrollment.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 404 }
      )
    }

    // Only allow deleting drafts or cancelled enrollments by the creator or directors
    const isDirector = session.user.role === "director"
    const isCreator = existing.createdBy === session.user.id
    const isDeletable = existing.status === "draft" || existing.status === "cancelled"

    if (!isDeletable) {
      return NextResponse.json(
        { message: "Can only delete draft or cancelled enrollments" },
        { status: 400 }
      )
    }

    if (!isDirector && !isCreator) {
      return NextResponse.json(
        { message: "Cannot delete this enrollment" },
        { status: 403 }
      )
    }

    await prisma.enrollment.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Enrollment deleted" })
  } catch (err) {
    console.error("Error deleting enrollment:", err)
    return NextResponse.json(
      { message: "Failed to delete enrollment" },
      { status: 500 }
    )
  }
}
