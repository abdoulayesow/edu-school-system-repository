import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const eligibilityRuleSchema = z.object({
  ruleType: z.enum(["all_grades", "include_only", "exclude_only"]),
  gradeIds: z.array(z.string()).optional().default([]),
  // seriesRules for high school (future enhancement)
  // series: z.array(z.string()).optional().default([]),
})

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/admin/clubs/[id]/eligibility-rules
 * Get the eligibility rule for a club
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("schedule", "view")
  if (error) return error

  try {
    const { id } = await params

    const rule = await prisma.clubEligibilityRule.findUnique({
      where: { clubId: id },
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
    })

    return NextResponse.json(rule)
  } catch (err) {
    console.error("Error fetching eligibility rule:", err)
    return NextResponse.json(
      { message: "Failed to fetch eligibility rule" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/clubs/[id]/eligibility-rules
 * Create or update the eligibility rule for a club
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("schedule", "update")
  if (error) return error

  try {
    const { id } = await params
    const body = await req.json()
    const validated = eligibilityRuleSchema.parse(body)

    // Verify club exists
    const club = await prisma.club.findUnique({
      where: { id },
    })

    if (!club) {
      return NextResponse.json(
        { message: "Club not found" },
        { status: 404 }
      )
    }

    // If ruleType is all_grades, delete any existing rule
    if (validated.ruleType === "all_grades") {
      await prisma.clubEligibilityRule.deleteMany({
        where: { clubId: id },
      })
      return NextResponse.json({ message: "Eligibility rule removed (all grades allowed)" })
    }

    // Validate that gradeIds are provided for include_only/exclude_only
    if (validated.gradeIds.length === 0) {
      return NextResponse.json(
        { message: "At least one grade must be selected for include_only or exclude_only rules" },
        { status: 400 }
      )
    }

    // Verify all grades exist
    const grades = await prisma.grade.findMany({
      where: { id: { in: validated.gradeIds } },
    })

    if (grades.length !== validated.gradeIds.length) {
      return NextResponse.json(
        { message: "Some grades not found" },
        { status: 404 }
      )
    }

    // Create or update the rule in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if rule already exists
      const existingRule = await tx.clubEligibilityRule.findUnique({
        where: { clubId: id },
      })

      let rule

      if (existingRule) {
        // Update existing rule - delete old grade rules first
        await tx.clubGradeRule.deleteMany({
          where: { eligibilityRuleId: existingRule.id },
        })

        rule = await tx.clubEligibilityRule.update({
          where: { id: existingRule.id },
          data: {
            ruleType: validated.ruleType,
            gradeRules: {
              create: validated.gradeIds.map((gradeId) => ({
                gradeId,
              })),
            },
          },
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
        })
      } else {
        // Create new rule
        rule = await tx.clubEligibilityRule.create({
          data: {
            clubId: id,
            ruleType: validated.ruleType,
            gradeRules: {
              create: validated.gradeIds.map((gradeId) => ({
                gradeId,
              })),
            },
          },
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
        })
      }

      return rule
    })

    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating eligibility rule:", err)
    return NextResponse.json(
      { message: "Failed to update eligibility rule" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/clubs/[id]/eligibility-rules
 * Delete the eligibility rule for a club (makes all grades eligible)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("schedule", "update")
  if (error) return error

  try {
    const { id } = await params

    // Verify club exists
    const club = await prisma.club.findUnique({
      where: { id },
    })

    if (!club) {
      return NextResponse.json(
        { message: "Club not found" },
        { status: 404 }
      )
    }

    // Delete the rule (cascades to grade rules)
    await prisma.clubEligibilityRule.deleteMany({
      where: { clubId: id },
    })

    return NextResponse.json({ message: "Eligibility rule deleted" })
  } catch (err) {
    console.error("Error deleting eligibility rule:", err)
    return NextResponse.json(
      { message: "Failed to delete eligibility rule" },
      { status: 500 }
    )
  }
}
