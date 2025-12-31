"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  BanknoteIcon,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { formatDate } from "@/lib/utils"
import { CashDepositDialog, PaymentReviewDialog } from "@/components/payments"

interface Payment {
  id: string
  amount: number
  method: "cash" | "orange_money"
  status: "pending_deposit" | "deposited" | "pending_review" | "confirmed" | "rejected" | "failed"
  receiptNumber: string
  transactionRef: string | null
  recordedAt: string
  confirmedAt: string | null
  enrollment: {
    id: string
    enrollmentNumber: string
    student: {
      id: string
      firstName: string
      lastName: string
      studentNumber: string
    } | null
    grade: {
      id: string
      name: string
    } | null
  } | null
  recorder: { id: string; name: string; email: string } | null
}

interface PaginationInfo {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export default function PaymentsPage() {
  const { t, locale } = useI18n()
  const [payments, setPayments] = useState<Payment[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Dialog state
  const [openDepositDialog, setOpenDepositDialog] = useState(false)
  const [openReviewDialog, setOpenReviewDialog] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  // Fetch payments with filters
  const fetchPayments = useCallback(async (offset: number = 0) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("limit", "20")
      params.set("offset", offset.toString())

      if (statusFilter && statusFilter !== "all") {
        params.set("status", statusFilter)
      }
      if (methodFilter && methodFilter !== "all") {
        params.set("method", methodFilter)
      }
      if (startDate) {
        params.set("startDate", startDate)
      }
      if (endDate) {
        params.set("endDate", endDate)
      }

      const response = await fetch(`/api/payments?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch payments")
      const data = await response.json()
      setPayments(data.payments || [])
      setPagination(data.pagination || { total: 0, limit: 20, offset: 0, hasMore: false })
    } catch (err) {
      console.error("Error fetching payments:", err)
      setPayments([])
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, methodFilter, startDate, endDate])

  // Initial fetch and refetch on filter change
  useEffect(() => {
    fetchPayments(0)
  }, [fetchPayments])

  // Handle pagination
  const handleNextPage = () => {
    if (pagination.hasMore) {
      fetchPayments(pagination.offset + pagination.limit)
    }
  }

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      fetchPayments(Math.max(0, pagination.offset - pagination.limit))
    }
  }

  // Refresh data after dialog actions
  const refreshData = () => {
    fetchPayments(pagination.offset)
  }

  // Handle opening deposit dialog
  const handleOpenDeposit = (payment: Payment) => {
    setSelectedPayment(payment)
    setOpenDepositDialog(true)
  }

  // Handle opening review dialog
  const handleOpenReview = (payment: Payment) => {
    setSelectedPayment(payment)
    setOpenReviewDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_deposit":
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500">
            <BanknoteIcon className="h-3 w-3 mr-1" />
            {t.accounting.pendingDeposit}
          </Badge>
        )
      case "deposited":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500">
            <Clock className="h-3 w-3 mr-1" />
            {t.accounting.deposited}
          </Badge>
        )
      case "pending_review":
        return (
          <Badge variant="outline" className="text-warning border-warning">
            <Clock className="h-3 w-3 mr-1" />
            {t.accounting.pendingReview}
          </Badge>
        )
      case "confirmed":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t.accounting.confirmed}
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            {t.accounting.rejected}
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

  return (
    <PageContainer maxWidth="full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t.accounting.paymentsPageTitle}</h1>
        <p className="text-muted-foreground">{t.accounting.paymentsPageSubtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{t.accounting.paymentTransactions}</CardTitle>
              <CardDescription>
                {isLoading ? "Chargement..." : `${pagination.total} transactions`}
              </CardDescription>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-end gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="size-4" />
              <span className="text-sm font-medium">Filtres:</span>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{t.accounting.filterByStatus}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t.accounting.allStatuses} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.accounting.allStatuses}</SelectItem>
                  <SelectItem value="pending_deposit">{t.accounting.pendingDeposit}</SelectItem>
                  <SelectItem value="deposited">{t.accounting.deposited}</SelectItem>
                  <SelectItem value="pending_review">{t.accounting.pendingReview}</SelectItem>
                  <SelectItem value="confirmed">{t.accounting.confirmed}</SelectItem>
                  <SelectItem value="rejected">{t.accounting.rejected}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{t.accounting.filterByMethod}</Label>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t.accounting.allMethods} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.accounting.allMethods}</SelectItem>
                  <SelectItem value="cash">{t.accounting.cashPayments}</SelectItem>
                  <SelectItem value="orange_money">{t.accounting.orangeMoneyPayments}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{t.accounting.filterByDate}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-[150px]"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-[150px]"
                />
              </div>
            </div>

            {(statusFilter !== "all" || methodFilter !== "all" || startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("all")
                  setMethodFilter("all")
                  setStartDate("")
                  setEndDate("")
                }}
                className="text-muted-foreground"
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t.accounting.noPaymentsFound}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.accounting.transactionId}</TableHead>
                      <TableHead>{t.common.student}</TableHead>
                      <TableHead className="text-right">{t.common.amount}</TableHead>
                      <TableHead>{t.accounting.method}</TableHead>
                      <TableHead>{t.common.date}</TableHead>
                      <TableHead>{t.common.status}</TableHead>
                      <TableHead>{t.accounting.reference}</TableHead>
                      <TableHead className="text-right">{t.common.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium font-mono text-sm">
                          {payment.receiptNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {payment.enrollment?.student?.firstName ?? "N/A"} {payment.enrollment?.student?.lastName ?? ""}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {payment.enrollment?.grade?.name ?? "-"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {formatAmount(payment.amount)}
                        </TableCell>
                        <TableCell>{getMethodBadge(payment.method)}</TableCell>
                        <TableCell>
                          {formatDate(payment.recordedAt, locale)}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.transactionRef || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {payment.status === "pending_deposit" && payment.method === "cash" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-transparent"
                              onClick={() => handleOpenDeposit(payment)}
                            >
                              <BanknoteIcon className="h-3 w-3 mr-1" />
                              {t.accounting.deposit}
                            </Button>
                          )}
                          {(payment.status === "pending_review" || payment.status === "deposited") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-transparent"
                              onClick={() => handleOpenReview(payment)}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {t.accounting.validate}
                            </Button>
                          )}
                          {payment.status === "confirmed" && (
                            <span className="text-xs text-success">{t.accounting.completed}</span>
                          )}
                          {payment.status === "rejected" && (
                            <span className="text-xs text-destructive">{t.accounting.rejected}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages} ({pagination.total} résultats)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={pagination.offset === 0}
                      className="bg-transparent"
                    >
                      <ChevronLeft className="size-4 mr-1" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!pagination.hasMore}
                      className="bg-transparent"
                    >
                      Suivant
                      <ChevronRight className="size-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Cash Deposit Dialog */}
      <CashDepositDialog
        payment={selectedPayment}
        open={openDepositDialog}
        onOpenChange={setOpenDepositDialog}
        onSuccess={refreshData}
      />

      {/* Payment Review Dialog */}
      <PaymentReviewDialog
        payment={selectedPayment}
        open={openReviewDialog}
        onOpenChange={setOpenReviewDialog}
        onSuccess={refreshData}
      />
    </PageContainer>
  )
}
