import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for daily closing
const dailyClosingSchema = z.object({
  countedRegistryBalance: z.number().int().nonnegative(),
  notes: z.string().optional(),
})

/**
 * POST /api/treasury/daily-closing
 * Perform daily closing: count registry, transfer all cash to safe
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requirePerm("safe_balance", "update")
  if (error) return error

  try {
    const body = await req.json()
    const validated = dailyClosingSchema.parse(body)

    // Get current treasury state
    const treasury = await prisma.treasuryBalance.findFirst()
    if (!treasury) {
      return NextResponse.json(
        { message: "Treasury not initialized. Please contact administrator." },
        { status: 400 }
      )
    }

    // Validation: Registry should not be empty (must have opened the day)
    if (treasury.registryBalance === 0) {
      return NextResponse.json(
        {
          message: "La caisse est déjà vide. Aucune fermeture nécessaire.",
        },
        { status: 400 }
      )
    }

    // Calculate discrepancy between expected and counted registry
    const discrepancy = validated.countedRegistryBalance - treasury.registryBalance

    // Perform closing in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update treasury balances: move all registry to safe
      const newSafeBalance = treasury.safeBalance + validated.countedRegistryBalance
      const newRegistryBalance = 0

      const updatedTreasury = await tx.treasuryBalance.update({
        where: { id: treasury.id },
        data: {
          safeBalance: newSafeBalance,
          registryBalance: newRegistryBalance,
          updatedAt: new Date(),
        },
      })

      // Create transaction record for registry → safe transfer
      const safeTransaction = await tx.safeTransaction.create({
        data: {
          type: "registry_to_safe",
          direction: "in",
          amount: validated.countedRegistryBalance,
          registryBalanceAfter: newRegistryBalance,
          safeBalanceAfter: newSafeBalance,
          bankBalanceAfter: treasury.bankBalance,
          mobileMoneyBalanceAfter: treasury.mobileMoneyBalance,
          description: `Fermeture journalière - Dépôt ${validated.countedRegistryBalance.toLocaleString()} GNF au coffre`,
          recordedBy: session!.user.id,
          notes: validated.notes || `Comptage caisse: ${validated.countedRegistryBalance.toLocaleString()} GNF${discrepancy !== 0 ? ` (Écart: ${discrepancy.toLocaleString()} GNF)` : ""}`,
        },
      })

      // If there's a discrepancy, create an adjustment transaction
      let adjustmentTransaction = null
      if (discrepancy !== 0) {
        adjustmentTransaction = await tx.safeTransaction.create({
          data: {
            type: "registry_adjustment",
            direction: discrepancy > 0 ? "in" : "out",
            amount: Math.abs(discrepancy),
            registryBalanceAfter: newRegistryBalance,
            safeBalanceAfter: newSafeBalance,
            bankBalanceAfter: treasury.bankBalance,
            mobileMoneyBalanceAfter: treasury.mobileMoneyBalance,
            description: `Ajustement de fermeture - ${discrepancy > 0 ? "Surplus" : "Manque"} de ${Math.abs(discrepancy).toLocaleString()} GNF`,
            recordedBy: session!.user.id,
            notes: `Écart détecté lors de la fermeture. Attendu: ${treasury.registryBalance.toLocaleString()} GNF, Compté: ${validated.countedRegistryBalance.toLocaleString()} GNF`,
          },
        })
      }

      return {
        treasury: updatedTreasury,
        transaction: safeTransaction,
        adjustmentTransaction,
        discrepancy,
      }
    })

    return NextResponse.json({
      message: discrepancy === 0
        ? "Fermeture journalière effectuée avec succès"
        : `Fermeture effectuée avec écart de ${discrepancy.toLocaleString()} GNF`,
      registryBalance: result.treasury.registryBalance,
      safeBalance: result.treasury.safeBalance,
      amountTransferred: validated.countedRegistryBalance,
      discrepancy,
      transactionId: result.transaction.id,
      adjustmentTransactionId: result.adjustmentTransaction?.id,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error performing daily closing:", err)
    return NextResponse.json(
      { message: "Failed to perform daily closing" },
      { status: 500 }
    )
  }
}
