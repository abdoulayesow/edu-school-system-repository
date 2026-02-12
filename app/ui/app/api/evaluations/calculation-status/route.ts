import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/evaluations/calculation-status
 *
 * Returns the calculation status for the active trimester:
 * - Last calculation timestamp
 * - Pending evaluations (entered after last calculation)
 * - Whether recalculation is needed
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
      return NextResponse.json({
        hasActiveTrimester: false,
        lastSubjectAveragesCalculation: null,
        lastStudentSummariesCalculation: null,
        pendingEvaluationsCount: 0,
        needsRecalculation: false,
        activeTrimesterName: null,
      })
    }

    const activeTrimester = activeSchoolYear.trimesters[0]

    // Get the most recent subject average calculation time
    const lastSubjectAverage = await prisma.subjectTrimesterAverage.findFirst({
      where: { trimesterId: activeTrimester.id },
      orderBy: { calculatedAt: "desc" },
      select: { calculatedAt: true },
    })

    // Get the most recent student summary calculation time
    const lastStudentSummary = await prisma.studentTrimester.findFirst({
      where: { trimesterId: activeTrimester.id },
      orderBy: { calculatedAt: "desc" },
      select: { calculatedAt: true },
    })

    // Get the last calculation time (either subject averages or summaries, whichever is newer)
    const lastCalculationTime =
      lastSubjectAverage?.calculatedAt && lastStudentSummary?.calculatedAt
        ? new Date(Math.max(
            lastSubjectAverage.calculatedAt.getTime(),
            lastStudentSummary.calculatedAt.getTime()
          ))
        : lastSubjectAverage?.calculatedAt || lastStudentSummary?.calculatedAt || null

    // Count evaluations entered after the last calculation
    let pendingEvaluationsCount = 0
    if (lastCalculationTime) {
      pendingEvaluationsCount = await prisma.evaluation.count({
        where: {
          trimesterId: activeTrimester.id,
          createdAt: { gt: lastCalculationTime },
        },
      })
    } else {
      // If never calculated, count all evaluations for this trimester
      pendingEvaluationsCount = await prisma.evaluation.count({
        where: { trimesterId: activeTrimester.id },
      })
    }

    // Get total evaluations and calculated averages counts for context
    const totalEvaluations = await prisma.evaluation.count({
      where: { trimesterId: activeTrimester.id },
    })

    const calculatedAveragesCount = await prisma.subjectTrimesterAverage.count({
      where: {
        trimesterId: activeTrimester.id,
        calculatedAt: { not: null },
      },
    })

    const calculatedSummariesCount = await prisma.studentTrimester.count({
      where: {
        trimesterId: activeTrimester.id,
        calculatedAt: { not: null },
      },
    })

    // Determine if recalculation is needed
    const needsRecalculation = pendingEvaluationsCount > 0 ||
      (!lastSubjectAverage?.calculatedAt && totalEvaluations > 0)

    return NextResponse.json({
      hasActiveTrimester: true,
      activeTrimesterId: activeTrimester.id,
      activeTrimesterName: {
        en: activeTrimester.nameEn,
        fr: activeTrimester.nameFr,
      },
      lastSubjectAveragesCalculation: lastSubjectAverage?.calculatedAt || null,
      lastStudentSummariesCalculation: lastStudentSummary?.calculatedAt || null,
      pendingEvaluationsCount,
      totalEvaluations,
      calculatedAveragesCount,
      calculatedSummariesCount,
      needsRecalculation,
    })
  } catch (err) {
    console.error("Error fetching calculation status:", err)
    return NextResponse.json(
      { message: "Failed to fetch calculation status" },
      { status: 500 }
    )
  }
}
