"use client"

import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { syncManager, type SyncState, type SyncResult } from "@/lib/sync/manager"
import {
  type OfflineAuthState,
  getOfflineAuthState,
  cacheSession,
  clearCachedSession,
} from "@/lib/auth/offline"

// ============================================================================
// Types
// ============================================================================

export interface OfflineStore {
  // Online status
  isOnline: boolean
  setIsOnline: (online: boolean) => void

  // Sync state
  syncStatus: SyncState["status"]
  pendingCount: number
  failedCount: number
  lastSyncAt: Date | null
  syncError: string | null

  // Auth state
  authState: OfflineAuthState
  setAuthState: (state: OfflineAuthState) => void

  // Actions
  triggerSync: () => Promise<SyncResult>
  initialize: () => void
  handleSessionChange: (session: {
    user: { id: string; email?: string | null; name?: string | null; role?: string; image?: string | null }
    expires: string
  } | null) => Promise<void>
}

// ============================================================================
// Store
// ============================================================================

export const useOfflineStore = create<OfflineStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    syncStatus: "idle",
    pendingCount: 0,
    failedCount: 0,
    lastSyncAt: null,
    syncError: null,
    authState: "online",

    // Actions
    setIsOnline: (online) => set({ isOnline: online }),

    setAuthState: (authState) => set({ authState }),

    triggerSync: async () => {
      const result = await syncManager.triggerSync()
      return result
    },

    initialize: () => {
      // Subscribe to sync manager state changes
      const unsubscribe = syncManager.subscribe((state) => {
        set({
          isOnline: state.isOnline,
          syncStatus: state.status,
          pendingCount: state.pendingCount,
          failedCount: state.failedCount,
          lastSyncAt: state.lastSyncAt,
          syncError: state.error,
        })
      })

      // Update auth state based on online status
      const updateAuthState = async () => {
        const { isOnline } = get()
        // We'll consider user authenticated if we have a session
        // This is a simplified check - in reality, useSession hook handles this
        const hasSession = true // Will be updated by handleSessionChange
        const authState = await getOfflineAuthState(isOnline, hasSession)
        set({ authState })
      }

      // Listen for online/offline changes
      if (typeof window !== "undefined") {
        window.addEventListener("online", () => {
          set({ isOnline: true })
          updateAuthState()
        })
        window.addEventListener("offline", () => {
          set({ isOnline: false })
          updateAuthState()
        })
      }

      // Initial auth state
      updateAuthState()

      // Return unsubscribe function for cleanup
      return unsubscribe
    },

    handleSessionChange: async (session) => {
      if (session) {
        // Cache session for offline access
        await cacheSession(session)
        const authState = await getOfflineAuthState(get().isOnline, true)
        set({ authState })
      } else {
        // Clear cached session on logout
        await clearCachedSession()
        set({ authState: "unauthenticated" })
      }
    },
  }))
)

// ============================================================================
// Selectors
// ============================================================================

export const selectIsOnline = (state: OfflineStore) => state.isOnline
export const selectSyncStatus = (state: OfflineStore) => state.syncStatus
export const selectPendingCount = (state: OfflineStore) => state.pendingCount
export const selectFailedCount = (state: OfflineStore) => state.failedCount
export const selectLastSyncAt = (state: OfflineStore) => state.lastSyncAt
export const selectAuthState = (state: OfflineStore) => state.authState
export const selectCanWrite = (state: OfflineStore) =>
  state.authState === "online" || state.authState === "offline_full"
export const selectCanRead = (state: OfflineStore) =>
  state.authState !== "unauthenticated"

// ============================================================================
// Initialize store on client
// ============================================================================

if (typeof window !== "undefined") {
  // Auto-initialize when module loads
  useOfflineStore.getState().initialize()
}
