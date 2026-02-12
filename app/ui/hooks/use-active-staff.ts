"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export interface StaffMember {
  id: string
  name: string | null
  email: string
  staffRole: string | null
}

/**
 * Shared hook for loading active staff list from the roles API.
 * Used in hours-tab and advances-tab create dialogs.
 */
export function useActiveStaffList() {
  const { toast } = useToast()
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStaff = useCallback(async () => {
    if (staffList.length > 0) return // already loaded

    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/users/roles")
      if (res.ok) {
        const users = await res.json()
        setStaffList(
          users.filter((u: { status: string }) => u.status === "active")
        )
      } else {
        const errMsg = "Failed to load staff list"
        setError(errMsg)
        toast({ title: "Error", description: errMsg, variant: "destructive" })
      }
    } catch {
      const errMsg = "Failed to load staff list"
      setError(errMsg)
      toast({ title: "Error", description: errMsg, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [staffList.length, toast])

  return { staffList, isLoading, error, loadStaff }
}
