import { NextRequest, NextResponse } from "next/server"
import { requireSession, requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ gradeId: string; date: string }>
}

// Schema for batch attendance submission
const batchAttendanceSchema = z.object({
  entryMode: z.enum(["checklist", "absences_only"]),
  records: z.array(
    z.object({
      studentProfileId: z.string().min(1),
      status: z.enum(["present", "absent", "late", "excused"]),
      notes: z.string().optional(),
    })
  ),
  isComplete: z.boolean().default(false),
})

/**
 * GET /api/attendance/grade/[gradeId]/[date]
 * Get attendance for a specific grade and date
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession()
  if (error) return error

  const { gradeId, date } = await params
  const targetDate = new Date(date)

  try {
    // Get session if it exists
    const session = await prisma.attendanceSession.findFirst({
      where: {
        gradeId,
        date: targetDate,
      },
      include: {
        records: {
          include: {
            studentProfile: {
              include: {
                person: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    photoUrl: true,
                  },
                },
              },
            },
          },
        },
        recorder: { select: { id: true, name: true } },
      },
    })

    // Get all enrolled students for this grade
    const grade = await prisma.grade.findUnique({
      where: { id: gradeId },
      include: {
        schoolYear: { select: { id: true, isActive: true } },
        enrollments: {
          where: { status: "completed" },
          include: {
            student: {
              include: {
                studentProfile: {
                  include: {
                    person: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        photoUrl: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!grade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    // Build student list with attendance status
    const recordMap = new Map(
      session?.records.map((r) => [r.studentProfileId, r]) || []
    )

    const students = grade.enrollments
      .filter((e) => e.student?.studentProfile)
      .map((enrollment) => {
        const profile = enrollment.student!.studentProfile!
        const record = recordMap.get(profile.id)
        return {
          studentProfileId: profile.id,
          studentNumber: profile.studentNumber,
          person: profile.person,
          status: record?.status || null,
          notes: record?.notes || null,
          recordId: record?.id || null,
        }
      })
      .sort((a, b) =>
        (a.person?.lastName || "").localeCompare(b.person?.lastName || "")
      )

    // Calculate summary
    const summary = {
      total: students.length,
      present: students.filter((s) => s.status === "present").length,
      absent: students.filter((s) => s.status === "absent").length,
      late: students.filter((s) => s.status === "late").length,
      excused: students.filter((s) => s.status === "excused").length,
      notRecorded: students.filter((s) => s.status === null).length,
    }

    return NextResponse.json({
      grade: {
        id: grade.id,
        name: grade.name,
        level: grade.level,
      },
      date: targetDate.toISOString(),
      session: session
        ? {
            id: session.id,
            entryMode: session.entryMode,
            isComplete: session.isComplete,
            completedAt: session.completedAt,
            recorder: session.recorder,
          }
        : null,
      students,
      summary,
    })
  } catch (err) {
    console.error("Error fetching grade attendance:", err)
    return NextResponse.json(
      { message: "Failed to fetch grade attendance" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/attendance/grade/[gradeId]/[date]
 * Submit batch attendance for a grade on a specific date
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session: userSession, error } = await requireRole([
    "director",
    "academic_director",
    "teacher",
  ])
  if (error) return error

  const { gradeId, date } = await params
  const targetDate = new Date(date)

  try {
    const body = await req.json()
    const validated = batchAttendanceSchema.parse(body)

    // Check if session already exists
    let attendanceSession = await prisma.attendanceSession.findFirst({
      where: {
        gradeId,
        date: targetDate,
      },
    })

    // Create or update session
    const result = await prisma.$transaction(async (tx) => {
      if (!attendanceSession) {
        // Create new session
        attendanceSession = await tx.attendanceSession.create({
          data: {
            gradeId,
            date: targetDate,
            entryMode: validated.entryMode,
            recordedBy: userSession!.user.id,
            isComplete: validated.isComplete,
            completedAt: validated.isComplete ? new Date() : null,
          },
        })
      } else {
        // Update existing session
        attendanceSession = await tx.attendanceSession.update({
          where: { id: attendanceSession.id },
          data: {
            entryMode: validated.entryMode,
            isComplete: validated.isComplete,
            completedAt: validated.isComplete ? new Date() : null,
          },
        })
      }

      // Upsert attendance records
      for (const record of validated.records) {
        await tx.attendanceRecord.upsert({
          where: {
            sessionId_studentProfileId: {
              sessionId: attendanceSession.id,
              studentProfileId: record.studentProfileId,
            },
          },
          update: {
            status: record.status,
            notes: record.notes,
          },
          create: {
            sessionId: attendanceSession.id,
            studentProfileId: record.studentProfileId,
            status: record.status,
            notes: record.notes,
            recordedBy: userSession!.user.id,
          },
        })
      }

      // Fetch the updated session with records
      return tx.attendanceSession.findUnique({
        where: { id: attendanceSession.id },
        include: {
          grade: { select: { id: true, name: true } },
          records: {
            include: {
              studentProfile: {
                include: {
                  person: {
                    select: { firstName: true, lastName: true },
                  },
                },
              },
            },
          },
          recorder: { select: { id: true, name: true } },
        },
      })
    })

    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error submitting batch attendance:", err)
    return NextResponse.json(
      { message: "Failed to submit attendance" },
      { status: 500 }
    )
  }
}
