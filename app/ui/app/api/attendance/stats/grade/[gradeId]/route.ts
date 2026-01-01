import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ gradeId: string }>
}

/**
 * GET /api/attendance/stats/grade/[gradeId]
 * Get attendance statistics for a grade
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession()
  if (error) return error

  const { gradeId } = await params
  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  try {
    // Verify grade exists
    const grade = await prisma.grade.findUnique({
      where: { id: gradeId },
      include: {
        schoolYear: { select: { id: true, name: true, isActive: true } },
      },
    })

    if (!grade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    // Build date filter for sessions
    const sessionDateFilter: Record<string, Date> = {}
    if (startDate) sessionDateFilter.gte = new Date(startDate)
    if (endDate) sessionDateFilter.lte = new Date(endDate)

    // Get all sessions for this grade
    const sessions = await prisma.attendanceSession.findMany({
      where: {
        gradeId,
        ...(Object.keys(sessionDateFilter).length > 0 && { date: sessionDateFilter }),
      },
      select: { id: true, date: true, isComplete: true },
    })

    const sessionIds = sessions.map((s) => s.id)

    // Get aggregate attendance stats
    const stats = await prisma.attendanceRecord.groupBy({
      by: ["status"],
      where: {
        sessionId: { in: sessionIds },
      },
      _count: true,
    })

    const summary = {
      totalRecords: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      attendanceRate: 0,
    }

    for (const stat of stats) {
      const statusKey = stat.status as keyof typeof summary
      if (typeof summary[statusKey] === "number") {
        summary[statusKey] = stat._count
      }
      summary.totalRecords += stat._count
    }

    // Calculate attendance rate
    if (summary.totalRecords > 0) {
      summary.attendanceRate = Math.round(
        ((summary.present + summary.late + summary.excused) / summary.totalRecords) * 100
      )
    }

    // Get daily breakdown for chart
    const dailyStats = await prisma.$queryRaw<
      Array<{
        date: Date
        present: bigint
        absent: bigint
        late: bigint
        excused: bigint
      }>
    >`
      SELECT
        s.date,
        COUNT(CASE WHEN r.status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN r.status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN r.status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN r.status = 'excused' THEN 1 END) as excused
      FROM "AttendanceSession" s
      LEFT JOIN "AttendanceRecord" r ON r."sessionId" = s.id
      WHERE s."gradeId" = ${gradeId}
        ${startDate ? prisma.$queryRaw`AND s.date >= ${new Date(startDate)}` : prisma.$queryRaw``}
        ${endDate ? prisma.$queryRaw`AND s.date <= ${new Date(endDate)}` : prisma.$queryRaw``}
      GROUP BY s.date
      ORDER BY s.date DESC
      LIMIT 30
    `

    // Convert BigInt to number for JSON serialization
    const dailyBreakdown = dailyStats.map((day) => ({
      date: day.date,
      present: Number(day.present),
      absent: Number(day.absent),
      late: Number(day.late),
      excused: Number(day.excused),
      total: Number(day.present) + Number(day.absent) + Number(day.late) + Number(day.excused),
    }))

    // Get per-student stats (top absences)
    const studentStats = await prisma.attendanceRecord.groupBy({
      by: ["studentProfileId"],
      where: {
        sessionId: { in: sessionIds },
        status: "absent",
      },
      _count: true,
      orderBy: { _count: { status: "desc" } },
      take: 10,
    })

    // Fetch student details for top absences
    const studentProfileIds = studentStats.map((s) => s.studentProfileId)
    const studentProfiles = await prisma.studentProfile.findMany({
      where: { id: { in: studentProfileIds } },
      include: {
        person: {
          select: { firstName: true, lastName: true, photoUrl: true },
        },
      },
    })

    const profileMap = new Map(studentProfiles.map((p) => [p.id, p]))

    const topAbsences = studentStats.map((stat) => {
      const profile = profileMap.get(stat.studentProfileId)
      return {
        studentProfileId: stat.studentProfileId,
        studentNumber: profile?.studentNumber,
        person: profile?.person,
        absenceCount: stat._count,
      }
    })

    return NextResponse.json({
      grade: {
        id: grade.id,
        name: grade.name,
        level: grade.level,
        schoolYear: grade.schoolYear,
      },
      summary,
      sessionsCount: sessions.length,
      completedSessions: sessions.filter((s) => s.isComplete).length,
      dailyBreakdown,
      topAbsences,
    })
  } catch (err) {
    console.error("Error fetching grade attendance stats:", err)
    return NextResponse.json(
      { message: "Failed to fetch grade attendance stats" },
      { status: 500 }
    )
  }
}
