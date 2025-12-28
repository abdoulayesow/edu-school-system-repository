import { NextRequest, NextResponse } from "next/server"
import { requireSession, requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

// Schema for updating a grade
const updateGradeSchema = z.object({
  gradeLeaderId: z.string().optional().nullable(),
  code: z.string().optional(),
})

/**
 * GET /api/grades/[id]
 * Get a single grade with full details
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params

  try {
    const grade = await prisma.grade.findUnique({
      where: { id },
      include: {
        schoolYear: {
          select: { id: true, name: true, isActive: true },
        },
        gradeLeader: {
          include: {
            person: {
              select: { id: true, firstName: true, lastName: true, photoUrl: true, email: true },
            },
          },
        },
        subjects: {
          include: {
            subject: true,
            classAssignments: {
              include: {
                teacherProfile: {
                  include: {
                    person: {
                      select: { firstName: true, lastName: true },
                    },
                  },
                },
              },
            },
          },
        },
        enrollments: {
          where: { status: "completed" },
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                studentNumber: true,
              },
            },
          },
        },
      },
    })

    if (!grade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    // Get attendance and payment stats
    const attendanceSessions = await prisma.attendanceSession.findMany({
      where: { gradeId: id },
      select: { id: true },
    })

    const sessionIds = attendanceSessions.map((s) => s.id)

    const attendanceStats = await prisma.attendanceRecord.groupBy({
      by: ["status"],
      where: { sessionId: { in: sessionIds } },
      _count: true,
    })

    const attendanceSummary = {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      attendanceRate: 0,
    }

    for (const stat of attendanceStats) {
      const statusKey = stat.status as keyof typeof attendanceSummary
      if (typeof attendanceSummary[statusKey] === "number") {
        attendanceSummary[statusKey] = stat._count
      }
      attendanceSummary.total += stat._count
    }

    if (attendanceSummary.total > 0) {
      attendanceSummary.attendanceRate = Math.round(
        ((attendanceSummary.present + attendanceSummary.late + attendanceSummary.excused) /
          attendanceSummary.total) *
          100
      )
    }

    // Calculate payment stats
    const enrollmentsWithPayments = await prisma.enrollment.findMany({
      where: {
        gradeId: id,
        status: "completed",
      },
      select: {
        originalTuitionFee: true,
        adjustedTuitionFee: true,
        payments: {
          where: { status: "confirmed" },
          select: { amount: true },
        },
      },
    })

    let totalTuition = 0
    let totalPaid = 0
    let lateCount = 0
    let onTimeCount = 0
    let inAdvanceCount = 0
    let completeCount = 0

    for (const enrollment of enrollmentsWithPayments) {
      const tuition = enrollment.adjustedTuitionFee || enrollment.originalTuitionFee
      const paid = enrollment.payments.reduce((sum, p) => sum + p.amount, 0)
      totalTuition += tuition
      totalPaid += paid

      const percentage = Math.round((paid / tuition) * 100)
      if (percentage >= 100) {
        completeCount++
      } else if (percentage >= 70) {
        inAdvanceCount++
      } else if (percentage >= 40) {
        onTimeCount++
      } else {
        lateCount++
      }
    }

    const paymentSummary = {
      totalTuition,
      totalPaid,
      remainingBalance: totalTuition - totalPaid,
      paymentRate: totalTuition > 0 ? Math.round((totalPaid / totalTuition) * 100) : 0,
      breakdown: {
        late: lateCount,
        onTime: onTimeCount,
        inAdvance: inAdvanceCount,
        complete: completeCount,
      },
    }

    return NextResponse.json({
      ...grade,
      studentCount: grade.enrollments.length,
      attendanceSummary,
      paymentSummary,
    })
  } catch (err) {
    console.error("Error fetching grade:", err)
    return NextResponse.json(
      { message: "Failed to fetch grade" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/grades/[id]
 * Update grade details (e.g., assign grade leader)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireRole(["director", "academic_director"])
  if (error) return error

  const { id } = await params

  try {
    const existingGrade = await prisma.grade.findUnique({
      where: { id },
    })

    if (!existingGrade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    const body = await req.json()
    const validated = updateGradeSchema.parse(body)

    // Verify teacher exists if provided
    if (validated.gradeLeaderId) {
      const teacher = await prisma.teacherProfile.findUnique({
        where: { id: validated.gradeLeaderId },
      })

      if (!teacher) {
        return NextResponse.json(
          { message: "Teacher not found" },
          { status: 404 }
        )
      }
    }

    const grade = await prisma.grade.update({
      where: { id },
      data: {
        gradeLeaderId: validated.gradeLeaderId,
        code: validated.code,
      },
      include: {
        gradeLeader: {
          include: {
            person: {
              select: { firstName: true, lastName: true, photoUrl: true },
            },
          },
        },
      },
    })

    return NextResponse.json(grade)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating grade:", err)
    return NextResponse.json(
      { message: "Failed to update grade" },
      { status: 500 }
    )
  }
}
