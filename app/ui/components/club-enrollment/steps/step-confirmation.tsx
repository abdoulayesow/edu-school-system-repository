"use client"

import React, { useState } from "react"
import { CheckCircle2, Eye, UserPlus, ArrowLeft, Download, FileText, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { sizing } from "@/lib/design-tokens"
import { useI18n } from "@/components/i18n-provider"
import { useRouter } from "next/navigation"
import { useClubEnrollmentWizard } from "../wizard-context"

export function StepConfirmation() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const { state, reset } = useClubEnrollmentWizard()
  const [isDownloading, setIsDownloading] = useState(false)

  const handleEnrollAnother = () => {
    reset()
  }

  const handleViewEnrollment = () => {
    if (state.data.enrollmentId) {
      router.push(`/club-enrollments/${state.data.enrollmentId}`)
    }
  }

  const handleReturnToClubs = () => {
    router.push("/students/clubs")
  }

  const handleDownloadCertificate = async () => {
    if (!state.data.enrollmentId) return

    try {
      setIsDownloading(true)

      const response = await fetch(
        `/api/club-enrollments/${state.data.enrollmentId}/certificate?locale=${locale}`
      )

      if (!response.ok) {
        throw new Error("Failed to generate certificate")
      }

      // Get the blob from response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition")
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      link.download = filenameMatch ? filenameMatch[1] : "enrollment-certificate.pdf"

      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading certificate:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  const translations = {
    enrollmentSuccessful: t.clubEnrollmentWizard?.enrollmentSuccessful || "Enrollment Successful!",
    successMessage: t.clubEnrollmentWizard?.successMessage || "Student has been successfully enrolled in the club",
    enrollmentNumber: t.clubEnrollmentWizard?.enrollmentNumber || "Enrollment Number",
    enrolledIn: t.clubEnrollmentWizard?.enrolledIn || "Enrolled in",
    paymentRecorded: t.clubEnrollmentWizard?.paymentRecorded || "Payment Recorded",
    amountPaid: t.clubEnrollmentWizard?.amountPaid || "Amount Paid",
    receipt: t.clubEnrollmentWizard?.receipt || "Receipt",
    status: t.common?.status || "Status",
    downloadCertificate: t.clubEnrollmentWizard?.downloadCertificate || "Download Certificate",
    downloading: t.common?.downloading || "Downloading...",
    returnToClubs: t.clubEnrollmentWizard?.backToClubs || "Return to Clubs",
    viewEnrollment: t.clubEnrollmentWizard?.viewEnrollment || "View Enrollment",
    enrollAnother: t.clubEnrollmentWizard?.enrollAnother || "Enroll Another Student",
  }

  const initials = state.data.studentName
    ? state.data.studentName
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "?"

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-GN", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700">
      {/* Success Icon */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full mb-6 shadow-2xl animate-in zoom-in duration-500">
          <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">{translations.enrollmentSuccessful}</h2>
        <p className="text-lg text-muted-foreground">
          {translations.successMessage}
        </p>
      </div>

      {/* Enrollment Details Card */}
      <div className="p-8 bg-white border-2 border-border rounded-2xl shadow-lg space-y-6">
        {/* Enrollment Number */}
        {state.data.enrollmentNumber && (
          <div className="text-center pb-6 border-b-2 border-gray-100">
            <div className="text-sm text-gray-500 mb-1">{translations.enrollmentNumber}</div>
            <div className="text-2xl font-bold text-amber-700 font-mono">
              {state.data.enrollmentNumber}
            </div>
          </div>
        )}

        {/* Student Info */}
        <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl">
          <Avatar className="w-16 h-16 border-2 border-amber-300">
            <AvatarImage src={state.data.studentPhoto || undefined} alt={state.data.studentName} />
            <AvatarFallback className="bg-amber-200 text-amber-800 font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-bold text-lg text-foreground">{state.data.studentName}</div>
            {state.data.studentGrade && (
              <Badge variant="outline" className="mt-1">
                {state.data.studentGrade}
              </Badge>
            )}
          </div>
        </div>

        {/* Club Info */}
        <div>
          <div className="text-sm text-gray-500 mb-2">{translations.enrolledIn}</div>
          <div className="p-4 bg-muted/50 rounded-xl">
            <div className="font-bold text-lg text-foreground mb-1">
              {locale === "fr" && state.data.clubNameFr
                ? state.data.clubNameFr
                : state.data.clubName}
            </div>
            {state.data.categoryName && (
              <Badge variant="secondary">{state.data.categoryName}</Badge>
            )}
          </div>
        </div>

        {/* Payment Info */}
        {state.data.paymentAmount && state.data.paymentAmount > 0 && (
          <div>
            <div className="text-sm text-gray-500 mb-2">{translations.paymentRecorded}</div>
            <div className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-xl">
              <span className="text-gray-700">{translations.amountPaid}</span>
              <span className="font-bold text-green-700 text-lg">
                {formatCurrency(state.data.paymentAmount)}
              </span>
            </div>
            {state.data.receiptNumber && (
              <div className="mt-2 text-sm text-muted-foreground">
                {translations.receipt}: <span className="font-mono font-semibold">{state.data.receiptNumber}</span>
              </div>
            )}
          </div>
        )}

        {/* Status Badge */}
        {state.data.status && (
          <div className="pt-6 border-t-2 border-gray-100">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">{translations.status}:</span>
              <Badge
                variant={state.data.status === "completed" ? "default" : "secondary"}
                className={cn(
                  state.data.status === "completed" && "bg-green-600 hover:bg-green-700"
                )}
              >
                {state.data.status.charAt(0).toUpperCase() + state.data.status.slice(1)}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Certificate Download - Premium Design */}
      {state.data.enrollmentId && (
        <div className="relative group">
          {/* Decorative background glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-500" />

          <div className="relative p-6 bg-gradient-to-br from-amber-50 via-white to-orange-50 border-2 border-amber-200 rounded-2xl overflow-hidden">
            {/* Decorative corner elements */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-transparent rounded-br-full" />
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-orange-400/20 to-transparent rounded-tl-full" />

            <div className="relative flex flex-col sm:flex-row items-center gap-4">
              {/* Certificate Icon */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {locale === "fr" ? "Certificat d'inscription" : "Enrollment Certificate"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {locale === "fr"
                    ? "Téléchargez le certificat officiel d'inscription au club"
                    : "Download the official club enrollment certificate"}
                </p>
              </div>

              {/* Download Button */}
              <Button
                onClick={handleDownloadCertificate}
                disabled={isDownloading}
                className={cn(
                  "flex-shrink-0 h-12 px-6 gap-2 text-white font-semibold shadow-lg",
                  "bg-gradient-to-r from-amber-500 to-orange-500",
                  "hover:from-amber-600 hover:to-orange-600",
                  "hover:shadow-xl hover:scale-105",
                  "transition-all duration-300",
                  "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                )}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className={cn(sizing.icon.sm, "animate-spin")} />
                    {translations.downloading}
                  </>
                ) : (
                  <>
                    <Download className={sizing.icon.sm} />
                    {translations.downloadCertificate}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleReturnToClubs}
          variant="outline"
          className="flex-1 h-12 gap-2"
        >
          <ArrowLeft className={sizing.icon.sm} />
          {translations.returnToClubs}
        </Button>

        {state.data.enrollmentId && (
          <Button
            onClick={handleViewEnrollment}
            variant="outline"
            className="flex-1 h-12 gap-2"
          >
            <Eye className={sizing.icon.sm} />
            {translations.viewEnrollment}
          </Button>
        )}

        <Button
          onClick={handleEnrollAnother}
          className="flex-1 h-12 gap-2 bg-amber-600 hover:bg-amber-700 text-white"
        >
          <UserPlus className={sizing.icon.sm} />
          {translations.enrollAnother}
        </Button>
      </div>
    </div>
  )
}
