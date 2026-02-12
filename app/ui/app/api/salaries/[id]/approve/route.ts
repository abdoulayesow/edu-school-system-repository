import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

const approveSchema = z.object({
  action: z.enum(["approve", "cancel"]),
  notes: z.string().optional(),
})

/**
 * POST /api/salaries/[id]/approve
 * Approve or cancel a salary payment
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("salary_payments", "approve")
  if (error) return error

  const { id } = await params

  try {
    const body = await req.json()
    const validated = approveSchema.parse(body)

    const existing = await prisma.salaryPayment.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { message: "Salary payment not found" },
        { status: 404 }
      )
    }

    if (validated.action === "approve") {
      if (existing.status !== "pending") {
        return NextResponse.json(
          { message: "Only pending payments can be approved" },
          { status: 400 }
        )
      }

      const payment = await prisma.salaryPayment.update({
        where: { id },
        data: {
          status: "approved",
          approvedBy: session!.user.id,
          approvedAt: new Date(),
        },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      })

      return NextResponse.json(payment)
    }

    // Cancel
    if (existing.status !== "pending" && existing.status !== "approved") {
      return NextResponse.json(
        { message: "Only pending or approved payments can be cancelled" },
        { status: 400 }
      )
    }

    if (!validated.notes) {
      return NextResponse.json(
        { message: "Cancellation note is required" },
        { status: 400 }
      )
    }

    const payment = await prisma.salaryPayment.update({
      where: { id },
      data: {
        status: "cancelled",
        cancelledBy: session!.user.id,
        cancelledAt: new Date(),
        cancellationNote: validated.notes,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    })

    return NextResponse.json(payment)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error approving salary payment:", err)
    return NextResponse.json(
      { message: "Failed to approve salary payment" },
      { status: 500 }
    )
  }
}
