import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateSchoolYearSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  startDate: z.string().transform((s) => new Date(s)).optional(),
  endDate: z.string().transform((s) => new Date(s)).optional(),
  enrollmentStart: z.string().transform((s) => new Date(s)).optional(),
  enrollmentEnd: z.string().transform((s) => new Date(s)).optional(),
})

/**
 * GET /api/admin/school-years/[id]
 * Get a specific school year with all its details
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director", "academic_director"])
  if (error) return error

  const { id } = await params

  try {
    const schoolYear = await prisma.schoolYear.findUnique({
      where: { id },
      include: {
        grades: {
          orderBy: { order: "asc" },
          include: {
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
              },
            },
            _count: {
              select: {
                enrollments: {
                  where: { status: { in: ["submitted", "completed"] } },
                },
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            classAssignments: true,
          },
        },
      },
    })

    if (!schoolYear) {
      return NextResponse.json(
        { message: "School year not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(schoolYear)
  } catch (err) {
    console.error("Error fetching school year:", err)
    return NextResponse.json(
      { message: "Failed to fetch school year" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/school-years/[id]
 * Update a school year
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director"])
  if (error) return error

  const { id } = await params

  try {
    const existingYear = await prisma.schoolYear.findUnique({
      where: { id },
    })

    if (!existingYear) {
      return NextResponse.json(
        { message: "School year not found" },
        { status: 404 }
      )
    }

    // Cannot edit passed school years
    if (existingYear.status === "passed") {
      return NextResponse.json(
        { message: "Cannot modify a passed school year" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = updateSchoolYearSchema.parse(body)

    // Validate dates if provided
    const startDate = validated.startDate ?? existingYear.startDate
    const endDate = validated.endDate ?? existingYear.endDate
    const enrollmentStart = validated.enrollmentStart ?? existingYear.enrollmentStart
    const enrollmentEnd = validated.enrollmentEnd ?? existingYear.enrollmentEnd

    if (endDate <= startDate) {
      return NextResponse.json(
        { message: "End date must be after start date." },
        { status: 400 }
      )
    }

    if (enrollmentEnd <= enrollmentStart) {
      return NextResponse.json(
        { message: "Enrollment end date must be after enrollment start date." },
        { status: 400 }
      )
    }

    const updatedYear = await prisma.schoolYear.update({
      where: { id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.startDate && { startDate: validated.startDate }),
        ...(validated.endDate && { endDate: validated.endDate }),
        ...(validated.enrollmentStart && { enrollmentStart: validated.enrollmentStart }),
        ...(validated.enrollmentEnd && { enrollmentEnd: validated.enrollmentEnd }),
      },
    })

    return NextResponse.json(updatedYear)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating school year:", err)
    return NextResponse.json(
      { message: "Failed to update school year" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/school-years/[id]
 * Delete a school year (only if status is "new" and no enrollments)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director"])
  if (error) return error

  const { id } = await params

  try {
    const schoolYear = await prisma.schoolYear.findUnique({
      where: { id },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    })

    if (!schoolYear) {
      return NextResponse.json(
        { message: "School year not found" },
        { status: 404 }
      )
    }

    // Can only delete "new" school years
    if (schoolYear.status !== "new") {
      return NextResponse.json(
        { message: "Can only delete school years with 'new' status" },
        { status: 400 }
      )
    }

    // Cannot delete if there are enrollments
    if (schoolYear._count.enrollments > 0) {
      return NextResponse.json(
        { message: "Cannot delete school year with existing enrollments" },
        { status: 400 }
      )
    }

    // Delete all related data first (grades, rooms, etc.)
    await prisma.$transaction([
      prisma.gradeRoom.deleteMany({
        where: { grade: { schoolYearId: id } },
      }),
      prisma.gradeSubject.deleteMany({
        where: { grade: { schoolYearId: id } },
      }),
      prisma.grade.deleteMany({
        where: { schoolYearId: id },
      }),
      prisma.schoolYear.delete({
        where: { id },
      }),
    ])

    return NextResponse.json({ message: "School year deleted successfully" })
  } catch (err) {
    console.error("Error deleting school year:", err)
    return NextResponse.json(
      { message: "Failed to delete school year" },
      { status: 500 }
    )
  }
}
