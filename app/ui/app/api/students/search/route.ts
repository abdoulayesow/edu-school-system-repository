import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { buildNameSearchConditions } from "@/lib/search-utils"

/**
 * GET /api/students/search
 * Quick search for students (for autocomplete, etc.)
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("students", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")
  const limit = parseInt(searchParams.get("limit") || "10")
  const gradeId = searchParams.get("gradeId")
  const balanceStatus = searchParams.get("balanceStatus") // "outstanding" or "paid_up"

  if (!q || q.length < 2) {
    return NextResponse.json({ students: [] })
  }

  try {
    // Get active school year
    const activeYear = await prisma.schoolYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    })

    // Build search conditions with multi-word support
    // "Abdoulaye Sow" -> matches firstName="Abdoulaye", lastName="Sow"
    // Also searches middleName from enrollments
    const searchConditions = buildNameSearchConditions(q, {
      firstName: true,
      lastName: true,
      middleName: true,
      studentNumber: true,
    })

    const where: Record<string, unknown> = {
      status: "active",
      ...searchConditions,
    }

    // Add grade filter if provided
    if (gradeId && activeYear) {
      where.enrollments = {
        some: {
          gradeId,
          schoolYearId: activeYear.id,
          status: "completed",
        },
      }
    } else if (activeYear) {
      where.enrollments = {
        some: {
          schoolYearId: activeYear.id,
          status: "completed",
        },
      }
    }

    const students = await prisma.student.findMany({
      where,
      select: {
        id: true,
        studentNumber: true,
        firstName: true,
        lastName: true,
        studentProfile: {
          select: {
            id: true,
            person: {
              select: {
                photoUrl: true,
              },
            },
          },
        },
        enrollments: activeYear
          ? {
              where: {
                schoolYearId: activeYear.id,
                status: "completed",
              },
              select: {
                id: true,
                originalTuitionFee: true,
                adjustedTuitionFee: true,
                grade: {
                  select: { id: true, name: true },
                },
                payments: {
                  where: { status: "confirmed" },
                  select: { amount: true },
                },
              },
              take: 1,
            }
          : undefined,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      take: limit,
    })

    const results = students.map((student) => {
      const enrollment = (student.enrollments as unknown as Array<{
        id: string
        originalTuitionFee: number
        adjustedTuitionFee: number | null
        grade: { id: string; name: string }
        payments: Array<{ amount: number }>
      }> | undefined)?.[0]

      const tuitionFee = enrollment?.adjustedTuitionFee ?? enrollment?.originalTuitionFee ?? 0
      const totalPaid = enrollment?.payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0
      const remainingBalance = tuitionFee - totalPaid

      return {
        id: student.id,
        studentNumber: student.studentNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        fullName: `${student.firstName} ${student.lastName}`,
        photoUrl: student.studentProfile?.person?.photoUrl,
        studentProfileId: student.studentProfile?.id,
        grade: enrollment?.grade,
        enrollmentId: enrollment?.id,
        balanceInfo: enrollment ? {
          tuitionFee,
          totalPaid,
          remainingBalance,
        } : null,
      }
    })

    // Filter by balance status if specified
    let filteredResults = results
    if (balanceStatus) {
      filteredResults = results.filter((student) => {
        if (!student.balanceInfo) return false
        const hasOutstanding = student.balanceInfo.remainingBalance > 0
        if (balanceStatus === "outstanding") return hasOutstanding
        if (balanceStatus === "paid_up") return !hasOutstanding
        return true
      })
    }

    return NextResponse.json({ students: filteredResults })
  } catch (err) {
    console.error("Error searching students:", err)
    return NextResponse.json(
      { message: "Failed to search students" },
      { status: 500 }
    )
  }
}
