import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/students
 * List all students with filters
 */
export async function GET(req: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search")
  const gradeId = searchParams.get("gradeId")
  const schoolYearId = searchParams.get("schoolYearId")
  const status = searchParams.get("status") || "active"
  const paymentStatus = searchParams.get("paymentStatus") // late, on_time, in_advance, complete
  const attendanceStatus = searchParams.get("attendanceStatus") // good, concerning, critical
  const limit = parseInt(searchParams.get("limit") || "50")
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    // Get active school year if not provided
    let activeSchoolYearId = schoolYearId
    if (!activeSchoolYearId) {
      const activeYear = await prisma.schoolYear.findFirst({
        where: { isActive: true },
        select: { id: true },
      })
      activeSchoolYearId = activeYear?.id ?? null
    }

    // Build where clause for students
    const where: Record<string, unknown> = {
      status,
    }

    // Search filter (firstName, lastName, studentNumber)
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { studentNumber: { contains: search, mode: "insensitive" } },
      ]
    }

    // Grade filter through enrollment
    if (gradeId && activeSchoolYearId) {
      where.enrollments = {
        some: {
          gradeId,
          schoolYearId: activeSchoolYearId,
          status: "completed",
        },
      }
    } else if (activeSchoolYearId) {
      where.enrollments = {
        some: {
          schoolYearId: activeSchoolYearId,
          status: "completed",
        },
      }
    }

    // Get students with enrollment and payment info
    const students = await prisma.student.findMany({
      where,
      include: {
        studentProfile: {
          include: {
            person: {
              select: {
                id: true,
                photoUrl: true,
              },
            },
            roomAssignments: activeSchoolYearId
              ? {
                  where: { isActive: true, schoolYearId: activeSchoolYearId },
                  include: {
                    gradeRoom: {
                      select: { id: true, name: true, displayName: true },
                    },
                  },
                  take: 1,
                }
              : undefined,
          },
        },
        enrollments: {
          where: activeSchoolYearId
            ? {
                schoolYearId: activeSchoolYearId,
                status: "completed",
              }
            : { status: "completed" },
          include: {
            grade: {
              select: { id: true, name: true, level: true, order: true },
            },
            payments: {
              where: { status: "confirmed" },
              select: { amount: true },
            },
          },
          take: 1,
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      take: limit,
      skip: offset,
    })

    // Get total count
    const total = await prisma.student.count({ where })

    // Calculate payment and attendance status for each student
    const studentsWithStatus = await Promise.all(
      students.map(async (student) => {
        const enrollment = student.enrollments[0]
        let paymentStatusValue = null
        let attendanceStatusValue = null
        let balanceInfo = null

        if (enrollment) {
          // Calculate payment status
          const tuitionFee = enrollment.adjustedTuitionFee || enrollment.originalTuitionFee
          const totalPaid = enrollment.payments.reduce((sum, p) => sum + p.amount, 0)
          const remainingBalance = tuitionFee - totalPaid
          const paymentPercentage = Math.round((totalPaid / tuitionFee) * 100)

          // Determine expected payment based on current month
          const now = new Date()
          const enrollmentStart = new Date(enrollment.createdAt)
          const monthsEnrolled = Math.max(
            1,
            (now.getFullYear() - enrollmentStart.getFullYear()) * 12 +
              (now.getMonth() - enrollmentStart.getMonth()) +
              1
          )
          const expectedPaymentPercentage = Math.min(100, monthsEnrolled * 10) // ~10% per month

          if (paymentPercentage >= 100) {
            paymentStatusValue = "complete"
          } else if (paymentPercentage >= expectedPaymentPercentage) {
            paymentStatusValue = paymentPercentage > expectedPaymentPercentage + 10 ? "in_advance" : "on_time"
          } else {
            paymentStatusValue = "late"
          }

          balanceInfo = {
            tuitionFee,
            totalPaid,
            remainingBalance,
            paymentPercentage,
          }
        }

        // Calculate attendance status if student has profile
        if (student.studentProfile) {
          const attendanceStats = await prisma.attendanceRecord.groupBy({
            by: ["status"],
            where: {
              studentProfileId: student.studentProfile.id,
            },
            _count: true,
          })

          const totalRecords = attendanceStats.reduce((sum, s) => sum + s._count, 0)
          const presentCount =
            attendanceStats
              .filter((s) => ["present", "late", "excused"].includes(s.status))
              .reduce((sum, s) => sum + s._count, 0)

          if (totalRecords > 0) {
            const attendanceRate = Math.round((presentCount / totalRecords) * 100)
            if (attendanceRate >= 90) {
              attendanceStatusValue = "good"
            } else if (attendanceRate >= 70) {
              attendanceStatusValue = "concerning"
            } else {
              attendanceStatusValue = "critical"
            }
          }
        }

        // Get room assignment
        const roomAssignment = student.studentProfile?.roomAssignments?.[0] as
          | { id: string; gradeRoom: { id: string; name: string; displayName: string | null } }
          | undefined

        return {
          id: student.id,
          studentNumber: student.studentNumber,
          firstName: student.firstName,
          lastName: student.lastName,
          dateOfBirth: student.dateOfBirth,
          email: student.email,
          status: student.status,
          photoUrl: student.studentProfile?.person?.photoUrl,
          grade: enrollment?.grade,
          roomAssignment: roomAssignment
            ? {
                id: roomAssignment.id,
                gradeRoom: roomAssignment.gradeRoom,
              }
            : null,
          paymentStatus: paymentStatusValue,
          enrollmentStatus: enrollment?.status || null,
          attendanceStatus: attendanceStatusValue,
          balanceInfo,
        }
      })
    )

    // Apply client-side filters for payment and attendance status
    let filteredStudents = studentsWithStatus
    if (paymentStatus) {
      filteredStudents = filteredStudents.filter((s) => s.paymentStatus === paymentStatus)
    }
    if (attendanceStatus) {
      filteredStudents = filteredStudents.filter((s) => s.attendanceStatus === attendanceStatus)
    }

    return NextResponse.json({
      students: filteredStudents,
      pagination: {
        total,
        filteredTotal: filteredStudents.length,
        limit,
        offset,
        hasMore: offset + students.length < total,
      },
    })
  } catch (err) {
    console.error("Error fetching students:", err)
    return NextResponse.json(
      { message: "Failed to fetch students" },
      { status: 500 }
    )
  }
}
