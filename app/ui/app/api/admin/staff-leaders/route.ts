import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePerm } from "@/lib/session-helpers"

/**
 * GET /api/admin/staff-leaders
 *
 * Fetch non-teaching staff members eligible to be club leaders.
 * Excludes users with teaching roles (enseignant, professeur_principal).
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("staff_assignment", "view")
  if (error) return error

  try {
    const staff = await prisma.user.findMany({
      where: {
        status: 'active',
        staffRole: { not: null },
        // Exclude teaching roles (they appear in /api/admin/teachers)
        NOT: {
          staffRole: {
            in: ['enseignant', 'professeur_principal']
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        staffRole: true,
        image: true,
      },
      orderBy: { name: 'asc' },
      take: 500, // Match the teachers endpoint limit
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('[staff-leaders] Failed to fetch staff:', error)
    return NextResponse.json(
      { message: 'Failed to fetch staff leaders' },
      { status: 500 }
    )
  }
}
