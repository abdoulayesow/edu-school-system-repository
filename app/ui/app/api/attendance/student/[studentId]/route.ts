import { NextRequest, NextResponse } from "next/server"
import { requireSession, requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ studentId: string }>
}

// Schema for updating a single attendance record
const updateAttendanceSchema = z.object({
  sessionId: z.string().min(1),
  status: z.enum(["present", "absent", "late", "excused"]),
  notes: z.string().optional(),
})

/**
 * GET /api/attendance/student/[studentId]
 * Get attendance history for a specific student
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession()
  if (error) return error

  const { studentId } = await params
  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const limit = parseInt(searchParams.get("limit") || "100")
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    // Get student profile
    const studentProfile = await prisma.studentProfile.findFirst({
      where: {
        OR: [{ id: studentId }, { studentId: studentId }],
      },
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
        currentGrade: {
          select: { id: true, name: true, level: true },
        },
      },
    })

    if (!studentProfile) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      )
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

    // Get attendance records
    const [records, total] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where: {
          studentProfileId: studentProfile.id,
          ...dateFilter,
        },
        include: {
          session: {
            include: {
              grade: { select: { id: true, name: true } },
            },
          },
          recorder: { select: { id: true, name: true } },
        },
        orderBy: { session: { date: "desc" } },
        take: limit,
        skip: offset,
      }),
      prisma.attendanceRecord.count({
        where: {
          studentProfileId: studentProfile.id,
          ...dateFilter,
        },
      }),
    ])

    // Calculate statistics
    const stats = await prisma.attendanceRecord.groupBy({
      by: ["status"],
      where: {
        studentProfileId: studentProfile.id,
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
    }

    for (const stat of stats) {
      const statusKey = stat.status as keyof typeof summary
      if (typeof summary[statusKey] === "number") {
        summary[statusKey] = stat._count
      }
      summary.total += stat._count
    }

    // Calculate attendance rate (present + late + excused) / total
    if (summary.total > 0) {
      summary.attendanceRate = Math.round(
        ((summary.present + summary.late + summary.excused) / summary.total) * 100
      )
    }

    return NextResponse.json({
      student: {
        id: studentProfile.id,
        studentNumber: studentProfile.studentNumber,
        person: studentProfile.person,
        currentGrade: studentProfile.currentGrade,
      },
      records,
      summary,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + records.length < total,
      },
    })
  } catch (err) {
    console.error("Error fetching student attendance:", err)
    return NextResponse.json(
      { message: "Failed to fetch student attendance" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/attendance/student/[studentId]
 * Update a single attendance record for a student
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { session: userSession, error } = await requireRole([
    "director",
    "academic_director",
  ])
  if (error) return error

  const { studentId } = await params

  try {
    const body = await req.json()
    const validated = updateAttendanceSchema.parse(body)

    // Get student profile
    const studentProfile = await prisma.studentProfile.findFirst({
      where: {
        OR: [{ id: studentId }, { studentId: studentId }],
      },
    })

    if (!studentProfile) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      )
    }

    // Verify session exists
    const session = await prisma.attendanceSession.findUnique({
      where: { id: validated.sessionId },
    })

    if (!session) {
      return NextResponse.json(
        { message: "Attendance session not found" },
        { status: 404 }
      )
    }

    // Upsert the attendance record
    const record = await prisma.attendanceRecord.upsert({
      where: {
        sessionId_studentProfileId: {
          sessionId: validated.sessionId,
          studentProfileId: studentProfile.id,
        },
      },
      update: {
        status: validated.status,
        notes: validated.notes,
      },
      create: {
        sessionId: validated.sessionId,
        studentProfileId: studentProfile.id,
        status: validated.status,
        notes: validated.notes,
        recordedBy: userSession!.user.id,
      },
      include: {
        session: {
          include: {
            grade: { select: { id: true, name: true } },
          },
        },
        recorder: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(record)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating student attendance:", err)
    return NextResponse.json(
      { message: "Failed to update student attendance" },
      { status: 500 }
    )
  }
}
