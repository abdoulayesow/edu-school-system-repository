import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

type RouteParams = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/time-periods/[id]
 * Get a single time period by ID
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession()
  if (error) return error

  try {
    const { id } = await params

    const timePeriod = await prisma.timePeriod.findUnique({
      where: { id },
      include: {
        schoolYear: {
          select: { id: true, name: true, isActive: true },
        },
        _count: {
          select: { scheduleSlots: true },
        },
      },
    })

    if (!timePeriod) {
      return NextResponse.json(
        { message: "Time period not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ timePeriod })
  } catch (err) {
    console.error("Error fetching time period:", err)
    return NextResponse.json(
      { message: "Failed to fetch time period" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/time-periods/[id]
 * Update a time period
 * Body: { name?, nameFr?, startTime?, endTime?, order?, isActive? }
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession()
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json()
    const { name, nameFr, startTime, endTime, order, isActive } = body

    // Validate time format if provided
    if (startTime || endTime) {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
      if (startTime && !timeRegex.test(startTime)) {
        return NextResponse.json(
          { message: "Invalid startTime format. Use HH:MM (24-hour format)" },
          { status: 400 }
        )
      }
      if (endTime && !timeRegex.test(endTime)) {
        return NextResponse.json(
          { message: "Invalid endTime format. Use HH:MM (24-hour format)" },
          { status: 400 }
        )
      }
    }

    // Get current time period
    const currentPeriod = await prisma.timePeriod.findUnique({
      where: { id },
    })

    if (!currentPeriod) {
      return NextResponse.json(
        { message: "Time period not found" },
        { status: 404 }
      )
    }

    // Determine final start and end times
    const finalStartTime = startTime || currentPeriod.startTime
    const finalEndTime = endTime || currentPeriod.endTime

    // Validate start time is before end time
    if (finalStartTime >= finalEndTime) {
      return NextResponse.json(
        { message: "Start time must be before end time" },
        { status: 400 }
      )
    }

    // Check for overlapping time periods (excluding current period)
    const existingPeriods = await prisma.timePeriod.findMany({
      where: {
        schoolYearId: currentPeriod.schoolYearId,
        id: { not: id },
      },
      select: { id: true, startTime: true, endTime: true, name: true },
    })

    for (const period of existingPeriods) {
      const newStart = finalStartTime
      const newEnd = finalEndTime
      const existingStart = period.startTime
      const existingEnd = period.endTime

      if (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      ) {
        return NextResponse.json(
          {
            message: `Time period overlaps with existing period: ${period.name} (${period.startTime}-${period.endTime})`,
            conflict: period
          },
          { status: 400 }
        )
      }
    }

    const timePeriod = await prisma.timePeriod.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(nameFr !== undefined && { nameFr }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ timePeriod })
  } catch (err: any) {
    console.error("Error updating time period:", err)

    // Handle unique constraint violation
    if (err.code === "P2002") {
      return NextResponse.json(
        { message: "A time period with this order already exists for this school year" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { message: "Failed to update time period" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/time-periods/[id]
 * Delete a time period (cascades to schedule slots)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession()
  if (error) return error

  try {
    const { id } = await params

    // Check if time period exists
    const timePeriod = await prisma.timePeriod.findUnique({
      where: { id },
      include: {
        _count: {
          select: { scheduleSlots: true },
        },
      },
    })

    if (!timePeriod) {
      return NextResponse.json(
        { message: "Time period not found" },
        { status: 404 }
      )
    }

    // Delete time period (will cascade to schedule slots)
    await prisma.timePeriod.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Time period deleted successfully",
      deletedScheduleSlots: timePeriod._count.scheduleSlots,
    })
  } catch (err) {
    console.error("Error deleting time period:", err)
    return NextResponse.json(
      { message: "Failed to delete time period" },
      { status: 500 }
    )
  }
}
