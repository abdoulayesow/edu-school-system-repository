import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { renderToBuffer } from "@react-pdf/renderer"
import { StudentPaymentSummaryDocument } from "@/lib/pdf/student-payment-summary-document"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/students/[id]/payments/summary-pdf
 * Generate and return a comprehensive payment summary PDF for a student
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("receipts", "export")
  if (error) return error

  const { id: studentId } = await params
  const { searchParams } = new URL(req.url)
  const language = (searchParams.get("lang") as "en" | "fr") || "fr"

  try {
    // Fetch student basic info
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        studentNumber: true,
        firstName: true,
        lastName: true,
      },
    })

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 })
    }

    // Get active enrollment (current school year, completed status)
    const activeYear = await prisma.schoolYear.findFirst({
      where: { isActive: true },
    })

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: studentId,
        status: "completed",
        schoolYearId: activeYear?.id,
      },
      include: {
        grade: {
          select: { name: true },
        },
        schoolYear: {
          select: { name: true },
        },
        paymentSchedules: {
          orderBy: { scheduleNumber: "asc" },
        },
      },
    })

    // Fetch ALL confirmed payments for this student (tuition + club)
    const payments = await prisma.payment.findMany({
      where: {
        OR: [
          {
            enrollment: {
              studentId: studentId,
            },
          },
          {
            clubEnrollment: {
              studentProfile: {
                studentId: studentId,
              },
            },
          },
        ],
        status: "confirmed",
      },
      include: {
        enrollment: {
          include: {
            grade: {
              select: { name: true },
            },
          },
        },
        clubEnrollment: {
          include: {
            club: {
              select: { name: true, nameFr: true },
            },
          },
        },
      },
      orderBy: { recordedAt: "desc" },
    })

    // Calculate summary statistics
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    const tuitionPaid = payments
      .filter((p) => p.paymentType === "tuition")
      .reduce((sum, p) => sum + p.amount, 0)
    const clubPaid = payments
      .filter((p) => p.paymentType === "club")
      .reduce((sum, p) => sum + p.amount, 0)
    const cashTotal = payments
      .filter((p) => p.method === "cash")
      .reduce((sum, p) => sum + p.amount, 0)
    const omTotal = payments
      .filter((p) => p.method === "orange_money")
      .reduce((sum, p) => sum + p.amount, 0)

    // Calculate tuition balance (if enrolled)
    let tuitionFee: number | undefined
    let remainingBalance: number | undefined
    let paymentPercentage: number | undefined

    if (enrollment) {
      tuitionFee = enrollment.adjustedTuitionFee || enrollment.originalTuitionFee
      remainingBalance = Math.max(0, tuitionFee - tuitionPaid)
      paymentPercentage = tuitionFee > 0 ? (tuitionPaid / tuitionFee) * 100 : 0
    }

    // Map payment schedules (using waterfall allocation like balance route)
    let remainingPaymentsForSchedule = tuitionPaid
    const schedules = enrollment?.paymentSchedules.map((schedule) => {
      const allocated = Math.min(remainingPaymentsForSchedule, schedule.amount)
      remainingPaymentsForSchedule -= allocated

      const isPaid = allocated >= schedule.amount

      return {
        scheduleNumber: schedule.scheduleNumber,
        amount: schedule.amount,
        months: schedule.months,
        dueDate: schedule.dueDate.toISOString(),
        isPaid,
        paidAmount: allocated,
      }
    })

    // Map payment history
    const paymentHistory = payments.map((payment) => {
      let clubName: string | undefined
      if (payment.paymentType === "club" && payment.clubEnrollment?.club) {
        clubName =
          language === "fr"
            ? payment.clubEnrollment.club.nameFr || payment.clubEnrollment.club.name
            : payment.clubEnrollment.club.name
      }

      return {
        receiptNumber: payment.receiptNumber,
        amount: payment.amount,
        recordedAt: payment.recordedAt.toISOString(),
        method: payment.method,
        paymentType: payment.paymentType as "tuition" | "club",
        clubName,
      }
    })

    // Prepare summary data
    const summaryData = {
      studentNumber: student.studentNumber || "",
      studentFirstName: student.firstName,
      studentLastName: student.lastName,
      gradeName: enrollment?.grade?.name,
      schoolYearName: enrollment?.schoolYear?.name,
      tuitionFee,
      totalPaid,
      remainingBalance,
      paymentPercentage,
      tuitionPaid,
      clubPaid,
      cashTotal,
      omTotal,
      paymentCount: payments.length,
      payments: paymentHistory,
      schedules,
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      StudentPaymentSummaryDocument({ data: summaryData, language })
    )

    // Return PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="payment-summary-${student.studentNumber}.pdf"`,
      },
    })
  } catch (err) {
    console.error("Error generating payment summary PDF:", err)
    return NextResponse.json(
      { message: "Failed to generate payment summary" },
      { status: 500 }
    )
  }
}
