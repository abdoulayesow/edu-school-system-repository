import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/grades/[id]/students
 * Get all students enrolled in a grade
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("classes", "view")
  if (error) return error

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search")

  try {
    // Verify grade exists
    const grade = await prisma.grade.findUnique({
      where: { id },
      include: {
        schoolYear: { select: { id: true, name: true, isActive: true } },
      },
    })

    if (!grade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    // Build enrollment filter
    const enrollmentWhere: Record<string, unknown> = {
      gradeId: id,
      schoolYearId: grade.schoolYearId,
      status: "completed",
    }

    if (search) {
      enrollmentWhere.student = {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { studentNumber: { contains: search, mode: "insensitive" } },
        ],
      }
    }

    const enrollments = await prisma.enrollment.findMany({
      where: enrollmentWhere,
      include: {
        student: {
          include: {
            studentProfile: {
              include: {
                person: {
                  select: { photoUrl: true },
                },
              },
            },
          },
        },
        payments: {
          where: { status: "confirmed" },
          select: { amount: true },
        },
      },
      orderBy: {
        student: { lastName: "asc" },
      },
    })

    // Get attendance for each student
    const students = await Promise.all(
      enrollments.map(async (enrollment) => {
        const student = enrollment.student
        if (!student) return null

        // Calculate payment status
        const tuition = enrollment.adjustedTuitionFee || enrollment.originalTuitionFee
        const paid = enrollment.payments.reduce((sum, p) => sum + p.amount, 0)
        const paymentPercentage = Math.round((paid / tuition) * 100)

        let paymentStatus = "on_time"
        if (paymentPercentage >= 100) {
          paymentStatus = "complete"
        } else if (paymentPercentage < 40) {
          paymentStatus = "late"
        }

        // Get attendance if student has profile
        let attendanceRate = null
        let attendanceStatus = null

        if (student.studentProfile) {
          const attendanceStats = await prisma.attendanceRecord.groupBy({
            by: ["status"],
            where: {
              studentProfileId: student.studentProfile.id,
            },
            _count: true,
          })

          const total = attendanceStats.reduce((sum, s) => sum + s._count, 0)
          const present = attendanceStats
            .filter((s) => ["present", "late", "excused"].includes(s.status))
            .reduce((sum, s) => sum + s._count, 0)

          if (total > 0) {
            attendanceRate = Math.round((present / total) * 100)
            if (attendanceRate >= 90) {
              attendanceStatus = "good"
            } else if (attendanceRate >= 70) {
              attendanceStatus = "concerning"
            } else {
              attendanceStatus = "critical"
            }
          }
        }

        return {
          id: student.id,
          studentNumber: student.studentNumber,
          firstName: student.firstName,
          lastName: student.lastName,
          dateOfBirth: student.dateOfBirth,
          photoUrl: student.studentProfile?.person?.photoUrl,
          studentProfileId: student.studentProfile?.id,
          enrollmentId: enrollment.id,
          paymentStatus,
          paymentPercentage,
          attendanceRate,
          attendanceStatus,
        }
      })
    )

    const filteredStudents = students.filter(Boolean)

    return NextResponse.json({
      grade: {
        id: grade.id,
        name: grade.name,
        level: grade.level,
        schoolYear: grade.schoolYear,
      },
      students: filteredStudents,
      total: filteredStudents.length,
    })
  } catch (err) {
    console.error("Error fetching grade students:", err)
    return NextResponse.json(
      { message: "Failed to fetch grade students" },
      { status: 500 }
    )
  }
}
