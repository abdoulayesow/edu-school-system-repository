"use client"

import { Fragment, useState, useMemo, useCallback } from "react"
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
import { FormDialog, FormField } from "@/components/ui/form-dialog"
import { PermissionGuard } from "@/components/permission-guard"
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import {
  Search,
  Loader2,
  XCircle,
  HandCoins,
  UserCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/hooks/use-toast"
import { componentClasses } from "@/lib/design-tokens"
import {
  useSalaryAdvances,
  useCreateAdvance,
  useUpdateAdvance,
} from "@/lib/hooks/use-api"
import type { SalaryAdvanceWithRelations } from "@/lib/types/salary"
import { useActiveStaffList } from "@/hooks/use-active-staff"
import { StatCard, getRoleLabel, PaymentMethodSelect, StaffMemberSelect, ADVANCE_STATUS_STYLES } from "./shared"
import { formatGNF } from "@/lib/utils/format"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AdvancesTabProps {
  schoolYearId: string
  month: number
  year: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdvancesTab({ schoolYearId, month, year }: AdvancesTabProps) {
  const { t } = useI18n()
  const { toast } = useToast()

  // Data hooks
  const { data, isLoading } = useSalaryAdvances(
    schoolYearId ? { schoolYearId, month, year } : undefined
  )
  const createAdvance = useCreateAdvance()
  const updateAdvance = useUpdateAdvance()

  // UI state
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Dialog state — new advance
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formUserId, setFormUserId] = useState("")
  const [formAmount, setFormAmount] = useState("")
  const [formMethod, setFormMethod] = useState<"cash" | "orange_money">("cash")
  const [formReason, setFormReason] = useState("")
  const [formStrategy, setFormStrategy] = useState<"full" | "spread" | "custom">("full")
  const [formInstallments, setFormInstallments] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const { staffList, isLoading: staffLoading, loadStaff } = useActiveStaffList()

  // Dialog state — cancel advance
  const [cancelAdvance, setCancelAdvance] = useState<SalaryAdvanceWithRelations | null>(null)
  const [cancelNote, setCancelNote] = useState("")

  // Filter
  const filteredAdvances = useMemo(() => {
    if (!data?.advances) return []
    let advances = data.advances
    if (search) {
      const q = search.toLowerCase()
      advances = advances.filter(
        (a) =>
          a.user.name?.toLowerCase().includes(q) ||
          a.user.email.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") {
      advances = advances.filter((a) => a.status === statusFilter)
    }
    return advances
  }, [data?.advances, search, statusFilter])

  const stats = data?.stats ?? {
    activeCount: 0,
    totalOutstanding: 0,
    thisMonthRecoupments: 0,
  }

  // Toggle row expansion
  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // Load staff list
  const openCreateDialog = useCallback(async () => {
    setFormUserId("")
    setFormAmount("")
    setFormMethod("cash")
    setFormReason("")
    setFormStrategy("full")
    setFormInstallments("")
    setFormError(null)
    setIsCreateOpen(true)
    loadStaff()
  }, [loadStaff])

  // Handle create advance
  const handleCreate = useCallback(async () => {
    setFormError(null)

    if (!formUserId) {
      setFormError(t.salaries.rates.selectStaff)
      return
    }

    const amount = parseInt(formAmount)
    if (isNaN(amount) || amount <= 0) {
      setFormError(t.salaries.validation.invalidAmount)
      return
    }

    if (!formReason.trim()) {
      setFormError(t.salaries.validation.reasonRequired)
      return
    }

    if (formStrategy === "spread") {
      const installments = parseInt(formInstallments)
      if (isNaN(installments) || installments <= 0) {
        setFormError(t.salaries.advances.numberOfInstallments)
        return
      }
    }

    try {
      await createAdvance.mutateAsync({
        userId: formUserId,
        amount,
        method: formMethod,
        reason: formReason,
        strategy: formStrategy,
        ...(formStrategy === "spread"
          ? { numberOfInstallments: parseInt(formInstallments) }
          : {}),
      })
      setIsCreateOpen(false)
      toast({
        title: t.common.success,
        description: t.salaries.advances.createSuccess,
      })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t.common.errorOccurred)
    }
  }, [formUserId, formAmount, formMethod, formReason, formStrategy, formInstallments, createAdvance, toast, t])

  // Handle cancel advance
  const handleCancel = useCallback(async () => {
    if (!cancelAdvance) return
    try {
      await updateAdvance.mutateAsync({
        id: cancelAdvance.id,
        status: "cancelled",
        cancellationNote: cancelNote,
      })
      setCancelAdvance(null)
      setCancelNote("")
      toast({
        title: t.common.success,
        description: t.salaries.advances.cancelSuccess,
      })
    } catch (err) {
      toast({
        title: t.common.error,
        description: err instanceof Error ? err.message : t.common.errorOccurred,
        variant: "destructive",
      })
    }
  }, [cancelAdvance, cancelNote, updateAdvance, toast, t])

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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          label={t.salaries.stats.activeAdvances}
          value={stats.activeCount}
          accent="maroon"
        />
        <StatCard
          label={t.salaries.stats.totalOutstanding}
          value={formatGNF(stats.totalOutstanding)}
          accent="red"
        />
        <StatCard
          label={t.salaries.stats.thisMonthRecoupments}
          value={formatGNF(stats.thisMonthRecoupments)}
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
              <SelectItem value="active">{t.salaries.status.active}</SelectItem>
              <SelectItem value="fully_recouped">{t.salaries.status.fully_recouped}</SelectItem>
              <SelectItem value="cancelled">{t.salaries.status.cancelled}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <PermissionGuard resource="salary_advances" action="create" inline>
          <Button
            className={componentClasses.primaryActionButton}
            onClick={openCreateDialog}
          >
            <HandCoins className="mr-2 h-4 w-4" />
            {t.salaries.advances.newAdvance}
          </Button>
        </PermissionGuard>
      </div>

      {/* Advances table */}
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="pb-0 pt-4 px-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            {t.salaries.advances.title}
            {data?.pagination && (
              <span className="text-sm font-normal text-muted-foreground">
                ({data.pagination.total})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-3">
          {filteredAdvances.length === 0 ? (
            <div className="py-12">
              <Empty>
                <EmptyTitle>{t.salaries.noRecords}</EmptyTitle>
                <EmptyDescription>
                  {t.salaries.advances.subtitle}
                </EmptyDescription>
              </Empty>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className={componentClasses.tableHeaderRow}>
                  <TableHead className="w-8" />
                  <TableHead>{t.salaries.staffName}</TableHead>
                  <TableHead className="text-right">{t.salaries.advances.amount}</TableHead>
                  <TableHead className="text-right">{t.salaries.advances.remainingBalance}</TableHead>
                  <TableHead>{t.salaries.advances.strategy}</TableHead>
                  <TableHead>{t.common.status}</TableHead>
                  <TableHead>{t.salaries.advances.disbursedBy}</TableHead>
                  <TableHead className="text-right">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdvances.map((advance) => {
                  const isExpanded = expandedIds.has(advance.id)
                  const progress = advance.amount > 0
                    ? ((advance.amount - advance.remainingBalance) / advance.amount) * 100
                    : 0

                  return (
                    <Fragment key={advance.id}>
                      <TableRow
                        className={`${componentClasses.tableRowHover} cursor-pointer`}
                        onClick={() => toggleExpanded(advance.id)}
                      >
                        <TableCell className="w-8 px-2">
                          {advance.recoupments.length > 0 && (
                            <button
                              type="button"
                              aria-label={isExpanded ? t.common.collapse : t.common.expand}
                              className="p-0.5 rounded hover:bg-muted"
                            >
                              {isExpanded
                                ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              }
                            </button>
                          )}
                        </TableCell>

                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div>
                              <div>{advance.user.name ?? advance.user.email}</div>
                              <div className="text-xs text-muted-foreground">
                                {getRoleLabel(t.roleManagement.roles, advance.user.role)}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-right font-mono tabular-nums text-sm">
                          {formatGNF(advance.amount)}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="space-y-1">
                            <span className="font-mono tabular-nums text-sm">
                              {formatGNF(advance.remainingBalance)}
                            </span>
                            {/* Progress bar */}
                            <div className="w-full h-1.5 bg-gspn-gold-100 dark:bg-gspn-maroon-900 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gspn-gold-500 dark:bg-gspn-maroon-500 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            {t.salaries.strategies[advance.strategy as keyof typeof t.salaries.strategies]}
                            {advance.strategy === "spread" && advance.numberOfInstallments && (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({advance.numberOfInstallments}x)
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={ADVANCE_STATUS_STYLES[advance.status] ?? ""}
                          >
                            {t.salaries.status[advance.status as keyof typeof t.salaries.status]}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {advance.disburser.name ?? "—"}
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            {advance.status === "active" && (
                              <PermissionGuard resource="salary_advances" action="update" inline>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setCancelAdvance(advance)
                                    setCancelNote("")
                                  }}
                                  className="h-8 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  {t.salaries.advances.cancelAdvance}
                                </Button>
                              </PermissionGuard>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded: recoupment history */}
                      {isExpanded && advance.recoupments.length > 0 && (
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={8} className="p-4">
                            <div className="text-sm font-medium mb-2">
                              {t.salaries.advances.recoupmentHistory}
                            </div>
                            <Table>
                              <TableHeader>
                                <TableRow className="text-xs">
                                  <TableHead className="h-8 text-xs">{t.salaries.advances.installmentNumber}</TableHead>
                                  <TableHead className="h-8 text-xs text-right">{t.salaries.advances.amount}</TableHead>
                                  <TableHead className="h-8 text-xs">{t.salaries.month}</TableHead>
                                  <TableHead className="h-8 text-xs">{t.salaries.advances.disbursedAt}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {advance.recoupments.map((r) => (
                                  <TableRow key={r.id} className="text-xs">
                                    <TableCell className="py-1.5">
                                      #{r.installmentNumber ?? "—"}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-right font-mono tabular-nums">
                                      {formatGNF(r.amount)}
                                    </TableCell>
                                    <TableCell className="py-1.5">
                                      {r.salaryPayment
                                        ? `${r.salaryPayment.month}/${r.salaryPayment.year}`
                                        : "—"}
                                    </TableCell>
                                    <TableCell className="py-1.5">
                                      {new Date(r.createdAt).toLocaleDateString()}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* New Advance Dialog                                                */}
      {/* ================================================================ */}
      <FormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title={t.salaries.advances.newAdvance}
        description={t.salaries.advances.subtitle}
        icon={HandCoins}
        accentColor="blue"
        onSubmit={handleCreate}
        isSubmitting={createAdvance.isPending}
        submitLabel={t.common.save}
        error={formError}
      >
        <FormField label={t.salaries.rates.staffMember} required>
          <StaffMemberSelect
            value={formUserId}
            onValueChange={setFormUserId}
            staffList={staffList}
            isLoading={staffLoading}
            placeholder={t.salaries.rates.selectStaff}
            loadingLabel={t.common.loading}
            roleTranslations={t.roleManagement.roles}
          />
        </FormField>

        <FormField label={`${t.salaries.advances.amount} (GNF)`} required>
          <Input
            type="number"
            min={0}
            value={formAmount}
            onChange={(e) => setFormAmount(e.target.value)}
            placeholder="500000"
            className="font-mono tabular-nums"
          />
        </FormField>

        <FormField label={t.salaries.payments.paymentMethod} required>
          <PaymentMethodSelect
            value={formMethod}
            onValueChange={setFormMethod}
            cashLabel={t.salaries.cash}
            orangeMoneyLabel={t.salaries.orangeMoney}
          />
        </FormField>

        <FormField label={t.salaries.advances.reason} required>
          <Textarea
            value={formReason}
            onChange={(e) => setFormReason(e.target.value)}
            placeholder={t.salaries.advances.reason}
            rows={2}
          />
        </FormField>

        <FormField label={t.salaries.advances.strategy} required>
          <Select value={formStrategy} onValueChange={(v) => setFormStrategy(v as "full" | "spread" | "custom")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">
                <div>
                  <div className="font-medium">{t.salaries.strategies.full}</div>
                  <div className="text-xs text-muted-foreground">{t.salaries.strategies.fullDesc}</div>
                </div>
              </SelectItem>
              <SelectItem value="spread">
                <div>
                  <div className="font-medium">{t.salaries.strategies.spread}</div>
                  <div className="text-xs text-muted-foreground">{t.salaries.strategies.spreadDesc}</div>
                </div>
              </SelectItem>
              <SelectItem value="custom">
                <div>
                  <div className="font-medium">{t.salaries.strategies.custom}</div>
                  <div className="text-xs text-muted-foreground">{t.salaries.strategies.customDesc}</div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        {formStrategy === "spread" && (
          <FormField label={t.salaries.advances.numberOfInstallments} required>
            <Input
              type="number"
              min={1}
              value={formInstallments}
              onChange={(e) => setFormInstallments(e.target.value)}
              placeholder="3"
              className="font-mono tabular-nums"
            />
          </FormField>
        )}
      </FormDialog>

      {/* ================================================================ */}
      {/* Cancel Advance Dialog                                             */}
      {/* ================================================================ */}
      <FormDialog
        open={!!cancelAdvance}
        onOpenChange={(open) => {
          if (!open) {
            setCancelAdvance(null)
            setCancelNote("")
          }
        }}
        title={t.salaries.advances.cancelAdvance}
        description={t.salaries.advances.cancelConfirm}
        icon={XCircle}
        accentColor="red"
        onSubmit={handleCancel}
        isSubmitting={updateAdvance.isPending}
        submitLabel={t.salaries.advances.cancelAdvance}
      >
        <FormField label={t.salaries.advances.cancellationNote} required>
          <Textarea
            value={cancelNote}
            onChange={(e) => setCancelNote(e.target.value)}
            placeholder={t.salaries.advances.cancellationNote}
            rows={3}
          />
        </FormField>
      </FormDialog>
    </div>
  )
}
