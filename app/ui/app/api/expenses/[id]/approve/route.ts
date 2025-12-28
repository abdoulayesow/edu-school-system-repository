import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

// Schema for approving/rejecting an expense
const approveExpenseSchema = z.object({
  action: z.enum(["approve", "reject", "mark_paid"]),
  rejectionReason: z.string().optional(),
})

/**
 * POST /api/expenses/[id]/approve
 * Approve, reject, or mark an expense as paid
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireRole(["director"])
  if (error) return error

  const { id } = await params

  try {
    // Get existing expense
    const existingExpense = await prisma.expense.findUnique({
      where: { id },
    })

    if (!existingExpense) {
      return NextResponse.json(
        { message: "Expense not found" },
        { status: 404 }
      )
    }

    const body = await req.json()
    const validated = approveExpenseSchema.parse(body)

    // Validate state transitions
    if (validated.action === "approve") {
      if (existingExpense.status !== "pending") {
        return NextResponse.json(
          { message: "Can only approve pending expenses" },
          { status: 400 }
        )
      }
    } else if (validated.action === "reject") {
      if (existingExpense.status !== "pending") {
        return NextResponse.json(
          { message: "Can only reject pending expenses" },
          { status: 400 }
        )
      }
      if (!validated.rejectionReason) {
        return NextResponse.json(
          { message: "Rejection reason is required" },
          { status: 400 }
        )
      }
    } else if (validated.action === "mark_paid") {
      if (existingExpense.status !== "approved") {
        return NextResponse.json(
          { message: "Can only mark approved expenses as paid" },
          { status: 400 }
        )
      }
    }

    // Determine new status and update fields
    let updateData: Record<string, unknown> = {}

    if (validated.action === "approve") {
      updateData = {
        status: "approved",
        approvedBy: session!.user.id,
        approvedAt: new Date(),
      }
    } else if (validated.action === "reject") {
      updateData = {
        status: "rejected",
        rejectionReason: validated.rejectionReason,
      }
    } else if (validated.action === "mark_paid") {
      updateData = {
        status: "paid",
        paidAt: new Date(),
      }
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        requester: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(expense)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error processing expense action:", err)
    return NextResponse.json(
      { message: "Failed to process expense action" },
      { status: 500 }
    )
  }
}
