import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { renderToBuffer } from "@react-pdf/renderer"
import { PaymentReceiptDocument } from "@/lib/pdf/payment-receipt-document"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/payments/[id]/receipt-pdf
 * Generate and return a PDF receipt for a payment
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("receipts", "export")
  if (error) return error

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const language = (searchParams.get("lang") as "en" | "fr") || "fr"

  try {
    // Get payment with related data
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            student: {
              select: {
                studentNumber: true,
                firstName: true,
                lastName: true,
              },
            },
            grade: {
              select: { name: true },
            },
            schoolYear: {
              select: { name: true },
            },
            payments: {
              where: { status: "confirmed" },
              select: {
                amount: true,
                recordedAt: true,
                receiptNumber: true,
                method: true,
              },
              orderBy: { recordedAt: "asc" },
            },
          },
        },
        clubEnrollment: {
          include: {
            club: {
              select: { name: true, nameFr: true },
            },
            studentProfile: {
              select: {
                studentNumber: true,
                person: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        recorder: {
          select: { name: true },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      )
    }

    const isClubPayment = payment.paymentType === "club"

    // Validate based on payment type
    if (!isClubPayment) {
      if (!payment.enrollment) {
        return NextResponse.json(
          { message: "Enrollment not found for this payment" },
          { status: 404 }
        )
      }
      if (!payment.enrollment.student) {
        return NextResponse.json(
          { message: "Student not found for this enrollment" },
          { status: 404 }
        )
      }
    } else {
      if (!payment.clubEnrollment) {
        return NextResponse.json(
          { message: "Club enrollment not found for this payment" },
          { status: 404 }
        )
      }
    }

    // Parse payer info from notes
    let payer = undefined
    if (payment.notes) {
      try {
        const notesData = JSON.parse(payment.notes)
        if (notesData.payer) {
          payer = notesData.payer
        }
      } catch {
        // Notes is not JSON, ignore
      }
    }

    // Get payment history for this student/enrollment
    let paymentHistory: Array<{
      receiptNumber: string
      amount: number
      recordedAt: string
      method: string
    }> = []

    if (isClubPayment && payment.clubEnrollment) {
      // Get all club payments for this club enrollment
      const clubPayments = await prisma.payment.findMany({
        where: {
          clubEnrollmentId: payment.clubEnrollmentId,
          status: "confirmed",
        },
        select: {
          receiptNumber: true,
          amount: true,
          recordedAt: true,
          method: true,
        },
        orderBy: { recordedAt: "asc" },
      })
      paymentHistory = clubPayments.map((p) => ({
        receiptNumber: p.receiptNumber,
        amount: p.amount,
        recordedAt: p.recordedAt.toISOString(),
        method: p.method,
      }))
    } else if (payment.enrollment) {
      // Use tuition payments from enrollment
      paymentHistory = payment.enrollment.payments.map((p) => ({
        receiptNumber: p.receiptNumber,
        amount: p.amount,
        recordedAt: p.recordedAt.toISOString(),
        method: p.method,
      }))
    }

    // Prepare receipt data based on payment type
    let receiptData: any

    if (isClubPayment && payment.clubEnrollment) {
      // Club payment receipt
      const clubName = language === "fr"
        ? payment.clubEnrollment.club.nameFr || payment.clubEnrollment.club.name
        : payment.clubEnrollment.club.name

      receiptData = {
        paymentId: payment.id,
        receiptNumber: payment.receiptNumber,
        amount: payment.amount,
        method: payment.method as "cash" | "orange_money",
        transactionRef: payment.transactionRef || undefined,
        recordedAt: payment.recordedAt.toISOString(),
        recorderName: payment.recorder?.name ?? undefined,
        studentNumber: payment.clubEnrollment.studentProfile?.studentNumber ?? "",
        studentFirstName: payment.clubEnrollment.studentProfile?.person.firstName ?? "",
        studentLastName: payment.clubEnrollment.studentProfile?.person.lastName ?? "",
        clubName,
        paymentType: "club" as const,
        paymentHistory,
        payer,
      }
    } else if (payment.enrollment) {
      // Tuition payment receipt
      const tuitionFee = payment.enrollment.adjustedTuitionFee || payment.enrollment.originalTuitionFee
      const totalPaidBefore = payment.enrollment.payments
        .filter((p) => new Date(p.recordedAt) < new Date(payment.recordedAt))
        .reduce((sum, p) => sum + p.amount, 0)
      const remainingAfter = tuitionFee - totalPaidBefore - payment.amount

      receiptData = {
        paymentId: payment.id,
        receiptNumber: payment.receiptNumber,
        amount: payment.amount,
        method: payment.method as "cash" | "orange_money",
        transactionRef: payment.transactionRef || undefined,
        recordedAt: payment.recordedAt.toISOString(),
        recorderName: payment.recorder?.name ?? undefined,
        studentNumber: payment.enrollment.student?.studentNumber ?? "",
        studentFirstName: payment.enrollment.student?.firstName ?? "",
        studentLastName: payment.enrollment.student?.lastName ?? "",
        gradeName: payment.enrollment.grade?.name ?? "",
        schoolYearName: payment.enrollment.schoolYear?.name ?? "",
        tuitionFee,
        totalPaidBefore,
        remainingAfter: Math.max(0, remainingAfter),
        paymentType: "tuition" as const,
        paymentHistory,
        payer,
      }
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      PaymentReceiptDocument({ data: receiptData, language })
    )

    // Return PDF - convert Buffer to Uint8Array for NextResponse
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${payment.receiptNumber}.pdf"`,
      },
    })
  } catch (err) {
    console.error("Error generating payment receipt PDF:", err)
    return NextResponse.json(
      { message: "Failed to generate receipt" },
      { status: 500 }
    )
  }
}
