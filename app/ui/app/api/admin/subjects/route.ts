import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { withCache } from "@/lib/cache"
import { z } from "zod"

const createSubjectSchema = z.object({
  code: z.string().min(1, "Code is required"),
  nameFr: z.string().min(1, "French name is required"),
  nameEn: z.string().min(1, "English name is required"),
  isOptional: z.boolean().default(false),
})

/**
 * GET /api/admin/subjects
 * List all subjects
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("subjects", "view")
  if (error) return error

  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { nameFr: "asc" },
      include: {
        _count: {
          select: { gradeSubjects: true },
        },
      },
    })

    const response = NextResponse.json(subjects)
    // Subjects rarely change - cache for 1 day with 7 day stale-while-revalidate
    return withCache(response, "STATIC_REFERENCE")
  } catch (err) {
    console.error("Error fetching subjects:", err)
    return NextResponse.json(
      { message: "Failed to fetch subjects" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/subjects
 * Create a new subject
 */
export async function POST(req: NextRequest) {
  const { error } = await requirePerm("subjects", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validated = createSubjectSchema.parse(body)

    // Check for duplicate code
    const existing = await prisma.subject.findUnique({
      where: { code: validated.code },
    })

    if (existing) {
      return NextResponse.json(
        { message: `Subject with code "${validated.code}" already exists` },
        { status: 400 }
      )
    }

    const subject = await prisma.subject.create({
      data: {
        code: validated.code,
        nameFr: validated.nameFr,
        nameEn: validated.nameEn,
        isOptional: validated.isOptional,
      },
    })

    return NextResponse.json(subject, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating subject:", err)
    return NextResponse.json(
      { message: "Failed to create subject" },
      { status: 500 }
    )
  }
}
