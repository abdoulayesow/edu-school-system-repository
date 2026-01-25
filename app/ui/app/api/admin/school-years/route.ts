import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createSchoolYearSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  enrollmentStart: z.string().transform((s) => new Date(s)),
  enrollmentEnd: z.string().transform((s) => new Date(s)),
})

/**
 * GET /api/admin/school-years
 * List all school years with grade counts
 */
export async function GET() {
  const { error } = await requirePerm("academic_year", "view")
  if (error) return error

  try {
    const schoolYears = await prisma.schoolYear.findMany({
      orderBy: { startDate: "desc" },
      include: {
        _count: {
          select: {
            grades: true,
            enrollments: {
              where: { status: { in: ["submitted", "completed"] } },
            },
          },
        },
      },
    })

    return NextResponse.json(
      schoolYears.map((sy) => ({
        id: sy.id,
        name: sy.name,
        startDate: sy.startDate,
        endDate: sy.endDate,
        enrollmentStart: sy.enrollmentStart,
        enrollmentEnd: sy.enrollmentEnd,
        isActive: sy.isActive,
        status: sy.status,
        gradesCount: sy._count.grades,
        enrollmentsCount: sy._count.enrollments,
        createdAt: sy.createdAt,
      }))
    )
  } catch (err) {
    console.error("Error fetching school years:", err)
    return NextResponse.json(
      { message: "Failed to fetch school years" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/school-years
 * Create a new school year
 * Business rules:
 * - Can only create the next year (not past years)
 * - Cannot create more than one year ahead of the active year
 */
export async function POST(req: NextRequest) {
  const { error } = await requirePerm("academic_year", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validated = createSchoolYearSchema.parse(body)

    // Get the active school year to validate the new year
    const activeYear = await prisma.schoolYear.findFirst({
      where: { isActive: true },
    })

    // Check if there's already a "new" school year
    const existingNewYear = await prisma.schoolYear.findFirst({
      where: { status: "new" },
    })

    if (existingNewYear) {
      return NextResponse.json(
        { message: "A new school year already exists. Please configure or activate it first." },
        { status: 400 }
      )
    }

    // Validate that the new year starts after the active year ends
    if (activeYear && validated.startDate <= activeYear.endDate) {
      return NextResponse.json(
        { message: "New school year must start after the current active year ends." },
        { status: 400 }
      )
    }

    // Validate dates
    if (validated.endDate <= validated.startDate) {
      return NextResponse.json(
        { message: "End date must be after start date." },
        { status: 400 }
      )
    }

    if (validated.enrollmentEnd <= validated.enrollmentStart) {
      return NextResponse.json(
        { message: "Enrollment end date must be after enrollment start date." },
        { status: 400 }
      )
    }

    const schoolYear = await prisma.schoolYear.create({
      data: {
        name: validated.name,
        startDate: validated.startDate,
        endDate: validated.endDate,
        enrollmentStart: validated.enrollmentStart,
        enrollmentEnd: validated.enrollmentEnd,
        isActive: false,
        status: "new",
      },
    })

    return NextResponse.json(schoolYear, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating school year:", err)
    return NextResponse.json(
      { message: "Failed to create school year" },
      { status: 500 }
    )
  }
}
