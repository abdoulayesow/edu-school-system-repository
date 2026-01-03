import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { TrimesterDecision } from "@prisma/client"

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateSummarySchema = z.object({
  conduct: z.number().min(0).max(20).optional(),
  decision: z.enum(["pending", "admis", "rattrapage", "redouble"]).optional(),
  generalRemark: z.string().optional().nullable(),
  absences: z.number().min(0).optional().nullable(),
  lates: z.number().min(0).optional().nullable(),
})

/**
 * GET /api/evaluations/student-summary/[id]
 * Get a specific student trimester summary
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director", "academic_director", "teacher"])
  if (error) return error

  const { id } = await params

  try {
    const summary = await prisma.studentTrimester.findUnique({
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
            schoolYear: {
              select: {
                name: true,
              },
            },
          },
        },
        overrider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!summary) {
      return NextResponse.json(
        { message: "Student summary not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: summary.id,
      studentProfileId: summary.studentProfileId,
      studentName: `${summary.studentProfile.person.firstName} ${summary.studentProfile.person.lastName}`,
      gradeId: summary.studentProfile.currentGrade?.id,
      gradeName: summary.studentProfile.currentGrade?.name,
      trimester: summary.trimester,
      generalAverage: summary.generalAverage,
      rank: summary.rank,
      totalStudents: summary.totalStudents,
      conduct: summary.conduct,
      decision: summary.decision,
      decisionOverride: summary.decisionOverride,
      decisionOverrideBy: summary.overrider,
      generalRemark: summary.generalRemark,
      absences: summary.absences,
      lates: summary.lates,
      calculatedAt: summary.calculatedAt,
    })
  } catch (err) {
    console.error("Error fetching student summary:", err)
    return NextResponse.json(
      { message: "Failed to fetch student summary" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/evaluations/student-summary/[id]
 * Update a student trimester summary (conduct, decision override, remarks)
 * Only directors can override decisions
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireRole(["director", "academic_director"])
  if (error) return error

  const { id } = await params

  try {
    const summary = await prisma.studentTrimester.findUnique({
      where: { id },
      include: {
        trimester: true,
      },
    })

    if (!summary) {
      return NextResponse.json(
        { message: "Student summary not found" },
        { status: 404 }
      )
    }

    const body = await req.json()
    const validated = updateSummarySchema.parse(body)

    // Check if decision is being changed
    const isDecisionOverride =
      validated.decision !== undefined && validated.decision !== summary.decision

    // Build the update data
    const updateData: Record<string, unknown> = {}

    if (validated.conduct !== undefined) {
      updateData.conduct = validated.conduct
    }

    if (validated.decision !== undefined) {
      updateData.decision = validated.decision as TrimesterDecision
      if (isDecisionOverride) {
        updateData.decisionOverride = true
        updateData.decisionOverrideBy = session!.user.id
        updateData.decisionOverrideAt = new Date()
      }
    }

    if (validated.generalRemark !== undefined) {
      updateData.generalRemark = validated.generalRemark
    }

    if (validated.absences !== undefined) {
      updateData.absences = validated.absences
    }

    if (validated.lates !== undefined) {
      updateData.lates = validated.lates
    }

    const updatedSummary = await prisma.studentTrimester.update({
      where: { id },
      data: updateData,
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
        overrider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      id: updatedSummary.id,
      studentProfileId: updatedSummary.studentProfileId,
      studentName: `${updatedSummary.studentProfile.person.firstName} ${updatedSummary.studentProfile.person.lastName}`,
      generalAverage: updatedSummary.generalAverage,
      rank: updatedSummary.rank,
      totalStudents: updatedSummary.totalStudents,
      conduct: updatedSummary.conduct,
      decision: updatedSummary.decision,
      decisionOverride: updatedSummary.decisionOverride,
      decisionOverrideBy: updatedSummary.overrider,
      generalRemark: updatedSummary.generalRemark,
      absences: updatedSummary.absences,
      lates: updatedSummary.lates,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating student summary:", err)
    return NextResponse.json(
      { message: "Failed to update student summary" },
      { status: 500 }
    )
  }
}
