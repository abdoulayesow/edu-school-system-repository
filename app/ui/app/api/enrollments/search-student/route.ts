import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { buildNameSearchConditions } from "@/lib/search-utils"

/**
 * GET /api/enrollments/search-student
 * Search for returning students by student number, name, or date of birth
 * Query params: q (search query)
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("students", "view")
  if (error) return error

  const searchParams = req.nextUrl.searchParams
  const query = searchParams.get("q")

  if (!query || query.length < 2) {
    return NextResponse.json([])
  }

  try {
    // Build search conditions with multi-word support
    // "John Doe" matches firstName="John", lastName="Doe"
    // Also searches middleName from enrollments
    const nameSearchConditions = buildNameSearchConditions(query, {
      firstName: true,
      lastName: true,
      middleName: true,
      studentNumber: true,
    })

    // Build final where clause: name search OR email match
    const where: Record<string, unknown> = {
      status: { in: ["active", "inactive"] },
    }

    // Add email as additional OR condition (full query, not split)
    if (nameSearchConditions.OR) {
      // Single term search - add email to existing OR
      where.OR = [
        ...nameSearchConditions.OR as Record<string, unknown>[],
        { email: { contains: query, mode: "insensitive" } },
      ]
    } else if (nameSearchConditions.AND) {
      // Multi-term search - name conditions AND'd, email as separate OR option
      where.OR = [
        nameSearchConditions,
        { email: { contains: query, mode: "insensitive" } },
      ]
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        enrollments: {
          include: {
            grade: true,
            schoolYear: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1, // Get most recent enrollment
        },
      },
      take: 10, // Limit results
      orderBy: [
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    })

    // Also try to match by date of birth if query looks like a date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (dateRegex.test(query)) {
      const dateStudents = await prisma.student.findMany({
        where: {
          dateOfBirth: new Date(query),
          status: { in: ["active", "inactive"] },
        },
        include: {
          enrollments: {
            include: {
              grade: true,
              schoolYear: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        take: 10,
      })

      // Merge results, avoiding duplicates
      const existingIds = new Set(students.map((s) => s.id))
      for (const student of dateStudents) {
        if (!existingIds.has(student.id)) {
          students.push(student)
        }
      }
    }

    // Transform results for the frontend
    const results = students.map((student) => {
      const lastEnrollment = student.enrollments[0]
      return {
        id: student.id,
        studentNumber: student.studentNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        fullName: `${student.firstName} ${student.lastName}`,
        email: student.email,
        dateOfBirth: student.dateOfBirth,
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
        guardianEmail: student.guardianEmail,
        status: student.status,
        lastEnrollment: lastEnrollment
          ? {
              id: lastEnrollment.id,
              gradeName: lastEnrollment.grade.name,
              schoolYearName: lastEnrollment.schoolYear.name,
              status: lastEnrollment.status,
            }
          : null,
      }
    })

    return NextResponse.json(results)
  } catch (err) {
    console.error("Error searching students:", err)
    return NextResponse.json(
      { message: "Failed to search students" },
      { status: 500 }
    )
  }
}
