import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createAssignmentSchema = z.object({
  gradeSubjectId: z.string().min(1, "Grade subject ID is required"),
  teacherProfileId: z.string().min(1, "Teacher profile ID is required"),
  schoolYearId: z.string().min(1, "School year ID is required"),
})

/**
 * GET /api/admin/class-assignments
 * List class assignments for a school year
 * Query params: schoolYearId (required), gradeId (optional), teacherId (optional)
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("teachers_assignment", "view")
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const schoolYearId = searchParams.get("schoolYearId")
    const gradeId = searchParams.get("gradeId")
    const teacherId = searchParams.get("teacherId")

    if (!schoolYearId) {
      return NextResponse.json(
        { message: "School year ID is required" },
        { status: 400 }
      )
    }

    const whereClause: {
      schoolYearId: string
      gradeSubject?: { gradeId?: string }
      teacherProfileId?: string
    } = { schoolYearId }

    if (gradeId) {
      whereClause.gradeSubject = { gradeId }
    }

    if (teacherId) {
      whereClause.teacherProfileId = teacherId
    }

    const assignments = await prisma.classAssignment.findMany({
      where: whereClause,
      include: {
        gradeSubject: {
          include: {
            grade: true,
            subject: true,
          },
        },
        teacherProfile: {
          include: {
            person: true,
          },
        },
        schoolYear: true,
      },
      orderBy: [
        { gradeSubject: { grade: { order: "asc" } } },
        { gradeSubject: { subject: { nameFr: "asc" } } },
      ],
    })

    return NextResponse.json(assignments)
  } catch (err) {
    console.error("Error fetching class assignments:", err)
    return NextResponse.json(
      { message: "Failed to fetch class assignments" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/class-assignments
 * Create a new class assignment
 */
export async function POST(req: NextRequest) {
  const { error } = await requirePerm("teachers_assignment", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validated = createAssignmentSchema.parse(body)

    // Verify school year exists and is not passed
    const schoolYear = await prisma.schoolYear.findUnique({
      where: { id: validated.schoolYearId },
    })

    if (!schoolYear) {
      return NextResponse.json(
        { message: "School year not found" },
        { status: 404 }
      )
    }

    if (schoolYear.status === "passed") {
      return NextResponse.json(
        { message: "Cannot create assignments in a passed school year" },
        { status: 400 }
      )
    }

    // Verify grade subject exists
    const gradeSubject = await prisma.gradeSubject.findUnique({
      where: { id: validated.gradeSubjectId },
      include: { grade: true, subject: true },
    })

    if (!gradeSubject) {
      return NextResponse.json(
        { message: "Grade subject not found" },
        { status: 404 }
      )
    }

    // Verify teacher exists
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: validated.teacherProfileId },
    })

    if (!teacher) {
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 }
      )
    }

    // Check for existing assignment
    const existing = await prisma.classAssignment.findFirst({
      where: {
        gradeSubjectId: validated.gradeSubjectId,
        schoolYearId: validated.schoolYearId,
      },
    })

    if (existing) {
      return NextResponse.json(
        { message: "This subject is already assigned to a teacher for this school year" },
        { status: 400 }
      )
    }

    const assignment = await prisma.classAssignment.create({
      data: {
        gradeSubjectId: validated.gradeSubjectId,
        teacherProfileId: validated.teacherProfileId,
        schoolYearId: validated.schoolYearId,
      },
      include: {
        gradeSubject: {
          include: {
            grade: true,
            subject: true,
          },
        },
        teacherProfile: {
          include: {
            person: true,
          },
        },
      },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating class assignment:", err)
    return NextResponse.json(
      { message: "Failed to create class assignment" },
      { status: 500 }
    )
  }
}
