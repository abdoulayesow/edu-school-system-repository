import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

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
      // Get students with completed enrollments who can join activities
      const students = await prisma.enrollment.findMany({
        where: {
          schoolYearId: currentSchoolYear.id,
          status: "completed",
          student: {
            studentProfile: { isNot: null },
          },
        },
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
      })

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

      return NextResponse.json(eligibleStudents)
    }

    // Default: get activities
    const activities = await prisma.activity.findMany({
      where: {
        schoolYearId: currentSchoolYear.id,
        status: { in: ["active", "closed"] },
        isEnabled: true,
        ...(type && { type: type as "club" | "sport" | "arts" | "academic" | "other" }),
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { enrollments: { where: { status: "active" } } },
        },
      },
    })

    return NextResponse.json(activities)
  } catch (err) {
    console.error("Error fetching activities data:", err)
    return NextResponse.json(
      { message: "Failed to fetch data" },
      { status: 500 }
    )
  }
}
