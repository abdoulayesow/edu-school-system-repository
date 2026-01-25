import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { StaffRole } from "@prisma/client"

interface RouteParams {
  params: Promise<{ role: string }>
}

/**
 * GET /api/admin/roles/[role]/permissions
 * Get all permissions for a specific role
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("role_assignment", "view")
  if (error) return error

  const { role } = await params

  try {
    // Validate role
    if (!Object.values(StaffRole).includes(role as StaffRole)) {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 400 }
      )
    }

    const permissions = await prisma.rolePermission.findMany({
      where: {
        role: role as StaffRole,
      },
      select: {
        resource: true,
        action: true,
        scope: true,
      },
      orderBy: [
        { resource: "asc" },
        { action: "asc" },
      ],
    })

    return NextResponse.json(permissions)
  } catch (err) {
    console.error("Error fetching role permissions:", err)
    return NextResponse.json(
      { message: "Failed to fetch permissions" },
      { status: 500 }
    )
  }
}
