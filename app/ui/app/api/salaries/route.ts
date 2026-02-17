import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createPaymentSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  schoolYearId: z.string().min(1, "School year is required"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  method: z.enum(["cash", "orange_money"]),
})

/**
 * GET /api/salaries
 * List salary payments with optional filters
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("salary_payments", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const schoolYearId = searchParams.get("schoolYearId")
  const month = searchParams.get("month")
  const year = searchParams.get("year")
  const status = searchParams.get("status")
  const salaryType = searchParams.get("salaryType")
  const userId = searchParams.get("userId")
  const search = searchParams.get("search")
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "100")), 500)
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"))

  try {
    const where: Record<string, unknown> = {}

    if (schoolYearId) where.schoolYearId = schoolYearId
    if (month) where.month = parseInt(month)
    if (year) where.year = parseInt(year)
    if (status) where.status = status
    if (salaryType) where.salaryType = salaryType
    if (userId) where.userId = userId

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    }

    const include = {
      user: { select: { id: true, name: true, email: true, role: true } },
      schoolYear: { select: { id: true, name: true } },
      hoursRecord: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          submitter: { select: { id: true, name: true } },
          reviewer: { select: { id: true, name: true } },
          schoolYear: { select: { id: true, name: true } },
        },
      },
      salaryRate: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      },
      approver: { select: { id: true, name: true } },
      payer: { select: { id: true, name: true } },
      canceller: { select: { id: true, name: true } },
      recoupments: true,
    }

    const [payments, total] = await Promise.all([
      prisma.salaryPayment.findMany({
        where,
        include,
        orderBy: [{ createdAt: "desc" }],
        take: limit,
        skip: offset,
      }),
      prisma.salaryPayment.count({ where }),
    ])

    // Compute stats from all payments matching filter (no pagination)
    const statsWhere = { ...where }
    const allPayments = await prisma.salaryPayment.findMany({
      where: statsWhere,
      select: { status: true, grossAmount: true, netAmount: true },
    })

    const stats = allPayments.reduce(
      (acc, p) => {
        acc.totalPayroll += p.grossAmount
        const key = p.status as keyof typeof acc
        if (key in acc && typeof acc[key] === "object") {
          const bucket = acc[key] as { count: number; amount: number }
          bucket.count++
          bucket.amount += p.netAmount
        }
        return acc
      },
      {
        totalPayroll: 0,
        pending: { count: 0, amount: 0 },
        approved: { count: 0, amount: 0 },
        paid: { count: 0, amount: 0 },
        cancelled: { count: 0, amount: 0 },
      }
    )

    return NextResponse.json({
      payments,
      stats,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + payments.length < total,
      },
    })
  } catch (err) {
    console.error("Error fetching salary payments:", err)
    return NextResponse.json(
      { message: "Failed to fetch salary payments" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/salaries
 * Create a single salary payment for a user/month
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requirePerm("salary_payments", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validated = createPaymentSchema.parse(body)

    // Check for duplicate
    const existing = await prisma.salaryPayment.findUnique({
      where: {
        userId_schoolYearId_month_year: {
          userId: validated.userId,
          schoolYearId: validated.schoolYearId,
          month: validated.month,
          year: validated.year,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { message: "Salary payment already exists for this user/month/year" },
        { status: 409 }
      )
    }

    // Find active salary rate
    const rate = await prisma.salaryRate.findFirst({
      where: {
        userId: validated.userId,
        effectiveTo: null,
      },
    })

    if (!rate) {
      return NextResponse.json(
        { message: "No active salary rate found for this user" },
        { status: 400 }
      )
    }

    let grossAmount: number
    let hoursRecordId: string | null = null
    let hoursWorked: number | null = null

    if (rate.salaryType === "hourly") {
      // Find approved hours record for this month
      const hours = await prisma.hoursRecord.findUnique({
        where: {
          userId_schoolYearId_month_year: {
            userId: validated.userId,
            schoolYearId: validated.schoolYearId,
            month: validated.month,
            year: validated.year,
          },
        },
      })

      if (!hours || hours.status !== "approved") {
        return NextResponse.json(
          { message: "Approved hours record is required for hourly staff" },
          { status: 400 }
        )
      }

      hoursRecordId = hours.id
      hoursWorked = hours.totalHours
      grossAmount = Math.round(hours.totalHours * (rate.hourlyRate ?? 0))
    } else {
      // Fixed monthly salary
      grossAmount = rate.fixedMonthly ?? 0
    }

    if (grossAmount <= 0) {
      return NextResponse.json(
        { message: "Cannot create a payment with zero or negative amount" },
        { status: 400 }
      )
    }

    const payment = await prisma.salaryPayment.create({
      data: {
        userId: validated.userId,
        schoolYearId: validated.schoolYearId,
        month: validated.month,
        year: validated.year,
        salaryType: rate.salaryType,
        hoursRecordId,
        salaryRateId: rate.id,
        hoursWorked,
        hourlyRate: rate.hourlyRate,
        fixedMonthly: rate.fixedMonthly,
        grossAmount,
        advanceDeduction: 0,
        otherDeductions: 0,
        netAmount: grossAmount,
        method: validated.method,
        status: "pending",
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        schoolYear: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating salary payment:", err)
    return NextResponse.json(
      { message: "Failed to create salary payment" },
      { status: 500 }
    )
  }
}
