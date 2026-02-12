"use client"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Keyboard } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

interface KeyboardHelpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardHelpDialog({ open, onOpenChange }: KeyboardHelpDialogProps) {
  const { t } = useI18n()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-gspn-maroon-500" />
            {t.grading.keyboardShortcuts}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <span>{t.grading.shortcutSave}</span>
            <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">Ctrl+S</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>{t.grading.shortcutNextStudent}</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">Enter</kbd>
              <span className="text-muted-foreground">or</span>
              <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">↓</kbd>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>{t.grading.shortcutPrevStudent}</span>
            <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">↑</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>{t.grading.shortcutNextField}</span>
            <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">Tab</kbd>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>{t.common.close}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
