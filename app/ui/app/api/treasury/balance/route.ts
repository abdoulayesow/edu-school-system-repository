import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

/**
 * GET /api/treasury/balance
 * Get current safe and bank balances with status indicators
 */
export async function GET(req: NextRequest) {
  const { error } = await requireRole(["director", "accountant"])
  if (error) return error

  try {
    // Get or create the TreasuryBalance record (singleton)
    let treasuryBalance = await prisma.treasuryBalance.findFirst()

    if (!treasuryBalance) {
      // Initialize with default values
      treasuryBalance = await prisma.treasuryBalance.create({
        data: {
          registryBalance: 0,
          registryFloatAmount: 2000000,
          safeBalance: 0,
          bankBalance: 0,
          mobileMoneyBalance: 0,
          safeThresholdMin: 5000000,  // 5M GNF
          safeThresholdMax: 20000000, // 20M GNF
        },
      })
    }

    // Get today's transactions for summary
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayTransactions = await prisma.safeTransaction.findMany({
      where: {
        recordedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        direction: true,
        amount: true,
      },
    })

    const todayIn = todayTransactions
      .filter((t) => t.direction === "in")
      .reduce((sum, t) => sum + t.amount, 0)

    const todayOut = todayTransactions
      .filter((t) => t.direction === "out")
      .reduce((sum, t) => sum + t.amount, 0)

    // Get today's verification if exists
    const todayVerification = await prisma.dailyVerification.findFirst({
      where: {
        verificationDate: today,
      },
      include: {
        verifier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Calculate status based on thresholds (using safe balance, not registry)
    let status: "critical" | "warning" | "optimal" | "excess"
    if (treasuryBalance.safeBalance < treasuryBalance.safeThresholdMin) {
      status = "critical"
    } else if (treasuryBalance.safeBalance < treasuryBalance.safeThresholdMin * 2) {
      // Between 5M and 10M = warning
      status = "warning"
    } else if (treasuryBalance.safeBalance > treasuryBalance.safeThresholdMax) {
      status = "excess"
    } else {
      status = "optimal"
    }

    return NextResponse.json({
      registryBalance: treasuryBalance.registryBalance,
      registryFloatAmount: treasuryBalance.registryFloatAmount,
      safeBalance: treasuryBalance.safeBalance,
      bankBalance: treasuryBalance.bankBalance,
      mobileMoneyBalance: treasuryBalance.mobileMoneyBalance,
      totalLiquidAssets: treasuryBalance.registryBalance + treasuryBalance.safeBalance + treasuryBalance.bankBalance + treasuryBalance.mobileMoneyBalance,
      thresholds: {
        min: treasuryBalance.safeThresholdMin,
        max: treasuryBalance.safeThresholdMax,
      },
      status,
      lastVerification: treasuryBalance.lastVerifiedAt
        ? {
            at: treasuryBalance.lastVerifiedAt,
            byId: treasuryBalance.lastVerifiedBy,
          }
        : null,
      todayVerification: todayVerification
        ? {
            id: todayVerification.id,
            status: todayVerification.status,
            expectedBalance: todayVerification.expectedBalance,
            countedBalance: todayVerification.countedBalance,
            discrepancy: todayVerification.discrepancy,
            verifiedAt: todayVerification.verifiedAt,
            verifiedBy: todayVerification.verifier,
          }
        : null,
      todaySummary: {
        in: todayIn,
        out: todayOut,
        net: todayIn - todayOut,
        transactionCount: todayTransactions.length,
      },
      updatedAt: treasuryBalance.updatedAt,
    })
  } catch (err) {
    console.error("Error fetching treasury balance:", err)
    return NextResponse.json(
      { message: "Failed to fetch treasury balance" },
      { status: 500 }
    )
  }
}

// Schema for initializing/adjusting balance
const adjustBalanceSchema = z.object({
  registryBalance: z.number().int().min(0).optional(),
  safeBalance: z.number().int().min(0).optional(),
  bankBalance: z.number().int().min(0).optional(),
  mobileMoneyBalance: z.number().int().min(0).optional(),
  safeThresholdMin: z.number().int().min(0).optional(),
  safeThresholdMax: z.number().int().min(0).optional(),
  registryFloatAmount: z.number().int().min(0).optional(),
  reason: z.string().min(1, "Reason is required for adjustments"),
})

/**
 * PUT /api/treasury/balance
 * Initialize or adjust safe/bank balances (Director only)
 */
export async function PUT(req: NextRequest) {
  const { session, error } = await requireRole(["director"])
  if (error) return error

  try {
    const body = await req.json()
    const validation = adjustBalanceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { registryBalance, safeBalance, bankBalance, mobileMoneyBalance, safeThresholdMin, safeThresholdMax, registryFloatAmount, reason } =
      validation.data

    // Get or create current balance
    let currentBalance = await prisma.treasuryBalance.findFirst()

    const result = await prisma.$transaction(async (tx) => {
      // Get previous values for adjustment tracking
      const previousRegistry = currentBalance?.registryBalance ?? 0
      const previousSafe = currentBalance?.safeBalance ?? 0
      const previousBank = currentBalance?.bankBalance ?? 0
      const previousMobileMoney = currentBalance?.mobileMoneyBalance ?? 0

      // Update or create TreasuryBalance
      const updatedBalance = currentBalance
        ? await tx.treasuryBalance.update({
            where: { id: currentBalance.id },
            data: {
              ...(registryBalance !== undefined && { registryBalance }),
              ...(safeBalance !== undefined && { safeBalance }),
              ...(bankBalance !== undefined && { bankBalance }),
              ...(mobileMoneyBalance !== undefined && { mobileMoneyBalance }),
              ...(safeThresholdMin !== undefined && { safeThresholdMin }),
              ...(safeThresholdMax !== undefined && { safeThresholdMax }),
              ...(registryFloatAmount !== undefined && { registryFloatAmount }),
            },
          })
        : await tx.treasuryBalance.create({
            data: {
              registryBalance: registryBalance ?? 0,
              registryFloatAmount: registryFloatAmount ?? 2000000,
              safeBalance: safeBalance ?? 0,
              bankBalance: bankBalance ?? 0,
              mobileMoneyBalance: mobileMoneyBalance ?? 0,
              safeThresholdMin: safeThresholdMin ?? 5000000,
              safeThresholdMax: safeThresholdMax ?? 20000000,
            },
          })

      // If safe balance changed, create adjustment transaction
      if (safeBalance !== undefined && safeBalance !== previousSafe) {
        const diff = safeBalance - previousSafe
        await tx.safeTransaction.create({
          data: {
            type: "adjustment",
            direction: diff >= 0 ? "in" : "out",
            amount: Math.abs(diff),
            registryBalanceAfter: updatedBalance.registryBalance,
            safeBalanceAfter: safeBalance,
            bankBalanceAfter: updatedBalance.bankBalance,
            mobileMoneyBalanceAfter: updatedBalance.mobileMoneyBalance,
            description: reason,
            recordedBy: session!.user.id,
          },
        })
      }

      return updatedBalance
    })

    return NextResponse.json({
      message: "Balance updated successfully",
      balance: {
        registryBalance: result.registryBalance,
        safeBalance: result.safeBalance,
        bankBalance: result.bankBalance,
        mobileMoneyBalance: result.mobileMoneyBalance,
        totalLiquidAssets: result.registryBalance + result.safeBalance + result.bankBalance + result.mobileMoneyBalance,
        thresholds: {
          min: result.safeThresholdMin,
          max: result.safeThresholdMax,
        },
        registryFloatAmount: result.registryFloatAmount,
      },
    })
  } catch (err) {
    console.error("Error updating treasury balance:", err)
    return NextResponse.json(
      { message: "Failed to update treasury balance" },
      { status: 500 }
    )
  }
}
