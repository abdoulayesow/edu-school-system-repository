import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/attendance/sessions/[id]/complete
 * Mark an attendance session as complete
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("attendance", "update")
  if (error) return error

  const { id } = await params

  try {
    const existingSession = await prisma.attendanceSession.findUnique({
      where: { id },
      include: {
        records: true,
        grade: {
          include: {
            enrollments: {
              where: { status: "completed" },
              include: {
                student: {
                  include: {
                    studentProfile: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!existingSession) {
      return NextResponse.json(
        { message: "Attendance session not found" },
        { status: 404 }
      )
    }

    if (existingSession.isComplete) {
      return NextResponse.json(
        { message: "Session is already complete" },
        { status: 400 }
      )
    }

    // If using checklist mode, auto-mark missing students as absent
    if (existingSession.entryMode === "checklist") {
      const recordedStudentIds = new Set(
        existingSession.records.map((r) => r.studentProfileId)
      )

      // Get all enrolled students' profiles
      const enrolledStudentProfileIds: string[] = []
      for (const enrollment of existingSession.grade.enrollments) {
        if (enrollment.student?.studentProfile?.id) {
          enrolledStudentProfileIds.push(enrollment.student.studentProfile.id)
        }
      }

      // Create records for missing students (mark as absent)
      const missingRecords = enrolledStudentProfileIds
        .filter((id) => !recordedStudentIds.has(id))
        .map((studentProfileId) => ({
          sessionId: id,
          studentProfileId,
          status: "absent" as const,
          notes: "Auto-marked as absent when session completed",
          recordedBy: session!.user.id,
        }))

      if (missingRecords.length > 0) {
        await prisma.attendanceRecord.createMany({
          data: missingRecords,
        })
      }
    }

    // Mark session as complete
    const updatedSession = await prisma.attendanceSession.update({
      where: { id },
      data: {
        isComplete: true,
        completedAt: new Date(),
      },
      include: {
        grade: {
          select: { id: true, name: true, level: true },
        },
        recorder: { select: { id: true, name: true } },
        _count: { select: { records: true } },
      },
    })

    return NextResponse.json(updatedSession)
  } catch (err) {
    console.error("Error completing attendance session:", err)
    return NextResponse.json(
      { message: "Failed to complete attendance session" },
      { status: 500 }
    )
  }
}
