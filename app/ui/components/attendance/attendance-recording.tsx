import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { ChevronLeft, Save, Loader2, CheckCircle2, ListChecks, UserX } from "lucide-react"
import { cn } from "@/lib/utils"
import { componentClasses, sizing } from "@/lib/design-tokens"
import { useI18n } from "@/components/i18n-provider"
import { PermissionGuard } from "@/components/permission-guard"
import { formatDateWithDay } from "@/lib/utils"
import { AttendanceSummaryGrid } from "./attendance-summary-grid"
import { StudentAttendanceCard } from "./student-attendance-card"
import type { AttendanceStatus } from "@/lib/config/attendance-status"
import type { Student, AttendanceSummary, EntryMode } from "@/hooks/use-attendance-state"

interface AttendanceRecordingProps {
  gradeName: string
  date: string
  locale: "fr" | "en"
  students: Student[]
  localAttendance: Record<string, AttendanceStatus>
  currentSummary: AttendanceSummary
  entryMode: EntryMode
  isSaving: boolean
  onBack: () => void
  onToggleStatus: (studentId: string) => void
  onSave: () => void
  onSubmit: () => void
}

export function AttendanceRecording({
  gradeName,
  date,
  locale,
  students,
  localAttendance,
  currentSummary,
  entryMode,
  isSaving,
  onBack,
  onToggleStatus,
  onSave,
  onSubmit,
}: AttendanceRecordingProps) {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students

    const query = searchQuery.toLowerCase()
    return students.filter(student => {
      const fullName = `${student.person?.firstName || ''} ${student.person?.lastName || ''}`.toLowerCase()
      return fullName.includes(query) || student.studentNumber?.toLowerCase().includes(query)
    })
  }, [students, searchQuery])

  return (
    <div className="space-y-4">
      {/* Header with Back and Save */}
      <Card className="border-gspn-maroon-500/20">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2 hover:bg-gspn-maroon-500/10 hover:text-gspn-maroon-700"
            >
              <ChevronLeft className={sizing.icon.sm} />
              {t.attendance.back}
            </Button>

            <div className="text-center">
              <p className="font-semibold text-foreground">{gradeName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDateWithDay(date, locale)}
              </p>
            </div>

            <PermissionGuard resource="attendance" action="update" inline>
              <Button
                onClick={onSave}
                disabled={isSaving}
                variant="outline"
                size="sm"
                className="hover:bg-gspn-maroon-500/10 hover:text-gspn-maroon-700 hover:border-gspn-maroon-500"
              >
                {isSaving ? (
                  <Loader2 className={cn(sizing.icon.sm, "animate-spin")} />
                ) : (
                  <>
                    <Save className={cn(sizing.icon.sm, "mr-1")} />
                    {t.attendance.save}
                  </>
                )}
              </Button>
            </PermissionGuard>
          </div>
        </CardContent>
      </Card>

      {/* Summary Grid */}
      <AttendanceSummaryGrid summary={currentSummary} />

      {/* Search */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t.attendance.searchStudent}
        debounceMs={300}
        showClear
      />

      {/* Mode Indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg py-2 px-4">
        {entryMode === "checklist" ? (
          <>
            <ListChecks className={sizing.icon.sm} />
            <span>{t.attendance.checklistModeIndicator}</span>
          </>
        ) : (
          <>
            <UserX className={sizing.icon.sm} />
            <span>{t.attendance.absencesModeIndicator}</span>
          </>
        )}
      </div>

      {/* Student List */}
      <Card>
        <CardContent className="pt-4 pb-2">
          <div className="space-y-2">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? t.attendance.noStudentsFound : t.attendance.noStudents}
              </div>
            ) : (
              filteredStudents.map((student) => (
                <StudentAttendanceCard
                  key={student.studentProfileId}
                  student={student}
                  status={localAttendance[student.studentProfileId]}
                  onToggleStatus={onToggleStatus}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button with GSPN Gold CTA */}
      <PermissionGuard resource="attendance" action="update">
        <Button
          size="lg"
          className={cn(
            "w-full h-14 text-lg shadow-lg hover:shadow-xl transition-all",
            componentClasses.primaryActionButton
          )}
          onClick={onSubmit}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className={cn(sizing.icon.md, "mr-2 animate-spin")} />
          ) : (
            <CheckCircle2 className={cn(sizing.icon.md, "mr-2")} />
          )}
          {t.attendance.submitAttendance}
        </Button>
      </PermissionGuard>

      {/* Instructions */}
      <Card className="border-gspn-maroon-500/30 bg-gradient-to-br from-gspn-maroon-50/50 to-transparent dark:from-gspn-maroon-950/20">
        <CardContent className="pt-4 pb-4">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            {t.attendance.instructions}
          </h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• {t.attendance.instruction1}</li>
            <li>• {t.attendance.cycleInstructions}</li>
            <li>• {t.attendance.searchTip}</li>
            <li>• {t.attendance.saveTip}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
