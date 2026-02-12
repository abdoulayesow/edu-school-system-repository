import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { sizing } from "@/lib/design-tokens"
import { useI18n } from "@/components/i18n-provider"
import { FilterCard, HydratedSelect, type SelectOption } from "@/components/students"
import type { Grade } from "@/hooks/use-grades"

interface AttendanceFiltersProps {
  grades: Grade[]
  isLoadingGrades: boolean
  selectedGradeId: string
  selectedDate: string
  entryMode: "checklist" | "absences_only"
  onGradeChange: (gradeId: string) => void
  onDateChange: (date: string) => void
  onEntryModeChange: (mode: "checklist" | "absences_only") => void
}

export function AttendanceFilters({
  grades,
  isLoadingGrades,
  selectedGradeId,
  selectedDate,
  entryMode,
  onGradeChange,
  onDateChange,
  onEntryModeChange,
}: AttendanceFiltersProps) {
  const { t, locale } = useI18n()

  const gradeOptions: SelectOption[] = [
    { value: "all", label: t.attendance.allGrades },
    ...grades.map(grade => ({
      value: grade.id,
      label: grade.name,
    })),
  ]

  const entryModeOptions: SelectOption[] = [
    { value: "checklist", label: locale === "fr" ? "Liste complète" : "Checklist" },
    { value: "absences_only", label: locale === "fr" ? "Absences seulement" : "Absences Only" },
  ]

  return (
    <FilterCard
      title={t.attendance.filterAttendance}
      showClear={false}
      onClearFilters={() => {}}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Grade Selection */}
        {isLoadingGrades ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className={cn(sizing.icon.sm, "animate-spin text-gspn-maroon-500")} />
            {t.attendance.loadingClasses}
          </div>
        ) : (
          <HydratedSelect
            value={selectedGradeId}
            onValueChange={onGradeChange}
            placeholder={t.attendance.allGrades}
            options={gradeOptions}
            width="w-full sm:w-[180px]"
          />
        )}

        {/* Date Selection */}
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full sm:w-[180px]"
        />

        {/* Entry Mode Selection */}
        <HydratedSelect
          value={entryMode}
          onValueChange={(value) => onEntryModeChange(value as "checklist" | "absences_only")}
          placeholder={t.attendance.entryMode}
          options={entryModeOptions}
          width="w-full sm:w-[180px]"
        />
      </div>
    </FilterCard>
  )
}
