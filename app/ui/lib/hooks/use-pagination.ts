"use client"

import { useState, useCallback } from "react"

export interface PaginationState {
  offset: number
  limit: number
}

export interface UsePaginationOptions {
  /** Initial items per page (default: 50) */
  initialLimit?: number
  /** Initial offset (default: 0) */
  initialOffset?: number
  /** Callback when pagination changes */
  onPaginationChange?: (state: PaginationState) => void
}

export interface UsePaginationReturn {
  /** Current offset */
  offset: number
  /** Current limit (items per page) */
  limit: number
  /** Go to next page (requires hasMore from API response) */
  goToNextPage: (hasMore: boolean) => void
  /** Go to previous page */
  goToPrevPage: () => void
  /** Go to specific page (0-indexed) */
  goToPage: (page: number) => void
  /** Change items per page */
  setLimit: (newLimit: number) => void
  /** Reset pagination to first page */
  reset: () => void
  /** Check if on first page */
  isFirstPage: boolean
}

/**
 * Hook for managing pagination state consistently across pages.
 *
 * @example
 * const { offset, limit, goToNextPage, goToPrevPage, reset } = usePagination({
 *   initialLimit: 50,
 * })
 *
 * // Reset when filters change
 * useEffect(() => {
 *   reset()
 * }, [searchQuery, statusFilter])
 *
 * // Use with API
 * const { data } = useClubs({ limit, offset })
 *
 * // In pagination controls
 * <button onClick={goToPrevPage} disabled={isFirstPage}>Prev</button>
 * <button onClick={() => goToNextPage(data?.pagination?.hasMore)}>Next</button>
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    initialLimit = 50,
    initialOffset = 0,
    onPaginationChange,
  } = options

  const [offset, setOffset] = useState(initialOffset)
  const [limit, setLimitState] = useState(initialLimit)

  const goToNextPage = useCallback((hasMore: boolean) => {
    if (hasMore) {
      const newOffset = offset + limit
      setOffset(newOffset)
      onPaginationChange?.({ offset: newOffset, limit })
    }
  }, [offset, limit, onPaginationChange])

  const goToPrevPage = useCallback(() => {
    if (offset > 0) {
      const newOffset = Math.max(0, offset - limit)
      setOffset(newOffset)
      onPaginationChange?.({ offset: newOffset, limit })
    }
  }, [offset, limit, onPaginationChange])

  const goToPage = useCallback((page: number) => {
    const newOffset = page * limit
    setOffset(newOffset)
    onPaginationChange?.({ offset: newOffset, limit })
  }, [limit, onPaginationChange])

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit)
    setOffset(0) // Reset to first page when limit changes
    onPaginationChange?.({ offset: 0, limit: newLimit })
  }, [onPaginationChange])

  const reset = useCallback(() => {
    setOffset(initialOffset)
    onPaginationChange?.({ offset: initialOffset, limit })
  }, [initialOffset, limit, onPaginationChange])

  return {
    offset,
    limit,
    goToNextPage,
    goToPrevPage,
    goToPage,
    setLimit,
    reset,
    isFirstPage: offset === 0,
  }
}
