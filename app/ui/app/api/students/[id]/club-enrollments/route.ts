import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

type RouteParams = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/students/[id]/club-enrollments
 * Fetch active club enrollments for a student (for payment wizard)
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("students", "view")
  if (error) return error

  const { id: studentId } = await params

  try {
    // Get student's profile to find club enrollments
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        studentProfile: {
          select: {
            id: true,
            clubEnrollments: {
              where: {
                status: "active",
              },
              select: {
                id: true,
                clubId: true,
                totalFee: true,
                startMonth: true,
                startYear: true,
                totalMonths: true,
                club: {
                  select: {
                    id: true,
                    name: true,
                    monthlyFee: true,
                  },
                },
                // Get total paid for this enrollment
                payments: {
                  where: {
                    status: "confirmed",
                  },
                  select: {
                    amount: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    if (!student.studentProfile) {
      return NextResponse.json({ clubEnrollments: [] })
    }

    // Map enrollments with balance calculations
    const clubEnrollments = student.studentProfile.clubEnrollments.map((enrollment) => {
      const totalPaid = enrollment.payments.reduce((sum, p) => sum + p.amount, 0)
      const remainingBalance = (enrollment.totalFee || 0) - totalPaid

      return {
        id: enrollment.id,
        clubId: enrollment.clubId,
        clubName: enrollment.club.name,
        monthlyFee: enrollment.club.monthlyFee,
        totalFee: enrollment.totalFee,
        startMonth: enrollment.startMonth,
        startYear: enrollment.startYear,
        totalMonths: enrollment.totalMonths,
        totalPaid,
        remainingBalance,
      }
    })

    return NextResponse.json({ clubEnrollments })
  } catch (err) {
    console.error("Failed to fetch club enrollments:", err)
    return NextResponse.json({ error: "Failed to fetch club enrollments" }, { status: 500 })
  }
}
