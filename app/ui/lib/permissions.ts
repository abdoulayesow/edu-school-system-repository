/**
 * Permissions System - Core Utilities
 *
 * Provides functions for checking user permissions based on the Staff Roles & Permissions System.
 * This replaces the legacy rbac.ts system with a more comprehensive, database-driven approach.
 *
 * Key Concepts:
 * - StaffRole: The user's role (proviseur, comptable, enseignant, etc.)
 * - PermissionResource: What is being accessed (students, grades, payments, etc.)
 * - PermissionAction: What operation is being performed (view, create, update, delete, approve, export)
 * - PermissionScope: Whose data can be accessed (all, own_level, own_classes, own_children, none)
 */

import { prisma } from "./prisma"
import {
  StaffRole,
  PermissionResource,
  PermissionAction,
  PermissionScope,
  SchoolLevel,
  type User,
  type RolePermission,
  type PermissionOverride,
} from "@prisma/client"

// ============================================================================
// TYPES
// ============================================================================

export interface PermissionContext {
  userId: string
  staffRole: StaffRole | null
  schoolLevel: SchoolLevel | null
  staffProfileId: string | null
  // For own_classes scope: list of class/grade IDs the user teaches
  assignedClassIds?: string[]
  // For own_children scope: list of student IDs that are the user's children
  childrenIds?: string[]
}

export interface PermissionCheckResult {
  granted: boolean
  reason?: string
  scope?: PermissionScope
}

// ============================================================================
// CORE PERMISSION CHECKING
// ============================================================================

/**
 * Check if a user has permission to perform an action on a resource.
 *
 * This is the main entry point for permission checks.
 *
 * @param context - User context (role, school level, etc.)
 * @param resource - The resource being accessed
 * @param action - The action being performed
 * @returns Permission check result with granted boolean and optional reason
 *
 * @example
 * ```ts
 * const result = await hasPermission(
 *   { userId: "...", staffRole: "proviseur", schoolLevel: "high_school", staffProfileId: null },
 *   "students",
 *   "view"
 * )
 * if (result.granted) {
 *   // Allow access
 * }
 * ```
 */
export async function hasPermission(
  context: PermissionContext,
  resource: PermissionResource,
  action: PermissionAction
): Promise<PermissionCheckResult> {
  // 1. Check if user has a staff role
  if (!context.staffRole) {
    return {
      granted: false,
      reason: "User does not have a staff role assigned",
    }
  }

  // 2. Check for permission overrides first (highest priority)
  const override = await getPermissionOverride(context.userId, resource, action)
  if (override) {
    return {
      granted: override.granted,
      reason: override.granted
        ? `Granted via permission override: ${override.reason || "N/A"}`
        : `Denied via permission override: ${override.reason || "N/A"}`,
      scope: override.scope,
    }
  }

  // 3. Check role-based permissions (default permissions)
  const rolePermission = await getRolePermission(context.staffRole, resource, action)
  if (!rolePermission) {
    return {
      granted: false,
      reason: `Role ${context.staffRole} does not have ${action} permission on ${resource}`,
    }
  }

  // 4. Check if scope allows access
  const scopeAllowed = checkScope(rolePermission.scope, context)
  if (!scopeAllowed) {
    return {
      granted: false,
      reason: `Role ${context.staffRole} has ${action} on ${resource}, but scope ${rolePermission.scope} does not allow access`,
      scope: rolePermission.scope,
    }
  }

  return {
    granted: true,
    scope: rolePermission.scope,
  }
}

/**
 * Get permission override for a specific user, resource, and action.
 * Returns null if no override exists or if it has expired.
 */
async function getPermissionOverride(
  userId: string,
  resource: PermissionResource,
  action: PermissionAction
): Promise<PermissionOverride | null> {
  const override = await prisma.permissionOverride.findUnique({
    where: {
      userId_resource_action: {
        userId,
        resource,
        action,
      },
    },
  })

  // Check if override has expired
  if (override && override.expiresAt && override.expiresAt < new Date()) {
    return null
  }

  return override
}

/**
 * Get role permission for a specific role, resource, and action.
 */
async function getRolePermission(
  role: StaffRole,
  resource: PermissionResource,
  action: PermissionAction
): Promise<RolePermission | null> {
  return await prisma.rolePermission.findUnique({
    where: {
      role_resource_action: {
        role,
        resource,
        action,
      },
    },
  })
}

/**
 * Check if the permission scope allows access based on user context.
 *
 * @param scope - The permission scope (all, own_level, own_classes, own_children, none)
 * @param context - User context
 * @returns true if scope allows access, false otherwise
 */
function checkScope(scope: PermissionScope, context: PermissionContext): boolean {
  switch (scope) {
    case PermissionScope.all:
      // User has access to all records
      return true

    case PermissionScope.own_level:
      // User must have a school level assigned
      return context.schoolLevel !== null

    case PermissionScope.own_classes:
      // User must have assigned classes (for teachers)
      return !!context.assignedClassIds && context.assignedClassIds.length > 0

    case PermissionScope.own_children:
      // User must have children (for parents)
      return !!context.childrenIds && context.childrenIds.length > 0

    case PermissionScope.none:
      // No access allowed regardless of context
      return false

    default:
      return false
  }
}

// ============================================================================
// SCOPE FILTERING
// ============================================================================

/**
 * Apply scope filtering to a Prisma query based on permission scope.
 *
 * This is used to filter query results to only include records the user has access to.
 *
 * @param scope - The permission scope
 * @param context - User context
 * @param resourceType - The type of resource being queried (for specific filtering logic)
 * @returns Prisma where clause object
 *
 * @example
 * ```ts
 * const where = getScopeFilter(PermissionScope.own_level, context, "students")
 * const students = await prisma.student.findMany({ where })
 * ```
 */
export function getScopeFilter(
  scope: PermissionScope,
  context: PermissionContext,
  resourceType: "students" | "grades" | "payments" | "classes" | "attendance"
): Record<string, unknown> {
  switch (scope) {
    case PermissionScope.all:
      // No filtering - return all records
      return {}

    case PermissionScope.own_level:
      // Filter by school level
      if (!context.schoolLevel) return { id: "__none__" } // No access if no level
      return getScopeLevelFilter(context.schoolLevel, resourceType)

    case PermissionScope.own_classes:
      // Filter by assigned classes
      if (!context.assignedClassIds || context.assignedClassIds.length === 0) {
        return { id: "__none__" } // No access if no classes assigned
      }
      return getScopeClassesFilter(context.assignedClassIds, resourceType)

    case PermissionScope.own_children:
      // Filter by children
      if (!context.childrenIds || context.childrenIds.length === 0) {
        return { id: "__none__" } // No access if no children
      }
      return { id: { in: context.childrenIds } }

    case PermissionScope.none:
      // No access - return filter that matches nothing
      return { id: "__none__" }

    default:
      return { id: "__none__" }
  }
}

/**
 * Get filter for own_level scope based on school level.
 */
function getScopeLevelFilter(
  schoolLevel: SchoolLevel,
  resourceType: string
): Record<string, unknown> {
  // Map school level to grade level values
  const levelMap: Record<SchoolLevel, string[]> = {
    kindergarten: ["kindergarten"],
    elementary: ["elementary"],
    middle: ["college"], // Middle school is called "college" in French system
    high_school: ["high_school"],
  }

  const levels = levelMap[schoolLevel] || []

  // Apply filter based on resource type
  switch (resourceType) {
    case "students":
    case "classes":
    case "grades":
      return {
        grade: {
          level: { in: levels },
        },
      }

    case "payments":
      return {
        enrollment: {
          grade: {
            level: { in: levels },
          },
        },
      }

    case "attendance":
      return {
        session: {
          grade: {
            level: { in: levels },
          },
        },
      }

    default:
      return {}
  }
}

/**
 * Get filter for own_classes scope based on assigned class IDs.
 */
function getScopeClassesFilter(
  assignedClassIds: string[],
  resourceType: string
): Record<string, unknown> {
  switch (resourceType) {
    case "students":
      return {
        enrollments: {
          some: {
            gradeId: { in: assignedClassIds },
          },
        },
      }

    case "grades":
    case "classes":
      return {
        id: { in: assignedClassIds },
      }

    case "payments":
      return {
        enrollment: {
          gradeId: { in: assignedClassIds },
        },
      }

    case "attendance":
      return {
        session: {
          gradeId: { in: assignedClassIds },
        },
      }

    default:
      return { id: { in: assignedClassIds } }
  }
}

// ============================================================================
// PERMISSION CONTEXT HELPERS
// ============================================================================

/**
 * Build permission context from a User object.
 * This fetches additional context like assigned classes for teachers.
 *
 * @param user - User object from database
 * @returns PermissionContext with all necessary fields populated
 */
export async function buildPermissionContext(user: User): Promise<PermissionContext> {
  const context: PermissionContext = {
    userId: user.id,
    staffRole: user.staffRole,
    schoolLevel: user.schoolLevel,
    staffProfileId: user.staffProfileId,
  }

  // For teachers (enseignant, professeur_principal), fetch assigned classes
  if (
    user.staffRole === StaffRole.enseignant ||
    user.staffRole === StaffRole.professeur_principal
  ) {
    if (user.staffProfileId) {
      const assignments = await prisma.classAssignment.findMany({
        where: { teacherProfileId: user.staffProfileId },
        select: {
          gradeSubject: {
            select: { gradeId: true },
          },
        },
      })
      context.assignedClassIds = [...new Set(assignments.map((a) => a.gradeSubject.gradeId))]
    }
  }

  // For parents, fetch children IDs (if we implement parent profiles in the future)
  // context.childrenIds = await getChildrenIds(user.id)

  return context
}

// ============================================================================
// MIDDLEWARE HELPERS
// ============================================================================

/**
 * Require permission for an API route.
 * Throws an error if permission is not granted.
 *
 * @param context - User permission context
 * @param resource - Resource being accessed
 * @param action - Action being performed
 * @throws Error if permission is denied
 *
 * @example
 * ```ts
 * // In an API route
 * const context = await buildPermissionContext(user)
 * await requirePermission(context, "students", "view")
 * // If we get here, permission was granted
 * ```
 */
export async function requirePermission(
  context: PermissionContext,
  resource: PermissionResource,
  action: PermissionAction
): Promise<PermissionScope> {
  const result = await hasPermission(context, resource, action)

  if (!result.granted) {
    const error = new Error(result.reason || "Permission denied")
    ;(error as any).code = "PERMISSION_DENIED"
    ;(error as any).statusCode = 403
    throw error
  }

  return result.scope!
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

/**
 * Log a permission check for audit purposes.
 *
 * @param context - User permission context
 * @param action - Action description (e.g., "view_student", "edit_payment")
 * @param resource - Resource type
 * @param resourceId - Specific resource ID (optional)
 * @param granted - Whether permission was granted
 * @param reason - Reason for grant/denial
 * @param metadata - Additional context (optional)
 */
export async function logPermissionCheck(
  context: PermissionContext,
  action: string,
  resource: string,
  resourceId: string | null,
  granted: boolean,
  reason: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: context.userId,
      action,
      resource,
      resourceId,
      granted,
      reason,
      metadata: metadata || null,
    },
  })
}
