"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import type { Evaluation } from "@/lib/types/grading"

interface DeleteEvaluationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  evaluation: Evaluation | null
  isDeleting: boolean
  onConfirm: () => void
}

export function DeleteEvaluationDialog({
  open,
  onOpenChange,
  evaluation,
  isDeleting,
  onConfirm,
}: DeleteEvaluationDialogProps) {
  const { t } = useI18n()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.grading.deleteEvaluation}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.grading.deleteEvaluationConfirmation}
            <br />
            <span className="font-medium">
              {evaluation?.studentName} - {evaluation?.subjectName} ({evaluation?.score}/
              {evaluation?.maxScore})
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground"
          >
            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t.common.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
