import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/components/i18n-provider"
import { TrendingUp, TrendingDown, Award, Users } from "lucide-react"
import type { BulletinData } from "@/lib/types/grading"

interface ClassComparisonStatsProps {
  classStats: NonNullable<BulletinData["classStats"]>
}

export function ClassComparisonStats({ classStats }: ClassComparisonStatsProps) {
  const { t } = useI18n()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="size-4" />
          {t.grading.classStatistics}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded bg-primary/10 flex items-center justify-center">
              <TrendingUp className="size-4 text-primary" />
            </div>
            <div>
              <div className="font-medium font-mono tabular-nums">{classStats.highestAverage?.toFixed(2) || "-"}</div>
              <div className="text-xs text-muted-foreground">
                {t.grading.highest}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="size-8 rounded bg-muted flex items-center justify-center">
              <Award className="size-4 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium font-mono tabular-nums">{classStats.classAverage?.toFixed(2) || "-"}</div>
              <div className="text-xs text-muted-foreground">{t.grading.classAverage}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="size-8 rounded bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="size-4 text-destructive" />
            </div>
            <div>
              <div className="font-medium font-mono tabular-nums">{classStats.lowestAverage?.toFixed(2) || "-"}</div>
              <div className="text-xs text-muted-foreground">
                {t.grading.lowest}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="size-8 rounded bg-success/10 flex items-center justify-center">
              <Users className="size-4 text-success" />
            </div>
            <div>
              <div className="font-medium font-mono tabular-nums">
                {classStats.passCount}/{classStats.totalStudents}
              </div>
              <div className="text-xs text-muted-foreground">
                {t.grading.passRate} ({classStats.passRate?.toFixed(1) || 0}%)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
