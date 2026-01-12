import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

type RouteParams = {
  params: Promise<{ id: string }>
}

// Schema for reviewing a discrepancy
const reviewSchema = z.object({
  reviewNotes: z.string().min(1, "Review notes are required"),
})

/**
 * POST /api/treasury/verifications/[id]/review
 * Director reviews a verification discrepancy
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireRole(["director"])
  if (error) return error

  const { id } = await params

  try {
    const body = await req.json()
    const validation = reviewSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { reviewNotes } = validation.data

    // Get the verification
    const verification = await prisma.dailyVerification.findUnique({
      where: { id },
    })

    if (!verification) {
      return NextResponse.json(
        { message: "Verification not found" },
        { status: 404 }
      )
    }

    if (verification.status !== "discrepancy") {
      return NextResponse.json(
        { message: "Only discrepancy verifications can be reviewed" },
        { status: 400 }
      )
    }

    if (verification.reviewedBy) {
      return NextResponse.json(
        { message: "This verification has already been reviewed" },
        { status: 400 }
      )
    }

    // Update the verification
    const updatedVerification = await prisma.dailyVerification.update({
      where: { id },
      data: {
        status: "reviewed",
        reviewedBy: session!.user.id,
        reviewedAt: new Date(),
        reviewNotes,
      },
      include: {
        verifier: {
          select: { id: true, name: true },
        },
        reviewer: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json({
      message: "Discrepancy reviewed successfully",
      verification: updatedVerification,
    })
  } catch (err) {
    console.error("Error reviewing verification:", err)
    return NextResponse.json(
      { message: "Failed to review verification" },
      { status: 500 }
    )
  }
}
