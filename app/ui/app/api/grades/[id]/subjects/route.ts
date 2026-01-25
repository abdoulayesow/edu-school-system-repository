import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

// Schema for updating a subject assignment
const updateSubjectSchema = z.object({
  teacherProfileId: z.string().min(1),
  schoolYearId: z.string().optional(),
})

/**
 * GET /api/grades/[id]/subjects
 * Get all subjects and teacher assignments for a grade
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("classes", "view")
  if (error) return error

  const { id } = await params

  try {
    // Verify grade exists
    const grade = await prisma.grade.findUnique({
      where: { id },
      include: {
        schoolYear: { select: { id: true, name: true } },
      },
    })

    if (!grade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    // Get subjects with teacher assignments
    const gradeSubjects = await prisma.gradeSubject.findMany({
      where: { gradeId: id },
      include: {
        subject: true,
        classAssignments: {
          where: { schoolYearId: grade.schoolYearId },
          include: {
            teacherProfile: {
              include: {
                person: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    photoUrl: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { subject: { nameFr: "asc" } },
    })

    const subjects = gradeSubjects.map((gs) => ({
      id: gs.id,
      subject: gs.subject,
      coefficient: gs.coefficient,
      hoursPerWeek: gs.hoursPerWeek,
      series: gs.series,
      teacher: gs.classAssignments[0]?.teacherProfile
        ? {
            id: gs.classAssignments[0].teacherProfile.id,
            person: gs.classAssignments[0].teacherProfile.person,
            specialization: gs.classAssignments[0].teacherProfile.specialization,
          }
        : null,
      assignmentId: gs.classAssignments[0]?.id,
    }))

    return NextResponse.json({
      grade: {
        id: grade.id,
        name: grade.name,
        schoolYear: grade.schoolYear,
      },
      subjects,
      total: subjects.length,
    })
  } catch (err) {
    console.error("Error fetching grade subjects:", err)
    return NextResponse.json(
      { message: "Failed to fetch grade subjects" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/grades/[id]/subjects
 * Assign or update teacher for a subject
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("classes", "update")
  if (error) return error

  const { id } = await params

  try {
    const body = await req.json()
    const { gradeSubjectId, ...rest } = body
    const validated = updateSubjectSchema.parse(rest)

    // Verify grade exists
    const grade = await prisma.grade.findUnique({
      where: { id },
    })

    if (!grade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    // Verify grade subject exists
    const gradeSubject = await prisma.gradeSubject.findUnique({
      where: { id: gradeSubjectId },
    })

    if (!gradeSubject || gradeSubject.gradeId !== id) {
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

    const schoolYearId = validated.schoolYearId || grade.schoolYearId

    // Upsert the class assignment
    const assignment = await prisma.classAssignment.upsert({
      where: {
        gradeSubjectId_schoolYearId: {
          gradeSubjectId,
          schoolYearId,
        },
      },
      update: {
        teacherProfileId: validated.teacherProfileId,
      },
      create: {
        gradeSubjectId,
        teacherProfileId: validated.teacherProfileId,
        schoolYearId,
      },
      include: {
        gradeSubject: {
          include: { subject: true },
        },
        teacherProfile: {
          include: {
            person: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    })

    return NextResponse.json(assignment)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error assigning teacher:", err)
    return NextResponse.json(
      { message: "Failed to assign teacher" },
      { status: 500 }
    )
  }
}
