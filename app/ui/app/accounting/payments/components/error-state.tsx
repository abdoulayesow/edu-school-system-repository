"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
  variant?: "card" | "alert"
}

export function ErrorState({
  title,
  message,
  onRetry,
  className,
  variant = "card"
}: ErrorStateProps) {
  const { t } = useI18n()

  const content = (
    <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
      {/* Error Icon with subtle animation */}
      <div className="relative">
        <div className="absolute inset-0 bg-destructive/10 rounded-full animate-ping" />
        <div className="relative p-4 rounded-full bg-destructive/10 border-2 border-destructive/20">
          <AlertCircle className="size-8 text-destructive" />
        </div>
      </div>

      {/* Error Message */}
      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-semibold text-foreground">
          {title || t.accounting.somethingWentWrong}
        </h3>
        <p className="text-sm text-muted-foreground">
          {message || t.accounting.errorLoadingPayments}
        </p>
      </div>

      {/* Retry Button */}
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="group hover:shadow-md transition-all duration-200"
        >
          <RefreshCw className="size-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
          {t.accounting.retry}
        </Button>
      )}
    </div>
  )

  if (variant === "alert") {
    return (
      <Alert variant="destructive" className={cn("animate-in fade-in-50 slide-in-from-top-2 duration-300", className)}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title || t.accounting.somethingWentWrong}</AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-4">
          <span>{message || t.accounting.errorLoadingPayments}</span>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              <RefreshCw className="size-3 mr-1" />
              {t.accounting.retry}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className={cn("border-destructive/20 animate-in fade-in-50 slide-in-from-bottom-4 duration-500", className)}>
      <CardContent className="p-6">
        {content}
      </CardContent>
    </Card>
  )
}
