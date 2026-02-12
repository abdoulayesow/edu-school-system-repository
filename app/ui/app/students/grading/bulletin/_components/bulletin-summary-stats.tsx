import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/components/i18n-provider"
import { getScoreColor } from "@/lib/grading-utils"
import { DecisionBadge } from "@/components/grading"
import type { BulletinData, DecisionType } from "@/lib/types/grading"

interface BulletinSummaryStatsProps {
  summary: NonNullable<BulletinData["summary"]>
}

export function BulletinSummaryStats({ summary }: BulletinSummaryStatsProps) {
  const { t } = useI18n()

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="pt-4 pb-4 text-center">
          <div className="text-2xl font-bold font-mono tabular-nums text-primary">
            {summary.rank || "-"}
            <span className="text-sm text-muted-foreground">
              /{summary.totalStudents || "-"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">{t.grading.classRank}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4 text-center">
          <div className={`text-2xl font-bold font-mono tabular-nums ${getScoreColor(summary.conduct)}`}>
            {summary.conduct?.toFixed(1) || "-"}
          </div>
          <div className="text-xs text-muted-foreground">{t.grading.conduct}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4 text-center">
          <div className="text-2xl font-bold font-mono tabular-nums">
            {summary.absences ?? "-"}
          </div>
          <div className="text-xs text-muted-foreground">
            {t.grading.absences}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4 text-center">
          <div className="text-2xl font-bold font-mono tabular-nums">
            {summary.lates ?? "-"}
          </div>
          <div className="text-xs text-muted-foreground">
            {t.grading.lates}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4 text-center">
          <DecisionBadge decision={summary.decision as DecisionType} isOverride={summary.decisionOverride} t={t} />
          <div className="text-xs text-muted-foreground mt-1">{t.grading.decision}</div>
        </CardContent>
      </Card>
    </div>
  )
}
