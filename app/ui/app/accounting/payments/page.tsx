"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  Plus,
  CalendarCheck,
  Wallet,
  Search,
  X,
  User,
  Upload,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { formatDate } from "@/lib/utils"
import { CashDepositDialog, PaymentReviewDialog } from "@/components/payments"
import { usePayments, usePaymentStats, useGrades, useCreatePayment, useInvalidateQueries } from "@/lib/hooks/use-api"

interface Payment {
  id: string
  amount: number
  method: "cash" | "orange_money"
  status: string
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

interface PaymentStats {
  today: { count: number; amount: number }
  pending: { count: number; amount: number }
  confirmedThisWeek: { count: number; amount: number }
  byMethod: {
    cash: { count: number; amount: number }
    orange_money: { count: number; amount: number }
  }
}

interface Grade {
  id: string
  name: string
}

interface StudentSearchResult {
  id: string
  studentNumber: string
  firstName: string
  lastName: string
  fullName: string
  photoUrl?: string
  grade?: { id: string; name: string }
  enrollmentId?: string
  balanceInfo?: {
    tuitionFee: number
    totalPaid: number
    remainingBalance: number
  }
}

export default function PaymentsPage() {
  const { t, locale } = useI18n()
  const invalidate = useInvalidateQueries()

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [offset, setOffset] = useState(0)

  // React Query hooks
  const { data: paymentsData, isLoading } = usePayments({
    status: statusFilter !== "all" ? statusFilter : undefined,
    method: methodFilter !== "all" ? methodFilter : undefined,
    gradeId: gradeFilter !== "all" ? gradeFilter : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    limit: 20,
    offset,
  })
  const { data: statsData, isLoading: isLoadingStats } = usePaymentStats()
  const { data: gradesData } = useGrades()
  const createPaymentMutation = useCreatePayment()

  // Extract data from query results
  const payments = paymentsData?.payments ?? []
  const pagination = paymentsData?.pagination ?? { total: 0, limit: 20, offset: 0, hasMore: false }
  const stats = statsData ?? null
  const grades = gradesData?.grades ?? []

  // Dialog state
  const [openDepositDialog, setOpenDepositDialog] = useState(false)
  const [openReviewDialog, setOpenReviewDialog] = useState(false)
  const [openRecordPayment, setOpenRecordPayment] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  // Student search state for Record Payment
  const [studentSearchQuery, setStudentSearchQuery] = useState("")
  const [studentSearchResults, setStudentSearchResults] = useState<StudentSearchResult[]>([])
  const [isSearchingStudents, setIsSearchingStudents] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "orange_money" | "">("")
  const [receiptNumber, setReceiptNumber] = useState("")
  const [transactionRef, setTransactionRef] = useState("")
  const [paymentNotes, setPaymentNotes] = useState("")
  const isSubmittingPayment = createPaymentMutation.isPending

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0)
  }, [statusFilter, methodFilter, gradeFilter, startDate, endDate])

  // Click outside handler for student search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle pagination
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

  // Refresh data after dialog actions
  const refreshData = () => {
    invalidate.payments()
    invalidate.accounting()
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

  // Search students with debounce
  const searchStudents = useCallback(async (query: string) => {
    if (query.length < 2) {
      setStudentSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsSearchingStudents(true)
    try {
      const response = await fetch(`/api/students/search?q=${encodeURIComponent(query)}&limit=10`)
      if (!response.ok) throw new Error("Failed to search students")
      const data = await response.json()
      const activeStudents = (data.students || []).filter(
        (s: StudentSearchResult) => s.enrollmentId && s.balanceInfo
      )
      setStudentSearchResults(activeStudents)
      setShowSearchResults(true)
    } catch (err) {
      console.error("Error searching students:", err)
      setStudentSearchResults([])
    } finally {
      setIsSearchingStudents(false)
    }
  }, [])

  // Handle search input change with debounce
  const handleSearchChange = useCallback((value: string) => {
    setStudentSearchQuery(value)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchStudents(value)
    }, 300)
  }, [searchStudents])

  // Handle student selection
  const handleSelectStudent = useCallback((student: StudentSearchResult) => {
    setSelectedStudent(student)
    setStudentSearchQuery("")
    setShowSearchResults(false)
    setStudentSearchResults([])
  }, [])

  // Clear selected student
  const handleClearStudent = useCallback(() => {
    setSelectedStudent(null)
    setStudentSearchQuery("")
  }, [])

  // Reset payment form
  const resetPaymentForm = useCallback(() => {
    setSelectedStudent(null)
    setStudentSearchQuery("")
    setStudentSearchResults([])
    setPaymentAmount("")
    setPaymentMethod("")
    setReceiptNumber("")
    setTransactionRef("")
    setPaymentNotes("")
  }, [])

  // Handle dialog close
  const handleRecordPaymentDialogChange = useCallback((open: boolean) => {
    setOpenRecordPayment(open)
    if (!open) {
      resetPaymentForm()
    }
  }, [resetPaymentForm])

  // Submit payment
  const handleSubmitPayment = useCallback(() => {
    if (!selectedStudent?.enrollmentId || !paymentAmount || !paymentMethod || !receiptNumber) {
      return
    }

    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      return
    }

    if (selectedStudent.balanceInfo && amount > selectedStudent.balanceInfo.remainingBalance) {
      alert(`Le montant dépasse le solde restant de ${formatAmount(selectedStudent.balanceInfo.remainingBalance)}`)
      return
    }

    createPaymentMutation.mutate({
      enrollmentId: selectedStudent.enrollmentId,
      amount,
      method: paymentMethod,
      notes: paymentNotes || undefined,
    }, {
      onSuccess: () => {
        setOffset(0) // Reset to first page
        handleRecordPaymentDialogChange(false)
      },
      onError: (err) => {
        console.error("Error recording payment:", err)
        alert(err instanceof Error ? err.message : "Erreur lors de l'enregistrement du paiement")
      },
    })
  }, [selectedStudent, paymentAmount, paymentMethod, receiptNumber, paymentNotes, handleRecordPaymentDialogChange, createPaymentMutation])

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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {/* Today's Payments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarCheck className="size-4 text-primary" />
              {t.accounting.paymentsToday}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.today.count || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {formatAmount(stats?.today.amount || 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pending Confirmation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="size-4 text-yellow-500" />
              {t.accounting.pendingConfirmation}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold text-yellow-600">{stats?.pending.count || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {formatAmount(stats?.pending.amount || 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Confirmed This Week */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-500" />
              {t.accounting.confirmedThisWeek}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{stats?.confirmedThisWeek.count || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {formatAmount(stats?.confirmedThisWeek.amount || 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* By Method */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="size-4" />
              {t.accounting.byMethod}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-1">
                    <BanknoteIcon className="size-3 text-green-600" />
                    <span className="text-sm font-semibold">{stats?.byMethod.cash.count || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.accounting.cash}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <Smartphone className="size-3 text-orange-500" />
                    <span className="text-sm font-semibold">{stats?.byMethod.orange_money.count || 0}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Orange Money</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filter Card with Record Payment Button */}
      <Card className="mb-6 py-2">
        <CardHeader className="pb-1 px-6 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{t.accounting.filterPayments}</CardTitle>
            <Dialog open={openRecordPayment} onOpenChange={handleRecordPaymentDialogChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.accounting.recordPayment}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t.accounting.recordNewPayment}</DialogTitle>
                  <DialogDescription>
                    {t.accounting.allFieldsRequired}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Student Search */}
                  <div className="space-y-2">
                    <Label>{t.common.student} *</Label>
                    {selectedStudent ? (
                      <div className="p-4 rounded-lg border bg-primary/5 border-primary/30">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <User className="size-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {selectedStudent.firstName} {selectedStudent.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {selectedStudent.studentNumber} • {selectedStudent.grade?.name || "N/A"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClearStudent}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {selectedStudent.balanceInfo && (
                          <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Scolarité</p>
                              <p className="font-medium">{formatAmount(selectedStudent.balanceInfo.tuitionFee)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Payé</p>
                              <p className="font-medium text-success">{formatAmount(selectedStudent.balanceInfo.totalPaid)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Reste</p>
                              <p className="font-medium text-warning">{formatAmount(selectedStudent.balanceInfo.remainingBalance)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div ref={searchContainerRef} className="relative">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder={t.accounting.searchStudent}
                            value={studentSearchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10"
                          />
                          {isSearchingStudents && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                        {showSearchResults && (
                          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-64 overflow-auto">
                            {studentSearchResults.length === 0 ? (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                {studentSearchQuery.length < 2
                                  ? "Tapez au moins 2 caractères pour rechercher"
                                  : "Aucun élève actif trouvé"}
                              </div>
                            ) : (
                              studentSearchResults.map((student) => (
                                <button
                                  key={student.id}
                                  onClick={() => handleSelectStudent(student)}
                                  className="w-full p-3 text-left hover:bg-muted/50 flex items-center gap-3 border-b last:border-b-0"
                                >
                                  <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <User className="size-4 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground truncate">
                                      {student.firstName} {student.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {student.studentNumber} • {student.grade?.name || "N/A"}
                                    </p>
                                  </div>
                                  {student.balanceInfo && (
                                    <div className="text-right shrink-0">
                                      <p className="text-xs text-muted-foreground">Reste</p>
                                      <p className="text-sm font-medium text-warning">
                                        {formatAmount(student.balanceInfo.remainingBalance)}
                                      </p>
                                    </div>
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">{t.accounting.amountGNF} *</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="800000"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                      {selectedStudent?.balanceInfo && paymentAmount && parseFloat(paymentAmount) > selectedStudent.balanceInfo.remainingBalance && (
                        <p className="text-xs text-destructive">
                          Dépasse le solde restant de {formatAmount(selectedStudent.balanceInfo.remainingBalance)}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentType">{t.accounting.paymentType} *</Label>
                      <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "cash" | "orange_money")}>
                        <SelectTrigger id="paymentType">
                          <SelectValue placeholder={t.common.select} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">{t.accounting.cash}</SelectItem>
                          <SelectItem value="orange_money">{t.accounting.mobileMoney}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference">{t.accounting.documentReference} *</Label>
                    <Input
                      id="reference"
                      placeholder={t.accounting.documentReferencePlaceholder}
                      value={receiptNumber}
                      onChange={(e) => setReceiptNumber(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t.accounting.documentReferenceHint}
                    </p>
                  </div>

                  {paymentMethod === "orange_money" && (
                    <div className="space-y-2">
                      <Label htmlFor="transactionRef">Référence transaction Orange Money</Label>
                      <Input
                        id="transactionRef"
                        placeholder="Ex: OM123456789"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="document">{t.accounting.supportingDocument}</Label>
                    <div className="flex items-center gap-2">
                      <Input id="document" type="file" accept=".pdf,.jpg,.jpeg,.png" className="flex-1" />
                      <Button variant="outline" size="icon" className="bg-transparent shrink-0">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {t.accounting.supportingDocumentHint}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">{t.accounting.notesOptional}</Label>
                    <Input
                      id="notes"
                      placeholder={t.accounting.notesPlaceholder}
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleRecordPaymentDialogChange(false)}
                      className="bg-transparent"
                      disabled={isSubmittingPayment}
                    >
                      {t.common.cancel}
                    </Button>
                    <Button
                      onClick={handleSubmitPayment}
                      disabled={
                        isSubmittingPayment ||
                        !selectedStudent?.enrollmentId ||
                        !paymentAmount ||
                        !paymentMethod ||
                        !receiptNumber ||
                        (selectedStudent?.balanceInfo && parseFloat(paymentAmount) > selectedStudent.balanceInfo.remainingBalance)
                      }
                    >
                      {isSubmittingPayment && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {t.accounting.savePayment}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-2 px-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="size-4" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{t.accounting.filterByStatus}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
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
                <SelectTrigger className="w-[160px]">
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
              <Label className="text-xs">{t.accounting.filterByGrade}</Label>
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder={t.accounting.allGrades} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.accounting.allGrades}</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                  ))}
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
                  className="w-[140px]"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-[140px]"
                />
              </div>
            </div>

            {(statusFilter !== "all" || methodFilter !== "all" || gradeFilter !== "all" || startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("all")
                  setMethodFilter("all")
                  setGradeFilter("all")
                  setStartDate("")
                  setEndDate("")
                }}
                className="text-muted-foreground"
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent className="pt-6">
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
