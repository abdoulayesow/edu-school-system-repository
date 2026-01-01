import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateActivitySchema = z.object({
  name: z.string().min(1).optional(),
  nameFr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  type: z.enum(["club", "sport", "arts", "academic", "other"]).optional(),
  startDate: z.string().transform((s) => new Date(s)).optional(),
  endDate: z.string().transform((s) => new Date(s)).optional(),
  fee: z.number().int().min(0).optional(),
  capacity: z.number().int().min(1).optional(),
  status: z.enum(["draft", "active", "closed", "completed", "cancelled"]).optional(),
  isEnabled: z.boolean().optional(),
})

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/admin/activities/[id]
 * Get a single activity with enrollments and payments
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director", "academic_director", "accountant"])
  if (error) return error

  try {
    const { id } = await params

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        enrollments: {
          include: {
            studentProfile: {
              include: {
                person: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
            enroller: {
              select: { id: true, name: true },
            },
            payments: true,
          },
          orderBy: { enrolledAt: "desc" },
        },
        payments: {
          include: {
            recorder: {
              select: { id: true, name: true },
            },
            confirmer: {
              select: { id: true, name: true },
            },
          },
          orderBy: { recordedAt: "desc" },
        },
        _count: {
          select: { enrollments: true, payments: true },
        },
      },
    })

    if (!activity) {
      return NextResponse.json(
        { message: "Activity not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(activity)
  } catch (err) {
    console.error("Error fetching activity:", err)
    return NextResponse.json(
      { message: "Failed to fetch activity" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/activities/[id]
 * Update an activity
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director", "academic_director"])
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json()
    const validated = updateActivitySchema.parse(body)

    // Check activity exists
    const existing = await prisma.activity.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { message: "Activity not found" },
        { status: 404 }
      )
    }

    // Validate dates if both provided
    const startDate = validated.startDate || existing.startDate
    const endDate = validated.endDate || existing.endDate
    if (endDate <= startDate) {
      return NextResponse.json(
        { message: "End date must be after start date" },
        { status: 400 }
      )
    }

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.nameFr !== undefined && { nameFr: validated.nameFr }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.type && { type: validated.type }),
        ...(validated.startDate && { startDate: validated.startDate }),
        ...(validated.endDate && { endDate: validated.endDate }),
        ...(validated.fee !== undefined && { fee: validated.fee }),
        ...(validated.capacity !== undefined && { capacity: validated.capacity }),
        ...(validated.status && { status: validated.status }),
        ...(validated.isEnabled !== undefined && { isEnabled: validated.isEnabled }),
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { enrollments: true, payments: true },
        },
      },
    })

    return NextResponse.json(activity)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating activity:", err)
    return NextResponse.json(
      { message: "Failed to update activity" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/activities/[id]
 * Delete an activity (only if no enrollments)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director"])
  if (error) return error

  try {
    const { id } = await params

    // Check activity exists and has no enrollments
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        _count: { select: { enrollments: true } },
      },
    })

    if (!activity) {
      return NextResponse.json(
        { message: "Activity not found" },
        { status: 404 }
      )
    }

    if (activity._count.enrollments > 0) {
      return NextResponse.json(
        { message: "Cannot delete activity with enrollments. Set status to cancelled instead." },
        { status: 400 }
      )
    }

    await prisma.activity.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Activity deleted" })
  } catch (err) {
    console.error("Error deleting activity:", err)
    return NextResponse.json(
      { message: "Failed to delete activity" },
      { status: 500 }
    )
  }
}
