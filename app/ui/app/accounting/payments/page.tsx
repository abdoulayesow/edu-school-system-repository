"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CheckCircle2,
  Loader2,
  BanknoteIcon,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { formatDate, cn } from "@/lib/utils"
import { usePayments, usePaymentStats, useGrades } from "@/lib/hooks/use-api"
import { getPaymentRowStatus } from "@/lib/status-helpers"
import { PaymentFiltersPanel } from "./components/payment-filters"
import { ExportButton } from "./components/export-button"
import { ErrorState } from "./components/error-state"
import { PaymentTableSkeleton } from "./components/payment-skeleton"
import { usePaymentFilters } from "./hooks/use-payment-filters"
import { RegistryStatusIndicator } from "@/components/registry-status-indicator"

export default function PaymentsPage() {
  const router = useRouter()
  const { t, locale } = useI18n()

  // Hydration guard - prevents SSR/client mismatch
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  // Calculate payment stats for display
  const totalPayments = (stats?.byType?.tuition?.count || 0) + (stats?.byType?.club?.count || 0)
  const totalAmount = (stats?.byType?.tuition?.amount || 0) + (stats?.byType?.club?.amount || 0)
  const tuitionAmount = stats?.byType?.tuition?.amount || 0
  const clubAmount = stats?.byType?.club?.amount || 0

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t.accounting.paymentsPageTitle}</h1>
            <p className="text-muted-foreground">{t.accounting.paymentsPageSubtitle}</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.accounting.paymentsPageTitle}</h1>
          <p className="text-muted-foreground">{t.accounting.paymentsPageSubtitle}</p>
        </div>

        {/* Registry Status Indicator - only shows when closed */}
        <RegistryStatusIndicator className="sm:order-2" />

        <div className="flex items-center gap-3 sm:order-3">
          <ExportButton payments={payments} />
          <Button
            variant="gold"
            onClick={() => router.push("/accounting/payments/new")}
          >
            <Plus className="size-4 mr-2" />
            {t.accounting.recordPayment}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="py-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BanknoteIcon className="size-4" />
              {t.accounting.totalAmount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="h-8 w-32 animate-pulse bg-muted rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatAmount(totalAmount)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(stats?.byType?.tuition?.count || 0) + (stats?.byType?.club?.count || 0)} {t.accounting.paymentsPlural}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BanknoteIcon className="size-4" />
              {t.accounting.tuitionPayments}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="h-8 w-32 animate-pulse bg-muted rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold text-primary">{formatAmount(tuitionAmount)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.byType?.tuition?.count || 0} {t.accounting.paymentsPlural}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="size-4" />
              {t.accounting.clubPayments}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="h-8 w-32 animate-pulse bg-muted rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatAmount(clubAmount)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.byType?.club?.count || 0} {t.accounting.paymentsPlural}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Smartphone className="size-4" />
              {t.accounting.orangeMoneyPayments}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="h-8 w-32 animate-pulse bg-muted rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatAmount(stats?.byMethod?.orange_money?.amount || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.byMethod?.orange_money?.count || 0} {t.accounting.paymentsPlural}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <PaymentFiltersPanel
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
        onQuickDateRange={setQuickDateRange}
        activeFilterCount={activeFilterCount}
        grades={grades}
        isVisible={true}
      />

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.accounting.paymentsTable}</CardTitle>
          <CardDescription>
            {payments.length} {t.accounting.results}
            {pagination && ` / ${pagination.total}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.accounting.transactionId}</TableHead>
                      <TableHead>{t.common.student}</TableHead>
                      <TableHead>{t.accounting.filterByType}</TableHead>
                      <TableHead className="text-right">{t.common.amount}</TableHead>
                      <TableHead>{t.accounting.method}</TableHead>
                      <TableHead>{t.common.date}</TableHead>
                      <TableHead>{t.common.status}</TableHead>
                      <TableHead>{t.accounting.reference}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => {
                      const isClubPayment = payment.paymentType === "club"
                      const firstName = isClubPayment
                        ? payment.clubEnrollment?.student?.firstName || ""
                        : payment.enrollment?.student?.firstName || ""
                      const lastName = isClubPayment
                        ? payment.clubEnrollment?.student?.lastName || ""
                        : payment.enrollment?.student?.lastName || ""

                      const clubName = isClubPayment
                        ? (locale === "fr" && payment.clubEnrollment?.club?.nameFr)
                          ? payment.clubEnrollment.club.nameFr
                          : payment.clubEnrollment?.club?.name
                        : null
                      const gradeName = !isClubPayment ? payment.enrollment?.grade?.name : null

                      return (
                        <TableRow
                          key={payment.id}
                          status={getPaymentRowStatus(payment.status)}
                          className="cursor-pointer"
                          onClick={() => router.push(`/accounting/payments/${payment.id}`)}
                        >
                          <TableCell className="font-mono text-sm">
                            {payment.receiptNumber}
                          </TableCell>
                          <TableCell>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground">
                                {firstName || "N/A"} {lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {isClubPayment ? clubName : gradeName ?? "-"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {isClubPayment ? (
                                <>
                                  <Sparkles className="size-3 mr-1" />
                                  {t.accounting.clubPayments}
                                </>
                              ) : (
                                <>
                                  <BanknoteIcon className="size-3 mr-1" />
                                  {t.accounting.tuitionPayments}
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatAmount(payment.amount)}
                          </TableCell>
                          <TableCell>{getMethodBadge(payment.method)}</TableCell>
                          <TableCell className="text-sm">
                            {formatDate(payment.recordedAt, locale)}
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {payment.transactionRef || "-"}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    {t.accounting.showing} {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} {t.accounting.of} {pagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={pagination.offset === 0}
                    >
                      <ChevronLeft className="size-4 mr-1" />
                      {t.common.previous}
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      {currentPage} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!pagination.hasMore}
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
    </PageContainer>
  )
}
