"use client"

import { useLiveQuery } from "dexie-react-hooks"
import { useState, useEffect, useCallback } from "react"
import {
  offlineDb,
  type LocalStudent,
  type LocalAttendance,
  type LocalUser,
} from "@/lib/db/offline"
import { useOnlineStatus } from "./useOnlineStatus"
import { useOfflineStore } from "@/lib/stores/offline-store"

// ============================================================================
// Types
// ============================================================================

interface QueryState<T> {
  data: T | undefined
  isLoading: boolean
  error: Error | null
  isStale: boolean
}

interface SyncedQueryOptions {
  fetchOnline?: boolean
  cacheFirst?: boolean
  staleTime?: number // ms
}

// ============================================================================
// useStudents Hook
// ============================================================================

export function useStudents(filters?: {
  status?: LocalStudent["status"]
  grade?: string
  classId?: string
}) {
  const data = useLiveQuery(async () => {
    let query = offlineDb.students.toCollection()

    if (filters?.status) {
      query = offlineDb.students.where("status").equals(filters.status)
    }

    const students = await query.toArray()

    // Apply additional filters
    return students.filter((s) => {
      if (filters?.grade && s.grade !== filters.grade) return false
      if (filters?.classId && s.classId !== filters.classId) return false
      return true
    })
  }, [filters?.status, filters?.grade, filters?.classId])

  return {
    students: data ?? [],
    isLoading: data === undefined,
  }
}

// ============================================================================
// useStudent Hook (single student)
// ============================================================================

export function useStudent(id: string | undefined) {
  const data = useLiveQuery(
    async () => {
      if (!id) return undefined
      return offlineDb.students.get(id)
    },
    [id]
  )

  return {
    student: data,
    isLoading: data === undefined && id !== undefined,
  }
}

// ============================================================================
// useAttendance Hook
// ============================================================================

export function useAttendance(date: string) {
  const data = useLiveQuery(
    async () => {
      return offlineDb.attendance.where("date").equals(date).toArray()
    },
    [date]
  )

  return {
    attendance: data ?? [],
    isLoading: data === undefined,
  }
}

// ============================================================================
// useStudentAttendance Hook
// ============================================================================

export function useStudentAttendance(studentId: string, date: string) {
  const data = useLiveQuery(
    async () => {
      return offlineDb.attendance
        .where("[studentId+date]")
        .equals([studentId, date])
        .first()
    },
    [studentId, date]
  )

  return {
    attendance: data,
    isLoading: data === undefined,
  }
}

// ============================================================================
// useSyncStatus Hook
// ============================================================================

export function useSyncStatus() {
  const pendingCount = useLiveQuery(async () => {
    return offlineDb.syncQueue.where("status").equals("pending").count()
  })

  const failedCount = useLiveQuery(async () => {
    return offlineDb.syncQueue.where("status").equals("failed").count()
  })

  const lastSync = useLiveQuery(async () => {
    const meta = await offlineDb.syncMetadata.get("lastSync")
    return meta?.lastSyncAt ? new Date(meta.lastSyncAt) : null
  })

  return {
    pendingCount: pendingCount ?? 0,
    failedCount: failedCount ?? 0,
    lastSync: lastSync ?? null,
    isLoading: pendingCount === undefined,
  }
}

// ============================================================================
// usePendingOperations Hook
// ============================================================================

export function usePendingOperations() {
  const operations = useLiveQuery(async () => {
    return offlineDb.syncQueue.toArray()
  })

  return {
    operations: operations ?? [],
    pending: operations?.filter((op) => op.status === "pending") ?? [],
    failed: operations?.filter((op) => op.status === "failed") ?? [],
    isLoading: operations === undefined,
  }
}

// ============================================================================
// useCachedUser Hook
// ============================================================================

export function useCachedUser(userId: string | undefined) {
  const data = useLiveQuery(
    async () => {
      if (!userId) return undefined
      return offlineDb.users.get(userId)
    },
    [userId]
  )

  return {
    user: data,
    isLoading: data === undefined && userId !== undefined,
  }
}

// ============================================================================
// useOfflineData Hook (generic with server fallback)
// ============================================================================

export function useOfflineData<T>(
  localQuery: () => Promise<T>,
  serverEndpoint: string,
  options: SyncedQueryOptions = {}
): QueryState<T> & { refetch: () => Promise<void> } {
  const { fetchOnline = true, cacheFirst = true, staleTime = 60000 } = options
  const { isOnline } = useOnlineStatus()
  const [serverData, setServerData] = useState<T | undefined>()
  const [error, setError] = useState<Error | null>(null)
  const [isStale, setIsStale] = useState(false)
  const [lastFetch, setLastFetch] = useState<number>(0)

  // Get local data reactively
  const localData = useLiveQuery(localQuery)

  // Fetch from server
  const fetchFromServer = useCallback(async () => {
    if (!isOnline || !fetchOnline) return

    try {
      const response = await fetch(serverEndpoint)
      if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`)

      const data = await response.json()
      setServerData(data)
      setError(null)
      setLastFetch(Date.now())
      setIsStale(false)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Fetch failed"))
    }
  }, [isOnline, fetchOnline, serverEndpoint])

  // Check staleness
  useEffect(() => {
    if (lastFetch && Date.now() - lastFetch > staleTime) {
      setIsStale(true)
    }
  }, [lastFetch, staleTime])

  // Fetch on mount and when coming online
  useEffect(() => {
    if (isOnline && (!cacheFirst || !localData)) {
      fetchFromServer()
    }
  }, [isOnline, cacheFirst, localData, fetchFromServer])

  // Determine which data to return
  const data = cacheFirst ? (localData ?? serverData) : (serverData ?? localData)

  return {
    data,
    isLoading: localData === undefined && serverData === undefined,
    error,
    isStale,
    refetch: fetchFromServer,
  }
}

// ============================================================================
// useOfflineWrite Hook
// ============================================================================

export function useOfflineWrite() {
  const { isOnline } = useOnlineStatus()
  const canWrite = useOfflineStore((state) =>
    state.authState === "online" || state.authState === "offline_full"
  )
  const triggerSync = useOfflineStore((state) => state.triggerSync)

  const writeAndSync = useCallback(
    async <T>(
      writeOperation: () => Promise<T>,
      options?: { syncImmediately?: boolean }
    ): Promise<T> => {
      if (!canWrite) {
        throw new Error("Cannot write: session expired or read-only mode")
      }

      const result = await writeOperation()

      // Sync immediately if online and requested
      if (isOnline && options?.syncImmediately) {
        triggerSync()
      }

      return result
    },
    [canWrite, isOnline, triggerSync]
  )

  return {
    write: writeAndSync,
    canWrite,
    isOnline,
  }
}
