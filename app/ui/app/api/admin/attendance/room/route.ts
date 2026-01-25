import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@db/prisma"
import { requirePerm } from "@/lib/authz"
import { z } from "zod"

const attendanceRecordSchema = z.object({
  studentProfileId: z.string().min(1, "Student profile ID is required"),
  status: z.enum(["present", "absent", "late", "excused"]),
  notes: z.string().optional(),
})

const saveAttendanceSchema = z.object({
  gradeRoomId: z.string().min(1, "Grade room ID is required"),
  date: z.string().transform(s => new Date(s)),
  entryMode: z.enum(["checklist", "absences_only"]).default("checklist"),
  records: z.array(attendanceRecordSchema).min(1, "At least one attendance record is required"),
})

export async function POST(req: NextRequest) {
  const { session, error } = await requirePerm("attendance", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validated = saveAttendanceSchema.parse(body)

    // Get grade from room
    const room = await prisma.gradeRoom.findUnique({
      where: { id: validated.gradeRoomId },
      select: { gradeId: true, name: true },
    })

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      )
    }

    // Normalize date to start of day (remove time component)
    const normalizedDate = new Date(validated.date)
    normalizedDate.setHours(0, 0, 0, 0)

    // Create/update attendance in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get or create session for this grade and date
      let attendanceSession = await tx.attendanceSession.findUnique({
        where: {
          gradeId_date: {
            gradeId: room.gradeId,
            date: normalizedDate,
          },
        },
      })

      if (!attendanceSession) {
        attendanceSession = await tx.attendanceSession.create({
          data: {
            gradeId: room.gradeId,
            date: normalizedDate,
            entryMode: validated.entryMode,
            recordedBy: session!.user.id,
          },
        })
      }

      // Upsert attendance records
      const upsertedRecords = await Promise.all(
        validated.records.map(async (record) => {
          return tx.attendanceRecord.upsert({
            where: {
              sessionId_studentProfileId: {
                sessionId: attendanceSession!.id,
                studentProfileId: record.studentProfileId,
              },
            },
            create: {
              sessionId: attendanceSession!.id,
              studentProfileId: record.studentProfileId,
              status: record.status,
              notes: record.notes,
              recordedBy: session!.user.id,
            },
            update: {
              status: record.status,
              notes: record.notes,
            },
          })
        })
      )

      // Update session to mark as complete if all students have records
      const totalRecords = await tx.attendanceRecord.count({
        where: { sessionId: attendanceSession.id },
      })

      // Get total students in the grade for this room
      const roomStudentCount = await tx.studentRoomAssignment.count({
        where: {
          gradeRoomId: validated.gradeRoomId,
          isActive: true,
        },
      })

      if (totalRecords >= roomStudentCount && roomStudentCount > 0) {
        await tx.attendanceSession.update({
          where: { id: attendanceSession.id },
          data: {
            isComplete: true,
            completedAt: new Date(),
          },
        })
      }

      return {
        session: attendanceSession,
        recordsCount: upsertedRecords.length,
      }
    })

    return NextResponse.json({
      success: true,
      sessionId: result.session.id,
      recordsCount: result.recordsCount,
      message: `Saved ${result.recordsCount} attendance record(s)`,
    })
  } catch (error) {
    console.error("[ATTENDANCE API]", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to save attendance" },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch attendance for a room on a specific date
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("attendance", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const gradeRoomId = searchParams.get("gradeRoomId")
  const dateStr = searchParams.get("date")

  if (!gradeRoomId || !dateStr) {
    return NextResponse.json(
      { error: "gradeRoomId and date are required" },
      { status: 400 }
    )
  }

  try {
    // Get room info
    const room = await prisma.gradeRoom.findUnique({
      where: { id: gradeRoomId },
      select: { gradeId: true, name: true },
    })

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      )
    }

    // Normalize date
    const date = new Date(dateStr)
    date.setHours(0, 0, 0, 0)

    // Find attendance session
    const session = await prisma.attendanceSession.findUnique({
      where: {
        gradeId_date: {
          gradeId: room.gradeId,
          date,
        },
      },
      include: {
        records: {
          include: {
            studentProfile: {
              include: {
                person: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json({
        session: null,
        records: [],
      })
    }

    return NextResponse.json({
      session: {
        id: session.id,
        date: session.date,
        entryMode: session.entryMode,
        isComplete: session.isComplete,
        completedAt: session.completedAt,
      },
      records: session.records.map(record => ({
        id: record.id,
        studentProfileId: record.studentProfileId,
        studentName: `${record.studentProfile.person.firstName} ${record.studentProfile.person.lastName}`,
        status: record.status,
        notes: record.notes,
      })),
    })
  } catch (error) {
    console.error("[ATTENDANCE GET API]", error)
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    )
  }
}
