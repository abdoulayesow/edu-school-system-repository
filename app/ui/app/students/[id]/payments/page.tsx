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
            En attente validation
          </Badge>
        )
      case "confirmed":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Confirmé
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
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="bg-transparent">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Paiements</h1>
            <p className="text-muted-foreground">Suivi des paiements de l'élève</p>
          </div>
        </div>
        <Dialog open={openRecordPayment} onOpenChange={(open) => {
          setOpenRecordPayment(open)
          if (!open) resetPaymentForm()
        }}>
          <DialogTrigger asChild>
            <Button disabled={remainingBalance <= 0} className="bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700">
              <Plus className="h-4 w-4 mr-2" />
              {locale === "fr" ? "Nouveau paiement" : "New payment"}
            </Button>
          </DialogTrigger>
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
                  className="bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                >
                  {isSubmittingPayment && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {locale === "fr" ? "Enregistrer" : "Save"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Student Info Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
              {student.photoUrl ? (
                <img src={student.photoUrl} alt="" className="size-16 rounded-full object-cover" />
              ) : (
                <User className="size-8 text-primary" />
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
              <p className="text-sm text-muted-foreground">Scolarité totale</p>
              <p className="text-2xl font-bold">{formatAmount(tuitionFee)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Progress */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payé</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{formatAmount(totalPaid)}</p>
            <Progress value={paymentPercentage} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{paymentPercentage.toFixed(0)}% payé</p>
          </CardContent>
        </Card>
        <Card className={remainingBalance > 0 ? "bg-amber-50/50 dark:bg-amber-950/20" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{locale === "fr" ? "Restant" : "Remaining"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${remainingBalance > 0 ? "text-amber-600 dark:text-amber-400" : "text-success"}`}>
              {formatAmount(remainingBalance)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paiements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{payments.length}</p>
            <p className="text-xs text-muted-foreground mt-1">transactions enregistrées</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Schedules */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Échéancier de paiement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`p-4 rounded-lg border ${
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
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
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reçu</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
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
