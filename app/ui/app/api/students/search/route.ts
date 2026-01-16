import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

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

    // Split search query into words for multi-word search
    // "Abdoulaye Sow" -> search firstName contains "Abdoulaye" AND lastName contains "Sow"
    const words = q.trim().split(/\s+/).filter(w => w.length >= 2)

    let searchConditions: Record<string, unknown>[]

    if (words.length >= 2) {
      // Multi-word search: try firstName + lastName combinations
      // Search for: (firstName contains word1 AND lastName contains word2)
      //          OR (firstName contains word2 AND lastName contains word1)
      //          OR any word matches studentNumber
      searchConditions = [
        // First word in firstName, second word in lastName
        {
          AND: [
            { firstName: { contains: words[0], mode: "insensitive" } },
            { lastName: { contains: words[1], mode: "insensitive" } },
          ],
        },
        // Reverse: second word in firstName, first word in lastName
        {
          AND: [
            { firstName: { contains: words[1], mode: "insensitive" } },
            { lastName: { contains: words[0], mode: "insensitive" } },
          ],
        },
        // Also try each word individually (for partial matches)
        ...words.map(word => ({ firstName: { contains: word, mode: "insensitive" } })),
        ...words.map(word => ({ lastName: { contains: word, mode: "insensitive" } })),
        // Student number match
        { studentNumber: { contains: q, mode: "insensitive" } },
      ]
    } else {
      // Single word search: match any field
      searchConditions = [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { studentNumber: { contains: q, mode: "insensitive" } },
      ]
    }

    const where: Record<string, unknown> = {
      status: "active",
      OR: searchConditions,
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
