"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/components/i18n-provider"

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
  const { t } = useI18n()
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStaff = useCallback(async () => {
    if (staffList.length > 0) return // already loaded

    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/salary-hours/staff")
      if (res.ok) {
        const users = await res.json()
        setStaffList(users)
      } else {
        setError(t.common.errorFetchingData)
        toast({ title: t.common.error, description: t.common.errorFetchingData, variant: "destructive" })
      }
    } catch {
      setError(t.common.errorFetchingData)
      toast({ title: t.common.error, description: t.common.errorFetchingData, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [staffList.length, toast, t])

  return { staffList, isLoading, error, loadStaff }
}
