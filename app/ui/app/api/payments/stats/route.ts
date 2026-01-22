import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/payments/stats
 * Get payment statistics for dashboard cards
 *
 * Query params:
 * - startDate: filter stats from this date (YYYY-MM-DD)
 * - endDate: filter stats until this date (YYYY-MM-DD)
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("payment_recording", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const startDateParam = searchParams.get("startDate")
  const endDateParam = searchParams.get("endDate")

  try {
    const now = new Date()

    // Start of today (midnight)
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    // End of today
    const todayEnd = new Date(now)
    todayEnd.setHours(23, 59, 59, 999)

    // Start of this week (Monday)
    const weekStart = new Date(now)
    const dayOfWeek = now.getDay()
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    weekStart.setDate(now.getDate() - daysToMonday)
    weekStart.setHours(0, 0, 0, 0)

    // Build date filter for filtered stats (byMethod, etc.)
    // If date params provided, use them; otherwise use all-time
    const buildDateFilter = () => {
      if (startDateParam || endDateParam) {
        const filter: { gte?: Date; lte?: Date } = {}
        if (startDateParam) {
          filter.gte = new Date(startDateParam)
          filter.gte.setHours(0, 0, 0, 0)
        }
        if (endDateParam) {
          filter.lte = new Date(endDateParam)
          filter.lte.setHours(23, 59, 59, 999)
        }
        return { recordedAt: filter }
      }
      return {}
    }

    const dateFilter = buildDateFilter()
    const hasDateFilter = startDateParam || endDateParam

    // Fetch all stats in parallel
    const [
      todayPayments,
      reversedPayments,
      confirmedThisWeek,
      cashPayments,
      orangeMoneyPayments,
      tuitionPayments,
      clubPayments,
      // Also fetch all-time totals for comparison
      allTimeCash,
      allTimeMobile,
    ] = await Promise.all([
      // Today's payments (always today, regardless of filter)
      prisma.payment.aggregate({
        where: {
          recordedAt: { gte: todayStart, lte: todayEnd },
        },
        _count: true,
        _sum: { amount: true },
      }),

      // Reversed payments (within date filter if provided)
      prisma.payment.aggregate({
        where: {
          status: "reversed",
          ...dateFilter,
        },
        _count: true,
        _sum: { amount: true },
      }),

      // Confirmed this week (always this week, regardless of filter)
      prisma.payment.aggregate({
        where: {
          status: "confirmed",
          confirmedAt: { gte: weekStart },
        },
        _count: true,
        _sum: { amount: true },
      }),

      // Cash payments (respects date filter)
      prisma.payment.aggregate({
        where: {
          method: "cash",
          ...dateFilter,
        },
        _count: true,
        _sum: { amount: true },
      }),

      // Orange Money payments (respects date filter)
      prisma.payment.aggregate({
        where: {
          method: "orange_money",
          ...dateFilter,
        },
        _count: true,
        _sum: { amount: true },
      }),

      // Tuition payments (respects date filter)
      prisma.payment.aggregate({
        where: {
          paymentType: "tuition",
          ...dateFilter,
        },
        _count: true,
        _sum: { amount: true },
      }),

      // Club payments (respects date filter)
      prisma.payment.aggregate({
        where: {
          paymentType: "club",
          ...dateFilter,
        },
        _count: true,
        _sum: { amount: true },
      }),

      // All-time cash (for reference)
      prisma.payment.aggregate({
        where: { method: "cash" },
        _count: true,
        _sum: { amount: true },
      }),

      // All-time mobile (for reference)
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
      reversed: {
        count: reversedPayments._count,
        amount: reversedPayments._sum.amount || 0,
      },
      pending: {
        count: reversedPayments._count,
        amount: reversedPayments._sum.amount || 0,
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
      byType: {
        tuition: {
          count: tuitionPayments._count,
          amount: tuitionPayments._sum.amount || 0,
        },
        club: {
          count: clubPayments._count,
          amount: clubPayments._sum.amount || 0,
        },
      },
      // Include all-time totals for reference
      allTime: {
        cash: {
          count: allTimeCash._count,
          amount: allTimeCash._sum.amount || 0,
        },
        orange_money: {
          count: allTimeMobile._count,
          amount: allTimeMobile._sum.amount || 0,
        },
      },
      // Meta info about the filter applied
      filterApplied: hasDateFilter,
      filterRange: hasDateFilter ? {
        startDate: startDateParam,
        endDate: endDateParam,
      } : null,
    })
  } catch (err) {
    console.error("Error fetching payment stats:", err)
    return NextResponse.json(
      { error: "Failed to fetch payment statistics" },
      { status: 500 }
    )
  }
}
