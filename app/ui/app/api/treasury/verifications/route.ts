import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { VerificationStatus } from "@prisma/client"

/**
 * GET /api/treasury/verifications
 * List daily verifications with pagination and filtering
 * Also returns whether today's verification has been done (for soft-block warnings)
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("daily_verification", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get("limit") || "30")
  const offset = parseInt(searchParams.get("offset") || "0")
  const status = searchParams.get("status") as VerificationStatus | null
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const checkToday = searchParams.get("checkToday") === "true"

  try {
    const where: Record<string, unknown> = {}

    if (status) where.status = status

    if (startDate || endDate) {
      where.verificationDate = {}
      if (startDate) (where.verificationDate as Record<string, Date>).gte = new Date(startDate)
      if (endDate) (where.verificationDate as Record<string, Date>).lte = new Date(endDate)
    }

    // Check if today's verification exists
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [verifications, total, todayVerification] = await Promise.all([
      prisma.dailyVerification.findMany({
        where,
        orderBy: { verificationDate: "desc" },
        skip: offset,
        take: limit,
        include: {
          verifier: {
            select: {
              id: true,
              name: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.dailyVerification.count({ where }),
      checkToday
        ? prisma.dailyVerification.findFirst({
            where: { verificationDate: today },
            include: {
              verifier: { select: { id: true, name: true } },
            },
          })
        : null,
    ])

    // Determine if verification is needed
    const needsVerification = !todayVerification
    const warningMessage = needsVerification
      ? "La vérification quotidienne de la caisse n'a pas été effectuée. Veuillez la faire maintenant."
      : null

    return NextResponse.json({
      data: verifications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + verifications.length < total,
      },
      // Daily verification status (only when checkToday=true)
      ...(checkToday && {
        dailyStatus: {
          needsVerification,
          todayVerification,
          warningMessage,
        },
      }),
    })
  } catch (err) {
    console.error("Error fetching verifications:", err)
    return NextResponse.json(
      { message: "Failed to fetch verifications" },
      { status: 500 }
    )
  }
}

// Schema for creating a verification
const createVerificationSchema = z.object({
  countedBalance: z.number().int().min(0, "Counted balance must be non-negative"),
  explanation: z.string().optional(),
})

/**
 * POST /api/treasury/verifications
 * Record a daily cash verification
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requirePerm("daily_verification", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validation = createVerificationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { countedBalance, explanation } = validation.data

    // Get current balance
    const currentBalance = await prisma.treasuryBalance.findFirst()
    if (!currentBalance) {
      return NextResponse.json(
        { message: "Treasury not initialized. Please initialize the balance first." },
        { status: 400 }
      )
    }

    // Check if already verified today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingVerification = await prisma.dailyVerification.findFirst({
      where: { verificationDate: today },
    })

    if (existingVerification) {
      return NextResponse.json(
        {
          message: "Today's verification has already been recorded",
          verification: existingVerification,
        },
        { status: 400 }
      )
    }

    const expectedBalance = currentBalance.safeBalance
    const discrepancy = countedBalance - expectedBalance

    // Determine status
    let status: VerificationStatus = "matched"
    if (discrepancy !== 0) {
      if (!explanation || explanation.trim().length === 0) {
        return NextResponse.json(
          {
            message: "Explanation is required when there is a discrepancy",
            expectedBalance,
            countedBalance,
            discrepancy,
          },
          { status: 400 }
        )
      }
      status = "discrepancy"
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create verification record
      const verification = await tx.dailyVerification.create({
        data: {
          verificationDate: today,
          expectedBalance,
          countedBalance,
          discrepancy,
          status,
          explanation: explanation || null,
          verifiedBy: session!.user.id,
        },
        include: {
          verifier: {
            select: { id: true, name: true },
          },
        },
      })

      // Update TreasuryBalance with last verification info
      await tx.treasuryBalance.update({
        where: { id: currentBalance.id },
        data: {
          lastVerifiedAt: new Date(),
          lastVerifiedBy: session!.user.id,
          // If count differs, update safe balance to actual counted amount
          ...(discrepancy !== 0 && { safeBalance: countedBalance }),
        },
      })

      // If there was a discrepancy, create an adjustment transaction
      if (discrepancy !== 0) {
        await tx.safeTransaction.create({
          data: {
            type: "adjustment",
            direction: discrepancy > 0 ? "in" : "out",
            amount: Math.abs(discrepancy),
            safeBalanceAfter: countedBalance,
            bankBalanceAfter: currentBalance.bankBalance,
            mobileMoneyBalanceAfter: currentBalance.mobileMoneyBalance,
            description: `Ajustement suite à vérification - ${explanation}`,
            referenceType: "verification",
            referenceId: verification.id,
            recordedBy: session!.user.id,
          },
        })
      }

      return verification
    })

    return NextResponse.json(
      {
        message:
          status === "matched"
            ? "Verification recorded - balance matches"
            : "Verification recorded - discrepancy noted",
        verification: result,
        balanceAdjusted: discrepancy !== 0,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("Error creating verification:", err)
    return NextResponse.json(
      { message: "Failed to create verification" },
      { status: 500 }
    )
  }
}
