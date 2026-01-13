import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/teachers
 * List all teachers with their workload for a school year
 * Query params: schoolYearId (optional)
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("staff_assignment", "view")
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const schoolYearId = searchParams.get("schoolYearId")

    const teachers = await prisma.teacherProfile.findMany({
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
        },
        gradeLederships: schoolYearId
          ? {
              where: { schoolYearId },
            }
          : true,
      },
      orderBy: {
        person: { lastName: "asc" },
      },
    })

    // Calculate workload for each teacher
    const teachersWithWorkload = teachers.map((teacher) => {
      const totalHours = teacher.classAssignments.reduce((acc, ca) => {
        return acc + (ca.gradeSubject.hoursPerWeek || 0)
      }, 0)

      return {
        id: teacher.id,
        personId: teacher.personId,
        employeeNumber: teacher.employeeNumber,
        specialization: teacher.specialization,
        hireDate: teacher.hireDate,
        person: teacher.person,
        classAssignments: teacher.classAssignments,
        gradeLederships: teacher.gradeLederships,
        workload: {
          totalHours,
          assignmentsCount: teacher.classAssignments.length,
          leadershipCount: teacher.gradeLederships.length,
        },
      }
    })

    return NextResponse.json(teachersWithWorkload)
  } catch (err) {
    console.error("Error fetching teachers:", err)
    return NextResponse.json(
      { message: "Failed to fetch teachers" },
      { status: 500 }
    )
  }
}
