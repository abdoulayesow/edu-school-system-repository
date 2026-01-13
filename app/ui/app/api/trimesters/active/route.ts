import { NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/trimesters/active
 * Get the currently active trimester
 */
export async function GET() {
  const { error } = await requirePerm("grades", "view")
  if (error) return error

  try {
    const activeTrimester = await prisma.trimester.findFirst({
      where: { isActive: true },
      include: {
        schoolYear: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    })

    if (!activeTrimester) {
      return NextResponse.json(
        { message: "No active trimester found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: activeTrimester.id,
      schoolYearId: activeTrimester.schoolYearId,
      schoolYear: activeTrimester.schoolYear,
      number: activeTrimester.number,
      name: activeTrimester.name,
      nameFr: activeTrimester.nameFr,
      nameEn: activeTrimester.nameEn,
      startDate: activeTrimester.startDate,
      endDate: activeTrimester.endDate,
      isActive: activeTrimester.isActive,
    })
  } catch (err) {
    console.error("Error fetching active trimester:", err)
    return NextResponse.json(
      { message: "Failed to fetch active trimester" },
      { status: 500 }
    )
  }
}
