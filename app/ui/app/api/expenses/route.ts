import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for creating an expense
const createExpenseSchema = z.object({
  category: z.enum(["supplies", "maintenance", "utilities", "salary", "transport", "communication", "other"]),
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  method: z.enum(["cash", "orange_money"]).default("cash"),
  date: z.string().transform((s) => new Date(s)),
  vendorName: z.string().optional(),
  receiptUrl: z.string().optional(),
})

/**
 * GET /api/expenses
 * List all expenses with filters
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("safe_expense", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const category = searchParams.get("category")
  const search = searchParams.get("search")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const limit = parseInt(searchParams.get("limit") || "100")
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }
    if (category) {
      where.category = category
    }
    // Search filter (description, vendorName)
    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { vendorName: { contains: search, mode: "insensitive" } },
      ]
    }
    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        (where.date as Record<string, Date>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.date as Record<string, Date>).lte = new Date(endDate)
      }
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          requester: { select: { id: true, name: true, email: true } },
          approver: { select: { id: true, name: true, email: true } },
        },
        orderBy: { date: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.expense.count({ where }),
    ])

    return NextResponse.json({
      expenses,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + expenses.length < total,
      },
    })
  } catch (err) {
    console.error("Error fetching expenses:", err)
    return NextResponse.json(
      { message: "Failed to fetch expenses" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/expenses
 * Create a new expense request
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requirePerm("safe_expense", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validated = createExpenseSchema.parse(body)

    const expense = await prisma.expense.create({
      data: {
        category: validated.category,
        description: validated.description,
        amount: validated.amount,
        method: validated.method,
        date: validated.date,
        vendorName: validated.vendorName,
        receiptUrl: validated.receiptUrl,
        status: "pending",
        requestedBy: session!.user.id,
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating expense:", err)
    return NextResponse.json(
      { message: "Failed to create expense" },
      { status: 500 }
    )
  }
}
