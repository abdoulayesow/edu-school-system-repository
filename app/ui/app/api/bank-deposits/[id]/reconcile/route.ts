import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

// Schema for reconciling a bank deposit
const reconcileSchema = z.object({
  notes: z.string().optional(),
})

/**
 * POST /api/bank-deposits/[id]/reconcile
 * Mark a bank deposit as reconciled
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireRole(["director", "accountant"])
  if (error) return error

  const { id } = await params

  try {
    // Get existing deposit
    const existingDeposit = await prisma.bankDeposit.findUnique({
      where: { id },
    })

    if (!existingDeposit) {
      return NextResponse.json(
        { message: "Bank deposit not found" },
        { status: 404 }
      )
    }

    if (existingDeposit.isReconciled) {
      return NextResponse.json(
        { message: "Bank deposit is already reconciled" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = reconcileSchema.parse(body)

    const deposit = await prisma.bankDeposit.update({
      where: { id },
      data: {
        isReconciled: true,
        reconciledAt: new Date(),
        reconciledBy: session!.user.id,
        reconciliationNotes: validated.notes,
      },
      include: {
        recorder: { select: { id: true, name: true, email: true } },
        reconciler: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(deposit)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error reconciling bank deposit:", err)
    return NextResponse.json(
      { message: "Failed to reconcile bank deposit" },
      { status: 500 }
    )
  }
}
