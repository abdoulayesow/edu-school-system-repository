import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { sizing } from "@/lib/design-tokens"
import { useI18n } from "@/components/i18n-provider"
import { PermissionGuard } from "@/components/permission-guard"
import { formatDateWithDay } from "@/lib/utils"
import type { AttendanceData, EntryMode } from "@/hooks/use-attendance-state"

interface AttendanceSelectionViewProps {
  attendanceData: AttendanceData | null
  entryMode: EntryMode
  selectedGradeId: string
  selectedDate: string
  locale: "fr" | "en"
  isLoadingAttendance: boolean
  onStartRecording: () => void
}

export function AttendanceSelectionView({
  attendanceData,
  entryMode,
  selectedGradeId,
  selectedDate,
  locale,
  isLoadingAttendance,
  onStartRecording,
}: AttendanceSelectionViewProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-6">
      {/* Entry Mode Description */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground">
          {entryMode === "checklist"
            ? t.attendance.checklistModeDescription
            : t.attendance.absencesModeDescription}
        </p>
      </div>

      {/* Existing Session Info */}
      {attendanceData?.session && (
        <div className="p-4 rounded-lg bg-gradient-to-br from-gspn-maroon-50 to-gspn-gold-50/30 dark:from-gspn-maroon-950/30 dark:to-gspn-gold-950/10 border border-gspn-maroon-300 dark:border-gspn-maroon-700">
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500 mt-1.5 animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-gspn-maroon-700 dark:text-gspn-maroon-300">
                {t.attendance.existingSession}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {attendanceData.session.isComplete
                  ? t.attendance.attendanceCompleted
                  : t.attendance.attendanceInProgress}
                {" • "}
                {t.attendance.entryMode}: {attendanceData.session.entryMode === "checklist" ? "Liste complète" : "Absences seulement"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Start Button */}
      <PermissionGuard resource="attendance" action="create">
        <Button
          className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all"
          size="lg"
          disabled={!selectedGradeId || selectedGradeId === "all" || isLoadingAttendance}
          onClick={onStartRecording}
        >
          {isLoadingAttendance ? (
            <>
              <Loader2 className={cn(sizing.icon.sm, "mr-2 animate-spin")} />
              {t.attendance.loading}
            </>
          ) : attendanceData?.session ? (
            <>{t.attendance.continueAttendance}</>
          ) : (
            <>{t.attendance.startAttendance}</>
          )}
        </Button>
      </PermissionGuard>

      {/* Preview Card */}
      {attendanceData && !attendanceData.session && (
        <Card className="border-gspn-maroon-500/20 hover:border-gspn-maroon-500/40 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gspn-gold-500" />
              {t.attendance.preview}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{attendanceData.grade.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {formatDateWithDay(selectedDate, locale)}
                </p>
              </div>
              <Badge variant="secondary" className="bg-gspn-maroon-500/10 text-gspn-maroon-700 border-gspn-maroon-500/30">
                <Users className={cn(sizing.icon.xs, "mr-1")} />
                {attendanceData.summary.total} {t.attendance.students}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
