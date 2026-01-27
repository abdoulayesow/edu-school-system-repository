"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Plus,
  Loader2,
  User,
  BanknoteIcon,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  CreditCard,
  ChevronRight,
  Wallet,
  Receipt,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { formatDate as formatDateUtil } from "@/lib/utils"
import { CashDepositDialog, PaymentReviewDialog } from "@/components/payments"

interface Student {
  id: string
  studentNumber: string
  firstName: string
  lastName: string
  photoUrl?: string
}

interface Grade {
  id: string
  name: string
}

interface SchoolYear {
  id: string
  name: string
}

interface Enrollment {
  id: string
  enrollmentNumber: string
  grade: Grade
  schoolYear: SchoolYear
}

interface Balance {
  tuitionFee: number
  totalPaid: number
  totalPending: number
  remainingBalance: number
  paymentPercentage: number
  paymentStatus: "complete" | "on_time" | "late" | "in_advance"
}

interface PaymentSchedule {
  id: string
  scheduleNumber: number
  amount: number
  months: string[]
  dueDate: string
  isPaid: boolean
  paidAmount: number
  remainingAmount: number
}

interface Payment {
  id: string
  amount: number
  method: "cash" | "orange_money"
  status: string
  receiptNumber: string
  transactionRef?: string | null
  recordedAt: string
  autoConfirmAt?: string | null
  enrollment?: {
    student?: {
      firstName: string
      lastName: string
      studentNumber: string
    } | null
    grade?: {
      name: string
    } | null
  } | null
  cashDeposit?: {
    bankReference: string
    depositDate: string
    bankName: string
    depositedByName: string
  } | null
}

interface BalanceData {
  student: Student
  enrollment: Enrollment | null
  balance: Balance | null
  payments: Payment[]
  scheduleProgress: PaymentSchedule[]
}

export default function StudentPaymentsPage() {
  const params = useParams()
  const router = useRouter()
  const { t, locale } = useI18n()
  const studentId = params.id as string

  const [balanceData, setBalanceData] = useState<BalanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [openRecordPayment, setOpenRecordPayment] = useState(false)
  const [openDepositDialog, setOpenDepositDialog] = useState(false)
  const [openReviewDialog, setOpenReviewDialog] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "orange_money" | "">("")
  const [receiptNumber, setReceiptNumber] = useState("")
  const [transactionRef, setTransactionRef] = useState("")
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/students/${studentId}/balance`)
      if (!response.ok) {
        throw new Error("Impossible de charger les données")
      }
      const data = await response.json()
      setBalanceData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Generate receipt number when method changes
  useEffect(() => {
    if (paymentMethod && !receiptNumber) {
      generateReceiptNumber()
    }
  }, [paymentMethod])

  const generateReceiptNumber = async () => {
    if (!paymentMethod) return
    setIsGeneratingReceipt(true)
    try {
      const response = await fetch(`/api/payments/next-receipt-number?method=${paymentMethod}`)
      if (response.ok) {
        const data = await response.json()
        setReceiptNumber(data.receiptNumber)
      }
    } catch (err) {
      console.error("Error generating receipt number:", err)
    } finally {
      setIsGeneratingReceipt(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-GN").format(amount) + " GNF"
  }

  const formatDate = (dateString: string) => {
    return formatDateUtil(dateString, locale)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Confirmé
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
    if (method === "cash") {
      return (
        <Badge variant="outline" className="text-green-600 border-green-600">
          <BanknoteIcon className="h-3 w-3 mr-1" />
          Espèces
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-orange-500 border-orange-500">
        <Smartphone className="h-3 w-3 mr-1" />
        Orange Money
      </Badge>
    )
  }

  const resetPaymentForm = () => {
    setPaymentAmount("")
    setPaymentMethod("")
    setReceiptNumber("")
    setTransactionRef("")
  }

  const handleSubmitPayment = async () => {
    if (!balanceData || !balanceData.balance || !balanceData.enrollment || !paymentAmount || !paymentMethod || !receiptNumber) return

    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) return
    if (amount > balanceData.balance.remainingBalance) {
      alert(`Le montant dépasse le solde restant de ${formatAmount(balanceData.balance.remainingBalance)}`)
      return
    }

    setIsSubmittingPayment(true)
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: balanceData.enrollment.id,
          amount,
          method: paymentMethod,
          receiptNumber,
          transactionRef: transactionRef || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erreur lors de l'enregistrement")
      }

      resetPaymentForm()
      setOpenRecordPayment(false)
      fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'enregistrement")
    } finally {
      setIsSubmittingPayment(false)
    }
  }

  const handleOpenDeposit = (payment: Payment) => {
    setSelectedPayment(payment)
    setOpenDepositDialog(true)
  }

  const handleOpenReview = (payment: Payment) => {
    setSelectedPayment(payment)
    setOpenReviewDialog(true)
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gspn-maroon-500" />
        </div>
      </PageContainer>
    )
  }

  if (error || !balanceData || !balanceData.enrollment || !balanceData.balance) {
    return (
      <PageContainer>
        <div className="text-center py-20">
          <p className="text-destructive">{error || "Aucune inscription active trouvée"}</p>
          <Button variant="outline" onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </PageContainer>
    )
  }

  const { student, enrollment, balance, payments, scheduleProgress } = balanceData
  const { tuitionFee, totalPaid, remainingBalance, paymentPercentage } = balance
  const schedules = scheduleProgress

  return (
    <PageContainer>
      {/* Header */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="h-1 bg-gspn-maroon-500" />
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => router.back()} className="bg-transparent">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                <Wallet className="h-6 w-6 text-gspn-maroon-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Paiements</h1>
                <p className="text-muted-foreground">Suivi des paiements de l'élève</p>
              </div>
            </div>
            <Button
              disabled={remainingBalance <= 0}
              onClick={() => router.push(`/accounting/payments/new?studentId=${studentId}`)}
              className="bg-gspn-gold-500 text-black hover:bg-gspn-gold-400"
            >
              <Plus className="h-4 w-4 mr-2" />
              {locale === "fr" ? "Nouveau paiement" : "New payment"}
            </Button>
        <Dialog open={openRecordPayment} onOpenChange={(open) => {
          setOpenRecordPayment(open)
          if (!open) resetPaymentForm()
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Enregistrer un paiement</DialogTitle>
              <DialogDescription>
                Solde restant: {formatAmount(remainingBalance)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Montant (GNF) *</Label>
                <Input
                  type="number"
                  placeholder="800000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={remainingBalance}
                />
                {paymentAmount && parseFloat(paymentAmount) > remainingBalance && (
                  <p className="text-xs text-destructive">
                    Dépasse le solde restant
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Méthode de paiement *</Label>
                <Select value={paymentMethod} onValueChange={(v) => {
                  setPaymentMethod(v as "cash" | "orange_money")
                  setReceiptNumber("")
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Espèces</SelectItem>
                    <SelectItem value="orange_money">Orange Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Numéro de reçu *</Label>
                <Input
                  value={receiptNumber}
                  readOnly
                  placeholder={isGeneratingReceipt ? "Génération..." : "Sélectionner une méthode"}
                  className="font-mono"
                />
              </div>
              {paymentMethod === "orange_money" && (
                <div className="space-y-2">
                  <Label>Référence transaction OM</Label>
                  <Input
                    placeholder="Ex: OM123456789"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                  />
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenRecordPayment(false)
                    resetPaymentForm()
                  }}
                  disabled={isSubmittingPayment}
                  className="bg-transparent"
                >
                  {locale === "fr" ? "Annuler" : "Cancel"}
                </Button>
                <Button
                  onClick={handleSubmitPayment}
                  disabled={
                    isSubmittingPayment ||
                    !paymentAmount ||
                    !paymentMethod ||
                    !receiptNumber ||
                    parseFloat(paymentAmount) > remainingBalance
                  }
                  className="bg-gspn-gold-500 text-black hover:bg-gspn-gold-400"
                >
                  {isSubmittingPayment && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {locale === "fr" ? "Enregistrer" : "Save"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
          </div>
        </div>
      </div>

      {/* Student Info Card */}
      <Card className="mb-6 border shadow-sm overflow-hidden">
        <div className="h-1 bg-gspn-maroon-500" />
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="size-16 rounded-full bg-gspn-maroon-500/10 flex items-center justify-center ring-2 ring-gspn-maroon-200 dark:ring-gspn-maroon-800">
              {student.photoUrl ? (
                <img src={student.photoUrl} alt="" className="size-16 rounded-full object-cover" />
              ) : (
                <User className="size-8 text-gspn-maroon-500" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-muted-foreground">
                {student.studentNumber} • {enrollment.grade.name}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {enrollment.enrollmentNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{locale === "fr" ? "Scolarité totale" : "Total tuition"}</p>
              <p className="text-2xl font-bold font-mono tabular-nums">{formatAmount(tuitionFee)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Progress - GSPN Brand Styled */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {/* Total Paid Card */}
        <Card className="border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
          <div className="h-1 bg-emerald-500" />
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {locale === "fr" ? "Payé" : "Paid"}
                </p>
                <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatAmount(totalPaid)}
                </p>
              </div>
              <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                <CreditCard className="size-5 text-emerald-500" />
              </div>
            </div>
            <Progress value={paymentPercentage} className="h-2 mt-3 bg-emerald-100 dark:bg-emerald-900/30 [&>div]:bg-emerald-500" />
            <p className="text-xs text-muted-foreground mt-2">{paymentPercentage.toFixed(0)}% {locale === "fr" ? "payé" : "paid"}</p>
          </CardContent>
        </Card>

        {/* Remaining Balance Card */}
        <Card className="border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
          <div className={`h-1 ${remainingBalance === 0 ? 'bg-emerald-500' : 'bg-gspn-maroon-500'}`} />
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {locale === "fr" ? "Restant" : "Remaining"}
                </p>
                <p className={`text-2xl font-bold font-mono tabular-nums ${
                  remainingBalance === 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gspn-maroon-600 dark:text-gspn-maroon-400"
                }`}>
                  {formatAmount(remainingBalance)}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${
                remainingBalance === 0
                  ? 'bg-emerald-500/10'
                  : 'bg-gspn-maroon-500/10'
              }`}>
                <Wallet className={`size-5 ${
                  remainingBalance === 0
                    ? 'text-emerald-500'
                    : 'text-gspn-maroon-500'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Count Card */}
        <Card className="border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
          <div className="h-1 bg-gspn-gold-500" />
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {locale === "fr" ? "Paiements" : "Payments"}
                </p>
                <p className="text-2xl font-bold font-mono tabular-nums text-gspn-gold-600 dark:text-gspn-gold-400">
                  {payments.length}
                </p>
              </div>
              <div className="p-2.5 bg-gspn-gold-500/10 rounded-xl">
                <Receipt className="size-5 text-gspn-gold-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {locale === "fr" ? "transactions enregistrées" : "recorded transactions"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Schedules */}
      <Card className="mb-6 border shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            Échéancier de paiement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`p-4 rounded-lg border transition-shadow hover:shadow-md ${
                  schedule.isPaid
                    ? "bg-success/5 border-success/30"
                    : "bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Tranche {schedule.scheduleNumber}</span>
                  {schedule.isPaid ? (
                    <Badge className="bg-success text-success-foreground">Payé</Badge>
                  ) : (
                    <Badge variant="outline">En attente</Badge>
                  )}
                </div>
                <p className="text-xl font-bold">{formatAmount(schedule.amount)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {schedule.months.join(", ")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Échéance: {formatDate(schedule.dueDate)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            Historique des paiements
          </CardTitle>
          <CardDescription>
            {payments.length} paiement{payments.length > 1 ? "s" : ""} enregistré{payments.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun paiement enregistré
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Reçu</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>{formatDate(payment.recordedAt)}</TableCell>
                      <TableCell className="font-mono text-sm">{payment.receiptNumber}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatAmount(payment.amount)}
                      </TableCell>
                      <TableCell>{getMethodBadge(payment.method)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right">
                        {payment.status === "pending_deposit" && payment.method === "cash" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/50"
                            onClick={() => handleOpenDeposit(payment)}
                          >
                            <BanknoteIcon className="h-3 w-3 mr-1" />
                            {locale === "fr" ? "Dépôt" : "Deposit"}
                          </Button>
                        )}
                        {(payment.status === "pending_review" || payment.status === "deposited") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/50"
                            onClick={() => handleOpenReview(payment)}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {locale === "fr" ? "Valider" : "Review"}
                          </Button>
                        )}
                        {payment.status === "confirmed" && (
                          <span className="text-xs text-success">{locale === "fr" ? "Confirmé" : "Confirmed"}</span>
                        )}
                        {payment.status === "rejected" && (
                          <span className="text-xs text-destructive">{locale === "fr" ? "Rejeté" : "Rejected"}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CashDepositDialog
        payment={selectedPayment}
        open={openDepositDialog}
        onOpenChange={setOpenDepositDialog}
        onSuccess={fetchData}
      />
      <PaymentReviewDialog
        payment={selectedPayment}
        open={openReviewDialog}
        onOpenChange={setOpenReviewDialog}
        onSuccess={fetchData}
      />
    </PageContainer>
  )
}
