import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import type { ClubStatus } from "@prisma/client"
import { resolveClubLeaders, getLeaderKey } from "@/lib/club-helpers"

const createClubSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameFr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  leaderId: z.string().optional().nullable(),
  leaderType: z.enum(["teacher", "staff", "student"]).optional().nullable(),
  schoolYearId: z.string().min(1, "School year ID is required"),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  fee: z.number().int().min(0),
  monthlyFee: z.number().int().min(0).optional().nullable(),
  capacity: z.number().int().min(1).default(30),
  status: z.enum(["draft", "active", "closed", "completed", "cancelled"]).default("draft"),
  isEnabled: z.boolean().default(true),
  eligibilityRuleType: z.enum(["all_grades", "include_only", "exclude_only"]).optional(),
  eligibilityGradeIds: z.array(z.string()).optional(),
}).refine(
  (data) => {
    // Both leaderType and leaderId must be present together or both absent
    if (data.leaderType && !data.leaderId) return false
    if (!data.leaderType && data.leaderId) return false
    return true
  },
  { message: "leaderType and leaderId must both be provided or both omitted" }
)

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

    // Resolve polymorphic leaders
    const leaderMap = await resolveClubLeaders(clubs)

    // Attach resolved leaders to clubs
    const clubsWithLeaders = clubs.map(club => ({
      ...club,
      leader: leaderMap.get(getLeaderKey(club.leaderId, club.leaderType)!) || null,
    }))

    return NextResponse.json({
      clubs: clubsWithLeaders,
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

    // Verify leader exists if provided (polymorphic check based on leaderType)
    if (validated.leaderId && validated.leaderType) {
      let leaderExists = false

      switch (validated.leaderType) {
        case 'teacher':
          const teacher = await prisma.teacherProfile.findUnique({
            where: { id: validated.leaderId },
          })
          leaderExists = !!teacher
          break

        case 'staff':
          const staff = await prisma.user.findFirst({
            where: {
              id: validated.leaderId,
              staffRole: { not: null },
              // Exclude teaching roles
              NOT: {
                staffRole: { in: ['enseignant', 'professeur_principal'] }
              }
            }
          })
          leaderExists = !!staff
          break

        case 'student':
          const student = await prisma.studentProfile.findUnique({
            where: { id: validated.leaderId },
          })
          leaderExists = !!student
          break
      }

      if (!leaderExists) {
        return NextResponse.json(
          { message: `${validated.leaderType} leader not found` },
          { status: 404 }
        )
      }
    }

    // Create club with eligibility rule if provided
    const club = await prisma.club.create({
      data: {
        name: validated.name,
        nameFr: validated.nameFr,
        description: validated.description,
        categoryId: validated.categoryId,
        leaderId: validated.leaderId,
        leaderType: validated.leaderType,
        schoolYearId: validated.schoolYearId,
        startDate: validated.startDate,
        endDate: validated.endDate,
        fee: validated.fee,
        monthlyFee: validated.monthlyFee,
        capacity: validated.capacity,
        status: validated.status,
        isEnabled: validated.isEnabled,
        createdBy: session!.user.id,
        ...(validated.eligibilityRuleType && {
          eligibilityRule: {
            create: {
              ruleType: validated.eligibilityRuleType,
              ...(validated.eligibilityGradeIds &&
                validated.eligibilityGradeIds.length > 0 && {
                  gradeRules: {
                    create: validated.eligibilityGradeIds.map((gradeId) => ({
                      gradeId,
                    })),
                  },
                }),
            },
          },
        }),
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true, nameFr: true },
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
