import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface RouteParams {
  params: Promise<{ id: string }>
}

const copyConfigSchema = z.object({
  sourceYearId: z.string().min(1, "Source year ID is required"),
  copyGrades: z.boolean().default(true),
  copySubjects: z.boolean().default(true),
  copyRooms: z.boolean().default(true),
})

/**
 * POST /api/admin/school-years/[id]/copy-config
 * Copy configuration (grades, subjects, rooms) from another school year
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director"])
  if (error) return error

  const { id: targetYearId } = await params

  try {
    const body = await req.json()
    const validated = copyConfigSchema.parse(body)
    const { sourceYearId, copyGrades, copySubjects, copyRooms } = validated

    // Validate target year exists and is "new"
    const targetYear = await prisma.schoolYear.findUnique({
      where: { id: targetYearId },
      include: {
        _count: { select: { grades: true } },
      },
    })

    if (!targetYear) {
      return NextResponse.json(
        { message: "Target school year not found" },
        { status: 404 }
      )
    }

    if (targetYear.status !== "new") {
      return NextResponse.json(
        { message: "Can only copy configuration to a new school year" },
        { status: 400 }
      )
    }

    if (targetYear._count.grades > 0) {
      return NextResponse.json(
        { message: "Target school year already has grades configured. Delete them first." },
        { status: 400 }
      )
    }

    // Get source year with all configuration
    const sourceYear = await prisma.schoolYear.findUnique({
      where: { id: sourceYearId },
      include: {
        grades: {
          include: {
            subjects: {
              include: { subject: true },
            },
            rooms: true,
          },
        },
      },
    })

    if (!sourceYear) {
      return NextResponse.json(
        { message: "Source school year not found" },
        { status: 404 }
      )
    }

    if (!copyGrades) {
      return NextResponse.json({
        message: "No configuration to copy. Enable at least copyGrades.",
      })
    }

    // Copy grades, subjects, and rooms in a transaction
    await prisma.$transaction(async (tx) => {
      for (const sourceGrade of sourceYear.grades) {
        // Create the grade
        const newGrade = await tx.grade.create({
          data: {
            name: sourceGrade.name,
            code: sourceGrade.code,
            level: sourceGrade.level,
            order: sourceGrade.order,
            tuitionFee: sourceGrade.tuitionFee,
            capacity: sourceGrade.capacity,
            series: sourceGrade.series,
            isEnabled: sourceGrade.isEnabled,
            schoolYearId: targetYearId,
          },
        })

        // Copy subjects if enabled
        if (copySubjects && sourceGrade.subjects.length > 0) {
          await tx.gradeSubject.createMany({
            data: sourceGrade.subjects.map((gs) => ({
              gradeId: newGrade.id,
              subjectId: gs.subjectId,
              coefficient: gs.coefficient,
              hoursPerWeek: gs.hoursPerWeek,
              series: gs.series,
            })),
          })
        }

        // Copy rooms if enabled
        if (copyRooms && sourceGrade.rooms.length > 0) {
          await tx.gradeRoom.createMany({
            data: sourceGrade.rooms.map((room) => ({
              gradeId: newGrade.id,
              name: room.name,
              displayName: room.displayName,
              capacity: room.capacity,
              isActive: room.isActive,
            })),
          })
        }
      }
    })

    // Get the updated target year
    const updatedTargetYear = await prisma.schoolYear.findUnique({
      where: { id: targetYearId },
      include: {
        _count: {
          select: {
            grades: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: "Configuration copied successfully",
      copiedFrom: sourceYear.name,
      gradesCount: updatedTargetYear?._count.grades ?? 0,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error copying configuration:", err)
    return NextResponse.json(
      { message: "Failed to copy configuration" },
      { status: 500 }
    )
  }
}
