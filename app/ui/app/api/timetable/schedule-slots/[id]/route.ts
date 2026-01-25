import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { validateScheduleSlot } from "@/lib/timetable/conflict-validator"
import { DayOfWeek } from "@prisma/client"

type RouteParams = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/timetable/schedule-slots/[id]
 * Get a single schedule slot by ID
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("schedule", "view")
  if (error) return error

  try {
    const { id } = await params

    const scheduleSlot = await prisma.scheduleSlot.findUnique({
      where: { id },
      include: {
        timePeriod: {
          include: {
            schoolYear: true,
          },
        },
        gradeRoom: {
          include: {
            grade: true,
          },
        },
        gradeSubject: {
          include: {
            subject: true,
          },
        },
        teacherProfile: {
          include: {
            person: true,
          },
        },
      },
    })

    if (!scheduleSlot) {
      return NextResponse.json(
        { message: "Schedule slot not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ scheduleSlot })
  } catch (err) {
    console.error("Error fetching schedule slot:", err)
    return NextResponse.json(
      { message: "Failed to fetch schedule slot" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/timetable/schedule-slots/[id]
 * Update a schedule slot with conflict validation
 * Body: { gradeSubjectId?, teacherProfileId?, roomLocation?, isBreak?, notes?, dayOfWeek?, timePeriodId? }
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("schedule", "view")
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json()
    const {
      gradeSubjectId,
      teacherProfileId,
      roomLocation,
      isBreak,
      notes,
      dayOfWeek,
      timePeriodId,
    } = body

    // Get current schedule slot
    const currentSlot = await prisma.scheduleSlot.findUnique({
      where: { id },
    })

    if (!currentSlot) {
      return NextResponse.json(
        { message: "Schedule slot not found" },
        { status: 404 }
      )
    }

    // Validate dayOfWeek if provided
    if (dayOfWeek) {
      const validDays: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
      if (!validDays.includes(dayOfWeek)) {
        return NextResponse.json(
          { message: `Invalid dayOfWeek. Must be one of: ${validDays.join(", ")}` },
          { status: 400 }
        )
      }
    }

    // Determine final values for conflict check
    const finalDayOfWeek = dayOfWeek || currentSlot.dayOfWeek
    const finalTimePeriodId = timePeriodId || currentSlot.timePeriodId
    const finalTeacherProfileId = teacherProfileId !== undefined ? teacherProfileId : currentSlot.teacherProfileId
    const finalRoomLocation = roomLocation !== undefined ? roomLocation : currentSlot.roomLocation
    const finalIsBreak = isBreak !== undefined ? isBreak : currentSlot.isBreak

    // Validate that if not a break, subject must be provided
    const finalGradeSubjectId = gradeSubjectId !== undefined ? gradeSubjectId : currentSlot.gradeSubjectId
    if (!finalIsBreak && !finalGradeSubjectId) {
      return NextResponse.json(
        { message: "gradeSubjectId is required for non-break slots" },
        { status: 400 }
      )
    }

    // Run conflict validation (excluding current slot)
    const conflicts = await validateScheduleSlot(
      {
        gradeRoomId: currentSlot.gradeRoomId,
        timePeriodId: finalTimePeriodId,
        dayOfWeek: finalDayOfWeek,
        teacherProfileId: finalTeacherProfileId,
        roomLocation: finalRoomLocation,
        isBreak: finalIsBreak,
      },
      id // Exclude current slot from conflict check
    )

    if (conflicts.length > 0) {
      return NextResponse.json(
        {
          message: "Schedule conflict detected",
          conflicts,
        },
        { status: 400 }
      )
    }

    // Update schedule slot
    const scheduleSlot = await prisma.scheduleSlot.update({
      where: { id },
      data: {
        ...(gradeSubjectId !== undefined && { gradeSubjectId }),
        ...(teacherProfileId !== undefined && { teacherProfileId }),
        ...(roomLocation !== undefined && { roomLocation }),
        ...(isBreak !== undefined && { isBreak }),
        ...(notes !== undefined && { notes }),
        ...(dayOfWeek !== undefined && { dayOfWeek }),
        ...(timePeriodId !== undefined && { timePeriodId }),
      },
      include: {
        timePeriod: true,
        gradeRoom: {
          include: {
            grade: true,
          },
        },
        gradeSubject: {
          include: {
            subject: true,
          },
        },
        teacherProfile: {
          include: {
            person: true,
          },
        },
      },
    })

    return NextResponse.json({ scheduleSlot })
  } catch (err: any) {
    console.error("Error updating schedule slot:", err)

    // Handle unique constraint violation
    if (err.code === "P2002") {
      return NextResponse.json(
        { message: "A schedule slot already exists for this time slot" },
        { status: 409 }
      )
    }

    // Handle foreign key constraint violation
    if (err.code === "P2003") {
      return NextResponse.json(
        { message: "Invalid reference to gradeSubject, teacherProfile, or timePeriod" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Failed to update schedule slot" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/timetable/schedule-slots/[id]
 * Delete a schedule slot
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("schedule", "view")
  if (error) return error

  try {
    const { id } = await params

    // Check if schedule slot exists
    const scheduleSlot = await prisma.scheduleSlot.findUnique({
      where: { id },
    })

    if (!scheduleSlot) {
      return NextResponse.json(
        { message: "Schedule slot not found" },
        { status: 404 }
      )
    }

    // Delete schedule slot
    await prisma.scheduleSlot.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Schedule slot deleted successfully",
    })
  } catch (err) {
    console.error("Error deleting schedule slot:", err)
    return NextResponse.json(
      { message: "Failed to delete schedule slot" },
      { status: 500 }
    )
  }
}
