"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Wallet,
  TrendingUp,
  TrendingDown,
  BanknoteIcon,
  Smartphone,
  Search,
  X,
  User,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { useI18n, interpolate } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
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


interface BalanceSummary {
  totalConfirmedPayments: number
  totalPendingPayments: number
  totalPaidExpenses: number
  totalPendingExpenses: number
  cashAvailable: number
  cashPending: number
  margin: number
}

interface BalanceData {
  summary: BalanceSummary
  payments: {
    byStatus: Record<string, { count: number; amount: number }>
    byMethod: Record<string, { count: number; amount: number; confirmed: number }>
    byGrade: Record<string, { count: number; amount: number; confirmed: number }>
    total: { count: number; amount: number }
  }
  expenses: {
    byStatus: Record<string, { count: number; amount: number }>
    byCategory: Record<string, { count: number; amount: number }>
    total: { count: number; amount: number }
  }
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

export default function AccountingPage() {
  const { t } = useI18n()
  const [isMounted, setIsMounted] = useState(false)
  const [openRecordPayment, setOpenRecordPayment] = useState(false)
  const [openDepositDialog, setOpenDepositDialog] = useState(false)
  const [openReviewDialog, setOpenReviewDialog] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  // Data state
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])

  // Loading states
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [isLoadingPayments, setIsLoadingPayments] = useState(true)

  // Student search state
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
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)

  // Fetch balance data
  useEffect(() => {
    async function fetchBalance() {
      try {
        setIsLoadingBalance(true)
        const response = await fetch("/api/accounting/balance")
        if (!response.ok) throw new Error("Failed to fetch balance")
        const data = await response.json()
        setBalanceData(data)
      } catch (err) {
        console.error("Error fetching balance:", err)
      } finally {
        setIsLoadingBalance(false)
      }
    }
    fetchBalance()
  }, [])

  // Fetch payments
  useEffect(() => {
    async function fetchPayments() {
      try {
        setIsLoadingPayments(true)
        const response = await fetch("/api/payments?limit=50")
        if (!response.ok) throw new Error("Failed to fetch payments")
        const data = await response.json()
        setPayments(data.payments || [])
      } catch (err) {
        console.error("Error fetching payments:", err)
      } finally {
        setIsLoadingPayments(false)
      }
    }
    fetchPayments()
  }, [])


  // Click outside handler for search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Client-side mount detection for hydration-safe Tabs rendering
  useEffect(() => {
    setIsMounted(true)
  }, [])

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
      // Filter out students without enrollment (not active for current year)
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
  const handleDialogChange = useCallback((open: boolean) => {
    setOpenRecordPayment(open)
    if (!open) {
      resetPaymentForm()
    }
  }, [resetPaymentForm])

  // Submit payment
  const handleSubmitPayment = useCallback(async () => {
    if (!selectedStudent?.enrollmentId || !paymentAmount || !paymentMethod || !receiptNumber) {
      return
    }

    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      return
    }

    // Check amount doesn't exceed remaining balance
    if (selectedStudent.balanceInfo && amount > selectedStudent.balanceInfo.remainingBalance) {
      alert(`Le montant dépasse le solde restant de ${formatAmount(selectedStudent.balanceInfo.remainingBalance)}`)
      return
    }

    setIsSubmittingPayment(true)
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: selectedStudent.enrollmentId,
          amount,
          method: paymentMethod,
          receiptNumber,
          transactionRef: transactionRef || undefined,
          notes: paymentNotes || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to record payment")
      }

      // Refresh payments list
      const paymentsResponse = await fetch("/api/payments?limit=50")
      if (paymentsResponse.ok) {
        const data = await paymentsResponse.json()
        setPayments(data.payments || [])
      }

      // Refresh balance
      const balanceResponse = await fetch("/api/accounting/balance")
      if (balanceResponse.ok) {
        const data = await balanceResponse.json()
        setBalanceData(data)
      }

      handleDialogChange(false)
    } catch (err) {
      console.error("Error recording payment:", err)
      alert(err instanceof Error ? err.message : "Erreur lors de l'enregistrement du paiement")
    } finally {
      setIsSubmittingPayment(false)
    }
  }, [selectedStudent, paymentAmount, paymentMethod, receiptNumber, transactionRef, paymentNotes, handleDialogChange])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_deposit":
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500">
            <BanknoteIcon className="h-3 w-3 mr-1" />
            En attente dépôt
          </Badge>
        )
      case "deposited":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500">
            <Clock className="h-3 w-3 mr-1" />
            Déposé
          </Badge>
        )
      case "pending_review":
        return (
          <Badge variant="outline" className="text-warning border-warning">
            <Clock className="h-3 w-3 mr-1" />
            {t.accounting.unvalidated}
          </Badge>
        )
      case "confirmed":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t.accounting.validated}
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejeté
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
            Espèces
          </Badge>
        )
      case "orange_money":
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500">
            <Smartphone className="h-3 w-3 mr-1" />
            Orange Money
          </Badge>
        )
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-GN').format(amount) + " GNF"
  }

  // Refresh data after dialog actions
  const refreshData = async () => {
    // Refresh payments
    const paymentsResponse = await fetch("/api/payments?limit=50")
    if (paymentsResponse.ok) {
      const data = await paymentsResponse.json()
      setPayments(data.payments || [])
    }
    // Refresh balance
    const balanceResponse = await fetch("/api/accounting/balance")
    if (balanceResponse.ok) {
      const data = await balanceResponse.json()
      setBalanceData(data)
    }
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

  return (
    <PageContainer maxWidth="full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.accounting.title}</h1>
          <p className="text-muted-foreground">{t.accounting.subtitle}</p>
        </div>

        {/* Balance Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="size-4 text-success" />
                Paiements confirmés
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold text-success">
                  {formatAmount(balanceData?.summary.totalConfirmedPayments || 0)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="size-4 text-warning" />
                Paiements en attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold text-warning">
                  {formatAmount(balanceData?.summary.totalPendingPayments || 0)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="size-4 text-destructive" />
                Dépenses payées
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold text-destructive">
                  {formatAmount(balanceData?.summary.totalPaidExpenses || 0)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="size-4 text-primary" />
                Marge nette
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold text-primary">
                  {formatAmount(balanceData?.summary.margin || 0)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {isMounted ? (
        <Tabs defaultValue="balance" className="space-y-6">
          <TabsList>
            <TabsTrigger value="balance">{t.accounting.tabBalance}</TabsTrigger>
            <TabsTrigger value="payments">{t.accounting.tabPayments}</TabsTrigger>
          </TabsList>

          {/* Balance Overview Tab */}
          <TabsContent value="balance" className="space-y-6">
            {/* Breakdown by Payment Method */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.accounting.byMethod}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingBalance ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                            <BanknoteIcon className="size-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{t.accounting.cashPayments}</p>
                            <p className="text-xs text-muted-foreground">
                              {balanceData?.payments.byMethod.cash?.count || 0} transactions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatAmount(balanceData?.payments.byMethod.cash?.amount || 0)}</p>
                          <p className="text-xs text-success">
                            {formatAmount(balanceData?.payments.byMethod.cash?.confirmed || 0)} confirmé
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                            <Smartphone className="size-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium">{t.accounting.orangeMoneyPayments}</p>
                            <p className="text-xs text-muted-foreground">
                              {balanceData?.payments.byMethod.orange_money?.count || 0} transactions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatAmount(balanceData?.payments.byMethod.orange_money?.amount || 0)}</p>
                          <p className="text-xs text-success">
                            {formatAmount(balanceData?.payments.byMethod.orange_money?.confirmed || 0)} confirmé
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Breakdown by Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.accounting.byStatus}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingBalance ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-orange-500" />
                          <span className="text-sm">{t.accounting.pendingDeposit}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{formatAmount(balanceData?.payments.byStatus.pending_deposit?.amount || 0)}</span>
                          <span className="text-xs text-muted-foreground ml-2">({balanceData?.payments.byStatus.pending_deposit?.count || 0})</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-blue-500" />
                          <span className="text-sm">{t.accounting.deposited}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{formatAmount(balanceData?.payments.byStatus.deposited?.amount || 0)}</span>
                          <span className="text-xs text-muted-foreground ml-2">({balanceData?.payments.byStatus.deposited?.count || 0})</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-yellow-500" />
                          <span className="text-sm">{t.accounting.pendingReview}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{formatAmount(balanceData?.payments.byStatus.pending_review?.amount || 0)}</span>
                          <span className="text-xs text-muted-foreground ml-2">({balanceData?.payments.byStatus.pending_review?.count || 0})</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-green-500" />
                          <span className="text-sm">{t.accounting.confirmed}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{formatAmount(balanceData?.payments.byStatus.confirmed?.amount || 0)}</span>
                          <span className="text-xs text-muted-foreground ml-2">({balanceData?.payments.byStatus.confirmed?.count || 0})</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-red-500" />
                          <span className="text-sm">{t.accounting.rejected}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{formatAmount(balanceData?.payments.byStatus.rejected?.amount || 0)}</span>
                          <span className="text-xs text-muted-foreground ml-2">({balanceData?.payments.byStatus.rejected?.count || 0})</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Breakdown by Grade */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t.accounting.byGrade}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingBalance ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : balanceData?.payments.byGrade && Object.keys(balanceData.payments.byGrade).length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Object.entries(balanceData.payments.byGrade)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([grade, data]) => (
                        <div key={grade} className="p-3 rounded-lg border bg-card">
                          <p className="font-medium text-sm">{grade}</p>
                          <p className="text-lg font-bold">{formatAmount(data.amount)}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                            <span>{data.count} paiements</span>
                            <span className="text-success">{formatAmount(data.confirmed)} confirmé</span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">Aucune donnée disponible</p>
                )}
              </CardContent>
            </Card>

            {/* Link to full payments page */}
            <div className="flex justify-center">
              <Button asChild variant="outline" className="bg-transparent">
                <Link href="/accounting/payments">
                  {t.accounting.viewAllPayments}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>

          {/* Payment Recording Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle>{t.accounting.paymentTransactions}</CardTitle>
                    <CardDescription>
                      {isLoadingPayments
                        ? "Chargement..."
                        : `${payments.length} transactions`}
                    </CardDescription>
                  </div>
                  <Dialog open={openRecordPayment} onOpenChange={handleDialogChange}>
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
                            onClick={() => handleDialogChange(false)}
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
              <CardContent>
                {isLoadingPayments ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucun paiement enregistré
                  </div>
                ) : (
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
                              {new Date(payment.recordedAt).toLocaleDateString('fr-FR')}
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
                                  Dépôt
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
                                <span className="text-xs text-destructive">Rejeté</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        ) : (
          <div className="space-y-6">
            <div className="h-10 w-48 bg-muted animate-pulse rounded-md" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-48 bg-muted animate-pulse rounded-lg" />
              <div className="h-48 bg-muted animate-pulse rounded-lg" />
            </div>
          </div>
        )}

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
