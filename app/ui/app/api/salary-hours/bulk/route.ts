import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bulkEntrySchema = z.object({
  schoolYearId: z.string().min(1, "School year is required"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  entries: z.array(
    z.object({
      userId: z.string().min(1),
      totalHours: z.number().positive("Hours must be positive"),
      notes: z.string().optional(),
    })
  ).min(1, "At least one entry is required"),
})

/**
 * POST /api/salary-hours/bulk
 * Bulk create draft hours records for multiple teachers in a month
 */
export async function POST(req: NextRequest) {
  const { error } = await requirePerm("salary_hours", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validated = bulkEntrySchema.parse(body)

    // Check for existing records in this month
    const existing = await prisma.hoursRecord.findMany({
      where: {
        schoolYearId: validated.schoolYearId,
        month: validated.month,
        year: validated.year,
        userId: { in: validated.entries.map((e) => e.userId) },
      },
      select: { userId: true },
    })

    const existingUserIds = new Set(existing.map((e) => e.userId))
    const newEntries = validated.entries.filter(
      (e) => !existingUserIds.has(e.userId)
    )

    if (newEntries.length === 0) {
      return NextResponse.json(
        { message: "All records already exist for this month", created: 0, skipped: validated.entries.length },
        { status: 200 }
      )
    }

    const records = await prisma.$transaction(
      newEntries.map((entry) =>
        prisma.hoursRecord.create({
          data: {
            userId: entry.userId,
            schoolYearId: validated.schoolYearId,
            month: validated.month,
            year: validated.year,
            totalHours: entry.totalHours,
            notes: entry.notes,
            status: "draft",
          },
        })
      )
    )

    return NextResponse.json({
      message: `Created ${records.length} hours records`,
      created: records.length,
      skipped: validated.entries.length - newEntries.length,
    }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error bulk creating hours records:", err)
    return NextResponse.json(
      { message: "Failed to create hours records" },
      { status: 500 }
    )
  }
}
