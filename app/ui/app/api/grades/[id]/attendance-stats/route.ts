import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/grades/[id]/attendance-stats
 * Get attendance statistics for a grade (for charts)
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("classes", "view")
  if (error) return error

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  try {
    // Verify grade exists
    const grade = await prisma.grade.findUnique({
      where: { id },
      select: { id: true, name: true, level: true },
    })

    if (!grade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    // Build date filter
    const dateFilter: Record<string, Date> = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)

    // Get sessions for this grade
    const sessions = await prisma.attendanceSession.findMany({
      where: {
        gradeId: id,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      select: { id: true },
    })

    const sessionIds = sessions.map((s) => s.id)

    // Get aggregate stats
    const stats = await prisma.attendanceRecord.groupBy({
      by: ["status"],
      where: { sessionId: { in: sessionIds } },
      _count: true,
    })

    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
    }

    for (const stat of stats) {
      const statusKey = stat.status as keyof typeof summary
      if (typeof summary[statusKey] === "number") {
        summary[statusKey] = stat._count
      }
      summary.total += stat._count
    }

    // Calculate percentages for donut chart
    const chartData = [
      {
        name: "present",
        value: summary.present,
        percentage: summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0,
        color: "#22c55e", // green
      },
      {
        name: "absent",
        value: summary.absent,
        percentage: summary.total > 0 ? Math.round((summary.absent / summary.total) * 100) : 0,
        color: "#ef4444", // red
      },
      {
        name: "late",
        value: summary.late,
        percentage: summary.total > 0 ? Math.round((summary.late / summary.total) * 100) : 0,
        color: "#f59e0b", // amber
      },
      {
        name: "excused",
        value: summary.excused,
        percentage: summary.total > 0 ? Math.round((summary.excused / summary.total) * 100) : 0,
        color: "#3b82f6", // blue
      },
    ]

    // Get weekly trend
    const weeklyTrend = await prisma.$queryRaw<
      Array<{
        week: string
        present: bigint
        absent: bigint
        late: bigint
        excused: bigint
      }>
    >`
      SELECT
        TO_CHAR(DATE_TRUNC('week', s.date), 'YYYY-WW') as week,
        COUNT(CASE WHEN r.status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN r.status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN r.status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN r.status = 'excused' THEN 1 END) as excused
      FROM "AttendanceSession" s
      JOIN "AttendanceRecord" r ON r."sessionId" = s.id
      WHERE s."gradeId" = ${id}
        ${startDate ? prisma.$queryRaw`AND s.date >= ${new Date(startDate)}` : prisma.$queryRaw``}
        ${endDate ? prisma.$queryRaw`AND s.date <= ${new Date(endDate)}` : prisma.$queryRaw``}
      GROUP BY DATE_TRUNC('week', s.date)
      ORDER BY week DESC
      LIMIT 12
    `

    const trendData = weeklyTrend.map((week) => ({
      week: week.week,
      present: Number(week.present),
      absent: Number(week.absent),
      late: Number(week.late),
      excused: Number(week.excused),
      total: Number(week.present) + Number(week.absent) + Number(week.late) + Number(week.excused),
      attendanceRate:
        Number(week.present) + Number(week.absent) + Number(week.late) + Number(week.excused) > 0
          ? Math.round(
              ((Number(week.present) + Number(week.late) + Number(week.excused)) /
                (Number(week.present) + Number(week.absent) + Number(week.late) + Number(week.excused))) *
                100
            )
          : 0,
    })).reverse()

    return NextResponse.json({
      grade,
      summary,
      chartData,
      trendData,
      sessionsCount: sessions.length,
    })
  } catch (err) {
    console.error("Error fetching grade attendance stats:", err)
    return NextResponse.json(
      { message: "Failed to fetch grade attendance stats" },
      { status: 500 }
    )
  }
}
