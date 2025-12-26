import { NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/school-years/active
 * Returns the active school year with all its grades
 */
export async function GET() {
  const { error } = await requireSession()
  if (error) return error

  try {
    const activeSchoolYear = await prisma.schoolYear.findFirst({
      where: { isActive: true },
      include: {
        grades: {
          orderBy: { order: "asc" },
          include: {
            _count: {
              select: {
                enrollments: {
                  where: {
                    status: { in: ["submitted", "completed"] },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!activeSchoolYear) {
      return NextResponse.json(
        { message: "No active school year found" },
        { status: 404 }
      )
    }

    // Transform grades to include enrollment count
    const gradesWithCount = activeSchoolYear.grades.map((grade) => ({
      id: grade.id,
      name: grade.name,
      level: grade.level,
      order: grade.order,
      tuitionFee: grade.tuitionFee,
      enrollmentCount: grade._count.enrollments,
    }))

    return NextResponse.json({
      id: activeSchoolYear.id,
      name: activeSchoolYear.name,
      startDate: activeSchoolYear.startDate,
      endDate: activeSchoolYear.endDate,
      enrollmentStart: activeSchoolYear.enrollmentStart,
      enrollmentEnd: activeSchoolYear.enrollmentEnd,
      isActive: activeSchoolYear.isActive,
      grades: gradesWithCount,
    })
  } catch (err) {
    console.error("Error fetching active school year:", err)
    return NextResponse.json(
      { message: "Failed to fetch active school year" },
      { status: 500 }
    )
  }
}
