import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string; roomId: string }>
}

const updateRoomSchema = z.object({
  name: z.string().min(1).optional(),
  displayName: z.string().optional(),
  capacity: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
})

/**
 * GET /api/admin/grades/[id]/rooms/[roomId]
 * Get a specific room with student count
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director", "academic_director"])
  if (error) return error

  const { id: gradeId, roomId } = await params

  try {
    const room = await prisma.gradeRoom.findFirst({
      where: {
        id: roomId,
        gradeId,
      },
      include: {
        grade: {
          include: {
            schoolYear: true,
          },
        },
        studentAssignments: {
          where: { isActive: true },
          include: {
            studentProfile: {
              include: {
                person: true,
              },
            },
          },
        },
        _count: {
          select: { studentAssignments: { where: { isActive: true } } },
        },
      },
    })

    if (!room) {
      return NextResponse.json(
        { message: "Room not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(room)
  } catch (err) {
    console.error("Error fetching room:", err)
    return NextResponse.json(
      { message: "Failed to fetch room" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/grades/[id]/rooms/[roomId]
 * Update a room
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director", "academic_director"])
  if (error) return error

  const { id: gradeId, roomId } = await params

  try {
    const room = await prisma.gradeRoom.findFirst({
      where: {
        id: roomId,
        gradeId,
      },
      include: {
        grade: {
          include: {
            schoolYear: true,
          },
        },
      },
    })

    if (!room) {
      return NextResponse.json(
        { message: "Room not found" },
        { status: 404 }
      )
    }

    // Cannot modify rooms in passed school years
    if (room.grade.schoolYear.status === "passed") {
      return NextResponse.json(
        { message: "Cannot modify rooms in a passed school year" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = updateRoomSchema.parse(body)

    // If name is changing, check for duplicates
    if (validated.name && validated.name !== room.name) {
      const existingRoom = await prisma.gradeRoom.findFirst({
        where: {
          gradeId,
          name: validated.name,
          id: { not: roomId },
        },
      })

      if (existingRoom) {
        return NextResponse.json(
          { message: `Room "${validated.name}" already exists for this grade` },
          { status: 400 }
        )
      }
    }

    const updatedRoom = await prisma.gradeRoom.update({
      where: { id: roomId },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.displayName && { displayName: validated.displayName }),
        ...(validated.capacity !== undefined && { capacity: validated.capacity }),
        ...(validated.isActive !== undefined && { isActive: validated.isActive }),
      },
      include: {
        _count: {
          select: { studentAssignments: { where: { isActive: true } } },
        },
      },
    })

    return NextResponse.json(updatedRoom)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating room:", err)
    return NextResponse.json(
      { message: "Failed to update room" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/grades/[id]/rooms/[roomId]
 * Delete a room
 *
 * Query params:
 * - targetRoomId: Move all students to this room before deleting
 * - removeAssignments: If "true", soft-delete all assignments before deleting room
 *
 * If room has students and neither param is provided, returns error with student count
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireRole(["director"])
  if (error) return error

  const { id: gradeId, roomId } = await params
  const { searchParams } = new URL(req.url)
  const targetRoomId = searchParams.get("targetRoomId")
  const removeAssignments = searchParams.get("removeAssignments") === "true"

  try {
    const room = await prisma.gradeRoom.findFirst({
      where: {
        id: roomId,
        gradeId,
      },
      include: {
        grade: {
          include: {
            schoolYear: true,
          },
        },
        studentAssignments: {
          where: { isActive: true },
          select: { id: true, studentProfileId: true },
        },
        _count: {
          select: { studentAssignments: { where: { isActive: true } } },
        },
      },
    })

    if (!room) {
      return NextResponse.json(
        { message: "Room not found" },
        { status: 404 }
      )
    }

    // Cannot delete rooms from passed school years
    if (room.grade.schoolYear.status === "passed") {
      return NextResponse.json(
        { message: "Cannot delete rooms from a passed school year" },
        { status: 400 }
      )
    }

    const activeStudentCount = room._count.studentAssignments

    // If room has students and no action specified, return error with count
    if (activeStudentCount > 0 && !targetRoomId && !removeAssignments) {
      return NextResponse.json(
        {
          message: "Room has active student assignments",
          studentCount: activeStudentCount,
          requiresAction: true
        },
        { status: 400 }
      )
    }

    // If moving students to another room
    if (targetRoomId && activeStudentCount > 0) {
      // Validate target room exists and is in the same grade
      const targetRoom = await prisma.gradeRoom.findFirst({
        where: {
          id: targetRoomId,
          gradeId,
          isActive: true,
        },
        include: {
          _count: {
            select: { studentAssignments: { where: { isActive: true } } },
          },
        },
      })

      if (!targetRoom) {
        return NextResponse.json(
          { message: "Target room not found or not in the same grade" },
          { status: 400 }
        )
      }

      // Check target room capacity
      const newTotal = targetRoom._count.studentAssignments + activeStudentCount
      if (newTotal > targetRoom.capacity) {
        return NextResponse.json(
          {
            message: `Target room would exceed capacity (${newTotal}/${targetRoom.capacity})`,
            currentOccupancy: targetRoom._count.studentAssignments,
            studentsToMove: activeStudentCount,
            capacity: targetRoom.capacity
          },
          { status: 400 }
        )
      }

      // Move students in a transaction
      await prisma.$transaction(async (tx) => {
        // Update all active assignments to point to the new room
        await tx.studentRoomAssignment.updateMany({
          where: {
            gradeRoomId: roomId,
            isActive: true,
          },
          data: {
            gradeRoomId: targetRoomId,
            assignedBy: session!.user!.id,
            assignedAt: new Date(),
          },
        })

        // Delete the original room
        await tx.gradeRoom.delete({
          where: { id: roomId },
        })
      })

      return NextResponse.json({
        message: "Students moved and room deleted successfully",
        studentsMoved: activeStudentCount
      })
    }

    // If removing assignments (soft delete)
    if (removeAssignments && activeStudentCount > 0) {
      await prisma.$transaction(async (tx) => {
        // Soft delete all active assignments
        await tx.studentRoomAssignment.updateMany({
          where: {
            gradeRoomId: roomId,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        })

        // Delete the room
        await tx.gradeRoom.delete({
          where: { id: roomId },
        })
      })

      return NextResponse.json({
        message: "Assignments removed and room deleted successfully",
        assignmentsRemoved: activeStudentCount
      })
    }

    // No students, just delete the room
    await prisma.gradeRoom.delete({
      where: { id: roomId },
    })

    return NextResponse.json({ message: "Room deleted successfully" })
  } catch (err) {
    console.error("Error deleting room:", err)
    return NextResponse.json(
      { message: "Failed to delete room" },
      { status: 500 }
    )
  }
}
