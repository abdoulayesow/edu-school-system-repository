import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import type { Prisma } from "@prisma/client"

const assignStudentSchema = z.object({
  studentProfileId: z.string().min(1, "Student profile ID is required"),
  gradeRoomId: z.string().min(1, "Room ID is required"),
  schoolYearId: z.string().min(1, "School year ID is required"),
})

const bulkAssignSchema = z.object({
  assignments: z.array(z.object({
    studentProfileId: z.string().min(1),
    gradeRoomId: z.string().min(1),
  })).min(1, "At least one assignment is required"),
  schoolYearId: z.string().min(1, "School year ID is required"),
})

/**
 * GET /api/admin/room-assignments
 * List room assignments or unassigned students
 * Query params:
 *   - gradeId: Filter by grade (required for unassigned students)
 *   - schoolYearId: Filter by school year (required)
 *   - unassigned: If "true", show only unassigned students
 *   - roomId: Filter by room
 */
export async function GET(req: NextRequest) {
  const { error } = await requireRole(["director", "academic_director", "secretary"])
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const gradeId = searchParams.get("gradeId")
    const schoolYearId = searchParams.get("schoolYearId")
    const unassigned = searchParams.get("unassigned") === "true"
    const roomId = searchParams.get("roomId")

    if (!schoolYearId) {
      return NextResponse.json(
        { message: "School year ID is required" },
        { status: 400 }
      )
    }

    if (unassigned) {
      if (!gradeId) {
        return NextResponse.json(
          { message: "Grade ID is required when fetching unassigned students" },
          { status: 400 }
        )
      }

      // Get students enrolled in this grade but not assigned to a room
      const enrolledStudents = await prisma.enrollment.findMany({
        where: {
          gradeId,
          schoolYearId,
          status: "completed", // Only approved enrollments
        },
        select: {
          studentId: true,
          firstName: true,
          lastName: true,
          student: {
            include: {
              studentProfile: true,
            },
          },
        },
      })

      // Get students already assigned to rooms
      const assignedStudentIds = await prisma.studentRoomAssignment.findMany({
        where: {
          schoolYearId,
          isActive: true,
          gradeRoom: {
            gradeId,
          },
        },
        select: {
          studentProfileId: true,
        },
      })

      const assignedIds = new Set(assignedStudentIds.map(a => a.studentProfileId))

      // Filter to get unassigned students, deduplicating by studentProfile.id
      // (handles edge case where a student has multiple enrollment records)
      const studentMap = new Map<string, { id: string; firstName: string; lastName: string; studentNumber?: string | null }>()

      enrolledStudents
        .filter(e => e.student?.studentProfile && !assignedIds.has(e.student.studentProfile.id))
        .forEach(e => {
          const profileId = e.student!.studentProfile!.id
          if (!studentMap.has(profileId)) {
            studentMap.set(profileId, {
              id: profileId,
              firstName: e.firstName,
              lastName: e.lastName,
              studentNumber: e.student?.studentProfile?.studentNumber,
            })
          }
        })

      const unassignedStudents = Array.from(studentMap.values())

      return NextResponse.json(unassignedStudents)
    }

    // Return room assignments
    const whereClause: Prisma.StudentRoomAssignmentWhereInput = {
      schoolYearId,
      isActive: true,
    }

    if (roomId) {
      whereClause.gradeRoomId = roomId
    }

    if (gradeId) {
      whereClause.gradeRoom = { gradeId }
    }

    const assignments = await prisma.studentRoomAssignment.findMany({
      where: whereClause,
      include: {
        studentProfile: {
          include: {
            person: true,
          },
        },
        gradeRoom: {
          include: {
            grade: true,
          },
        },
        assigner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        assignedAt: "desc",
      },
    })

    return NextResponse.json(assignments)
  } catch (err) {
    console.error("Error fetching room assignments:", err)
    return NextResponse.json(
      { message: "Failed to fetch room assignments" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/room-assignments
 * Assign student(s) to a room
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(["director", "secretary"])
  if (error) return error
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Check if it's bulk or single assignment
    if (body.assignments && Array.isArray(body.assignments)) {
      // Bulk assignment
      const validated = bulkAssignSchema.parse(body)

      // Verify school year
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
          { message: "Cannot assign students in a passed school year" },
          { status: 400 }
        )
      }

      const results = []
      const errors = []

      for (const assignment of validated.assignments) {
        // Check if student is already assigned
        const existing = await prisma.studentRoomAssignment.findFirst({
          where: {
            studentProfileId: assignment.studentProfileId,
            schoolYearId: validated.schoolYearId,
            isActive: true,
          },
        })

        if (existing) {
          errors.push({
            studentProfileId: assignment.studentProfileId,
            error: "Student already assigned to a room",
          })
          continue
        }

        // Verify room exists and check capacity
        const room = await prisma.gradeRoom.findUnique({
          where: { id: assignment.gradeRoomId },
          include: {
            _count: {
              select: { studentAssignments: { where: { isActive: true } } },
            },
          },
        })

        if (!room) {
          errors.push({
            studentProfileId: assignment.studentProfileId,
            error: "Room not found",
          })
          continue
        }

        if (room._count.studentAssignments >= room.capacity) {
          errors.push({
            studentProfileId: assignment.studentProfileId,
            error: "Room is at full capacity",
          })
          continue
        }

        const created = await prisma.studentRoomAssignment.create({
          data: {
            studentProfileId: assignment.studentProfileId,
            gradeRoomId: assignment.gradeRoomId,
            schoolYearId: validated.schoolYearId,
            assignedBy: session.user.id,
          },
        })

        results.push(created)
      }

      return NextResponse.json({
        created: results,
        errors,
      }, { status: 201 })
    } else {
      // Single assignment
      const validated = assignStudentSchema.parse(body)

      // Verify school year
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
          { message: "Cannot assign students in a passed school year" },
          { status: 400 }
        )
      }

      // Check if student is already assigned for this school year
      const existing = await prisma.studentRoomAssignment.findFirst({
        where: {
          studentProfileId: validated.studentProfileId,
          schoolYearId: validated.schoolYearId,
          isActive: true,
        },
      })

      if (existing) {
        return NextResponse.json(
          { message: "Student is already assigned to a room for this school year" },
          { status: 400 }
        )
      }

      // Verify room exists and check capacity
      const room = await prisma.gradeRoom.findUnique({
        where: { id: validated.gradeRoomId },
        include: {
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

      if (room._count.studentAssignments >= room.capacity) {
        return NextResponse.json(
          { message: "Room is at full capacity" },
          { status: 400 }
        )
      }

      const assignment = await prisma.studentRoomAssignment.create({
        data: {
          studentProfileId: validated.studentProfileId,
          gradeRoomId: validated.gradeRoomId,
          schoolYearId: validated.schoolYearId,
          assignedBy: session.user.id,
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

      return NextResponse.json(assignment, { status: 201 })
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error assigning student to room:", err)
    return NextResponse.json(
      { message: "Failed to assign student to room" },
      { status: 500 }
    )
  }
}
