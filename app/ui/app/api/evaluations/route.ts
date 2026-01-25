import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createEvaluationSchema = z.object({
  studentProfileId: z.string().min(1, "Student is required"),
  gradeSubjectId: z.string().min(1, "Subject is required"),
  trimesterId: z.string().min(1, "Trimester is required"),
  type: z.enum(["interrogation", "devoir_surveille", "composition"]),
  score: z.number().min(0).max(20, "Score must be between 0 and 20"),
  maxScore: z.number().min(1).max(20).optional().default(20),
  date: z.string().transform((s) => new Date(s)),
  notes: z.string().optional(),
})

const createBatchEvaluationSchema = z.object({
  gradeSubjectId: z.string().min(1, "Subject is required"),
  trimesterId: z.string().min(1, "Trimester is required"),
  type: z.enum(["interrogation", "devoir_surveille", "composition"]),
  date: z.string().transform((s) => new Date(s)),
  maxScore: z.number().min(1).max(20).optional().default(20),
  evaluations: z.array(
    z.object({
      studentProfileId: z.string().min(1),
      score: z.number().min(0).max(20),
      notes: z.string().optional(),
    })
  ),
})

/**
 * GET /api/evaluations
 * List evaluations with filters
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("grades", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const trimesterId = searchParams.get("trimesterId")
  const gradeSubjectId = searchParams.get("gradeSubjectId")
  const studentProfileId = searchParams.get("studentProfileId")
  const type = searchParams.get("type")
  const gradeId = searchParams.get("gradeId")

  try {
    const evaluations = await prisma.evaluation.findMany({
      where: {
        ...(trimesterId && { trimesterId }),
        ...(gradeSubjectId && { gradeSubjectId }),
        ...(studentProfileId && { studentProfileId }),
        ...(type && { type: type as "interrogation" | "devoir_surveille" | "composition" }),
        ...(gradeId && { gradeSubject: { gradeId } }),
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: {
        studentProfile: {
          include: {
            person: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        gradeSubject: {
          include: {
            subject: {
              select: {
                code: true,
                nameFr: true,
                nameEn: true,
              },
            },
            grade: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        trimester: {
          select: {
            id: true,
            number: true,
            nameFr: true,
            nameEn: true,
          },
        },
        recorder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(
      evaluations.map((e) => ({
        id: e.id,
        studentProfileId: e.studentProfileId,
        studentName: `${e.studentProfile.person.firstName} ${e.studentProfile.person.lastName}`,
        gradeSubjectId: e.gradeSubjectId,
        subjectCode: e.gradeSubject.subject.code,
        subjectNameFr: e.gradeSubject.subject.nameFr,
        subjectNameEn: e.gradeSubject.subject.nameEn,
        gradeId: e.gradeSubject.grade.id,
        gradeName: e.gradeSubject.grade.name,
        trimesterId: e.trimesterId,
        trimesterNumber: e.trimester.number,
        trimesterNameFr: e.trimester.nameFr,
        trimesterNameEn: e.trimester.nameEn,
        type: e.type,
        score: e.score,
        maxScore: e.maxScore,
        date: e.date,
        notes: e.notes,
        recordedBy: e.recorder.name,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      }))
    )
  } catch (err) {
    console.error("Error fetching evaluations:", err)
    return NextResponse.json(
      { message: "Failed to fetch evaluations" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/evaluations
 * Create a single evaluation or batch evaluations
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requirePerm("grades", "create")
  if (error) return error

  try {
    const body = await req.json()

    // Check if this is a batch request
    if (body.evaluations && Array.isArray(body.evaluations)) {
      const validated = createBatchEvaluationSchema.parse(body)

      // Verify trimester exists and is active
      const trimester = await prisma.trimester.findUnique({
        where: { id: validated.trimesterId },
      })

      if (!trimester) {
        return NextResponse.json(
          { message: "Trimester not found" },
          { status: 404 }
        )
      }

      if (!trimester.isActive) {
        return NextResponse.json(
          { message: "Can only enter grades for the active trimester" },
          { status: 400 }
        )
      }

      // Verify gradeSubject exists
      const gradeSubject = await prisma.gradeSubject.findUnique({
        where: { id: validated.gradeSubjectId },
      })

      if (!gradeSubject) {
        return NextResponse.json(
          { message: "Subject not found" },
          { status: 404 }
        )
      }

      // Create evaluations in transaction
      const createdEvaluations = await prisma.$transaction(
        validated.evaluations.map((e) =>
          prisma.evaluation.create({
            data: {
              studentProfileId: e.studentProfileId,
              gradeSubjectId: validated.gradeSubjectId,
              trimesterId: validated.trimesterId,
              type: validated.type,
              score: e.score,
              maxScore: validated.maxScore,
              date: validated.date,
              notes: e.notes,
              recordedBy: session!.user.id,
            },
          })
        )
      )

      return NextResponse.json(
        { message: `Created ${createdEvaluations.length} evaluations`, count: createdEvaluations.length },
        { status: 201 }
      )
    }

    // Single evaluation
    const validated = createEvaluationSchema.parse(body)

    // Verify trimester exists and is active
    const trimester = await prisma.trimester.findUnique({
      where: { id: validated.trimesterId },
    })

    if (!trimester) {
      return NextResponse.json(
        { message: "Trimester not found" },
        { status: 404 }
      )
    }

    if (!trimester.isActive) {
      return NextResponse.json(
        { message: "Can only enter grades for the active trimester" },
        { status: 400 }
      )
    }

    // Verify student exists
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: validated.studentProfileId },
    })

    if (!studentProfile) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      )
    }

    // Verify gradeSubject exists
    const gradeSubject = await prisma.gradeSubject.findUnique({
      where: { id: validated.gradeSubjectId },
    })

    if (!gradeSubject) {
      return NextResponse.json(
        { message: "Subject not found" },
        { status: 404 }
      )
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        studentProfileId: validated.studentProfileId,
        gradeSubjectId: validated.gradeSubjectId,
        trimesterId: validated.trimesterId,
        type: validated.type,
        score: validated.score,
        maxScore: validated.maxScore,
        date: validated.date,
        notes: validated.notes,
        recordedBy: session!.user.id,
      },
      include: {
        studentProfile: {
          include: {
            person: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        gradeSubject: {
          include: {
            subject: true,
          },
        },
      },
    })

    return NextResponse.json(evaluation, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating evaluation:", err)
    return NextResponse.json(
      { message: "Failed to create evaluation" },
      { status: 500 }
    )
  }
}
