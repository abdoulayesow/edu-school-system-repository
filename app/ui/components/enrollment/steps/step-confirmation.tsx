"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEnrollmentWizard } from "../wizard-context"
import { useI18n } from "@/components/i18n-provider"
import {
  CheckCircle2,
  Download,
  Printer,
  Clock,
  AlertTriangle,
  ArrowRight,
  Home,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { sizing } from "@/lib/design-tokens"

export function StepConfirmation() {
  const { t, locale } = useI18n()
  const { state } = useEnrollmentWizard()
  const { data, enrollmentId } = state
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const hasAdjustment =
    data.adjustedTuitionFee !== undefined &&
    data.adjustedTuitionFee !== data.originalTuitionFee

  // Calculate days until auto-approval (3 days from submission)
  const daysUntilApproval = hasAdjustment ? null : 3

  // Handle PDF download
  const handleDownloadPdf = async () => {
    if (!enrollmentId) return

    setIsDownloading(true)
    setDownloadError(null)

    try {
      const lang = locale === "fr" ? "fr" : "en"
      const response = await fetch(`/api/enrollments/${enrollmentId}/pdf?lang=${lang}`)

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `inscription-${data.enrollmentNumber || enrollmentId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Failed to download PDF:", error)
      setDownloadError(t.enrollmentWizard.pdfDownloadError || "Failed to download PDF")
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle print
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {t.enrollmentWizard.enrollmentComplete}
        </h2>
        <p className="text-muted-foreground mt-2">
          {data.firstName} {data.lastName} - {data.gradeName}
        </p>
      </div>

      {/* Status Alert */}
      {hasAdjustment ? (
        <Alert variant="destructive">
          <AlertTriangle className={sizing.icon.sm} />
          <AlertTitle>{t.enrollmentWizard.statusReviewRequired}</AlertTitle>
          <AlertDescription>
            {t.enrollmentWizard.requiresApproval}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <Clock className={sizing.icon.sm} />
          <AlertTitle>{t.enrollmentWizard.statusSubmitted}</AlertTitle>
          <AlertDescription>
            {t.enrollmentWizard.autoApproveIn.replace("{days}", String(daysUntilApproval))}
          </AlertDescription>
        </Alert>
      )}

      {/* Reference Numbers */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            <div>
              <p className="text-sm text-muted-foreground">
                {t.enrollmentWizard.enrollmentNumber}
              </p>
              <p className="text-2xl font-mono font-bold text-primary">
                {data.enrollmentNumber || "ENR-XXXX-XXXXX"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t.enrollmentWizard.studentNumber}
              </p>
              <p className="text-2xl font-mono font-bold">
                {data.studentNumber || "STU-XXXXX"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Badge */}
      <div className="flex justify-center">
        <Badge
          variant={hasAdjustment ? "destructive" : "default"}
          className="text-base px-4 py-2"
        >
          {hasAdjustment
            ? t.enrollmentWizard.statusReviewRequired
            : t.enrollmentWizard.statusSubmitted}
        </Badge>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.enrollmentWizard.enrollmentSummary}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Student</span>
            <span className="font-medium">
              {data.firstName} {data.lastName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Grade</span>
            <span className="font-medium">{data.gradeName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Tuition</span>
            <span className="font-medium">
              {new Intl.NumberFormat("fr-GN", {
                style: "currency",
                currency: "GNF",
                minimumFractionDigits: 0,
              }).format(data.adjustedTuitionFee || data.originalTuitionFee)}
            </span>
          </div>
          {data.paymentMade && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Initial Payment</span>
              <span className="font-medium text-primary">
                {new Intl.NumberFormat("fr-GN", {
                  style: "currency",
                  currency: "GNF",
                  minimumFractionDigits: 0,
                }).format(data.paymentAmount || 0)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Download Error */}
      {downloadError && (
        <Alert variant="destructive">
          <AlertTriangle className={sizing.icon.sm} />
          <AlertDescription>{downloadError}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={handleDownloadPdf} disabled={isDownloading} className="gap-2">
          {isDownloading ? (
            <Loader2 className={sizing.icon.sm + " animate-spin"} />
          ) : (
            <Download className={sizing.icon.sm} />
          )}
          {isDownloading ? t.common.loading || "Loading..." : t.enrollmentWizard.downloadPdf}
        </Button>
        <Button variant="outline" onClick={handlePrint} className="gap-2 bg-transparent">
          <Printer className={sizing.icon.sm} />
          {t.enrollmentWizard.printDocument}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6 border-t">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/enrollments">
            <Home className={sizing.icon.sm} />
            {t.enrollmentWizard.backToEnrollments}
          </Link>
        </Button>
        <Button variant="outline" asChild className="gap-2 bg-transparent">
          <Link href="/enrollments/new">
            <ArrowRight className={sizing.icon.sm} />
            {t.enrollmentWizard.startNewEnrollment}
          </Link>
        </Button>
      </div>
    </div>
  )
}
