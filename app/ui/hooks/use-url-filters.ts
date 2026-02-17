"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

/**
 * Filter configuration for a single URL parameter
 */
interface FilterConfig<T> {
  /** Default value when param is not in URL */
  defaultValue: T
  /** Validate and transform the URL param value. Return undefined to use default. */
  parse?: (value: string | null) => T | undefined
  /** Serialize value for URL. Return undefined to omit from URL. */
  serialize?: (value: T) => string | undefined
}

/**
 * Configuration object for all filters
 */
type FiltersConfig<T extends Record<string, unknown>> = {
  [K in keyof T]: FilterConfig<T[K]>
}

/**
 * Return type for the hook
 */
interface UseUrlFiltersReturn<T extends Record<string, unknown>> {
  /** Current filter values */
  filters: T
  /** Set a single filter value */
  setFilter: <K extends keyof T>(key: K, value: T[K]) => void
  /** Set multiple filter values at once */
  setFilters: (updates: Partial<T>) => void
  /** Reset all filters to defaults */
  resetFilters: () => void
  /** Check if any filter differs from default */
  hasActiveFilters: boolean
}

/**
 * useUrlFilters - Manages filter state synchronized with URL search params
 *
 * @example
 * ```tsx
 * const { filters, setFilter } = useUrlFilters({
 *   level: {
 *     defaultValue: "all",
 *     parse: (v) => LEVELS.includes(v as Level) ? v as Level : undefined,
 *     serialize: (v) => v === "all" ? undefined : v,
 *   },
 *   q: {
 *     defaultValue: "",
 *     serialize: (v) => v.trim() || undefined,
 *   },
 * })
 *
 * // filters.level, filters.q are typed
 * // setFilter("level", "college") updates URL to ?level=college
 * ```
 */
export function useUrlFilters<T extends Record<string, unknown>>(
  config: FiltersConfig<T>
): UseUrlFiltersReturn<T> {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Use a ref so the config identity doesn't cause re-renders
  const configRef = useRef(config)
  configRef.current = config

  // Initialize state from URL params
  const getInitialState = useCallback((): T => {
    const cfg = configRef.current
    const result = {} as T
    for (const key in cfg) {
      const { defaultValue, parse } = cfg[key]
      const urlValue = searchParams.get(key)

      if (parse) {
        const parsed = parse(urlValue)
        result[key] = parsed !== undefined ? parsed : defaultValue
      } else if (urlValue !== null) {
        // Simple string assignment for string types
        result[key] = urlValue as T[typeof key]
      } else {
        result[key] = defaultValue
      }
    }
    return result
  }, [searchParams])

  const [filters, setFiltersState] = useState<T>(getInitialState)

  // Update URL when filters change
  const updateUrl = useCallback(
    (newFilters: T) => {
      const cfg = configRef.current
      const params = new URLSearchParams()

      for (const key in cfg) {
        const { defaultValue, serialize } = cfg[key]
        const value = newFilters[key]

        let serialized: string | undefined
        if (serialize) {
          serialized = serialize(value)
        } else if (value !== defaultValue && value !== "" && value !== null) {
          serialized = String(value)
        }

        if (serialized !== undefined) {
          params.set(key, serialized)
        }
      }

      const queryString = params.toString()
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      })
    },
    [pathname, router]
  )

  // Sync state to URL on changes
  useEffect(() => {
    updateUrl(filters)
  }, [filters, updateUrl])

  // Set a single filter
  const setFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }))
  }, [])

  // Set multiple filters at once
  const setFilters = useCallback((updates: Partial<T>) => {
    setFiltersState((prev) => ({ ...prev, ...updates }))
  }, [])

  // Reset all filters to defaults
  const resetFilters = useCallback(() => {
    const cfg = configRef.current
    const defaults = {} as T
    for (const key in cfg) {
      defaults[key] = cfg[key].defaultValue
    }
    setFiltersState(defaults)
  }, [])

  // Check if any filter differs from default
  const hasActiveFilters = Object.keys(configRef.current).some((key) => {
    const k = key as keyof T
    return filters[k] !== configRef.current[k].defaultValue
  })

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    hasActiveFilters,
  }
}

// ============================================================================
// PRESET FILTER CONFIGS
// ============================================================================

/**
 * Simple string filter (empty string = omit from URL)
 */
export function stringFilter(defaultValue = ""): FilterConfig<string> {
  return {
    defaultValue,
    parse: (v) => v ?? undefined,
    serialize: (v) => (v.trim() ? v.trim() : undefined),
  }
}

/**
 * Enum filter with validation
 */
export function enumFilter<T extends string>(
  values: readonly T[],
  defaultValue: T
): FilterConfig<T> {
  return {
    defaultValue,
    parse: (v) => (v && values.includes(v as T) ? (v as T) : undefined),
    serialize: (v) => (v === defaultValue ? undefined : v),
  }
}

/**
 * Tab filter (like enum but commonly used for tab state)
 */
export function tabFilter<T extends string>(
  tabs: readonly T[],
  defaultTab: T
): FilterConfig<T> {
  return enumFilter(tabs, defaultTab)
}
