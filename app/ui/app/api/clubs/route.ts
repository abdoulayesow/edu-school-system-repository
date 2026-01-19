import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { ClubStatus } from "@prisma/client"
import { resolveClubLeaders, getLeaderKey } from "@/lib/club-helpers"

/**
 * GET /api/clubs
 * List active clubs and eligible students for enrollment
 * Query params:
 *   - view: "clubs" | "students" (default: clubs)
 *   - categoryId: filter by category
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("classes", "view")
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const view = searchParams.get("view") || "clubs"
    const categoryId = searchParams.get("categoryId")

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

      // Get students with completed enrollments who can join clubs (with pagination)
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
                    clubEnrollments: {
                      where: {
                        club: { schoolYearId: currentSchoolYear.id },
                        status: "active",
                      },
                      include: {
                        club: {
                          select: { id: true, name: true, categoryId: true },
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
          clubEnrollments: e.student!.studentProfile!.clubEnrollments,
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

    // Default: get clubs with pagination
    const clubsWhere = {
      schoolYearId: currentSchoolYear.id,
      status: { in: ["active", "closed"] as ClubStatus[] },
      isEnabled: true,
      ...(categoryId && { categoryId }),
    }

    const [clubs, total] = await Promise.all([
      prisma.club.findMany({
        where: clubsWhere,
        orderBy: [{ category: { order: "asc" } }, { name: "asc" }],
        include: {
          category: {
            select: { id: true, name: true, nameFr: true },
          },
          eligibilityRule: {
            include: {
              gradeRules: {
                include: {
                  grade: {
                    select: { id: true, name: true, order: true },
                  },
                },
              },
            },
          },
          _count: {
            select: { enrollments: { where: { status: "active" } } },
          },
        },
        take: limit,
        skip: offset,
      }),
      prisma.club.count({ where: clubsWhere }),
    ])

    // Resolve polymorphic leaders
    const leaderMap = await resolveClubLeaders(clubs)

    // Attach resolved leaders to clubs
    const clubsWithLeaders = clubs.map(club => ({
      ...club,
      leader: leaderMap.get(getLeaderKey(club.leaderId, club.leaderType)!) || null,
    }))

    return NextResponse.json({
      clubs: clubsWithLeaders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + clubs.length < total,
      },
    })
  } catch (err) {
    console.error("Error fetching clubs data:", err)
    return NextResponse.json(
      { message: "Failed to fetch data" },
      { status: 500 }
    )
  }
}
