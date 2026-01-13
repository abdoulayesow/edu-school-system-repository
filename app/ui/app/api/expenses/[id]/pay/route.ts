import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { SafeTransactionType, CashDirection } from "@prisma/client"

interface RouteParams {
  params: Promise<{ id: string }>
}

// Schema for paying an expense
const payExpenseSchema = z.object({
  notes: z.string().optional(),
})

/**
 * POST /api/expenses/[id]/pay
 * Mark an approved expense as paid (deduct from safe)
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("safe_expense", "update")
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

    // Only allow payment for approved expenses
    if (existingExpense.status !== "approved") {
      return NextResponse.json(
        { message: "Only approved expenses can be paid" },
        { status: 400 }
      )
    }

    // Get current balance for both cash and Orange Money
    const currentBalance = await prisma.treasuryBalance.findFirst()
    if (!currentBalance) {
      return NextResponse.json(
        { message: "Treasury not initialized. Please initialize the balance first." },
        { status: 400 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const validated = payExpenseSchema.parse(body)

    // Handle cash expenses - deduct from registry
    if (existingExpense.method === "cash") {
      // Check sufficient funds in registry
      if (currentBalance.registryBalance < existingExpense.amount) {
        return NextResponse.json(
          {
            message: "Fonds insuffisants dans la caisse",
            available: currentBalance.registryBalance,
            required: existingExpense.amount,
          },
          { status: 400 }
        )
      }

      const newRegistryBalance = currentBalance.registryBalance - existingExpense.amount

      const result = await prisma.$transaction(async (tx) => {
        // Update expense to paid
        const expense = await tx.expense.update({
          where: { id },
          data: {
            status: "paid",
            paidAt: new Date(),
          },
          include: {
            requester: { select: { id: true, name: true, email: true } },
            approver: { select: { id: true, name: true, email: true } },
          },
        })

        // Create safe transaction for audit trail
        await tx.safeTransaction.create({
          data: {
            type: "expense_payment" as SafeTransactionType,
            direction: "out" as CashDirection,
            amount: existingExpense.amount,
            registryBalanceAfter: newRegistryBalance,
            safeBalanceAfter: currentBalance.safeBalance,
            bankBalanceAfter: currentBalance.bankBalance,
            description: `Dépense: ${existingExpense.description}`,
            referenceType: "expense",
            referenceId: existingExpense.id,
            beneficiaryName: existingExpense.vendorName,
            category: existingExpense.category,
            recordedBy: session!.user.id,
            notes: validated.notes,
          },
        })

        // Update registry balance
        await tx.treasuryBalance.update({
          where: { id: currentBalance.id },
          data: { registryBalance: newRegistryBalance },
        })

        return expense
      })

      return NextResponse.json({
        message: "Expense paid successfully",
        expense: result,
        newBalance: newRegistryBalance,
      })
    }

    // Handle Orange Money expenses
    if (existingExpense.method === "orange_money") {
      // Check sufficient funds
      if (currentBalance.mobileMoneyBalance < existingExpense.amount) {
        return NextResponse.json(
          {
            message: "Solde Orange Money insuffisant",
            available: currentBalance.mobileMoneyBalance,
            required: existingExpense.amount,
          },
          { status: 400 }
        )
      }

      const newMobileMoneyBalance = currentBalance.mobileMoneyBalance - existingExpense.amount

      const result = await prisma.$transaction(async (tx) => {
        // Update expense to paid
        const expense = await tx.expense.update({
          where: { id },
          data: {
            status: "paid",
            paidAt: new Date(),
          },
          include: {
            requester: { select: { id: true, name: true, email: true } },
            approver: { select: { id: true, name: true, email: true } },
          },
        })

        // Create safe transaction for audit trail
        await tx.safeTransaction.create({
          data: {
            type: "mobile_money_payment" as SafeTransactionType,
            direction: "out" as CashDirection,
            amount: existingExpense.amount,
            registryBalanceAfter: currentBalance.registryBalance,
            safeBalanceAfter: currentBalance.safeBalance,
            bankBalanceAfter: currentBalance.bankBalance,
            description: `Dépense Orange Money: ${existingExpense.description}`,
            referenceType: "expense",
            referenceId: existingExpense.id,
            beneficiaryName: existingExpense.vendorName,
            category: existingExpense.category,
            recordedBy: session!.user.id,
            notes: validated.notes,
          },
        })

        // Update mobile money balance
        await tx.treasuryBalance.update({
          where: { id: currentBalance.id },
          data: { mobileMoneyBalance: newMobileMoneyBalance },
        })

        return expense
      })

      return NextResponse.json({
        message: "Expense paid successfully with Orange Money",
        expense: result,
        newBalance: newMobileMoneyBalance,
      })
    }

    // For any other payment method, just mark as paid without balance deduction
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        status: "paid",
        paidAt: new Date(),
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({
      message: "Expense marked as paid",
      expense,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error paying expense:", err)
    return NextResponse.json(
      { message: "Failed to pay expense" },
      { status: 500 }
    )
  }
}
