import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

const assignSubjectSchema = z.object({
  subjectId: z.string().min(1, "Subject ID is required"),
  coefficient: z.number().int().min(1).default(1),
  hoursPerWeek: z.number().int().min(1).optional(),
  series: z.string().optional().nullable(),
})

const bulkAssignSchema = z.object({
  subjects: z.array(assignSubjectSchema).min(1, "At least one subject is required"),
})

/**
 * GET /api/admin/grades/[id]/subjects
 * List all subjects assigned to a grade
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director", "academic_director"])
  if (error) return error

  const { id: gradeId } = await params

  try {
    // Verify grade exists
    const grade = await prisma.grade.findUnique({
      where: { id: gradeId },
    })

    if (!grade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    const gradeSubjects = await prisma.gradeSubject.findMany({
      where: { gradeId },
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
      orderBy: {
        subject: { nameFr: "asc" },
      },
    })

    return NextResponse.json(gradeSubjects)
  } catch (err) {
    console.error("Error fetching grade subjects:", err)
    return NextResponse.json(
      { message: "Failed to fetch grade subjects" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/grades/[id]/subjects
 * Assign a subject to a grade (single or bulk)
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director", "academic_director"])
  if (error) return error

  const { id: gradeId } = await params

  try {
    const grade = await prisma.grade.findUnique({
      where: { id: gradeId },
      include: {
        schoolYear: true,
      },
    })

    if (!grade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    // Cannot modify subjects in passed school years
    if (grade.schoolYear.status === "passed") {
      return NextResponse.json(
        { message: "Cannot modify subjects in a passed school year" },
        { status: 400 }
      )
    }

    const body = await req.json()

    // Check if it's a bulk assignment or single
    if (body.subjects && Array.isArray(body.subjects)) {
      // Bulk assignment
      const validated = bulkAssignSchema.parse(body)

      const results = []
      const errors = []

      for (const subjectData of validated.subjects) {
        // Verify subject exists
        const subject = await prisma.subject.findUnique({
          where: { id: subjectData.subjectId },
        })

        if (!subject) {
          errors.push({ subjectId: subjectData.subjectId, error: "Subject not found" })
          continue
        }

        // Check for existing assignment
        const existing = await prisma.gradeSubject.findFirst({
          where: {
            gradeId,
            subjectId: subjectData.subjectId,
            series: subjectData.series ?? null,
          },
        })

        if (existing) {
          errors.push({ subjectId: subjectData.subjectId, error: "Subject already assigned" })
          continue
        }

        const gradeSubject = await prisma.gradeSubject.create({
          data: {
            gradeId,
            subjectId: subjectData.subjectId,
            coefficient: subjectData.coefficient,
            hoursPerWeek: subjectData.hoursPerWeek,
            series: subjectData.series,
          },
          include: {
            subject: true,
          },
        })

        results.push(gradeSubject)
      }

      return NextResponse.json({
        created: results,
        errors,
      }, { status: 201 })
    } else {
      // Single assignment
      const validated = assignSubjectSchema.parse(body)

      // Verify subject exists
      const subject = await prisma.subject.findUnique({
        where: { id: validated.subjectId },
      })

      if (!subject) {
        return NextResponse.json(
          { message: "Subject not found" },
          { status: 404 }
        )
      }

      // Check for existing assignment
      const existing = await prisma.gradeSubject.findFirst({
        where: {
          gradeId,
          subjectId: validated.subjectId,
          series: validated.series ?? null,
        },
      })

      if (existing) {
        return NextResponse.json(
          { message: "Subject is already assigned to this grade" },
          { status: 400 }
        )
      }

      const gradeSubject = await prisma.gradeSubject.create({
        data: {
          gradeId,
          subjectId: validated.subjectId,
          coefficient: validated.coefficient,
          hoursPerWeek: validated.hoursPerWeek,
          series: validated.series,
        },
        include: {
          subject: true,
        },
      })

      return NextResponse.json(gradeSubject, { status: 201 })
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error assigning subject:", err)
    return NextResponse.json(
      { message: "Failed to assign subject" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/grades/[id]/subjects
 * Remove a subject from a grade
 * Query params: subjectId (required), series (optional)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director"])
  if (error) return error

  const { id: gradeId } = await params
  const { searchParams } = new URL(req.url)
  const subjectId = searchParams.get("subjectId")
  const series = searchParams.get("series")

  if (!subjectId) {
    return NextResponse.json(
      { message: "Subject ID is required" },
      { status: 400 }
    )
  }

  try {
    const grade = await prisma.grade.findUnique({
      where: { id: gradeId },
      include: {
        schoolYear: true,
      },
    })

    if (!grade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    // Cannot modify subjects in passed school years
    if (grade.schoolYear.status === "passed") {
      return NextResponse.json(
        { message: "Cannot modify subjects in a passed school year" },
        { status: 400 }
      )
    }

    // Find the grade subject
    const gradeSubject = await prisma.gradeSubject.findFirst({
      where: {
        gradeId,
        subjectId,
        series: series ?? null,
      },
      include: {
        _count: {
          select: { classAssignments: true },
        },
      },
    })

    if (!gradeSubject) {
      return NextResponse.json(
        { message: "Subject assignment not found" },
        { status: 404 }
      )
    }

    // If there are class assignments, delete them first
    if (gradeSubject._count.classAssignments > 0) {
      await prisma.classAssignment.deleteMany({
        where: { gradeSubjectId: gradeSubject.id },
      })
    }

    await prisma.gradeSubject.delete({
      where: { id: gradeSubject.id },
    })

    return NextResponse.json({ message: "Subject removed from grade" })
  } catch (err) {
    console.error("Error removing subject:", err)
    return NextResponse.json(
      { message: "Failed to remove subject" },
      { status: 500 }
    )
  }
}
