import {
  offlineDb,
  type SyncQueueItem,
  type SyncOperation,
} from "@/lib/db/offline"

// ============================================================================
// Retry Configuration
// ============================================================================

const RETRY_DELAYS = [2000, 5000, 15000, 60000, 300000] // 2s, 5s, 15s, 1min, 5min
const MAX_RETRIES = 5

// ============================================================================
// Queue Operations
// ============================================================================

/**
 * Add an operation to the sync queue
 */
export async function queueOperation(
  operation: SyncOperation,
  entity: SyncQueueItem["entity"],
  entityId: string,
  payload: Record<string, unknown>
): Promise<number> {
  const item: Omit<SyncQueueItem, "id"> = {
    operation,
    entity,
    entityId,
    payload,
    createdAt: Date.now(),
    attempts: 0,
    status: "pending",
  }

  return offlineDb.syncQueue.add(item as SyncQueueItem)
}

/**
 * Get all pending items from the queue
 */
export async function getPendingItems(): Promise<SyncQueueItem[]> {
  return offlineDb.syncQueue.where("status").equals("pending").toArray()
}

/**
 * Get items ready for retry (pending and enough time has passed)
 */
export async function getItemsReadyForSync(): Promise<SyncQueueItem[]> {
  const pending = await getPendingItems()
  const now = Date.now()

  return pending.filter((item) => {
    if (item.attempts === 0) return true
    if (item.attempts >= MAX_RETRIES) return false

    const delay = RETRY_DELAYS[Math.min(item.attempts - 1, RETRY_DELAYS.length - 1)]
    const nextRetryTime = (item.lastAttemptAt || 0) + delay

    return now >= nextRetryTime
  })
}

/**
 * Mark an item as processing
 */
export async function markAsProcessing(id: number): Promise<void> {
  await offlineDb.syncQueue.update(id, { status: "processing" })
}

/**
 * Mark an item as successfully synced and remove from queue
 */
export async function markAsSynced(id: number): Promise<void> {
  await offlineDb.syncQueue.delete(id)
}

/**
 * Mark an item as failed and update retry info
 */
export async function markAsFailed(
  id: number,
  error: string
): Promise<void> {
  const item = await offlineDb.syncQueue.get(id)
  if (!item) return

  const newAttempts = item.attempts + 1
  const status = newAttempts >= MAX_RETRIES ? "failed" : "pending"

  await offlineDb.syncQueue.update(id, {
    status,
    attempts: newAttempts,
    lastAttemptAt: Date.now(),
    lastError: error,
  })
}

/**
 * Get count of pending items
 */
export async function getPendingCount(): Promise<number> {
  return offlineDb.syncQueue.where("status").equals("pending").count()
}

/**
 * Get count of failed items
 */
export async function getFailedCount(): Promise<number> {
  return offlineDb.syncQueue.where("status").equals("failed").count()
}

/**
 * Retry a failed item
 */
export async function retryFailedItem(id: number): Promise<void> {
  await offlineDb.syncQueue.update(id, {
    status: "pending",
    attempts: 0,
    lastError: undefined,
    lastAttemptAt: undefined,
  })
}

/**
 * Remove a failed item from the queue (discard)
 */
export async function discardFailedItem(id: number): Promise<void> {
  await offlineDb.syncQueue.delete(id)
}

/**
 * Clear all pending operations for a specific entity
 */
export async function clearEntityOperations(
  entity: SyncQueueItem["entity"],
  entityId: string
): Promise<void> {
  await offlineDb.syncQueue
    .where({ entity, entityId })
    .delete()
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  pending: number
  processing: number
  failed: number
  total: number
}> {
  const all = await offlineDb.syncQueue.toArray()

  return {
    pending: all.filter((i) => i.status === "pending").length,
    processing: all.filter((i) => i.status === "processing").length,
    failed: all.filter((i) => i.status === "failed").length,
    total: all.length,
  }
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Get a batch of items for processing (max 10 at a time)
 */
export async function getNextBatch(batchSize: number = 10): Promise<SyncQueueItem[]> {
  const ready = await getItemsReadyForSync()
  return ready.slice(0, batchSize)
}

/**
 * Process batch results - update queue based on sync response
 */
export async function processBatchResults(
  results: Array<{
    id: number
    success: boolean
    error?: string
    serverData?: Record<string, unknown>
  }>
): Promise<void> {
  await offlineDb.transaction("rw", offlineDb.syncQueue, async () => {
    for (const result of results) {
      if (result.success) {
        await markAsSynced(result.id)
      } else {
        await markAsFailed(result.id, result.error || "Unknown error")
      }
    }
  })
}
