import { offlineDb, type SyncConflict } from "@/lib/db/offline"

// ============================================================================
// Types
// ============================================================================

export interface ConflictDetails {
  id: number
  entity: string
  entityId: string
  localValue: Record<string, unknown>
  serverValue: Record<string, unknown>
  conflictedFields: string[]
  resolvedAt: number
  resolution: "server_wins" | "local_wins" | "merged"
}

// ============================================================================
// Conflict Detection
// ============================================================================

/**
 * Detect which fields have conflicts between local and server values
 */
export function detectConflictedFields(
  local: Record<string, unknown>,
  server: Record<string, unknown>
): string[] {
  const conflicts: string[] = []
  const allKeys = new Set([...Object.keys(local), ...Object.keys(server)])

  for (const key of allKeys) {
    // Skip metadata fields
    if (
      key.startsWith("_") ||
      ["syncStatus", "localUpdatedAt", "serverUpdatedAt", "version"].includes(key)
    ) {
      continue
    }

    const localValue = local[key]
    const serverValue = server[key]

    // Both have the field but with different values
    if (localValue !== undefined && serverValue !== undefined) {
      if (!isEqual(localValue, serverValue)) {
        conflicts.push(key)
      }
    }
  }

  return conflicts
}

/**
 * Simple deep equality check
 */
function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== typeof b) return false
  if (a === null || b === null) return a === b
  if (typeof a !== "object") return a === b

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => isEqual(item, b[index]))
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false

  const aObj = a as Record<string, unknown>
  const bObj = b as Record<string, unknown>
  const keys = Object.keys(aObj)

  if (keys.length !== Object.keys(bObj).length) return false

  return keys.every((key) => isEqual(aObj[key], bObj[key]))
}

// ============================================================================
// Conflict Resolution Strategies
// ============================================================================

/**
 * Merge strategy: Server wins (default for auto-resolve)
 */
export function mergeServerWins(
  local: Record<string, unknown>,
  server: Record<string, unknown>
): Record<string, unknown> {
  return { ...local, ...server }
}

/**
 * Merge strategy: Local wins
 */
export function mergeLocalWins(
  local: Record<string, unknown>,
  server: Record<string, unknown>
): Record<string, unknown> {
  return { ...server, ...local }
}

/**
 * Merge strategy: Non-conflicting fields merged, conflicts use server value
 */
export function mergeNonConflicting(
  local: Record<string, unknown>,
  server: Record<string, unknown>,
  base?: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...local }
  const baseData = base || {}

  for (const key of Object.keys(server)) {
    const localValue = local[key]
    const serverValue = server[key]
    const baseValue = baseData[key]

    // If local hasn't changed from base, take server value
    if (isEqual(localValue, baseValue)) {
      result[key] = serverValue
    }
    // If server hasn't changed from base, keep local value
    else if (isEqual(serverValue, baseValue)) {
      result[key] = localValue
    }
    // Both changed - server wins
    else {
      result[key] = serverValue
    }
  }

  return result
}

// ============================================================================
// Conflict Log Management
// ============================================================================

/**
 * Get all recorded conflicts
 */
export async function getConflicts(): Promise<SyncConflict[]> {
  return offlineDb.syncConflicts.toArray()
}

/**
 * Get recent conflicts (last 24 hours)
 */
export async function getRecentConflicts(): Promise<SyncConflict[]> {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000
  return offlineDb.syncConflicts.where("resolvedAt").above(dayAgo).toArray()
}

/**
 * Get conflicts for a specific entity
 */
export async function getConflictsForEntity(
  entity: string,
  entityId: string
): Promise<SyncConflict[]> {
  return offlineDb.syncConflicts
    .where({ entity, entityId })
    .toArray()
}

/**
 * Clear old conflicts (older than 7 days)
 */
export async function clearOldConflicts(): Promise<number> {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return offlineDb.syncConflicts.where("resolvedAt").below(weekAgo).delete()
}

/**
 * Get conflict statistics
 */
export async function getConflictStats(): Promise<{
  total: number
  last24h: number
  byEntity: Record<string, number>
}> {
  const all = await offlineDb.syncConflicts.toArray()
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000

  const byEntity: Record<string, number> = {}
  let last24h = 0

  for (const conflict of all) {
    byEntity[conflict.entity] = (byEntity[conflict.entity] || 0) + 1
    if (conflict.resolvedAt > dayAgo) {
      last24h++
    }
  }

  return {
    total: all.length,
    last24h,
    byEntity,
  }
}
