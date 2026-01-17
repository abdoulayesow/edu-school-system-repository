import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/admin/clubs/[id]/eligible-students
 * Get all students eligible for a specific club based on eligibility rules
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("schedule", "view")
  if (error) return error

  try {
    const { id } = await params

    // Get club with eligibility rules
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        eligibilityRule: {
          include: {
            gradeRules: true,
          },
        },
        schoolYear: true,
      },
    })

    if (!club) {
      return NextResponse.json(
        { message: "Club not found" },
        { status: 404 }
      )
    }

    // Build the query to find eligible students
    // 1. Students must have a completed enrollment in the active school year
    // 2. Must match eligibility rules

    const enrollmentWhere: any = {
      schoolYear: { isActive: true },
      status: "completed",
    }

    // Apply eligibility rules
    if (club.eligibilityRule) {
      const rule = club.eligibilityRule

      if (rule.ruleType === "include_only") {
        // Only students in specified grades
        const allowedGradeIds = rule.gradeRules.map((gr) => gr.gradeId)
        enrollmentWhere.gradeId = { in: allowedGradeIds }
      } else if (rule.ruleType === "exclude_only") {
        // All students except those in specified grades
        const excludedGradeIds = rule.gradeRules.map((gr) => gr.gradeId)
        enrollmentWhere.gradeId = { notIn: excludedGradeIds }
      }
      // all_grades means no filter
    }

    // Fetch students with completed enrollments matching criteria
    const enrollments = await prisma.enrollment.findMany({
      where: enrollmentWhere,
      distinct: ["studentId"],
      include: {
        student: {
          include: {
            person: {
              select: {
                firstName: true,
                lastName: true,
                photoUrl: true,
              },
            },
            studentProfile: {
              select: {
                id: true,
              },
            },
          },
        },
        grade: {
          select: {
            id: true,
            name: true,
            nameFr: true,
          },
        },
      },
      orderBy: [
        { student: { person: { lastName: "asc" } } },
        { student: { person: { firstName: "asc" } } },
      ],
    })

    // Get students already enrolled in this club
    const existingEnrollments = await prisma.clubEnrollment.findMany({
      where: { clubId: id },
      select: { studentProfileId: true },
    })
    const enrolledStudentProfileIds = new Set(
      existingEnrollments.map((e) => e.studentProfileId)
    )

    // Map to student profile format and filter out already enrolled
    const eligibleStudents = enrollments
      .filter((enrollment) => {
        const studentProfileId = enrollment.student?.studentProfile?.id
        return studentProfileId && !enrolledStudentProfileIds.has(studentProfileId)
      })
      .map((enrollment) => ({
        id: enrollment.student!.studentProfile!.id,
        person: enrollment.student!.person,
        grade: enrollment.grade,
        studentId: enrollment.studentId,
      }))

    return NextResponse.json({ students: eligibleStudents })
  } catch (err) {
    console.error("Error fetching eligible students:", err)
    return NextResponse.json(
      { message: "Failed to fetch eligible students" },
      { status: 500 }
    )
  }
}
