import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const calculateAveragesSchema = z.object({
  trimesterId: z.string().min(1, "Trimester is required"),
  gradeId: z.string().optional(),
  gradeSubjectId: z.string().optional(),
  studentProfileId: z.string().optional(),
})

// Evaluation type coefficients
const TYPE_COEFFICIENTS: Record<string, number> = {
  interrogation: 1,
  devoir_surveille: 2,
  composition: 2,
}

/**
 * POST /api/evaluations/calculate-averages
 * Calculate and store subject averages for students
 *
 * Weighted average formula:
 * Average = Sum(score × typeCoefficient) / Sum(typeCoefficient)
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(["director", "academic_director", "teacher"])
  if (error) return error

  try {
    const body = await req.json()
    const validated = calculateAveragesSchema.parse(body)

    // Verify trimester exists
    const trimester = await prisma.trimester.findUnique({
      where: { id: validated.trimesterId },
    })

    if (!trimester) {
      return NextResponse.json(
        { message: "Trimester not found" },
        { status: 404 }
      )
    }

    // Build filter for evaluations
    const evaluationFilter: {
      trimesterId: string
      gradeSubject?: { gradeId?: string }
      gradeSubjectId?: string
      studentProfileId?: string
    } = {
      trimesterId: validated.trimesterId,
    }

    if (validated.gradeId) {
      evaluationFilter.gradeSubject = { gradeId: validated.gradeId }
    }
    if (validated.gradeSubjectId) {
      evaluationFilter.gradeSubjectId = validated.gradeSubjectId
    }
    if (validated.studentProfileId) {
      evaluationFilter.studentProfileId = validated.studentProfileId
    }

    // Fetch all evaluations matching the filter
    const evaluations = await prisma.evaluation.findMany({
      where: evaluationFilter,
      include: {
        gradeSubject: true,
      },
    })

    if (evaluations.length === 0) {
      return NextResponse.json(
        { message: "No evaluations found to calculate", count: 0 },
        { status: 200 }
      )
    }

    // Group evaluations by student + subject
    const groupedEvaluations = new Map<string, typeof evaluations>()

    evaluations.forEach((evaluation) => {
      const key = `${evaluation.studentProfileId}:${evaluation.gradeSubjectId}`
      const existing = groupedEvaluations.get(key) || []
      existing.push(evaluation)
      groupedEvaluations.set(key, existing)
    })

    // Calculate averages for each student-subject pair
    const averageUpdates: Array<{
      studentProfileId: string
      gradeSubjectId: string
      trimesterId: string
      average: number
    }> = []

    groupedEvaluations.forEach((evals, key) => {
      const [studentProfileId, gradeSubjectId] = key.split(":")

      // Calculate weighted average
      let totalWeightedScore = 0
      let totalWeight = 0

      evals.forEach((evaluation) => {
        const typeCoefficient = TYPE_COEFFICIENTS[evaluation.type] || 1
        // Normalize score to 20 if maxScore is different
        const normalizedScore = (evaluation.score / evaluation.maxScore) * 20
        totalWeightedScore += normalizedScore * typeCoefficient
        totalWeight += typeCoefficient
      })

      const average = totalWeight > 0 ? totalWeightedScore / totalWeight : 0

      averageUpdates.push({
        studentProfileId,
        gradeSubjectId,
        trimesterId: validated.trimesterId,
        average: Math.round(average * 100) / 100, // Round to 2 decimal places
      })
    })

    // Upsert all averages in a transaction
    const results = await prisma.$transaction(
      averageUpdates.map((update) =>
        prisma.subjectTrimesterAverage.upsert({
          where: {
            studentProfileId_gradeSubjectId_trimesterId: {
              studentProfileId: update.studentProfileId,
              gradeSubjectId: update.gradeSubjectId,
              trimesterId: update.trimesterId,
            },
          },
          update: {
            average: update.average,
            calculatedAt: new Date(),
          },
          create: {
            studentProfileId: update.studentProfileId,
            gradeSubjectId: update.gradeSubjectId,
            trimesterId: update.trimesterId,
            average: update.average,
            calculatedAt: new Date(),
          },
        })
      )
    )

    return NextResponse.json({
      message: `Calculated ${results.length} subject averages`,
      count: results.length,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error calculating averages:", err)
    return NextResponse.json(
      { message: "Failed to calculate averages" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/evaluations/calculate-averages
 * Get calculated subject averages
 */
export async function GET(req: NextRequest) {
  const { error } = await requireRole(["director", "academic_director", "teacher"])
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
    const averages = await prisma.subjectTrimesterAverage.findMany({
      where: {
        trimesterId,
        ...(studentProfileId && { studentProfileId }),
        ...(gradeId && { gradeSubject: { gradeId } }),
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
          },
        },
        gradeSubject: {
          include: {
            subject: {
              select: {
                code: true,
                nameFr: true,
                nameEn: true,
              },
            },
            grade: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { studentProfile: { person: { lastName: "asc" } } },
        { gradeSubject: { subject: { code: "asc" } } },
      ],
    })

    return NextResponse.json(
      averages.map((avg) => ({
        id: avg.id,
        studentProfileId: avg.studentProfileId,
        studentName: `${avg.studentProfile.person.firstName} ${avg.studentProfile.person.lastName}`,
        gradeSubjectId: avg.gradeSubjectId,
        subjectCode: avg.gradeSubject.subject.code,
        subjectNameFr: avg.gradeSubject.subject.nameFr,
        subjectNameEn: avg.gradeSubject.subject.nameEn,
        coefficient: avg.gradeSubject.coefficient,
        gradeId: avg.gradeSubject.grade.id,
        gradeName: avg.gradeSubject.grade.name,
        trimesterId: avg.trimesterId,
        average: avg.average,
        teacherRemark: avg.teacherRemark,
        calculatedAt: avg.calculatedAt,
      }))
    )
  } catch (err) {
    console.error("Error fetching averages:", err)
    return NextResponse.json(
      { message: "Failed to fetch averages" },
      { status: 500 }
    )
  }
}
