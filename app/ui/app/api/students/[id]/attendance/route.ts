import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/students/[id]/attendance
 * Get attendance summary and recent records for a student
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const limit = parseInt(searchParams.get("limit") || "30")

  try {
    // Get student and their profile
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        studentProfile: {
          include: {
            currentGrade: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      )
    }

    if (!student.studentProfile) {
      return NextResponse.json({
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          studentNumber: student.studentNumber,
        },
        summary: null,
        records: [],
        message: "No student profile found",
      })
    }

    // Build date filter
    const dateFilter: Record<string, unknown> = {}
    if (startDate || endDate) {
      dateFilter.session = { date: {} }
      if (startDate) {
        (dateFilter.session as Record<string, Record<string, Date>>).date.gte = new Date(startDate)
      }
      if (endDate) {
        (dateFilter.session as Record<string, Record<string, Date>>).date.lte = new Date(endDate)
      }
    }

    // Get attendance stats
    const stats = await prisma.attendanceRecord.groupBy({
      by: ["status"],
      where: {
        studentProfileId: student.studentProfile.id,
        ...dateFilter,
      },
      _count: true,
    })

    const summary = {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      attendanceRate: 0,
      status: "good" as "good" | "concerning" | "critical",
    }

    for (const stat of stats) {
      if (stat.status === "present") summary.present = stat._count
      else if (stat.status === "absent") summary.absent = stat._count
      else if (stat.status === "late") summary.late = stat._count
      else if (stat.status === "excused") summary.excused = stat._count
      summary.total += stat._count
    }

    if (summary.total > 0) {
      summary.attendanceRate = Math.round(
        ((summary.present + summary.late + summary.excused) / summary.total) * 100
      )

      if (summary.attendanceRate >= 90) {
        summary.status = "good"
      } else if (summary.attendanceRate >= 70) {
        summary.status = "concerning"
      } else {
        summary.status = "critical"
      }
    }

    // Get recent attendance records
    const records = await prisma.attendanceRecord.findMany({
      where: {
        studentProfileId: student.studentProfile.id,
        ...dateFilter,
      },
      include: {
        session: {
          include: {
            grade: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { session: { date: "desc" } },
      take: limit,
    })

    // Get monthly breakdown
    const monthlyStats = await prisma.$queryRaw<
      Array<{
        month: string
        present: bigint
        absent: bigint
        late: bigint
        excused: bigint
      }>
    >`
      SELECT
        TO_CHAR(s.date, 'YYYY-MM') as month,
        COUNT(CASE WHEN r.status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN r.status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN r.status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN r.status = 'excused' THEN 1 END) as excused
      FROM "AttendanceRecord" r
      JOIN "AttendanceSession" s ON r."sessionId" = s.id
      WHERE r."studentProfileId" = ${student.studentProfile.id}
      GROUP BY TO_CHAR(s.date, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 6
    `

    const monthlyBreakdown = monthlyStats.map((stat) => ({
      month: stat.month,
      present: Number(stat.present),
      absent: Number(stat.absent),
      late: Number(stat.late),
      excused: Number(stat.excused),
      total: Number(stat.present) + Number(stat.absent) + Number(stat.late) + Number(stat.excused),
    }))

    return NextResponse.json({
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentNumber: student.studentNumber,
        currentGrade: student.studentProfile.currentGrade,
      },
      summary,
      records,
      monthlyBreakdown,
    })
  } catch (err) {
    console.error("Error fetching student attendance:", err)
    return NextResponse.json(
      { message: "Failed to fetch student attendance" },
      { status: 500 }
    )
  }
}
