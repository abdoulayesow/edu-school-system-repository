import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/time-periods
 * Get all time periods for a school year
 * Query params: schoolYearId (optional, defaults to active year)
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("schedule", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const schoolYearId = searchParams.get("schoolYearId")

  try {
    // Get school year
    let activeSchoolYearId = schoolYearId
    if (!activeSchoolYearId) {
      const activeYear = await prisma.schoolYear.findFirst({
        where: { isActive: true },
        select: { id: true },
      })
      activeSchoolYearId = activeYear?.id ?? null
    }

    if (!activeSchoolYearId) {
      return NextResponse.json({ timePeriods: [] })
    }

    const timePeriods = await prisma.timePeriod.findMany({
      where: { schoolYearId: activeSchoolYearId },
      orderBy: { order: "asc" },
    })

    return NextResponse.json({ timePeriods })
  } catch (err) {
    console.error("Error fetching time periods:", err)
    return NextResponse.json(
      { message: "Failed to fetch time periods" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/time-periods
 * Create a new time period
 * Body: { name, nameFr?, startTime, endTime, order, schoolYearId, isActive? }
 */
export async function POST(req: NextRequest) {
  const { error } = await requirePerm("schedule", "create")
  if (error) return error

  try {
    const body = await req.json()
    const { name, nameFr, startTime, endTime, order, schoolYearId, isActive } = body

    // Validate required fields
    if (!name || !startTime || !endTime || order === undefined || !schoolYearId) {
      return NextResponse.json(
        { message: "Missing required fields: name, startTime, endTime, order, schoolYearId" },
        { status: 400 }
      )
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { message: "Invalid time format. Use HH:MM (24-hour format)" },
        { status: 400 }
      )
    }

    // Validate start time is before end time
    if (startTime >= endTime) {
      return NextResponse.json(
        { message: "Start time must be before end time" },
        { status: 400 }
      )
    }

    // Check for overlapping time periods in the same school year
    const existingPeriods = await prisma.timePeriod.findMany({
      where: { schoolYearId },
      select: { id: true, startTime: true, endTime: true, name: true },
    })

    for (const period of existingPeriods) {
      // Check if new period overlaps with existing period
      const newStart = startTime
      const newEnd = endTime
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

    const timePeriod = await prisma.timePeriod.create({
      data: {
        name,
        nameFr: nameFr || null,
        startTime,
        endTime,
        order,
        schoolYearId,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({ timePeriod }, { status: 201 })
  } catch (err: any) {
    console.error("Error creating time period:", err)

    // Handle unique constraint violation
    if (err.code === "P2002") {
      return NextResponse.json(
        { message: "A time period with this order already exists for this school year" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { message: "Failed to create time period" },
      { status: 500 }
    )
  }
}
