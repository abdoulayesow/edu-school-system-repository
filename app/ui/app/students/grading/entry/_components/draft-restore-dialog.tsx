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
import { CloudOff } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { componentClasses } from "@/lib/design-tokens"
import { formatRelativeTime } from "@/hooks/use-grade-entry-preferences"

interface DraftRestoreDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: {
    entries: Record<string, { score: string; notes: string }>
    savedAt: number | string
  } | null
  onRestore: () => void
  onDiscard: () => void
}

export function DraftRestoreDialog({
  open,
  onOpenChange,
  draft,
  onRestore,
  onDiscard,
}: DraftRestoreDialogProps) {
  const { t, locale } = useI18n()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CloudOff className="h-5 w-5 text-gspn-gold-500" />
            {t.grading.draftAvailable}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {draft && (
              <span>
                {Object.keys(draft.entries).length} {t.grading.gradesEntered.toLowerCase()} •{" "}
                {formatRelativeTime(new Date(draft.savedAt), locale as "en" | "fr")}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDiscard}>{t.grading.discardDraft}</AlertDialogCancel>
          <AlertDialogAction onClick={onRestore} className={componentClasses.primaryActionButton}>
            {t.grading.restoreDraft}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
