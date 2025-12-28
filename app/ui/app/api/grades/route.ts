import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/grades
 * List all grades for a school year
 */
export async function GET(req: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const schoolYearId = searchParams.get("schoolYearId")
  const level = searchParams.get("level")

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
      return NextResponse.json({ grades: [] })
    }

    // Build where clause
    const where: Record<string, unknown> = {
      schoolYearId: activeSchoolYearId,
    }

    if (level) {
      where.level = level
    }

    const grades = await prisma.grade.findMany({
      where,
      include: {
        schoolYear: {
          select: { id: true, name: true, isActive: true },
        },
        gradeLeader: {
          include: {
            person: {
              select: { firstName: true, lastName: true, photoUrl: true },
            },
          },
        },
        _count: {
          select: {
            enrollments: {
              where: { status: "completed" },
            },
            subjects: true,
          },
        },
      },
      orderBy: { order: "asc" },
    })

    // Add summary stats for each grade
    const gradesWithStats = await Promise.all(
      grades.map(async (grade) => {
        // Get attendance stats
        const attendanceSessions = await prisma.attendanceSession.findMany({
          where: { gradeId: grade.id },
          select: { id: true },
        })

        const sessionIds = attendanceSessions.map((s) => s.id)

        const attendanceStats = await prisma.attendanceRecord.groupBy({
          by: ["status"],
          where: { sessionId: { in: sessionIds } },
          _count: true,
        })

        let totalRecords = 0
        let presentCount = 0
        for (const stat of attendanceStats) {
          totalRecords += stat._count
          if (["present", "late", "excused"].includes(stat.status)) {
            presentCount += stat._count
          }
        }

        const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : null

        // Get payment stats
        const enrollments = await prisma.enrollment.findMany({
          where: {
            gradeId: grade.id,
            schoolYearId: activeSchoolYearId,
            status: "completed",
          },
          select: {
            originalTuitionFee: true,
            adjustedTuitionFee: true,
            payments: {
              where: { status: "confirmed" },
              select: { amount: true },
            },
          },
        })

        let totalTuition = 0
        let totalPaid = 0
        let lateCount = 0
        let onTimeCount = 0
        let completeCount = 0

        const now = new Date()

        for (const enrollment of enrollments) {
          const tuition = enrollment.adjustedTuitionFee || enrollment.originalTuitionFee
          const paid = enrollment.payments.reduce((sum, p) => sum + p.amount, 0)
          totalTuition += tuition
          totalPaid += paid

          const percentage = Math.round((paid / tuition) * 100)
          if (percentage >= 100) {
            completeCount++
          } else if (percentage >= 50) {
            onTimeCount++
          } else {
            lateCount++
          }
        }

        const paymentRate = totalTuition > 0 ? Math.round((totalPaid / totalTuition) * 100) : null

        return {
          ...grade,
          gradeLeader: grade.gradeLeader
            ? {
                id: grade.gradeLeader.id,
                person: grade.gradeLeader.person,
              }
            : null,
          stats: {
            studentCount: grade._count.enrollments,
            subjectCount: grade._count.subjects,
            attendanceRate,
            paymentRate,
            paymentBreakdown: {
              late: lateCount,
              onTime: onTimeCount,
              complete: completeCount,
            },
          },
        }
      })
    )

    return NextResponse.json({ grades: gradesWithStats })
  } catch (err) {
    console.error("Error fetching grades:", err)
    return NextResponse.json(
      { message: "Failed to fetch grades" },
      { status: 500 }
    )
  }
}
