import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import type { ActivityType, ActivityStatus } from "@prisma/client"

const createActivitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameFr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  type: z.enum(["club", "sport", "arts", "academic", "other"]),
  schoolYearId: z.string().min(1, "School year ID is required"),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  fee: z.number().int().min(0),
  capacity: z.number().int().min(1).default(30),
  status: z.enum(["draft", "active", "closed", "completed", "cancelled"]).default("draft"),
  isEnabled: z.boolean().default(true),
})

/**
 * GET /api/admin/activities
 * List activities for a school year
 * Query params: schoolYearId (required), type (optional), status (optional)
 */
export async function GET(req: NextRequest) {
  const { session, error } = await requireRole(["director", "academic_director", "accountant"])
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const schoolYearId = searchParams.get("schoolYearId")
    const type = searchParams.get("type") as ActivityType | null
    const status = searchParams.get("status") as ActivityStatus | null

    if (!schoolYearId) {
      return NextResponse.json(
        { message: "School year ID is required" },
        { status: 400 }
      )
    }

    const activities = await prisma.activity.findMany({
      where: {
        schoolYearId,
        ...(type && { type }),
        ...(status && { status }),
      },
      orderBy: [{ status: "asc" }, { name: "asc" }],
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { enrollments: true, payments: true },
        },
      },
    })

    return NextResponse.json(activities)
  } catch (err) {
    console.error("Error fetching activities:", err)
    return NextResponse.json(
      { message: "Failed to fetch activities" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/activities
 * Create a new activity
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(["director", "academic_director"])
  if (error) return error

  try {
    const body = await req.json()
    const validated = createActivitySchema.parse(body)

    // Verify school year exists
    const schoolYear = await prisma.schoolYear.findUnique({
      where: { id: validated.schoolYearId },
    })

    if (!schoolYear) {
      return NextResponse.json(
        { message: "School year not found" },
        { status: 404 }
      )
    }

    // Validate dates
    if (validated.endDate <= validated.startDate) {
      return NextResponse.json(
        { message: "End date must be after start date" },
        { status: 400 }
      )
    }

    const activity = await prisma.activity.create({
      data: {
        name: validated.name,
        nameFr: validated.nameFr,
        description: validated.description,
        type: validated.type,
        schoolYearId: validated.schoolYearId,
        startDate: validated.startDate,
        endDate: validated.endDate,
        fee: validated.fee,
        capacity: validated.capacity,
        status: validated.status,
        isEnabled: validated.isEnabled,
        createdBy: session!.user.id,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { enrollments: true, payments: true },
        },
      },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating activity:", err)
    return NextResponse.json(
      { message: "Failed to create activity" },
      { status: 500 }
    )
  }
}
