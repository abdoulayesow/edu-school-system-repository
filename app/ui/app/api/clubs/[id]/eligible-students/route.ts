import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/clubs/[id]/eligible-students
 * Get all students eligible for a specific club based on eligibility rules
 *
 * DATA MODEL:
 * - Enrollment.studentId → Student.id (legacy table)
 * - StudentProfile.studentId → Student.id (links to legacy)
 * - StudentProfile.personId → Person.id (actual person record)
 * - ClubEnrollment.studentProfileId → StudentProfile.id
 *
 * FLOW:
 * 1. Get Enrollments matching criteria
 * 2. Get StudentProfiles via StudentProfile.studentId = Enrollment.studentId
 * 3. Get Person records via StudentProfile.personId
 * 4. Return Person.id as studentId for club enrollment creation
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
      studentId: { not: null }, // Only enrollments linked to a student
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
    // NOTE: Enrollment.studentId is actually Student.id (legacy table)
    const enrollments = await prisma.enrollment.findMany({
      where: enrollmentWhere,
      distinct: ["studentId"],
      select: {
        studentId: true, // This is Student.id (legacy), NOT Person.id!
        firstName: true,
        middleName: true,
        lastName: true,
        photoUrl: true,
        gradeId: true,
        fatherName: true,
        fatherPhone: true,
        fatherEmail: true,
        motherName: true,
        motherPhone: true,
        motherEmail: true,
        enrollingPersonName: true,
        enrollingPersonPhone: true,
        enrollingPersonEmail: true,
      },
      orderBy: [
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    })

    // Get unique legacy Student IDs from enrollments
    const legacyStudentIds = enrollments
      .map(e => e.studentId)
      .filter(Boolean) as string[]

    if (legacyStudentIds.length === 0) {
      return NextResponse.json({ students: [] })
    }

    // CRITICAL: Get StudentProfiles by matching StudentProfile.studentId = Enrollment.studentId
    // StudentProfile.studentId links to the legacy Student table
    const studentProfiles = await prisma.studentProfile.findMany({
      where: {
        studentId: { in: legacyStudentIds },
      },
      select: {
        id: true,
        personId: true,
        studentId: true, // Legacy Student.id
        currentGradeId: true,
      },
    })

    // Fetch the legacy Student records to get studentNumber for display
    const legacyStudents = await prisma.student.findMany({
      where: {
        id: { in: legacyStudentIds },
      },
      select: {
        id: true,
        studentNumber: true,
      },
    })

    // Create map: Student.id → studentNumber
    const studentNumberMap = new Map(
      legacyStudents.map(s => [s.id, s.studentNumber])
    )

    // Create map: legacy Student.id → StudentProfile
    const studentProfileByLegacyId = new Map(
      studentProfiles.map(sp => [sp.studentId, sp])
    )

    // Get Person IDs from StudentProfiles
    const personIds = studentProfiles.map(sp => sp.personId)

    // Fetch full Person records with personal details
    const persons = await prisma.person.findMany({
      where: {
        id: { in: personIds },
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        phone: true,
        email: true,
        photoUrl: true,
      },
    })

    // Create map: Person.id → Person
    const personMap = new Map(
      persons.map(p => [p.id, p])
    )

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

    const gradeMap = new Map(
      grades.map(g => [g.id, g])
    )

    // Get students already enrolled in this club
    const existingClubEnrollments = await prisma.clubEnrollment.findMany({
      where: {
        clubId: id,
        status: "active",
      },
      select: {
        studentProfileId: true,
      },
    })
    const enrolledStudentProfileIds = new Set(
      existingClubEnrollments.map((e) => e.studentProfileId)
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

    // Build eligible students list
    const eligibleStudents = enrollments
      .map((enrollment) => {
        // Get StudentProfile by legacy Student.id
        const studentProfile = studentProfileByLegacyId.get(enrollment.studentId!)
        if (!studentProfile) {
          // No StudentProfile linked to this enrollment - skip
          return null
        }

        // Skip if already enrolled in this club
        if (enrolledStudentProfileIds.has(studentProfile.id)) {
          return null
        }

        // Get Person record
        const person = personMap.get(studentProfile.personId)

        // Use current grade from student profile, fallback to enrollment grade
        const gradeId = studentProfile.currentGradeId || enrollment.gradeId
        const grade = gradeMap.get(gradeId)

        return {
          // IDs
          id: studentProfile.id, // StudentProfile.id (for display/reference)
          studentId: studentProfile.personId, // Person.id (for club enrollment creation!)
          formattedStudentId: studentNumberMap.get(studentProfile.studentId!) || null, // Actual student number for display

          // Person data with enrollment fallback
          person: {
            firstName: person?.firstName || enrollment.firstName || "",
            middleName: person?.middleName || enrollment.middleName || null,
            lastName: person?.lastName || enrollment.lastName || "",
            photoUrl: person?.photoUrl || enrollment.photoUrl,
            dateOfBirth: person?.dateOfBirth,
            gender: person?.gender,
            phone: person?.phone,
            email: person?.email,
          },

          // Parent/payer info from enrollment
          parentInfo: {
            fatherName: enrollment.fatherName,
            fatherPhone: enrollment.fatherPhone,
            motherName: enrollment.motherName,
            motherPhone: enrollment.motherPhone,
          },
          enrollmentPayerInfo: {
            fatherName: enrollment.fatherName,
            fatherPhone: enrollment.fatherPhone,
            fatherEmail: enrollment.fatherEmail,
            motherName: enrollment.motherName,
            motherPhone: enrollment.motherPhone,
            motherEmail: enrollment.motherEmail,
            enrollingPersonName: enrollment.enrollingPersonName,
            enrollingPersonPhone: enrollment.enrollingPersonPhone,
            enrollingPersonEmail: enrollment.enrollingPersonEmail,
          },

          // Grade info
          currentGrade: grade ? {
            id: grade.id,
            name: grade.name,
            level: grade.level,
          } : null,

          // Status and clubs
          studentStatus: "active" as const,
          clubEnrollments: clubEnrollmentsByStudent.get(studentProfile.id) || [],
        }
      })
      .filter((student): student is NonNullable<typeof student> => student !== null)

    return NextResponse.json({ students: eligibleStudents })
  } catch (err) {
    console.error("Error fetching eligible students:", err)
    return NextResponse.json(
      { message: "Failed to fetch eligible students" },
      { status: 500 }
    )
  }
}
