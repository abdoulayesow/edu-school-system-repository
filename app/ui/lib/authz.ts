import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import type { AppRole } from "@/lib/rbac"
import type { PermissionResource, PermissionAction, PermissionScope } from "@prisma/client"
import {
  hasPermission,
  buildPermissionContext,
  getScopeFilter,
  type PermissionContext,
} from "@/lib/permissions"

export async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { session: null, error: new NextResponse("Unauthorized", { status: 401 }) }
  }
  return { session, error: null }
}

export async function requireRole(roles: AppRole[]) {
  const { session, error } = await requireSession()
  if (error || !session) return { session: null, error }

  if (!roles.includes(session.user.role)) {
    return { session: null, error: new NextResponse("Forbidden", { status: 403 }) }
  }

  return { session, error: null }
}

/**
 * Require a specific permission for an API route.
 * Returns session and permission context if granted, otherwise returns a 403 error.
 *
 * @example
 * export async function GET(req: NextRequest) {
 *   const { session, context, scope, error } = await requirePerm("students", "view")
 *   if (error) return error
 *
 *   // Use scope for filtering
 *   const where = getScopeFilter(scope!, context!, "students")
 *   const students = await prisma.student.findMany({ where })
 * }
 */
export async function requirePerm(
  resource: PermissionResource,
  action: PermissionAction
): Promise<{
  session: Awaited<ReturnType<typeof requireSession>>["session"]
  context: PermissionContext | null
  scope: PermissionScope | null
  error: NextResponse | null
}> {
  const { session, error: sessionError } = await requireSession()
  if (sessionError || !session) {
    return { session: null, context: null, scope: null, error: sessionError }
  }

  // Build permission context from session
  const context = await buildPermissionContext({
    id: session.user.id,
    staffRole: session.user.staffRole ?? null,
    schoolLevel: session.user.schoolLevel ?? null,
    staffProfileId: session.user.staffProfileId ?? null,
  })

  // Check permission
  const result = await hasPermission(context, resource, action)

  if (!result.granted) {
    return {
      session: null,
      context: null,
      scope: null,
      error: NextResponse.json(
        { message: result.reason || "Permission denied", code: "PERMISSION_DENIED" },
        { status: 403 }
      ),
    }
  }

  return { session, context, scope: result.scope ?? null, error: null }
}

/**
 * Check if user has permission without returning an error response.
 * Useful for conditional logic in routes that handle multiple actions.
 */
export async function checkPerm(
  resource: PermissionResource,
  action: PermissionAction
): Promise<{
  session: Awaited<ReturnType<typeof requireSession>>["session"]
  context: PermissionContext | null
  granted: boolean
  scope: PermissionScope | null
  reason?: string
}> {
  const { session, error: sessionError } = await requireSession()
  if (sessionError || !session) {
    return { session: null, context: null, granted: false, scope: null, reason: "Not authenticated" }
  }

  const context = await buildPermissionContext({
    id: session.user.id,
    staffRole: session.user.staffRole ?? null,
    schoolLevel: session.user.schoolLevel ?? null,
    staffProfileId: session.user.staffProfileId ?? null,
  })

  const result = await hasPermission(context, resource, action)

  return {
    session,
    context,
    granted: result.granted,
    scope: result.scope ?? null,
    reason: result.reason,
  }
}

// Re-export getScopeFilter for convenience
export { getScopeFilter }
