"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FormDialog, FormField } from "@/components/ui/form-dialog"
import { PermissionGuard } from "@/components/permission-guard"
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import {
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Banknote,
  UserCircle,
  Zap,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/hooks/use-toast"
import { componentClasses } from "@/lib/design-tokens"
import {
  useSalaryPayments,
  useGenerateSalaries,
  useApproveSalary,
  usePaySalary,
} from "@/lib/hooks/use-api"
import type { SalaryPaymentWithRelations } from "@/lib/types/salary"
import { StatCard, getRoleLabel, PaymentMethodSelect, PAYMENT_STATUS_STYLES } from "./shared"
import { formatGNF } from "@/lib/utils/format"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PaymentsTabProps {
  schoolYearId: string
  month: number
  year: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PaymentsTab({ schoolYearId, month, year }: PaymentsTabProps) {
  const { t } = useI18n()
  const { toast } = useToast()

  // Data hooks
  const { data, isLoading } = useSalaryPayments(
    schoolYearId ? { schoolYearId, month, year } : undefined
  )
  const generateSalaries = useGenerateSalaries()
  const approveSalary = useApproveSalary()
  const paySalary = usePaySalary()

  // UI state
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Dialog state
  const [generateConfirmOpen, setGenerateConfirmOpen] = useState(false)
  const [approveId, setApproveId] = useState<string | null>(null)
  const [cancelPayment, setCancelPayment] = useState<SalaryPaymentWithRelations | null>(null)
  const [cancelNote, setCancelNote] = useState("")
  const [payingPayment, setPayingPayment] = useState<SalaryPaymentWithRelations | null>(null)
  const [payMethod, setPayMethod] = useState<"cash" | "orange_money">("cash")
  const [payNotes, setPayNotes] = useState("")
  const [payError, setPayError] = useState<string | null>(null)

  // Filter payments
  const filteredPayments = useMemo(() => {
    if (!data?.payments) return []
    let payments = data.payments
    if (search) {
      const q = search.toLowerCase()
      payments = payments.filter(
        (p) =>
          p.user.name?.toLowerCase().includes(q) ||
          p.user.email.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") {
      payments = payments.filter((p) => p.status === statusFilter)
    }
    return payments
  }, [data?.payments, search, statusFilter])

  // Stats from API
  const stats = data?.stats ?? {
    totalPayroll: 0,
    pending: { count: 0, amount: 0 },
    approved: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
    cancelled: { count: 0, amount: 0 },
  }

  // Handle generate
  const handleGenerate = useCallback(async () => {
    try {
      const result = await generateSalaries.mutateAsync({
        schoolYearId,
        month,
        year,
      })
      setGenerateConfirmOpen(false)
      toast({
        title: t.common.success,
        description: `${t.salaries.payments.generateSuccess} (${result.created} created, ${result.skipped.length} skipped)`,
      })
    } catch (err) {
      toast({
        title: t.common.error,
        description: err instanceof Error ? err.message : t.common.errorOccurred,
        variant: "destructive",
      })
    }
  }, [schoolYearId, month, year, generateSalaries, toast, t])

  // Handle approve
  const handleApprove = useCallback(async (paymentId: string) => {
    try {
      await approveSalary.mutateAsync({
        id: paymentId,
        action: "approve",
      })
      setApproveId(null)
      toast({
        title: t.common.success,
        description: t.salaries.payments.approveSuccess,
      })
    } catch (err) {
      toast({
        title: t.common.error,
        description: err instanceof Error ? err.message : t.common.errorOccurred,
        variant: "destructive",
      })
    }
  }, [approveSalary, toast, t])

  // Handle cancel
  const handleCancel = useCallback(async () => {
    if (!cancelPayment) return
    try {
      await approveSalary.mutateAsync({
        id: cancelPayment.id,
        action: "cancel",
        notes: cancelNote,
      })
      setCancelPayment(null)
      setCancelNote("")
      toast({
        title: t.common.success,
        description: t.salaries.payments.cancelSuccess,
      })
    } catch (err) {
      toast({
        title: t.common.error,
        description: err instanceof Error ? err.message : t.common.errorOccurred,
        variant: "destructive",
      })
    }
  }, [cancelPayment, cancelNote, approveSalary, toast, t])

  // Handle pay
  const handlePay = useCallback(async () => {
    if (!payingPayment) return
    setPayError(null)
    try {
      await paySalary.mutateAsync({
        id: payingPayment.id,
        method: payMethod,
        notes: payNotes || undefined,
      })
      setPayingPayment(null)
      setPayNotes("")
      toast({
        title: t.common.success,
        description: t.salaries.payments.paySuccess,
      })
    } catch (err) {
      setPayError(err instanceof Error ? err.message : t.common.errorOccurred)
    }
  }, [payingPayment, payMethod, payNotes, paySalary, toast, t])

  if (!schoolYearId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t.salaries.schoolYear}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label={t.salaries.stats.totalPayroll}
          value={formatGNF(stats.totalPayroll)}
          accent="maroon"
        />
        <StatCard
          label={t.salaries.stats.pendingPayments}
          value={`${stats.pending.count} (${formatGNF(stats.pending.amount)})`}
          accent="gray"
        />
        <StatCard
          label={t.salaries.stats.approvedPayments}
          value={`${stats.approved.count} (${formatGNF(stats.approved.amount)})`}
          accent="blue"
        />
        <StatCard
          label={t.salaries.stats.paidPayments}
          value={`${stats.paid.count} (${formatGNF(stats.paid.amount)})`}
          accent="emerald"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative max-w-sm flex-1">
            <Search className={componentClasses.searchInputIcon} />
            <Input
              placeholder={t.salaries.searchStaff}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={componentClasses.searchInput}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t.salaries.filterByStatus} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all}</SelectItem>
              <SelectItem value="pending">{t.salaries.status.pending}</SelectItem>
              <SelectItem value="approved">{t.salaries.status.approved}</SelectItem>
              <SelectItem value="paid">{t.salaries.status.paid}</SelectItem>
              <SelectItem value="cancelled">{t.salaries.status.cancelled}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <PermissionGuard resource="salary_payments" action="create" inline>
          <Button
            className={componentClasses.primaryActionButton}
            onClick={() => setGenerateConfirmOpen(true)}
          >
            <Zap className="mr-2 h-4 w-4" />
            {t.salaries.payments.generate}
          </Button>
        </PermissionGuard>
      </div>

      {/* Payments table */}
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="pb-0 pt-4 px-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            {t.salaries.payments.title}
            {data?.pagination && (
              <span className="text-sm font-normal text-muted-foreground">
                ({data.pagination.total})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-3">
          {filteredPayments.length === 0 ? (
            <div className="py-12">
              <Empty>
                <EmptyTitle>{t.salaries.noRecords}</EmptyTitle>
                <EmptyDescription>
                  {t.salaries.payments.subtitle}
                </EmptyDescription>
              </Empty>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className={componentClasses.tableHeaderRow}>
                  <TableHead>{t.salaries.staffName}</TableHead>
                  <TableHead>{t.salaries.role}</TableHead>
                  <TableHead>{t.salaries.rates.salaryType}</TableHead>
                  <TableHead className="text-right">{t.salaries.payments.grossAmount}</TableHead>
                  <TableHead className="text-right">{t.salaries.payments.advanceDeduction}</TableHead>
                  <TableHead className="text-right">{t.salaries.payments.netAmount}</TableHead>
                  <TableHead>{t.salaries.payments.method}</TableHead>
                  <TableHead>{t.common.status}</TableHead>
                  <TableHead className="text-right">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className={componentClasses.tableRowHover}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                        {payment.user.name ?? payment.user.email}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {getRoleLabel(t.roleManagement.roles, payment.user.role)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {t.salaries.types[payment.salaryType as keyof typeof t.salaries.types]}
                      </Badge>
                      {payment.salaryType === "hourly" && payment.hoursWorked && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({payment.hoursWorked}h)
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right font-mono tabular-nums text-sm">
                      {formatGNF(payment.grossAmount)}
                    </TableCell>

                    <TableCell className="text-right font-mono tabular-nums text-sm">
                      {payment.advanceDeduction > 0 ? (
                        <span className="text-red-600 dark:text-red-400">
                          -{formatGNF(payment.advanceDeduction)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right font-mono tabular-nums text-sm font-medium">
                      {formatGNF(payment.netAmount)}
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {payment.method === "cash" ? t.salaries.cash : t.salaries.orangeMoney}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={PAYMENT_STATUS_STYLES[payment.status] ?? ""}
                      >
                        {t.salaries.status[payment.status as keyof typeof t.salaries.status]}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Approve button */}
                        {payment.status === "pending" && (
                          <PermissionGuard resource="salary_payments" action="approve" inline>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setApproveId(payment.id)}
                              className="h-8 gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              {t.salaries.payments.approve}
                            </Button>
                          </PermissionGuard>
                        )}

                        {/* Pay button */}
                        {payment.status === "approved" && (
                          <PermissionGuard resource="salary_payments" action="update" inline>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setPayingPayment(payment)
                                setPayMethod(payment.method as "cash" | "orange_money")
                                setPayNotes("")
                                setPayError(null)
                              }}
                              className="h-8 gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                            >
                              <Banknote className="h-3.5 w-3.5" />
                              {t.salaries.payments.pay}
                            </Button>
                          </PermissionGuard>
                        )}

                        {/* Cancel button */}
                        {(payment.status === "pending" || payment.status === "approved") && (
                          <PermissionGuard resource="salary_payments" action="update" inline>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCancelPayment(payment)
                                setCancelNote("")
                              }}
                              className="h-8 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </PermissionGuard>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* Generate Salaries Confirmation                                    */}
      {/* ================================================================ */}
      <AlertDialog
        open={generateConfirmOpen}
        onOpenChange={setGenerateConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.salaries.payments.generate}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.salaries.payments.generateConfirm}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGenerate}
              className={componentClasses.primaryActionButton}
            >
              {generateSalaries.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              {t.salaries.payments.generate}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ================================================================ */}
      {/* Approve Confirmation                                              */}
      {/* ================================================================ */}
      <AlertDialog
        open={!!approveId}
        onOpenChange={(open) => !open && setApproveId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.salaries.payments.approve}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.salaries.hours.approveConfirm}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => approveId && handleApprove(approveId)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {approveSalary.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {t.salaries.payments.approve}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ================================================================ */}
      {/* Cancel Payment Dialog                                             */}
      {/* ================================================================ */}
      <FormDialog
        open={!!cancelPayment}
        onOpenChange={(open) => {
          if (!open) {
            setCancelPayment(null)
            setCancelNote("")
          }
        }}
        title={t.salaries.payments.cancel}
        description={t.salaries.payments.cancelConfirm}
        icon={XCircle}
        accentColor="red"
        onSubmit={handleCancel}
        isSubmitting={approveSalary.isPending}
        submitLabel={t.salaries.payments.cancel}
      >
        <FormField label={t.salaries.payments.cancellationNote} required>
          <Textarea
            value={cancelNote}
            onChange={(e) => setCancelNote(e.target.value)}
            placeholder={t.salaries.payments.cancellationNote}
            rows={3}
          />
        </FormField>
      </FormDialog>

      {/* ================================================================ */}
      {/* Pay Salary Dialog                                                 */}
      {/* ================================================================ */}
      <FormDialog
        open={!!payingPayment}
        onOpenChange={(open) => {
          if (!open) {
            setPayingPayment(null)
            setPayNotes("")
            setPayError(null)
          }
        }}
        title={t.salaries.payments.pay}
        description={
          payingPayment
            ? `${payingPayment.user.name ?? payingPayment.user.email} — ${formatGNF(payingPayment.netAmount)}`
            : ""
        }
        icon={Banknote}
        accentColor="emerald"
        onSubmit={handlePay}
        isSubmitting={paySalary.isPending}
        submitLabel={t.salaries.payments.pay}
        error={payError}
      >
        {payingPayment && (
          <div className="space-y-3 mb-4 p-3 rounded-lg bg-muted/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.salaries.payments.grossAmount}</span>
              <span className="font-mono tabular-nums">{formatGNF(payingPayment.grossAmount)}</span>
            </div>
            {payingPayment.salaryType === "hourly" && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.salaries.payments.hoursWorked}</span>
                <span className="font-mono tabular-nums">{payingPayment.hoursWorked}h × {formatGNF(payingPayment.hourlyRate ?? 0)}</span>
              </div>
            )}
          </div>
        )}

        <FormField label={t.salaries.payments.paymentMethod} required>
          <PaymentMethodSelect
            value={payMethod}
            onValueChange={setPayMethod}
            cashLabel={t.salaries.cash}
            orangeMoneyLabel={t.salaries.orangeMoney}
          />
        </FormField>

        <FormField label={t.common.notes} optional>
          <Textarea
            value={payNotes}
            onChange={(e) => setPayNotes(e.target.value)}
            placeholder="..."
            rows={2}
          />
        </FormField>
      </FormDialog>
    </div>
  )
}
