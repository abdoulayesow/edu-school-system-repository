import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for daily opening
const dailyOpeningSchema = z.object({
  countedSafeBalance: z.number().int().nonnegative(),
  floatAmount: z.number().int().positive().default(2000000),
  notes: z.string().optional(),
})

/**
 * POST /api/treasury/daily-opening
 * Perform daily opening: count safe, transfer float to registry
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(["director", "accountant"])
  if (error) return error

  try {
    const body = await req.json()
    const validated = dailyOpeningSchema.parse(body)

    // Get current treasury state
    const treasury = await prisma.treasuryBalance.findFirst()
    if (!treasury) {
      return NextResponse.json(
        { message: "Treasury not initialized. Please contact administrator." },
        { status: 400 }
      )
    }

    // Validation: Registry should be empty (closed from previous day)
    if (treasury.registryBalance !== 0) {
      return NextResponse.json(
        {
          message: "La caisse n'est pas vide. Veuillez d'abord effectuer la fermeture du jour précédent.",
          registryBalance: treasury.registryBalance,
        },
        { status: 400 }
      )
    }

    // Calculate discrepancy between expected and counted safe
    const discrepancy = validated.countedSafeBalance - treasury.safeBalance

    // Check if float amount is available in safe
    if (validated.countedSafeBalance < validated.floatAmount) {
      return NextResponse.json(
        {
          message: "Fonds insuffisants dans le coffre pour le fond de caisse",
          available: validated.countedSafeBalance,
          required: validated.floatAmount,
        },
        { status: 400 }
      )
    }

    // Perform opening in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update treasury balances
      const newSafeBalance = validated.countedSafeBalance - validated.floatAmount
      const newRegistryBalance = validated.floatAmount

      const updatedTreasury = await tx.treasuryBalance.update({
        where: { id: treasury.id },
        data: {
          safeBalance: newSafeBalance,
          registryBalance: newRegistryBalance,
          registryFloatAmount: validated.floatAmount,
          updatedAt: new Date(),
        },
      })

      // Create transaction record for safe → registry transfer
      const safeTransaction = await tx.safeTransaction.create({
        data: {
          type: "safe_to_registry",
          direction: "out",
          amount: validated.floatAmount,
          registryBalanceAfter: newRegistryBalance,
          safeBalanceAfter: newSafeBalance,
          bankBalanceAfter: treasury.bankBalance,
          mobileMoneyBalanceAfter: treasury.mobileMoneyBalance,
          description: `Ouverture journalière - Fond de caisse ${validated.floatAmount.toLocaleString()} GNF`,
          recordedBy: session!.user.id,
          notes: validated.notes || `Comptage coffre: ${validated.countedSafeBalance.toLocaleString()} GNF${discrepancy !== 0 ? ` (Écart: ${discrepancy.toLocaleString()} GNF)` : ""}`,
        },
      })

      // If there's a discrepancy, create an adjustment transaction
      let adjustmentTransaction = null
      if (discrepancy !== 0) {
        adjustmentTransaction = await tx.safeTransaction.create({
          data: {
            type: "adjustment",
            direction: discrepancy > 0 ? "in" : "out",
            amount: Math.abs(discrepancy),
            registryBalanceAfter: newRegistryBalance,
            safeBalanceAfter: newSafeBalance,
            bankBalanceAfter: treasury.bankBalance,
            mobileMoneyBalanceAfter: treasury.mobileMoneyBalance,
            description: `Ajustement d'ouverture - ${discrepancy > 0 ? "Surplus" : "Manque"} de ${Math.abs(discrepancy).toLocaleString()} GNF`,
            recordedBy: session!.user.id,
            notes: `Écart détecté lors de l'ouverture. Attendu: ${treasury.safeBalance.toLocaleString()} GNF, Compté: ${validated.countedSafeBalance.toLocaleString()} GNF`,
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
        ? "Ouverture journalière effectuée avec succès"
        : `Ouverture effectuée avec écart de ${discrepancy.toLocaleString()} GNF`,
      registryBalance: result.treasury.registryBalance,
      safeBalance: result.treasury.safeBalance,
      floatAmount: validated.floatAmount,
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
    console.error("Error performing daily opening:", err)
    return NextResponse.json(
      { message: "Failed to perform daily opening" },
      { status: 500 }
    )
  }
}
