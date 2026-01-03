import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateRemarksSchema = z.object({
  updates: z.array(
    z.object({
      subjectAverageId: z.string().min(1),
      teacherRemark: z.string().nullable(),
    })
  ),
})

/**
 * PUT /api/evaluations/subject-averages/remarks
 * Bulk update teacher remarks for subject averages
 */
export async function PUT(req: NextRequest) {
  const { session, error } = await requireRole(["director", "academic_director", "teacher"])
  if (error) return error

  try {
    const body = await req.json()
    const validation = updateRemarksSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: validation.error.errors },
        { status: 400 }
      )
    }

    const { updates } = validation.data

    // Validate all IDs exist
    const existingAverages = await prisma.subjectTrimesterAverage.findMany({
      where: {
        id: { in: updates.map((u) => u.subjectAverageId) },
      },
      select: { id: true },
    })

    const existingIds = new Set(existingAverages.map((a) => a.id))
    const missingIds = updates.filter((u) => !existingIds.has(u.subjectAverageId))

    if (missingIds.length > 0) {
      return NextResponse.json(
        { message: `Some subject averages not found: ${missingIds.map((m) => m.subjectAverageId).join(", ")}` },
        { status: 404 }
      )
    }

    // Perform batch update using transaction
    await prisma.$transaction(
      updates.map((update) =>
        prisma.subjectTrimesterAverage.update({
          where: { id: update.subjectAverageId },
          data: { teacherRemark: update.teacherRemark },
        })
      )
    )

    return NextResponse.json({
      message: "Remarks updated successfully",
      count: updates.length,
    })
  } catch (err) {
    console.error("Error updating remarks:", err)
    return NextResponse.json(
      { message: "Failed to update remarks" },
      { status: 500 }
    )
  }
}
