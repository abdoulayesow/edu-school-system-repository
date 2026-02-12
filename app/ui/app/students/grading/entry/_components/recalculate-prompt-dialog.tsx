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
import { componentClasses } from "@/lib/design-tokens"

interface RecalculatePromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isRecalculating: boolean
  onConfirm: () => void
}

export function RecalculatePromptDialog({
  open,
  onOpenChange,
  isRecalculating,
  onConfirm,
}: RecalculatePromptDialogProps) {
  const { t } = useI18n()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.grading.recalculateAverages}</AlertDialogTitle>
          <AlertDialogDescription>{t.grading.recalculatePromptMessage}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.grading.skipRecalculate}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isRecalculating} className={componentClasses.primaryActionButton}>
            {isRecalculating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t.grading.recalculateNow}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
