import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/admin/school-years/[id]/activate
 * Activate a school year
 * - Deactivates the current active year (sets status to "passed")
 * - Sets the target year as active
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director"])
  if (error) return error

  const { id } = await params

  try {
    const schoolYear = await prisma.schoolYear.findUnique({
      where: { id },
      include: {
        _count: {
          select: { grades: true },
        },
      },
    })

    if (!schoolYear) {
      return NextResponse.json(
        { message: "School year not found" },
        { status: 404 }
      )
    }

    // Cannot activate a passed school year
    if (schoolYear.status === "passed") {
      return NextResponse.json(
        { message: "Cannot activate a passed school year" },
        { status: 400 }
      )
    }

    // Already active
    if (schoolYear.isActive) {
      return NextResponse.json(
        { message: "School year is already active" },
        { status: 400 }
      )
    }

    // Warn if no grades configured
    if (schoolYear._count.grades === 0) {
      return NextResponse.json(
        { message: "Cannot activate school year with no grades configured" },
        { status: 400 }
      )
    }

    // Transaction: deactivate current, activate new
    const result = await prisma.$transaction(async (tx) => {
      // Deactivate current active year and set to passed
      await tx.schoolYear.updateMany({
        where: { isActive: true },
        data: {
          isActive: false,
          status: "passed",
        },
      })

      // Activate the target year
      const activated = await tx.schoolYear.update({
        where: { id },
        data: {
          isActive: true,
          status: "active",
        },
      })

      return activated
    })

    return NextResponse.json({
      message: "School year activated successfully",
      schoolYear: result,
    })
  } catch (err) {
    console.error("Error activating school year:", err)
    return NextResponse.json(
      { message: "Failed to activate school year" },
      { status: 500 }
    )
  }
}
