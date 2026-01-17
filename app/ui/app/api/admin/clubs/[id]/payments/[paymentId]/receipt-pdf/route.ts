import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { renderToBuffer } from "@react-pdf/renderer"
import { ClubPaymentReceiptDocument } from "@/lib/pdf/club-payment-receipt-document"

interface RouteParams {
  params: Promise<{ id: string; paymentId: string }>
}

/**
 * GET /api/admin/clubs/[id]/payments/[paymentId]/receipt-pdf
 * Generate and return a PDF receipt for a club payment
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("receipts", "export")
  if (error) return error

  const { id: clubId, paymentId } = await params
  const { searchParams } = new URL(req.url)
  const language = (searchParams.get("lang") as "en" | "fr") || "fr"

  try {
    // Get club payment with related data
    const payment = await prisma.clubPayment.findUnique({
      where: { id: paymentId },
      include: {
        club: {
          include: {
            category: {
              select: { name: true, nameFr: true },
            },
            schoolYear: {
              select: { name: true, id: true },
            },
          },
        },
        clubEnrollment: {
          include: {
            studentProfile: {
              include: {
                person: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
            monthlyPayments: {
              orderBy: [{ year: "asc" }, { month: "asc" }],
            },
          },
        },
        recorder: {
          select: { name: true },
        },
        // Get the monthly payments linked to this club payment
        monthlyPayments: {
          take: 1,
          select: { month: true, year: true },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      )
    }

    if (payment.clubId !== clubId) {
      return NextResponse.json(
        { message: "Payment does not belong to this club" },
        { status: 400 }
      )
    }

    // Get student grade (from the enrollment's student profile)
    const studentProfile = payment.clubEnrollment?.studentProfile
    if (!studentProfile) {
      return NextResponse.json(
        { message: "Student not found for this payment" },
        { status: 404 }
      )
    }

    // Fetch the student's current enrollment to get grade info
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: studentProfile.person.id,
        schoolYearId: payment.club.schoolYear.id,
      },
      include: {
        grade: {
          select: { name: true },
        },
      },
    })

    const gradeName = enrollment?.grade?.name ?? "-"

    // Calculate payment progress
    const allMonthlyPayments = payment.clubEnrollment?.monthlyPayments ?? []
    const totalMonths = allMonthlyPayments.length
    const monthsPaid = allMonthlyPayments.filter((mp) => mp.isPaid).length

    // Get month from the associated monthly payment record (if linked)
    const linkedMonthlyPayment = payment.monthlyPayments[0]
    const month = linkedMonthlyPayment?.month ?? new Date(payment.recordedAt).getMonth() + 1
    const year = linkedMonthlyPayment?.year ?? new Date(payment.recordedAt).getFullYear()

    // Prepare receipt data
    const receiptData = {
      paymentId: payment.id,
      receiptNumber: payment.receiptNumber,
      amount: payment.amount,
      method: payment.method as "cash" | "orange_money",
      recordedAt: payment.recordedAt.toISOString(),
      recorderName: payment.recorder?.name ?? undefined,
      clubName: payment.club.name,
      clubNameFr: payment.club.nameFr ?? undefined,
      categoryName: language === "fr"
        ? payment.club.category?.nameFr ?? payment.club.category?.name
        : payment.club.category?.name ?? payment.club.category?.nameFr,
      month,
      year,
      studentFirstName: studentProfile.person.firstName,
      studentLastName: studentProfile.person.lastName ?? "",
      gradeName,
      schoolYearName: payment.club.schoolYear.name,
      totalMonths: totalMonths > 0 ? totalMonths : undefined,
      monthsPaid: totalMonths > 0 ? monthsPaid : undefined,
      monthlyFee: payment.club.monthlyFee ?? undefined,
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      ClubPaymentReceiptDocument({ data: receiptData, language })
    )

    // Return PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="club-receipt-${payment.receiptNumber}.pdf"`,
      },
    })
  } catch (err) {
    console.error("Error generating club payment receipt PDF:", err)
    return NextResponse.json(
      { message: "Failed to generate receipt" },
      { status: 500 }
    )
  }
}
