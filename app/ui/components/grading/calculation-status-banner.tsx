"use client"

import { useState, useEffect, useCallback } from "react"
import { useI18n } from "@/components/i18n-provider"
import { usePermissions } from "@/components/permission-guard"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  CheckCircle2,
  Calculator,
  RefreshCw,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  History,
  User,
  Timer,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { componentClasses, typography } from "@/lib/design-tokens"

// Constants
const STATUS_REFRESH_INTERVAL_MS = 30000
const HISTORY_DISPLAY_LIMIT = 5

interface CalculationStatus {
  hasActiveTrimester: boolean
  activeTrimesterId?: string
  activeTrimesterName?: { en: string; fr: string }
  lastSubjectAveragesCalculation: string | null
  lastStudentSummariesCalculation: string | null
  pendingEvaluationsCount: number
  totalEvaluations: number
  needsRecalculation: boolean
}

interface CalculationHistoryItem {
  id: string
  type: "subject_averages" | "student_summaries" | "full_calculation"
  status: "running" | "completed" | "failed"
  userName: string
  studentsProcessed: number
  averagesCalculated: number
  summariesCalculated: number
  durationMs: number | null
  errorMessage: string | null
  startedAt: string
  completedAt: string | null
}

export function CalculationStatusBanner() {
  const { t, locale } = useI18n()
  const { can } = usePermissions([
    { resource: "grades", action: "update" },
    { resource: "report_cards", action: "create" },
  ])
  const [status, setStatus] = useState<CalculationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationProgress, setCalculationProgress] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [history, setHistory] = useState<CalculationHistoryItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const canCalculate = can("grades", "update") || can("report_cards", "create")

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/evaluations/calculation-status")
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (err) {
      console.error("Error fetching calculation status:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true)
    try {
      const res = await fetch("/api/evaluations/calculation-history")
      if (res.ok) {
        const data = await res.json()
        setHistory(data.history || [])
      }
    } catch (err) {
      console.error("Error fetching calculation history:", err)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, STATUS_REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchStatus])

  // Fetch history when toggled on
  useEffect(() => {
    if (showHistory && history.length === 0) {
      fetchHistory()
    }
  }, [showHistory, history.length, fetchHistory])

  const handleCalculateAll = async () => {
    if (!status?.activeTrimesterId) return

    setIsCalculating(true)

    try {
      // Step 1: Calculate subject averages
      setCalculationProgress(t.grading.calculatingSubjectAverages)
      const avgRes = await fetch("/api/evaluations/calculate-averages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trimesterId: status.activeTrimesterId }),
      })

      if (!avgRes.ok) {
        const data = await avgRes.json()
        throw new Error(data.message || "Failed to calculate averages")
      }

      // Step 2: Calculate student summaries
      setCalculationProgress(t.grading.calculatingStudentSummaries)
      const summaryRes = await fetch("/api/evaluations/student-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trimesterId: status.activeTrimesterId }),
      })

      if (!summaryRes.ok) {
        const data = await summaryRes.json()
        throw new Error(data.message || "Failed to calculate summaries")
      }

      const summaryData = await summaryRes.json()
      toast({
        title: t.common.success,
        description: `${t.grading.calculationComplete}: ${summaryData.studentsProcessed || 0} ${t.common.students}`,
      })

      // Refresh status and history
      await fetchStatus()
      if (showHistory) {
        await fetchHistory()
      }
    } catch (err) {
      console.error("Error in bulk calculation:", err)
      toast({
        title: t.common.error,
        description: err instanceof Error ? err.message : "Failed to complete calculations",
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
      setCalculationProgress(null)
    }
  }

  // Format relative time
  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return t.grading.neverCalculated
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t.grading.justNow
    if (diffMins < 60) return `${diffMins} ${t.grading.minutesAgo}`
    if (diffHours < 24) return `${diffHours} ${t.grading.hoursAgo}`
    return `${diffDays} ${t.grading.daysAgo}`
  }

  // Format calculation type
  const formatCalculationType = (type: CalculationHistoryItem["type"]) => {
    switch (type) {
      case "subject_averages":
        return t.grading.typeSubjectAverages
      case "student_summaries":
        return t.grading.typeStudentSummaries
      case "full_calculation":
        return t.grading.typeFullCalculation
      default:
        return type
    }
  }

  // Format duration
  const formatDuration = (ms: number | null) => {
    if (ms === null) return "—"
    if (ms < 1000) return t.grading.durationMs.replace("{ms}", ms.toString())
    return t.grading.durationSeconds.replace("{seconds}", (ms / 1000).toFixed(1))
  }

  // Format timestamp for history
  const formatHistoryTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString(locale === "fr" ? "fr-FR" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get status badge styles
  const getStatusBadgeStyles = (status: CalculationHistoryItem["status"]) => {
    switch (status) {
      case "running":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
      case "completed":
        return "bg-gspn-gold-500/10 text-gspn-gold-700 dark:text-gspn-gold-400 border-gspn-gold-500/20"
      case "failed":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  // Get status label
  const getStatusLabel = (status: CalculationHistoryItem["status"]) => {
    switch (status) {
      case "running":
        return t.grading.calculationRunning
      case "completed":
        return t.grading.calculationCompleted
      case "failed":
        return t.grading.statusFailed
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="bg-muted/30 border-b px-4 py-2">
        <div className="container mx-auto max-w-7xl flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t.common.loading}...</span>
        </div>
      </div>
    )
  }

  if (!status?.hasActiveTrimester) {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
        <div className="container mx-auto max-w-7xl flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="text-sm text-amber-700 dark:text-amber-400">
            {t.admin.noActiveTrimester}
          </span>
        </div>
      </div>
    )
  }

  const trimesterName = status.activeTrimesterName
    ? locale === "fr"
      ? status.activeTrimesterName.fr
      : status.activeTrimesterName.en
    : ""

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b"
    >
      {/* Brand accent bar */}
      <div className="h-0.5 bg-gspn-maroon-500" />

      <div
        className={cn(
          "px-4 py-2 transition-colors",
          status.needsRecalculation
            ? "bg-amber-500/10"
            : "bg-gspn-gold-50 dark:bg-gspn-gold-950/20"
        )}
      >
        <div className="container mx-auto max-w-7xl">
          {/* Main row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Status icon */}
              <div
                className={cn(
                  "p-2 rounded-xl flex-shrink-0",
                  status.needsRecalculation
                    ? "bg-amber-500/20"
                    : "bg-gspn-gold-500/20 dark:bg-gspn-gold-500/10"
                )}
              >
                {status.needsRecalculation ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-gspn-gold-600 dark:text-gspn-gold-400" />
                )}
              </div>

              {/* Status text */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium truncate">
                  {trimesterName}
                </span>
                <span className="text-muted-foreground">•</span>
                <span
                  className={cn(
                    "text-sm",
                    status.needsRecalculation
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-gspn-gold-700 dark:text-gspn-gold-400"
                  )}
                >
                  {status.needsRecalculation ? (
                    <>
                      {status.pendingEvaluationsCount} {t.grading.pendingEvaluations}
                    </>
                  ) : (
                    t.grading.calculationsUpToDate
                  )}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Expand/collapse button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? t.common.collapse : t.common.expand}
                className="h-7 px-2 text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {/* Calculate button */}
              {canCalculate && (
                <Button
                  size="sm"
                  onClick={handleCalculateAll}
                  disabled={isCalculating || !status.needsRecalculation}
                  className={cn(
                    "h-7",
                    status.needsRecalculation
                      ? componentClasses.primaryActionButton
                      : "bg-gspn-gold-100 text-gspn-gold-600 dark:bg-gspn-gold-900/30 dark:text-gspn-gold-500 cursor-not-allowed"
                  )}
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      {calculationProgress || t.common.loading}
                    </>
                  ) : (
                    <>
                      <Calculator className="h-3.5 w-3.5 mr-1.5" />
                      {t.grading.calculateAllNow}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Expanded details */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-border/50 space-y-4">
              {/* Quick stats row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Last subject averages calculation */}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="text-muted-foreground">{t.grading.subjectAverages}: </span>
                    <span className="font-medium">
                      {formatRelativeTime(status.lastSubjectAveragesCalculation)}
                    </span>
                  </div>
                </div>

                {/* Last student summaries calculation */}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="text-muted-foreground">{t.grading.studentSummaries}: </span>
                    <span className="font-medium">
                      {formatRelativeTime(status.lastStudentSummariesCalculation)}
                    </span>
                  </div>
                </div>

                {/* Total evaluations */}
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="text-muted-foreground">{t.grading.totalEvaluations}: </span>
                    <span className="font-medium">{status.totalEvaluations}</span>
                  </div>
                </div>
              </div>

              {/* History toggle */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-expanded={showHistory}
                >
                  <History className="h-4 w-4" />
                  <span>{showHistory ? t.grading.hideHistory : t.grading.viewHistory}</span>
                  {showHistory ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              </div>

              {/* Calculation history list */}
              {showHistory && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <h4 className={cn(typography.body.sm, "font-medium text-foreground flex items-center gap-2")}>
                    <div className="h-1.5 w-1.5 rounded-full bg-gspn-maroon-500" />
                    {t.grading.recentCalculations}
                  </h4>

                  {isLoadingHistory ? (
                    <div className="flex items-center gap-2 py-3 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">{t.common.loading}...</span>
                    </div>
                  ) : history.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      {t.grading.noCalculationHistory}
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {history.slice(0, HISTORY_DISPLAY_LIMIT).map((item, index) => (
                        <div
                          key={item.id}
                          className={cn(
                            "flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 rounded-lg",
                            "bg-card/50 border border-border/50",
                            "animate-in fade-in slide-in-from-left-2",
                            item.status === "failed" && "bg-red-500/5 border-red-500/20"
                          )}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Status indicator */}
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                              getStatusBadgeStyles(item.status)
                            )}
                          >
                            {item.status === "running" && (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            )}
                            {item.status === "completed" && (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            {item.status === "failed" && (
                              <XCircle className="h-3 w-3" />
                            )}
                            {getStatusLabel(item.status)}
                          </span>

                          {/* Type */}
                          <span className="text-sm font-medium text-foreground">
                            {formatCalculationType(item.type)}
                          </span>

                          {/* User */}
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {item.userName}
                          </span>

                          {/* Timestamp */}
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatHistoryTime(item.startedAt)}
                          </span>

                          {/* Duration */}
                          {item.durationMs !== null && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Timer className="h-3 w-3" />
                              {formatDuration(item.durationMs)}
                            </span>
                          )}

                          {/* Metrics for completed calculations */}
                          {item.status === "completed" && (
                            <span className={cn(typography.body.xs, "text-gspn-gold-600 dark:text-gspn-gold-400 font-medium")}>
                              {item.type === "subject_averages" && `${item.averagesCalculated} ${t.grading.averages.toLowerCase()}`}
                              {item.type === "student_summaries" && `${item.studentsProcessed} ${t.common.students}`}
                              {item.type === "full_calculation" && `${item.studentsProcessed} ${t.common.students}`}
                            </span>
                          )}

                          {/* Error message for failed calculations */}
                          {item.status === "failed" && item.errorMessage && (
                            <span className="w-full text-xs text-red-600 dark:text-red-400 mt-1">
                              {item.errorMessage}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
