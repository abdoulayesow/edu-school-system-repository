import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/grades/[id]/payment-stats
 * Get payment statistics for a grade (for charts)
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("classes", "view")
  if (error) return error

  const { id } = await params

  try {
    // Verify grade exists
    const grade = await prisma.grade.findUnique({
      where: { id },
      include: {
        schoolYear: { select: { id: true, name: true } },
      },
    })

    if (!grade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    // Get enrollments with payments
    const enrollments = await prisma.enrollment.findMany({
      where: {
        gradeId: id,
        schoolYearId: grade.schoolYearId,
        status: "completed",
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentNumber: true,
          },
        },
        payments: {
          where: { status: "confirmed" },
          select: { amount: true },
        },
      },
    })

    // Calculate summary
    let totalTuition = 0
    let totalPaid = 0
    let lateCount = 0
    let onTimeCount = 0
    let inAdvanceCount = 0
    let completeCount = 0

    const studentBreakdown = enrollments.map((enrollment) => {
      const tuition = enrollment.adjustedTuitionFee || enrollment.originalTuitionFee
      const paid = enrollment.payments.reduce((sum, p) => sum + p.amount, 0)
      totalTuition += tuition
      totalPaid += paid

      const percentage = Math.round((paid / tuition) * 100)
      let status = "on_time"

      if (percentage >= 100) {
        completeCount++
        status = "complete"
      } else if (percentage >= 70) {
        inAdvanceCount++
        status = "in_advance"
      } else if (percentage >= 40) {
        onTimeCount++
        status = "on_time"
      } else {
        lateCount++
        status = "late"
      }

      return {
        student: enrollment.student,
        tuitionFee: tuition,
        totalPaid: paid,
        remainingBalance: tuition - paid,
        paymentPercentage: percentage,
        status,
      }
    })

    const summary = {
      studentCount: enrollments.length,
      totalTuition,
      totalPaid,
      remainingBalance: totalTuition - totalPaid,
      collectionRate: totalTuition > 0 ? Math.round((totalPaid / totalTuition) * 100) : 0,
    }

    // Chart data for donut chart
    const chartData = [
      {
        name: "complete",
        label: "Complet",
        value: completeCount,
        percentage: enrollments.length > 0 ? Math.round((completeCount / enrollments.length) * 100) : 0,
        color: "#22c55e", // green
      },
      {
        name: "in_advance",
        label: "En avance",
        value: inAdvanceCount,
        percentage: enrollments.length > 0 ? Math.round((inAdvanceCount / enrollments.length) * 100) : 0,
        color: "#3b82f6", // blue
      },
      {
        name: "on_time",
        label: "À jour",
        value: onTimeCount,
        percentage: enrollments.length > 0 ? Math.round((onTimeCount / enrollments.length) * 100) : 0,
        color: "#f59e0b", // amber
      },
      {
        name: "late",
        label: "En retard",
        value: lateCount,
        percentage: enrollments.length > 0 ? Math.round((lateCount / enrollments.length) * 100) : 0,
        color: "#ef4444", // red
      },
    ]

    // Sort students by payment status (late first for attention)
    const sortedStudents = studentBreakdown.sort((a, b) => {
      const statusOrder = { late: 0, on_time: 1, in_advance: 2, complete: 3 }
      return (statusOrder[a.status as keyof typeof statusOrder] || 0) -
        (statusOrder[b.status as keyof typeof statusOrder] || 0)
    })

    return NextResponse.json({
      grade: {
        id: grade.id,
        name: grade.name,
        schoolYear: grade.schoolYear,
      },
      summary,
      chartData,
      students: sortedStudents,
    })
  } catch (err) {
    console.error("Error fetching grade payment stats:", err)
    return NextResponse.json(
      { message: "Failed to fetch grade payment stats" },
      { status: 500 }
    )
  }
}
