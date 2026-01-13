import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/teachers/[id]/schedule
 * Get a teacher's schedule (class assignments) for a school year
 * Query params: schoolYearId (optional)
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("schedule", "view")
  if (error) return error

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const schoolYearId = searchParams.get("schoolYearId")

  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id },
      include: {
        person: true,
        classAssignments: {
          where: schoolYearId ? { schoolYearId } : undefined,
          include: {
            gradeSubject: {
              include: {
                grade: true,
                subject: true,
              },
            },
            schoolYear: true,
          },
          orderBy: {
            gradeSubject: {
              grade: { order: "asc" },
            },
          },
        },
        gradeLederships: schoolYearId
          ? {
              where: { schoolYearId },
              include: {
                schoolYear: true,
              },
            }
          : {
              include: {
                schoolYear: true,
              },
            },
      },
    })

    if (!teacher) {
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 }
      )
    }

    // Group assignments by grade for easier display
    const assignmentsByGrade: Record<string, {
      grade: { id: string; name: string; order: number }
      subjects: Array<{
        subject: { id: string; code: string; nameFr: string; nameEn: string }
        coefficient: number
        hoursPerWeek: number | null
      }>
    }> = {}

    for (const assignment of teacher.classAssignments) {
      const gradeId = assignment.gradeSubject.grade.id
      if (!assignmentsByGrade[gradeId]) {
        assignmentsByGrade[gradeId] = {
          grade: {
            id: gradeId,
            name: assignment.gradeSubject.grade.name,
            order: assignment.gradeSubject.grade.order,
          },
          subjects: [],
        }
      }
      assignmentsByGrade[gradeId].subjects.push({
        subject: assignment.gradeSubject.subject,
        coefficient: assignment.gradeSubject.coefficient,
        hoursPerWeek: assignment.gradeSubject.hoursPerWeek,
      })
    }

    const totalHours = teacher.classAssignments.reduce((acc, ca) => {
      return acc + (ca.gradeSubject.hoursPerWeek || 0)
    }, 0)

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        personId: teacher.personId,
        employeeNumber: teacher.employeeNumber,
        specialization: teacher.specialization,
        person: teacher.person,
      },
      assignmentsByGrade: Object.values(assignmentsByGrade).sort(
        (a, b) => a.grade.order - b.grade.order
      ),
      gradeLederships: teacher.gradeLederships,
      workload: {
        totalHours,
        assignmentsCount: teacher.classAssignments.length,
        leadershipCount: teacher.gradeLederships.length,
      },
    })
  } catch (err) {
    console.error("Error fetching teacher schedule:", err)
    return NextResponse.json(
      { message: "Failed to fetch teacher schedule" },
      { status: 500 }
    )
  }
}
