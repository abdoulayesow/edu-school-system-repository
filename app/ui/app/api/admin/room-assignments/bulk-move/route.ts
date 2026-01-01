import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bulkMoveSchema = z.object({
  studentProfileIds: z.array(z.string().min(1)).min(1, "At least one student is required"),
  targetRoomId: z.string().min(1, "Target room ID is required"),
  schoolYearId: z.string().min(1, "School year ID is required"),
})

/**
 * POST /api/admin/room-assignments/bulk-move
 * Move multiple students from their current rooms to a target room
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(["director", "secretary"])
  if (error) return error

  try {
    const body = await req.json()
    const validated = bulkMoveSchema.parse(body)

    // Validate school year is not passed
    const schoolYear = await prisma.schoolYear.findUnique({
      where: { id: validated.schoolYearId },
    })

    if (!schoolYear) {
      return NextResponse.json(
        { message: "School year not found" },
        { status: 404 }
      )
    }

    if (schoolYear.status === "passed") {
      return NextResponse.json(
        { message: "Cannot modify assignments in a passed school year" },
        { status: 400 }
      )
    }

    // Validate target room exists and is active
    const targetRoom = await prisma.gradeRoom.findFirst({
      where: {
        id: validated.targetRoomId,
        isActive: true,
      },
      include: {
        grade: true,
        _count: {
          select: { studentAssignments: { where: { isActive: true } } },
        },
      },
    })

    if (!targetRoom) {
      return NextResponse.json(
        { message: "Target room not found or inactive" },
        { status: 404 }
      )
    }

    // Check capacity
    const studentsToMove = validated.studentProfileIds.length
    const availableCapacity = targetRoom.capacity - targetRoom._count.studentAssignments
    if (studentsToMove > availableCapacity) {
      return NextResponse.json(
        {
          message: `Target room has insufficient capacity. Available: ${availableCapacity}, Requested: ${studentsToMove}`,
          availableCapacity,
          requestedCount: studentsToMove,
        },
        { status: 400 }
      )
    }

    // Get current assignments for these students
    const currentAssignments = await prisma.studentRoomAssignment.findMany({
      where: {
        studentProfileId: { in: validated.studentProfileIds },
        schoolYearId: validated.schoolYearId,
        isActive: true,
      },
      include: {
        gradeRoom: {
          include: {
            grade: true,
          },
        },
      },
    })

    // Validate all students are from the same grade as target room
    const invalidAssignments = currentAssignments.filter(
      a => a.gradeRoom.gradeId !== targetRoom.gradeId
    )

    if (invalidAssignments.length > 0) {
      return NextResponse.json(
        {
          message: "Some students are not in the same grade as the target room",
          invalidCount: invalidAssignments.length,
        },
        { status: 400 }
      )
    }

    // Students with existing assignments - update them
    const studentsWithAssignments = new Set(currentAssignments.map(a => a.studentProfileId))

    // Students without assignments - need to create new ones
    const studentsWithoutAssignments = validated.studentProfileIds.filter(
      id => !studentsWithAssignments.has(id)
    )

    // Perform the move in a transaction
    const result = await prisma.$transaction(async (tx) => {
      let updated = 0
      let created = 0

      // Update existing assignments
      if (currentAssignments.length > 0) {
        const updateResult = await tx.studentRoomAssignment.updateMany({
          where: {
            id: { in: currentAssignments.map(a => a.id) },
          },
          data: {
            gradeRoomId: validated.targetRoomId,
            assignedBy: session!.user!.id,
            assignedAt: new Date(),
          },
        })
        updated = updateResult.count
      }

      // Create new assignments for students without one
      if (studentsWithoutAssignments.length > 0) {
        const newAssignments = studentsWithoutAssignments.map(studentProfileId => ({
          studentProfileId,
          gradeRoomId: validated.targetRoomId,
          schoolYearId: validated.schoolYearId,
          assignedBy: session!.user!.id,
          isActive: true,
        }))

        const createResult = await tx.studentRoomAssignment.createMany({
          data: newAssignments,
        })
        created = createResult.count
      }

      return { updated, created }
    })

    return NextResponse.json({
      message: "Students moved successfully",
      updated: result.updated,
      created: result.created,
      total: result.updated + result.created,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error in bulk move:", err)
    return NextResponse.json(
      { message: "Failed to move students" },
      { status: 500 }
    )
  }
}
