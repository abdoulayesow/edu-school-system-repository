import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { TrimesterDecision } from "@prisma/client"

const calculateSummarySchema = z.object({
  trimesterId: z.string().min(1, "Trimester is required"),
  gradeId: z.string().optional(),
  studentProfileId: z.string().optional(),
})

/**
 * Calculate decision based on general average
 * >= 10: Admis (Promoted)
 * 8-10: Rattrapage (Remediation)
 * < 8: Redouble (Repeat Year)
 */
function calculateDecision(average: number): TrimesterDecision {
  if (average >= 10) return "admis"
  if (average >= 8) return "rattrapage"
  return "redouble"
}

/**
 * POST /api/evaluations/student-summary
 * Calculate and store student trimester summaries (general average, rank, decision)
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requirePerm("report_cards", "create")
  if (error) return error

  const startTime = Date.now()
  let calculationLog: { id: string } | null = null

  try {
    const body = await req.json()
    const validated = calculateSummarySchema.parse(body)

    // Verify trimester exists
    const trimester = await prisma.trimester.findUnique({
      where: { id: validated.trimesterId },
      include: {
        schoolYear: true,
      },
    })

    if (!trimester) {
      return NextResponse.json(
        { message: "Trimester not found" },
        { status: 404 }
      )
    }

    // Create calculation log entry
    calculationLog = await prisma.calculationLog.create({
      data: {
        trimesterId: validated.trimesterId,
        userId: session!.user.id,
        type: "student_summaries",
        status: "running",
      },
    })

    // Get all subject averages for this trimester
    const subjectAverages = await prisma.subjectTrimesterAverage.findMany({
      where: {
        trimesterId: validated.trimesterId,
        ...(validated.gradeId && { gradeSubject: { gradeId: validated.gradeId } }),
        ...(validated.studentProfileId && { studentProfileId: validated.studentProfileId }),
        average: { not: null },
      },
      include: {
        gradeSubject: {
          include: {
            grade: true,
          },
        },
        studentProfile: true,
      },
    })

    if (subjectAverages.length === 0) {
      return NextResponse.json(
        { message: "No subject averages found. Calculate subject averages first.", count: 0 },
        { status: 200 }
      )
    }

    // Group by student and grade
    const studentGradeAverages = new Map<string, {
      studentProfileId: string
      gradeId: string
      averages: Array<{ average: number; coefficient: number }>
    }>()

    subjectAverages.forEach((avg) => {
      if (avg.average === null) return

      const key = `${avg.studentProfileId}:${avg.gradeSubject.gradeId}`
      const existing = studentGradeAverages.get(key)

      if (existing) {
        existing.averages.push({
          average: avg.average,
          coefficient: avg.gradeSubject.coefficient,
        })
      } else {
        studentGradeAverages.set(key, {
          studentProfileId: avg.studentProfileId,
          gradeId: avg.gradeSubject.gradeId,
          averages: [{
            average: avg.average,
            coefficient: avg.gradeSubject.coefficient,
          }],
        })
      }
    })

    // Calculate general averages
    const studentSummaries: Array<{
      studentProfileId: string
      gradeId: string
      generalAverage: number
    }> = []

    studentGradeAverages.forEach((data) => {
      let totalWeightedAverage = 0
      let totalCoefficients = 0

      data.averages.forEach(({ average, coefficient }) => {
        totalWeightedAverage += average * coefficient
        totalCoefficients += coefficient
      })

      const generalAverage = totalCoefficients > 0
        ? Math.round((totalWeightedAverage / totalCoefficients) * 100) / 100
        : 0

      studentSummaries.push({
        studentProfileId: data.studentProfileId,
        gradeId: data.gradeId,
        generalAverage,
      })
    })

    // Group by grade to calculate rankings
    const gradeGroups = new Map<string, typeof studentSummaries>()
    studentSummaries.forEach((summary) => {
      const existing = gradeGroups.get(summary.gradeId) || []
      existing.push(summary)
      gradeGroups.set(summary.gradeId, existing)
    })

    // Calculate ranks within each grade
    const rankedSummaries: Array<{
      studentProfileId: string
      trimesterId: string
      generalAverage: number
      rank: number
      totalStudents: number
      decision: TrimesterDecision
    }> = []

    gradeGroups.forEach((students, gradeId) => {
      // Sort by general average descending
      students.sort((a, b) => b.generalAverage - a.generalAverage)

      students.forEach((student, index) => {
        rankedSummaries.push({
          studentProfileId: student.studentProfileId,
          trimesterId: validated.trimesterId,
          generalAverage: student.generalAverage,
          rank: index + 1,
          totalStudents: students.length,
          decision: calculateDecision(student.generalAverage),
        })
      })
    })

    // Upsert all student trimester summaries
    const results = await prisma.$transaction(
      rankedSummaries.map((summary) =>
        prisma.studentTrimester.upsert({
          where: {
            studentProfileId_trimesterId: {
              studentProfileId: summary.studentProfileId,
              trimesterId: summary.trimesterId,
            },
          },
          update: {
            generalAverage: summary.generalAverage,
            rank: summary.rank,
            totalStudents: summary.totalStudents,
            decision: summary.decision,
            calculatedAt: new Date(),
          },
          create: {
            studentProfileId: summary.studentProfileId,
            trimesterId: summary.trimesterId,
            generalAverage: summary.generalAverage,
            rank: summary.rank,
            totalStudents: summary.totalStudents,
            decision: summary.decision,
            calculatedAt: new Date(),
          },
        })
      )
    )

    // Calculate class statistics
    const classStats: Array<{
      gradeId: string
      trimesterId: string
      totalStudents: number
      classAverage: number
      highestAverage: number
      lowestAverage: number
      passCount: number
      passRate: number
    }> = []

    gradeGroups.forEach((students, gradeId) => {
      const averages = students.map((s) => s.generalAverage)
      const passCount = averages.filter((a) => a >= 10).length

      classStats.push({
        gradeId,
        trimesterId: validated.trimesterId,
        totalStudents: students.length,
        classAverage: Math.round((averages.reduce((a, b) => a + b, 0) / averages.length) * 100) / 100,
        highestAverage: Math.max(...averages),
        lowestAverage: Math.min(...averages),
        passCount,
        passRate: Math.round((passCount / students.length) * 10000) / 100,
      })
    })

    // Upsert class statistics
    await prisma.$transaction(
      classStats.map((stats) =>
        prisma.classTrimesterStats.upsert({
          where: {
            gradeId_trimesterId: {
              gradeId: stats.gradeId,
              trimesterId: stats.trimesterId,
            },
          },
          update: {
            totalStudents: stats.totalStudents,
            classAverage: stats.classAverage,
            highestAverage: stats.highestAverage,
            lowestAverage: stats.lowestAverage,
            passCount: stats.passCount,
            passRate: stats.passRate,
            calculatedAt: new Date(),
          },
          create: {
            gradeId: stats.gradeId,
            trimesterId: stats.trimesterId,
            totalStudents: stats.totalStudents,
            classAverage: stats.classAverage,
            highestAverage: stats.highestAverage,
            lowestAverage: stats.lowestAverage,
            passCount: stats.passCount,
            passRate: stats.passRate,
            calculatedAt: new Date(),
          },
        })
      )
    )

    // Complete calculation log
    if (calculationLog) {
      await prisma.calculationLog.update({
        where: { id: calculationLog.id },
        data: {
          status: "completed",
          studentsProcessed: results.length,
          summariesCalculated: results.length,
          durationMs: Date.now() - startTime,
          completedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      message: `Calculated summaries for ${results.length} students across ${classStats.length} grades`,
      studentsProcessed: results.length,
      studentCount: results.length,
      gradeCount: classStats.length,
    })
  } catch (err) {
    // Log calculation failure
    if (calculationLog) {
      await prisma.calculationLog.update({
        where: { id: calculationLog.id },
        data: {
          status: "failed",
          errorMessage: err instanceof Error ? err.message : "Unknown error",
          durationMs: Date.now() - startTime,
          completedAt: new Date(),
        },
      }).catch(console.error)
    }

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error calculating student summaries:", err)
    return NextResponse.json(
      { message: "Failed to calculate student summaries" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/evaluations/student-summary
 * Get student trimester summaries
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("report_cards", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const trimesterId = searchParams.get("trimesterId")
  const gradeId = searchParams.get("gradeId")
  const studentProfileId = searchParams.get("studentProfileId")

  if (!trimesterId) {
    return NextResponse.json(
      { message: "trimesterId is required" },
      { status: 400 }
    )
  }

  try {
    const summaries = await prisma.studentTrimester.findMany({
      where: {
        trimesterId,
        ...(studentProfileId && { studentProfileId }),
        ...(gradeId && {
          studentProfile: {
            currentGradeId: gradeId,
          },
        }),
      },
      include: {
        studentProfile: {
          include: {
            person: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            currentGrade: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        trimester: {
          select: {
            id: true,
            number: true,
            nameFr: true,
            nameEn: true,
          },
        },
      },
      orderBy: { rank: "asc" },
    })

    return NextResponse.json(
      summaries.map((s) => ({
        id: s.id,
        studentProfileId: s.studentProfileId,
        studentName: `${s.studentProfile.person.firstName} ${s.studentProfile.person.lastName}`,
        gradeId: s.studentProfile.currentGrade?.id,
        gradeName: s.studentProfile.currentGrade?.name,
        trimester: s.trimester,
        generalAverage: s.generalAverage,
        rank: s.rank,
        totalStudents: s.totalStudents,
        conduct: s.conduct,
        decision: s.decision,
        decisionOverride: s.decisionOverride,
        generalRemark: s.generalRemark,
        absences: s.absences,
        lates: s.lates,
        calculatedAt: s.calculatedAt,
      }))
    )
  } catch (err) {
    console.error("Error fetching student summaries:", err)
    return NextResponse.json(
      { message: "Failed to fetch student summaries" },
      { status: 500 }
    )
  }
}
