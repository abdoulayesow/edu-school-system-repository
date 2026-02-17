import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const generateSchema = z.object({
  schoolYearId: z.string().min(1, "School year is required"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
})

/**
 * POST /api/salaries/generate
 * Bulk-generate salary payments for all staff with active rates
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requirePerm("salary_payments", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validated = generateSchema.parse(body)

    // Find all active salary rates
    const activeRates = await prisma.salaryRate.findMany({
      where: { effectiveTo: null },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    // Find users who already have payments for this month
    const existingPayments = await prisma.salaryPayment.findMany({
      where: {
        schoolYearId: validated.schoolYearId,
        month: validated.month,
        year: validated.year,
      },
      select: { userId: true },
    })
    const existingUserIds = new Set(existingPayments.map((p) => p.userId))

    // Find approved hours records for this month (for hourly staff)
    const approvedHours = await prisma.hoursRecord.findMany({
      where: {
        schoolYearId: validated.schoolYearId,
        month: validated.month,
        year: validated.year,
        status: "approved",
      },
    })
    const hoursMap = new Map(approvedHours.map((h) => [h.userId, h]))

    const toCreate: Array<{
      userId: string
      schoolYearId: string
      month: number
      year: number
      salaryType: "hourly" | "fixed"
      hoursRecordId: string | null
      salaryRateId: string
      hoursWorked: number | null
      hourlyRate: number | null
      fixedMonthly: number | null
      grossAmount: number
      advanceDeduction: number
      otherDeductions: number
      netAmount: number
      method: "cash" | "orange_money"
      status: "pending"
    }> = []

    const skipped: Array<{ userId: string; name: string | null; reason: string }> = []

    for (const rate of activeRates) {
      // Skip if already has a payment
      if (existingUserIds.has(rate.userId)) {
        skipped.push({
          userId: rate.userId,
          name: rate.user.name,
          reason: "Payment already exists for this month",
        })
        continue
      }

      if (rate.salaryType === "hourly") {
        const hours = hoursMap.get(rate.userId)
        if (!hours) {
          skipped.push({
            userId: rate.userId,
            name: rate.user.name,
            reason: "No approved hours record for this month",
          })
          continue
        }

        const grossAmount = Math.round(hours.totalHours * (rate.hourlyRate ?? 0))
        if (grossAmount <= 0) {
          skipped.push({
            userId: rate.userId,
            name: rate.user.name,
            reason: "Calculated salary amount is zero",
          })
          continue
        }
        toCreate.push({
          userId: rate.userId,
          schoolYearId: validated.schoolYearId,
          month: validated.month,
          year: validated.year,
          salaryType: "hourly",
          hoursRecordId: hours.id,
          salaryRateId: rate.id,
          hoursWorked: hours.totalHours,
          hourlyRate: rate.hourlyRate,
          fixedMonthly: null,
          grossAmount,
          advanceDeduction: 0,
          otherDeductions: 0,
          netAmount: grossAmount,
          method: "cash",
          status: "pending",
        })
      } else {
        // Fixed monthly
        const grossAmount = rate.fixedMonthly ?? 0
        if (grossAmount <= 0) {
          skipped.push({
            userId: rate.userId,
            name: rate.user.name,
            reason: "Fixed monthly salary is zero",
          })
          continue
        }
        toCreate.push({
          userId: rate.userId,
          schoolYearId: validated.schoolYearId,
          month: validated.month,
          year: validated.year,
          salaryType: "fixed",
          hoursRecordId: null,
          salaryRateId: rate.id,
          hoursWorked: null,
          hourlyRate: null,
          fixedMonthly: rate.fixedMonthly,
          grossAmount,
          advanceDeduction: 0,
          otherDeductions: 0,
          netAmount: grossAmount,
          method: "cash",
          status: "pending",
        })
      }
    }

    // Bulk create in a transaction
    let created = 0
    if (toCreate.length > 0) {
      const result = await prisma.$transaction(
        toCreate.map((data) => prisma.salaryPayment.create({ data }))
      )
      created = result.length
    }

    return NextResponse.json({
      created,
      skipped,
      total: activeRates.length,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error generating salaries:", err)
    return NextResponse.json(
      { message: "Failed to generate salary payments" },
      { status: 500 }
    )
  }
}
