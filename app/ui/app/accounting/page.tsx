"use client"

import { useState, useEffect, useMemo } from "react"
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
  DollarSign,
  Link2,
  Flag,
  Lock,
  Loader2,
  Wallet,
  TrendingUp,
  TrendingDown,
  BanknoteIcon,
  Smartphone
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useI18n, interpolate } from "@/components/i18n-provider"

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

interface BankDeposit {
  id: string
  bankReference: string
  amount: number
  depositDate: string
  bankName: string
  depositorName: string
  isReconciled: boolean
  reconciledAmount: number
  recorder: { id: string; name: string }
  reconciler: { id: string; name: string } | null
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
    total: { count: number; amount: number }
  }
  expenses: {
    byStatus: Record<string, { count: number; amount: number }>
    byCategory: Record<string, { count: number; amount: number }>
    total: { count: number; amount: number }
  }
}

export default function AccountingPage() {
  const { t } = useI18n()
  const [openRecordPayment, setOpenRecordPayment] = useState(false)
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])
  const [selectedDeposit, setSelectedDeposit] = useState<string | null>(null)

  // Data state
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [bankDeposits, setBankDeposits] = useState<BankDeposit[]>([])

  // Loading states
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [isLoadingPayments, setIsLoadingPayments] = useState(true)
  const [isLoadingDeposits, setIsLoadingDeposits] = useState(true)

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

  // Fetch bank deposits
  useEffect(() => {
    async function fetchDeposits() {
      try {
        setIsLoadingDeposits(true)
        const response = await fetch("/api/bank-deposits?limit=50")
        if (!response.ok) throw new Error("Failed to fetch deposits")
        const data = await response.json()
        setBankDeposits(data.deposits || [])
      } catch (err) {
        console.error("Error fetching deposits:", err)
      } finally {
        setIsLoadingDeposits(false)
      }
    }
    fetchDeposits()
  }, [])

  // Get payments that are ready for reconciliation (deposited status)
  const validatedPayments = useMemo(() => {
    return payments.filter(p => p.status === "deposited" || p.status === "pending_review")
  }, [payments])

  // Get unreconciled bank deposits
  const unreconciledDeposits = useMemo(() => {
    return bankDeposits.filter(d => !d.isReconciled)
  }, [bankDeposits])

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
            <DollarSign className="h-3 w-3 mr-1" />
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

  const selectedTotal = validatedPayments
    .filter((p) => selectedPayments.includes(p.id))
    .reduce((sum, p) => sum + p.amount, 0)

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-GN').format(amount) + " GNF"
  }

  return (
    <div className="min-h-screen bg-background pt-4 lg:pt-4">
      <main className="container mx-auto px-4 py-4">
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

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="payments">{t.accounting.tabPayments}</TabsTrigger>
            <TabsTrigger value="reconciliation">{t.accounting.tabReconciliation}</TabsTrigger>
            <TabsTrigger value="period-close">{t.accounting.tabPeriodClose}</TabsTrigger>
          </TabsList>

          {/* Payment Recording Screen */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t.accounting.paymentTransactions}</CardTitle>
                    <CardDescription>
                      {isLoadingPayments
                        ? "Chargement..."
                        : `${payments.length} transactions`}
                    </CardDescription>
                  </div>
                  <Dialog open={openRecordPayment} onOpenChange={setOpenRecordPayment}>
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
                        <div className="space-y-2">
                          <Label htmlFor="student">{t.common.student} *</Label>
                          <Select>
                            <SelectTrigger id="student">
                              <SelectValue placeholder={t.accounting.searchStudent} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="search">Rechercher un étudiant...</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="amount">{t.accounting.amountGNF} *</Label>
                            <Input id="amount" type="number" placeholder="800000" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="paymentType">{t.accounting.paymentType} *</Label>
                            <Select>
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
                          <Input id="reference" placeholder={t.accounting.documentReferencePlaceholder} />
                          <p className="text-xs text-muted-foreground">
                            {t.accounting.documentReferenceHint}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="document">{t.accounting.supportingDocument} *</Label>
                          <div className="flex items-center gap-2">
                            <Input id="document" type="file" accept=".pdf,.jpg,.jpeg,.png" className="flex-1" />
                            <Button variant="outline" size="icon" className="bg-transparent shrink-0">
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {t.accounting.supportingDocumentHint}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes">{t.accounting.notesOptional}</Label>
                          <Input id="notes" placeholder={t.accounting.notesPlaceholder} />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setOpenRecordPayment(false)}
                            className="bg-transparent"
                          >
                            {t.common.cancel}
                          </Button>
                          <Button onClick={() => setOpenRecordPayment(false)}>{t.accounting.savePayment}</Button>
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
                              {payment.status === "pending_review" && (
                                <Button size="sm" variant="outline" className="bg-transparent">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  {t.accounting.validate}
                                </Button>
                              )}
                              {payment.status === "deposited" && (
                                <span className="text-xs text-muted-foreground">{t.accounting.readyForReconciliation}</span>
                              )}
                              {payment.status === "confirmed" && (
                                <span className="text-xs text-success">{t.accounting.completed}</span>
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

          {/* Reconciliation Screen */}
          <TabsContent value="reconciliation" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Panel: Validated Payments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    {t.accounting.validatedPayments}
                  </CardTitle>
                  <CardDescription>
                    {isLoadingPayments
                      ? "Chargement..."
                      : `${validatedPayments.length} paiements à réconcilier`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPayments ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : validatedPayments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun paiement à réconcilier
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {validatedPayments.map((payment) => (
                        <div
                          key={payment.id}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                            selectedPayments.includes(payment.id)
                              ? "border-primary bg-primary/5"
                              : "border-border bg-card hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedPayments.includes(payment.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedPayments([...selectedPayments, payment.id])
                                } else {
                                  setSelectedPayments(selectedPayments.filter((id) => id !== payment.id))
                                }
                              }}
                            />
                            <div>
                              <p className="font-medium text-foreground">
                                {payment.enrollment?.student?.firstName ?? "N/A"} {payment.enrollment?.student?.lastName ?? ""}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {payment.receiptNumber} • {new Date(payment.recordedAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <p className="font-mono font-semibold text-foreground">
                            {formatAmount(payment.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedPayments.length > 0 && (
                    <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <p className="text-sm text-muted-foreground">{t.accounting.totalSelected}</p>
                      <p className="text-2xl font-bold text-primary">{formatAmount(selectedTotal)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right Panel: Bank Deposits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-success" />
                    {t.accounting.bankDeposits}
                  </CardTitle>
                  <CardDescription>
                    {isLoadingDeposits
                      ? "Chargement..."
                      : `${unreconciledDeposits.length} dépôts non réconciliés`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingDeposits ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : unreconciledDeposits.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun dépôt bancaire non réconcilié
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {unreconciledDeposits.map((deposit) => (
                        <div
                          key={deposit.id}
                          onClick={() => setSelectedDeposit(deposit.id)}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedDeposit === deposit.id
                              ? "border-success bg-success/5"
                              : "border-border bg-card hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-foreground">{deposit.bankReference}</p>
                            <Badge variant="outline" className="text-success border-success">
                              {deposit.bankName}
                            </Badge>
                          </div>
                          <p className="text-2xl font-bold text-foreground">{formatAmount(deposit.amount)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(deposit.depositDate).toLocaleDateString('fr-FR')} • {deposit.depositorName}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Reconciliation Actions */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{t.accounting.comparison}</p>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">{t.accounting.selectedPayments}</p>
                        <p className="text-lg font-bold text-foreground">{formatAmount(selectedTotal)}</p>
                      </div>
                      <div className="text-muted-foreground">{t.accounting.vs}</div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t.accounting.bankDeposit}</p>
                        <p className="text-lg font-bold text-foreground">
                          {selectedDeposit
                            ? formatAmount(unreconciledDeposits.find((d) => d.id === selectedDeposit)?.amount || 0)
                            : formatAmount(0)}
                        </p>
                      </div>
                    </div>
                    {selectedPayments.length > 0 &&
                      selectedDeposit &&
                      selectedTotal !== (unreconciledDeposits.find((d) => d.id === selectedDeposit)?.amount || 0) && (
                        <p className="text-xs text-warning flex items-center gap-1 mt-2">
                          <AlertCircle className="h-3 w-3" />
                          {t.accounting.discrepancyDetected}
                        </p>
                      )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      disabled={selectedPayments.length === 0 || !selectedDeposit}
                      className="bg-transparent"
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      {t.accounting.flagDiscrepancy}
                    </Button>
                    <Button
                      disabled={
                        selectedPayments.length === 0 ||
                        !selectedDeposit ||
                        selectedTotal !== (unreconciledDeposits.find((d) => d.id === selectedDeposit)?.amount || 0)
                      }
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      {t.accounting.reconcile}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Period Close Workflow */}
          <TabsContent value="period-close" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.accounting.periodCloseWizard}</CardTitle>
                <CardDescription>{t.accounting.closeCurrentPeriod}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Pre-Close Checklist */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      1
                    </div>
                    <h3 className="text-lg font-semibold">{t.accounting.preCloseVerification}</h3>
                  </div>
                  <div className="ml-10 space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        {balanceData?.payments.byStatus.pending_review?.count === 0 ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-warning" />
                        )}
                        <div>
                          <p className="font-medium text-foreground">{t.accounting.allPaymentsValidated}</p>
                          <p className="text-sm text-muted-foreground">
                            {balanceData?.payments.byStatus.pending_review?.count || 0} paiements en attente de validation
                          </p>
                        </div>
                      </div>
                      {balanceData?.payments.byStatus.pending_review?.count === 0 ? (
                        <Badge className="bg-success text-success-foreground">{t.accounting.completed}</Badge>
                      ) : (
                        <Button variant="outline" size="sm" className="bg-transparent">
                          {t.dashboard.review}
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        {unreconciledDeposits.length === 0 ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-warning" />
                        )}
                        <div>
                          <p className="font-medium text-foreground">{t.accounting.allReconciliationsDone}</p>
                          <p className="text-sm text-muted-foreground">
                            {unreconciledDeposits.length} dépôts en attente de réconciliation
                          </p>
                        </div>
                      </div>
                      {unreconciledDeposits.length === 0 ? (
                        <Badge className="bg-success text-success-foreground">{t.accounting.completed}</Badge>
                      ) : (
                        <Button variant="outline" size="sm" className="bg-transparent">
                          {t.dashboard.review}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 2: Review Summary */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground font-bold text-sm">
                      2
                    </div>
                    <h3 className="text-lg font-semibold text-muted-foreground">{t.accounting.summaryReview}</h3>
                  </div>
                  <div className="ml-10">
                    <p className="text-sm text-muted-foreground">
                      {t.accounting.availableAfterPreClose}
                    </p>
                  </div>
                </div>

                {/* Step 3: Close Period */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground font-bold text-sm">
                      3
                    </div>
                    <h3 className="text-lg font-semibold text-muted-foreground">{t.accounting.closePeriod}</h3>
                  </div>
                  <div className="ml-10">
                    <Card className="border-destructive/30 bg-destructive/5">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Lock className="h-5 w-5 text-destructive mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-foreground mb-1">{t.accounting.irreversibleAction}</p>
                            <p className="text-sm text-muted-foreground mb-4">
                              {t.accounting.closePeriodWarning}
                            </p>
                            <Button disabled variant="destructive">
                              <Lock className="h-4 w-4 mr-2" />
                              {t.accounting.closeFinancialPeriod}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
