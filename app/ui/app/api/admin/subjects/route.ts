import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
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
  const { error } = await requireRole(["director", "academic_director"])
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

    return NextResponse.json(subjects)
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
  const { error } = await requireRole(["director"])
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
