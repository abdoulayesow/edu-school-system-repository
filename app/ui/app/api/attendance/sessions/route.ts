import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for creating an attendance session
const createSessionSchema = z.object({
  gradeId: z.string().min(1, "Grade is required"),
  date: z.string().transform((s) => new Date(s)),
  entryMode: z.enum(["checklist", "absences_only"]),
})

/**
 * GET /api/attendance/sessions
 * List attendance sessions with filters
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("attendance", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const gradeId = searchParams.get("gradeId")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const isComplete = searchParams.get("isComplete")
  const limit = parseInt(searchParams.get("limit") || "50")
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    const where: Record<string, unknown> = {}

    if (gradeId) {
      where.gradeId = gradeId
    }
    if (isComplete !== null && isComplete !== undefined) {
      where.isComplete = isComplete === "true"
    }
    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        (where.date as Record<string, Date>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.date as Record<string, Date>).lte = new Date(endDate)
      }
    }

    const [sessions, total] = await Promise.all([
      prisma.attendanceSession.findMany({
        where,
        include: {
          grade: {
            select: { id: true, name: true, level: true, order: true },
          },
          recorder: { select: { id: true, name: true, email: true } },
          _count: {
            select: { records: true },
          },
        },
        orderBy: [{ date: "desc" }, { gradeId: "asc" }],
        take: limit,
        skip: offset,
      }),
      prisma.attendanceSession.count({ where }),
    ])

    // Add attendance summary for each session
    const sessionsWithStats = await Promise.all(
      sessions.map(async (session) => {
        const stats = await prisma.attendanceRecord.groupBy({
          by: ["status"],
          where: { sessionId: session.id },
          _count: true,
        })

        const summary = {
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        }

        for (const stat of stats) {
          const statusKey = stat.status as keyof typeof summary
          if (summary[statusKey] !== undefined) {
            summary[statusKey] = stat._count
          }
        }

        return {
          ...session,
          summary,
        }
      })
    )

    return NextResponse.json({
      sessions: sessionsWithStats,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + sessions.length < total,
      },
    })
  } catch (err) {
    console.error("Error fetching attendance sessions:", err)
    return NextResponse.json(
      { message: "Failed to fetch attendance sessions" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/attendance/sessions
 * Create a new attendance session
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requirePerm("attendance", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validated = createSessionSchema.parse(body)

    // Check if session already exists for this grade and date
    const existingSession = await prisma.attendanceSession.findFirst({
      where: {
        gradeId: validated.gradeId,
        date: validated.date,
      },
    })

    if (existingSession) {
      return NextResponse.json(
        { message: "Attendance session already exists for this grade and date", existingSession },
        { status: 400 }
      )
    }

    // Verify grade exists
    const grade = await prisma.grade.findUnique({
      where: { id: validated.gradeId },
    })

    if (!grade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    const attendanceSession = await prisma.attendanceSession.create({
      data: {
        gradeId: validated.gradeId,
        date: validated.date,
        entryMode: validated.entryMode,
        recordedBy: session!.user.id,
      },
      include: {
        grade: {
          select: { id: true, name: true, level: true, order: true },
        },
        recorder: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(attendanceSession, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating attendance session:", err)
    return NextResponse.json(
      { message: "Failed to create attendance session" },
      { status: 500 }
    )
  }
}
