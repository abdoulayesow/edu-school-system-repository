import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { SafeTransactionType, CashDirection } from "@prisma/client"

interface RouteParams {
  params: Promise<{ id: string }>
}

const paySchema = z.object({
  method: z.enum(["cash", "orange_money"]),
  notes: z.string().optional(),
})

/**
 * POST /api/salaries/[id]/pay
 * Pay an approved salary — includes recoupment engine + treasury deduction
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("salary_payments", "update")
  if (error) return error

  const { id } = await params

  try {
    const body = await req.json()
    const validated = paySchema.parse(body)

    // ---------------------------------------------------------------
    // ATOMIC TRANSACTION
    // All queries + mutations inside transaction to prevent races
    // ---------------------------------------------------------------
    const isCash = validated.method === "cash"

    const result = await prisma.$transaction(async (tx) => {
      // 0. Fetch payment record (inside transaction to prevent TOCTOU)
      const existing = await tx.salaryPayment.findUnique({
        where: { id },
        include: { user: { select: { id: true, name: true } } },
      })

      if (!existing) {
        throw new Error("PAYMENT_NOT_FOUND")
      }

      if (existing.status !== "approved") {
        throw new Error("INVALID_STATUS")
      }

      // 1. Get treasury balance (inside transaction for consistency)
      const currentBalance = await tx.treasuryBalance.findFirst()
      if (!currentBalance) {
        throw new Error("BALANCE_NOT_INITIALIZED")
      }

      // 2. Recoupment engine — query advances inside transaction
      const activeAdvances = await tx.salaryAdvance.findMany({
        where: {
          userId: existing.userId,
          status: "active",
          remainingBalance: { gt: 0 },
        },
        orderBy: { disbursedAt: "asc" }, // oldest first
      })

      let totalDeduction = 0
      const deductions: Array<{
        advanceId: string
        amount: number
        newRemainingBalance: number
        shouldClose: boolean
      }> = []

      for (const advance of activeAdvances) {
        if (totalDeduction >= existing.grossAmount) break

        const available = existing.grossAmount - totalDeduction
        let deductionAmount = 0

        if (advance.strategy === "full") {
          deductionAmount = Math.min(advance.remainingBalance, available)
        } else if (advance.strategy === "spread" && advance.numberOfInstallments) {
          const existingRecoupments = await tx.advanceRecoupment.count({
            where: { salaryAdvanceId: advance.id },
          })
          const installmentsLeft = Math.max(
            1,
            advance.numberOfInstallments - existingRecoupments
          )
          deductionAmount = Math.min(
            Math.ceil(advance.remainingBalance / installmentsLeft),
            available
          )
        } else if (advance.strategy === "custom") {
          console.warn(
            `Skipping custom-strategy advance ${advance.id} for user ${advance.userId} — requires manual recoupment`
          )
          continue
        }

        if (deductionAmount <= 0) continue

        const newRemaining = advance.remainingBalance - deductionAmount
        deductions.push({
          advanceId: advance.id,
          amount: deductionAmount,
          newRemainingBalance: newRemaining,
          shouldClose: newRemaining <= 0,
        })
        totalDeduction += deductionAmount
      }

      // Assertion: deductions should never exceed gross (loop logic guarantees this)
      if (totalDeduction > existing.grossAmount) {
        console.error(
          `Recoupment bug: totalDeduction ${totalDeduction} > grossAmount ${existing.grossAmount} for payment ${id}`
        )
        throw new Error("RECOUPMENT_CALCULATION_ERROR")
      }

      const netAmount = existing.grossAmount - totalDeduction

      // 3. Balance check (inside transaction — reads fresh balance)
      if (isCash) {
        if (currentBalance.registryBalance === 0) {
          throw new Error("CASH_REGISTER_CLOSED")
        }
        if (currentBalance.registryBalance < netAmount) {
          throw new Error(`INSUFFICIENT_CASH:${currentBalance.registryBalance}:${netAmount}`)
        }
      } else {
        if (currentBalance.mobileMoneyBalance < netAmount) {
          throw new Error(`INSUFFICIENT_MOBILE:${currentBalance.mobileMoneyBalance}:${netAmount}`)
        }
      }

      // 4. Update salary payment
      const payment = await tx.salaryPayment.update({
        where: { id },
        data: {
          status: "paid",
          method: validated.method,
          paidBy: session!.user.id,
          paidAt: new Date(),
          advanceDeduction: totalDeduction,
          netAmount,
          notes: validated.notes,
        },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      })

      // 5. Create recoupment records and update advances
      for (const d of deductions) {
        const existingCount = await tx.advanceRecoupment.count({
          where: { salaryAdvanceId: d.advanceId },
        })

        await tx.advanceRecoupment.create({
          data: {
            salaryAdvanceId: d.advanceId,
            salaryPaymentId: id,
            amount: d.amount,
            installmentNumber: existingCount + 1,
          },
        })

        await tx.salaryAdvance.update({
          where: { id: d.advanceId },
          data: {
            totalRecouped: { increment: d.amount },
            remainingBalance: { decrement: d.amount },
            ...(d.shouldClose ? { status: "fully_recouped" } : {}),
          },
        })
      }

      // 6. Update treasury balance (atomic decrement)
      const updatedBalance = await tx.treasuryBalance.update({
        where: { id: currentBalance.id },
        data: isCash
          ? { registryBalance: { decrement: netAmount } }
          : { mobileMoneyBalance: { decrement: netAmount } },
      })

      // 7. Create safe transaction for audit trail
      await tx.safeTransaction.create({
        data: {
          type: "salary_payment" as SafeTransactionType,
          direction: "out" as CashDirection,
          amount: netAmount,
          registryBalanceAfter: updatedBalance.registryBalance,
          mobileMoneyBalanceAfter: updatedBalance.mobileMoneyBalance,
          safeBalanceAfter: updatedBalance.safeBalance,
          bankBalanceAfter: updatedBalance.bankBalance,
          description: `Salaire: ${existing.user.name ?? "Staff"} (${existing.month}/${existing.year})`,
          referenceType: "salary_payment",
          referenceId: existing.id,
          beneficiaryName: existing.user.name,
          category: "salary",
          recordedBy: session!.user.id,
          notes: validated.notes,
        },
      })

      return {
        payment,
        deductions: deductions.map((d) => ({
          advanceId: d.advanceId,
          amount: d.amount,
        })),
        newBalance: isCash ? updatedBalance.registryBalance : updatedBalance.mobileMoneyBalance,
      }
    })

    return NextResponse.json({
      message: "Salary payment processed successfully",
      ...result,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }

    // Handle business logic errors thrown from inside transaction
    const msg = err instanceof Error ? err.message : ""
    if (msg === "PAYMENT_NOT_FOUND") {
      return NextResponse.json(
        { message: "Salary payment not found" },
        { status: 404 }
      )
    }
    if (msg === "INVALID_STATUS") {
      return NextResponse.json(
        { message: "Only approved payments can be paid" },
        { status: 400 }
      )
    }
    if (msg === "BALANCE_NOT_INITIALIZED") {
      return NextResponse.json(
        { message: "Treasury not initialized. Please initialize the balance first." },
        { status: 400 }
      )
    }
    if (msg === "CASH_REGISTER_CLOSED") {
      return NextResponse.json(
        { message: "La caisse est fermée. Veuillez d'abord effectuer l'ouverture journalière." },
        { status: 400 }
      )
    }
    if (msg.startsWith("INSUFFICIENT_CASH:")) {
      const [, available, required] = msg.split(":")
      return NextResponse.json(
        { message: "Fonds insuffisants dans la caisse", available: Number(available), required: Number(required) },
        { status: 400 }
      )
    }
    if (msg.startsWith("INSUFFICIENT_MOBILE:")) {
      const [, available, required] = msg.split(":")
      return NextResponse.json(
        { message: "Solde Orange Money insuffisant", available: Number(available), required: Number(required) },
        { status: 400 }
      )
    }
    if (msg === "RECOUPMENT_CALCULATION_ERROR") {
      return NextResponse.json(
        { message: "Internal error: recoupment calculation inconsistency" },
        { status: 500 }
      )
    }

    console.error("Error paying salary:", err)
    return NextResponse.json(
      { message: "Failed to process salary payment" },
      { status: 500 }
    )
  }
}
