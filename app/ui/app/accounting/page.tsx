"use client"

import { useState } from "react"
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
import { Plus, Upload, CheckCircle2, Clock, AlertCircle, DollarSign, Link2, Flag, Lock } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useI18n, interpolate } from "@/components/i18n-provider"

export default function AccountingPage() {
  const { t } = useI18n()
  const [openRecordPayment, setOpenRecordPayment] = useState(false)
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])
  const [selectedDeposit, setSelectedDeposit] = useState<string | null>(null)

  const transactions = [
    {
      id: "TXN001",
      studentName: "Fatoumata Diallo",
      amount: 800000,
      paymentMethod: "Mobile Money",
      date: "2024-12-18",
      status: "unvalidated",
      reference: "OM-2024-001",
    },
    {
      id: "TXN002",
      studentName: "Mamadou Sylla",
      amount: 850000,
      paymentMethod: "Cash",
      date: "2024-12-18",
      status: "validated",
      reference: "CASH-2024-045",
    },
    {
      id: "TXN003",
      studentName: "Aminata Touré",
      amount: 800000,
      paymentMethod: "Mobile Money",
      date: "2024-12-17",
      status: "reconciled",
      reference: "OM-2024-002",
    },
    {
      id: "TXN004",
      studentName: "Oumar Keita",
      amount: 150000,
      paymentMethod: "Cash",
      date: "2024-12-17",
      status: "validated",
      reference: "CASH-2024-046",
    },
    {
      id: "TXN005",
      studentName: "Aissata Conte",
      amount: 800000,
      paymentMethod: "Bank Transfer",
      date: "2024-12-16",
      status: "validated",
      reference: "BANK-2024-012",
    },
  ]

  const validatedPayments = [
    { id: "TXN002", student: "Mamadou Sylla", amount: 850000, date: "2024-12-18" },
    { id: "TXN004", student: "Oumar Keita", amount: 150000, date: "2024-12-17" },
    { id: "TXN005", student: "Aissata Conte", amount: 800000, date: "2024-12-16" },
  ]

  const bankDeposits = [
    { id: "DEP001", amount: 1800000, date: "2024-12-18", bank: "BOA Guinea" },
    { id: "DEP002", amount: 3200000, date: "2024-12-15", bank: "BOA Guinea" },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unvalidated":
        return (
          <Badge variant="outline" className="text-warning border-warning">
            <Clock className="h-3 w-3 mr-1" />
            {t.accounting.unvalidated}
          </Badge>
        )
      case "validated":
        return (
          <Badge variant="outline" className="text-primary border-primary">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t.accounting.validated}
          </Badge>
        )
      case "reconciled":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t.accounting.reconciled}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const selectedTotal = validatedPayments
    .filter((p) => selectedPayments.includes(p.id))
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="min-h-screen bg-background pt-4 lg:pt-4">
      <main className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.accounting.title}</h1>
          <p className="text-muted-foreground">{interpolate(t.accounting.subtitleWithName, { personName: "Ibrahima Bah" })}</p>
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
                    <CardDescription>{t.accounting.registerAndValidate}</CardDescription>
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
                              <SelectItem value="stu1">Fatoumata Diallo - STU001</SelectItem>
                              <SelectItem value="stu2">Mamadou Sylla - STU002</SelectItem>
                              <SelectItem value="stu3">Aminata Touré - STU003</SelectItem>
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
                                <SelectItem value="mobile">{t.accounting.mobileMoney}</SelectItem>
                                <SelectItem value="bank">{t.accounting.bankTransfer}</SelectItem>
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
                      {transactions.map((txn) => (
                        <TableRow key={txn.id}>
                          <TableCell className="font-medium font-mono text-sm">{txn.id}</TableCell>
                          <TableCell>{txn.studentName}</TableCell>
                          <TableCell className="text-right font-mono">{txn.amount.toLocaleString()} GNF</TableCell>
                          <TableCell>{txn.paymentMethod}</TableCell>
                          <TableCell>{txn.date}</TableCell>
                          <TableCell>{getStatusBadge(txn.status)}</TableCell>
                          <TableCell className="font-mono text-sm">{txn.reference}</TableCell>
                          <TableCell className="text-right">
                            {txn.status === "unvalidated" && (
                              <Button size="sm" variant="outline" className="bg-transparent">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {t.accounting.validate}
                              </Button>
                            )}
                            {txn.status === "validated" && (
                              <span className="text-xs text-muted-foreground">{t.accounting.readyForReconciliation}</span>
                            )}
                            {txn.status === "reconciled" && <span className="text-xs text-success">{t.accounting.completed}</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
                  <CardDescription>{t.accounting.selectPaymentsToReconcile}</CardDescription>
                </CardHeader>
                <CardContent>
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
                            <p className="font-medium text-foreground">{payment.student}</p>
                            <p className="text-xs text-muted-foreground">
                              {payment.id} • {payment.date}
                            </p>
                          </div>
                        </div>
                        <p className="font-mono font-semibold text-foreground">{payment.amount.toLocaleString()} GNF</p>
                      </div>
                    ))}
                  </div>
                  {selectedPayments.length > 0 && (
                    <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <p className="text-sm text-muted-foreground">{t.accounting.totalSelected}</p>
                      <p className="text-2xl font-bold text-primary">{selectedTotal.toLocaleString()} GNF</p>
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
                  <CardDescription>{t.accounting.selectMatchingDeposit}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bankDeposits.map((deposit) => (
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
                          <p className="font-medium text-foreground">{deposit.id}</p>
                          <Badge variant="outline" className="text-success border-success">
                            {deposit.bank}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{deposit.amount.toLocaleString()} GNF</p>
                        <p className="text-xs text-muted-foreground mt-1">{deposit.date}</p>
                      </div>
                    ))}
                  </div>
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
                        <p className="text-lg font-bold text-foreground">{selectedTotal.toLocaleString()} GNF</p>
                      </div>
                      <div className="text-muted-foreground">{t.accounting.vs}</div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t.accounting.bankDeposit}</p>
                        <p className="text-lg font-bold text-foreground">
                          {selectedDeposit
                            ? bankDeposits.find((d) => d.id === selectedDeposit)?.amount.toLocaleString()
                            : "0"}{" "}
                          GNF
                        </p>
                      </div>
                    </div>
                    {selectedPayments.length > 0 &&
                      selectedDeposit &&
                      selectedTotal !== (bankDeposits.find((d) => d.id === selectedDeposit)?.amount || 0) && (
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
                        selectedTotal !== (bankDeposits.find((d) => d.id === selectedDeposit)?.amount || 0)
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
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <div>
                          <p className="font-medium text-foreground">{t.accounting.allPaymentsValidated}</p>
                          <p className="text-sm text-muted-foreground">{interpolate(t.accounting.unvalidatedPayments, { count: 0 })}</p>
                        </div>
                      </div>
                      <Badge className="bg-success text-success-foreground">{t.accounting.completed}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <div>
                          <p className="font-medium text-foreground">{t.accounting.allReconciliationsDone}</p>
                          <p className="text-sm text-muted-foreground">{interpolate(t.accounting.pendingReconciliations, { count: 0 })}</p>
                        </div>
                      </div>
                      <Badge className="bg-success text-success-foreground">{t.accounting.completed}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-warning/50 bg-warning/5">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-warning" />
                        <div>
                          <p className="font-medium text-foreground">{t.accounting.discrepanciesResolved}</p>
                          <p className="text-sm text-warning">{interpolate(t.accounting.discrepanciesNeedAttention, { count: 2 })}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        {t.dashboard.review}
                      </Button>
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