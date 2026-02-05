import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { PermissionScope, StaffRole } from "@prisma/client"

interface RouteParams {
  params: Promise<{ role: string; permissionId: string }>
}

const updateScopeSchema = z.object({
  scope: z.nativeEnum(PermissionScope),
})

/**
 * PUT /api/admin/roles/[role]/permissions/[permissionId]
 * Update permission scope
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("role_assignment", "update")
  if (error) return error

  const { role, permissionId } = await params

  // Validate role
  if (!Object.values(StaffRole).includes(role as StaffRole)) {
    return NextResponse.json(
      { message: "Invalid staff role" },
      { status: 400 }
    )
  }

  try {
    const body = await req.json()
    const validated = updateScopeSchema.parse(body)

    // Check if permission exists
    const existing = await prisma.rolePermission.findUnique({
      where: { id: permissionId },
    })

    if (!existing) {
      return NextResponse.json(
        { message: "Permission not found" },
        { status: 404 }
      )
    }

    // Verify permission belongs to the role
    if (existing.role !== role) {
      return NextResponse.json(
        { message: "Permission does not belong to this role" },
        { status: 400 }
      )
    }

    // Update permission
    const updated = await prisma.rolePermission.update({
      where: { id: permissionId },
      data: {
        scope: validated.scope,
        updatedBy: session!.user.id,
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
    })

    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error updating permission:", err)
    return NextResponse.json(
      { message: "Failed to update permission" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/roles/[role]/permissions/[permissionId]
 * Delete a specific permission
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { session, error } = await requirePerm("role_assignment", "update")
  if (error) return error

  const { role, permissionId } = await params

  // Validate role
  if (!Object.values(StaffRole).includes(role as StaffRole)) {
    return NextResponse.json(
      { message: "Invalid staff role" },
      { status: 400 }
    )
  }

  try {
    // Check if permission exists
    const existing = await prisma.rolePermission.findUnique({
      where: { id: permissionId },
    })

    if (!existing) {
      return NextResponse.json(
        { message: "Permission not found" },
        { status: 404 }
      )
    }

    // Verify permission belongs to the role
    if (existing.role !== role) {
      return NextResponse.json(
        { message: "Permission does not belong to this role" },
        { status: 400 }
      )
    }

    // Safety check: Warn if deleting critical proprietaire permissions
    if (role === "proprietaire" && existing.source === "seeded") {
      // Allow but could add extra confirmation in the future
      console.warn(
        `Deleting seeded proprietaire permission: ${existing.resource}:${existing.action}`
      )
    }

    // Delete permission
    await prisma.rolePermission.delete({
      where: { id: permissionId },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error deleting permission:", err)
    return NextResponse.json(
      { message: "Failed to delete permission" },
      { status: 500 }
    )
  }
}
