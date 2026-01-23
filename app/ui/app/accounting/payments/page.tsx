"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CheckCircle2,
  Clock,
  Loader2,
  BanknoteIcon,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarCheck,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { formatDate, cn } from "@/lib/utils"
import { usePayments, usePaymentStats, useGrades, type ApiPayment } from "@/lib/hooks/use-api"
import { getPaymentRowStatus } from "@/lib/status-helpers"
import { typography } from "@/lib/design-tokens"
import { PaymentFiltersPanel } from "./components/payment-filters"
import { ExportButton } from "./components/export-button"
import { ErrorState } from "./components/error-state"
import { PaymentTableSkeleton, PaymentStatsSkeletoncard, PaymentTypeSkeletonCard } from "./components/payment-skeleton"
import { usePaymentFilters } from "./hooks/use-payment-filters"

// Custom hook for counting animation (simplified - only for hero stat)
function useCountUp(end: number, duration: number = 800, enabled: boolean = true) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setCount(end)
      return
    }

    const startTime = performance.now()
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentCount = Math.floor(end * easeOut)
      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration, enabled])

  return count
}

export default function PaymentsPage() {
  const router = useRouter()
  const { t, locale } = useI18n()

  // Animation state
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Filter state using custom hook
  const {
    filters,
    updateFilter,
    clearFilters,
    setQuickDateRange,
    activeFilterCount,
  } = usePaymentFilters()

  const [offset, setOffset] = useState(0)

  // React Query hooks
  const { data: paymentsData, isLoading, isError, error, refetch } = usePayments({
    status: filters.status !== "all" ? filters.status : undefined,
    method: filters.method !== "all" ? filters.method : undefined,
    paymentType: filters.paymentType !== "all" ? filters.paymentType : undefined,
    gradeId: filters.grade !== "all" ? filters.grade : undefined,
    balanceStatus: filters.balanceStatus !== "all" ? filters.balanceStatus : undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    // Note: Search will be filtered client-side until backend API supports it
    limit: 20,
    offset,
  })

  const { data: statsData, isLoading: isLoadingStats, isError: isStatsError, error: statsError, refetch: refetchStats } = usePaymentStats({
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  })

  const { data: gradesData } = useGrades()

  // Extract data from query results
  const allPayments = paymentsData?.payments ?? []
  const pagination = paymentsData?.pagination ?? { total: 0, limit: 20, offset: 0, hasMore: false }
  const stats = statsData ?? null
  const grades = gradesData?.grades ?? []

  // Client-side search filtering until backend supports it
  const payments = filters.search
    ? allPayments.filter((payment) => {
        const searchLower = filters.search.toLowerCase()
        const isClubPayment = payment.paymentType === "club"
        const firstName = (isClubPayment
          ? payment.clubEnrollment?.student?.firstName || ""
          : payment.enrollment?.student?.firstName || "").toLowerCase()
        const lastName = (isClubPayment
          ? payment.clubEnrollment?.student?.lastName || ""
          : payment.enrollment?.student?.lastName || "").toLowerCase()
        const receiptNumber = payment.receiptNumber.toLowerCase()
        const transactionRef = (payment.transactionRef || "").toLowerCase()

        return (
          firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          receiptNumber.includes(searchLower) ||
          transactionRef.includes(searchLower)
        )
      })
    : allPayments

  // Trigger animations on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
      setHasAnimated(true)
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0)
  }, [filters])

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination.hasMore) {
      setOffset(pagination.offset + pagination.limit)
    }
  }

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setOffset(Math.max(0, pagination.offset - pagination.limit))
    }
  }

  // Badge helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t.accounting.confirmed}
          </Badge>
        )
      case "reversed":
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500">
            <RefreshCw className="h-3 w-3 mr-1" />
            {t.accounting.reversed}
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            {t.accounting.failed}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <BanknoteIcon className="h-3 w-3 mr-1" />
            {t.accounting.cashPayments}
          </Badge>
        )
      case "orange_money":
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500">
            <Smartphone className="h-3 w-3 mr-1" />
            {t.accounting.orangeMoneyPayments}
          </Badge>
        )
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-GN').format(amount) + " GNF"
  }

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  // Simplified counting animations - only for hero stat
  const todayAmount = useCountUp(stats?.today?.amount || 0, 1200, hasAnimated && !isLoadingStats)

  // Determine status for hero card styling
  const pendingCount = stats?.pending?.count || 0
  const heroStatus = pendingCount === 0 ? "success" : pendingCount > 5 ? "warning" : "neutral"

  const heroStyles = {
    success: {
      bg: "bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/40 dark:to-green-900/30",
      border: "border-emerald-200 dark:border-emerald-800",
      accent: "text-emerald-600 dark:text-emerald-400",
      glow: "shadow-emerald-500/10",
    },
    warning: {
      bg: "bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/40 dark:to-orange-900/30",
      border: "border-amber-200 dark:border-amber-800",
      accent: "text-amber-600 dark:text-amber-400",
      glow: "shadow-amber-500/10",
    },
    neutral: {
      bg: "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-800/30",
      border: "border-slate-200 dark:border-slate-700",
      accent: "text-slate-600 dark:text-slate-400",
      glow: "shadow-slate-500/10",
    },
  }

  const currentHeroStyle = heroStyles[heroStatus]

  // Helper to get date range label for stats cards
  const getDateRangeLabel = () => {
    if (!filters.startDate && !filters.endDate) {
      return t.accounting.allTime
    }
    const formatDateShort = (dateStr: string) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
        day: "numeric",
        month: "short",
      })
    }
    if (filters.startDate && filters.endDate) {
      if (filters.startDate === filters.endDate) {
        const today = new Date().toISOString().split("T")[0]
        if (filters.startDate === today) {
          return t.accounting.today
        }
        return formatDateShort(filters.startDate)
      }
      return `${formatDateShort(filters.startDate)} - ${formatDateShort(filters.endDate)}`
    }
    if (filters.startDate) return `${t.accounting.from} ${formatDateShort(filters.startDate)}`
    if (filters.endDate) return `${t.accounting.until} ${formatDateShort(filters.endDate)}`
    return ""
  }

  // Fix progress bar calculation (prevent division by zero)
  const getTuitionPercentage = () => {
    const tuitionAmount = stats?.byType?.tuition?.amount || 0
    const clubAmount = stats?.byType?.club?.amount || 0
    const total = tuitionAmount + clubAmount
    return total > 0 ? (tuitionAmount / total * 100) : 50 // Default to 50% if no data
  }

  const getClubPercentage = () => {
    const tuitionAmount = stats?.byType?.tuition?.amount || 0
    const clubAmount = stats?.byType?.club?.amount || 0
    const total = tuitionAmount + clubAmount
    return total > 0 ? (clubAmount / total * 100) : 50 // Default to 50% if no data
  }

  return (
    <PageContainer maxWidth="full">
      {/* Header with title and action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
            {t.accounting.paymentsPageTitle}
          </h1>
          <p className="text-muted-foreground mt-1">{t.accounting.paymentsPageSubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton payments={payments} />
          <Button
            variant="gold"
            size="lg"
            className="shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            onClick={() => router.push("/payments/new")}
          >
            <Plus className="h-5 w-5 mr-2" />
            {t.accounting.recordPayment}
          </Button>
        </div>
      </div>

      {/* Error State for Stats */}
      {isStatsError && (
        <ErrorState
          variant="alert"
          title={t.accounting.errorLoadingStats}
          message={statsError?.message || t.accounting.somethingWentWrong}
          onRetry={refetchStats}
          className="mb-6"
        />
      )}

      {/* Hero Stats Section */}
      {isLoadingStats ? (
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <PaymentStatsSkeletoncard className="lg:col-span-2" />
          <PaymentStatsSkeletoncard />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3 mb-8" role="region" aria-label={t.accounting.statsSection}>
          {/* Main Hero Card - Today's Collection */}
          <Card className={cn(
            "lg:col-span-2 border-2 shadow-xl transition-all duration-700",
            currentHeroStyle.bg,
            currentHeroStyle.border,
            currentHeroStyle.glow,
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <CardContent className="pt-6 pb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className={cn("size-5 transition-transform duration-500", currentHeroStyle.accent)} />
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {t.accounting.paymentsToday}
                    </span>
                  </div>
                  <p className="font-accent text-5xl md:text-6xl font-bold tracking-tight tabular-nums">
                    {formatAmount(todayAmount)}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="secondary" className="font-semibold">
                      {stats?.today?.count || 0} {stats?.today?.count === 1 ? t.accounting.payment : t.accounting.paymentsPlural}
                    </Badge>
                    {(stats?.today?.count || 0) > 0 && (
                      <span className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="size-4" />
                        {t.accounting.activeFilter}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pending Alert or Success State */}
                <div className={cn(
                  "flex flex-col items-center justify-center p-6 rounded-xl min-w-[180px]",
                  pendingCount > 0
                    ? "bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700"
                    : "bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-300 dark:border-emerald-700"
                )}>
                  {pendingCount > 0 ? (
                    <>
                      <Clock className="size-8 text-amber-600 dark:text-amber-400 mb-2" />
                      <span className="text-3xl font-bold text-amber-700 dark:text-amber-300">{pendingCount}</span>
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                        {t.accounting.pendingConfirmation}
                      </span>
                      <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
                        {formatAmount(stats?.pending?.amount || 0)}
                      </p>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 text-center">
                        {t.accounting.allUpToDate}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Stats Stack */}
          <div className="flex flex-col gap-4">
            {/* Confirmed This Week */}
            <Card className="flex-1 border hover:shadow-md transition-all">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        {t.accounting.confirmedThisWeek}
                      </p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal text-muted-foreground">
                        {t.accounting.thisWeek}
                      </Badge>
                    </div>
                    <div className="mt-1">
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {stats?.confirmedThisWeek?.count || 0}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({formatAmount(stats?.confirmedThisWeek?.amount || 0)})
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="size-5 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            {/* By Method Card */}
            <Card className={cn(
              "flex-1 border hover:shadow-md transition-all",
              (filters.startDate || filters.endDate) && "ring-1 ring-primary/20"
            )}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Wallet className="size-4" />
                    {t.accounting.byMethod}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-1.5 py-0 h-5 font-normal",
                      (filters.startDate || filters.endDate)
                        ? "bg-primary/5 text-primary border-primary/30"
                        : "text-muted-foreground"
                    )}
                  >
                    {getDateRangeLabel()}
                  </Badge>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <BanknoteIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-lg font-bold">{stats?.byMethod?.cash?.count || 0}</span>
                      <p className="text-xs text-muted-foreground">{t.accounting.cash}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <Smartphone className="size-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <span className="text-lg font-bold">{stats?.byMethod?.orange_money?.count || 0}</span>
                      <p className="text-xs text-muted-foreground">Mobile</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Payment Type Breakdown */}
      {isLoadingStats ? (
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <PaymentTypeSkeletonCard />
          <PaymentTypeSkeletonCard />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          {/* Tuition Payments Card */}
          <Card
            className={cn(
              "relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl cursor-pointer group",
              filters.paymentType === "tuition"
                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-900/30 shadow-lg ring-2 ring-blue-500/20"
                : "border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600"
            )}
            onClick={() => updateFilter("paymentType", filters.paymentType === "tuition" ? "all" : "tuition")}
            role="button"
            tabIndex={0}
            aria-label={t.accounting.tuitionPayments}
            onKeyDown={(e) => e.key === "Enter" && updateFilter("paymentType", filters.paymentType === "tuition" ? "all" : "tuition")}
          >
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-3 rounded-xl transition-all duration-300",
                    filters.paymentType === "tuition"
                      ? "bg-blue-600 dark:bg-blue-500 shadow-lg shadow-blue-500/30 scale-110"
                      : "bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/70"
                  )}>
                    <BanknoteIcon className={cn(
                      "size-6 transition-colors duration-300",
                      filters.paymentType === "tuition"
                        ? "text-white"
                        : "text-blue-600 dark:text-blue-400"
                    )} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-blue-700 dark:text-blue-300">
                      {t.accounting.tuitionPayments}
                    </h3>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
                      {locale === "fr" ? "Frais de scolarité" : "Tuition fees"}
                    </p>
                  </div>
                </div>
                {filters.paymentType === "tuition" && (
                  <Badge className="bg-blue-600 text-white border-0 shadow-lg">
                    {t.accounting.activeFilter}
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <span className={cn(typography.currency.lg, "text-blue-700 dark:text-blue-300")}>
                  {formatAmount(stats?.byType?.tuition?.amount || 0)}
                </span>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                    {stats?.byType?.tuition?.count || 0} {t.accounting.paymentsPlural}
                  </Badge>
                  {stats?.byType?.tuition && (
                    <span className="text-sm text-blue-600/70 dark:text-blue-400/70">
                      {getDateRangeLabel()}
                    </span>
                  )}
                </div>
                <div className="h-2 bg-blue-200 dark:bg-blue-900/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${getTuitionPercentage()}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Club Payments Card */}
          <Card
            className={cn(
              "relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl cursor-pointer group",
              filters.paymentType === "club"
                ? "border-purple-500 bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-900/30 shadow-lg ring-2 ring-purple-500/20"
                : "border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600"
            )}
            onClick={() => updateFilter("paymentType", filters.paymentType === "club" ? "all" : "club")}
            role="button"
            tabIndex={0}
            aria-label={t.accounting.clubPayments}
            onKeyDown={(e) => e.key === "Enter" && updateFilter("paymentType", filters.paymentType === "club" ? "all" : "club")}
          >
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-3 rounded-xl transition-all duration-300",
                    filters.paymentType === "club"
                      ? "bg-purple-600 dark:bg-purple-500 shadow-lg shadow-purple-500/30 scale-110"
                      : "bg-purple-100 dark:bg-purple-900/50 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/70"
                  )}>
                    <Sparkles className={cn(
                      "size-6 transition-colors duration-300",
                      filters.paymentType === "club"
                        ? "text-white"
                        : "text-purple-600 dark:text-purple-400"
                    )} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-purple-700 dark:text-purple-300">
                      {t.accounting.clubPayments}
                    </h3>
                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70">
                      {locale === "fr" ? "Activités parascolaires" : "Extracurricular activities"}
                    </p>
                  </div>
                </div>
                {filters.paymentType === "club" && (
                  <Badge className="bg-purple-600 text-white border-0 shadow-lg">
                    {t.accounting.activeFilter}
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <span className={cn(typography.currency.lg, "text-purple-700 dark:text-purple-300")}>
                  {formatAmount(stats?.byType?.club?.amount || 0)}
                </span>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="font-semibold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                    {stats?.byType?.club?.count || 0} {t.accounting.paymentsPlural}
                  </Badge>
                  {stats?.byType?.club && (
                    <span className="text-sm text-purple-600/70 dark:text-purple-400/70">
                      {getDateRangeLabel()}
                    </span>
                  )}
                </div>
                <div className="h-2 bg-purple-200 dark:bg-purple-900/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${getClubPercentage()}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Section */}
      <PaymentFiltersPanel
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
        onQuickDateRange={setQuickDateRange}
        activeFilterCount={activeFilterCount}
        grades={grades}
        isVisible={isVisible}
      />

      {/* Payments Table */}
      <Card className={cn(
        "border shadow-sm overflow-hidden transition-all duration-700 mt-6",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      role="region"
      aria-label={t.accounting.paymentsTable}
      >
        <CardContent className="p-0">
          {/* Error State */}
          {isError && (
            <ErrorState
              title={t.accounting.errorLoadingPayments}
              message={error?.message || t.accounting.somethingWentWrong}
              onRetry={refetch}
            />
          )}

          {/* Loading State */}
          {isLoading && !isError && <PaymentTableSkeleton />}

          {/* Empty State */}
          {!isLoading && !isError && payments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="p-4 rounded-full bg-muted">
                <BanknoteIcon className="size-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">{t.accounting.noPaymentsFound}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t.accounting.modifyFiltersOrRecord}
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          {!isLoading && !isError && payments.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold">{t.accounting.transactionId}</TableHead>
                      <TableHead className="font-semibold">{t.common.student}</TableHead>
                      <TableHead className="font-semibold">{t.accounting.filterByType}</TableHead>
                      <TableHead className="text-right font-semibold">{t.common.amount}</TableHead>
                      <TableHead className="font-semibold">{t.accounting.method}</TableHead>
                      <TableHead className="font-semibold">{t.common.date}</TableHead>
                      <TableHead className="font-semibold">{t.common.status}</TableHead>
                      <TableHead className="font-semibold">{t.accounting.reference}</TableHead>
                      <TableHead className="text-right font-semibold">{t.common.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => {
                      const statusColors: Record<string, string> = {
                        confirmed: "border-l-emerald-500",
                        reversed: "border-l-orange-500",
                        failed: "border-l-red-500",
                      }
                      const borderColor = statusColors[payment.status] || "border-l-transparent"

                      const isClubPayment = payment.paymentType === "club"
                      const firstName = isClubPayment
                        ? payment.clubEnrollment?.student?.firstName || ""
                        : payment.enrollment?.student?.firstName || ""
                      const lastName = isClubPayment
                        ? payment.clubEnrollment?.student?.lastName || ""
                        : payment.enrollment?.student?.lastName || ""
                      const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?"

                      const clubName = isClubPayment
                        ? (locale === "fr" && payment.clubEnrollment?.club?.nameFr)
                          ? payment.clubEnrollment.club.nameFr
                          : payment.clubEnrollment?.club?.name
                        : null
                      const gradeName = !isClubPayment ? payment.enrollment?.grade?.name : null

                      const typeBackground = isClubPayment
                        ? "bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                        : "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30"

                      return (
                        <TableRow
                          key={payment.id}
                          status={getPaymentRowStatus(payment.status)}
                          className={cn(
                            "border-l-4 transition-all duration-200 hover:shadow-md group cursor-pointer",
                            borderColor,
                            typeBackground
                          )}
                          onClick={() => router.push(`/payments/${payment.id}`)}
                          role="button"
                          tabIndex={0}
                          aria-label={`${t.accounting.viewPaymentDetails} ${payment.receiptNumber}`}
                          onKeyDown={(e) => e.key === "Enter" && router.push(`/payments/${payment.id}`)}
                        >
                          <TableCell className="font-mono text-sm font-medium text-primary">
                            {payment.receiptNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "size-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110",
                                isClubPayment
                                  ? "bg-purple-100 dark:bg-purple-900/50 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/70"
                                  : "bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/70"
                              )}>
                                <span className={cn(
                                  "text-xs font-semibold",
                                  isClubPayment
                                    ? "text-purple-700 dark:text-purple-300"
                                    : "text-blue-700 dark:text-blue-300"
                                )}>{initials}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {firstName || "N/A"} {lastName}
                                </p>
                                {isClubPayment && clubName ? (
                                  <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1 font-medium">
                                    <span className="size-1.5 rounded-full bg-purple-500" />
                                    {clubName}
                                  </p>
                                ) : (
                                  <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                    <span className="size-1.5 rounded-full bg-blue-500" />
                                    {gradeName ?? "-"}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {isClubPayment ? (
                              <Badge className={cn(
                                "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white border-0 shadow-md font-bold px-3 py-1",
                                "group-hover:shadow-lg group-hover:scale-105 transition-all duration-200"
                              )}>
                                <Sparkles className="size-3 mr-1" />
                                {t.accounting.clubPayments}
                              </Badge>
                            ) : (
                              <Badge className={cn(
                                "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-md font-bold px-3 py-1",
                                "group-hover:shadow-lg group-hover:scale-105 transition-all duration-200"
                              )}>
                                <BanknoteIcon className="size-3 mr-1" />
                                {t.accounting.tuitionPayments}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn(
                              typography.currency.sm,
                              "transition-colors duration-200 group-hover:text-primary drop-shadow-sm"
                            )}>
                              {formatAmount(payment.amount)}
                            </span>
                          </TableCell>
                          <TableCell>{getMethodBadge(payment.method)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(payment.recordedAt, locale)}
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {payment.transactionRef || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {payment.status === "confirmed" && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="size-3" />
                                {t.accounting.completed}
                              </span>
                            )}
                            {payment.status === "reversed" && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                                <RefreshCw className="size-3" />
                                {t.accounting.reversed}
                              </span>
                            )}
                            {payment.status === "failed" && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                                <XCircle className="size-3" />
                                {t.accounting.failed}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className="flex items-center justify-between px-6 py-4 border-t bg-muted/20"
                  role="navigation"
                  aria-label={t.accounting.paginationControls}
                >
                  <p className="text-sm text-muted-foreground">
                    {t.accounting.showing} <span className="font-medium text-foreground">{pagination.offset + 1}</span>
                    {" - "}
                    <span className="font-medium text-foreground">
                      {Math.min(pagination.offset + pagination.limit, pagination.total)}
                    </span>
                    {" "}{t.accounting.of}{" "}
                    <span className="font-medium text-foreground">{pagination.total}</span> {t.accounting.results}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={pagination.offset === 0}
                      className="bg-background hover:bg-muted"
                      aria-label={t.common.previous}
                    >
                      <ChevronLeft className="size-4 mr-1" />
                      {t.common.previous}
                    </Button>
                    <div className="flex items-center gap-1 px-2">
                      <span className="text-sm font-medium">{currentPage}</span>
                      <span className="text-sm text-muted-foreground">/</span>
                      <span className="text-sm text-muted-foreground">{totalPages}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!pagination.hasMore}
                      className="bg-background hover:bg-muted"
                      aria-label={t.common.next}
                    >
                      {t.common.next}
                      <ChevronRight className="size-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Screen reader announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {isLoading ? t.accounting.loadingPayments : `${pagination.total} ${t.accounting.results}`}
      </div>
    </PageContainer>
  )
}
