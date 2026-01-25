import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { validateScheduleSlot } from "@/lib/timetable/conflict-validator"
import { DayOfWeek } from "@prisma/client"

/**
 * GET /api/timetable/schedule-slots
 * Get schedule slots with optional filtering
 * Query params: gradeRoomId?, schoolYearId?, dayOfWeek?
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("schedule", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const gradeRoomId = searchParams.get("gradeRoomId")
  const schoolYearId = searchParams.get("schoolYearId")
  const dayOfWeek = searchParams.get("dayOfWeek") as DayOfWeek | null

  try {
    // Build where clause
    const where: any = {}

    if (gradeRoomId) {
      where.gradeRoomId = gradeRoomId
    }

    if (schoolYearId) {
      where.timePeriod = {
        schoolYearId,
      }
    }

    if (dayOfWeek) {
      where.dayOfWeek = dayOfWeek
    }

    const scheduleSlots = await prisma.scheduleSlot.findMany({
      where,
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
      orderBy: [
        { dayOfWeek: "asc" },
        { timePeriod: { order: "asc" } },
      ],
    })

    // Transform data for easier frontend consumption
    const formattedSlots = scheduleSlots.map((slot) => ({
      id: slot.id,
      gradeRoomId: slot.gradeRoomId,
      gradeRoom: slot.gradeRoom,
      timePeriodId: slot.timePeriodId,
      timePeriod: slot.timePeriod,
      dayOfWeek: slot.dayOfWeek,
      subject: slot.gradeSubject
        ? {
            id: slot.gradeSubject.id,
            name: slot.gradeSubject.subject.nameFr,
            code: slot.gradeSubject.subject.code,
          }
        : null,
      teacher: slot.teacherProfile?.person
        ? {
            id: slot.teacherProfile.id,
            name: `${slot.teacherProfile.person.firstName} ${slot.teacherProfile.person.lastName}`,
          }
        : null,
      roomLocation: slot.roomLocation,
      isBreak: slot.isBreak,
      notes: slot.notes,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt,
    }))

    return NextResponse.json({ scheduleSlots: formattedSlots })
  } catch (err) {
    console.error("Error fetching schedule slots:", err)
    return NextResponse.json(
      { message: "Failed to fetch schedule slots" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/timetable/schedule-slots
 * Create a new schedule slot with conflict validation
 * Body: { gradeRoomId, timePeriodId, dayOfWeek, gradeSubjectId?, teacherProfileId?, roomLocation?, isBreak?, notes? }
 */
export async function POST(req: NextRequest) {
  const { error } = await requirePerm("schedule", "view")
  if (error) return error

  try {
    const body = await req.json()
    const {
      gradeRoomId,
      timePeriodId,
      dayOfWeek,
      gradeSubjectId,
      teacherProfileId,
      roomLocation,
      isBreak,
      notes,
    } = body

    // Validate required fields
    if (!gradeRoomId || !timePeriodId || !dayOfWeek) {
      return NextResponse.json(
        { message: "Missing required fields: gradeRoomId, timePeriodId, dayOfWeek" },
        { status: 400 }
      )
    }

    // Validate dayOfWeek enum
    const validDays: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    if (!validDays.includes(dayOfWeek)) {
      return NextResponse.json(
        { message: `Invalid dayOfWeek. Must be one of: ${validDays.join(", ")}` },
        { status: 400 }
      )
    }

    // Validate that if not a break, subject must be provided
    if (!isBreak && !gradeSubjectId) {
      return NextResponse.json(
        { message: "gradeSubjectId is required for non-break slots" },
        { status: 400 }
      )
    }

    // Validate that grade room exists
    const gradeRoom = await prisma.gradeRoom.findUnique({
      where: { id: gradeRoomId },
    })

    if (!gradeRoom) {
      return NextResponse.json(
        { message: "Grade room not found" },
        { status: 404 }
      )
    }

    // Validate that time period exists
    const timePeriod = await prisma.timePeriod.findUnique({
      where: { id: timePeriodId },
    })

    if (!timePeriod) {
      return NextResponse.json(
        { message: "Time period not found" },
        { status: 404 }
      )
    }

    // Run conflict validation
    const conflicts = await validateScheduleSlot({
      gradeRoomId,
      timePeriodId,
      dayOfWeek,
      teacherProfileId: teacherProfileId || null,
      roomLocation: roomLocation || null,
      isBreak: isBreak || false,
    })

    if (conflicts.length > 0) {
      return NextResponse.json(
        {
          message: "Schedule conflict detected",
          conflicts,
        },
        { status: 400 }
      )
    }

    // Create schedule slot
    const scheduleSlot = await prisma.scheduleSlot.create({
      data: {
        gradeRoomId,
        timePeriodId,
        dayOfWeek,
        gradeSubjectId: gradeSubjectId || null,
        teacherProfileId: teacherProfileId || null,
        roomLocation: roomLocation || null,
        isBreak: isBreak || false,
        notes: notes || null,
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

    return NextResponse.json({ scheduleSlot }, { status: 201 })
  } catch (err: any) {
    console.error("Error creating schedule slot:", err)

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
        { message: "Invalid reference to gradeSubject or teacherProfile" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Failed to create schedule slot" },
      { status: 500 }
    )
  }
}
