import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

// Schema for recording a cash deposit
const cashDepositSchema = z.object({
  bankReference: z.string().min(1, "Bank reference is required"),
  depositDate: z.string().transform((s) => new Date(s)),
  depositedByName: z.string().optional(), // "Me" or name
  bankName: z.string().optional(),
})

/**
 * POST /api/payments/[id]/deposit
 * Record a cash deposit for a payment
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireRole(["director", "accountant"])
  if (error) return error

  const { id } = await params

  try {
    // Get existing payment
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: { cashDeposit: true },
    })

    if (!existingPayment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      )
    }

    // Only allow deposit for cash payments
    if (existingPayment.method !== "cash") {
      return NextResponse.json(
        { message: "Can only record deposit for cash payments" },
        { status: 400 }
      )
    }

    // Only allow deposit for pending_deposit status
    if (existingPayment.status !== "pending_deposit") {
      return NextResponse.json(
        { message: "Payment is not in pending_deposit status" },
        { status: 400 }
      )
    }

    // Check if deposit already exists
    if (existingPayment.cashDeposit) {
      return NextResponse.json(
        { message: "Deposit already recorded for this payment" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = cashDepositSchema.parse(body)

    // Create deposit and update payment status in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create cash deposit record
      const deposit = await tx.cashDeposit.create({
        data: {
          paymentId: id,
          bankReference: validated.bankReference,
          depositDate: validated.depositDate,
          depositedBy: session!.user.id,
          depositedByName: validated.depositedByName || session!.user.name || "Unknown",
          bankName: validated.bankName,
        },
      })

      // Update payment status to deposited (awaiting review)
      const payment = await tx.payment.update({
        where: { id },
        data: { status: "deposited" },
        include: {
          recorder: { select: { id: true, name: true, email: true } },
          cashDeposit: {
            include: {
              depositor: { select: { id: true, name: true, email: true } },
            },
          },
          enrollment: {
            select: {
              id: true,
              enrollmentNumber: true,
              student: {
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

      return payment
    })

    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error recording deposit:", err)
    return NextResponse.json(
      { message: "Failed to record deposit" },
      { status: 500 }
    )
  }
}
