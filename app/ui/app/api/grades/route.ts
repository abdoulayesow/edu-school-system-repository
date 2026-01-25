import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { withCache } from "@/lib/cache"

/**
 * GET /api/grades
 * List all grades for a school year
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("classes", "view")
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

    // Batch query all data upfront (avoids N+1 queries)
    const gradeIds = grades.map((g) => g.id)

    // 1. Batch query all attendance sessions for all grades
    const allSessions = await prisma.attendanceSession.findMany({
      where: { gradeId: { in: gradeIds } },
      select: { id: true, gradeId: true },
    })

    // Build session -> grade lookup
    const sessionToGrade = new Map(allSessions.map((s) => [s.id, s.gradeId]))
    const sessionIds = allSessions.map((s) => s.id)

    // 2. Batch query all attendance records for all sessions
    const allAttendanceStats = sessionIds.length > 0
      ? await prisma.attendanceRecord.groupBy({
          by: ["sessionId", "status"],
          where: { sessionId: { in: sessionIds } },
          _count: true,
        })
      : []

    // Build attendance lookup: gradeId -> { total, present }
    const attendanceMap = new Map<string, { total: number; present: number }>()
    for (const stat of allAttendanceStats) {
      const gradeId = sessionToGrade.get(stat.sessionId)
      if (!gradeId) continue
      const current = attendanceMap.get(gradeId) || { total: 0, present: 0 }
      current.total += stat._count
      if (["present", "late", "excused"].includes(stat.status)) {
        current.present += stat._count
      }
      attendanceMap.set(gradeId, current)
    }

    // 3. Batch query all enrollments with payments for all grades
    const allEnrollments = await prisma.enrollment.findMany({
      where: {
        gradeId: { in: gradeIds },
        schoolYearId: activeSchoolYearId,
        status: "completed",
      },
      select: {
        gradeId: true,
        originalTuitionFee: true,
        adjustedTuitionFee: true,
        payments: {
          where: { status: "confirmed" },
          select: { amount: true },
        },
      },
    })

    // Build payment stats lookup: gradeId -> stats
    const paymentMap = new Map<string, {
      totalTuition: number
      totalPaid: number
      late: number
      onTime: number
      complete: number
    }>()

    for (const enrollment of allEnrollments) {
      const current = paymentMap.get(enrollment.gradeId) || {
        totalTuition: 0,
        totalPaid: 0,
        late: 0,
        onTime: 0,
        complete: 0,
      }

      const tuition = enrollment.adjustedTuitionFee || enrollment.originalTuitionFee
      const paid = enrollment.payments.reduce((sum, p) => sum + p.amount, 0)
      current.totalTuition += tuition
      current.totalPaid += paid

      const percentage = Math.round((paid / tuition) * 100)
      if (percentage >= 100) {
        current.complete++
      } else if (percentage >= 50) {
        current.onTime++
      } else {
        current.late++
      }

      paymentMap.set(enrollment.gradeId, current)
    }

    // Build final result (synchronous now)
    const gradesWithStats = grades.map((grade) => {
      const attendance = attendanceMap.get(grade.id)
      const attendanceRate = attendance && attendance.total > 0
        ? Math.round((attendance.present / attendance.total) * 100)
        : null

      const payment = paymentMap.get(grade.id)
      const paymentRate = payment && payment.totalTuition > 0
        ? Math.round((payment.totalPaid / payment.totalTuition) * 100)
        : null

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
          paymentBreakdown: payment
            ? {
                late: payment.late,
                onTime: payment.onTime,
                complete: payment.complete,
              }
            : { late: 0, onTime: 0, complete: 0 },
        },
      }
    })

    const response = NextResponse.json({ grades: gradesWithStats })
    // Cache for 1 minute with 5 min stale-while-revalidate (stats change frequently)
    return withCache(response, "STATISTICS")
  } catch (err) {
    console.error("Error fetching grades:", err)
    return NextResponse.json(
      { message: "Failed to fetch grades" },
      { status: 500 }
    )
  }
}
