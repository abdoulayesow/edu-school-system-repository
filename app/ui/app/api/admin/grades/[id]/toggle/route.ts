import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/admin/grades/[id]/toggle
 * Toggle a grade's enabled status
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { error } = await requireRole(["director"])
  if (error) return error

  const { id } = await params

  try {
    const grade = await prisma.grade.findUnique({
      where: { id },
      include: {
        schoolYear: true,
      },
    })

    if (!grade) {
      return NextResponse.json(
        { message: "Grade not found" },
        { status: 404 }
      )
    }

    // Cannot toggle grades in passed school years
    if (grade.schoolYear.status === "passed") {
      return NextResponse.json(
        { message: "Cannot modify grades in a passed school year" },
        { status: 400 }
      )
    }

    const updatedGrade = await prisma.grade.update({
      where: { id },
      data: {
        isEnabled: !grade.isEnabled,
      },
    })

    return NextResponse.json({
      message: updatedGrade.isEnabled ? "Grade enabled" : "Grade disabled",
      isEnabled: updatedGrade.isEnabled,
    })
  } catch (err) {
    console.error("Error toggling grade:", err)
    return NextResponse.json(
      { message: "Failed to toggle grade status" },
      { status: 500 }
    )
  }
}
