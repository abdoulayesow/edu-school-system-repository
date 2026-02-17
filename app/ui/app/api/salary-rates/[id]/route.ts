import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateSalaryRateSchema = z.object({
  salaryType: z.enum(["hourly", "fixed"]).optional(),
  hourlyRate: z.number().positive().optional(),
  fixedMonthly: z.number().positive().optional(),
  effectiveFrom: z.string().transform((s) => new Date(s)).optional(),
  effectiveTo: z.string().transform((s) => new Date(s)).optional().nullable(),
})

/**
 * GET /api/salary-rates/[id]
 * Get a single salary rate with user details and history
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("salary_rates", "view")
  if (error) return error

  const { id } = await params

  try {
    const rate = await prisma.salaryRate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        salaryPayments: {
          select: { id: true },
          take: 1,
        },
      },
    })

    if (!rate) {
      return NextResponse.json(
        { message: "Salary rate not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...rate,
      hasPayments: rate.salaryPayments.length > 0,
      salaryPayments: undefined,
    })
  } catch (err) {
    console.error("Error fetching salary rate:", err)
    return NextResponse.json(
      { message: "Failed to fetch salary rate" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/salary-rates/[id]
 * Update a salary rate
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("salary_rates", "update")
  if (error) return error

  const { id } = await params

  try {
    const existing = await prisma.salaryRate.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { message: "Salary rate not found" },
        { status: 404 }
      )
    }

    const body = await req.json()
    const validated = updateSalaryRateSchema.parse(body)

    const rate = await prisma.salaryRate.update({
      where: { id },
      data: validated,
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

    return NextResponse.json(rate)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating salary rate:", err)
    return NextResponse.json(
      { message: "Failed to update salary rate" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/salary-rates/[id]
 * Delete a salary rate (only if no payments reference it)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("salary_rates", "delete")
  if (error) return error

  const { id } = await params

  try {
    const existing = await prisma.salaryRate.findUnique({
      where: { id },
      include: {
        salaryPayments: { select: { id: true }, take: 1 },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { message: "Salary rate not found" },
        { status: 404 }
      )
    }

    if (existing.salaryPayments.length > 0) {
      return NextResponse.json(
        { message: "Cannot delete rate that has associated salary payments" },
        { status: 400 }
      )
    }

    await prisma.salaryRate.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Salary rate deleted" })
  } catch (err) {
    console.error("Error deleting salary rate:", err)
    return NextResponse.json(
      { message: "Failed to delete salary rate" },
      { status: 500 }
    )
  }
}
