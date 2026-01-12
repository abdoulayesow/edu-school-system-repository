import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/treasury/reports/daily
 * Get daily treasury report with all transactions
 */
export async function GET(req: NextRequest) {
  const { error } = await requireRole(["director", "accountant"])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const dateParam = searchParams.get("date")

  try {
    // Parse date (default to today)
    const reportDate = dateParam ? new Date(dateParam) : new Date()
    reportDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(reportDate)
    nextDay.setDate(nextDay.getDate() + 1)

    // Get all transactions for the day
    const transactions = await prisma.safeTransaction.findMany({
      where: {
        recordedAt: {
          gte: reportDate,
          lt: nextDay,
        },
      },
      orderBy: { recordedAt: "asc" },
      include: {
        recorder: {
          select: { id: true, name: true },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentNumber: true,
          },
        },
      },
    })

    // Get bank transfers for the day
    const bankTransfers = await prisma.bankTransfer.findMany({
      where: {
        transferDate: {
          gte: reportDate,
          lt: nextDay,
        },
      },
      orderBy: { transferDate: "asc" },
      include: {
        recorder: {
          select: { id: true, name: true },
        },
      },
    })

    // Get verification for the day
    const verification = await prisma.dailyVerification.findFirst({
      where: {
        verificationDate: reportDate,
      },
      include: {
        verifier: {
          select: { id: true, name: true },
        },
        reviewer: {
          select: { id: true, name: true },
        },
      },
    })

    // Calculate totals
    const totalIn = transactions
      .filter((t) => t.direction === "in")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalOut = transactions
      .filter((t) => t.direction === "out")
      .reduce((sum, t) => sum + t.amount, 0)

    // Group transactions by type
    const byType: Record<string, { count: number; amount: number }> = {}
    for (const t of transactions) {
      if (!byType[t.type]) {
        byType[t.type] = { count: 0, amount: 0 }
      }
      byType[t.type].count++
      byType[t.type].amount += t.amount
    }

    // Get previous day's closing balance (last transaction's safeBalanceAfter from previous day)
    const previousDay = new Date(reportDate)
    previousDay.setDate(previousDay.getDate() - 1)

    const previousDayLastTransaction = await prisma.safeTransaction.findFirst({
      where: {
        recordedAt: {
          lt: reportDate,
        },
      },
      orderBy: { recordedAt: "desc" },
      select: { safeBalanceAfter: true },
    })

    const openingBalance = previousDayLastTransaction?.safeBalanceAfter ?? 0

    // Calculate closing balance
    const closingBalance =
      transactions.length > 0
        ? transactions[transactions.length - 1].safeBalanceAfter
        : openingBalance

    return NextResponse.json({
      date: reportDate.toISOString().slice(0, 10),
      summary: {
        openingBalance,
        closingBalance,
        totalIn,
        totalOut,
        netChange: totalIn - totalOut,
        transactionCount: transactions.length,
      },
      byType,
      transactions,
      bankTransfers,
      verification: verification
        ? {
            id: verification.id,
            status: verification.status,
            expectedBalance: verification.expectedBalance,
            countedBalance: verification.countedBalance,
            discrepancy: verification.discrepancy,
            explanation: verification.explanation,
            verifiedAt: verification.verifiedAt,
            verifiedBy: verification.verifier,
            reviewedAt: verification.reviewedAt,
            reviewedBy: verification.reviewer,
            reviewNotes: verification.reviewNotes,
          }
        : null,
    })
  } catch (err) {
    console.error("Error generating daily report:", err)
    return NextResponse.json(
      { message: "Failed to generate daily report" },
      { status: 500 }
    )
  }
}
