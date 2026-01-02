import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { ActivityStatus } from "@prisma/client"

/**
 * GET /api/activities
 * List active activities and eligible students for enrollment
 * Query params:
 *   - view: "activities" | "students" (default: activities)
 *   - type: filter by activity type
 */
export async function GET(req: NextRequest) {
  const { error } = await requireRole(["director", "academic_director", "accountant", "secretary"])
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const view = searchParams.get("view") || "activities"
    const type = searchParams.get("type")

    // Pagination params
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const offset = parseInt(searchParams.get("offset") || "0")

    // Get current school year
    const currentSchoolYear = await prisma.schoolYear.findFirst({
      where: { isActive: true },
    })

    if (!currentSchoolYear) {
      return NextResponse.json(
        { message: "No active school year" },
        { status: 400 }
      )
    }

    if (view === "students") {
      // Build where clause for students query
      const studentsWhere = {
        schoolYearId: currentSchoolYear.id,
        status: "completed" as const,
        student: {
          studentProfile: { isNot: null },
        },
      }

      // Get students with completed enrollments who can join activities (with pagination)
      const [students, total] = await Promise.all([
        prisma.enrollment.findMany({
          where: studentsWhere,
          include: {
            student: {
              include: {
                studentProfile: {
                  include: {
                    person: {
                      select: { firstName: true, lastName: true },
                    },
                    activityEnrollments: {
                      where: {
                        activity: { schoolYearId: currentSchoolYear.id },
                        status: "active",
                      },
                      include: {
                        activity: {
                          select: { id: true, name: true, type: true },
                        },
                      },
                    },
                  },
                },
              },
            },
            grade: {
              select: { id: true, name: true, order: true },
            },
          },
          orderBy: [
            { grade: { order: "asc" } },
            { lastName: "asc" },
            { firstName: "asc" },
          ],
          take: limit,
          skip: offset,
        }),
        prisma.enrollment.count({ where: studentsWhere }),
      ])

      // Transform to simpler structure
      const eligibleStudents = students
        .filter((e) => e.student?.studentProfile)
        .map((e) => ({
          enrollmentId: e.id,
          studentProfileId: e.student!.studentProfile!.id,
          firstName: e.firstName,
          lastName: e.lastName,
          studentNumber: e.student?.studentProfile?.studentNumber,
          grade: e.grade,
          activityEnrollments: e.student!.studentProfile!.activityEnrollments,
        }))

      return NextResponse.json({
        students: eligibleStudents,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + students.length < total,
        },
      })
    }

    // Default: get activities with pagination
    const activitiesWhere = {
      schoolYearId: currentSchoolYear.id,
      status: { in: ["active", "closed"] as ActivityStatus[] },
      isEnabled: true,
      ...(type && { type: type as "club" | "sport" | "arts" | "academic" | "other" }),
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: activitiesWhere,
        orderBy: [{ type: "asc" }, { name: "asc" }],
        include: {
          _count: {
            select: { enrollments: { where: { status: "active" } } },
          },
        },
        take: limit,
        skip: offset,
      }),
      prisma.activity.count({ where: activitiesWhere }),
    ])

    return NextResponse.json({
      activities,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + activities.length < total,
      },
    })
  } catch (err) {
    console.error("Error fetching activities data:", err)
    return NextResponse.json(
      { message: "Failed to fetch data" },
      { status: 500 }
    )
  }
}
