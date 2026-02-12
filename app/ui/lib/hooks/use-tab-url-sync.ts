"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"

/**
 * Custom hook to sync tab state with URL query parameters.
 * Handles bidirectional sync between React state and URL.
 *
 * @param paramName - The query parameter name (e.g., 'tab')
 * @param defaultValue - Default tab value when param is not in URL
 * @returns Tuple of [currentTab, setTab] similar to useState
 */
export function useTabUrlSync(paramName: string, defaultValue: string) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTabInternal] = useState(searchParams.get(paramName) || defaultValue)

  const setTab = useCallback((value: string) => {
    setTabInternal(value)
    const params = new URLSearchParams(searchParams.toString())
    params.set(paramName, value)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams, paramName])

  return [tab, setTab] as const
}
