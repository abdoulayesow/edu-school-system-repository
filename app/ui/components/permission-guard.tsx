"use client"

/**
 * PermissionGuard Component
 *
 * Client-side component for conditionally rendering UI based on user permissions.
 *
 * Usage:
 * ```tsx
 * <PermissionGuard resource="students" action="view">
 *   <StudentsList />
 * </PermissionGuard>
 *
 * <PermissionGuard resource="payments" action="create" fallback={<NoAccess />}>
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
 * ```
 */

import { ReactNode, useEffect, useState } from "react"
import { useSession } from "next-auth/react"

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
}

export function PermissionGuard({
  resource,
  action,
  checks,
  children,
  fallback = null,
  loading = null,
}: PermissionGuardProps) {
  const { status } = useSession()
  const [granted, setGranted] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Wait for session to be loaded
    if (status === "loading") {
      return
    }

    if (status === "unauthenticated") {
      setGranted(false)
      setIsLoading(false)
      return
    }

    // Build checks array
    let checksToPerform: PermissionCheck[]

    if (checks && checks.length > 0) {
      checksToPerform = checks
    } else if (resource && action) {
      checksToPerform = [{ resource, action }]
    } else {
      console.error("PermissionGuard: Either resource/action or checks must be provided")
      setGranted(false)
      setIsLoading(false)
      return
    }

    // Perform permission check
    async function checkPermissions() {
      try {
        const response = await fetch("/api/permissions/check-batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
        const anyGranted = results.some((result: any) => result.granted)
        setGranted(anyGranted)
        setIsLoading(false)
      } catch (error) {
        console.error("Error checking permissions:", error)
        setGranted(false)
        setIsLoading(false)
      }
    }

    checkPermissions()
  }, [status, resource, action, checks])

  // Show loading state
  if (isLoading) {
    return <>{loading}</>
  }

  // Show content if granted, otherwise show fallback
  return <>{granted ? children : fallback}</>
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

  useEffect(() => {
    if (status === "loading") {
      return
    }

    if (status === "unauthenticated") {
      setGranted(false)
      setLoading(false)
      return
    }

    async function checkPermission() {
      try {
        const response = await fetch("/api/permissions/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resource, action }),
        })

        if (!response.ok) {
          console.error("Failed to check permission:", await response.text())
          setGranted(false)
          setLoading(false)
          return
        }

        const data = await response.json()
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
  }, [status, resource, action])

  return { granted, loading, scope }
}

/**
 * Hook for checking multiple permissions at once.
 *
 * @example
 * ```tsx
 * const { results, loading } = usePermissions([
 *   { resource: "students", action: "view" },
 *   { resource: "students", action: "update" }
 * ])
 *
 * if (loading) return <Spinner />
 *
 * const canView = results.find(r => r.action === "view")?.granted
 * const canUpdate = results.find(r => r.action === "update")?.granted
 * ```
 */
export function usePermissions(checks: PermissionCheck[]) {
  const { status } = useSession()
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") {
      return
    }

    if (status === "unauthenticated") {
      setResults(checks.map((c) => ({ ...c, granted: false })))
      setLoading(false)
      return
    }

    async function checkPermissions() {
      try {
        const response = await fetch("/api/permissions/check-batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
  }, [status, JSON.stringify(checks)])

  return { results, loading }
}
