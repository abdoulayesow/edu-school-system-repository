import { NextRequest, NextResponse } from "next/server"
import { requireSession, requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { z } from "zod"

// Schema for creating an enrollment (draft)
// firstName and lastName are optional for drafts - only required when submitting for approval
const createEnrollmentSchema = z.object({
  schoolYearId: z.string().min(1),
  gradeId: z.string().min(1),
  // Student info - optional for drafts (allow empty strings)
  firstName: z.string().optional(),
  middleName: z.string().optional(),
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
  // Enrolling person info
  enrollingPersonType: z.enum(["father", "mother", "other"]).optional(),
  enrollingPersonName: z.string().optional(),
  enrollingPersonRelation: z.string().optional(),
  enrollingPersonPhone: z.string().optional(),
  enrollingPersonEmail: z.string().email().optional().or(z.literal("")),
  // Returning student
  studentId: z.string().optional(),
  isReturningStudent: z.boolean().default(false),
  // Wizard progress (for auto-save)
  currentStep: z.number().min(1).max(6).optional(),
})

/**
 * GET /api/enrollments
 * List enrollments with optional filters
 * Query params: status, schoolYearId, gradeId, search
 */
export async function GET(req: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  const searchParams = req.nextUrl.searchParams
  const status = searchParams.get("status")
  const schoolYearId = searchParams.get("schoolYearId")
  const gradeId = searchParams.get("gradeId")
  const search = searchParams.get("search")
  const draftsOnly = searchParams.get("drafts") === "true"
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  // Pagination params
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    // Build where clause
    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (schoolYearId) {
      where.schoolYearId = schoolYearId
    }

    if (gradeId) {
      where.gradeId = gradeId
    }

    // For drafts, only show user's own drafts
    if (draftsOnly) {
      where.status = "draft"
      where.createdBy = session.user.id
      where.OR = [
        { draftExpiresAt: null },
        { draftExpiresAt: { gt: new Date() } },
      ]
    }

    // Search by name or enrollment number
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { enrollmentNumber: { contains: search, mode: "insensitive" } },
      ]
    }

    // Date filtering (by createdAt)
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate)
      }
      if (endDate) {
        // Add one day to include the entire end date
        const end = new Date(endDate)
        end.setDate(end.getDate() + 1)
        ;(where.createdAt as Record<string, Date>).lt = end
      }
    }

    // Run data query, count query, and stats counts in parallel
    const [enrollments, total, draftCount, submittedCount, needsReviewCount, completedCount] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          grade: {
            select: { name: true, level: true, tuitionFee: true },
          },
          schoolYear: {
            select: { name: true },
          },
          _count: {
            select: { payments: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.enrollment.count({ where }),
      // Stats counts - use base where without status filter for accurate totals
      prisma.enrollment.count({ where: { ...where, status: "draft" } }),
      prisma.enrollment.count({ where: { ...where, status: "submitted" } }),
      prisma.enrollment.count({ where: { ...where, status: "needs_review" } }),
      prisma.enrollment.count({ where: { ...where, status: "completed" } }),
    ])

    // Batch query all payment totals at once (avoids N+1 queries)
    const enrollmentIds = enrollments.map((e) => e.id)
    const paymentTotals = await prisma.payment.groupBy({
      by: ["enrollmentId"],
      where: {
        enrollmentId: { in: enrollmentIds },
        status: "confirmed",
      },
      _sum: { amount: true },
    })

    // Build lookup map for O(1) access
    const totalsMap = new Map(
      paymentTotals.map((p) => [p.enrollmentId, p._sum.amount || 0])
    )

    // Map enrollments with payment totals
    const enrollmentsWithPayments = enrollments.map((enrollment) => ({
      ...enrollment,
      totalPaid: totalsMap.get(enrollment.id) || 0,
      tuitionFee: enrollment.adjustedTuitionFee || enrollment.originalTuitionFee,
    }))

    return NextResponse.json({
      enrollments: enrollmentsWithPayments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + enrollments.length < total,
      },
      stats: {
        total,
        draft: draftCount,
        submitted: submittedCount,
        needsReview: needsReviewCount,
        completed: completedCount,
      },
    })
  } catch (err) {
    console.error("Error fetching enrollments:", err)
    return NextResponse.json(
      { message: "Failed to fetch enrollments" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/enrollments
 * Create a new enrollment (starts as draft)
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  try {
    const body = await req.json()
    const validated = createEnrollmentSchema.parse(body)

    // Get the grade to determine the tuition fee
    const grade = await prisma.grade.findUnique({
      where: { id: validated.gradeId },
    })

    if (!grade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    // Generate enrollment number with grade order (numeric grade level)
    const enrollmentNumber = await generateEnrollmentNumber(grade.order)

    // Set draft expiration (10 days from now)
    const draftExpiresAt = new Date()
    draftExpiresAt.setDate(draftExpiresAt.getDate() + 10)

    // If returning student, verify student exists
    if (validated.isReturningStudent && validated.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: validated.studentId },
      })
      if (!student) {
        return NextResponse.json(
          { message: "Student not found" },
          { status: 404 }
        )
      }
    }

    // Build data object, only including fields that have values (not undefined)
    // Note: firstName and lastName are required in schema, so use empty strings for drafts
    const enrollmentData: Prisma.EnrollmentUncheckedCreateInput = {
      enrollmentNumber,
      schoolYearId: validated.schoolYearId,
      gradeId: validated.gradeId,
      // Use empty strings for drafts (firstName/lastName are required in schema)
      firstName: validated.firstName && validated.firstName.trim() ? validated.firstName : "",
      middleName: validated.middleName?.trim() || null,
      lastName: validated.lastName && validated.lastName.trim() ? validated.lastName : "",
      dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
      email: validated.email || null,
      fatherEmail: validated.fatherEmail || null,
      motherEmail: validated.motherEmail || null,
      isReturningStudent: validated.isReturningStudent,
      originalTuitionFee: grade.tuitionFee,
      status: "draft",
      currentStep: validated.currentStep || 1,
      draftExpiresAt,
      createdBy: session.user.id,
      // Optional fields
      studentId: validated.studentId,
      gender: validated.gender,
      phone: validated.phone,
      photoUrl: validated.photoUrl,
      birthCertificateUrl: validated.birthCertificateUrl,
      fatherName: validated.fatherName,
      fatherPhone: validated.fatherPhone,
      motherName: validated.motherName,
      motherPhone: validated.motherPhone,
      address: validated.address,
      // Enrolling person info
      enrollingPersonType: validated.enrollingPersonType,
      enrollingPersonName: validated.enrollingPersonName,
      enrollingPersonRelation: validated.enrollingPersonRelation,
      enrollingPersonPhone: validated.enrollingPersonPhone,
      enrollingPersonEmail: validated.enrollingPersonEmail || null,
    }

    const enrollment = await prisma.enrollment.create({
      data: enrollmentData,
      include: {
        grade: true,
        schoolYear: true,
      },
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating enrollment:", err)
    return NextResponse.json(
      { message: "Failed to create enrollment" },
      { status: 500 }
    )
  }
}

/**
 * Generate unique enrollment number: ENR-YYYY-GG-XXXXX
 * where GG is the grade level (e.g., 06 for 6ème)
 */
async function generateEnrollmentNumber(gradeLevel: number): Promise<string> {
  const year = new Date().getFullYear()
  const gradeCode = gradeLevel.toString().padStart(2, "0")
  const prefix = `ENR-${year}-${gradeCode}-`

  // Get the last enrollment number for this year and grade
  const lastEnrollment = await prisma.enrollment.findFirst({
    where: {
      enrollmentNumber: { startsWith: prefix },
    },
    orderBy: { enrollmentNumber: "desc" },
  })

  let nextNumber = 1
  if (lastEnrollment?.enrollmentNumber) {
    // Extract the last segment after the final dash
    const parts = lastEnrollment.enrollmentNumber.split("-")
    const lastNumber = parseInt(parts[parts.length - 1], 10)
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1
    }
  }

  return `${prefix}${nextNumber.toString().padStart(5, "0")}`
}
