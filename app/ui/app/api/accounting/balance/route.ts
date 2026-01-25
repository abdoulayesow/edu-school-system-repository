import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/accounting/balance
 * Get accounting balance summary (payments, expenses, margins)
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("financial_reports", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const schoolYearId = searchParams.get("schoolYearId")

  try {
    // Build date filter
    const dateFilter: Record<string, Date> = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)

    // Get payment statistics
    const payments = await prisma.payment.findMany({
      where: {
        ...(Object.keys(dateFilter).length > 0 && { recordedAt: dateFilter }),
        ...(schoolYearId && {
          enrollment: { schoolYearId },
        }),
      },
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        enrollment: {
          select: {
            grade: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // Calculate payment totals by status
    // PaymentStatus enum: confirmed, reversed, failed
    const paymentsByStatus = {
      confirmed: { count: 0, amount: 0 },
      reversed: { count: 0, amount: 0 },
      failed: { count: 0, amount: 0 },
    }

    const paymentsByMethod = {
      cash: { count: 0, amount: 0, confirmed: 0 },
      orange_money: { count: 0, amount: 0, confirmed: 0 },
    }

    const paymentsByGrade: Record<string, { count: number; amount: number; confirmed: number }> = {}

    for (const payment of payments) {
      const statusKey = payment.status as keyof typeof paymentsByStatus
      if (paymentsByStatus[statusKey]) {
        paymentsByStatus[statusKey].count++
        paymentsByStatus[statusKey].amount += payment.amount
      }

      const methodKey = payment.method as keyof typeof paymentsByMethod
      if (paymentsByMethod[methodKey]) {
        paymentsByMethod[methodKey].count++
        paymentsByMethod[methodKey].amount += payment.amount
        if (payment.status === "confirmed") {
          paymentsByMethod[methodKey].confirmed += payment.amount
        }
      }

      // Aggregate by grade
      const gradeName = payment.enrollment?.grade?.name || "Unknown"
      if (!paymentsByGrade[gradeName]) {
        paymentsByGrade[gradeName] = { count: 0, amount: 0, confirmed: 0 }
      }
      paymentsByGrade[gradeName].count++
      paymentsByGrade[gradeName].amount += payment.amount
      if (payment.status === "confirmed") {
        paymentsByGrade[gradeName].confirmed += payment.amount
      }
    }

    // Get expense statistics
    const expenses = await prisma.expense.findMany({
      where: {
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      select: {
        id: true,
        amount: true,
        category: true,
        status: true,
      },
    })

    // Calculate expense totals by status
    const expensesByStatus = {
      pending: { count: 0, amount: 0 },
      approved: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 },
    }

    const expensesByCategory: Record<string, { count: number; amount: number }> = {}

    for (const expense of expenses) {
      const statusKey = expense.status as keyof typeof expensesByStatus
      if (expensesByStatus[statusKey]) {
        expensesByStatus[statusKey].count++
        expensesByStatus[statusKey].amount += expense.amount
      }

      if (!expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] = { count: 0, amount: 0 }
      }
      expensesByCategory[expense.category].count++
      expensesByCategory[expense.category].amount += expense.amount
    }

    // Calculate summary
    // All payments are confirmed immediately - no pending payment statuses exist
    const totalConfirmedPayments = paymentsByStatus.confirmed.amount
    const totalPaidExpenses = expensesByStatus.paid.amount
    const totalPendingPayments = 0 // No pending statuses in current workflow
    const totalPendingExpenses = expensesByStatus.pending.amount + expensesByStatus.approved.amount

    // Cash availability
    // Orange Money confirmed = immediately available
    // Cash confirmed = available (in registry or deposited at bank)
    const cashAvailable = paymentsByMethod.orange_money.confirmed + paymentsByMethod.cash.confirmed - totalPaidExpenses
    const cashPending = 0 // All cash is confirmed immediately

    return NextResponse.json({
      summary: {
        totalConfirmedPayments,
        totalPendingPayments,
        totalPaidExpenses,
        totalPendingExpenses,
        cashAvailable,
        cashPending,
        margin: totalConfirmedPayments - totalPaidExpenses,
      },
      payments: {
        byStatus: paymentsByStatus,
        byMethod: paymentsByMethod,
        byGrade: paymentsByGrade,
        total: {
          count: payments.length,
          amount: payments.reduce((sum, p) => sum + p.amount, 0),
        },
      },
      expenses: {
        byStatus: expensesByStatus,
        byCategory: expensesByCategory,
        total: {
          count: expenses.length,
          amount: expenses.reduce((sum, e) => sum + e.amount, 0),
        },
      },
    })
  } catch (err) {
    console.error("Error fetching balance:", err)
    return NextResponse.json(
      { message: "Failed to fetch balance" },
      { status: 500 }
    )
  }
}
