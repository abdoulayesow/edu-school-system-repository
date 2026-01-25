import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { generateClubEnrollmentNumber } from "@/lib/club-helpers"

/**
 * Generate a unique receipt number for a payment
 */
async function generateReceiptNumber(method: "cash" | "orange_money"): Promise<string> {
  const currentYear = new Date().getFullYear()
  const prefix = method === "cash" ? "CASH" : "OM"

  // Find the highest receipt number for this year and method
  const lastPayment = await prisma.payment.findFirst({
    where: {
      receiptNumber: {
        startsWith: `GSPN-${currentYear}-${prefix}-`,
      },
    },
    orderBy: {
      receiptNumber: "desc",
    },
    select: {
      receiptNumber: true,
    },
  })

  let nextNumber = 1
  if (lastPayment?.receiptNumber) {
    const match = lastPayment.receiptNumber.match(/-(\d+)$/)
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1
    }
  }

  // Try up to 100 times to find a unique number
  let attempts = 0
  const maxAttempts = 100

  while (attempts < maxAttempts) {
    const nextReceiptNumber = `GSPN-${currentYear}-${prefix}-${nextNumber.toString().padStart(5, "0")}`

    const existing = await prisma.payment.findUnique({
      where: { receiptNumber: nextReceiptNumber },
      select: { id: true },
    })

    if (!existing) {
      return nextReceiptNumber
    }

    nextNumber++
    attempts++
  }

  throw new Error("Failed to generate unique receipt number after multiple attempts")
}

type RouteParams = { params: Promise<{ id: string }> }

/**
 * POST /api/club-enrollments/[id]/submit
 * Submit a club enrollment (finalize it)
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession()
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json()
    const { payment, notes } = body

    const enrollment = await prisma.clubEnrollment.findUnique({
      where: { id },
      include: {
        club: true,
        studentProfile: {
          include: {
            person: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 404 }
      )
    }

    // Generate enrollment number if it doesn't exist (for drafts)
    const enrollmentNumber = enrollment.enrollmentNumber || await generateClubEnrollmentNumber()

    // Use transaction to ensure capacity check and status update are atomic
    const updated = await prisma.$transaction(async (tx) => {
      // Check capacity before activating the enrollment
      if (enrollment.club.capacity !== null) {
        const activeEnrollmentCount = await tx.clubEnrollment.count({
          where: {
            clubId: enrollment.club.id,
            status: "active",
          },
        })

        if (activeEnrollmentCount >= enrollment.club.capacity) {
          throw new Error("Club is at full capacity")
        }
      }

      // Update enrollment status to active
      return await tx.clubEnrollment.update({
        where: { id },
        data: {
          status: "active",
          enrollmentNumber,
          syncVersion: { increment: 1 },
        },
      })
    })

    // Create payment if provided
    if (payment && payment.amount > 0) {
      // Validate payment method is provided
      if (!payment.method || (payment.method !== "cash" && payment.method !== "orange_money")) {
        return NextResponse.json(
          { message: "Valid payment method is required when recording a payment" },
          { status: 400 }
        )
      }

      // Generate receipt number server-side to ensure uniqueness
      const receiptNumber = await generateReceiptNumber(payment.method)

      await prisma.payment.create({
        data: {
          amount: payment.amount,
          method: payment.method,
          receiptNumber,
          transactionRef: payment.transactionRef,
          notes: notes || null,
          recordedBy: session.user.id,
          clubEnrollmentId: enrollment.id,
          paymentType: "club",
        },
      })
    }

    return NextResponse.json({
      id: updated.id,
      enrollmentNumber: updated.enrollmentNumber,
      status: updated.status,
      club: enrollment.club,
      student: {
        id: enrollment.studentProfile.id,
        name: `${enrollment.studentProfile.person.firstName} ${enrollment.studentProfile.person.lastName}`,
      },
    })
  } catch (err) {
    console.error("Error submitting enrollment:", err)

    // Handle specific error messages
    const errorMessage = err instanceof Error ? err.message : "Failed to submit enrollment"
    const statusCode = errorMessage === "Club is at full capacity" ||
                       errorMessage === "Valid payment method is required when recording a payment"
                       ? 400
                       : 500

    return NextResponse.json(
      { message: errorMessage },
      { status: statusCode }
    )
  }
}
