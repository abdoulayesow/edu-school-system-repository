import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/timetable
 * Get timetable data: grades with subjects and teacher assignments
 * Query params: gradeId (optional), schoolYearId (optional), gradeRoomId (optional)
 *
 * - If gradeRoomId provided: returns full weekly schedule for that section
 * - If gradeId provided: returns subjects for that grade
 * - Otherwise: returns all grades
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("schedule", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const gradeId = searchParams.get("gradeId")
  const gradeRoomId = searchParams.get("gradeRoomId")
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
      return NextResponse.json({ grades: [], subjects: [] })
    }

    // If gradeRoomId provided, get full weekly schedule for that section
    if (gradeRoomId) {
      const gradeRoom = await prisma.gradeRoom.findUnique({
        where: { id: gradeRoomId },
        include: {
          grade: {
            select: {
              id: true,
              name: true,
              level: true,
              schoolYearId: true,
            },
          },
        },
      })

      if (!gradeRoom) {
        return NextResponse.json(
          { message: "Grade room not found" },
          { status: 404 }
        )
      }

      // Get all time periods for the school year
      const timePeriods = await prisma.timePeriod.findMany({
        where: {
          schoolYearId: gradeRoom.grade.schoolYearId,
          isActive: true,
        },
        orderBy: { order: "asc" },
      })

      // Get all schedule slots for this grade room
      const scheduleSlots = await prisma.scheduleSlot.findMany({
        where: { gradeRoomId },
        include: {
          timePeriod: true,
          gradeSubject: {
            include: {
              subject: true,
            },
          },
          teacherProfile: {
            include: {
              person: true,
            },
          },
        },
      })

      // Organize schedule by day of week
      const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const
      const weeklySchedule = days.map((day) => {
        const daySlots = scheduleSlots.filter((slot) => slot.dayOfWeek === day)

        // Create a map of timePeriodId to slot
        const slotMap = new Map(daySlots.map((slot) => [slot.timePeriodId, slot]))

        // For each time period, find the corresponding slot or mark as empty
        const periods = timePeriods.map((period) => {
          const slot = slotMap.get(period.id)

          if (slot) {
            return {
              timePeriodId: period.id,
              timePeriod: {
                name: period.name,
                nameFr: period.nameFr,
                startTime: period.startTime,
                endTime: period.endTime,
                order: period.order,
              },
              slot: {
                id: slot.id,
                subject: slot.gradeSubject
                  ? {
                      id: slot.gradeSubject.id,
                      name: slot.gradeSubject.subject.nameFr,
                      code: slot.gradeSubject.subject.code,
                    }
                  : null,
                teacher: slot.teacherProfile?.person
                  ? {
                      id: slot.teacherProfile.id,
                      name: `${slot.teacherProfile.person.firstName} ${slot.teacherProfile.person.lastName}`,
                    }
                  : null,
                roomLocation: slot.roomLocation,
                isBreak: slot.isBreak,
                notes: slot.notes,
              },
            }
          } else {
            // Empty slot
            return {
              timePeriodId: period.id,
              timePeriod: {
                name: period.name,
                nameFr: period.nameFr,
                startTime: period.startTime,
                endTime: period.endTime,
                order: period.order,
              },
              slot: null,
            }
          }
        })

        return {
          day,
          periods,
        }
      })

      return NextResponse.json({
        gradeRoom: {
          id: gradeRoom.id,
          displayName: gradeRoom.displayName,
          grade: gradeRoom.grade,
        },
        timePeriods,
        weeklySchedule,
      })
    }

    // If gradeId provided, get subjects for that grade
    if (gradeId) {
      const gradeSubjects = await prisma.gradeSubject.findMany({
        where: { gradeId },
        include: {
          subject: true,
          classAssignments: {
            where: { schoolYearId: activeSchoolYearId },
            include: {
              teacherProfile: {
                include: {
                  person: true,
                },
              },
            },
          },
        },
      })

      // Sort by subject name
      gradeSubjects.sort((a, b) => a.subject.nameFr.localeCompare(b.subject.nameFr))

      const subjects = gradeSubjects.map((gs) => {
        const assignment = gs.classAssignments[0]
        const teacher = assignment?.teacherProfile?.person
        return {
          id: gs.id,
          subjectId: gs.subjectId,
          name: gs.subject.nameFr,
          code: gs.subject.code,
          coefficient: gs.coefficient,
          hoursPerWeek: gs.hoursPerWeek || 0,
          teacher: teacher
            ? {
                id: assignment.teacherProfile!.id,
                name: `${teacher.firstName} ${teacher.lastName}`,
              }
            : null,
        }
      })

      // Get grade info
      const grade = await prisma.grade.findUnique({
        where: { id: gradeId },
        include: {
          gradeLeader: {
            include: {
              person: true,
            },
          },
          _count: {
            select: { enrollments: { where: { status: "completed" } } },
          },
        },
      })

      return NextResponse.json({
        grade: grade
          ? {
              id: grade.id,
              name: grade.name,
              level: grade.level,
              studentCount: grade._count.enrollments,
              leader: grade.gradeLeader?.person
                ? `${grade.gradeLeader.person.firstName} ${grade.gradeLeader.person.lastName}`
                : null,
            }
          : null,
        subjects,
        totalHours: subjects.reduce((sum, s) => sum + s.hoursPerWeek, 0),
      })
    }

    // Otherwise, get all grades with basic info
    const grades = await prisma.grade.findMany({
      where: { schoolYearId: activeSchoolYearId },
      include: {
        _count: {
          select: {
            enrollments: { where: { status: "completed" } },
            subjects: true,
          },
        },
      },
      orderBy: { order: "asc" },
    })

    return NextResponse.json({
      grades: grades.map((g) => ({
        id: g.id,
        name: g.name,
        level: g.level,
        studentCount: g._count.enrollments,
        subjectCount: g._count.subjects,
      })),
    })
  } catch (err) {
    console.error("Error fetching timetable:", err)
    return NextResponse.json(
      { message: "Failed to fetch timetable" },
      { status: 500 }
    )
  }
}
