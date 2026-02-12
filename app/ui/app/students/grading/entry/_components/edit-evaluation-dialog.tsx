"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { componentClasses } from "@/lib/design-tokens"
import type { Evaluation } from "@/lib/types/grading"

interface EditEvaluationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  evaluation: Evaluation | null
  editScore: string
  editNotes: string
  editDate: string
  onScoreChange: (value: string) => void
  onNotesChange: (value: string) => void
  onDateChange: (value: string) => void
  isSubmitting: boolean
  onConfirm: () => void
}

export function EditEvaluationDialog({
  open,
  onOpenChange,
  evaluation,
  editScore,
  editNotes,
  editDate,
  onScoreChange,
  onNotesChange,
  onDateChange,
  isSubmitting,
  onConfirm,
}: EditEvaluationDialogProps) {
  const { t } = useI18n()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.grading.editEvaluation}</DialogTitle>
          <DialogDescription>
            {evaluation?.studentName} - {evaluation?.subjectName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{t.grading.score}</Label>
              <Input
                type="number"
                min="0"
                max={evaluation?.maxScore || 20}
                step="0.5"
                value={editScore}
                onChange={(e) => onScoreChange(e.target.value)}
              />
              <span className="text-sm text-muted-foreground">
                {t.grading.outOf} {evaluation?.maxScore || 20}
              </span>
            </div>
            <div className="grid gap-2">
              <Label>{t.grading.evaluationDate}</Label>
              <Input type="date" value={editDate} onChange={(e) => onDateChange(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>{t.grading.teacherRemark}</Label>
            <Textarea
              value={editNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder={t.grading.remarkPlaceholder}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting} className={componentClasses.primaryActionButton}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
