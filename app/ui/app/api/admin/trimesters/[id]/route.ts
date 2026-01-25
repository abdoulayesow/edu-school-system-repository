import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateTrimesterSchema = z.object({
  startDate: z.string().transform((s) => new Date(s)).optional(),
  endDate: z.string().transform((s) => new Date(s)).optional(),
})

/**
 * GET /api/admin/trimesters/[id]
 * Get a specific trimester with details
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("academic_year", "view")
  if (error) return error

  const { id } = await params

  try {
    const trimester = await prisma.trimester.findUnique({
      where: { id },
      include: {
        schoolYear: {
          select: {
            id: true,
            name: true,
            isActive: true,
            startDate: true,
            endDate: true,
          },
        },
        _count: {
          select: {
            evaluations: true,
            subjectAverages: true,
            studentTrimesters: true,
          },
        },
      },
    })

    if (!trimester) {
      return NextResponse.json(
        { message: "Trimester not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: trimester.id,
      schoolYearId: trimester.schoolYearId,
      schoolYear: trimester.schoolYear,
      number: trimester.number,
      name: trimester.name,
      nameFr: trimester.nameFr,
      nameEn: trimester.nameEn,
      startDate: trimester.startDate,
      endDate: trimester.endDate,
      isActive: trimester.isActive,
      evaluationsCount: trimester._count.evaluations,
      subjectAveragesCount: trimester._count.subjectAverages,
      studentTrimestersCount: trimester._count.studentTrimesters,
      createdAt: trimester.createdAt,
      updatedAt: trimester.updatedAt,
    })
  } catch (err) {
    console.error("Error fetching trimester:", err)
    return NextResponse.json(
      { message: "Failed to fetch trimester" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/trimesters/[id]
 * Update a trimester's dates
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("academic_year", "update")
  if (error) return error

  const { id } = await params

  try {
    const trimester = await prisma.trimester.findUnique({
      where: { id },
      include: {
        schoolYear: true,
      },
    })

    if (!trimester) {
      return NextResponse.json(
        { message: "Trimester not found" },
        { status: 404 }
      )
    }

    const body = await req.json()
    const validated = updateTrimesterSchema.parse(body)

    // Calculate effective dates
    const startDate = validated.startDate ?? trimester.startDate
    const endDate = validated.endDate ?? trimester.endDate

    // Validate dates
    if (endDate <= startDate) {
      return NextResponse.json(
        { message: "End date must be after start date" },
        { status: 400 }
      )
    }

    // Validate trimester dates are within school year
    if (startDate < trimester.schoolYear.startDate || endDate > trimester.schoolYear.endDate) {
      return NextResponse.json(
        { message: "Trimester dates must be within the school year dates" },
        { status: 400 }
      )
    }

    const updatedTrimester = await prisma.trimester.update({
      where: { id },
      data: {
        ...(validated.startDate && { startDate: validated.startDate }),
        ...(validated.endDate && { endDate: validated.endDate }),
      },
    })

    return NextResponse.json(updatedTrimester)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating trimester:", err)
    return NextResponse.json(
      { message: "Failed to update trimester" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/trimesters/[id]
 * Delete a trimester (only if no evaluations exist)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("academic_year", "delete")
  if (error) return error

  const { id } = await params

  try {
    const trimester = await prisma.trimester.findUnique({
      where: { id },
      include: {
        _count: {
          select: { evaluations: true },
        },
      },
    })

    if (!trimester) {
      return NextResponse.json(
        { message: "Trimester not found" },
        { status: 404 }
      )
    }

    // Cannot delete if there are evaluations
    if (trimester._count.evaluations > 0) {
      return NextResponse.json(
        { message: "Cannot delete trimester with existing evaluations" },
        { status: 400 }
      )
    }

    // Cannot delete active trimester
    if (trimester.isActive) {
      return NextResponse.json(
        { message: "Cannot delete the active trimester. Deactivate it first." },
        { status: 400 }
      )
    }

    await prisma.trimester.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Trimester deleted successfully" })
  } catch (err) {
    console.error("Error deleting trimester:", err)
    return NextResponse.json(
      { message: "Failed to delete trimester" },
      { status: 500 }
    )
  }
}
