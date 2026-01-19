import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { resolveClubLeaders, getLeaderKey } from "@/lib/club-helpers"

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/clubs/[id]
 * Get a single club by ID
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("classes", "view")
  if (error) return error

  try {
    const { id } = await params

    const club = await prisma.club.findUnique({
      where: { id },
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
    })

    if (!club) {
      return NextResponse.json(
        { message: "Club not found" },
        { status: 404 }
      )
    }

    // Resolve polymorphic leader
    const leaderMap = await resolveClubLeaders([club])
    const leader = leaderMap.get(getLeaderKey(club.leaderId, club.leaderType)!) || null

    return NextResponse.json({
      ...club,
      leader,
    })
  } catch (err) {
    console.error("Error fetching club:", err)
    return NextResponse.json(
      { message: "Failed to fetch club" },
      { status: 500 }
    )
  }
}
