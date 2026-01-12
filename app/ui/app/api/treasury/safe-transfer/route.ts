import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for safe transfer
const safeTransferSchema = z.object({
  direction: z.enum(["safe_to_registry", "registry_to_safe"]),
  amount: z.number().int().positive(),
  notes: z.string().min(10, "Notes are required and must be at least 10 characters"),
})

/**
 * POST /api/treasury/safe-transfer
 * Perform ad-hoc transfer between safe and registry
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(["director"])
  if (error) return error

  try {
    const body = await req.json()
    const validated = safeTransferSchema.parse(body)

    // Get current treasury state
    const treasury = await prisma.treasuryBalance.findFirst()
    if (!treasury) {
      return NextResponse.json(
        { message: "Treasury not initialized. Please contact administrator." },
        { status: 400 }
      )
    }

    // Validate sufficient funds based on direction
    if (validated.direction === "safe_to_registry") {
      if (treasury.safeBalance < validated.amount) {
        return NextResponse.json(
          {
            message: "Fonds insuffisants dans le coffre",
            available: treasury.safeBalance,
            required: validated.amount,
          },
          { status: 400 }
        )
      }
    } else {
      // registry_to_safe
      if (treasury.registryBalance < validated.amount) {
        return NextResponse.json(
          {
            message: "Fonds insuffisants dans la caisse",
            available: treasury.registryBalance,
            required: validated.amount,
          },
          { status: 400 }
        )
      }
    }

    // Perform transfer in transaction
    const result = await prisma.$transaction(async (tx) => {
      let newSafeBalance: number
      let newRegistryBalance: number
      let cashDirection: "in" | "out"

      if (validated.direction === "safe_to_registry") {
        // Safe → Registry
        newSafeBalance = treasury.safeBalance - validated.amount
        newRegistryBalance = treasury.registryBalance + validated.amount
        cashDirection = "out" // From safe perspective
      } else {
        // Registry → Safe
        newSafeBalance = treasury.safeBalance + validated.amount
        newRegistryBalance = treasury.registryBalance - validated.amount
        cashDirection = "in" // To safe perspective
      }

      // Update treasury balances
      const updatedTreasury = await tx.treasuryBalance.update({
        where: { id: treasury.id },
        data: {
          safeBalance: newSafeBalance,
          registryBalance: newRegistryBalance,
          updatedAt: new Date(),
        },
      })

      // Create transaction record
      const safeTransaction = await tx.safeTransaction.create({
        data: {
          type: validated.direction,
          direction: cashDirection,
          amount: validated.amount,
          registryBalanceAfter: newRegistryBalance,
          safeBalanceAfter: newSafeBalance,
          bankBalanceAfter: treasury.bankBalance,
          mobileMoneyBalanceAfter: treasury.mobileMoneyBalance,
          description: validated.direction === "safe_to_registry"
            ? `Transfert coffre → caisse: ${validated.amount.toLocaleString()} GNF`
            : `Transfert caisse → coffre: ${validated.amount.toLocaleString()} GNF`,
          recordedBy: session!.user.id,
          notes: validated.notes,
        },
      })

      return {
        treasury: updatedTreasury,
        transaction: safeTransaction,
      }
    })

    return NextResponse.json({
      message: "Transfert effectué avec succès",
      direction: validated.direction,
      amount: validated.amount,
      registryBalance: result.treasury.registryBalance,
      safeBalance: result.treasury.safeBalance,
      transactionId: result.transaction.id,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error performing safe transfer:", err)
    return NextResponse.json(
      { message: "Failed to perform safe transfer" },
      { status: 500 }
    )
  }
}
