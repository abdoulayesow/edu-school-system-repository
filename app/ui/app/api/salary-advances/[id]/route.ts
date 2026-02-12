import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateAdvanceSchema = z.object({
  strategy: z.enum(["full", "spread", "custom"]).optional(),
  numberOfInstallments: z.number().int().positive().optional(),
  status: z.enum(["cancelled"]).optional(),
  cancellationNote: z.string().optional(),
})

/**
 * GET /api/salary-advances/[id]
 * Get a single salary advance with full relations
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("salary_advances", "view")
  if (error) return error

  const { id } = await params

  try {
    const advance = await prisma.salaryAdvance.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        disburser: { select: { id: true, name: true } },
        canceller: { select: { id: true, name: true } },
        recoupments: {
          include: {
            salaryPayment: {
              select: { id: true, month: true, year: true, paidAt: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!advance) {
      return NextResponse.json(
        { message: "Salary advance not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(advance)
  } catch (err) {
    console.error("Error fetching salary advance:", err)
    return NextResponse.json(
      { message: "Failed to fetch salary advance" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/salary-advances/[id]
 * Update advance strategy/installments or cancel
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("salary_advances", "update")
  if (error) return error

  const { id } = await params

  try {
    const body = await req.json()
    const validated = updateAdvanceSchema.parse(body)

    const existing = await prisma.salaryAdvance.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { message: "Salary advance not found" },
        { status: 404 }
      )
    }

    if (existing.status !== "active") {
      return NextResponse.json(
        { message: "Only active advances can be modified" },
        { status: 400 }
      )
    }

    // Handle cancellation
    if (validated.status === "cancelled") {
      if (!validated.cancellationNote) {
        return NextResponse.json(
          { message: "Cancellation note is required" },
          { status: 400 }
        )
      }

      const advance = await prisma.salaryAdvance.update({
        where: { id },
        data: {
          status: "cancelled",
          cancelledBy: session!.user.id,
          cancelledAt: new Date(),
          cancellationNote: validated.cancellationNote,
        },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      })

      return NextResponse.json(advance)
    }

    // Handle strategy/installments update
    const data: Record<string, unknown> = {}
    if (validated.strategy) {
      data.strategy = validated.strategy
      if (validated.strategy === "spread" && !validated.numberOfInstallments) {
        return NextResponse.json(
          { message: "Number of installments is required for spread strategy" },
          { status: 400 }
        )
      }
    }
    if (validated.numberOfInstallments !== undefined) {
      data.numberOfInstallments = validated.numberOfInstallments
    }

    const advance = await prisma.salaryAdvance.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        disburser: { select: { id: true, name: true } },
        recoupments: true,
      },
    })

    return NextResponse.json(advance)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating salary advance:", err)
    return NextResponse.json(
      { message: "Failed to update salary advance" },
      { status: 500 }
    )
  }
}
