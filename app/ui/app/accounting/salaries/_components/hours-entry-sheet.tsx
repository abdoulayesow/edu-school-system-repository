"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Clock, AlertCircle } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/hooks/use-toast"
import { componentClasses } from "@/lib/design-tokens"
import { useCreateHoursRecord } from "@/lib/hooks/use-api"
import { useActiveStaffList } from "@/hooks/use-active-staff"
import { StaffMemberSelect } from "./shared"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HOURLY_STAFF_ROLES = ["enseignant", "professeur_principal"]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HoursEntrySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolYearId: string
  month: number
  year: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HoursEntrySheet({
  open,
  onOpenChange,
  schoolYearId,
  month,
  year,
}: HoursEntrySheetProps) {
  const { t, locale } = useI18n()
  const { toast } = useToast()
  const createRecord = useCreateHoursRecord()
  const { staffList, isLoading: staffLoading, loadStaff } = useActiveStaffList()

  // Form state
  const [userId, setUserId] = useState("")
  const [hours, setHours] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showAllStaff, setShowAllStaff] = useState(false)

  // Reset form and load staff on open
  useEffect(() => {
    if (open) {
      setUserId("")
      setHours("")
      setNotes("")
      setError(null)
      setShowAllStaff(false)
      loadStaff()
    }
  }, [open, loadStaff])

  // Filter staff based on toggle
  const filteredStaff = useMemo(() => {
    if (showAllStaff) return staffList
    return staffList.filter(
      (s) => s.staffRole && HOURLY_STAFF_ROLES.includes(s.staffRole)
    )
  }, [staffList, showAllStaff])

  // Month label (locale-aware)
  const monthLabel = useMemo(() => {
    const date = new Date(year, month - 1, 1)
    return date.toLocaleDateString(locale === "fr" ? "fr-GN" : "en-US", {
      month: "long",
      year: "numeric",
    })
  }, [month, year, locale])

  const handleSave = useCallback(async () => {
    setError(null)

    if (!userId) {
      setError(t.salaries.rates.selectStaff)
      return
    }
    if (!schoolYearId) {
      setError(t.salaries.schoolYear)
      return
    }

    const parsed = parseFloat(hours)
    if (isNaN(parsed) || parsed <= 0) {
      setError(t.salaries.validation.invalidHours)
      return
    }

    try {
      await createRecord.mutateAsync({
        userId,
        schoolYearId,
        month,
        year,
        totalHours: parsed,
        notes: notes.trim() || undefined,
      })
      toast({
        title: t.common.success,
        description: t.salaries.hours.createSuccess,
      })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.errorOccurred)
    }
  }, [userId, hours, notes, schoolYearId, month, year, createRecord, toast, t, onOpenChange])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-md p-0 flex flex-col gap-0 overflow-hidden"
      >
        {/* Accent bar */}
        <div className="h-1 bg-gspn-maroon-500 shrink-0" />

        {/* Header */}
        <SheetHeader className="bg-gspn-maroon-500/5 px-6 py-5 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl shrink-0">
              <Clock className="h-5 w-5 text-gspn-maroon-500" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-left">
                {t.salaries.hours.enterHours}
              </SheetTitle>
              <SheetDescription className="text-left mt-0.5">
                {t.salaries.hours.periodContext} {monthLabel}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Staff picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                {t.salaries.rates.staffMember}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {showAllStaff
                    ? t.salaries.hours.showingAllStaff
                    : t.salaries.hours.showingTeachingStaff}
                </span>
                <Switch
                  id="show-all-staff"
                  checked={showAllStaff}
                  onCheckedChange={setShowAllStaff}
                  className="scale-75"
                />
              </div>
            </div>
            <StaffMemberSelect
              value={userId}
              onValueChange={setUserId}
              staffList={filteredStaff}
              isLoading={staffLoading}
              placeholder={t.salaries.rates.selectStaff}
              loadingLabel={t.common.loading}
              roleTranslations={t.roleManagement.roles}
            />
          </div>

          {/* Hours field */}
          <div className="space-y-2">
            <Label htmlFor="hours-input" className="text-sm font-medium">
              {t.salaries.hours.totalHours}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <Input
                id="hours-input"
                type="number"
                min={0}
                step={0.5}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder={t.salaries.hours.hoursPlaceholder}
                className="font-mono tabular-nums text-center text-lg pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                h
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes-input" className="text-sm font-medium">
              {t.common.notes}
              <span className="text-xs text-muted-foreground ml-2">
                ({t.common.optional})
              </span>
            </Label>
            <Textarea
              id="notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Period callout */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gspn-maroon-50 border border-gspn-maroon-200 text-gspn-maroon-700 dark:bg-gspn-maroon-950/20 dark:border-gspn-maroon-800 dark:text-gspn-maroon-300">
            <Clock className="h-3.5 w-3.5" />
            {monthLabel}
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="px-6 py-4 border-t bg-muted/30 shrink-0 flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createRecord.isPending}
            className="flex-1"
          >
            {t.common.cancel}
          </Button>
          <Button
            onClick={handleSave}
            disabled={createRecord.isPending}
            className={`flex-1 ${componentClasses.primaryActionButton}`}
          >
            {t.common.save}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
