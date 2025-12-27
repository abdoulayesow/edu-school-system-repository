"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import {
  useOfflineStore,
  selectAuthState,
  selectCanWrite,
  selectCanRead,
} from "@/lib/stores/offline-store"
import {
  getCachedSession,
  type CachedSession,
  getTimeUntilExpiry,
  formatExpiryTime,
} from "@/lib/auth/offline"

// ============================================================================
// useOfflineAuth Hook
// ============================================================================

export function useOfflineAuth() {
  const { data: session, status } = useSession()
  const authState = useOfflineStore(selectAuthState)
  const canWrite = useOfflineStore(selectCanWrite)
  const canRead = useOfflineStore(selectCanRead)
  const handleSessionChange = useOfflineStore((state) => state.handleSessionChange)
  const isOnline = useOfflineStore((state) => state.isOnline)

  const [cachedSession, setCachedSession] = useState<CachedSession | null>(null)
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null)

  // Sync session changes with offline store
  useEffect(() => {
    if (status === "authenticated" && session) {
      handleSessionChange({
        user: {
          id: session.user?.id ?? "",
          email: session.user?.email,
          name: session.user?.name,
          role: session.user?.role,
          image: session.user?.image,
        },
        expires: session.expires ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
    } else if (status === "unauthenticated") {
      handleSessionChange(null)
    }
  }, [session, status, handleSessionChange])

  // Get cached session info
  useEffect(() => {
    const loadCachedSession = async () => {
      const cached = await getCachedSession()
      setCachedSession(cached)
    }
    loadCachedSession()
  }, [authState])

  // Update time until expiry
  useEffect(() => {
    const updateExpiry = async () => {
      const time = await getTimeUntilExpiry()
      setTimeUntilExpiry(time)
    }

    updateExpiry()

    // Update every minute
    const interval = setInterval(updateExpiry, 60000)
    return () => clearInterval(interval)
  }, [])

  // Get current user (from session or cache)
  const user = session?.user ?? cachedSession?.user ?? null

  return {
    // Auth state
    authState,
    isLoading: status === "loading",
    isAuthenticated: authState !== "unauthenticated",
    isOnline,

    // Permissions
    canWrite,
    canRead,

    // User info
    user,
    session,
    cachedSession,

    // Expiry info
    timeUntilExpiry,
    expiryFormatted: timeUntilExpiry !== null ? formatExpiryTime(timeUntilExpiry) : null,

    // Status helpers
    isOfflineMode: authState === "offline_full" || authState === "offline_readonly",
    isReadOnlyMode: authState === "offline_readonly",
  }
}

// ============================================================================
// useRequireAuth Hook
// ============================================================================

export function useRequireAuth(options?: {
  requireWrite?: boolean
  redirectTo?: string
}) {
  const { authState, isLoading, canWrite } = useOfflineAuth()
  const { requireWrite = false } = options ?? {}

  const isAuthorized =
    authState !== "unauthenticated" &&
    (!requireWrite || canWrite)

  return {
    isLoading,
    isAuthorized,
    authState,
    reason: !isAuthorized
      ? authState === "unauthenticated"
        ? "Not authenticated"
        : requireWrite && !canWrite
          ? "Session expired - read-only mode"
          : undefined
      : undefined,
  }
}
