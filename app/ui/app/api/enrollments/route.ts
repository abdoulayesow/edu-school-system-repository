import { NextRequest, NextResponse } from "next/server"
import { requireSession, requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for creating an enrollment
const createEnrollmentSchema = z.object({
  schoolYearId: z.string().min(1),
  gradeId: z.string().min(1),
  // Student info
  firstName: z.string().min(1),
  lastName: z.string().min(1),
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
  // Returning student
  studentId: z.string().optional(),
  isReturningStudent: z.boolean().default(false),
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

    const enrollments = await prisma.enrollment.findMany({
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
      take: 100,
    })

    // Calculate payment totals
    const enrollmentsWithPayments = await Promise.all(
      enrollments.map(async (enrollment) => {
        const payments = await prisma.payment.aggregate({
          where: {
            enrollmentId: enrollment.id,
            status: "confirmed",
          },
          _sum: { amount: true },
        })

        return {
          ...enrollment,
          totalPaid: payments._sum.amount || 0,
          tuitionFee: enrollment.adjustedTuitionFee || enrollment.originalTuitionFee,
        }
      })
    )

    return NextResponse.json(enrollmentsWithPayments)
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

    // Generate enrollment number with grade level
    const enrollmentNumber = await generateEnrollmentNumber(grade.level)

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

    const enrollment = await prisma.enrollment.create({
      data: {
        enrollmentNumber,
        schoolYearId: validated.schoolYearId,
        gradeId: validated.gradeId,
        studentId: validated.studentId,
        firstName: validated.firstName,
        lastName: validated.lastName,
        dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
        gender: validated.gender,
        phone: validated.phone,
        email: validated.email || null,
        photoUrl: validated.photoUrl,
        birthCertificateUrl: validated.birthCertificateUrl,
        fatherName: validated.fatherName,
        fatherPhone: validated.fatherPhone,
        fatherEmail: validated.fatherEmail || null,
        motherName: validated.motherName,
        motherPhone: validated.motherPhone,
        motherEmail: validated.motherEmail || null,
        address: validated.address,
        isReturningStudent: validated.isReturningStudent,
        originalTuitionFee: grade.tuitionFee,
        status: "draft",
        currentStep: 1,
        draftExpiresAt,
        createdBy: session.user.id,
      },
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
