import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

// Schema for updating an expense
const updateExpenseSchema = z.object({
  category: z.enum(["supplies", "maintenance", "utilities", "salary", "transport", "communication", "other"]).optional(),
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  method: z.enum(["cash", "orange_money"]).optional(),
  date: z.string().transform((s) => new Date(s)).optional(),
  vendorName: z.string().optional(),
  receiptUrl: z.string().optional(),
})

/**
 * GET /api/expenses/[id]
 * Get a single expense by ID
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("safe_expense", "view")
  if (error) return error

  const { id } = await params

  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true, email: true } },
      },
    })

    if (!expense) {
      return NextResponse.json(
        { message: "Expense not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(expense)
  } catch (err) {
    console.error("Error fetching expense:", err)
    return NextResponse.json(
      { message: "Failed to fetch expense" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/expenses/[id]
 * Update an expense (only if pending)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("safe_expense", "update")
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

    // Only allow updates for pending expenses
    if (existingExpense.status !== "pending") {
      return NextResponse.json(
        { message: "Can only update pending expenses" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = updateExpenseSchema.parse(body)

    const expense = await prisma.expense.update({
      where: { id },
      data: validated,
      include: {
        requester: { select: { id: true, name: true, email: true } },
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
    console.error("Error updating expense:", err)
    return NextResponse.json(
      { message: "Failed to update expense" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/expenses/[id]
 * Delete an expense (only if pending)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("safe_expense", "delete")
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

    // Only allow deletion for pending expenses
    if (existingExpense.status !== "pending") {
      return NextResponse.json(
        { message: "Can only delete pending expenses" },
        { status: 400 }
      )
    }

    await prisma.expense.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Expense deleted" })
  } catch (err) {
    console.error("Error deleting expense:", err)
    return NextResponse.json(
      { message: "Failed to delete expense" },
      { status: 500 }
    )
  }
}
