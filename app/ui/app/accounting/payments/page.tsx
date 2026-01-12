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
  Plus,
  CalendarCheck,
  Wallet,
  Search,
  X,
  User,
  Upload,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { formatDate } from "@/lib/utils"
import { usePayments, usePaymentStats, useGrades, useCreatePayment, useInvalidateQueries } from "@/lib/hooks/use-api"
import { getPaymentRowStatus } from "@/lib/status-helpers"
import { cn } from "@/lib/utils"

// Custom hook for counting animation
function useCountUp(end: number, duration: number = 800, enabled: boolean = true) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const animationRef = useRef<number | undefined>(undefined)
  const previousEnd = useRef(end)

  useEffect(() => {
    if (!enabled) {
      setCount(end)
      return
    }

    // Only animate if the value actually changed
    if (previousEnd.current === end && count !== 0) {
      return
    }
    previousEnd.current = end

    const startTime = performance.now()
    const startValue = countRef.current

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentCount = Math.floor(startValue + (end - startValue) * easeOut)

      countRef.current = currentCount
      setCount(currentCount)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setCount(end)
        countRef.current = end
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [end, duration, enabled, count])

  return count
}

interface Payment {
  id: string
  amount: number
  method: "cash" | "orange_money"
  status: "confirmed" | "reversed" | "failed"
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

  // Animation state
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

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
  const [openRecordPayment, setOpenRecordPayment] = useState(false)

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
            Annulé
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Échoué
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

  // Counting animations for stats
  const todayAmount = useCountUp(stats?.today?.amount || 0, 1200, hasAnimated && !isLoadingStats)
  const todayCount = useCountUp(stats?.today?.count || 0, 800, hasAnimated && !isLoadingStats)
  const pendingCountAnim = useCountUp(stats?.pending?.count || 0, 800, hasAnimated && !isLoadingStats)
  const weekCount = useCountUp(stats?.confirmedThisWeek?.count || 0, 800, hasAnimated && !isLoadingStats)
  const cashCount = useCountUp(stats?.byMethod?.cash?.count || 0, 800, hasAnimated && !isLoadingStats)
  const mobileCount = useCountUp(stats?.byMethod?.orange_money?.count || 0, 800, hasAnimated && !isLoadingStats)

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
        <Dialog open={openRecordPayment} onOpenChange={handleRecordPaymentDialogChange}>
          <DialogTrigger asChild>
            <Button variant="gold" size="lg" className="shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5">
              <Plus className="h-5 w-5 mr-2" />
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

      {/* Hero Stats Section - Redesigned with Animations */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Main Hero Card - Today's Collection */}
        <Card className={cn(
          "lg:col-span-2 border-2 shadow-xl transition-all duration-700",
          currentHeroStyle.bg,
          currentHeroStyle.border,
          currentHeroStyle.glow,
          // Fade-in animation
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        )}>
          <CardContent className="pt-6 pb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Left: Big Number */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarCheck className={cn("size-5 transition-transform duration-500", currentHeroStyle.accent, isVisible && "scale-100 rotate-0", !isVisible && "scale-0 rotate-45")} />
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {t.accounting.paymentsToday}
                  </span>
                </div>
                {isLoadingStats ? (
                  <div className="h-16 flex items-center">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <p className="font-accent text-5xl md:text-6xl font-bold tracking-tight tabular-nums">
                      {formatAmount(todayAmount)}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="secondary" className="font-semibold">
                        {todayCount} {todayCount === 1 ? "paiement" : "paiements"}
                      </Badge>
                      {todayCount > 0 && (
                        <span className={cn(
                          "flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 transition-all duration-500",
                          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                        )}>
                          <TrendingUp className="size-4" />
                          Actif
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Right: Pending Alert or Success State */}
              <div className={cn(
                "flex flex-col items-center justify-center p-6 rounded-xl min-w-[180px] transition-all duration-500",
                pendingCount > 0
                  ? "bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700"
                  : "bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-300 dark:border-emerald-700",
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              )}>
                {isLoadingStats ? (
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                ) : pendingCount > 0 ? (
                  <>
                    <Clock className={cn(
                      "size-8 text-amber-600 dark:text-amber-400 mb-2 transition-transform duration-700",
                      isVisible && "rotate-0", !isVisible && "-rotate-180"
                    )} />
                    <span className="text-3xl font-bold text-amber-700 dark:text-amber-300">{pendingCountAnim}</span>
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      {t.accounting.pendingConfirmation}
                    </span>
                    <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
                      {formatAmount(stats?.pending?.amount || 0)}
                    </p>
                  </>
                ) : (
                  <>
                    <Sparkles className={cn(
                      "size-8 text-emerald-600 dark:text-emerald-400 mb-2 transition-all duration-700",
                      isVisible && "rotate-0 scale-100", !isVisible && "rotate-90 scale-0"
                    )} />
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 text-center">
                      Tout est à jour !
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Stats Stack with Staggered Animation */}
        <div className="flex flex-col gap-4">
          {/* Confirmed This Week */}
          <Card className={cn(
            "flex-1 border hover:shadow-md transition-all duration-700 delay-150",
            isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4"
          )}>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className={cn(
                      "size-4 text-emerald-500 transition-transform duration-500 delay-200",
                      isVisible && "scale-100", !isVisible && "scale-0"
                    )} />
                    {t.accounting.confirmedThisWeek}
                  </p>
                  {isLoadingStats ? (
                    <Loader2 className="size-5 animate-spin text-muted-foreground mt-2" />
                  ) : (
                    <div className="mt-1">
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {weekCount}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({formatAmount(stats?.confirmedThisWeek?.amount || 0)})
                      </span>
                    </div>
                  )}
                </div>
                <ArrowUpRight className={cn(
                  "size-5 text-emerald-500 transition-all duration-500 delay-300",
                  isVisible && "opacity-100 translate-x-0 translate-y-0", !isVisible && "opacity-0 translate-x-1 translate-y-1"
                )} />
              </div>
            </CardContent>
          </Card>

          {/* By Method Card */}
          <Card className={cn(
            "flex-1 border hover:shadow-md transition-all duration-700 delay-300",
            isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4"
          )}>
            <CardContent className="pt-5 pb-5">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
                <Wallet className={cn(
                  "size-4 transition-transform duration-500 delay-400",
                  isVisible && "scale-100 rotate-0", !isVisible && "scale-0 -rotate-90"
                )} />
                {t.accounting.byMethod}
              </p>
              {isLoadingStats ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : (
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "flex items-center gap-2 transition-all duration-500 delay-500",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  )}>
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 transition-transform hover:scale-110 duration-200">
                      <BanknoteIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-lg font-bold">{cashCount}</span>
                      <p className="text-xs text-muted-foreground">{t.accounting.cash}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 transition-all duration-500 delay-[600ms]",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  )}>
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 transition-transform hover:scale-110 duration-200">
                      <Smartphone className="size-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <span className="text-lg font-bold">{mobileCount}</span>
                      <p className="text-xs text-muted-foreground">Mobile</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Filter Section with Animations */}
      <Card className={cn(
        "mb-6 border shadow-sm transition-all duration-700 delay-[400ms]",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <CardContent className="pt-5 pb-4 px-6">
          <div className="flex flex-col gap-4">
            {/* Filter Header with Quick Date Presets */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Search className={cn(
                  "size-4 text-muted-foreground transition-transform duration-500 delay-[450ms]",
                  isVisible && "scale-100 rotate-0", !isVisible && "scale-0 rotate-90"
                )} />
                <span className="text-sm font-medium text-muted-foreground">{t.accounting.filterPayments}</span>
                {(statusFilter !== "all" || methodFilter !== "all" || gradeFilter !== "all" || startDate || endDate) && (
                  <Badge variant="secondary" className="ml-2 font-normal animate-in fade-in slide-in-from-left-2 duration-300">
                    {[
                      statusFilter !== "all" ? 1 : 0,
                      methodFilter !== "all" ? 1 : 0,
                      gradeFilter !== "all" ? 1 : 0,
                      startDate || endDate ? 1 : 0
                    ].reduce((a, b) => a + b, 0)} actif(s)
                  </Badge>
                )}
              </div>

              {/* Quick Date Presets */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">Période:</span>
                <div className="flex rounded-lg border bg-muted/30 p-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 px-3 text-xs rounded-md transition-all duration-200",
                      !startDate && !endDate
                        ? "bg-background shadow-sm font-medium scale-105"
                        : "hover:bg-background/50 hover:scale-105"
                    )}
                    onClick={() => {
                      setStartDate("")
                      setEndDate("")
                    }}
                  >
                    Tout
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 px-3 text-xs rounded-md transition-all duration-200",
                      startDate === new Date().toISOString().split("T")[0] && endDate === new Date().toISOString().split("T")[0]
                        ? "bg-background shadow-sm font-medium scale-105"
                        : "hover:bg-background/50 hover:scale-105"
                    )}
                    onClick={() => {
                      const today = new Date().toISOString().split("T")[0]
                      setStartDate(today)
                      setEndDate(today)
                    }}
                  >
                    Aujourd&apos;hui
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs rounded-md transition-all duration-200 hover:bg-background/50 hover:scale-105"
                    onClick={() => {
                      const today = new Date()
                      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                      setStartDate(weekAgo.toISOString().split("T")[0])
                      setEndDate(today.toISOString().split("T")[0])
                    }}
                  >
                    7 jours
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs rounded-md transition-all duration-200 hover:bg-background/50 hover:scale-105"
                    onClick={() => {
                      const today = new Date()
                      const monthAgo = new Date(today.getFullYear(), today.getMonth(), 1)
                      setStartDate(monthAgo.toISOString().split("T")[0])
                      setEndDate(today.toISOString().split("T")[0])
                    }}
                  >
                    Ce mois
                  </Button>
                </div>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-end gap-3">
              {/* Status Filter - Pill Style */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t.accounting.filterByStatus}</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className={cn(
                    "w-[160px] h-9 transition-all",
                    statusFilter !== "all" && "border-primary/50 bg-primary/5"
                  )}>
                    <SelectValue placeholder={t.accounting.allStatuses} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.accounting.allStatuses}</SelectItem>
                    <SelectItem value="confirmed">
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        {t.accounting.confirmed}
                      </span>
                    </SelectItem>
                    <SelectItem value="reversed">
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-orange-500" />
                        Annulé
                      </span>
                    </SelectItem>
                    <SelectItem value="failed">
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-red-500" />
                        Échoué
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Method Filter */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t.accounting.filterByMethod}</Label>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className={cn(
                    "w-[160px] h-9 transition-all",
                    methodFilter !== "all" && "border-primary/50 bg-primary/5"
                  )}>
                    <SelectValue placeholder={t.accounting.allMethods} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.accounting.allMethods}</SelectItem>
                    <SelectItem value="cash">
                      <span className="flex items-center gap-2">
                        <BanknoteIcon className="size-3 text-emerald-600" />
                        {t.accounting.cashPayments}
                      </span>
                    </SelectItem>
                    <SelectItem value="orange_money">
                      <span className="flex items-center gap-2">
                        <Smartphone className="size-3 text-orange-500" />
                        {t.accounting.orangeMoneyPayments}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Grade Filter */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t.accounting.filterByGrade}</Label>
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger className={cn(
                    "w-[160px] h-9 transition-all",
                    gradeFilter !== "all" && "border-primary/50 bg-primary/5"
                  )}>
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

              {/* Custom Date Range */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t.accounting.filterByDate}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={cn(
                      "w-[130px] h-9 transition-all",
                      startDate && "border-primary/50 bg-primary/5"
                    )}
                  />
                  <span className="text-muted-foreground text-sm">→</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={cn(
                      "w-[130px] h-9 transition-all",
                      endDate && "border-primary/50 bg-primary/5"
                    )}
                  />
                </div>
              </div>

              {/* Clear All */}
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
                  className="h-9 text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3 mr-1" />
                  Effacer
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table - Enhanced with Animations */}
      <Card className={cn(
        "border shadow-sm overflow-hidden transition-all duration-700 delay-[500ms]",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="relative">
                <Loader2 className="size-8 animate-spin text-primary" />
                <div className="absolute inset-0 size-8 animate-ping text-primary/20">
                  <Loader2 className="size-8" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">Chargement des paiements...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 animate-in fade-in duration-500">
              <div className="p-4 rounded-full bg-muted animate-in zoom-in duration-500 delay-100">
                <BanknoteIcon className="size-8 text-muted-foreground" />
              </div>
              <div className="text-center animate-in slide-in-from-bottom-4 duration-500 delay-200">
                <p className="font-medium text-foreground">{t.accounting.noPaymentsFound}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Modifiez vos filtres ou enregistrez un nouveau paiement
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold">{t.accounting.transactionId}</TableHead>
                      <TableHead className="font-semibold">{t.common.student}</TableHead>
                      <TableHead className="text-right font-semibold">{t.common.amount}</TableHead>
                      <TableHead className="font-semibold">{t.accounting.method}</TableHead>
                      <TableHead className="font-semibold">{t.common.date}</TableHead>
                      <TableHead className="font-semibold">{t.common.status}</TableHead>
                      <TableHead className="font-semibold">{t.accounting.reference}</TableHead>
                      <TableHead className="text-right font-semibold">{t.common.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment, index) => {
                      // Get status color for left border
                      const statusColors: Record<string, string> = {
                        confirmed: "border-l-emerald-500",
                        reversed: "border-l-orange-500",
                        failed: "border-l-red-500",
                      }
                      const borderColor = statusColors[payment.status] || "border-l-transparent"

                      // Get student initials
                      const firstName = payment.enrollment?.student?.firstName || ""
                      const lastName = payment.enrollment?.student?.lastName || ""
                      const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?"

                      return (
                        <TableRow
                          key={payment.id}
                          status={getPaymentRowStatus(payment.status)}
                          className={cn(
                            "border-l-4 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm group",
                            borderColor,
                            index % 2 === 0 ? "bg-background" : "bg-muted/10"
                          )}
                        >
                          <TableCell className="font-mono text-sm font-medium text-primary">
                            {payment.receiptNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:bg-primary/20">
                                <span className="text-xs font-semibold text-primary">{initials}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {firstName || "N/A"} {lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {payment.enrollment?.grade?.name ?? "-"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-accent text-lg font-bold tabular-nums transition-colors duration-200 group-hover:text-primary">
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
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-300">
                                <CheckCircle2 className="size-3" />
                                {t.accounting.completed}
                              </span>
                            )}
                            {payment.status === "reversed" && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 animate-in fade-in duration-300">
                                <RefreshCw className="size-3" />
                                Annulé
                              </span>
                            )}
                            {payment.status === "failed" && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 animate-in fade-in duration-300">
                                <XCircle className="size-3" />
                                Échoué
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
                  <p className="text-sm text-muted-foreground">
                    Affichage <span className="font-medium text-foreground">{pagination.offset + 1}</span>
                    {" - "}
                    <span className="font-medium text-foreground">
                      {Math.min(pagination.offset + pagination.limit, pagination.total)}
                    </span>
                    {" sur "}
                    <span className="font-medium text-foreground">{pagination.total}</span> résultats
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={pagination.offset === 0}
                      className="bg-background hover:bg-muted"
                    >
                      <ChevronLeft className="size-4 mr-1" />
                      Précédent
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

    </PageContainer>
  )
}
