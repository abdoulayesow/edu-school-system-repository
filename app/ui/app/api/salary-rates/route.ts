import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createSalaryRateSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  salaryType: z.enum(["hourly", "fixed"]),
  hourlyRate: z.number().positive("Hourly rate must be positive").optional(),
  fixedMonthly: z.number().positive("Fixed monthly must be positive").optional(),
  effectiveFrom: z.string().transform((s) => new Date(s)),
}).refine(
  (data) => {
    if (data.salaryType === "hourly") return data.hourlyRate !== undefined
    if (data.salaryType === "fixed") return data.fixedMonthly !== undefined
    return false
  },
  { message: "Hourly rate required for hourly type, fixed monthly for fixed type" }
)

/**
 * GET /api/salary-rates
 * List salary rates with optional filters
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("salary_rates", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  const salaryType = searchParams.get("salaryType")
  const active = searchParams.get("active")
  const search = searchParams.get("search")
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "100")), 500)
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"))

  try {
    const where: Record<string, unknown> = {}

    if (userId) where.userId = userId
    if (salaryType) where.salaryType = salaryType

    if (active === "true") {
      where.effectiveTo = null
    } else if (active === "false") {
      where.effectiveTo = { not: null }
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    }

    const [rates, total] = await Promise.all([
      prisma.salaryRate.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: [{ effectiveTo: "asc" }, { effectiveFrom: "desc" }],
        take: limit,
        skip: offset,
      }),
      prisma.salaryRate.count({ where }),
    ])

    return NextResponse.json({
      rates,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + rates.length < total,
      },
    })
  } catch (err) {
    console.error("Error fetching salary rates:", err)
    return NextResponse.json(
      { message: "Failed to fetch salary rates" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/salary-rates
 * Create a new salary rate (auto-closes previous active rate for same user)
 */
export async function POST(req: NextRequest) {
  const { error } = await requirePerm("salary_rates", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validated = createSalaryRateSchema.parse(body)

    // Auto-close the current active rate for this user (if any)
    const activeRate = await prisma.salaryRate.findFirst({
      where: {
        userId: validated.userId,
        effectiveTo: null,
      },
    })

    const rate = await prisma.$transaction(async (tx) => {
      if (activeRate) {
        await tx.salaryRate.update({
          where: { id: activeRate.id },
          data: { effectiveTo: validated.effectiveFrom },
        })
      }

      return tx.salaryRate.create({
        data: {
          userId: validated.userId,
          salaryType: validated.salaryType,
          hourlyRate: validated.salaryType === "hourly" ? validated.hourlyRate : null,
          fixedMonthly: validated.salaryType === "fixed" ? validated.fixedMonthly : null,
          effectiveFrom: validated.effectiveFrom,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      })
    })

    return NextResponse.json(rate, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating salary rate:", err)
    return NextResponse.json(
      { message: "Failed to create salary rate" },
      { status: 500 }
    )
  }
}
