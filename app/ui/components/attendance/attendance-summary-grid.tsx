import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { sizing, typography } from "@/lib/design-tokens"
import { useI18n } from "@/components/i18n-provider"
import type { AttendanceSummary } from "@/hooks/use-attendance-state"

interface AttendanceSummaryGridProps {
  summary: AttendanceSummary
}

export function AttendanceSummaryGrid({ summary }: AttendanceSummaryGridProps) {
  const { t } = useI18n()

  return (
    <div className="grid grid-cols-4 gap-2">
      <Card className="border-success/50 hover:border-success transition-colors">
        <CardContent className="pt-4 pb-4 text-center">
          <CheckCircle2 className={cn(sizing.icon.md, "text-success mx-auto mb-1")} />
          <p className={typography.stat.sm}>{summary.present}</p>
          <p className="text-xs text-muted-foreground">{t.attendance.present}</p>
        </CardContent>
      </Card>

      <Card className="border-destructive/50 hover:border-destructive transition-colors">
        <CardContent className="pt-4 pb-4 text-center">
          <XCircle className={cn(sizing.icon.md, "text-destructive mx-auto mb-1")} />
          <p className={typography.stat.sm}>{summary.absent}</p>
          <p className="text-xs text-muted-foreground">{t.attendance.absent}</p>
        </CardContent>
      </Card>

      <Card className="border-warning/50 hover:border-warning transition-colors">
        <CardContent className="pt-4 pb-4 text-center">
          <Clock className={cn(sizing.icon.md, "text-warning mx-auto mb-1")} />
          <p className={typography.stat.sm}>{summary.late}</p>
          <p className="text-xs text-muted-foreground">{t.attendance.lateCount}</p>
        </CardContent>
      </Card>

      <Card className="border-blue-500/50 hover:border-blue-500 transition-colors">
        <CardContent className="pt-4 pb-4 text-center">
          <AlertCircle className={cn(sizing.icon.md, "text-blue-500 mx-auto mb-1")} />
          <p className={typography.stat.sm}>{summary.excused}</p>
          <p className="text-xs text-muted-foreground">{t.attendance.excused}</p>
        </CardContent>
      </Card>
    </div>
  )
}
