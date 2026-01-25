import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createCategorySchema = z.object({
  name: z.string().min(1, "English name is required"),
  nameFr: z.string().min(1, "French name is required"),
  description: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
  order: z.number().int().default(0),
})

/**
 * GET /api/admin/club-categories
 * List all club categories
 * Query params: status (optional), search (optional)
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("schedule", "view")
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") as "active" | "inactive" | null
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {
      ...(status && { status }),
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nameFr: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const categories = await prisma.clubCategory.findMany({
      where,
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { clubs: true },
        },
      },
    })

    return NextResponse.json(categories)
  } catch (err) {
    console.error("Error fetching club categories:", err)
    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/club-categories
 * Create a new club category
 */
export async function POST(req: NextRequest) {
  const { error } = await requirePerm("schedule", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validated = createCategorySchema.parse(body)

    // Check for duplicate name
    const existing = await prisma.clubCategory.findFirst({
      where: {
        OR: [
          { name: { equals: validated.name, mode: "insensitive" } },
          { nameFr: { equals: validated.nameFr, mode: "insensitive" } },
        ],
      },
    })

    if (existing) {
      return NextResponse.json(
        { message: "A category with this name already exists" },
        { status: 400 }
      )
    }

    const category = await prisma.clubCategory.create({
      data: {
        name: validated.name,
        nameFr: validated.nameFr,
        description: validated.description,
        status: validated.status,
        order: validated.order,
      },
      include: {
        _count: {
          select: { clubs: true },
        },
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating club category:", err)
    return NextResponse.json(
      { message: "Failed to create category" },
      { status: 500 }
    )
  }
}
