"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { shadows } from "@/lib/design-tokens"
import { useI18n } from "@/components/i18n-provider"

// ============================================================================
// DIALOG COLOR THEMES (Refined — 4 tokens per color)
// ============================================================================

const dialogThemes = {
  emerald: {
    headerBg: "bg-emerald-50/80 dark:bg-emerald-950/30",
    iconText: "text-emerald-600 dark:text-emerald-400",
    submitBg: "bg-emerald-600 hover:bg-emerald-700 text-white",
    dot: "bg-emerald-500",
  },
  blue: {
    headerBg: "bg-blue-50/80 dark:bg-blue-950/30",
    iconText: "text-blue-600 dark:text-blue-400",
    submitBg: "bg-blue-600 hover:bg-blue-700 text-white",
    dot: "bg-blue-500",
  },
  amber: {
    headerBg: "bg-amber-50/80 dark:bg-amber-950/30",
    iconText: "text-amber-600 dark:text-amber-400",
    submitBg: "bg-amber-600 hover:bg-amber-700 text-white",
    dot: "bg-amber-500",
  },
  orange: {
    headerBg: "bg-orange-50/80 dark:bg-orange-950/30",
    iconText: "text-orange-600 dark:text-orange-400",
    submitBg: "bg-orange-600 hover:bg-orange-700 text-white",
    dot: "bg-orange-500",
  },
  maroon: {
    headerBg: "bg-gspn-maroon-50/80 dark:bg-gspn-maroon-950/30",
    iconText: "text-gspn-maroon-500 dark:text-gspn-maroon-400",
    submitBg: "bg-gspn-maroon-500 hover:bg-gspn-maroon-600 text-white",
    dot: "bg-gspn-maroon-500",
  },
  red: {
    headerBg: "bg-red-50/80 dark:bg-red-950/30",
    iconText: "text-red-600 dark:text-red-400",
    submitBg: "bg-red-600 hover:bg-red-700 text-white",
    dot: "bg-red-500",
  },
  gold: {
    headerBg: "bg-gspn-gold-50/80 dark:bg-gspn-gold-950/30",
    iconText: "text-gspn-gold-600 dark:text-gspn-gold-400",
    submitBg: "bg-gspn-gold-500 hover:bg-gspn-gold-600 text-black",
    dot: "bg-gspn-gold-500",
  },
} as const

export type DialogAccentColor = keyof typeof dialogThemes

export { dialogThemes }

// ============================================================================
// ACCENT COLOR CONTEXT (theme propagation to FormField without prop drilling)
// ============================================================================

const AccentColorContext = React.createContext<DialogAccentColor>("emerald")

export function useDialogAccent() {
  return React.useContext(AccentColorContext)
}

// ============================================================================
// FORM DIALOG
// ============================================================================

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  icon: LucideIcon
  accentColor: DialogAccentColor
  maxWidth?: string
  children: React.ReactNode
  // Footer — provide `footer` for full control, or use the built-in props
  footer?: React.ReactNode
  submitLabel?: string
  submitIcon?: LucideIcon
  cancelLabel?: string
  onSubmit?: () => void | Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  isDisabled?: boolean
  error?: string | null
}

function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  accentColor,
  maxWidth = "sm:max-w-[500px]",
  children,
  footer,
  submitLabel,
  submitIcon: SubmitIcon,
  cancelLabel,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isDisabled = false,
  error,
}: FormDialogProps) {
  const { t } = useI18n()
  const resolvedCancelLabel = cancelLabel ?? t.common.cancel
  const theme = dialogThemes[accentColor]

  const hasBuiltInFooter = !footer && (onSubmit || onCancel)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          maxWidth,
          "p-0 overflow-hidden gap-0",
          shadows.dialog,
          "ring-1 ring-black/[0.08] dark:ring-white/[0.08]",
        )}
      >
        {/* Tinted header zone */}
        <div className={cn("px-5 pt-5 pb-4", theme.headerBg)}>
          <DialogHeader className="space-y-0">
            <DialogTitle className="flex items-center gap-2.5 font-display font-semibold tracking-tight text-foreground">
              <Icon className={cn("h-5 w-5 shrink-0", theme.iconText)} />
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="text-[13px] text-muted-foreground mt-1 pl-[30px]">
                {description}
              </DialogDescription>
            ) : (
              <DialogDescription className="sr-only">{title}</DialogDescription>
            )}
          </DialogHeader>
        </div>

        {/* Scrollable form body */}
        <div className="px-5 py-4 overflow-y-auto max-h-[calc(80vh-12rem)]">
          <AccentColorContext.Provider value={accentColor}>
            <div className="space-y-4">{children}</div>
          </AccentColorContext.Provider>

          {/* Error banner */}
          {error && (
            <div className="mt-4">
              <FormError message={error} />
            </div>
          )}
        </div>

        {/* Tinted footer */}
        {footer ? (
          <div className="px-5 py-3.5 bg-muted/40 dark:bg-muted/20">
            {footer}
          </div>
        ) : hasBuiltInFooter ? (
          <div className="px-5 py-3.5 bg-muted/40 dark:bg-muted/20">
            <DialogFooter>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  {resolvedCancelLabel}
                </Button>
              )}
              {onSubmit && (
                <Button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitting || isDisabled}
                  className={theme.submitBg}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : SubmitIcon ? (
                    <SubmitIcon className="mr-2 h-4 w-4" />
                  ) : null}
                  {submitLabel ?? t.common.submit}
                </Button>
              )}
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// FORM FIELD
// ============================================================================

interface FormFieldProps {
  label: string
  required?: boolean
  optional?: boolean
  hint?: string
  children: React.ReactNode
  className?: string
}

function FormField({
  label,
  required,
  optional,
  hint,
  children,
  className,
}: FormFieldProps) {
  const { t } = useI18n()
  const accentColor = React.useContext(AccentColorContext)
  const theme = dialogThemes[accentColor]

  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
        {required && (
          <div className={cn("h-1.5 w-1.5 rounded-full", theme.dot)} />
        )}
        {optional && (
          <span className="font-normal normal-case tracking-normal text-muted-foreground/60">
            ({t.common.optional.toLowerCase()})
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] text-muted-foreground/70">{hint}</p>
      )}
    </div>
  )
}

// ============================================================================
// FORM ERROR (standalone, for use outside FormDialog)
// ============================================================================

interface FormErrorProps {
  message: string | null | undefined
}

function FormError({ message }: FormErrorProps) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2.5 text-sm text-red-600 dark:text-red-400 bg-red-500/[0.04] dark:bg-red-500/10 p-3 rounded-lg border-l-2 border-l-red-500">
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  )
}

export { FormDialog, FormField, FormError }
