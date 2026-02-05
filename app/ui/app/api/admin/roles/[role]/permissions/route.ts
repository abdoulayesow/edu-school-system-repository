import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { PermissionResource, PermissionAction, PermissionScope, StaffRole } from "@prisma/client"

interface RouteParams {
  params: Promise<{ role: string }>
}

/**
 * GET /api/admin/roles/[role]/permissions
 * Get all permissions for a staff role with stats
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("role_assignment", "view")
  if (error) return error

  const { role } = await params

  // Validate role
  if (!Object.values(StaffRole).includes(role as StaffRole)) {
    return NextResponse.json(
      { message: "Invalid staff role" },
      { status: 400 }
    )
  }

  try {
    // Get all permissions for this role
    const permissions = await prisma.rolePermission.findMany({
      where: {
        role: role as StaffRole,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        updater: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { resource: "asc" },
        { action: "asc" },
      ],
    })

    // Count users with this role
    const affectedUsers = await prisma.user.count({
      where: {
        staffRole: role as StaffRole,
      },
    })

    // Calculate stats
    const stats = {
      total: permissions.length,
      seeded: permissions.filter(p => p.source === "seeded").length,
      manual: permissions.filter(p => p.source === "manual").length,
      byResource: permissions.reduce((acc, perm) => {
        acc[perm.resource] = (acc[perm.resource] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    }

    return NextResponse.json({
      role,
      permissions,
      stats,
      affectedUsers,
    })
  } catch (err) {
    console.error("Error fetching role permissions:", err)
    return NextResponse.json(
      { message: "Failed to fetch permissions" },
      { status: 500 }
    )
  }
}

const createPermissionSchema = z.object({
  resource: z.nativeEnum(PermissionResource),
  action: z.nativeEnum(PermissionAction),
  scope: z.nativeEnum(PermissionScope),
})

/**
 * POST /api/admin/roles/[role]/permissions
 * Add a new permission to a role
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("role_assignment", "update")
  if (error) return error

  const { role } = await params

  // Validate role
  if (!Object.values(StaffRole).includes(role as StaffRole)) {
    return NextResponse.json(
      { message: "Invalid staff role" },
      { status: 400 }
    )
  }

  try {
    const body = await req.json()
    const validated = createPermissionSchema.parse(body)

    // Check if permission already exists
    const existing = await prisma.rolePermission.findFirst({
      where: {
        role: role as StaffRole,
        resource: validated.resource,
        action: validated.action,
      },
    })

    if (existing) {
      return NextResponse.json(
        { message: "Permission already exists for this role" },
        { status: 409 }
      )
    }

    // Create new permission
    const permission = await prisma.rolePermission.create({
      data: {
        role: role as StaffRole,
        resource: validated.resource,
        action: validated.action,
        scope: validated.scope,
        source: "manual",
        createdBy: session!.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(permission, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating role permission:", err)
    return NextResponse.json(
      { message: "Failed to create permission" },
      { status: 500 }
    )
  }
}
