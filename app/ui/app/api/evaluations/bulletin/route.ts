import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/evaluations/bulletin
 * Get complete bulletin data for a student in a trimester
 */
export async function GET(req: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const studentProfileId = searchParams.get("studentProfileId")
  const trimesterId = searchParams.get("trimesterId")

  if (!studentProfileId || !trimesterId) {
    return NextResponse.json(
      { message: "studentProfileId and trimesterId are required" },
      { status: 400 }
    )
  }

  try {
    // Get student info
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: {
        person: {
          select: {
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            photoUrl: true,
          },
        },
        currentGrade: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    })

    if (!studentProfile) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      )
    }

    // Get trimester info
    const trimester = await prisma.trimester.findUnique({
      where: { id: trimesterId },
      include: {
        schoolYear: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!trimester) {
      return NextResponse.json(
        { message: "Trimester not found" },
        { status: 404 }
      )
    }

    // Get student trimester summary
    const studentTrimester = await prisma.studentTrimester.findUnique({
      where: {
        studentProfileId_trimesterId: {
          studentProfileId,
          trimesterId,
        },
      },
    })

    // Get class statistics
    const classStats = studentProfile.currentGradeId
      ? await prisma.classTrimesterStats.findUnique({
          where: {
            gradeId_trimesterId: {
              gradeId: studentProfile.currentGradeId,
              trimesterId,
            },
          },
        })
      : null

    // Get subject averages with all details
    const subjectAverages = await prisma.subjectTrimesterAverage.findMany({
      where: {
        studentProfileId,
        trimesterId,
      },
      include: {
        gradeSubject: {
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
      orderBy: {
        gradeSubject: {
          subject: {
            code: "asc",
          },
        },
      },
    })

    // Get individual evaluations for this trimester
    const evaluations = await prisma.evaluation.findMany({
      where: {
        studentProfileId,
        trimesterId,
      },
      include: {
        gradeSubject: {
          include: {
            subject: {
              select: {
                id: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: [
        { gradeSubject: { subject: { code: "asc" } } },
        { date: "asc" },
      ],
    })

    // Group evaluations by subject
    const evaluationsBySubject = new Map<string, typeof evaluations>()
    evaluations.forEach((evaluation) => {
      const subjectId = evaluation.gradeSubject.subject.id
      const existing = evaluationsBySubject.get(subjectId) || []
      existing.push(evaluation)
      evaluationsBySubject.set(subjectId, existing)
    })

    // Build subject details with averages and evaluations
    const subjects = subjectAverages.map((avg) => {
      const subjectId = avg.gradeSubject.subject.id
      const subjectEvaluations = evaluationsBySubject.get(subjectId) || []

      // Group by type
      const interrogations = subjectEvaluations.filter((e) => e.type === "interrogation")
      const devoirsSurveilles = subjectEvaluations.filter((e) => e.type === "devoir_surveille")
      const compositions = subjectEvaluations.filter((e) => e.type === "composition")

      return {
        id: avg.id,
        subjectId: subjectId,
        code: avg.gradeSubject.subject.code,
        nameFr: avg.gradeSubject.subject.nameFr,
        nameEn: avg.gradeSubject.subject.nameEn,
        coefficient: avg.gradeSubject.coefficient,
        average: avg.average,
        teacherRemark: avg.teacherRemark,
        evaluations: {
          interrogations: interrogations.map((e) => ({
            id: e.id,
            score: e.score,
            maxScore: e.maxScore,
            date: e.date,
          })),
          devoirsSurveilles: devoirsSurveilles.map((e) => ({
            id: e.id,
            score: e.score,
            maxScore: e.maxScore,
            date: e.date,
          })),
          compositions: compositions.map((e) => ({
            id: e.id,
            score: e.score,
            maxScore: e.maxScore,
            date: e.date,
          })),
        },
      }
    })

    // Calculate total coefficient
    const totalCoefficient = subjects.reduce((sum, s) => sum + s.coefficient, 0)

    const bulletin = {
      student: {
        id: studentProfile.id,
        firstName: studentProfile.person.firstName,
        lastName: studentProfile.person.lastName,
        dateOfBirth: studentProfile.person.dateOfBirth,
        photoUrl: studentProfile.person.photoUrl,
        studentNumber: studentProfile.studentNumber,
        grade: studentProfile.currentGrade,
      },
      trimester: {
        id: trimester.id,
        number: trimester.number,
        name: trimester.name,
        nameFr: trimester.nameFr,
        nameEn: trimester.nameEn,
        schoolYear: trimester.schoolYear,
      },
      subjects,
      totalCoefficient,
      summary: studentTrimester
        ? {
            generalAverage: studentTrimester.generalAverage,
            rank: studentTrimester.rank,
            totalStudents: studentTrimester.totalStudents,
            conduct: studentTrimester.conduct,
            decision: studentTrimester.decision,
            decisionOverride: studentTrimester.decisionOverride,
            generalRemark: studentTrimester.generalRemark,
            absences: studentTrimester.absences,
            lates: studentTrimester.lates,
            calculatedAt: studentTrimester.calculatedAt,
          }
        : null,
      classStats: classStats
        ? {
            classAverage: classStats.classAverage,
            highestAverage: classStats.highestAverage,
            lowestAverage: classStats.lowestAverage,
            passCount: classStats.passCount,
            passRate: classStats.passRate,
            totalStudents: classStats.totalStudents,
          }
        : null,
    }

    return NextResponse.json(bulletin)
  } catch (err) {
    console.error("Error fetching bulletin:", err)
    return NextResponse.json(
      { message: "Failed to fetch bulletin" },
      { status: 500 }
    )
  }
}
