import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
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
  const { session, error } = await requirePerm("safe_expense", "approve")
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
      // Check if this is an Orange Money payment
      const isOrangeMoney = existingExpense.method === "orange_money"

      if (isOrangeMoney) {
        // For Orange Money: update treasury balance immediately and mark as paid
        const treasuryBalance = await prisma.treasuryBalance.findFirst()

        if (!treasuryBalance) {
          return NextResponse.json(
            { message: "Treasury balance not found" },
            { status: 500 }
          )
        }

        // Check if sufficient balance
        if (treasuryBalance.mobileMoneyBalance < existingExpense.amount) {
          return NextResponse.json(
            { message: "Insufficient mobile money balance" },
            { status: 400 }
          )
        }

        // Use transaction to ensure atomicity
        const expense = await prisma.$transaction(async (tx) => {
          // Update treasury balance
          await tx.treasuryBalance.update({
            where: { id: treasuryBalance.id },
            data: {
              mobileMoneyBalance: {
                decrement: existingExpense.amount,
              },
            },
          })

          // Create SafeTransaction for audit trail
          await tx.safeTransaction.create({
            data: {
              type: "mobile_money_payment",
              direction: "out",
              amount: existingExpense.amount,
              mobileMoneyBalanceAfter:
                treasuryBalance.mobileMoneyBalance - existingExpense.amount,
              safeBalanceAfter: treasuryBalance.safeBalance,
              description: `Expense: ${existingExpense.description}`,
              category: existingExpense.category,
              referenceType: "expense",
              referenceId: existingExpense.id,
              beneficiaryName: existingExpense.vendorName || "N/A",
              recordedBy: session!.user.id,
              recordedAt: new Date(),
            },
          })

          // Update expense to "paid" status (skip "approved" for Orange Money)
          return tx.expense.update({
            where: { id },
            data: {
              status: "paid",
              approvedBy: session!.user.id,
              approvedAt: new Date(),
              paidAt: new Date(),
            },
            include: {
              requester: { select: { id: true, name: true, email: true } },
              approver: { select: { id: true, name: true, email: true } },
              supplier: { select: { id: true, name: true } },
              initiatedBy: { select: { id: true, name: true } },
            },
          })
        })

        return NextResponse.json(expense)
      } else {
        // For Cash: just mark as approved (requires separate "mark_paid" step)
        updateData = {
          status: "approved",
          approvedBy: session!.user.id,
          approvedAt: new Date(),
        }
      }
    } else if (validated.action === "reject") {
      updateData = {
        status: "rejected",
        rejectionReason: validated.rejectionReason,
      }
    } else if (validated.action === "mark_paid") {
      // This is for cash expenses that need manual payment confirmation
      // Update treasury balance for cash payments
      const treasuryBalance = await prisma.treasuryBalance.findFirst()

      if (!treasuryBalance) {
        return NextResponse.json(
          { message: "Treasury balance not found" },
          { status: 500 }
        )
      }

      // Check if sufficient balance
      if (treasuryBalance.registryBalance < existingExpense.amount) {
        return NextResponse.json(
          { message: "Insufficient registry balance" },
          { status: 400 }
        )
      }

      // Use transaction to ensure atomicity
      const expense = await prisma.$transaction(async (tx) => {
        // Update treasury balance
        await tx.treasuryBalance.update({
          where: { id: treasuryBalance.id },
          data: {
            registryBalance: {
              decrement: existingExpense.amount,
            },
          },
        })

        // Create SafeTransaction for audit trail
        await tx.safeTransaction.create({
          data: {
            type: "expense_payment",
            direction: "out",
            amount: existingExpense.amount,
            registryBalanceAfter:
              treasuryBalance.registryBalance - existingExpense.amount,
            safeBalanceAfter: treasuryBalance.safeBalance,
            description: `Expense: ${existingExpense.description}`,
            category: existingExpense.category,
            referenceType: "expense",
            referenceId: existingExpense.id,
            beneficiaryName: existingExpense.vendorName || "N/A",
            recordedBy: session!.user.id,
            recordedAt: new Date(),
          },
        })

        // Update expense to "paid" status
        return tx.expense.update({
          where: { id },
          data: {
            status: "paid",
            paidAt: new Date(),
          },
          include: {
            requester: { select: { id: true, name: true, email: true } },
            approver: { select: { id: true, name: true, email: true } },
            supplier: { select: { id: true, name: true } },
            initiatedBy: { select: { id: true, name: true } },
          },
        })
      })

      return NextResponse.json(expense)
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        requester: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true, email: true } },
        supplier: { select: { id: true, name: true } },
        initiatedBy: { select: { id: true, name: true } },
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
