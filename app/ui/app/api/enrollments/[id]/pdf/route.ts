import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { renderToBuffer } from "@react-pdf/renderer"
import { EnrollmentDocument } from "@/lib/pdf/enrollment-document"
import React from "react"
import type { EnrollmentSummary, Enrollment, SchoolYear, Grade, PaymentSchedule, Payment, EnrollmentNote } from "@/lib/enrollment/types"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/enrollments/[id]/pdf
 * Generate and return a PDF document for the enrollment
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params

  // Get language from query params (default: fr)
  const searchParams = req.nextUrl.searchParams
  const language = (searchParams.get("lang") || "fr") as "en" | "fr"

  try {
    // Fetch enrollment with all related data
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        grade: true,
        schoolYear: true,
        student: true,
        paymentSchedules: {
          orderBy: { scheduleNumber: "asc" },
        },
        payments: {
          where: { status: "confirmed" },
          orderBy: { recordedAt: "desc" },
        },
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 404 }
      )
    }

    // Calculate totals
    const totalPaid = enrollment.payments.reduce((sum, p) => sum + p.amount, 0)
    const tuitionFee = enrollment.adjustedTuitionFee || enrollment.originalTuitionFee
    const totalOwed = tuitionFee - totalPaid

    // Transform to the expected type structure
    const enrollmentData: Enrollment = {
      id: enrollment.id,
      enrollmentNumber: enrollment.enrollmentNumber ?? undefined,
      studentId: enrollment.studentId ?? undefined,
      schoolYearId: enrollment.schoolYearId,
      gradeId: enrollment.gradeId,
      firstName: enrollment.firstName,
      lastName: enrollment.lastName,
      dateOfBirth: enrollment.dateOfBirth ?? undefined,
      gender: enrollment.gender as "male" | "female" | undefined,
      phone: enrollment.phone ?? undefined,
      email: enrollment.email ?? undefined,
      photoUrl: enrollment.photoUrl ?? undefined,
      birthCertificateUrl: enrollment.birthCertificateUrl ?? undefined,
      fatherName: enrollment.fatherName ?? undefined,
      fatherPhone: enrollment.fatherPhone ?? undefined,
      fatherEmail: enrollment.fatherEmail ?? undefined,
      motherName: enrollment.motherName ?? undefined,
      motherPhone: enrollment.motherPhone ?? undefined,
      motherEmail: enrollment.motherEmail ?? undefined,
      address: enrollment.address ?? undefined,
      originalTuitionFee: enrollment.originalTuitionFee,
      adjustedTuitionFee: enrollment.adjustedTuitionFee ?? undefined,
      adjustmentReason: enrollment.adjustmentReason ?? undefined,
      status: enrollment.status as Enrollment["status"],
      currentStep: enrollment.currentStep,
      isReturningStudent: enrollment.isReturningStudent,
      draftExpiresAt: enrollment.draftExpiresAt ?? undefined,
      submittedAt: enrollment.submittedAt ?? undefined,
      approvedAt: enrollment.approvedAt ?? undefined,
      approvedBy: enrollment.approvedBy ?? undefined,
      autoApproveAt: enrollment.autoApproveAt ?? undefined,
      createdBy: enrollment.createdBy,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
    }

    const schoolYear: SchoolYear = {
      id: enrollment.schoolYear.id,
      name: enrollment.schoolYear.name,
      startDate: enrollment.schoolYear.startDate,
      endDate: enrollment.schoolYear.endDate,
      enrollmentStart: enrollment.schoolYear.enrollmentStart,
      enrollmentEnd: enrollment.schoolYear.enrollmentEnd,
      isActive: enrollment.schoolYear.isActive,
      createdAt: enrollment.schoolYear.createdAt,
      updatedAt: enrollment.schoolYear.updatedAt,
    }

    const grade: Grade = {
      id: enrollment.grade.id,
      name: enrollment.grade.name,
      level: enrollment.grade.level as Grade["level"],
      order: enrollment.grade.order,
      tuitionFee: enrollment.grade.tuitionFee,
      schoolYearId: enrollment.grade.schoolYearId,
      createdAt: enrollment.grade.createdAt,
      updatedAt: enrollment.grade.updatedAt,
    }

    const paymentSchedules: PaymentSchedule[] = enrollment.paymentSchedules.map((ps) => ({
      id: ps.id,
      enrollmentId: ps.enrollmentId,
      scheduleNumber: ps.scheduleNumber,
      amount: ps.amount,
      months: ps.months as string[],
      dueDate: ps.dueDate,
      isPaid: ps.isPaid,
      paidAt: ps.paidAt ?? undefined,
      createdAt: ps.createdAt,
      updatedAt: ps.updatedAt,
    }))

    const payments: Payment[] = enrollment.payments.map((p) => ({
      id: p.id,
      enrollmentId: p.enrollmentId,
      paymentScheduleId: p.paymentScheduleId ?? undefined,
      amount: p.amount,
      method: p.method as Payment["method"],
      status: p.status as Payment["status"],
      receiptNumber: p.receiptNumber,
      transactionRef: p.transactionRef ?? undefined,
      receiptImageUrl: p.receiptImageUrl ?? undefined,
      recordedBy: p.recordedBy,
      recordedAt: p.recordedAt,
      confirmedBy: p.confirmedBy ?? undefined,
      confirmedAt: p.confirmedAt ?? undefined,
      notes: p.notes ?? undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }))

    const notes: EnrollmentNote[] = enrollment.notes.map((n) => ({
      id: n.id,
      enrollmentId: n.enrollmentId,
      title: n.title,
      content: n.content,
      createdBy: n.createdBy,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }))

    // Build the summary data
    const summaryData: EnrollmentSummary = {
      enrollment: enrollmentData,
      schoolYear,
      grade,
      paymentSchedules,
      payments,
      notes,
      totalPaid,
      totalOwed,
      percentPaid: tuitionFee > 0 ? Math.round((totalPaid / tuitionFee) * 100) : 0,
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(EnrollmentDocument, {
        data: summaryData,
        language,
      })
    )

    // Generate filename
    const studentName = `${enrollment.firstName}_${enrollment.lastName}`.replace(/\s+/g, "_")
    const enrollmentNum = enrollment.enrollmentNumber || enrollment.id.slice(0, 8)
    const filename = `Inscription_${studentName}_${enrollmentNum}.pdf`

    // Return PDF with proper headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (err) {
    console.error("Error generating PDF:", err)
    return NextResponse.json(
      { message: "Failed to generate PDF", error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
