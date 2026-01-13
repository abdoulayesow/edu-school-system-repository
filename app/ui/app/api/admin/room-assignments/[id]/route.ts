import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateAssignmentSchema = z.object({
  gradeRoomId: z.string().min(1, "Room ID is required"),
})

/**
 * GET /api/admin/room-assignments/[id]
 * Get a specific room assignment
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("schedule", "view")
  if (error) return error

  const { id } = await params

  try {
    const assignment = await prisma.studentRoomAssignment.findUnique({
      where: { id },
      include: {
        studentProfile: {
          include: {
            person: true,
          },
        },
        gradeRoom: {
          include: {
            grade: {
              include: {
                schoolYear: true,
              },
            },
          },
        },
        schoolYear: true,
        assigner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { message: "Assignment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(assignment)
  } catch (err) {
    console.error("Error fetching assignment:", err)
    return NextResponse.json(
      { message: "Failed to fetch assignment" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/room-assignments/[id]
 * Change a student's room assignment
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("schedule", "update")
  if (error) return error

  const { id } = await params

  try {
    const assignment = await prisma.studentRoomAssignment.findUnique({
      where: { id },
      include: {
        schoolYear: true,
        gradeRoom: {
          include: {
            grade: true,
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { message: "Assignment not found" },
        { status: 404 }
      )
    }

    if (assignment.schoolYear.status === "passed") {
      return NextResponse.json(
        { message: "Cannot modify assignments in a passed school year" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = updateAssignmentSchema.parse(body)

    // Verify new room exists and is in the same grade
    const newRoom = await prisma.gradeRoom.findUnique({
      where: { id: validated.gradeRoomId },
      include: {
        _count: {
          select: { studentAssignments: { where: { isActive: true } } },
        },
      },
    })

    if (!newRoom) {
      return NextResponse.json(
        { message: "Room not found" },
        { status: 404 }
      )
    }

    // Check if room is in the same grade
    if (newRoom.gradeId !== assignment.gradeRoom.gradeId) {
      return NextResponse.json(
        { message: "Cannot move student to a room in a different grade" },
        { status: 400 }
      )
    }

    // Check capacity (exclude current assignment from count)
    if (newRoom._count.studentAssignments >= newRoom.capacity && newRoom.id !== assignment.gradeRoomId) {
      return NextResponse.json(
        { message: "Room is at full capacity" },
        { status: 400 }
      )
    }

    const updated = await prisma.studentRoomAssignment.update({
      where: { id },
      data: {
        gradeRoomId: validated.gradeRoomId,
        assignedBy: session!.user.id,
        assignedAt: new Date(),
      },
      include: {
        studentProfile: {
          include: {
            person: true,
          },
        },
        gradeRoom: true,
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating assignment:", err)
    return NextResponse.json(
      { message: "Failed to update assignment" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/room-assignments/[id]
 * Remove a room assignment
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("schedule", "delete")
  if (error) return error

  const { id } = await params

  try {
    const assignment = await prisma.studentRoomAssignment.findUnique({
      where: { id },
      include: {
        schoolYear: true,
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { message: "Assignment not found" },
        { status: 404 }
      )
    }

    if (assignment.schoolYear.status === "passed") {
      return NextResponse.json(
        { message: "Cannot remove assignments from a passed school year" },
        { status: 400 }
      )
    }

    // Soft delete by setting isActive to false
    await prisma.studentRoomAssignment.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: "Assignment removed successfully" })
  } catch (err) {
    console.error("Error removing assignment:", err)
    return NextResponse.json(
      { message: "Failed to remove assignment" },
      { status: 500 }
    )
  }
}
