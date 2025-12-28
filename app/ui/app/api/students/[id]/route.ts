import { NextRequest, NextResponse } from "next/server"
import { requireSession, requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

// Schema for updating a student
const updateStudentSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  dateOfBirth: z.string().transform((s) => new Date(s)).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.enum(["active", "inactive", "transferred", "graduated"]).optional(),
})

/**
 * GET /api/students/[id]
 * Get a single student with full details
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params

  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        studentProfile: {
          include: {
            person: {
              select: {
                id: true,
                photoUrl: true,
                gender: true,
                address: true,
                phone: true,
              },
            },
            currentGrade: {
              select: { id: true, name: true, level: true },
            },
          },
        },
        enrollments: {
          include: {
            grade: {
              select: { id: true, name: true, level: true, order: true },
            },
            schoolYear: {
              select: { id: true, name: true, isActive: true },
            },
            payments: {
              include: {
                recorder: { select: { name: true } },
                reviewer: { select: { name: true } },
              },
              orderBy: { recordedAt: "desc" },
            },
          },
          orderBy: { schoolYear: { startDate: "desc" } },
        },
      },
    })

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      )
    }

    // Get active enrollment for balance calculation
    const activeEnrollment = student.enrollments.find(
      (e) => e.schoolYear.isActive && e.status === "completed"
    )

    let balanceInfo = null
    if (activeEnrollment) {
      const tuitionFee = activeEnrollment.adjustedTuitionFee || activeEnrollment.originalTuitionFee
      const confirmedPayments = activeEnrollment.payments.filter((p) => p.status === "confirmed")
      const totalPaid = confirmedPayments.reduce((sum, p) => sum + p.amount, 0)
      const remainingBalance = tuitionFee - totalPaid
      const paymentPercentage = Math.round((totalPaid / tuitionFee) * 100)

      // Determine status
      const now = new Date()
      const enrollmentStart = new Date(activeEnrollment.createdAt)
      const monthsEnrolled = Math.max(
        1,
        (now.getFullYear() - enrollmentStart.getFullYear()) * 12 +
          (now.getMonth() - enrollmentStart.getMonth()) +
          1
      )
      const expectedPaymentPercentage = Math.min(100, monthsEnrolled * 10)

      let paymentStatus = "on_time"
      if (paymentPercentage >= 100) {
        paymentStatus = "complete"
      } else if (paymentPercentage > expectedPaymentPercentage + 10) {
        paymentStatus = "in_advance"
      } else if (paymentPercentage < expectedPaymentPercentage) {
        paymentStatus = "late"
      }

      balanceInfo = {
        tuitionFee,
        totalPaid,
        remainingBalance,
        paymentPercentage,
        paymentStatus,
        expectedPaymentPercentage,
      }
    }

    // Get attendance summary if student has profile
    let attendanceSummary = null
    if (student.studentProfile) {
      const attendanceStats = await prisma.attendanceRecord.groupBy({
        by: ["status"],
        where: {
          studentProfileId: student.studentProfile.id,
        },
        _count: true,
      })

      const summary = {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        attendanceRate: 0,
      }

      for (const stat of attendanceStats) {
        const statusKey = stat.status as keyof typeof summary
        if (typeof summary[statusKey] === "number") {
          summary[statusKey] = stat._count
        }
        summary.total += stat._count
      }

      if (summary.total > 0) {
        summary.attendanceRate = Math.round(
          ((summary.present + summary.late + summary.excused) / summary.total) * 100
        )
      }

      attendanceSummary = summary
    }

    return NextResponse.json({
      ...student,
      balanceInfo,
      attendanceSummary,
    })
  } catch (err) {
    console.error("Error fetching student:", err)
    return NextResponse.json(
      { message: "Failed to fetch student" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/students/[id]
 * Update student information
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireRole(["director", "secretary"])
  if (error) return error

  const { id } = await params

  try {
    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: {
        studentProfile: {
          include: { person: true },
        },
      },
    })

    if (!existingStudent) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      )
    }

    const body = await req.json()
    const validated = updateStudentSchema.parse(body)

    // Update student and related person in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update student record
      const student = await tx.student.update({
        where: { id },
        data: {
          firstName: validated.firstName,
          lastName: validated.lastName,
          dateOfBirth: validated.dateOfBirth,
          email: validated.email,
          status: validated.status,
        },
      })

      // Update person record if exists
      if (existingStudent.studentProfile?.person) {
        await tx.person.update({
          where: { id: existingStudent.studentProfile.person.id },
          data: {
            firstName: validated.firstName,
            lastName: validated.lastName,
            dateOfBirth: validated.dateOfBirth,
            email: validated.email,
            phone: validated.phone,
            address: validated.address,
          },
        })
      }

      return student
    })

    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating student:", err)
    return NextResponse.json(
      { message: "Failed to update student" },
      { status: 500 }
    )
  }
}
