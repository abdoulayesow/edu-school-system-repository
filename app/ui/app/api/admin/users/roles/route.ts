import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/users/roles
 * Get all users with their roles
 */
export async function GET(req: NextRequest) {
  const { session, error } = await requirePerm("role_assignment", "view")
  if (error) return error

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        staffRole: true,
        schoolLevel: true,
        status: true,
      },
      orderBy: [
        { staffRole: "asc" },
        { name: "asc" },
      ],
    })

    return NextResponse.json(users)
  } catch (err) {
    console.error("Error fetching users:", err)
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    )
  }
}
