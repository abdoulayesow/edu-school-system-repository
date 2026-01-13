import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createTrimesterSchema = z.object({
  schoolYearId: z.string().min(1, "School year is required"),
  number: z.number().min(1).max(3, "Trimester must be 1, 2, or 3"),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
})

/**
 * GET /api/admin/trimesters
 * List all trimesters, optionally filtered by school year
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("academic_year", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const schoolYearId = searchParams.get("schoolYearId")

  try {
    const trimesters = await prisma.trimester.findMany({
      where: schoolYearId ? { schoolYearId } : undefined,
      orderBy: [
        { schoolYear: { startDate: "desc" } },
        { number: "asc" },
      ],
      include: {
        schoolYear: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            evaluations: true,
          },
        },
      },
    })

    return NextResponse.json(
      trimesters.map((t) => ({
        id: t.id,
        schoolYearId: t.schoolYearId,
        schoolYearName: t.schoolYear.name,
        isActiveSchoolYear: t.schoolYear.isActive,
        number: t.number,
        name: t.name,
        nameFr: t.nameFr,
        nameEn: t.nameEn,
        startDate: t.startDate,
        endDate: t.endDate,
        isActive: t.isActive,
        evaluationsCount: t._count.evaluations,
        createdAt: t.createdAt,
      }))
    )
  } catch (err) {
    console.error("Error fetching trimesters:", err)
    return NextResponse.json(
      { message: "Failed to fetch trimesters" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/trimesters
 * Create a new trimester for a school year
 */
export async function POST(req: NextRequest) {
  const { error } = await requirePerm("academic_year", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validated = createTrimesterSchema.parse(body)

    // Check if school year exists
    const schoolYear = await prisma.schoolYear.findUnique({
      where: { id: validated.schoolYearId },
    })

    if (!schoolYear) {
      return NextResponse.json(
        { message: "School year not found" },
        { status: 404 }
      )
    }

    // Check if trimester already exists for this school year
    const existingTrimester = await prisma.trimester.findUnique({
      where: {
        schoolYearId_number: {
          schoolYearId: validated.schoolYearId,
          number: validated.number,
        },
      },
    })

    if (existingTrimester) {
      return NextResponse.json(
        { message: `Trimester ${validated.number} already exists for this school year` },
        { status: 400 }
      )
    }

    // Validate dates
    if (validated.endDate <= validated.startDate) {
      return NextResponse.json(
        { message: "End date must be after start date" },
        { status: 400 }
      )
    }

    // Validate trimester dates are within school year
    if (validated.startDate < schoolYear.startDate || validated.endDate > schoolYear.endDate) {
      return NextResponse.json(
        { message: "Trimester dates must be within the school year dates" },
        { status: 400 }
      )
    }

    // Generate names based on trimester number
    const names = getTrimesterNames(validated.number)

    const trimester = await prisma.trimester.create({
      data: {
        schoolYearId: validated.schoolYearId,
        number: validated.number,
        name: names.name,
        nameFr: names.nameFr,
        nameEn: names.nameEn,
        startDate: validated.startDate,
        endDate: validated.endDate,
        isActive: false,
      },
    })

    return NextResponse.json(trimester, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating trimester:", err)
    return NextResponse.json(
      { message: "Failed to create trimester" },
      { status: 500 }
    )
  }
}

function getTrimesterNames(number: number): { name: string; nameFr: string; nameEn: string } {
  switch (number) {
    case 1:
      return {
        name: "Trimester 1",
        nameFr: "1er Trimestre",
        nameEn: "1st Trimester",
      }
    case 2:
      return {
        name: "Trimester 2",
        nameFr: "2eme Trimestre",
        nameEn: "2nd Trimester",
      }
    case 3:
      return {
        name: "Trimester 3",
        nameFr: "3eme Trimestre",
        nameEn: "3rd Trimester",
      }
    default:
      return {
        name: `Trimester ${number}`,
        nameFr: `${number}e Trimestre`,
        nameEn: `${number}th Trimester`,
      }
  }
}
