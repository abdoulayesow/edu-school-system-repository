import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

const reviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionNote: z.string().optional(),
}).refine(
  (data) => data.action !== "reject" || (data.rejectionNote && data.rejectionNote.length > 0),
  { message: "Rejection note is required when rejecting", path: ["rejectionNote"] }
)

/**
 * POST /api/salary-hours/[id]/review
 * Transition hours record: submitted → approved or rejected
 * Only accounting roles can review (salary_hours.approve)
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("salary_hours", "approve")
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

    if (existing.status !== "submitted") {
      return NextResponse.json(
        { message: "Can only review hours records in submitted status" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = reviewSchema.parse(body)

    const record = await prisma.hoursRecord.update({
      where: { id },
      data: {
        status: validated.action === "approve" ? "approved" : "rejected",
        reviewedBy: session!.user.id,
        reviewedAt: new Date(),
        rejectionNote: validated.action === "reject" ? validated.rejectionNote : null,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        submitter: {
          select: { id: true, name: true },
        },
        reviewer: {
          select: { id: true, name: true },
        },
        schoolYear: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(record)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error reviewing hours record:", err)
    return NextResponse.json(
      { message: "Failed to review hours record" },
      { status: 500 }
    )
  }
}
