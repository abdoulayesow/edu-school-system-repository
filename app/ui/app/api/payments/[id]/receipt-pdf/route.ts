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
              select: { amount: true, recordedAt: true },
              orderBy: { recordedAt: "asc" },
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

    // Check student exists on enrollment
    if (!payment.enrollment.student) {
      return NextResponse.json(
        { message: "Student not found for this enrollment" },
        { status: 404 }
      )
    }

    // Calculate total paid before this payment
    const tuitionFee = payment.enrollment.adjustedTuitionFee || payment.enrollment.originalTuitionFee
    const totalPaidBefore = payment.enrollment.payments
      .filter((p) => new Date(p.recordedAt) < new Date(payment.recordedAt))
      .reduce((sum, p) => sum + p.amount, 0)
    const remainingAfter = tuitionFee - totalPaidBefore - payment.amount

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

    // Prepare receipt data
    const receiptData = {
      paymentId: payment.id,
      receiptNumber: payment.receiptNumber,
      amount: payment.amount,
      method: payment.method as "cash" | "orange_money",
      transactionRef: payment.transactionRef || undefined,
      recordedAt: payment.recordedAt.toISOString(),
      recorderName: payment.recorder?.name ?? undefined,
      studentNumber: payment.enrollment.student.studentNumber ?? "",
      studentFirstName: payment.enrollment.student.firstName,
      studentLastName: payment.enrollment.student.lastName ?? "",
      gradeName: payment.enrollment.grade.name,
      schoolYearName: payment.enrollment.schoolYear.name,
      tuitionFee,
      totalPaidBefore,
      remainingAfter: Math.max(0, remainingAfter),
      payer,
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
