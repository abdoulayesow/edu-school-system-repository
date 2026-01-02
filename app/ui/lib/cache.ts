import { NextResponse } from "next/server"

/**
 * Cache profiles for HTTP Cache-Control headers
 * Use these to add caching to API routes based on data characteristics
 */
export const CacheProfiles = {
  /**
   * Reference data that rarely changes (subjects, grade metadata)
   * 1 day fresh, 7 days stale acceptable
   */
  STATIC_REFERENCE: {
    "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
  },

  /**
   * Semi-static data (grades list, school years, timetable)
   * 1 hour fresh, 1 day stale acceptable
   */
  SEMI_STATIC: {
    "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
  },

  /**
   * Dashboard statistics and aggregations
   * 1 minute fresh, 5 minutes stale acceptable
   */
  STATISTICS: {
    "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
  },

  /**
   * Dynamic data with short cache
   * 30 seconds fresh, 1 minute stale acceptable
   */
  DYNAMIC: {
    "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
  },

  /**
   * No cache - for mutations, user-specific data, real-time data
   */
  NO_CACHE: {
    "Cache-Control": "no-store, no-cache, must-revalidate",
  },
} as const

export type CacheProfile = keyof typeof CacheProfiles

/**
 * Apply cache headers to a NextResponse
 * @param response - The NextResponse to add headers to
 * @param profile - The cache profile to use
 * @returns The response with cache headers applied
 */
export function withCache(
  response: NextResponse,
  profile: CacheProfile
): NextResponse {
  const headers = CacheProfiles[profile]
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

/**
 * Create a cached JSON response
 * @param data - The data to return as JSON
 * @param profile - The cache profile to use
 * @returns A NextResponse with cache headers
 */
export function cachedJson<T>(data: T, profile: CacheProfile): NextResponse {
  const response = NextResponse.json(data)
  return withCache(response, profile)
}

/**
 * Simple in-memory cache with TTL for expensive server-side computations
 * Use sparingly - only for truly expensive aggregations
 */
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class SimpleMemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>()

  /**
   * Get a cached value
   * @returns The cached value or null if not found/expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    return entry.data
  }

  /**
   * Set a cached value with TTL
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttlMs - Time to live in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    })
  }

  /**
   * Invalidate all cache entries matching a prefix
   * @param keyPrefix - Prefix to match
   */
  invalidate(keyPrefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear()
  }
}

export const memoryCache = new SimpleMemoryCache()

/**
 * TTL constants for common cache durations (in milliseconds)
 */
export const TTL = {
  /** 1 minute - for frequently changing statistics */
  STATISTICS: 60 * 1000,
  /** 5 minutes - for moderately changing aggregates */
  AGGREGATES: 5 * 60 * 1000,
  /** 1 hour - for reference data */
  REFERENCE: 60 * 60 * 1000,
  /** 24 hours - for rarely changing data */
  DAILY: 24 * 60 * 60 * 1000,
} as const
