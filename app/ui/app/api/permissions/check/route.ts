/**
 * Permission Check API Endpoint
 *
 * POST /api/permissions/check
 *
 * Check if the current user has permission to perform an action on a resource.
 *
 * Request body:
 * {
 *   resource: "students" | "grades" | "payments" | ...,
 *   action: "view" | "create" | "update" | "delete" | "approve" | "export"
 * }
 *
 * Response:
 * {
 *   granted: boolean,
 *   reason?: string,
 *   scope?: "all" | "own_level" | "own_classes" | "own_children" | "none"
 * }
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/prisma"
import { hasPermission, buildPermissionContext } from "@/lib/permissions"
import { PermissionResource, PermissionAction } from "@prisma/client"

export async function POST(req: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        staffRole: true,
        schoolLevel: true,
        staffProfileId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 3. Parse request body
    const body = await req.json()
    const { resource, action } = body

    // 4. Validate input
    if (!resource || !action) {
      return NextResponse.json(
        { error: "Missing required fields: resource, action" },
        { status: 400 }
      )
    }

    // Validate that resource and action are valid enum values
    if (!Object.values(PermissionResource).includes(resource)) {
      return NextResponse.json({ error: `Invalid resource: ${resource}` }, { status: 400 })
    }

    if (!Object.values(PermissionAction).includes(action)) {
      return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 })
    }

    // 5. Build permission context
    const context = await buildPermissionContext(user)

    // 6. Check permission
    const result = await hasPermission(context, resource as PermissionResource, action as PermissionAction)

    // 7. Return result
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error checking permissions:", error)
    return NextResponse.json(
      { error: "Failed to check permissions" },
      { status: 500 }
    )
  }
}
