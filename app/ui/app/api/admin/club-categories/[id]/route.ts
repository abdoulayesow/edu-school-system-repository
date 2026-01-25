import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  nameFr: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
  order: z.number().int().optional(),
})

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/admin/club-categories/[id]
 * Get a single club category with its clubs
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("schedule", "view")
  if (error) return error

  try {
    const { id } = await params

    const category = await prisma.clubCategory.findUnique({
      where: { id },
      include: {
        clubs: {
          include: {
            _count: {
              select: { enrollments: true },
            },
          },
          orderBy: { name: "asc" },
        },
        _count: {
          select: { clubs: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (err) {
    console.error("Error fetching club category:", err)
    return NextResponse.json(
      { message: "Failed to fetch category" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/club-categories/[id]
 * Update a club category
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("schedule", "update")
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json()
    const validated = updateCategorySchema.parse(body)

    // Check category exists
    const existing = await prisma.clubCategory.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      )
    }

    // Check for duplicate name if name is being changed
    if (validated.name || validated.nameFr) {
      const duplicate = await prisma.clubCategory.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(validated.name ? [{ name: { equals: validated.name, mode: "insensitive" as const } }] : []),
            ...(validated.nameFr ? [{ nameFr: { equals: validated.nameFr, mode: "insensitive" as const } }] : []),
          ],
        },
      })

      if (duplicate) {
        return NextResponse.json(
          { message: "A category with this name already exists" },
          { status: 400 }
        )
      }
    }

    const category = await prisma.clubCategory.update({
      where: { id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.nameFr && { nameFr: validated.nameFr }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.status && { status: validated.status }),
        ...(validated.order !== undefined && { order: validated.order }),
      },
      include: {
        _count: {
          select: { clubs: true },
        },
      },
    })

    return NextResponse.json(category)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating club category:", err)
    return NextResponse.json(
      { message: "Failed to update category" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/club-categories/[id]
 * Delete a club category (only if no clubs)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("schedule", "delete")
  if (error) return error

  try {
    const { id } = await params

    // Check category exists and has no clubs
    const category = await prisma.clubCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { clubs: true } },
      },
    })

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      )
    }

    if (category._count.clubs > 0) {
      return NextResponse.json(
        { message: "Cannot delete category with clubs. Reassign clubs first or set status to inactive." },
        { status: 400 }
      )
    }

    await prisma.clubCategory.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Category deleted" })
  } catch (err) {
    console.error("Error deleting club category:", err)
    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: 500 }
    )
  }
}
