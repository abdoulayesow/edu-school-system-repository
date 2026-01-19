import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { generateClubEnrollmentNumber } from "@/lib/club-helpers"

const enrollStudentSchema = z.object({
  studentProfileId: z.string().min(1, "Student profile ID is required"),
  startMonth: z.number().int().min(1).max(12).optional(),
  startYear: z.number().int().min(2020).max(2100).optional(),
  totalMonths: z.number().int().min(1).max(12).optional(),
})

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/admin/clubs/[id]/enrollments
 * Get all enrollments for a club
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("club_enrollment", "view")
  if (error) return error

  try {
    const { id } = await params

    const enrollments = await prisma.clubEnrollment.findMany({
      where: { clubId: id },
      include: {
        studentProfile: {
          include: {
            person: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        enroller: {
          select: { id: true, name: true },
        },
        payments: {
          orderBy: { recordedAt: "desc" },
        },
        monthlyPayments: {
          orderBy: [{ year: "asc" }, { month: "asc" }],
        },
      },
      orderBy: { enrolledAt: "desc" },
    })

    return NextResponse.json(enrollments)
  } catch (err) {
    console.error("Error fetching enrollments:", err)
    return NextResponse.json(
      { message: "Failed to fetch enrollments" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/clubs/[id]/enrollments
 * Enroll a student in a club
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("club_enrollment", "create")
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json()
    const validated = enrollStudentSchema.parse(body)

    // Check club exists and is active
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        _count: { select: { enrollments: true } },
        eligibilityRule: {
          include: {
            gradeRules: true,
            seriesRules: true,
          },
        },
      },
    })

    if (!club) {
      return NextResponse.json(
        { message: "Club not found" },
        { status: 404 }
      )
    }

    if (club.status !== "active") {
      return NextResponse.json(
        { message: "Club is not open for enrollment" },
        { status: 400 }
      )
    }

    if (club._count.enrollments >= club.capacity) {
      return NextResponse.json(
        { message: "Club is at full capacity" },
        { status: 400 }
      )
    }

    // Check student has completed grade enrollment
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: validated.studentProfileId },
      include: {
        person: true,
        gradeEnrollments: {
          where: {
            schoolYear: { isActive: true },
          },
        },
      },
    })

    if (!studentProfile) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      )
    }

    // Check if student has any completed enrollment for current school year
    const hasCompletedEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: studentProfile.studentId || undefined,
        schoolYear: { isActive: true },
        status: "completed",
      },
      include: {
        grade: true,
      },
    })

    if (!hasCompletedEnrollment) {
      return NextResponse.json(
        { message: "Student must have a completed enrollment to join clubs" },
        { status: 400 }
      )
    }

    // Check eligibility rules if they exist
    if (club.eligibilityRule) {
      const rule = club.eligibilityRule
      const studentGradeId = hasCompletedEnrollment.gradeId

      if (rule.ruleType === "include_only") {
        // Student's grade must be in the list
        const allowedGradeIds = rule.gradeRules.map((gr) => gr.gradeId)
        if (!allowedGradeIds.includes(studentGradeId)) {
          return NextResponse.json(
            { message: "Student's grade is not eligible for this club" },
            { status: 400 }
          )
        }
      } else if (rule.ruleType === "exclude_only") {
        // Student's grade must NOT be in the list
        const excludedGradeIds = rule.gradeRules.map((gr) => gr.gradeId)
        if (excludedGradeIds.includes(studentGradeId)) {
          return NextResponse.json(
            { message: "Student's grade is excluded from this club" },
            { status: 400 }
          )
        }
      }
      // all_grades means no grade restriction
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.clubEnrollment.findUnique({
      where: {
        clubId_studentProfileId: {
          clubId: id,
          studentProfileId: validated.studentProfileId,
        },
      },
    })

    if (existingEnrollment) {
      // Provide specific error message based on enrollment status
      if (existingEnrollment.status === "active") {
        return NextResponse.json(
          {
            message: "Student is already actively enrolled in this club",
            existingEnrollment: {
              id: existingEnrollment.id,
              enrollmentNumber: existingEnrollment.enrollmentNumber,
              status: existingEnrollment.status,
            },
          },
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          {
            message: `Student has an existing enrollment (status: ${existingEnrollment.status}). Please modify the existing enrollment instead.`,
            existingEnrollment: {
              id: existingEnrollment.id,
              enrollmentNumber: existingEnrollment.enrollmentNumber,
              status: existingEnrollment.status,
            },
          },
          { status: 400 }
        )
      }
    }

    // Calculate total fee if monthly fee and duration provided
    let totalFee: number | null = null
    if (club.monthlyFee && validated.totalMonths) {
      totalFee = club.monthlyFee * validated.totalMonths
    }

    // Generate enrollment number
    const enrollmentNumber = await generateClubEnrollmentNumber()

    const enrollment = await prisma.clubEnrollment.create({
      data: {
        clubId: id,
        studentProfileId: validated.studentProfileId,
        enrolledBy: session!.user.id,
        status: "active",
        startMonth: validated.startMonth,
        startYear: validated.startYear,
        totalMonths: validated.totalMonths,
        totalFee,
        enrollmentNumber,
      },
      include: {
        studentProfile: {
          include: {
            person: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        enroller: {
          select: { id: true, name: true },
        },
      },
    })

    // Create monthly payment records if monthly fee is set
    if (club.monthlyFee && validated.startMonth && validated.startYear && validated.totalMonths) {
      const monthlyPayments = []
      let month = validated.startMonth
      let year = validated.startYear

      for (let i = 0; i < validated.totalMonths; i++) {
        monthlyPayments.push({
          clubEnrollmentId: enrollment.id,
          month,
          year,
          amount: club.monthlyFee,
          isPaid: false,
        })

        // Move to next month
        month++
        if (month > 12) {
          month = 1
          year++
        }
      }

      await prisma.clubMonthlyPayment.createMany({
        data: monthlyPayments,
      })
    }

    return NextResponse.json(enrollment, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error enrolling student:", err)
    return NextResponse.json(
      { message: "Failed to enroll student" },
      { status: 500 }
    )
  }
}
