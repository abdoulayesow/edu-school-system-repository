"use client"

import { Textarea } from "@/components/ui/textarea"
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
import type { StudentSummary, RemarkEntry } from "@/lib/types/grading"

interface RemarksTableProps {
  summaries: StudentSummary[]
  remarkEntries: Map<string, RemarkEntry>
  onRemarkChange: (summaryId: string, value: string) => void
  t: {
    common: {
      student: string
    }
    grading: {
      generalAverage: string
      generalRemark: string
      remarkPlaceholder: string
    }
  }
}

export function RemarksTable({
  summaries,
  remarkEntries,
  onRemarkChange,
  t,
}: RemarksTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className={componentClasses.tableHeaderRow}>
          <TableHead className="w-12">#</TableHead>
          <TableHead className="w-64">{t.common.student}</TableHead>
          <TableHead className="w-24 text-center">{t.grading.generalAverage}</TableHead>
          <TableHead>{t.grading.generalRemark}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {summaries.map((summary, index) => {
          const entry = remarkEntries.get(summary.id)
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
                <Textarea
                  value={entry?.remark || ""}
                  onChange={(e) => onRemarkChange(summary.id, e.target.value)}
                  placeholder={t.grading.remarkPlaceholder}
                  className="min-h-[70px] resize-none"
                  rows={2}
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
