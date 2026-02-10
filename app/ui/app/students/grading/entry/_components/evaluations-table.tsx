"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BookOpen, AlertCircle, Edit, Trash2 } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PermissionGuard } from "@/components/permission-guard"
import { formatDateLong, cn } from "@/lib/utils"
import { componentClasses } from "@/lib/design-tokens"
import type { Evaluation, EvaluationType } from "@/lib/types/grading"

interface EvaluationsTableProps {
  evaluations: Evaluation[]
  isLoading: boolean
  hasGradeSelected: boolean
  hasSearchQuery: boolean
  getEvaluationTypeLabel: (type: EvaluationType) => string
  onEdit: (evaluation: Evaluation) => void
  onDelete: (evaluation: Evaluation) => void
}

export function EvaluationsTable({
  evaluations,
  isLoading,
  hasGradeSelected,
  hasSearchQuery,
  getEvaluationTypeLabel,
  onEdit,
  onDelete,
}: EvaluationsTableProps) {
  const { t, locale } = useI18n()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gspn-maroon-500" />
      </div>
    )
  }

  if (!hasGradeSelected) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{t.grading.selectGrade}</p>
      </div>
    )
  }

  if (evaluations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{hasSearchQuery ? t.common.noResults : t.grading.noEvaluationsFound}</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className={componentClasses.tableHeaderRow}>
          <TableHead>{t.common.student}</TableHead>
          <TableHead>{t.common.subjects}</TableHead>
          <TableHead>{t.grading.evaluationType}</TableHead>
          <TableHead className="text-center">{t.grading.score}</TableHead>
          <TableHead>{t.common.date}</TableHead>
          <TableHead>{t.grading.teacherRemark}</TableHead>
          <TableHead className="text-right">{t.common.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {evaluations.map((evaluation) => (
          <TableRow key={evaluation.id} className={componentClasses.tableRowHover}>
            <TableCell>
              <div>
                <div className="font-medium">{evaluation.studentName}</div>
                <div className="text-sm text-muted-foreground">{evaluation.studentNumber}</div>
              </div>
            </TableCell>
            <TableCell>{evaluation.subjectName}</TableCell>
            <TableCell>
              <Badge variant="outline">{getEvaluationTypeLabel(evaluation.type)}</Badge>
            </TableCell>
            <TableCell className="text-center">
              <span
                className={cn(
                  "font-medium",
                  evaluation.score >= evaluation.maxScore / 2 ? "text-green-600" : "text-red-600"
                )}
              >
                {evaluation.score}/{evaluation.maxScore}
              </span>
            </TableCell>
            <TableCell>{formatDateLong(evaluation.date, locale)}</TableCell>
            <TableCell className="max-w-xs truncate">{evaluation.notes || "-"}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <PermissionGuard resource="grades" action="update" inline>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(evaluation)}
                    title={t.common.edit}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </PermissionGuard>
                <PermissionGuard resource="grades" action="delete" inline>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(evaluation)}
                    title={t.common.delete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </PermissionGuard>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
