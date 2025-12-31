import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

const createRoomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  displayName: z.string().optional(),
  capacity: z.number().int().min(1).default(35),
  isActive: z.boolean().default(true),
})

/**
 * GET /api/admin/grades/[id]/rooms
 * List all rooms for a grade
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director", "academic_director"])
  if (error) return error

  const { id: gradeId } = await params

  try {
    // Verify grade exists
    const grade = await prisma.grade.findUnique({
      where: { id: gradeId },
    })

    if (!grade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    const rooms = await prisma.gradeRoom.findMany({
      where: { gradeId },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { studentAssignments: { where: { isActive: true } } },
        },
      },
    })

    return NextResponse.json(rooms)
  } catch (err) {
    console.error("Error fetching rooms:", err)
    return NextResponse.json(
      { message: "Failed to fetch rooms" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/grades/[id]/rooms
 * Create a new room for a grade
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director", "academic_director"])
  if (error) return error

  const { id: gradeId } = await params

  try {
    const grade = await prisma.grade.findUnique({
      where: { id: gradeId },
      include: {
        schoolYear: true,
      },
    })

    if (!grade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    // Cannot add rooms to passed school years
    if (grade.schoolYear.status === "passed") {
      return NextResponse.json(
        { message: "Cannot add rooms to grades in a passed school year" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = createRoomSchema.parse(body)

    // Check for duplicate room name
    const existingRoom = await prisma.gradeRoom.findFirst({
      where: {
        gradeId,
        name: validated.name,
      },
    })

    if (existingRoom) {
      return NextResponse.json(
        { message: `Room "${validated.name}" already exists for this grade` },
        { status: 400 }
      )
    }

    // Check capacity constraint: sum of room capacities cannot exceed grade capacity
    const existingRooms = await prisma.gradeRoom.findMany({
      where: { gradeId },
      select: { capacity: true },
    })
    const totalAllocated = existingRooms.reduce((sum, r) => sum + r.capacity, 0)
    const newTotal = totalAllocated + validated.capacity

    if (newTotal > grade.capacity) {
      const available = grade.capacity - totalAllocated
      return NextResponse.json(
        {
          message: `Room capacity (${validated.capacity}) would exceed grade limit. Available capacity: ${available}`,
          gradeCapacity: grade.capacity,
          allocatedCapacity: totalAllocated,
          availableCapacity: available,
          requestedCapacity: validated.capacity,
        },
        { status: 400 }
      )
    }

    // Generate display name if not provided
    const displayName = validated.displayName || `${grade.name} ${validated.name}`

    const room = await prisma.gradeRoom.create({
      data: {
        gradeId,
        name: validated.name,
        displayName,
        capacity: validated.capacity,
        isActive: validated.isActive,
      },
      include: {
        _count: {
          select: { studentAssignments: { where: { isActive: true } } },
        },
      },
    })

    return NextResponse.json(room, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating room:", err)
    return NextResponse.json(
      { message: "Failed to create room" },
      { status: 500 }
    )
  }
}
