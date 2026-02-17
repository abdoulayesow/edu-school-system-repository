"use client"

/**
 * PermissionGuard Component
 *
 * Client-side component for conditionally rendering UI based on user permissions.
 * Features refined loading states, caching, and smooth transitions.
 *
 * Usage:
 * ```tsx
 * <PermissionGuard resource="students" action="view">
 *   <StudentsList />
 * </PermissionGuard>
 *
 * <PermissionGuard resource="payment_recording" action="create" fallback={<NoAccess />}>
 *   <CreatePaymentButton />
 * </PermissionGuard>
 *
 * // Check multiple permissions (OR logic)
 * <PermissionGuard
 *   checks={[
 *     { resource: "students", action: "view" },
 *     { resource: "students", action: "update" }
 *   ]}
 * >
 *   <StudentDetails />
 * </PermissionGuard>
 *
 * // Inline mode for wrapping buttons/actions
 * <PermissionGuard resource="payment_recording" action="create" inline>
 *   <Button>Record Payment</Button>
 * </PermissionGuard>
 * ```
 */

import { ReactNode, useEffect, useState, useMemo, useCallback } from "react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useI18n } from "@/components/i18n-provider"
import { LockKeyhole, ShieldAlert } from "lucide-react"

interface PermissionCheck {
  resource: string
  action: string
}

interface PermissionGuardProps {
  // Single permission check
  resource?: string
  action?: string

  // Multiple permission checks (OR logic - if any check passes, content is shown)
  checks?: PermissionCheck[]

  // Content to render if permission is granted
  children: ReactNode

  // Content to render if permission is denied (optional)
  fallback?: ReactNode

  // Loading state content (optional)
  loading?: ReactNode

  // If true, renders inline (span) instead of block (div)
  inline?: boolean

  // If true, shows a subtle disabled state instead of hiding completely
  showDisabled?: boolean

  // Custom class name for the wrapper
  className?: string

  // If true, skips the permission check (useful for conditional guards)
  skip?: boolean
}

// Cache for permission results to avoid redundant API calls
const permissionCache = new Map<string, { granted: boolean; scope?: string; timestamp: number }>()
const CACHE_TTL = 300000 // 5 minute cache (increased from 1 minute)

// SessionStorage key for persistence across page refreshes
const STORAGE_KEY = "permission_cache"

// Load cache from sessionStorage on initialization
function loadCacheFromStorage() {
  if (typeof window === "undefined") return

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      Object.entries(parsed).forEach(([key, value]: [string, any]) => {
        // Only restore if not expired
        if (value.timestamp && Date.now() - value.timestamp < CACHE_TTL) {
          permissionCache.set(key, value)
        }
      })
    }
  } catch (error) {
    console.error("Failed to load permission cache from storage:", error)
  }
}

// Save cache to sessionStorage
function saveCacheToStorage() {
  if (typeof window === "undefined") return

  try {
    const cacheObj: Record<string, any> = {}
    permissionCache.forEach((value, key) => {
      // Only save non-expired entries
      if (Date.now() - value.timestamp < CACHE_TTL) {
        cacheObj[key] = value
      }
    })
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cacheObj))
  } catch (error) {
    console.error("Failed to save permission cache to storage:", error)
  }
}

// Initialize cache from storage
if (typeof window !== "undefined") {
  loadCacheFromStorage()
}

function getCacheKey(checks: PermissionCheck[]): string {
  return checks.map(c => `${c.resource}:${c.action}`).sort().join("|")
}

export function PermissionGuard({
  resource,
  action,
  checks,
  children,
  fallback = null,
  loading,
  inline = false,
  showDisabled = false,
  className,
  skip = false,
}: PermissionGuardProps) {
  const { status } = useSession()
  const { t } = useI18n()
  const [granted, setGranted] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Build checks array once
  const checksToPerform = useMemo(() => {
    if (checks && checks.length > 0) return checks
    if (resource && action) return [{ resource, action }]
    return []
  }, [resource, action, checks])

  const cacheKey = useMemo(() => getCacheKey(checksToPerform), [checksToPerform])

  const checkPermissions = useCallback(async () => {
    if (skip) {
      setGranted(true)
      setIsLoading(false)
      return
    }

    if (checksToPerform.length === 0) {
      console.error("PermissionGuard: Either resource/action or checks must be provided")
      setGranted(false)
      setIsLoading(false)
      return
    }

    // Check cache first
    const cached = permissionCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setGranted(cached.granted)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/permissions/check-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checks: checksToPerform }),
      })

      if (!response.ok) {
        console.error("Failed to check permissions:", await response.text())
        setGranted(false)
        setIsLoading(false)
        return
      }

      const data = await response.json()
      const results = data.results

      // OR logic: if any check passes, grant access
      const anyGranted = results.some((result: { granted: boolean }) => result.granted)

      // Update cache
      permissionCache.set(cacheKey, {
        granted: anyGranted,
        timestamp: Date.now(),
      })

      // Persist to sessionStorage
      saveCacheToStorage()

      setGranted(anyGranted)
      setIsLoading(false)
    } catch (error) {
      console.error("Error checking permissions:", error)
      setGranted(false)
      setIsLoading(false)
    }
  }, [checksToPerform, cacheKey, skip])

  useEffect(() => {
    // Wait for session to be loaded
    if (status === "loading") return

    if (status === "unauthenticated") {
      setGranted(false)
      setIsLoading(false)
      return
    }

    checkPermissions()
  }, [status, checkPermissions])

  // Wrapper element type
  const Wrapper = inline ? "span" : "div"

  // Show loading state
  if (isLoading) {
    if (loading) {
      return <Wrapper className={className}>{loading}</Wrapper>
    }

    // Default subtle loading for inline elements
    if (inline) {
      return (
        <Wrapper className={cn("inline-flex items-center", className)}>
          <Skeleton className="h-9 w-24 rounded-md" />
        </Wrapper>
      )
    }

    // Default loading skeleton
    return (
      <Wrapper className={cn("animate-pulse", className)}>
        <Skeleton className="h-10 w-full rounded-md" />
      </Wrapper>
    )
  }

  // Show content if granted
  if (granted) {
    return <Wrapper className={className}>{children}</Wrapper>
  }

  // Show disabled state if requested
  if (showDisabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Wrapper
              className={cn(
                "relative cursor-not-allowed",
                inline ? "inline-flex" : "block",
                className
              )}
              aria-disabled="true"
            >
              <div className="pointer-events-none opacity-50">{children}</div>
            </Wrapper>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t.permissions?.noAccess || "You don't have permission for this action"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Show fallback or nothing
  return fallback ? <Wrapper className={className}>{fallback}</Wrapper> : null
}

/**
 * NoPermission - A styled component to show when user lacks permission
 */
interface NoPermissionProps {
  resource?: string
  action?: string
  title?: string
  description?: string
  variant?: "card" | "inline" | "banner"
  className?: string
}

export function NoPermission({
  resource,
  action,
  title = "Access Restricted",
  description,
  variant = "card",
  className,
}: NoPermissionProps) {
  const defaultDescription = description ||
    (resource && action
      ? `You don't have permission to ${action} ${resource.replace(/_/g, " ")}.`
      : "You don't have permission to access this content.")

  if (variant === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-sm text-muted-foreground", className)}>
        <LockKeyhole className="h-3.5 w-3.5" />
        <span>{title}</span>
      </span>
    )
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3",
          "dark:border-amber-800/50 dark:bg-amber-950/20",
          className
        )}
      >
        <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-amber-800 dark:text-amber-200">{title}</p>
          <p className="text-sm text-amber-700 dark:text-amber-300/80">{defaultDescription}</p>
        </div>
      </div>
    )
  }

  // Card variant (default)
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed",
        "border-muted-foreground/20 bg-muted/30 px-8 py-12 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4">
        <LockKeyhole className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{defaultDescription}</p>
      </div>
    </div>
  )
}

/**
 * Hook for checking permissions in components.
 *
 * @example
 * ```tsx
 * const { granted, loading } = usePermission("students", "view")
 *
 * if (loading) return <Spinner />
 * if (!granted) return <NoAccess />
 *
 * return <StudentsList />
 * ```
 */
export function usePermission(resource: string, action: string) {
  const { status } = useSession()
  const [granted, setGranted] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [scope, setScope] = useState<string | null>(null)

  const cacheKey = `${resource}:${action}`

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      setGranted(false)
      setLoading(false)
      return
    }

    // Check cache first
    const cached = permissionCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setGranted(cached.granted)
      setScope(cached.scope || null)
      setLoading(false)
      return
    }

    async function checkPermission() {
      try {
        const response = await fetch("/api/permissions/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resource, action }),
        })

        if (!response.ok) {
          console.error("Failed to check permission:", await response.text())
          setGranted(false)
          setLoading(false)
          return
        }

        const data = await response.json()

        // Update cache
        permissionCache.set(cacheKey, {
          granted: data.granted,
          scope: data.scope,
          timestamp: Date.now(),
        })

        // Persist to sessionStorage
        saveCacheToStorage()

        setGranted(data.granted)
        setScope(data.scope || null)
        setLoading(false)
      } catch (error) {
        console.error("Error checking permission:", error)
        setGranted(false)
        setLoading(false)
      }
    }

    checkPermission()
  }, [status, resource, action, cacheKey])

  return { granted, loading, scope }
}

/**
 * Hook for checking multiple permissions at once.
 *
 * @example
 * ```tsx
 * const { results, loading, can } = usePermissions([
 *   { resource: "students", action: "view" },
 *   { resource: "students", action: "update" }
 * ])
 *
 * if (loading) return <Spinner />
 *
 * // Using the can helper
 * if (can("students", "update")) { ... }
 *
 * // Or access results directly
 * const canView = results.find(r => r.action === "view")?.granted
 * ```
 */
export function usePermissions(checks: PermissionCheck[]) {
  const { status } = useSession()
  const [results, setResults] = useState<Array<PermissionCheck & { granted: boolean; scope?: string }>>([])
  const [loading, setLoading] = useState(true)

  const checksKey = useMemo(() => JSON.stringify(checks), [checks])

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      setResults(checks.map((c) => ({ ...c, granted: false })))
      setLoading(false)
      return
    }

    async function checkPermissions() {
      try {
        const response = await fetch("/api/permissions/check-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checks }),
        })

        if (!response.ok) {
          console.error("Failed to check permissions:", await response.text())
          setResults(checks.map((c) => ({ ...c, granted: false })))
          setLoading(false)
          return
        }

        const data = await response.json()
        setResults(data.results)
        setLoading(false)
      } catch (error) {
        console.error("Error checking permissions:", error)
        setResults(checks.map((c) => ({ ...c, granted: false })))
        setLoading(false)
      }
    }

    checkPermissions()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, checksKey])

  // Helper to check if a specific permission was granted
  const can = useCallback(
    (resource: string, action: string) => {
      const result = results.find((r) => r.resource === resource && r.action === action)
      return result?.granted ?? false
    },
    [results]
  )

  return { results, loading, can }
}

/**
 * Clear the permission cache - useful after role changes or logout
 */
export function clearPermissionCache() {
  permissionCache.clear()
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}

/**
 * Preload common permissions to warm the cache
 * Call this after login or on app initialization
 */
export async function preloadPermissions(checks: PermissionCheck[]) {
  if (checks.length === 0) return

  try {
    const response = await fetch("/api/permissions/check-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checks }),
    })

    if (!response.ok) {
      console.error("Failed to preload permissions:", await response.text())
      return
    }

    const data = await response.json()
    const results = data.results

    // Update cache with all results
    results.forEach((result: PermissionCheck & { granted: boolean; scope?: string }) => {
      const key = `${result.resource}:${result.action}`
      permissionCache.set(key, {
        granted: result.granted,
        scope: result.scope,
        timestamp: Date.now(),
      })
    })

    // Persist to sessionStorage
    saveCacheToStorage()
  } catch (error) {
    console.error("Error preloading permissions:", error)
  }
}
