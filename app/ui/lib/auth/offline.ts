import { offlineDb, type LocalUser } from "@/lib/db/offline"

// ============================================================================
// Types
// ============================================================================

export type OfflineAuthState =
  | "online" // Authenticated and online
  | "offline_full" // Authenticated, offline, token valid
  | "offline_readonly" // Authenticated, offline, token expired (read-only)
  | "unauthenticated" // Not authenticated

export interface CachedSession {
  user: {
    id: string
    email: string
    name?: string
    role: string
    image?: string
  }
  expiresAt: number // Token expiry timestamp
  cachedAt: number // When we cached this session
}

// ============================================================================
// IndexedDB Storage for Auth Tokens
// ============================================================================

const AUTH_DB_NAME = "gspn_auth"
const AUTH_STORE_NAME = "session"

async function openAuthDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(AUTH_DB_NAME, 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(AUTH_STORE_NAME)) {
        db.createObjectStore(AUTH_STORE_NAME, { keyPath: "id" })
      }
    }
  })
}

// ============================================================================
// Session Caching
// ============================================================================

/**
 * Cache the current session for offline access
 */
export async function cacheSession(session: {
  user: {
    id: string
    email?: string | null
    name?: string | null
    role?: string
    image?: string | null
  }
  expires: string
}): Promise<void> {
  if (!session.user?.id || !session.user?.email) return

  const cachedSession: CachedSession = {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || undefined,
      role: session.user.role || "user",
      image: session.user.image || undefined,
    },
    expiresAt: new Date(session.expires).getTime(),
    cachedAt: Date.now(),
  }

  try {
    const db = await openAuthDB()
    const tx = db.transaction(AUTH_STORE_NAME, "readwrite")
    const store = tx.objectStore(AUTH_STORE_NAME)

    await new Promise<void>((resolve, reject) => {
      const request = store.put({ id: "current", ...cachedSession })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    db.close()

    // Also cache user in Dexie for profile access
    await cacheUserProfile(cachedSession.user)
  } catch (error) {
    console.warn("Failed to cache session:", error)
  }
}

/**
 * Retrieve cached session
 */
export async function getCachedSession(): Promise<CachedSession | null> {
  try {
    const db = await openAuthDB()
    const tx = db.transaction(AUTH_STORE_NAME, "readonly")
    const store = tx.objectStore(AUTH_STORE_NAME)

    const result = await new Promise<CachedSession | null>((resolve, reject) => {
      const request = store.get("current")
      request.onsuccess = () => {
        const data = request.result
        if (data) {
          // Remove the 'id' key we used for storage
          const { id, ...session } = data
          resolve(session as CachedSession)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })

    db.close()
    return result
  } catch (error) {
    console.warn("Failed to get cached session:", error)
    return null
  }
}

/**
 * Clear cached session (on logout)
 */
export async function clearCachedSession(): Promise<void> {
  try {
    const db = await openAuthDB()
    const tx = db.transaction(AUTH_STORE_NAME, "readwrite")
    const store = tx.objectStore(AUTH_STORE_NAME)

    await new Promise<void>((resolve, reject) => {
      const request = store.delete("current")
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    db.close()
  } catch (error) {
    console.warn("Failed to clear cached session:", error)
  }
}

// ============================================================================
// User Profile Caching
// ============================================================================

async function cacheUserProfile(user: CachedSession["user"]): Promise<void> {
  const localUser: LocalUser = {
    id: user.id,
    serverId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: "active",
    image: user.image,
    syncStatus: "synced",
    localUpdatedAt: Date.now(),
    serverUpdatedAt: Date.now(),
    version: 1,
  }

  await offlineDb.users.put(localUser)
}

/**
 * Get cached user profile from Dexie
 */
export async function getCachedUserProfile(
  userId: string
): Promise<LocalUser | undefined> {
  return offlineDb.users.get(userId)
}

// ============================================================================
// Offline Auth State
// ============================================================================

/**
 * Determine the current offline auth state
 */
export async function getOfflineAuthState(
  isOnline: boolean,
  hasActiveSession: boolean
): Promise<OfflineAuthState> {
  // Online with active session
  if (isOnline && hasActiveSession) {
    return "online"
  }

  // Online but no session
  if (isOnline && !hasActiveSession) {
    return "unauthenticated"
  }

  // Offline - check cached session
  const cached = await getCachedSession()

  if (!cached) {
    return "unauthenticated"
  }

  // Check if token is still valid
  const now = Date.now()
  if (cached.expiresAt > now) {
    return "offline_full"
  }

  // Token expired but we have cached data - read-only mode
  // Allow read access for a grace period (24 hours after expiry)
  const gracePeriod = 24 * 60 * 60 * 1000 // 24 hours
  if (cached.expiresAt + gracePeriod > now) {
    return "offline_readonly"
  }

  // Token too old - require re-authentication
  return "unauthenticated"
}

/**
 * Check if user can perform write operations
 */
export function canPerformWrites(state: OfflineAuthState): boolean {
  return state === "online" || state === "offline_full"
}

/**
 * Check if user can read data
 */
export function canReadData(state: OfflineAuthState): boolean {
  return state !== "unauthenticated"
}

// ============================================================================
// Session Refresh
// ============================================================================

/**
 * Attempt to refresh the session when coming back online
 */
export async function refreshSessionIfNeeded(): Promise<boolean> {
  const cached = await getCachedSession()

  if (!cached) {
    return false
  }

  const now = Date.now()
  const timeToExpiry = cached.expiresAt - now

  // Refresh if less than 1 day until expiry
  if (timeToExpiry < 24 * 60 * 60 * 1000) {
    try {
      // NextAuth will automatically refresh the session on API calls
      // We just need to verify the session is still valid
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      })

      if (response.ok) {
        const session = await response.json()
        if (session?.user) {
          await cacheSession(session)
          return true
        }
      }
    } catch (error) {
      console.warn("Failed to refresh session:", error)
    }
  }

  return cached.expiresAt > now
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Get time until session expires
 */
export async function getTimeUntilExpiry(): Promise<number | null> {
  const cached = await getCachedSession()
  if (!cached) return null

  return Math.max(0, cached.expiresAt - Date.now())
}

/**
 * Format expiry time for display
 */
export function formatExpiryTime(ms: number): string {
  if (ms <= 0) return "Expired"

  const hours = Math.floor(ms / (60 * 60 * 1000))
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""}`
  }

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`
  }

  const minutes = Math.floor(ms / (60 * 1000))
  return `${minutes} minute${minutes > 1 ? "s" : ""}`
}
