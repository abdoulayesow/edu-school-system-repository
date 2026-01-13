import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/admin/trimesters/[id]/activate
 * Activate a trimester (deactivates all others)
 * Only trimesters from the active school year can be activated
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("academic_year", "update")
  if (error) return error

  const { id } = await params

  try {
    const trimester = await prisma.trimester.findUnique({
      where: { id },
      include: {
        schoolYear: true,
      },
    })

    if (!trimester) {
      return NextResponse.json(
        { message: "Trimester not found" },
        { status: 404 }
      )
    }

    // Can only activate trimesters from the active school year
    if (!trimester.schoolYear.isActive) {
      return NextResponse.json(
        { message: "Can only activate trimesters from the active school year" },
        { status: 400 }
      )
    }

    // Deactivate all trimesters and activate the selected one
    await prisma.$transaction([
      // Deactivate all trimesters across all school years
      prisma.trimester.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      }),
      // Activate the selected trimester
      prisma.trimester.update({
        where: { id },
        data: { isActive: true },
      }),
    ])

    const updatedTrimester = await prisma.trimester.findUnique({
      where: { id },
      include: {
        schoolYear: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: `${updatedTrimester?.nameFr} is now active`,
      trimester: updatedTrimester,
    })
  } catch (err) {
    console.error("Error activating trimester:", err)
    return NextResponse.json(
      { message: "Failed to activate trimester" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/trimesters/[id]/activate
 * Deactivate a trimester
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { error } = await requirePerm("academic_year", "update")
  if (error) return error

  const { id } = await params

  try {
    const trimester = await prisma.trimester.findUnique({
      where: { id },
    })

    if (!trimester) {
      return NextResponse.json(
        { message: "Trimester not found" },
        { status: 404 }
      )
    }

    if (!trimester.isActive) {
      return NextResponse.json(
        { message: "Trimester is not active" },
        { status: 400 }
      )
    }

    await prisma.trimester.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      message: "Trimester deactivated successfully",
    })
  } catch (err) {
    console.error("Error deactivating trimester:", err)
    return NextResponse.json(
      { message: "Failed to deactivate trimester" },
      { status: 500 }
    )
  }
}
