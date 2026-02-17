"use client"

import { Suspense, useState, useMemo, useCallback } from "react"
import { PageContainer } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  Calculator,
  Search,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Banknote,
  ChevronDown,
  ChevronRight,
  History,
  UserCircle,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/hooks/use-toast"
import { componentClasses, typography } from "@/lib/design-tokens"
import {
  useSalaryRates,
  useCreateSalaryRate,
  useUpdateSalaryRate,
  useDeleteSalaryRate,
} from "@/lib/hooks/use-api"
import type {
  SalaryRateWithUser,
  CreateSalaryRateData,
  UpdateSalaryRateData,
} from "@/lib/types/salary"
import type { SalaryType } from "@prisma/client"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StaffUser {
  id: string
  name: string | null
  email: string
  staffRole: string | null
  schoolLevel: string | null
  status: string
}

// Group rates by user for display
interface StaffRateGroup {
  user: SalaryRateWithUser["user"]
  activeRate: SalaryRateWithUser | null
  historicalRates: SalaryRateWithUser[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

import { formatGNF } from "@/lib/utils/format"
import { getRoleLabel } from "@/app/accounting/salaries/_components/shared"

// ---------------------------------------------------------------------------
// Salary Rates Content
// ---------------------------------------------------------------------------

function SalaryRatesContent() {
  const { t, locale } = useI18n()
  const { toast } = useToast()

  const formatDate = useCallback(
    (dateStr: string) =>
      new Date(dateStr).toLocaleDateString(
        locale === "fr" ? "fr-GN" : "en-US",
        { year: "numeric", month: "short", day: "numeric" }
      ),
    [locale]
  )

  // Data hooks
  const { data, isLoading, error: fetchError } = useSalaryRates()
  const createRate = useCreateSalaryRate()
  const updateRate = useUpdateSalaryRate()
  const deleteRate = useDeleteSalaryRate()

  // UI state
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())

  // Dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingRate, setEditingRate] = useState<SalaryRateWithUser | null>(null)
  const [deletingRate, setDeletingRate] = useState<SalaryRateWithUser | null>(null)

  // Form state
  const [formUserId, setFormUserId] = useState("")
  const [formSalaryType, setFormSalaryType] = useState<SalaryType>("hourly")
  const [formRate, setFormRate] = useState("")
  const [formEffectiveFrom, setFormEffectiveFrom] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [formError, setFormError] = useState<string | null>(null)

  // Staff list for the selector
  const [staffList, setStaffList] = useState<StaffUser[]>([])
  const [staffLoading, setStaffLoading] = useState(false)

  // Group rates by user
  const staffGroups = useMemo<StaffRateGroup[]>(() => {
    if (!data?.rates) return []

    const grouped = new Map<string, StaffRateGroup>()

    for (const rate of data.rates) {
      const group = grouped.get(rate.userId) ?? {
        user: rate.user,
        activeRate: null,
        historicalRates: [],
      }

      if (!rate.effectiveTo) {
        group.activeRate = rate
      } else {
        group.historicalRates.push(rate)
      }

      grouped.set(rate.userId, group)
    }

    let groups = Array.from(grouped.values())

    // Apply search filter
    if (search) {
      const q = search.toLowerCase()
      groups = groups.filter(
        (g) =>
          g.user.name?.toLowerCase().includes(q) ||
          g.user.email.toLowerCase().includes(q) ||
          getRoleLabel(t.roleManagement.roles, g.user.role).toLowerCase().includes(q)
      )
    }

    // Apply type filter
    if (typeFilter !== "all") {
      groups = groups.filter(
        (g) => g.activeRate?.salaryType === typeFilter
      )
    }

    // Sort: staff with active rates first, then alphabetical
    groups.sort((a, b) => {
      if (a.activeRate && !b.activeRate) return -1
      if (!a.activeRate && b.activeRate) return 1
      return (a.user.name ?? "").localeCompare(b.user.name ?? "")
    })

    return groups
  }, [data?.rates, search, typeFilter, t.roleManagement.roles])

  // Toggle expanded state for rate history
  const toggleExpanded = useCallback((userId: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }, [])

  // Load staff list when create dialog opens
  const openCreateDialog = useCallback(async () => {
    setFormUserId("")
    setFormSalaryType("hourly")
    setFormRate("")
    setFormEffectiveFrom(new Date().toISOString().split("T")[0])
    setFormError(null)
    setIsCreateOpen(true)

    if (staffList.length === 0) {
      setStaffLoading(true)
      try {
        const res = await fetch("/api/admin/users/roles")
        if (res.ok) {
          const users: StaffUser[] = await res.json()
          setStaffList(users.filter((u) => u.status === "active"))
        }
      } catch {
        toast({
          title: t.common.error,
          description: t.common.errorOccurred,
          variant: "destructive",
        })
      } finally {
        setStaffLoading(false)
      }
    }
  }, [staffList.length])

  // Open edit dialog
  const openEditDialog = useCallback((rate: SalaryRateWithUser) => {
    setEditingRate(rate)
    setFormSalaryType(rate.salaryType)
    setFormRate(
      rate.salaryType === "hourly"
        ? String(rate.hourlyRate ?? "")
        : String(rate.fixedMonthly ?? "")
    )
    setFormEffectiveFrom(rate.effectiveFrom.split("T")[0])
    setFormError(null)
  }, [])

  // Handle create
  const handleCreate = useCallback(async () => {
    setFormError(null)

    if (!formUserId) {
      setFormError(t.salaries.rates.selectStaff)
      return
    }

    const rateVal = parseFloat(formRate)
    if (isNaN(rateVal) || rateVal <= 0) {
      setFormError(t.salaries.rates.rateAmount)
      return
    }

    const payload: CreateSalaryRateData = {
      userId: formUserId,
      salaryType: formSalaryType,
      effectiveFrom: formEffectiveFrom,
      ...(formSalaryType === "hourly"
        ? { hourlyRate: rateVal }
        : { fixedMonthly: rateVal }),
    }

    try {
      await createRate.mutateAsync(payload)
      setIsCreateOpen(false)
      toast({
        title: t.common.success,
        description: t.salaries.rates.createSuccess,
      })
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t.salaries.rates.createError
      )
    }
  }, [formUserId, formSalaryType, formRate, formEffectiveFrom, createRate, toast, t])

  // Handle update
  const handleUpdate = useCallback(async () => {
    if (!editingRate) return
    setFormError(null)

    const rateVal = parseFloat(formRate)
    if (isNaN(rateVal) || rateVal <= 0) {
      setFormError(t.salaries.rates.rateAmount)
      return
    }

    const payload: UpdateSalaryRateData = {
      id: editingRate.id,
      salaryType: formSalaryType,
      effectiveFrom: formEffectiveFrom,
      ...(formSalaryType === "hourly"
        ? { hourlyRate: rateVal, fixedMonthly: undefined }
        : { fixedMonthly: rateVal, hourlyRate: undefined }),
    }

    try {
      await updateRate.mutateAsync(payload)
      setEditingRate(null)
      toast({
        title: t.common.success,
        description: t.salaries.rates.updateSuccess,
      })
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t.salaries.rates.updateError
      )
    }
  }, [editingRate, formSalaryType, formRate, formEffectiveFrom, updateRate, toast, t])

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!deletingRate) return
    try {
      await deleteRate.mutateAsync(deletingRate.id)
      setDeletingRate(null)
      toast({
        title: t.common.success,
        description: t.salaries.rates.deleteSuccess,
      })
    } catch (err) {
      toast({
        title: t.common.error,
        description:
          err instanceof Error ? err.message : t.salaries.rates.deleteError,
        variant: "destructive",
      })
      setDeletingRate(null)
    }
  }, [deletingRate, deleteRate, toast, t])

  // Salary type badge
  const TypeBadge = useCallback(
    ({ type }: { type: SalaryType }) => (
      <Badge
        variant="outline"
        className={
          type === "hourly"
            ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300"
            : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
        }
      >
        {type === "hourly" ? (
          <Clock className="mr-1 h-3 w-3" />
        ) : (
          <Banknote className="mr-1 h-3 w-3" />
        )}
        {t.salaries.types[type]}
      </Badge>
    ),
    [t]
  )

  // Rate form fields (shared between create and edit)
  const RateFormFields = useMemo(() => {
    return (
      <>
        <FormField label={t.salaries.rates.salaryType} required>
          <Select
            value={formSalaryType}
            onValueChange={(v) => {
              setFormSalaryType(v as SalaryType)
              setFormRate("")
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">
                <span className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  {t.salaries.types.hourly}
                </span>
              </SelectItem>
              <SelectItem value="fixed">
                <span className="flex items-center gap-2">
                  <Banknote className="h-3.5 w-3.5" />
                  {t.salaries.types.fixed}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          label={
            formSalaryType === "hourly"
              ? t.salaries.rates.hourlyRate
              : t.salaries.rates.fixedMonthly
          }
          required
          hint={
            formSalaryType === "hourly"
              ? `GNF ${t.salaries.rates.perHour}`
              : `GNF ${t.salaries.rates.perMonth}`
          }
        >
          <Input
            type="number"
            min={0}
            step={formSalaryType === "hourly" ? 1000 : 10000}
            value={formRate}
            onChange={(e) => setFormRate(e.target.value)}
            placeholder={formSalaryType === "hourly" ? "50000" : "3000000"}
            className="font-mono tabular-nums"
          />
        </FormField>

        <FormField label={t.salaries.rates.effectiveFrom} required>
          <Input
            type="date"
            value={formEffectiveFrom}
            onChange={(e) => setFormEffectiveFrom(e.target.value)}
          />
        </FormField>
      </>
    )
  }, [formSalaryType, formRate, formEffectiveFrom, t])

  // Loading state
  if (isLoading) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="full">
      {/* Header accent bar */}
      <div className="h-1 bg-gspn-maroon-500 -mx-6 mb-6" />

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
            <Calculator className="h-6 w-6 text-gspn-maroon-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t.salaries.rates.title}</h1>
            <p className="text-muted-foreground text-sm">
              {t.salaries.rates.subtitle}
            </p>
          </div>
        </div>

        <PermissionGuard resource="salary_rates" action="create" inline>
          <Button
            className={componentClasses.primaryActionButton}
            onClick={openCreateDialog}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t.salaries.rates.setRate}
          </Button>
        </PermissionGuard>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className={componentClasses.searchInputIcon} />
          <Input
            placeholder={t.salaries.searchStaff}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={componentClasses.searchInput}
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.salaries.rates.salaryType} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.common.all}</SelectItem>
            <SelectItem value="hourly">{t.salaries.types.hourly}</SelectItem>
            <SelectItem value="fixed">{t.salaries.types.fixed}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rates table */}
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="pb-0 pt-4 px-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            {t.salaries.rates.title}
            {data?.pagination && (
              <span className="text-sm font-normal text-muted-foreground">
                ({data.pagination.total})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-3">
          {staffGroups.length === 0 ? (
            <div className="py-12">
              <Empty>
                <EmptyTitle>{t.salaries.noRecords}</EmptyTitle>
                <EmptyDescription>
                  {t.salaries.rates.subtitle}
                </EmptyDescription>
              </Empty>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className={componentClasses.tableHeaderRow}>
                  <TableHead className="w-8" />
                  <TableHead>{t.salaries.staffName}</TableHead>
                  <TableHead>{t.salaries.role}</TableHead>
                  <TableHead>{t.salaries.rates.salaryType}</TableHead>
                  <TableHead className="text-right">
                    {t.salaries.rates.currentRate}
                  </TableHead>
                  <TableHead>{t.salaries.rates.effectiveFrom}</TableHead>
                  <TableHead className="text-right">
                    {t.common.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffGroups.map((group) => {
                  const isExpanded = expandedUsers.has(group.user.id)
                  const hasHistory = group.historicalRates.length > 0
                  const rate = group.activeRate

                  return (
                    <>
                      {/* Main row */}
                      <TableRow
                        key={group.user.id}
                        className={componentClasses.tableRowHover}
                      >
                        <TableCell className="w-8 px-2">
                          {hasHistory ? (
                            <button
                              onClick={() => toggleExpanded(group.user.id)}
                              className="p-0.5 rounded hover:bg-muted transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                          ) : (
                            <span className="w-4" />
                          )}
                        </TableCell>

                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                            {group.user.name ?? group.user.email}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {getRoleLabel(t.roleManagement.roles, group.user.role)}
                          </span>
                        </TableCell>

                        <TableCell>
                          {rate ? (
                            <TypeBadge type={rate.salaryType} />
                          ) : (
                            <span className="text-sm text-muted-foreground italic">
                              {t.salaries.rates.noRateSet}
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          {rate ? (
                            <span className={typography.currency.sm}>
                              {rate.salaryType === "hourly"
                                ? formatGNF(rate.hourlyRate ?? 0)
                                : formatGNF(rate.fixedMonthly ?? 0)}
                              <span className="text-xs font-normal text-muted-foreground ml-1">
                                {rate.salaryType === "hourly"
                                  ? t.salaries.rates.perHour
                                  : t.salaries.rates.perMonth}
                              </span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell>
                          {rate ? (
                            <span className="text-sm">
                              {formatDate(rate.effectiveFrom)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {rate && (
                              <PermissionGuard
                                resource="salary_rates"
                                action="update"
                                inline
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(rate)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </PermissionGuard>
                            )}
                            {rate && (
                              <PermissionGuard
                                resource="salary_rates"
                                action="delete"
                                inline
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingRate(rate)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </PermissionGuard>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded history rows */}
                      {isExpanded &&
                        group.historicalRates.map((histRate) => (
                          <TableRow
                            key={histRate.id}
                            className="bg-muted/30 dark:bg-muted/10"
                          >
                            <TableCell />
                            <TableCell colSpan={2} className="pl-10">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <History className="h-3.5 w-3.5" />
                                {t.salaries.rates.rateHistory}
                              </div>
                            </TableCell>
                            <TableCell>
                              <TypeBadge type={histRate.salaryType} />
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-mono text-sm tabular-nums text-muted-foreground">
                                {histRate.salaryType === "hourly"
                                  ? formatGNF(histRate.hourlyRate ?? 0)
                                  : formatGNF(histRate.fixedMonthly ?? 0)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(histRate.effectiveFrom)}
                                {" → "}
                                {histRate.effectiveTo
                                  ? formatDate(histRate.effectiveTo)
                                  : "—"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <PermissionGuard
                                resource="salary_rates"
                                action="delete"
                                inline
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingRate(histRate)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </PermissionGuard>
                            </TableCell>
                          </TableRow>
                        ))}
                    </>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* Create Rate Dialog                                                */}
      {/* ================================================================ */}
      <FormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title={t.salaries.rates.setRate}
        description={t.salaries.rates.subtitle}
        icon={Calculator}
        accentColor="maroon"
        onSubmit={handleCreate}
        isSubmitting={createRate.isPending}
        submitLabel={t.common.save}
        error={formError}
      >
        <FormField label={t.salaries.rates.staffMember} required>
          {staffLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.common.loading}
            </div>
          ) : (
            <Select value={formUserId} onValueChange={setFormUserId}>
              <SelectTrigger>
                <SelectValue placeholder={t.salaries.rates.selectStaff} />
              </SelectTrigger>
              <SelectContent>
                {staffList.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <span className="flex items-center gap-2">
                      <span>{user.name ?? user.email}</span>
                      <span className="text-xs text-muted-foreground">
                        ({getRoleLabel(t.roleManagement.roles, user.staffRole)})
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>

        {RateFormFields}
      </FormDialog>

      {/* ================================================================ */}
      {/* Edit Rate Dialog                                                  */}
      {/* ================================================================ */}
      <FormDialog
        open={!!editingRate}
        onOpenChange={(open) => !open && setEditingRate(null)}
        title={t.salaries.rates.updateRate}
        description={
          editingRate
            ? `${editingRate.user.name ?? editingRate.user.email}`
            : ""
        }
        icon={Pencil}
        accentColor="maroon"
        onSubmit={handleUpdate}
        isSubmitting={updateRate.isPending}
        submitLabel={t.common.save}
        error={formError}
      >
        {RateFormFields}
      </FormDialog>

      {/* ================================================================ */}
      {/* Delete Confirmation Dialog                                        */}
      {/* ================================================================ */}
      <AlertDialog
        open={!!deletingRate}
        onOpenChange={(open) => !open && setDeletingRate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.salaries.rates.deleteRate}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.salaries.rates.deleteConfirm}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteRate.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}

// ---------------------------------------------------------------------------
// Default export with Suspense boundary
// ---------------------------------------------------------------------------

export default function SalaryRatesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gspn-maroon-500" />
        </div>
      }
    >
      <SalaryRatesContent />
    </Suspense>
  )
}
