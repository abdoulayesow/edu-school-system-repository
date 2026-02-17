"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Loader2, AlertTriangle } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { sizing } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"

interface DownloadStudentPaymentSummaryButtonProps {
  studentId: string
  studentNumber?: string | null
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
  className?: string
  showError?: boolean
}

export function DownloadStudentPaymentSummaryButton({
  studentId,
  studentNumber,
  variant = "outline",
  className,
  showError = false,
}: DownloadStudentPaymentSummaryButtonProps) {
  const { t, locale } = useI18n()
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const handleDownloadPdf = async () => {
    if (!studentId) return

    setIsDownloading(true)
    setDownloadError(null)

    try {
      const lang = locale === "fr" ? "fr" : "en"
      const response = await fetch(`/api/students/${studentId}/payments/summary-pdf?lang=${lang}`)

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `payment-summary-${studentNumber || studentId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Failed to download PDF:", error)
      setDownloadError(
        t.accounting?.downloadPaymentSummaryError ||
          "Failed to download payment summary"
      )
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <>
      <Button
        onClick={handleDownloadPdf}
        disabled={isDownloading}
        variant={variant}
        className={cn("gap-2", variant === "outline" && "bg-transparent", className)}
      >
        {isDownloading ? (
          <Loader2 className={cn(sizing.icon.sm, "animate-spin")} />
        ) : (
          <Download className={sizing.icon.sm} />
        )}
        {isDownloading
          ? t.common?.loading || "Loading..."
          : t.accounting?.downloadPaymentSummary || "Download Payment Summary"}
      </Button>

      {/* Download Error */}
      {showError && downloadError && (
        <Alert variant="destructive">
          <AlertTriangle className={sizing.icon.sm} />
          <AlertDescription>{downloadError}</AlertDescription>
        </Alert>
      )}
    </>
  )
}
