import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/salary-hours/[id]/submit
 * Transition hours record from draft → submitted
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("salary_hours", "create")
  if (error) return error

  const { id } = await params

  try {
    const existing = await prisma.hoursRecord.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { message: "Hours record not found" },
        { status: 404 }
      )
    }

    if (existing.status !== "draft") {
      return NextResponse.json(
        { message: "Can only submit hours records in draft status" },
        { status: 400 }
      )
    }

    const record = await prisma.hoursRecord.update({
      where: { id },
      data: {
        status: "submitted",
        submittedBy: session!.user.id,
        submittedAt: new Date(),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        schoolYear: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(record)
  } catch (err) {
    console.error("Error submitting hours record:", err)
    return NextResponse.json(
      { message: "Failed to submit hours record" },
      { status: 500 }
    )
  }
}
