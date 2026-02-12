import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/evaluations/calculation-history
 *
 * Returns the calculation history for the active trimester.
 * Shows the last 10 calculation runs with user info and metrics.
 */
export async function GET(req: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  try {
    // Get active school year and trimester
    const activeSchoolYear = await prisma.schoolYear.findFirst({
      where: { isActive: true },
      include: {
        trimesters: {
          where: { isActive: true },
          take: 1,
        },
      },
    })

    if (!activeSchoolYear || activeSchoolYear.trimesters.length === 0) {
      return NextResponse.json({ history: [] })
    }

    const activeTrimester = activeSchoolYear.trimesters[0]

    // Fetch last 10 calculation logs for this trimester
    const calculationLogs = await prisma.calculationLog.findMany({
      where: {
        trimesterId: activeTrimester.id,
      },
      orderBy: {
        startedAt: "desc",
      },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Transform to API response format
    const history = calculationLogs.map((log) => ({
      id: log.id,
      type: log.type,
      status: log.status,
      userName: log.user.name || log.user.email || "Unknown",
      studentsProcessed: log.studentsProcessed,
      averagesCalculated: log.averagesCalculated,
      summariesCalculated: log.summariesCalculated,
      durationMs: log.durationMs,
      errorMessage: log.errorMessage,
      startedAt: log.startedAt.toISOString(),
      completedAt: log.completedAt?.toISOString() || null,
    }))

    return NextResponse.json({ history })
  } catch (err) {
    console.error("Error fetching calculation history:", err)
    return NextResponse.json(
      { message: "Failed to fetch calculation history" },
      { status: 500 }
    )
  }
}
