"use client"

import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { componentClasses } from "@/lib/design-tokens"
import { getScoreColor } from "@/lib/grading-utils"
import type { StudentSummary, ConductEntry } from "@/lib/types/grading"

interface ConductTableProps {
  summaries: StudentSummary[]
  conductEntries: Map<string, ConductEntry>
  onConductChange: (summaryId: string, field: "conduct" | "absences" | "lates", value: string) => void
  t: {
    common: {
      student: string
    }
    grading: {
      generalAverage: string
      conductScore: string
      absencesCount: string
      latesCount: string
    }
  }
}

export function ConductTable({
  summaries,
  conductEntries,
  onConductChange,
  t,
}: ConductTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className={componentClasses.tableHeaderRow}>
          <TableHead className="w-12">#</TableHead>
          <TableHead>{t.common.student}</TableHead>
          <TableHead className="w-24 text-center">{t.grading.generalAverage}</TableHead>
          <TableHead className="w-32">{t.grading.conductScore}</TableHead>
          <TableHead className="w-28">{t.grading.absencesCount}</TableHead>
          <TableHead className="w-28">{t.grading.latesCount}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {summaries.map((summary, index) => {
          const entry = conductEntries.get(summary.id)
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
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={entry?.conduct || ""}
                  onChange={(e) => onConductChange(summary.id, "conduct", e.target.value)}
                  placeholder="--"
                  className="w-20"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  value={entry?.absences || ""}
                  onChange={(e) => onConductChange(summary.id, "absences", e.target.value)}
                  placeholder="0"
                  className="w-20"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  value={entry?.lates || ""}
                  onChange={(e) => onConductChange(summary.id, "lates", e.target.value)}
                  placeholder="0"
                  className="w-20"
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
