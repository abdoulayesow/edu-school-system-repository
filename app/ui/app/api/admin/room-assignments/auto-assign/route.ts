import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requirePerm } from "@/lib/authz"
import { autoAssignStudents, StudentForAssignment, RoomForAssignment } from "@/lib/utils/room-auto-assignment"

// ============================================================================
// POST /api/admin/room-assignments/auto-assign
// Auto-assign unassigned students to rooms with balanced distribution
// ============================================================================

const autoAssignSchema = z.object({
  gradeId: z.string().min(1, "Grade ID is required"),
  schoolYearId: z.string().min(1, "School year ID is required"),
  roomIds: z.array(z.string()).min(1, "At least one room must be selected")
})

export async function POST(req: NextRequest) {
  try {
    // Require director or secretary role
    const { session, error } = await requirePerm("schedule", "create")
    if (error) return error

    const body = await req.json()

    // Validate request body
    const validationResult = autoAssignSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { gradeId, schoolYearId, roomIds } = validationResult.data

    // Verify school year exists and is not "passed"
    const schoolYear = await prisma.schoolYear.findUnique({
      where: { id: schoolYearId },
      select: { id: true, status: true }
    })

    if (!schoolYear) {
      return NextResponse.json(
        { error: "School year not found" },
        { status: 404 }
      )
    }

    if (schoolYear.status === "passed") {
      return NextResponse.json(
        { error: "Cannot modify assignments for a passed school year" },
        { status: 400 }
      )
    }

    // Verify all rooms belong to the grade
    const rooms = await prisma.gradeRoom.findMany({
      where: {
        id: { in: roomIds },
        gradeId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        capacity: true,
        studentAssignments: {
          where: {
            schoolYearId,
            isActive: true
          },
          select: { id: true }
        }
      }
    })

    if (rooms.length !== roomIds.length) {
      return NextResponse.json(
        { error: "One or more rooms not found or inactive" },
        { status: 404 }
      )
    }

    // Get enrolled students for this grade
    const enrolledStudents = await prisma.enrollment.findMany({
      where: {
        gradeId,
        schoolYearId,
        status: "completed"
      },
      select: {
        studentId: true,
        firstName: true,
        lastName: true,
        gender: true,
        dateOfBirth: true,
        student: {
          select: {
            studentProfile: {
              select: {
                id: true,
                studentNumber: true,
                isLockedForAutoAssign: true,
                person: {
                  select: {
                    gender: true,
                    dateOfBirth: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Get grade enrollments for enrollment dates
    const gradeEnrollments = await prisma.gradeEnrollment.findMany({
      where: {
        gradeId,
        schoolYearId,
        status: "active"
      },
      select: {
        studentProfileId: true,
        enrolledAt: true
      }
    })

    const enrollmentDateMap = new Map(
      gradeEnrollments.map((e: { studentProfileId: string; enrolledAt: Date }) => [e.studentProfileId, e.enrolledAt])
    )

    // Get existing assignments
    const existingAssignments = await prisma.studentRoomAssignment.findMany({
      where: {
        gradeRoom: { gradeId },
        schoolYearId,
        isActive: true
      },
      select: {
        studentProfileId: true
      }
    })

    const assignedStudentIds = new Set(
      existingAssignments.map((a: { studentProfileId: string }) => a.studentProfileId)
    )

    // Build unassigned students list with all required data
    const unassignedStudents: StudentForAssignment[] = []

    for (const enrollment of enrolledStudents) {
      const profile = enrollment.student?.studentProfile
      if (!profile) continue
      if (assignedStudentIds.has(profile.id)) continue

      // Use gender and DOB from Person, fallback to Enrollment
      const gender = profile.person?.gender || enrollment.gender as 'male' | 'female' | undefined
      const dateOfBirth = profile.person?.dateOfBirth || enrollment.dateOfBirth || undefined

      const enrollmentDate = enrollmentDateMap.get(profile.id) || new Date()

      unassignedStudents.push({
        id: profile.id,
        firstName: enrollment.firstName,
        lastName: enrollment.lastName,
        studentNumber: profile.studentNumber || undefined,
        gender,
        dateOfBirth,
        enrollmentDate,
        isLocked: profile.isLockedForAutoAssign
      })
    }

    // Build rooms list
    const roomsForAssignment: RoomForAssignment[] = rooms.map((room: typeof rooms[0]) => ({
      id: room.id,
      name: room.name,
      displayName: room.displayName,
      capacity: room.capacity,
      currentCount: room.studentAssignments.length
    }))

    // Run auto-assignment algorithm
    const result = autoAssignStudents(unassignedStudents, roomsForAssignment)

    if (result.assignments.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No students to assign",
        result: {
          totalStudents: unassignedStudents.length,
          assignedCount: 0,
          unassignedCount: unassignedStudents.length,
          balanceReport: result.balanceReport
        }
      })
    }

    // Create assignments in database using transaction to prevent race conditions
    const createdAssignments = await prisma.$transaction(async (tx) => {
      // Re-check for existing assignments inside transaction (fresh data)
      const existingInTx = await tx.studentRoomAssignment.findMany({
        where: {
          studentProfileId: { in: result.assignments.map(a => a.studentProfileId) },
          schoolYearId,
          isActive: true
        },
        select: { studentProfileId: true }
      })

      const alreadyAssigned = new Set(existingInTx.map(a => a.studentProfileId))

      // Filter out already assigned students (prevents duplicates from concurrent requests)
      const safeAssignments = result.assignments.filter(
        a => !alreadyAssigned.has(a.studentProfileId)
      )

      if (safeAssignments.length === 0) {
        return { count: 0, assignments: [] }
      }

      // Create assignments atomically
      const created = await tx.studentRoomAssignment.createMany({
        data: safeAssignments.map(assignment => ({
          studentProfileId: assignment.studentProfileId,
          gradeRoomId: assignment.gradeRoomId,
          schoolYearId,
          assignedBy: session!.user.id,
          assignedAt: new Date(),
          isActive: true
        })),
        skipDuplicates: true // Extra safety
      })

      return { count: created.count, assignments: safeAssignments }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully auto-assigned ${createdAssignments.count} student(s)`,
      result: {
        totalStudents: unassignedStudents.length,
        assignedCount: createdAssignments.count,
        unassignedCount: result.unassignedStudents.length + (result.assignments.length - createdAssignments.count),
        balanceReport: result.balanceReport
      }
    })

  } catch (error) {
    console.error("[AUTO-ASSIGN API]", error)

    // Handle unique constraint violation (P2002)
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({
        error: "Some students are already assigned",
        details: "Race condition detected, please retry the operation"
      }, { status: 409 })
    }

    // Sanitize error message in production
    return NextResponse.json(
      {
        error: "Failed to auto-assign students",
        details: process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.message
          : "An unexpected error occurred"
      },
      { status: 500 }
    )
  }
}
