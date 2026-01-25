import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePerm } from "@/lib/session-helpers"

/**
 * GET /api/admin/student-leaders
 *
 * Fetch students eligible to be club leaders.
 * Optionally restricted to middle and high school students for leadership responsibilities.
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("students", "view")
  if (error) return error

  try {
    // Fetch active students, optionally filtered by grade level
    const students = await prisma.studentProfile.findMany({
      where: {
        studentStatus: 'active',
        // Optional: Uncomment to restrict to middle/high school students only
        // currentGrade: {
        //   level: { in: ['middle', 'high'] }
        // },
      },
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          }
        },
        currentGrade: {
          select: {
            name: true,
            level: true
          }
        }
      },
      orderBy: {
        person: { lastName: 'asc' }
      },
      take: 500, // Match other endpoints
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('[student-leaders] Failed to fetch students:', error)
    return NextResponse.json(
      { message: 'Failed to fetch student leaders' },
      { status: 500 }
    )
  }
}
