import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { getProgressColor } from "@/lib/grading-utils"
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  PenLine,
  Trophy,
} from "lucide-react"
import type { GradeProgress } from "@/lib/types/grading"

interface ClassProgressAccordionProps {
  grades: GradeProgress[]
  expandedGrade: string | null
  onToggleGrade: (gradeId: string) => void
}

function getStatusBadge(grade: GradeProgress, t: ReturnType<typeof useI18n>["t"]) {
  if (grade.completionProgress === 100 && grade.rankingsCalculated) {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        {t.grading.complete}
      </Badge>
    )
  }
  if (grade.compositionProgress > 0 || grade.subjectsWithComposition > 0) {
    return (
      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
        <Clock className="h-3 w-3 mr-1" />
        {t.grading.inProgress}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      <AlertCircle className="h-3 w-3 mr-1" />
      {t.grading.notStarted}
    </Badge>
  )
}

export function ClassProgressAccordion({
  grades,
  expandedGrade,
  onToggleGrade,
}: ClassProgressAccordionProps) {
  const { t, locale } = useI18n()

  return (
    <div className="space-y-2">
      {grades.map((grade) => (
        <div key={grade.id}>
          <button
            onClick={() => onToggleGrade(grade.id)}
            className={cn(
              "w-full p-3 rounded-lg border transition-all text-left",
              "hover:border-gspn-maroon-500/50 hover:bg-muted/30",
              expandedGrade === grade.id && "border-gspn-maroon-500 bg-muted/50"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="font-semibold">{grade.name}</div>
                <Badge variant="outline" className="text-xs">
                  {grade.studentCount} {t.common.students}
                </Badge>
                {getStatusBadge(grade, t)}
              </div>
              <div className="flex items-center gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-32">
                      <Progress
                        value={grade.completionProgress}
                        className={cn("h-2", getProgressColor(grade.completionProgress))}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {grade.completionProgress}% {t.grading.percentComplete}
                  </TooltipContent>
                </Tooltip>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {grade.completionProgress}%
                </span>
              </div>
            </div>
          </button>

          {/* Expanded Details */}
          {expandedGrade === grade.id && (
            <div className="mt-2 ml-4 p-4 rounded-lg bg-muted/30 border animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t.grading.subjects}</p>
                  <p className="font-semibold">{grade.totalSubjects}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.grading.compositions}</p>
                  <p className="font-semibold">
                    {grade.subjectsWithComposition}/{grade.totalSubjects}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.grading.averages}</p>
                  <p className="font-semibold">
                    {grade.subjects.filter((s) => s.hasAverages).length}/{grade.totalSubjects}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.grading.rankings}</p>
                  <p className="font-semibold">
                    {grade.studentsWithRankings}/{grade.studentCount}
                  </p>
                </div>
              </div>

              {/* Subject Details */}
              <div className="space-y-1">
                {grade.subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-background text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {subject.hasComposition ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      <span>{locale === "fr" ? subject.nameFr : subject.nameEn}</span>
                      <span className="text-xs text-muted-foreground">
                        ({t.grading.coefficient}×{subject.coefficient})
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>I: {subject.interrogations}</span>
                      <span>DS: {subject.devoirsSurveilles}</span>
                      <span className={subject.hasComposition ? "text-emerald-600 font-medium" : "text-amber-600"}>
                        C: {subject.compositions}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t flex justify-end gap-2">
                <Link href={`/students/grading/entry`}>
                  <Button variant="outline" size="sm">
                    <PenLine className="h-3.5 w-3.5 mr-1" />
                    {t.grading.gradeEntry}
                  </Button>
                </Link>
                <Link href={`/students/grading/ranking`}>
                  <Button variant="outline" size="sm">
                    <Trophy className="h-3.5 w-3.5 mr-1" />
                    {t.grading.classRanking}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
