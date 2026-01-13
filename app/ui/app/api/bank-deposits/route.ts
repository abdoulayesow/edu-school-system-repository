import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for creating a bank deposit
const createBankDepositSchema = z.object({
  bankReference: z.string().min(1, "Bank reference is required"),
  amount: z.number().positive("Amount must be positive"),
  depositDate: z.string().transform((s) => new Date(s)),
  bankName: z.string().min(1, "Bank name is required"),
  depositorName: z.string().min(1, "Depositor name is required"),
})

/**
 * GET /api/bank-deposits
 * List bank deposits
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("bank_transfers", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const isReconciled = searchParams.get("isReconciled")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const limit = parseInt(searchParams.get("limit") || "100")
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    const where: Record<string, unknown> = {}

    if (isReconciled !== null) {
      where.isReconciled = isReconciled === "true"
    }
    if (startDate || endDate) {
      where.depositDate = {}
      if (startDate) {
        (where.depositDate as Record<string, Date>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.depositDate as Record<string, Date>).lte = new Date(endDate)
      }
    }

    const [deposits, total] = await Promise.all([
      prisma.bankDeposit.findMany({
        where,
        include: {
          recorder: { select: { id: true, name: true, email: true } },
          reconciler: { select: { id: true, name: true, email: true } },
        },
        orderBy: { depositDate: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.bankDeposit.count({ where }),
    ])

    return NextResponse.json({
      deposits,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + deposits.length < total,
      },
    })
  } catch (err) {
    console.error("Error fetching bank deposits:", err)
    return NextResponse.json(
      { message: "Failed to fetch bank deposits" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bank-deposits
 * Record a bank deposit
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requirePerm("bank_transfers", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validated = createBankDepositSchema.parse(body)

    // Check for duplicate bank reference
    const existingDeposit = await prisma.bankDeposit.findUnique({
      where: { bankReference: validated.bankReference },
    })

    if (existingDeposit) {
      return NextResponse.json(
        { message: "A deposit with this bank reference already exists" },
        { status: 400 }
      )
    }

    const deposit = await prisma.bankDeposit.create({
      data: {
        bankReference: validated.bankReference,
        amount: validated.amount,
        depositDate: validated.depositDate,
        bankName: validated.bankName,
        depositorName: validated.depositorName,
        recordedBy: session!.user.id,
      },
      include: {
        recorder: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(deposit, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating bank deposit:", err)
    return NextResponse.json(
      { message: "Failed to create bank deposit" },
      { status: 500 }
    )
  }
}
