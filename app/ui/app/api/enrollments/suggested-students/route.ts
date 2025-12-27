import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/enrollments/suggested-students
 * Returns students who were enrolled in the previous grade last year
 * and are eligible for enrollment in the requested grade this year.
 *
 * Query params:
 * - gradeId: The grade ID to enroll in
 * - limit: Maximum results (default 20)
 */
export async function GET(req: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const gradeId = searchParams.get("gradeId")
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    if (!gradeId) {
      return NextResponse.json(
        { message: "gradeId is required" },
        { status: 400 }
      )
    }

    // Get the current grade with its order and school year
    const currentGrade = await prisma.grade.findUnique({
      where: { id: gradeId },
      include: {
        schoolYear: true,
      },
    })

    if (!currentGrade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    // If this is the first grade (order 1), there are no students from previous grade
    if (currentGrade.order === 1) {
      return NextResponse.json([])
    }

    // Find the previous school year
    const previousSchoolYear = await prisma.schoolYear.findFirst({
      where: {
        startDate: {
          lt: currentGrade.schoolYear.startDate,
        },
      },
      orderBy: {
        startDate: "desc",
      },
    })

    if (!previousSchoolYear) {
      return NextResponse.json([])
    }

    // Find the previous grade in the previous school year
    const previousGrade = await prisma.grade.findFirst({
      where: {
        schoolYearId: previousSchoolYear.id,
        order: currentGrade.order - 1,
      },
    })

    if (!previousGrade) {
      return NextResponse.json([])
    }

    // Get students who were enrolled in the previous grade last year with completed status
    // Exclude students who are already enrolled in the current school year
    const existingEnrollmentsThisYear = await prisma.enrollment.findMany({
      where: {
        schoolYearId: currentGrade.schoolYearId,
        status: { notIn: ["cancelled", "rejected"] },
      },
      select: {
        studentId: true,
        firstName: true,
        lastName: true,
      },
    })

    const existingStudentIds = new Set(
      existingEnrollmentsThisYear
        .filter((e) => e.studentId)
        .map((e) => e.studentId)
    )

    // Also check by name for enrollments without studentId
    const existingNames = new Set(
      existingEnrollmentsThisYear.map((e) => `${e.firstName.toLowerCase()}_${e.lastName.toLowerCase()}`)
    )

    // Find completed enrollments from previous grade last year
    const previousEnrollments = await prisma.enrollment.findMany({
      where: {
        gradeId: previousGrade.id,
        schoolYearId: previousSchoolYear.id,
        status: "completed",
      },
      include: {
        student: true,
        grade: true,
      },
      take: limit * 2, // Get extra to filter
    })

    // Filter out students already enrolled this year
    const suggestedStudents = previousEnrollments
      .filter((enrollment) => {
        // Exclude if studentId already enrolled
        if (enrollment.studentId && existingStudentIds.has(enrollment.studentId)) {
          return false
        }
        // Exclude if same name already enrolled (for cases without studentId)
        const nameKey = `${enrollment.firstName.toLowerCase()}_${enrollment.lastName.toLowerCase()}`
        if (existingNames.has(nameKey)) {
          return false
        }
        return true
      })
      .slice(0, limit)
      .map((enrollment) => ({
        id: enrollment.student?.id || enrollment.id, // Use student ID if available
        enrollmentId: enrollment.id,
        studentNumber: enrollment.student?.studentNumber || null,
        firstName: enrollment.firstName,
        lastName: enrollment.lastName,
        dateOfBirth: enrollment.dateOfBirth,
        lastGrade: previousGrade.name,
        lastEnrollmentYear: previousSchoolYear.name,
        fatherName: enrollment.fatherName,
        fatherPhone: enrollment.fatherPhone,
        motherName: enrollment.motherName,
        motherPhone: enrollment.motherPhone,
        email: enrollment.email,
        phone: enrollment.phone,
        address: enrollment.address,
      }))

    return NextResponse.json(suggestedStudents)
  } catch (err) {
    console.error("Error fetching suggested students:", err)
    return NextResponse.json(
      { message: "Failed to fetch suggested students" },
      { status: 500 }
    )
  }
}
