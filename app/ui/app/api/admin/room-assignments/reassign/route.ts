import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const reassignSchema = z.object({
  studentProfileId: z.string().min(1, "Student profile ID is required"),
  newRoomId: z.string().min(1, "New room ID is required"),
  schoolYearId: z.string().optional(),
})

/**
 * POST /api/admin/room-assignments/reassign
 * Reassign a single student to a different room
 * - Updates existing assignment if one exists
 * - Creates new assignment if none exists
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requirePerm("schedule", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validated = reassignSchema.parse(body)

    // Get school year ID - use active if not provided
    let schoolYearId = validated.schoolYearId
    if (!schoolYearId) {
      const activeYear = await prisma.schoolYear.findFirst({
        where: { isActive: true },
        select: { id: true, status: true },
      })
      if (!activeYear) {
        return NextResponse.json(
          { message: "No active school year found" },
          { status: 400 }
        )
      }
      if (activeYear.status === "passed") {
        return NextResponse.json(
          { message: "Cannot modify assignments in a passed school year" },
          { status: 400 }
        )
      }
      schoolYearId = activeYear.id
    } else {
      // Validate provided school year
      const schoolYear = await prisma.schoolYear.findUnique({
        where: { id: schoolYearId },
        select: { status: true },
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
    }

    // Validate student profile exists
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: validated.studentProfileId },
      include: {
        person: { select: { firstName: true, lastName: true } },
        currentGrade: { select: { id: true, name: true } },
      },
    })

    if (!studentProfile) {
      return NextResponse.json(
        { message: "Student profile not found" },
        { status: 404 }
      )
    }

    // Validate target room exists and get capacity info
    const targetRoom = await prisma.gradeRoom.findUnique({
      where: { id: validated.newRoomId },
      include: {
        grade: { select: { id: true, name: true } },
        _count: {
          select: { studentAssignments: { where: { isActive: true } } },
        },
      },
    })

    if (!targetRoom) {
      return NextResponse.json(
        { message: "Target room not found" },
        { status: 404 }
      )
    }

    if (!targetRoom.isActive) {
      return NextResponse.json(
        { message: "Target room is not active" },
        { status: 400 }
      )
    }

    // Check if student is in the correct grade for this room
    if (studentProfile.currentGradeId !== targetRoom.grade.id) {
      return NextResponse.json(
        {
          message: `Student is in ${studentProfile.currentGrade?.name || "unknown grade"}, but room ${targetRoom.displayName} belongs to ${targetRoom.grade.name}`,
        },
        { status: 400 }
      )
    }

    // Check for existing assignment
    const existingAssignment = await prisma.studentRoomAssignment.findFirst({
      where: {
        studentProfileId: validated.studentProfileId,
        schoolYearId,
        isActive: true,
      },
      include: {
        gradeRoom: { select: { id: true, displayName: true } },
      },
    })

    // If already assigned to the same room, nothing to do
    if (existingAssignment?.gradeRoomId === validated.newRoomId) {
      return NextResponse.json({
        message: "Student is already assigned to this room",
        assignment: existingAssignment,
      })
    }

    // Check target room capacity
    // If updating existing assignment, we don't count the student's current spot
    const currentOccupancy = targetRoom._count.studentAssignments
    const effectiveOccupancy = existingAssignment?.gradeRoomId === targetRoom.id
      ? currentOccupancy
      : currentOccupancy

    if (effectiveOccupancy >= targetRoom.capacity) {
      return NextResponse.json(
        {
          message: `Room ${targetRoom.displayName} is at capacity (${currentOccupancy}/${targetRoom.capacity})`,
          roomCapacity: targetRoom.capacity,
          currentOccupancy,
        },
        { status: 400 }
      )
    }

    // Perform the reassignment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // If there's an existing assignment, update it
      if (existingAssignment) {
        return tx.studentRoomAssignment.update({
          where: { id: existingAssignment.id },
          data: {
            gradeRoomId: validated.newRoomId,
            assignedAt: new Date(),
            assignedBy: session!.user!.id,
          },
          include: {
            gradeRoom: { select: { id: true, displayName: true } },
            studentProfile: {
              include: {
                person: { select: { firstName: true, lastName: true } },
              },
            },
          },
        })
      }

      // Otherwise, create a new assignment
      return tx.studentRoomAssignment.create({
        data: {
          studentProfileId: validated.studentProfileId,
          gradeRoomId: validated.newRoomId,
          schoolYearId,
          assignedBy: session!.user!.id,
          isActive: true,
        },
        include: {
          gradeRoom: { select: { id: true, displayName: true } },
          studentProfile: {
            include: {
              person: { select: { firstName: true, lastName: true } },
            },
          },
        },
      })
    })

    return NextResponse.json({
      message: existingAssignment
        ? `Student moved from ${existingAssignment.gradeRoom.displayName} to ${result.gradeRoom.displayName}`
        : `Student assigned to ${result.gradeRoom.displayName}`,
      assignment: result,
      previousRoom: existingAssignment?.gradeRoom || null,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error reassigning student:", err)
    return NextResponse.json(
      { message: "Failed to reassign student" },
      { status: 500 }
    )
  }
}
