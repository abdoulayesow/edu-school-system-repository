import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateAssignmentSchema = z.object({
  teacherProfileId: z.string().min(1, "Teacher profile ID is required"),
})

/**
 * GET /api/admin/class-assignments/[id]
 * Get a specific class assignment
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("teachers_assignment", "view")
  if (error) return error

  const { id } = await params

  try {
    const assignment = await prisma.classAssignment.findUnique({
      where: { id },
      include: {
        gradeSubject: {
          include: {
            grade: {
              include: {
                schoolYear: true,
              },
            },
            subject: true,
          },
        },
        teacherProfile: {
          include: {
            person: true,
          },
        },
        schoolYear: true,
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { message: "Assignment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(assignment)
  } catch (err) {
    console.error("Error fetching assignment:", err)
    return NextResponse.json(
      { message: "Failed to fetch assignment" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/class-assignments/[id]
 * Update a class assignment (change teacher)
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("teachers_assignment", "update")
  if (error) return error

  const { id } = await params

  try {
    const assignment = await prisma.classAssignment.findUnique({
      where: { id },
      include: {
        schoolYear: true,
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { message: "Assignment not found" },
        { status: 404 }
      )
    }

    if (assignment.schoolYear.status === "passed") {
      return NextResponse.json(
        { message: "Cannot modify assignments in a passed school year" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validated = updateAssignmentSchema.parse(body)

    // Verify new teacher exists
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: validated.teacherProfileId },
    })

    if (!teacher) {
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 }
      )
    }

    const updated = await prisma.classAssignment.update({
      where: { id },
      data: {
        teacherProfileId: validated.teacherProfileId,
      },
      include: {
        gradeSubject: {
          include: {
            grade: true,
            subject: true,
          },
        },
        teacherProfile: {
          include: {
            person: true,
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating assignment:", err)
    return NextResponse.json(
      { message: "Failed to update assignment" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/class-assignments/[id]
 * Delete a class assignment
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("teachers_assignment", "delete")
  if (error) return error

  const { id } = await params

  try {
    const assignment = await prisma.classAssignment.findUnique({
      where: { id },
      include: {
        schoolYear: true,
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { message: "Assignment not found" },
        { status: 404 }
      )
    }

    if (assignment.schoolYear.status === "passed") {
      return NextResponse.json(
        { message: "Cannot delete assignments from a passed school year" },
        { status: 400 }
      )
    }

    await prisma.classAssignment.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Assignment deleted successfully" })
  } catch (err) {
    console.error("Error deleting assignment:", err)
    return NextResponse.json(
      { message: "Failed to delete assignment" },
      { status: 500 }
    )
  }
}
