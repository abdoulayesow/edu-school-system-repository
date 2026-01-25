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
  Eye,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { sizing } from "@/lib/design-tokens"

export function StepConfirmation() {
  const { t, locale } = useI18n()
  const { state, reset } = useEnrollmentWizard()
  const router = useRouter()
  const { data, enrollmentId } = state
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  // Use actual status from API response
  const status = data.enrollmentStatus || "submitted"
  const isCompleted = status === "completed"
  const needsReview = status === "needs_review"

  // Calculate days until auto-approval (3 days from submission)
  const daysUntilApproval = needsReview ? null : 3

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

  // Handle starting a new enrollment
  const handleNewEnrollment = () => {
    reset()
    router.push("/students/enrollments/new")
  }

  // Get icon styling based on status
  const iconBgClass = isCompleted
    ? "bg-green-100 dark:bg-green-900/30"
    : needsReview
    ? "bg-amber-100 dark:bg-amber-900/30"
    : "bg-primary/10"

  const iconClass = isCompleted
    ? "text-green-600 dark:text-green-500"
    : needsReview
    ? "text-amber-600 dark:text-amber-500"
    : "text-primary"

  const badgeClass = isCompleted
    ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
    : ""

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="text-center py-8">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${iconBgClass} mb-4`}>
          <CheckCircle2 className={`h-10 w-10 ${iconClass}`} />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {isCompleted ? (t.enrollmentWizard.statusCompleted || "Enrollment Completed!") : t.enrollmentWizard.enrollmentComplete}
        </h2>
        <p className="text-muted-foreground mt-2">
          {data.firstName} {data.lastName} - {data.gradeName}
        </p>
      </div>

      {/* Status Alert */}
      {needsReview ? (
        <Alert variant="destructive">
          <AlertTriangle className={sizing.icon.sm} />
          <AlertTitle>{t.enrollmentWizard.statusReviewRequired}</AlertTitle>
          <AlertDescription>
            {t.enrollmentWizard.requiresApproval}
          </AlertDescription>
        </Alert>
      ) : isCompleted ? (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CheckCircle2 className={`${sizing.icon.sm} text-green-600 dark:text-green-500`} />
          <AlertTitle className="text-green-800 dark:text-green-200">{t.enrollmentWizard.statusCompleted || "Completed"}</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            {t.enrollmentWizard.enrollmentApproved || "Your enrollment has been approved."}
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
              <p className={`text-2xl font-mono font-bold ${isCompleted ? "text-green-600 dark:text-green-500" : "text-nav-highlight dark:text-gspn-gold-200"}`}>
                {data.enrollmentNumber || "ENR-XXXX-XXXXX"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t.enrollmentWizard.studentNumber}
              </p>
              <p className={`text-2xl font-mono font-bold ${isCompleted ? "text-green-600 dark:text-green-500" : "text-nav-highlight dark:text-gspn-gold-200"}`}>
                {data.studentNumber || "STU-XXXXX"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Badge */}
      <div className="flex justify-center">
        <Badge
          variant={needsReview ? "destructive" : "default"}
          className={`text-base px-4 py-2 ${badgeClass}`}
        >
          {needsReview
            ? t.enrollmentWizard.statusReviewRequired
            : isCompleted
            ? (t.enrollmentWizard.statusCompleted || "Completed")
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
        <Button
          asChild
          className="gap-2 bg-nav-highlight hover:bg-nav-highlight/90 text-black dark:bg-gspn-maroon-950 dark:hover:bg-gspn-maroon-900 dark:text-white"
        >
          <Link href={`/students/enrollments/${enrollmentId}`}>
            <Eye className={sizing.icon.sm} />
            {t.enrollmentWizard.viewEnrollment}
          </Link>
        </Button>
        <Button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          variant="outline"
          className="gap-2 bg-transparent"
        >
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
          <Link href="/students/enrollments">
            <Home className={sizing.icon.sm} />
            {t.enrollmentWizard.backToEnrollments}
          </Link>
        </Button>
        <Button variant="outline" onClick={handleNewEnrollment} className="gap-2 bg-transparent">
          <ArrowRight className={sizing.icon.sm} />
          {t.enrollmentWizard.startNewEnrollment}
        </Button>
      </div>
    </div>
  )
}
