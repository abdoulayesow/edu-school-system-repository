import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/timetable
 * Get timetable data: grades with subjects and teacher assignments
 * Query params: gradeId (optional), schoolYearId (optional)
 */
export async function GET(req: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const gradeId = searchParams.get("gradeId")
  const schoolYearId = searchParams.get("schoolYearId")

  try {
    // Get school year
    let activeSchoolYearId = schoolYearId
    if (!activeSchoolYearId) {
      const activeYear = await prisma.schoolYear.findFirst({
        where: { isActive: true },
        select: { id: true },
      })
      activeSchoolYearId = activeYear?.id ?? null
    }

    if (!activeSchoolYearId) {
      return NextResponse.json({ grades: [], subjects: [] })
    }

    // If gradeId provided, get subjects for that grade
    if (gradeId) {
      const gradeSubjects = await prisma.gradeSubject.findMany({
        where: { gradeId },
        include: {
          subject: true,
          classAssignments: {
            where: { schoolYearId: activeSchoolYearId },
            include: {
              teacherProfile: {
                include: {
                  person: true,
                },
              },
            },
          },
        },
      })

      // Sort by subject name
      gradeSubjects.sort((a, b) => a.subject.nameFr.localeCompare(b.subject.nameFr))

      const subjects = gradeSubjects.map((gs) => {
        const assignment = gs.classAssignments[0]
        const teacher = assignment?.teacherProfile?.person
        return {
          id: gs.id,
          subjectId: gs.subjectId,
          name: gs.subject.nameFr,
          code: gs.subject.code,
          coefficient: gs.coefficient,
          hoursPerWeek: gs.hoursPerWeek || 0,
          teacher: teacher
            ? {
                id: assignment.teacherProfile!.id,
                name: `${teacher.firstName} ${teacher.lastName}`,
              }
            : null,
        }
      })

      // Get grade info
      const grade = await prisma.grade.findUnique({
        where: { id: gradeId },
        include: {
          gradeLeader: {
            include: {
              person: true,
            },
          },
          _count: {
            select: { enrollments: { where: { status: "completed" } } },
          },
        },
      })

      return NextResponse.json({
        grade: grade
          ? {
              id: grade.id,
              name: grade.name,
              level: grade.level,
              studentCount: grade._count.enrollments,
              leader: grade.gradeLeader?.person
                ? `${grade.gradeLeader.person.firstName} ${grade.gradeLeader.person.lastName}`
                : null,
            }
          : null,
        subjects,
        totalHours: subjects.reduce((sum, s) => sum + s.hoursPerWeek, 0),
      })
    }

    // Otherwise, get all grades with basic info
    const grades = await prisma.grade.findMany({
      where: { schoolYearId: activeSchoolYearId },
      include: {
        _count: {
          select: {
            enrollments: { where: { status: "completed" } },
            subjects: true,
          },
        },
      },
      orderBy: { order: "asc" },
    })

    return NextResponse.json({
      grades: grades.map((g) => ({
        id: g.id,
        name: g.name,
        level: g.level,
        studentCount: g._count.enrollments,
        subjectCount: g._count.subjects,
      })),
    })
  } catch (err) {
    console.error("Error fetching timetable:", err)
    return NextResponse.json(
      { message: "Failed to fetch timetable" },
      { status: 500 }
    )
  }
}
