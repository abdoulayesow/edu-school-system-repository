"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { componentClasses } from "@/lib/design-tokens"
import {
  getScoreColor,
  getDecisionConfig,
  calculateDecision,
  DECISION_OPTIONS,
} from "@/lib/grading-utils"
import type { StudentSummary, DecisionEntry, DecisionType } from "@/lib/types/grading"
import { DecisionBadge } from "./decision-badge"

interface DecisionsTableProps {
  summaries: StudentSummary[]
  decisionEntries: Map<string, DecisionEntry>
  onDecisionChange: (summaryId: string, value: DecisionType) => void
  t: {
    common: {
      student: string
    }
    grading: {
      generalAverage: string
      rank: string
      decision: string
      overrideDecision: string
      selectDecision: string
      averageRequired: string
      decisionAutoCalcInfo: string
      admis: string
      rattrapage: string
      redouble: string
      decisionPending: string
      decisionOverridden: string
    }
  }
}

const ICON_MAP = {
  "check-circle": CheckCircle,
  "alert-triangle": AlertTriangle,
  "x-circle": XCircle,
} as const

export function DecisionsTable({
  summaries,
  decisionEntries,
  onDecisionChange,
  t,
}: DecisionsTableProps) {
  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <p className="font-medium mb-1">{t.grading.overrideDecision}</p>
          <p className="text-blue-700 dark:text-blue-300">
            {t.grading.decisionAutoCalcInfo}
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className={componentClasses.tableHeaderRow}>
            <TableHead className="w-12">#</TableHead>
            <TableHead>{t.common.student}</TableHead>
            <TableHead className="w-24 text-center">{t.grading.generalAverage}</TableHead>
            <TableHead className="w-20 text-center">{t.grading.rank}</TableHead>
            <TableHead className="w-44">{t.grading.decision}</TableHead>
            <TableHead className="w-48">{t.grading.overrideDecision}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summaries.map((summary, index) => {
            const entry = decisionEntries.get(summary.id)
            const calculatedDecision = calculateDecision(summary.generalAverage)
            const currentDecision = entry?.hasChanges ? entry.decision : summary.decision
            const isOverridden =
              summary.decisionOverride || (entry?.hasChanges && entry.decision !== calculatedDecision)

            return (
              <TableRow key={summary.id} className={componentClasses.tableRowHover}>
                <TableCell className="text-muted-foreground font-mono text-sm">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{summary.studentName}</div>
                    <div className="text-sm text-muted-foreground">{summary.studentNumber}</div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn("font-semibold", getScoreColor(summary.generalAverage))}>
                    {summary.generalAverage !== null ? summary.generalAverage.toFixed(2) : "-"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {summary.rank !== null && summary.totalStudents !== null ? (
                    <span className="text-muted-foreground">
                      {summary.rank}/{summary.totalStudents}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <DecisionBadge decision={currentDecision} isOverride={isOverridden} t={t} />
                </TableCell>
                <TableCell>
                  {summary.generalAverage !== null ? (
                    <Select
                      value={entry?.decision || summary.decision || ""}
                      onValueChange={(value) => onDecisionChange(summary.id, value as DecisionType)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder={t.grading.selectDecision} />
                      </SelectTrigger>
                      <SelectContent>
                        {DECISION_OPTIONS.map((option) => {
                          const config = getDecisionConfig(option)
                          const Icon = ICON_MAP[config.iconName as keyof typeof ICON_MAP]
                          return (
                            <SelectItem key={option} value={option}>
                              <div className="flex items-center gap-2">
                                {Icon && <Icon className={cn("h-4 w-4", config.color)} />}
                                <span>{t.grading[option as "admis" | "rattrapage" | "redouble"]}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      {t.grading.averageRequired}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
