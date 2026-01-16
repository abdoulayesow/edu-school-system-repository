import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import type { ClubStatus } from "@prisma/client"

const createClubSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameFr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  leaderId: z.string().optional().nullable(),
  schoolYearId: z.string().min(1, "School year ID is required"),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  fee: z.number().int().min(0),
  monthlyFee: z.number().int().min(0).optional().nullable(),
  capacity: z.number().int().min(1).default(30),
  status: z.enum(["draft", "active", "closed", "completed", "cancelled"]).default("draft"),
  isEnabled: z.boolean().default(true),
})

/**
 * GET /api/admin/clubs
 * List clubs for a school year
 * Query params: schoolYearId (required), categoryId (optional), status (optional), search (optional), limit, offset
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePerm("schedule", "view")
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const schoolYearId = searchParams.get("schoolYearId")
    const categoryId = searchParams.get("categoryId")
    const status = searchParams.get("status") as ClubStatus | null
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (!schoolYearId) {
      return NextResponse.json(
        { message: "School year ID is required" },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = {
      schoolYearId,
      ...(categoryId && { categoryId }),
      ...(status && { status }),
    }

    // Search filter (name, nameFr, description)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nameFr: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const [clubs, total] = await Promise.all([
      prisma.club.findMany({
        where,
        orderBy: [{ status: "asc" }, { name: "asc" }],
        include: {
          creator: {
            select: { id: true, name: true, email: true },
          },
          category: {
            select: { id: true, name: true, nameFr: true },
          },
          leader: {
            include: {
              person: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          eligibilityRule: {
            include: {
              gradeRules: {
                include: {
                  grade: {
                    select: { id: true, name: true, order: true },
                  },
                },
              },
              seriesRules: true,
            },
          },
          _count: {
            select: { enrollments: true, payments: true },
          },
        },
        take: limit,
        skip: offset,
      }),
      prisma.club.count({ where }),
    ])

    return NextResponse.json({
      clubs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + clubs.length < total,
      },
    })
  } catch (err) {
    console.error("Error fetching clubs:", err)
    return NextResponse.json(
      { message: "Failed to fetch clubs" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/clubs
 * Create a new club
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requirePerm("schedule", "create")
  if (error) return error

  try {
    const body = await req.json()
    const validated = createClubSchema.parse(body)

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

    // Verify category exists if provided
    if (validated.categoryId) {
      const category = await prisma.clubCategory.findUnique({
        where: { id: validated.categoryId },
      })
      if (!category) {
        return NextResponse.json(
          { message: "Category not found" },
          { status: 404 }
        )
      }
    }

    // Verify leader exists if provided
    if (validated.leaderId) {
      const leader = await prisma.teacherProfile.findUnique({
        where: { id: validated.leaderId },
      })
      if (!leader) {
        return NextResponse.json(
          { message: "Leader not found" },
          { status: 404 }
        )
      }
    }

    const club = await prisma.club.create({
      data: {
        name: validated.name,
        nameFr: validated.nameFr,
        description: validated.description,
        categoryId: validated.categoryId,
        leaderId: validated.leaderId,
        schoolYearId: validated.schoolYearId,
        startDate: validated.startDate,
        endDate: validated.endDate,
        fee: validated.fee,
        monthlyFee: validated.monthlyFee,
        capacity: validated.capacity,
        status: validated.status,
        isEnabled: validated.isEnabled,
        createdBy: session!.user.id,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true, nameFr: true },
        },
        leader: {
          include: {
            person: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        _count: {
          select: { enrollments: true, payments: true },
        },
      },
    })

    return NextResponse.json(club, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating club:", err)
    return NextResponse.json(
      { message: "Failed to create club" },
      { status: 500 }
    )
  }
}
