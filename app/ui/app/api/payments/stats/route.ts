import { NextResponse } from "next/server"
import { requireSession } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/payments/stats
 * Get payment statistics for dashboard cards
 */
export async function GET() {
  const { error } = await requireSession()
  if (error) return error

  try {
    const now = new Date()

    // Start of today (midnight)
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    // Start of this week (Monday)
    const weekStart = new Date(now)
    const dayOfWeek = now.getDay()
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    weekStart.setDate(now.getDate() - daysToMonday)
    weekStart.setHours(0, 0, 0, 0)

    // Fetch all stats in parallel
    const [
      todayPayments,
      pendingPayments,
      confirmedThisWeek,
      cashPayments,
      orangeMoneyPayments,
    ] = await Promise.all([
      // Today's payments
      prisma.payment.aggregate({
        where: {
          recordedAt: { gte: todayStart },
        },
        _count: true,
        _sum: { amount: true },
      }),

      // Pending payments (pending_deposit, deposited, pending_review)
      prisma.payment.aggregate({
        where: {
          status: { in: ["pending_deposit", "deposited", "pending_review"] },
        },
        _count: true,
        _sum: { amount: true },
      }),

      // Confirmed this week
      prisma.payment.aggregate({
        where: {
          status: "confirmed",
          confirmedAt: { gte: weekStart },
        },
        _count: true,
        _sum: { amount: true },
      }),

      // Cash payments (all time)
      prisma.payment.aggregate({
        where: { method: "cash" },
        _count: true,
        _sum: { amount: true },
      }),

      // Orange Money payments (all time)
      prisma.payment.aggregate({
        where: { method: "orange_money" },
        _count: true,
        _sum: { amount: true },
      }),
    ])

    return NextResponse.json({
      today: {
        count: todayPayments._count,
        amount: todayPayments._sum.amount || 0,
      },
      pending: {
        count: pendingPayments._count,
        amount: pendingPayments._sum.amount || 0,
      },
      confirmedThisWeek: {
        count: confirmedThisWeek._count,
        amount: confirmedThisWeek._sum.amount || 0,
      },
      byMethod: {
        cash: {
          count: cashPayments._count,
          amount: cashPayments._sum.amount || 0,
        },
        orange_money: {
          count: orangeMoneyPayments._count,
          amount: orangeMoneyPayments._sum.amount || 0,
        },
      },
    })
  } catch (err) {
    console.error("Error fetching payment stats:", err)
    return NextResponse.json(
      { error: "Failed to fetch payment statistics" },
      { status: 500 }
    )
  }
}
