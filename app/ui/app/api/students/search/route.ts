import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/students/search
 * Quick search for students (for autocomplete, etc.)
 */
export async function GET(req: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")
  const limit = parseInt(searchParams.get("limit") || "10")
  const gradeId = searchParams.get("gradeId")

  if (!q || q.length < 2) {
    return NextResponse.json({ students: [] })
  }

  try {
    // Get active school year
    const activeYear = await prisma.schoolYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    })

    const where: Record<string, unknown> = {
      status: "active",
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { studentNumber: { contains: q, mode: "insensitive" } },
      ],
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

    return NextResponse.json({ students: results })
  } catch (err) {
    console.error("Error searching students:", err)
    return NextResponse.json(
      { message: "Failed to search students" },
      { status: 500 }
    )
  }
}
