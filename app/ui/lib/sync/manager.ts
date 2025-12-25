import { offlineDb, type SyncConflict } from "@/lib/db/offline"
import {
  getNextBatch,
  markAsProcessing,
  markAsSynced,
  markAsFailed,
  getPendingCount,
} from "./queue"

// ============================================================================
// Types
// ============================================================================

export type SyncStatus = "idle" | "syncing" | "error" | "offline"

export interface SyncState {
  status: SyncStatus
  lastSyncAt: Date | null
  pendingCount: number
  failedCount: number
  isOnline: boolean
  error: string | null
}

export interface SyncResult {
  success: boolean
  synced: number
  failed: number
  conflicts: number
  error?: string
}

type SyncEventCallback = (state: SyncState) => void

// ============================================================================
// Sync Manager Class
// ============================================================================

class SyncManager {
  private state: SyncState = {
    status: "idle",
    lastSyncAt: null,
    pendingCount: 0,
    failedCount: 0,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    error: null,
  }

  private listeners: Set<SyncEventCallback> = new Set()
  private syncInterval: ReturnType<typeof setInterval> | null = null
  private isSyncing = false

  // ============================================================================
  // Initialization
  // ============================================================================

  async initialize(): Promise<void> {
    // Update online status
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline)
      window.addEventListener("offline", this.handleOffline)

      // Listen for service worker sync messages
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data?.type === "SYNC_REQUESTED") {
            this.sync()
          }
        })
      }
    }

    // Update pending count
    await this.updateCounts()

    // Start periodic sync (every 30 seconds when online)
    this.startPeriodicSync()
  }

  destroy(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.handleOnline)
      window.removeEventListener("offline", this.handleOffline)
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  private handleOnline = async (): Promise<void> => {
    this.updateState({ isOnline: true, status: "idle" })

    // Verify connectivity with health check
    const isReallyOnline = await this.checkConnectivity()
    if (isReallyOnline) {
      // Trigger sync
      this.sync()
    }
  }

  private handleOffline = (): void => {
    this.updateState({ isOnline: false, status: "offline" })
  }

  // ============================================================================
  // Connectivity Check
  // ============================================================================

  async checkConnectivity(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)

      const response = await fetch("/api/health", {
        method: "HEAD",
        signal: controller.signal,
        cache: "no-store",
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch {
      return false
    }
  }

  // ============================================================================
  // Sync Logic
  // ============================================================================

  async sync(): Promise<SyncResult> {
    // Prevent concurrent syncs
    if (this.isSyncing) {
      return { success: false, synced: 0, failed: 0, conflicts: 0, error: "Sync in progress" }
    }

    // Check if online
    if (!this.state.isOnline) {
      return { success: false, synced: 0, failed: 0, conflicts: 0, error: "Offline" }
    }

    this.isSyncing = true
    this.updateState({ status: "syncing", error: null })

    let synced = 0
    let failed = 0
    let conflicts = 0

    try {
      // Get pending operations
      const batch = await getNextBatch(10)

      if (batch.length === 0) {
        this.updateState({ status: "idle", lastSyncAt: new Date() })
        return { success: true, synced: 0, failed: 0, conflicts: 0 }
      }

      // Mark as processing
      for (const item of batch) {
        if (item.id) {
          await markAsProcessing(item.id)
        }
      }

      // Get last sync timestamp
      const syncMeta = await offlineDb.syncMetadata.get("lastSync")
      const lastSyncTimestamp = syncMeta?.lastSyncAt
        ? new Date(syncMeta.lastSyncAt).toISOString()
        : undefined

      // Send to server
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lastSyncTimestamp,
          operations: batch.map((item) => ({
            id: item.id,
            operation: item.operation,
            entity: item.entity,
            entityId: item.entityId,
            payload: item.payload,
            createdAt: item.createdAt,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      const result = await response.json()

      // Process results
      for (const opResult of result.results) {
        if (opResult.success) {
          await markAsSynced(opResult.id)
          synced++

          // Update local record with server ID if needed
          const originalOp = batch.find((b) => b.id === opResult.id)
          if (originalOp && opResult.serverId) {
            await this.updateLocalWithServerId(
              originalOp.entity,
              originalOp.entityId,
              opResult.serverId
            )
          }
        } else {
          await markAsFailed(opResult.id, opResult.error || "Unknown error")
          failed++
        }
      }

      // Handle conflicts (auto-resolve with server version)
      if (result.conflicts && result.conflicts.length > 0) {
        for (const conflict of result.conflicts) {
          await this.resolveConflict(conflict, "server_wins")
          conflicts++
        }
      }

      // Apply remote changes
      if (result.remoteChanges && result.remoteChanges.length > 0) {
        await this.applyRemoteChanges(result.remoteChanges)
      }

      // Update sync metadata
      await offlineDb.syncMetadata.put({
        id: "lastSync",
        lastSyncAt: Date.now(),
        lastServerTimestamp: result.syncTimestamp,
      })

      await this.updateCounts()
      this.updateState({ status: "idle", lastSyncAt: new Date() })

      return { success: true, synced, failed, conflicts }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sync failed"
      this.updateState({ status: "error", error: errorMessage })
      return { success: false, synced, failed, conflicts, error: errorMessage }
    } finally {
      this.isSyncing = false
    }
  }

  // ============================================================================
  // Conflict Resolution
  // ============================================================================

  private async resolveConflict(
    conflict: {
      operationId: number
      entity: string
      entityId: string
      localValue: Record<string, unknown>
      serverValue: Record<string, unknown>
    },
    resolution: "server_wins" | "local_wins"
  ): Promise<void> {
    // Log the conflict
    await offlineDb.syncConflicts.add({
      entity: conflict.entity,
      entityId: conflict.entityId,
      localValue: conflict.localValue,
      serverValue: conflict.serverValue,
      resolvedAt: Date.now(),
      resolution,
    } as SyncConflict)

    if (resolution === "server_wins") {
      // Update local record with server values
      await this.updateLocalWithServerData(
        conflict.entity as "student" | "attendance" | "user",
        conflict.entityId,
        conflict.serverValue
      )
    }
    // If local_wins, we'd re-queue the operation (not implemented in auto-resolve)
  }

  // ============================================================================
  // Local Database Updates
  // ============================================================================

  private async updateLocalWithServerId(
    entity: string,
    localId: string,
    serverId: string
  ): Promise<void> {
    switch (entity) {
      case "student":
        await offlineDb.students.update(localId, {
          serverId,
          syncStatus: "synced",
          serverUpdatedAt: Date.now(),
        })
        break
      case "attendance":
        await offlineDb.attendance.update(localId, {
          serverId,
          syncStatus: "synced",
          serverUpdatedAt: Date.now(),
        })
        break
      case "user":
        await offlineDb.users.update(localId, {
          serverId,
          syncStatus: "synced",
          serverUpdatedAt: Date.now(),
        })
        break
    }
  }

  private async updateLocalWithServerData(
    entity: "student" | "attendance" | "user",
    entityId: string,
    serverData: Record<string, unknown>
  ): Promise<void> {
    const updateData = {
      ...serverData,
      syncStatus: "synced" as const,
      serverUpdatedAt: Date.now(),
    }

    switch (entity) {
      case "student":
        await offlineDb.students.update(entityId, updateData)
        break
      case "attendance":
        await offlineDb.attendance.update(entityId, updateData)
        break
      case "user":
        await offlineDb.users.update(entityId, updateData)
        break
    }
  }

  private async applyRemoteChanges(
    changes: Array<{
      entity: string
      id: string
      data: Record<string, unknown>
      operation: "created" | "updated" | "deleted"
      updatedAt: string
    }>
  ): Promise<void> {
    for (const change of changes) {
      const table = this.getTable(change.entity)
      if (!table) continue

      switch (change.operation) {
        case "created":
        case "updated":
          await table.put({
            ...change.data,
            id: change.id,
            serverId: change.id,
            syncStatus: "synced",
            localUpdatedAt: Date.now(),
            serverUpdatedAt: new Date(change.updatedAt).getTime(),
            version: 1,
          })
          break
        case "deleted":
          await table.delete(change.id)
          break
      }
    }
  }

  private getTable(entity: string) {
    switch (entity) {
      case "student":
        return offlineDb.students
      case "attendance":
        return offlineDb.attendance
      case "user":
        return offlineDb.users
      default:
        return null
    }
  }

  // ============================================================================
  // State Management
  // ============================================================================

  private async updateCounts(): Promise<void> {
    const pendingCount = await getPendingCount()
    const failedCount = await offlineDb.syncQueue
      .where("status")
      .equals("failed")
      .count()

    this.updateState({ pendingCount, failedCount })
  }

  private updateState(partial: Partial<SyncState>): void {
    this.state = { ...this.state, ...partial }
    this.notifyListeners()
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.state)
    }
  }

  // ============================================================================
  // Public API
  // ============================================================================

  getState(): SyncState {
    return { ...this.state }
  }

  subscribe(callback: SyncEventCallback): () => void {
    this.listeners.add(callback)
    // Immediately notify with current state
    callback(this.state)

    return () => {
      this.listeners.delete(callback)
    }
  }

  private startPeriodicSync(): void {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.state.isOnline && !this.isSyncing) {
        this.sync()
      }
    }, 30000)
  }

  // Manual sync trigger
  async triggerSync(): Promise<SyncResult> {
    return this.sync()
  }

  // Request background sync via service worker
  async requestBackgroundSync(): Promise<void> {
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        await (registration as any).sync.register("offline-sync")
      } catch (error) {
        console.warn("Background sync registration failed:", error)
      }
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const syncManager = new SyncManager()

// Auto-initialize when module loads (client-side only)
if (typeof window !== "undefined") {
  syncManager.initialize()
}
