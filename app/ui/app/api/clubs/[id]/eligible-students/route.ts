import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/clubs/[id]/eligible-students
 * Get all students eligible for a specific club based on eligibility rules
 * Public endpoint for enrollment wizard (requires authentication but not admin permissions)
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession()
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
      select: {
        studentId: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        gradeId: true,
      },
      orderBy: [
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    })

    // Get unique student IDs (Person IDs)
    const personIds = enrollments
      .map(e => e.studentId)
      .filter(Boolean) as string[]

    // Fetch student profiles with formatted student IDs
    const studentProfiles = await prisma.studentProfile.findMany({
      where: {
        personId: { in: personIds },
      },
      select: {
        id: true,
        personId: true,
        studentId: true,
        currentGradeId: true,
      },
    })

    // Fetch grades for display
    const gradeIds = Array.from(new Set([
      ...enrollments.map(e => e.gradeId),
      ...studentProfiles.map(sp => sp.currentGradeId).filter(Boolean)
    ])) as string[]

    const grades = await prisma.grade.findMany({
      where: { id: { in: gradeIds } },
      select: {
        id: true,
        name: true,
        level: true,
      },
    })

    // Create maps for quick lookup
    const studentProfileMap = new Map(
      studentProfiles.map(sp => [sp.personId, sp])
    )
    const gradeMap = new Map(
      grades.map(g => [g.id, g])
    )

    // Get students already enrolled in this club
    const existingEnrollments = await prisma.clubEnrollment.findMany({
      where: {
        clubId: id,
        status: "active",
      },
      select: {
        studentProfileId: true,
      },
    })
    const enrolledStudentProfileIds = new Set(
      existingEnrollments.map((e) => e.studentProfileId)
    )

    // Get all club enrollments for eligible students to show current clubs
    const studentProfileIds = studentProfiles.map(sp => sp.id)

    const allClubEnrollments = await prisma.clubEnrollment.findMany({
      where: {
        studentProfileId: { in: studentProfileIds },
        status: "active",
      },
      select: {
        studentProfileId: true,
        club: {
          select: {
            name: true,
          },
        },
      },
    })

    // Group club enrollments by student profile ID
    const clubEnrollmentsByStudent = new Map<string, Array<{ club: { name: string } }>>()
    allClubEnrollments.forEach((enrollment) => {
      const existing = clubEnrollmentsByStudent.get(enrollment.studentProfileId) || []
      existing.push({ club: enrollment.club })
      clubEnrollmentsByStudent.set(enrollment.studentProfileId, existing)
    })

    // Map to student profile format and filter out already enrolled
    const eligibleStudents = enrollments
      .map((enrollment) => {
        const studentProfile = studentProfileMap.get(enrollment.studentId!)
        if (!studentProfile) return null

        // Use current grade from student profile, fallback to enrollment grade
        const gradeId = studentProfile.currentGradeId || enrollment.gradeId
        const grade = gradeMap.get(gradeId)

        return {
          studentProfileId: studentProfile.id,
          personId: enrollment.studentId!,
          firstName: enrollment.firstName,
          lastName: enrollment.lastName,
          photoUrl: enrollment.photoUrl,
          grade: grade || null,
          formattedStudentId: studentProfile.studentId,
        }
      })
      .filter((student): student is NonNullable<typeof student> => {
        if (!student) return false
        return !enrolledStudentProfileIds.has(student.studentProfileId)
      })
      .map((student) => ({
        id: student.studentProfileId,
        studentId: student.personId, // Person ID for enrollment creation
        formattedStudentId: student.formattedStudentId,
        person: {
          firstName: student.firstName,
          lastName: student.lastName,
          photoUrl: student.photoUrl,
        },
        currentGrade: student.grade ? {
          id: student.grade.id,
          name: student.grade.name,
          level: student.grade.level,
        } : null,
        studentStatus: "active",
        clubEnrollments: clubEnrollmentsByStudent.get(student.studentProfileId) || [],
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
