import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createHoursRecordSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  schoolYearId: z.string().min(1, "School year is required"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  totalHours: z.number().positive("Hours must be positive"),
  notes: z.string().optional(),
})

/**
 * GET /api/salary-hours
 * List hours records with optional filters
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("salary_hours", "view")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const schoolYearId = searchParams.get("schoolYearId")
  const month = searchParams.get("month")
  const year = searchParams.get("year")
  const status = searchParams.get("status")
  const userId = searchParams.get("userId")
  const search = searchParams.get("search")
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "100")), 500)
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"))

  try {
    const where: Record<string, unknown> = {}

    if (schoolYearId) where.schoolYearId = schoolYearId
    if (month) where.month = parseInt(month)
    if (year) where.year = parseInt(year)
    if (status) where.status = status
    if (userId) where.userId = userId

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    }

    const [records, total] = await Promise.all([
      prisma.hoursRecord.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
          submitter: {
            select: { id: true, name: true },
          },
          reviewer: {
            select: { id: true, name: true },
          },
          schoolYear: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
        take: limit,
        skip: offset,
      }),
      prisma.hoursRecord.count({ where }),
    ])

    return NextResponse.json({
      records,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + records.length < total,
      },
    })
  } catch (err) {
    console.error("Error fetching hours records:", err)
    return NextResponse.json(
      { message: "Failed to fetch hours records" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/salary-hours
 * Create a single hours record (draft)
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requirePerm("salary_hours", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validated = createHoursRecordSchema.parse(body)

    // Check for duplicate
    const existing = await prisma.hoursRecord.findUnique({
      where: {
        userId_schoolYearId_month_year: {
          userId: validated.userId,
          schoolYearId: validated.schoolYearId,
          month: validated.month,
          year: validated.year,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { message: "Hours record already exists for this user/month/year" },
        { status: 409 }
      )
    }

    const record = await prisma.hoursRecord.create({
      data: {
        userId: validated.userId,
        schoolYearId: validated.schoolYearId,
        month: validated.month,
        year: validated.year,
        totalHours: validated.totalHours,
        notes: validated.notes,
        status: "draft",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        schoolYear: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating hours record:", err)
    return NextResponse.json(
      { message: "Failed to create hours record" },
      { status: 500 }
    )
  }
}
