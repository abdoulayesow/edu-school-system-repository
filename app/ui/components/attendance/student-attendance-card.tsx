import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { sizing } from "@/lib/design-tokens"
import { getStatusConfigOrDefault, type AttendanceStatus } from "@/lib/config/attendance-status"
import { useI18n } from "@/components/i18n-provider"
import type { Student } from "@/hooks/use-attendance-state"

interface StudentAttendanceCardProps {
  student: Student
  status: AttendanceStatus
  onToggleStatus: (studentId: string) => void
}

export function StudentAttendanceCard({
  student,
  status,
  onToggleStatus,
}: StudentAttendanceCardProps) {
  const { t } = useI18n()
  const config = getStatusConfigOrDefault(status)
  const Icon = config.icon

  const getStatusLabel = (status: AttendanceStatus): string => {
    if (status === null) return t.attendance.notRecorded
    switch (status) {
      case "present": return t.attendance.statusPresent
      case "absent": return t.attendance.statusAbsent
      case "late": return t.attendance.statusLate
      case "excused": return t.attendance.statusExcused
    }
  }

  return (
    <div
      onClick={() => onToggleStatus(student.studentProfileId)}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all",
        "hover:shadow-sm active:scale-[0.99]",
        config.borderClass
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="size-10 ring-2 ring-offset-2 ring-transparent hover:ring-gspn-maroon-500/20 transition-all">
          <AvatarImage src={student.person?.photoUrl ?? undefined} />
          <AvatarFallback className="bg-gradient-to-br from-gspn-maroon-100 to-gspn-gold-100 text-gspn-maroon-700 font-semibold">
            {student.person?.firstName?.[0]}{student.person?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">
            {student.person?.firstName} {student.person?.lastName}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={config.className}>
              <Icon className={cn(sizing.icon.xs, "mr-1")} />
              {getStatusLabel(status)}
            </Badge>
          </div>
        </div>
      </div>
      <Icon className={cn(sizing.icon.lg, config.iconClass)} />
    </div>
  )
}
