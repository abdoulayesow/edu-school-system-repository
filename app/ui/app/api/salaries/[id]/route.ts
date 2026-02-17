import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/salaries/[id]
 * Get a single salary payment with full relations
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("salary_payments", "view")
  if (error) return error

  const { id } = await params

  try {
    const payment = await prisma.salaryPayment.findUnique({
      where: { id },
      include: {
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
        recoupments: {
          include: {
            salaryAdvance: {
              select: { id: true, amount: true, reason: true, strategy: true },
            },
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { message: "Salary payment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(payment)
  } catch (err) {
    console.error("Error fetching salary payment:", err)
    return NextResponse.json(
      { message: "Failed to fetch salary payment" },
      { status: 500 }
    )
  }
}
