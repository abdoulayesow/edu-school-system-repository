import { NextRequest, NextResponse } from "next/server"
import { requirePerm } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { PermissionResource, PermissionAction, PermissionScope, StaffRole } from "@prisma/client"

interface RouteParams {
  params: Promise<{ role: string }>
}

const bulkOperationSchema = z.object({
  add: z.array(z.object({
    resource: z.nativeEnum(PermissionResource),
    action: z.nativeEnum(PermissionAction),
    scope: z.nativeEnum(PermissionScope),
  })).optional(),
  remove: z.array(z.string()).optional(), // permission IDs
})

/**
 * POST /api/admin/roles/[role]/permissions/bulk
 * Bulk add/remove permissions (used for copying permissions between roles)
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
    const validated = bulkOperationSchema.parse(body)

    const results = {
      added: [] as any[],
      removed: [] as string[],
      skipped: [] as string[],
      errors: [] as string[],
    }

    // Process removals first
    if (validated.remove && validated.remove.length > 0) {
      for (const permissionId of validated.remove) {
        try {
          const existing = await prisma.rolePermission.findUnique({
            where: { id: permissionId },
          })

          if (!existing) {
            results.errors.push(`Permission ${permissionId} not found`)
            continue
          }

          if (existing.role !== role) {
            results.errors.push(`Permission ${permissionId} does not belong to ${role}`)
            continue
          }

          await prisma.rolePermission.delete({
            where: { id: permissionId },
          })

          results.removed.push(permissionId)
        } catch (err) {
          console.error(`Error removing permission ${permissionId}:`, err)
          results.errors.push(`Failed to remove permission ${permissionId}`)
        }
      }
    }

    // Process additions
    if (validated.add && validated.add.length > 0) {
      for (const perm of validated.add) {
        try {
          // Check if permission already exists
          const existing = await prisma.rolePermission.findFirst({
            where: {
              role: role as StaffRole,
              resource: perm.resource,
              action: perm.action,
            },
          })

          if (existing) {
            results.skipped.push(`${perm.resource}:${perm.action}`)
            continue
          }

          // Create new permission
          const created = await prisma.rolePermission.create({
            data: {
              role: role as StaffRole,
              resource: perm.resource,
              action: perm.action,
              scope: perm.scope,
              source: "manual",
              createdBy: session!.user.id,
            },
          })

          results.added.push(created)
        } catch (err) {
          console.error(`Error adding permission ${perm.resource}:${perm.action}:`, err)
          results.errors.push(`Failed to add ${perm.resource}:${perm.action}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        added: results.added.length,
        removed: results.removed.length,
        skipped: results.skipped.length,
        errors: results.errors.length,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: err.errors },
        { status: 400 }
      )
    }
    console.error("Error performing bulk operations:", err)
    return NextResponse.json(
      { message: "Failed to perform bulk operations" },
      { status: 500 }
    )
  }
}
