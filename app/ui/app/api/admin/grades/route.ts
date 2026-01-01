import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import type { SchoolLevel } from "@prisma/client"

const createGradeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  level: z.enum(["kindergarten", "elementary", "college", "high_school"]),
  order: z.number().int().min(-2),
  tuitionFee: z.number().int().min(0),
  capacity: z.number().int().min(1).default(70),
  schoolYearId: z.string().min(1, "School year ID is required"),
  series: z.string().optional().nullable(),
  isEnabled: z.boolean().default(true),
})

/**
 * GET /api/admin/grades
 * List grades for a school year
 * Query params: schoolYearId (required), level (optional)
 */
export async function GET(req: NextRequest) {
  const { error } = await requireRole(["director", "academic_director"])
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const schoolYearId = searchParams.get("schoolYearId")
    const level = searchParams.get("level") as SchoolLevel | null

    if (!schoolYearId) {
      return NextResponse.json(
        { message: "School year ID is required" },
        { status: 400 }
      )
    }

    const grades = await prisma.grade.findMany({
      where: {
        schoolYearId,
        ...(level && { level }),
      },
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
        gradeLeader: {
          include: {
            person: true,
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
    })

    return NextResponse.json(grades)
  } catch (err) {
    console.error("Error fetching grades:", err)
    return NextResponse.json(
      { message: "Failed to fetch grades" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/grades
 * Create a new grade
 */
export async function POST(req: NextRequest) {
  const { error } = await requireRole(["director"])
  if (error) return error

  try {
    const body = await req.json()
    const validated = createGradeSchema.parse(body)

    // Verify school year exists and is not passed
    const schoolYear = await prisma.schoolYear.findUnique({
      where: { id: validated.schoolYearId },
    })

    if (!schoolYear) {
      return NextResponse.json(
        { message: "School year not found" },
        { status: 404 }
      )
    }

    if (schoolYear.status === "passed") {
      return NextResponse.json(
        { message: "Cannot add grades to a passed school year" },
        { status: 400 }
      )
    }

    // Check for duplicate order in the same school year
    const existingGrade = await prisma.grade.findFirst({
      where: {
        schoolYearId: validated.schoolYearId,
        order: validated.order,
      },
    })

    if (existingGrade) {
      return NextResponse.json(
        { message: `A grade with order ${validated.order} already exists for this school year` },
        { status: 400 }
      )
    }

    const grade = await prisma.grade.create({
      data: {
        name: validated.name,
        code: validated.code,
        level: validated.level,
        order: validated.order,
        tuitionFee: validated.tuitionFee,
        capacity: validated.capacity,
        schoolYearId: validated.schoolYearId,
        series: validated.series,
        isEnabled: validated.isEnabled,
      },
      include: {
        rooms: true,
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    })

    return NextResponse.json(grade, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating grade:", err)
    return NextResponse.json(
      { message: "Failed to create grade" },
      { status: 500 }
    )
  }
}
