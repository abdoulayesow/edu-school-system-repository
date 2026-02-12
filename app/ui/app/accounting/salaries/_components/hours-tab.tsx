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
  Clock,
  Search,
  Loader2,
  Send,
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
  UserCircle,
  FileText,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/hooks/use-toast"
import { componentClasses, typography } from "@/lib/design-tokens"
import {
  useSalaryHours,
  useCreateHoursRecord,
  useSubmitHours,
  useReviewHours,
} from "@/lib/hooks/use-api"
import type { HoursRecordWithRelations, ReviewHoursData } from "@/lib/types/salary"
import type { HoursRecordStatus } from "@prisma/client"
import { useActiveStaffList } from "@/hooks/use-active-staff"
import { StatCard, getRoleLabel, StaffMemberSelect, HOURS_STATUS_STYLES } from "./shared"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HoursTabProps {
  schoolYearId: string
  month: number
  year: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HoursTab({ schoolYearId, month, year }: HoursTabProps) {
  const { t } = useI18n()
  const { toast } = useToast()

  // Data hooks
  const { data, isLoading } = useSalaryHours(
    schoolYearId
      ? { schoolYearId, month, year }
      : undefined
  )
  const createRecord = useCreateHoursRecord()
  const submitHours = useSubmitHours()
  const reviewHours = useReviewHours()

  // UI state
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [submitConfirmId, setSubmitConfirmId] = useState<string | null>(null)
  const [reviewingRecord, setReviewingRecord] = useState<HoursRecordWithRelations | null>(null)
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve")
  const [rejectionNote, setRejectionNote] = useState("")

  // Create form state
  const [formUserId, setFormUserId] = useState("")
  const [formHours, setFormHours] = useState("")
  const [formNotes, setFormNotes] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const { staffList, isLoading: staffLoading, loadStaff } = useActiveStaffList()

  // Filter records
  const filteredRecords = useMemo(() => {
    if (!data?.records) return []

    let records = data.records

    if (search) {
      const q = search.toLowerCase()
      records = records.filter(
        (r) =>
          r.user.name?.toLowerCase().includes(q) ||
          r.user.email.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== "all") {
      records = records.filter((r) => r.status === statusFilter)
    }

    return records
  }, [data?.records, search, statusFilter])

  // Summary stats
  const stats = useMemo(() => {
    if (!data?.records) return { draft: 0, submitted: 0, approved: 0, rejected: 0, totalHours: 0 }

    return data.records.reduce(
      (acc, r) => {
        acc[r.status as keyof typeof acc] = (acc[r.status as keyof typeof acc] as number) + 1
        acc.totalHours += r.totalHours
        return acc
      },
      { draft: 0, submitted: 0, approved: 0, rejected: 0, totalHours: 0 }
    )
  }, [data?.records])

  // Load staff list for create dialog
  const openCreateDialog = useCallback(async () => {
    setFormUserId("")
    setFormHours("")
    setFormNotes("")
    setFormError(null)
    setIsCreateOpen(true)
    loadStaff()
  }, [loadStaff])

  // Handle create
  const handleCreate = useCallback(async () => {
    setFormError(null)

    if (!formUserId) {
      setFormError(t.salaries.rates.selectStaff)
      return
    }
    if (!schoolYearId) {
      setFormError(t.salaries.schoolYear)
      return
    }

    const hours = parseFloat(formHours)
    if (isNaN(hours) || hours <= 0) {
      setFormError(t.salaries.validation.invalidHours)
      return
    }

    try {
      await createRecord.mutateAsync({
        userId: formUserId,
        schoolYearId,
        month,
        year,
        totalHours: hours,
        notes: formNotes || undefined,
      })
      setIsCreateOpen(false)
      toast({
        title: t.common.success,
        description: t.salaries.hours.createSuccess,
      })
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t.common.errorOccurred
      )
    }
  }, [formUserId, formHours, formNotes, schoolYearId, month, year, createRecord, toast, t])

  // Handle submit (draft → submitted)
  const handleSubmit = useCallback(async (recordId: string) => {
    try {
      await submitHours.mutateAsync(recordId)
      setSubmitConfirmId(null)
      toast({
        title: t.common.success,
        description: t.salaries.hours.submitSuccess,
      })
    } catch (err) {
      toast({
        title: t.common.error,
        description: err instanceof Error ? err.message : t.common.errorOccurred,
        variant: "destructive",
      })
    }
  }, [submitHours, toast, t])

  // Handle review (submitted → approved/rejected)
  const handleReview = useCallback(async () => {
    if (!reviewingRecord) return

    const payload: ReviewHoursData = {
      action: reviewAction,
      ...(reviewAction === "reject" ? { rejectionNote } : {}),
    }

    try {
      await reviewHours.mutateAsync({
        id: reviewingRecord.id,
        ...payload,
      })
      setReviewingRecord(null)
      setRejectionNote("")
      toast({
        title: t.common.success,
        description:
          reviewAction === "approve"
            ? t.salaries.hours.approveSuccess
            : t.salaries.hours.rejectSuccess,
      })
    } catch (err) {
      toast({
        title: t.common.error,
        description: err instanceof Error ? err.message : t.common.errorOccurred,
        variant: "destructive",
      })
    }
  }, [reviewingRecord, reviewAction, rejectionNote, reviewHours, toast, t])

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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard
          label={t.salaries.hours.totalHours}
          value={stats.totalHours.toFixed(1)}
          accent="maroon"
        />
        <StatCard
          label={t.salaries.status.draft}
          value={stats.draft}
          accent="gray"
        />
        <StatCard
          label={t.salaries.status.submitted}
          value={stats.submitted}
          accent="blue"
        />
        <StatCard
          label={t.salaries.status.approved}
          value={stats.approved}
          accent="emerald"
        />
        <StatCard
          label={t.salaries.status.rejected}
          value={stats.rejected}
          accent="red"
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
              <SelectItem value="draft">{t.salaries.status.draft}</SelectItem>
              <SelectItem value="submitted">{t.salaries.status.submitted}</SelectItem>
              <SelectItem value="approved">{t.salaries.status.approved}</SelectItem>
              <SelectItem value="rejected">{t.salaries.status.rejected}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <PermissionGuard resource="salary_hours" action="create" inline>
          <Button
            className={componentClasses.primaryActionButton}
            onClick={openCreateDialog}
          >
            <Clock className="mr-2 h-4 w-4" />
            {t.salaries.hours.enterHours}
          </Button>
        </PermissionGuard>
      </div>

      {/* Hours table */}
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="pb-0 pt-4 px-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            {t.salaries.hours.title}
            {data?.pagination && (
              <span className="text-sm font-normal text-muted-foreground">
                ({data.pagination.total})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-3">
          {filteredRecords.length === 0 ? (
            <div className="py-12">
              <Empty>
                <EmptyTitle>{t.salaries.hours.noHoursRecords}</EmptyTitle>
                <EmptyDescription>
                  {t.salaries.hours.subtitle}
                </EmptyDescription>
              </Empty>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className={componentClasses.tableHeaderRow}>
                  <TableHead>{t.salaries.staffName}</TableHead>
                  <TableHead>{t.salaries.role}</TableHead>
                  <TableHead className="text-right">
                    {t.salaries.hours.totalHours}
                  </TableHead>
                  <TableHead>{t.common.status}</TableHead>
                  <TableHead>{t.salaries.hours.submittedBy}</TableHead>
                  <TableHead>{t.salaries.hours.reviewedBy}</TableHead>
                  <TableHead className="text-right">
                    {t.common.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow
                    key={record.id}
                    className={componentClasses.tableRowHover}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                        {record.user.name ?? record.user.email}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {getRoleLabel(t.roleManagement.roles, record.user.role)}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <span className={typography.stat.xs}>
                        {record.totalHours}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">h</span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={HOURS_STATUS_STYLES[record.status] ?? ""}
                      >
                        {t.salaries.status[record.status as keyof typeof t.salaries.status]}
                      </Badge>
                      {record.rejectionNote && (
                        <p className="text-xs text-red-500 mt-1 max-w-[200px] truncate">
                          {record.rejectionNote}
                        </p>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {record.submitter?.name ?? "—"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {record.reviewer?.name ?? "—"}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Submit button (draft → submitted) */}
                        {record.status === "draft" && (
                          <PermissionGuard
                            resource="salary_hours"
                            action="create"
                            inline
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSubmitConfirmId(record.id)}
                              className="h-8 gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                            >
                              <Send className="h-3.5 w-3.5" />
                              {t.salaries.hours.submitHours}
                            </Button>
                          </PermissionGuard>
                        )}

                        {/* Approve/Reject buttons (submitted → approved/rejected) */}
                        {record.status === "submitted" && (
                          <PermissionGuard
                            resource="salary_hours"
                            action="approve"
                            inline
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setReviewingRecord(record)
                                setReviewAction("approve")
                                setRejectionNote("")
                              }}
                              className="h-8 gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              {t.salaries.hours.approve}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setReviewingRecord(record)
                                setReviewAction("reject")
                                setRejectionNote("")
                              }}
                              className="h-8 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              {t.salaries.hours.reject}
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
      {/* Create Hours Record Dialog                                        */}
      {/* ================================================================ */}
      <FormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title={t.salaries.hours.enterHours}
        description={t.salaries.hours.subtitle}
        icon={Clock}
        accentColor="blue"
        onSubmit={handleCreate}
        isSubmitting={createRecord.isPending}
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

        <FormField label={t.salaries.hours.totalHours} required hint="h">
          <Input
            type="number"
            min={0}
            step={0.5}
            value={formHours}
            onChange={(e) => setFormHours(e.target.value)}
            placeholder="40"
            className="font-mono tabular-nums text-center text-lg"
          />
        </FormField>

        <FormField label={t.common.notes} optional>
          <Textarea
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            placeholder="..."
            rows={2}
          />
        </FormField>
      </FormDialog>

      {/* ================================================================ */}
      {/* Submit Confirmation Dialog                                        */}
      {/* ================================================================ */}
      <AlertDialog
        open={!!submitConfirmId}
        onOpenChange={(open) => !open && setSubmitConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.salaries.hours.submitHours}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.salaries.hours.submitConfirm}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => submitConfirmId && handleSubmit(submitConfirmId)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitHours.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {t.common.submit}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ================================================================ */}
      {/* Review Dialog (Approve/Reject)                                    */}
      {/* ================================================================ */}
      <FormDialog
        open={!!reviewingRecord}
        onOpenChange={(open) => {
          if (!open) {
            setReviewingRecord(null)
            setRejectionNote("")
          }
        }}
        title={t.salaries.hours.reviewHours}
        description={
          reviewingRecord
            ? `${reviewingRecord.user.name ?? reviewingRecord.user.email} — ${reviewingRecord.totalHours}h`
            : ""
        }
        icon={reviewAction === "approve" ? CheckCircle : XCircle}
        accentColor={reviewAction === "approve" ? "emerald" : "red"}
        onSubmit={handleReview}
        isSubmitting={reviewHours.isPending}
        submitLabel={
          reviewAction === "approve"
            ? t.salaries.hours.approve
            : t.salaries.hours.reject
        }
      >
        <div className="flex gap-3 mb-4">
          <Button
            type="button"
            variant={reviewAction === "approve" ? "default" : "outline"}
            className={
              reviewAction === "approve"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : ""
            }
            onClick={() => setReviewAction("approve")}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {t.salaries.hours.approve}
          </Button>
          <Button
            type="button"
            variant={reviewAction === "reject" ? "default" : "outline"}
            className={
              reviewAction === "reject"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : ""
            }
            onClick={() => setReviewAction("reject")}
          >
            <XCircle className="mr-2 h-4 w-4" />
            {t.salaries.hours.reject}
          </Button>
        </div>

        {reviewAction === "reject" && (
          <FormField label={t.salaries.hours.rejectionNote} required>
            <Textarea
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder={t.salaries.hours.rejectionNote}
              rows={3}
            />
          </FormField>
        )}
      </FormDialog>
    </div>
  )
}

