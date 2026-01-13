import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@db/prisma"
import { requirePerm } from "@/lib/authz"

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("classes", "view")
  if (error) return error

  const { id: gradeId } = await params
  const { searchParams } = new URL(req.url)
  const schoolYearId = searchParams.get("schoolYearId")

  if (!schoolYearId) {
    return NextResponse.json(
      { error: "School year ID is required" },
      { status: 400 }
    )
  }

  try {
    // Fetch grade with rooms and their assigned students
    const grade = await prisma.grade.findUnique({
      where: { id: gradeId },
      include: {
        rooms: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          include: {
            studentAssignments: {
              where: {
                schoolYearId,
                isActive: true,
              },
              include: {
                studentProfile: {
                  include: {
                    person: {
                      select: {
                        firstName: true,
                        lastName: true,
                        gender: true,
                        dateOfBirth: true,
                        photoUrl: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!grade) {
      return NextResponse.json(
        { error: "Grade not found" },
        { status: 404 }
      )
    }

    // Fetch all students enrolled in this grade (via GradeEnrollment)
    const gradeEnrollments = await prisma.gradeEnrollment.findMany({
      where: {
        gradeId,
        schoolYearId,
        status: "active",
      },
      include: {
        studentProfile: {
          include: {
            person: {
              select: {
                firstName: true,
                lastName: true,
                gender: true,
                dateOfBirth: true,
                photoUrl: true,
              },
            },
            roomAssignments: {
              where: {
                schoolYearId,
                isActive: true,
              },
              take: 1,
            },
          },
        },
      },
    })

    // Build set of assigned student IDs
    const assignedStudentIds = new Set<string>()
    grade.rooms.forEach(room => {
      room.studentAssignments.forEach(assignment => {
        assignedStudentIds.add(assignment.studentProfileId)
      })
    })

    // Build rooms data structure
    const rooms = grade.rooms.map(room => ({
      id: room.id,
      name: room.name,
      displayName: room.displayName,
      capacity: room.capacity,
      students: room.studentAssignments.map(assignment => ({
        id: assignment.studentProfile.id,
        firstName: assignment.studentProfile.person.firstName,
        lastName: assignment.studentProfile.person.lastName,
        studentNumber: assignment.studentProfile.studentNumber,
        gender: assignment.studentProfile.person.gender,
        dateOfBirth: assignment.studentProfile.person.dateOfBirth,
        photoUrl: assignment.studentProfile.person.photoUrl,
        assignedAt: assignment.assignedAt,
        assignmentId: assignment.id,
      })),
    }))

    // Build unassigned students list
    const unassignedStudents = gradeEnrollments
      .filter(e => e.studentProfile && !assignedStudentIds.has(e.studentProfile.id))
      .map(e => ({
        id: e.studentProfile!.id,
        firstName: e.studentProfile!.person.firstName,
        lastName: e.studentProfile!.person.lastName,
        studentNumber: e.studentProfile!.studentNumber,
        gender: e.studentProfile!.person.gender,
        dateOfBirth: e.studentProfile!.person.dateOfBirth,
        photoUrl: e.studentProfile!.person.photoUrl,
        enrolledAt: e.enrolledAt,
      }))

    // Calculate statistics
    const totalEnrolled = gradeEnrollments.length
    const totalAssigned = assignedStudentIds.size
    const totalUnassigned = totalEnrolled - totalAssigned
    const totalCapacity = grade.rooms.reduce((sum, room) => sum + room.capacity, 0)
    const roomUtilization = totalCapacity > 0 ? Math.round((totalAssigned / totalCapacity) * 100) : 0

    return NextResponse.json({
      grade: {
        id: grade.id,
        name: grade.name,
        level: grade.level,
        capacity: grade.capacity,
      },
      rooms,
      unassignedStudents,
      stats: {
        totalEnrolled,
        totalAssigned,
        totalUnassigned,
        totalCapacity,
        roomUtilization,
      },
    })
  } catch (error) {
    console.error("[GRADE ROOM VIEW API]", error)
    return NextResponse.json(
      { error: "Failed to fetch grade room data" },
      { status: 500 }
    )
  }
}
