import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateClubSchema = z.object({
  name: z.string().min(1).optional(),
  nameFr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  leaderId: z.string().optional().nullable(),
  startDate: z.string().transform((s) => new Date(s)).optional(),
  endDate: z.string().transform((s) => new Date(s)).optional(),
  fee: z.number().int().min(0).optional(),
  monthlyFee: z.number().int().min(0).optional().nullable(),
  capacity: z.number().int().min(1).optional(),
  status: z.enum(["draft", "active", "closed", "completed", "cancelled"]).optional(),
  isEnabled: z.boolean().optional(),
})

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/admin/clubs/[id]
 * Get a single club with enrollments and payments
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("schedule", "view")
  if (error) return error

  try {
    const { id } = await params

    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true, nameFr: true },
        },
        leader: {
          include: {
            person: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        eligibilityRule: {
          include: {
            gradeRules: {
              include: {
                grade: {
                  select: { id: true, name: true, order: true },
                },
              },
            },
            seriesRules: true,
          },
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
            monthlyPayments: {
              orderBy: [{ year: "asc" }, { month: "asc" }],
            },
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

    if (!club) {
      return NextResponse.json(
        { message: "Club not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(club)
  } catch (err) {
    console.error("Error fetching club:", err)
    return NextResponse.json(
      { message: "Failed to fetch club" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/clubs/[id]
 * Update a club
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("schedule", "update")
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json()
    const validated = updateClubSchema.parse(body)

    // Check club exists
    const existing = await prisma.club.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { message: "Club not found" },
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

    // Verify category exists if provided
    if (validated.categoryId) {
      const category = await prisma.clubCategory.findUnique({
        where: { id: validated.categoryId },
      })
      if (!category) {
        return NextResponse.json(
          { message: "Category not found" },
          { status: 404 }
        )
      }
    }

    // Verify leader exists if provided
    if (validated.leaderId) {
      const leader = await prisma.teacherProfile.findUnique({
        where: { id: validated.leaderId },
      })
      if (!leader) {
        return NextResponse.json(
          { message: "Leader not found" },
          { status: 404 }
        )
      }
    }

    const club = await prisma.club.update({
      where: { id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.nameFr !== undefined && { nameFr: validated.nameFr }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.categoryId !== undefined && { categoryId: validated.categoryId }),
        ...(validated.leaderId !== undefined && { leaderId: validated.leaderId }),
        ...(validated.startDate && { startDate: validated.startDate }),
        ...(validated.endDate && { endDate: validated.endDate }),
        ...(validated.fee !== undefined && { fee: validated.fee }),
        ...(validated.monthlyFee !== undefined && { monthlyFee: validated.monthlyFee }),
        ...(validated.capacity !== undefined && { capacity: validated.capacity }),
        ...(validated.status && { status: validated.status }),
        ...(validated.isEnabled !== undefined && { isEnabled: validated.isEnabled }),
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true, nameFr: true },
        },
        leader: {
          include: {
            person: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        _count: {
          select: { enrollments: true, payments: true },
        },
      },
    })

    return NextResponse.json(club)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating club:", err)
    return NextResponse.json(
      { message: "Failed to update club" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/clubs/[id]
 * Delete a club (only if no enrollments)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("schedule", "delete")
  if (error) return error

  try {
    const { id } = await params

    // Check club exists and has no enrollments
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        _count: { select: { enrollments: true } },
      },
    })

    if (!club) {
      return NextResponse.json(
        { message: "Club not found" },
        { status: 404 }
      )
    }

    if (club._count.enrollments > 0) {
      return NextResponse.json(
        { message: "Cannot delete club with enrollments. Set status to cancelled instead." },
        { status: 400 }
      )
    }

    await prisma.club.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Club deleted" })
  } catch (err) {
    console.error("Error deleting club:", err)
    return NextResponse.json(
      { message: "Failed to delete club" },
      { status: 500 }
    )
  }
}
