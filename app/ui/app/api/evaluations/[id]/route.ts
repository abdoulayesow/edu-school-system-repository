import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateEvaluationSchema = z.object({
  score: z.number().min(0).max(20, "Score must be between 0 and 20").optional(),
  maxScore: z.number().min(1).max(20).optional(),
  date: z.string().transform((s) => new Date(s)).optional(),
  notes: z.string().optional().nullable(),
})

/**
 * GET /api/evaluations/[id]
 * Get a specific evaluation
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("grades", "view")
  if (error) return error

  const { id } = await params

  try {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
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
            subject: true,
            grade: true,
          },
        },
        trimester: {
          include: {
            schoolYear: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        recorder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!evaluation) {
      return NextResponse.json(
        { message: "Evaluation not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: evaluation.id,
      studentProfileId: evaluation.studentProfileId,
      studentName: `${evaluation.studentProfile.person.firstName} ${evaluation.studentProfile.person.lastName}`,
      gradeSubjectId: evaluation.gradeSubjectId,
      subjectCode: evaluation.gradeSubject.subject.code,
      subjectNameFr: evaluation.gradeSubject.subject.nameFr,
      subjectNameEn: evaluation.gradeSubject.subject.nameEn,
      coefficient: evaluation.gradeSubject.coefficient,
      gradeId: evaluation.gradeSubject.grade.id,
      gradeName: evaluation.gradeSubject.grade.name,
      trimesterId: evaluation.trimesterId,
      trimester: evaluation.trimester,
      type: evaluation.type,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      date: evaluation.date,
      notes: evaluation.notes,
      recordedBy: evaluation.recorder,
      createdAt: evaluation.createdAt,
      updatedAt: evaluation.updatedAt,
    })
  } catch (err) {
    console.error("Error fetching evaluation:", err)
    return NextResponse.json(
      { message: "Failed to fetch evaluation" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/evaluations/[id]
 * Update an evaluation
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("grades", "update")
  if (error) return error

  const { id } = await params

  try {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        trimester: true,
      },
    })

    if (!evaluation) {
      return NextResponse.json(
        { message: "Evaluation not found" },
        { status: 404 }
      )
    }

    // Only allow editing evaluations from the active trimester
    if (!evaluation.trimester.isActive) {
      return NextResponse.json(
        { message: "Can only edit evaluations from the active trimester" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = updateEvaluationSchema.parse(body)

    const updatedEvaluation = await prisma.evaluation.update({
      where: { id },
      data: {
        ...(validated.score !== undefined && { score: validated.score }),
        ...(validated.maxScore !== undefined && { maxScore: validated.maxScore }),
        ...(validated.date && { date: validated.date }),
        ...(validated.notes !== undefined && { notes: validated.notes }),
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
            subject: true,
          },
        },
      },
    })

    return NextResponse.json(updatedEvaluation)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating evaluation:", err)
    return NextResponse.json(
      { message: "Failed to update evaluation" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/evaluations/[id]
 * Delete an evaluation
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("grades", "delete")
  if (error) return error

  const { id } = await params

  try {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        trimester: true,
      },
    })

    if (!evaluation) {
      return NextResponse.json(
        { message: "Evaluation not found" },
        { status: 404 }
      )
    }

    // Only allow deleting evaluations from the active trimester
    if (!evaluation.trimester.isActive) {
      return NextResponse.json(
        { message: "Can only delete evaluations from the active trimester" },
        { status: 400 }
      )
    }

    await prisma.evaluation.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Evaluation deleted successfully" })
  } catch (err) {
    console.error("Error deleting evaluation:", err)
    return NextResponse.json(
      { message: "Failed to delete evaluation" },
      { status: 500 }
    )
  }
}
