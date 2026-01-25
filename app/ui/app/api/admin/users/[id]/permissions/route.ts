import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { PermissionResource, PermissionAction, PermissionScope } from "@prisma/client"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/users/[id]/permissions
 * Get user's effective permissions (role permissions + overrides)
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("permission_overrides", "view")
  if (error) return error

  const { id } = await params

  try {
    // Get user with their role
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        staffRole: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // Get role permissions (only if user has a staff role)
    const rolePermissions = user.staffRole
      ? await prisma.rolePermission.findMany({
          where: {
            role: user.staffRole,
          },
          select: {
            resource: true,
            action: true,
            scope: true,
          },
        })
      : []

    // Get permission overrides
    const overrides = await prisma.permissionOverride.findMany({
      where: {
        userId: id,
      },
      select: {
        id: true,
        resource: true,
        action: true,
        scope: true,
        granted: true,
        createdAt: true,
        grantor: {
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

    // Calculate effective permissions
    const effectivePermissions = new Map<string, { resource: string; action: string; scope: string; source: "role" | "granted" | "denied"; overrideId?: string }>()

    // Start with role permissions
    rolePermissions.forEach(perm => {
      const key = `${perm.resource}:${perm.action}:${perm.scope}`
      effectivePermissions.set(key, {
        resource: perm.resource,
        action: perm.action,
        scope: perm.scope,
        source: "role",
      })
    })

    // Apply overrides
    overrides.forEach(override => {
      const key = `${override.resource}:${override.action}:${override.scope}`

      if (!override.granted) {
        // granted=false means denial - removes permission
        effectivePermissions.delete(key)
      } else {
        // granted=true means grant - adds or marks as granted
        effectivePermissions.set(key, {
          resource: override.resource,
          action: override.action,
          scope: override.scope,
          source: "granted",
          overrideId: override.id,
        })
      }
    })

    return NextResponse.json({
      user,
      rolePermissions,
      overrides,
      effectivePermissions: Array.from(effectivePermissions.values()),
    })
  } catch (err) {
    console.error("Error fetching user permissions:", err)
    return NextResponse.json(
      { message: "Failed to fetch permissions" },
      { status: 500 }
    )
  }
}

const createOverrideSchema = z.object({
  resource: z.nativeEnum(PermissionResource),
  action: z.nativeEnum(PermissionAction),
  scope: z.nativeEnum(PermissionScope),
  effect: z.enum(["grant", "deny"]),
})

/**
 * POST /api/admin/users/[id]/permissions
 * Create a permission override
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("permission_overrides", "create")
  if (error) return error

  const { id } = await params

  try {
    const body = await req.json()
    const validated = createOverrideSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // Check if override already exists
    const existing = await prisma.permissionOverride.findFirst({
      where: {
        userId: id,
        resource: validated.resource,
        action: validated.action,
        scope: validated.scope,
      },
    })

    if (existing) {
      // Update existing override
      const updated = await prisma.permissionOverride.update({
        where: { id: existing.id },
        data: {
          granted: validated.effect === "grant",
          grantedBy: session!.user.id,
        },
      })
      return NextResponse.json(updated)
    }

    // Create new override
    const override = await prisma.permissionOverride.create({
      data: {
        userId: id,
        resource: validated.resource,
        action: validated.action,
        scope: validated.scope,
        granted: validated.effect === "grant",
        grantedBy: session!.user.id,
      },
      include: {
        grantor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(override)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error creating permission override:", err)
    return NextResponse.json(
      { message: "Failed to create override" },
      { status: 500 }
    )
  }
}
