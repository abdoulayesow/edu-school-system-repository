import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/components/i18n-provider"
import { BookOpen, CheckCircle2, Clock, Trophy } from "lucide-react"

interface SummaryStatsSectionProps {
  totalGrades: number
  completeCount: number
  inProgressCount: number
  rankingsReady: number
}

export function SummaryStatsSection({
  totalGrades,
  completeCount,
  inProgressCount,
  rankingsReady,
}: SummaryStatsSectionProps) {
  const { t } = useI18n()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card className="border shadow-sm overflow-hidden">
        <div className="h-1 bg-gspn-maroon-500" />
        <CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gspn-maroon-500/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-gspn-maroon-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.grading.classes}</p>
              <p className="text-2xl font-bold font-mono tabular-nums">{totalGrades}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm overflow-hidden">
        <div className="h-1 bg-emerald-500" />
        <CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.grading.complete}</p>
              <p className="text-2xl font-bold font-mono tabular-nums">{completeCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm overflow-hidden">
        <div className="h-1 bg-amber-500" />
        <CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.grading.inProgress}</p>
              <p className="text-2xl font-bold font-mono tabular-nums">{inProgressCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm overflow-hidden">
        <div className="h-1 bg-gspn-gold-500" />
        <CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gspn-gold-500/10 rounded-lg">
              <Trophy className="h-5 w-5 text-gspn-gold-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.grading.rankingsReady}</p>
              <p className="text-2xl font-bold font-mono tabular-nums">{rankingsReady}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
