import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface GradeSubjectData {
  id: string
  subjectId: string
  coefficient: number
  subject: {
    id: string
    code: string | null
    nameFr: string
    nameEn: string
  }
}

interface GradeData {
  id: string
  name: string
  code: string | null
  level: string
  subjects: GradeSubjectData[]
}

/**
 * GET /api/evaluations/progress
 * Get evaluation progress for all grades in the active trimester
 * Returns completion status for compositions (required for bulletins)
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("grades", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const trimesterId = searchParams.get("trimesterId")

  if (!trimesterId) {
    return NextResponse.json(
      { message: "trimesterId is required" },
      { status: 400 }
    )
  }

  try {
    // Get all grades with their subjects
    const grades = await prisma.grade.findMany({
      where: {
        isEnabled: true,
      },
      include: {
        subjects: {
          include: {
            subject: {
              select: {
                id: true,
                code: true,
                nameFr: true,
                nameEn: true,
              },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    }) as unknown as GradeData[]

    // Get evaluation counts grouped by grade, subject, and type
    const evaluationCounts = await prisma.evaluation.groupBy({
      by: ["gradeSubjectId", "type"],
      where: {
        trimesterId,
      },
      _count: {
        studentProfileId: true,
      },
    })

    // Create a map for quick lookup
    const evalMap = new Map<string, { interrogations: number; devoirsSurveilles: number; compositions: number }>()
    evaluationCounts.forEach((ec) => {
      const key = ec.gradeSubjectId
      const existing = evalMap.get(key) || { interrogations: 0, devoirsSurveilles: 0, compositions: 0 }

      if (ec.type === "interrogation") {
        existing.interrogations = ec._count.studentProfileId
      } else if (ec.type === "devoir_surveille") {
        existing.devoirsSurveilles = ec._count.studentProfileId
      } else if (ec.type === "composition") {
        existing.compositions = ec._count.studentProfileId
      }

      evalMap.set(key, existing)
    })

    // Get subject averages to check which are calculated
    const subjectAverages = await prisma.subjectTrimesterAverage.groupBy({
      by: ["gradeSubjectId"],
      where: {
        trimesterId,
        average: { not: null },
      },
      _count: {
        studentProfileId: true,
      },
    })

    const averageMap = new Map<string, number>()
    subjectAverages.forEach((sa) => {
      averageMap.set(sa.gradeSubjectId, sa._count.studentProfileId)
    })

    // Get student summaries to check which grades have rankings calculated
    const studentSummaries = await prisma.studentTrimester.groupBy({
      by: ["studentProfileId"],
      where: {
        trimesterId,
        generalAverage: { not: null },
      },
      _count: true,
    })

    const studentsWithSummaries = new Set(studentSummaries.map((s) => s.studentProfileId))

    // Get enrolled student counts per grade for accurate progress calculation
    const enrolledStudents = await prisma.studentProfile.findMany({
      where: {
        currentGradeId: { in: grades.map((g) => g.id) },
        gradeEnrollments: {
          some: {
            status: "active",
          },
        },
      },
      select: {
        id: true,
        currentGradeId: true,
      },
    })

    const studentsByGrade = new Map<string, string[]>()
    enrolledStudents.forEach((s) => {
      if (s.currentGradeId) {
        const existing = studentsByGrade.get(s.currentGradeId) || []
        existing.push(s.id)
        studentsByGrade.set(s.currentGradeId, existing)
      }
    })

    // Build progress data for each grade
    const gradeProgress = grades.map((grade) => {
      const studentIds = studentsByGrade.get(grade.id) || []
      const studentCount = studentIds.length

      const subjects = grade.subjects.map((gs: GradeSubjectData) => {
        const evalCounts = evalMap.get(gs.id) || { interrogations: 0, devoirsSurveilles: 0, compositions: 0 }
        const averageCount = averageMap.get(gs.id) || 0

        // A composition is considered complete if at least 80% of students have grades
        const compositionProgress = studentCount > 0
          ? Math.round((evalCounts.compositions / studentCount) * 100)
          : 0

        return {
          id: gs.id,
          subjectId: gs.subjectId,
          code: gs.subject.code,
          nameFr: gs.subject.nameFr,
          nameEn: gs.subject.nameEn,
          coefficient: gs.coefficient,
          interrogations: evalCounts.interrogations,
          devoirsSurveilles: evalCounts.devoirsSurveilles,
          compositions: evalCounts.compositions,
          compositionProgress,
          hasComposition: evalCounts.compositions > 0,
          compositionComplete: compositionProgress >= 80,
          averagesCalculated: averageCount,
          hasAverages: averageCount > 0,
        }
      })

      // Calculate grade-level progress
      const totalSubjects = subjects.length
      const subjectsWithComposition = subjects.filter((s: { hasComposition: boolean }) => s.hasComposition).length
      const subjectsComplete = subjects.filter((s: { compositionComplete: boolean }) => s.compositionComplete).length

      // Count students with summaries in this grade
      const studentsWithRankings = studentIds.filter((id) => studentsWithSummaries.has(id)).length

      return {
        id: grade.id,
        name: grade.name,
        code: grade.code,
        level: grade.level,
        studentCount,
        totalSubjects,
        subjectsWithComposition,
        subjectsComplete,
        compositionProgress: totalSubjects > 0
          ? Math.round((subjectsWithComposition / totalSubjects) * 100)
          : 0,
        completionProgress: totalSubjects > 0
          ? Math.round((subjectsComplete / totalSubjects) * 100)
          : 0,
        studentsWithRankings,
        rankingsCalculated: studentsWithRankings === studentCount && studentCount > 0,
        subjects,
      }
    })

    // Calculate overall statistics
    const totalGrades = gradeProgress.length
    const gradesWithAllCompositions = gradeProgress.filter((g) => g.compositionProgress === 100).length
    const gradesComplete = gradeProgress.filter((g) => g.completionProgress === 100).length
    const gradesWithRankings = gradeProgress.filter((g) => g.rankingsCalculated).length

    return NextResponse.json({
      trimesterId,
      summary: {
        totalGrades,
        gradesWithAllCompositions,
        gradesComplete,
        gradesWithRankings,
        overallProgress: totalGrades > 0
          ? Math.round((gradesComplete / totalGrades) * 100)
          : 0,
      },
      grades: gradeProgress,
    })
  } catch (err) {
    console.error("Error fetching evaluation progress:", err)
    return NextResponse.json(
      { message: "Failed to fetch evaluation progress" },
      { status: 500 }
    )
  }
}
