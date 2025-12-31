import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateGradeSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  code: z.string().optional().nullable(),
  level: z.enum(["kindergarten", "elementary", "college", "high_school"]).optional(),
  order: z.number().int().min(-2).optional(),
  tuitionFee: z.number().int().min(0).optional(),
  capacity: z.number().int().min(1).optional(),
  series: z.string().optional().nullable(),
  isEnabled: z.boolean().optional(),
  gradeLeaderId: z.string().optional().nullable(),
})

/**
 * GET /api/admin/grades/[id]
 * Get a specific grade with all its details
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director", "academic_director"])
  if (error) return error

  const { id } = await params

  try {
    const grade = await prisma.grade.findUnique({
      where: { id },
      include: {
        schoolYear: true,
        rooms: {
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { studentAssignments: { where: { isActive: true } } },
            },
          },
        },
        subjects: {
          include: {
            subject: true,
            classAssignments: {
              include: {
                teacherProfile: {
                  include: {
                    person: true,
                  },
                },
              },
            },
          },
        },
        gradeLeader: {
          include: {
            person: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    })

    if (!grade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(grade)
  } catch (err) {
    console.error("Error fetching grade:", err)
    return NextResponse.json(
      { message: "Failed to fetch grade" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/grades/[id]
 * Update a grade
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director", "academic_director"])
  if (error) return error

  const { id } = await params

  try {
    const existingGrade = await prisma.grade.findUnique({
      where: { id },
      include: {
        schoolYear: true,
      },
    })

    if (!existingGrade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    // Cannot edit grades in passed school years
    if (existingGrade.schoolYear.status === "passed") {
      return NextResponse.json(
        { message: "Cannot modify grades in a passed school year" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = updateGradeSchema.parse(body)

    // If order is changing, check for conflicts
    if (validated.order !== undefined && validated.order !== existingGrade.order) {
      const conflictingGrade = await prisma.grade.findFirst({
        where: {
          schoolYearId: existingGrade.schoolYearId,
          order: validated.order,
          id: { not: id },
        },
      })

      if (conflictingGrade) {
        return NextResponse.json(
          { message: `A grade with order ${validated.order} already exists` },
          { status: 400 }
        )
      }
    }

    const updatedGrade = await prisma.grade.update({
      where: { id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.code !== undefined && { code: validated.code }),
        ...(validated.level && { level: validated.level }),
        ...(validated.order !== undefined && { order: validated.order }),
        ...(validated.tuitionFee !== undefined && { tuitionFee: validated.tuitionFee }),
        ...(validated.capacity !== undefined && { capacity: validated.capacity }),
        ...(validated.series !== undefined && { series: validated.series }),
        ...(validated.isEnabled !== undefined && { isEnabled: validated.isEnabled }),
        ...(validated.gradeLeaderId !== undefined && { gradeLeaderId: validated.gradeLeaderId }),
      },
      include: {
        rooms: true,
        subjects: {
          include: {
            subject: true,
          },
        },
        gradeLeader: {
          include: {
            person: true,
          },
        },
      },
    })

    return NextResponse.json(updatedGrade)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating grade:", err)
    return NextResponse.json(
      { message: "Failed to update grade" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/grades/[id]
 * Delete a grade (director only, only if no enrollments)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director"])
  if (error) return error

  const { id } = await params

  try {
    const grade = await prisma.grade.findUnique({
      where: { id },
      include: {
        schoolYear: true,
        _count: {
          select: { enrollments: true },
        },
      },
    })

    if (!grade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    // Cannot delete grades from passed school years
    if (grade.schoolYear.status === "passed") {
      return NextResponse.json(
        { message: "Cannot delete grades from a passed school year" },
        { status: 400 }
      )
    }

    // Cannot delete if there are enrollments
    if (grade._count.enrollments > 0) {
      return NextResponse.json(
        { message: "Cannot delete grade with existing enrollments" },
        { status: 400 }
      )
    }

    // Delete grade and all related data (rooms, subjects via cascade)
    await prisma.$transaction([
      prisma.gradeRoom.deleteMany({
        where: { gradeId: id },
      }),
      prisma.gradeSubject.deleteMany({
        where: { gradeId: id },
      }),
      prisma.grade.delete({
        where: { id },
      }),
    ])

    return NextResponse.json({ message: "Grade deleted successfully" })
  } catch (err) {
    console.error("Error deleting grade:", err)
    return NextResponse.json(
      { message: "Failed to delete grade" },
      { status: 500 }
    )
  }
}
