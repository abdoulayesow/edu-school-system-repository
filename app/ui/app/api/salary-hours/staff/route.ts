import { NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/salary-hours/staff
 * Returns active staff for hours entry or advance creation.
 * Requires salary_hours.view permission (academic directors + financial roles).
 */
export async function GET() {
  const { error } = await requirePerm("salary_hours", "view")
  if (error) return error

  try {
    const users = await prisma.user.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        email: true,
        staffRole: true,
      },
      orderBy: [{ staffRole: "asc" }, { name: "asc" }],
    })

    return NextResponse.json(users)
  } catch (err) {
    console.error("Error fetching staff for hours entry:", err)
    return NextResponse.json(
      { message: "Failed to fetch staff" },
      { status: 500 }
    )
  }
}
