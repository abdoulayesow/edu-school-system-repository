"use client"

import { useState, useCallback } from "react"
import { useI18n } from "@/components/i18n-provider"
import { toast } from "@/hooks/use-toast"

interface UseCalculationOptions {
  trimesterId: string | undefined
  onSuccess?: () => void | Promise<void>
  showProgress?: boolean
}

export function useCalculation({ trimesterId, onSuccess, showProgress }: UseCalculationOptions) {
  const { t } = useI18n()
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationProgress, setCalculationProgress] = useState<string | null>(null)

  const handleCalculateAll = useCallback(async () => {
    if (!trimesterId) return

    setIsCalculating(true)

    try {
      // Step 1: Calculate subject averages
      if (showProgress) {
        setCalculationProgress(t.grading.calculatingSubjectAverages)
      }

      const avgRes = await fetch("/api/evaluations/calculate-averages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trimesterId }),
      })

      if (!avgRes.ok) {
        const data = await avgRes.json().catch(() => ({}))
        throw new Error(data.message || "Failed to calculate averages")
      }

      // Step 2: Calculate student summaries
      if (showProgress) {
        setCalculationProgress(t.grading.calculatingStudentSummaries)
      }

      const summaryRes = await fetch("/api/evaluations/student-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trimesterId }),
      })

      if (!summaryRes.ok) {
        const data = await summaryRes.json().catch(() => ({}))
        throw new Error(data.message || "Failed to calculate summaries")
      }

      const summaryData = await summaryRes.json().catch(() => ({}))
      const studentsProcessed = summaryData.studentsProcessed

      toast({
        title: t.common.success,
        description: studentsProcessed
          ? `${t.grading.calculationComplete}: ${studentsProcessed} ${t.common.students}`
          : t.grading.calculationComplete,
      })

      await onSuccess?.()
    } catch (err) {
      console.error("Error in calculation:", err)
      toast({
        title: t.common.error,
        description: err instanceof Error ? err.message : t.grading.calculationFailed,
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
      setCalculationProgress(null)
    }
  }, [trimesterId, onSuccess, showProgress, t])

  return { isCalculating, calculationProgress, handleCalculateAll }
}
