"use client"

import { useState, useEffect, useCallback } from "react"

export interface PaymentFilters {
  status: string
  method: string
  paymentType: string
  grade: string
  balanceStatus: string
  startDate: string
  endDate: string
  search: string
}

const defaultFilters: PaymentFilters = {
  status: "all",
  method: "all",
  paymentType: "all",
  grade: "all",
  balanceStatus: "all",
  startDate: "",
  endDate: "",
  search: "",
}

export function usePaymentFilters() {
  const [filters, setFilters] = useState<PaymentFilters>(defaultFilters)

  const updateFilter = useCallback(<K extends keyof PaymentFilters>(
    key: K,
    value: PaymentFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const setQuickDateRange = useCallback((range: "today" | "week" | "month" | "all") => {
    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]

    switch (range) {
      case "today":
        setFilters(prev => ({
          ...prev,
          startDate: todayStr,
          endDate: todayStr,
        }))
        break
      case "week":
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        setFilters(prev => ({
          ...prev,
          startDate: weekAgo.toISOString().split("T")[0],
          endDate: todayStr,
        }))
        break
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        setFilters(prev => ({
          ...prev,
          startDate: monthStart.toISOString().split("T")[0],
          endDate: todayStr,
        }))
        break
      case "all":
        setFilters(prev => ({
          ...prev,
          startDate: "",
          endDate: "",
        }))
        break
    }
  }, [])

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "search") return value.length > 0
    return value !== "" && value !== "all"
  }).length

  const hasActiveFilters = activeFilterCount > 0

  return {
    filters,
    updateFilter,
    clearFilters,
    setQuickDateRange,
    activeFilterCount,
    hasActiveFilters,
  }
}
