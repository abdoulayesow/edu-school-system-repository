/**
 * Batch Permission Check API Endpoint
 *
 * POST /api/permissions/check-batch
 *
 * Check multiple permissions at once for better performance.
 *
 * Request body:
 * {
 *   checks: [
 *     { resource: "students", action: "view" },
 *     { resource: "grades", action: "update" },
 *     ...
 *   ]
 * }
 *
 * Response:
 * {
 *   results: [
 *     { resource: "students", action: "view", granted: true, scope: "own_level" },
 *     { resource: "grades", action: "update", granted: false, reason: "..." },
 *     ...
 *   ]
 * }
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { prisma } from "@/lib/prisma"
import { hasPermission, buildPermissionContext } from "@/lib/permissions"
import { PermissionResource, PermissionAction } from "@prisma/client"

interface PermissionCheck {
  resource: string
  action: string
}

interface PermissionCheckResult {
  resource: string
  action: string
  granted: boolean
  reason?: string
  scope?: string
}

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
    const { checks } = body as { checks: PermissionCheck[] }

    // 4. Validate input
    if (!checks || !Array.isArray(checks)) {
      return NextResponse.json(
        { error: "Missing or invalid checks array" },
        { status: 400 }
      )
    }

    // 5. Build permission context (once for all checks)
    const context = await buildPermissionContext(user)

    // 6. Check all permissions
    const results: PermissionCheckResult[] = []

    for (const check of checks) {
      const { resource, action } = check

      // Validate enum values
      if (!Object.values(PermissionResource).includes(resource as any)) {
        results.push({
          resource,
          action,
          granted: false,
          reason: `Invalid resource: ${resource}`,
        })
        continue
      }

      if (!Object.values(PermissionAction).includes(action as any)) {
        results.push({
          resource,
          action,
          granted: false,
          reason: `Invalid action: ${action}`,
        })
        continue
      }

      // Check permission
      const result = await hasPermission(
        context,
        resource as PermissionResource,
        action as PermissionAction
      )

      results.push({
        resource,
        action,
        granted: result.granted,
        reason: result.reason,
        scope: result.scope,
      })
    }

    // 7. Return results
    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error checking batch permissions:", error)
    return NextResponse.json(
      { error: "Failed to check permissions" },
      { status: 500 }
    )
  }
}
