"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle2,
  Download,
  Printer,
  Plus,
  ArrowRight,
  Receipt,
  Sparkles,
  PartyPopper,
  Loader2,
} from "lucide-react"
import { usePaymentWizard } from "../wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import { formatDate } from "@/lib/utils"
import { sizing, typography, gradients, interactive } from "@/lib/design-tokens"
import Link from "next/link"

interface StepCompletionProps {
  onComplete?: () => void
}

export function StepCompletion({ onComplete }: StepCompletionProps) {
  const { t, locale } = useI18n()
  const { state, reset } = usePaymentWizard()
  const { data } = state

  const [isDownloading, setIsDownloading] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  const studentName = `${data.studentFirstName} ${data.studentLastName}`
  const isFullyPaid = data.remainingBalance === data.paymentAmount

  // Handle PDF download
  const handleDownloadPdf = async () => {
    if (!data.paymentId) return

    setIsDownloading(true)
    try {
      const response = await fetch(`/api/payments/${data.paymentId}/receipt-pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `receipt-${data.receiptNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error("Failed to download PDF:", err)
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle print
  const handlePrint = async () => {
    if (!data.paymentId) return

    setIsPrinting(true)
    try {
      const response = await fetch(`/api/payments/${data.paymentId}/receipt-pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const printWindow = window.open(url)
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print()
          }
        }
      }
    } catch (err) {
      console.error("Failed to print:", err)
    } finally {
      setIsPrinting(false)
    }
  }

  // Handle new payment
  const handleNewPayment = () => {
    reset()
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className={cn(
        "border-2 shadow-xl overflow-hidden relative",
        isFullyPaid
          ? cn(gradients.safe.light, gradients.safe.dark, gradients.safe.border)
          : "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20"
      )}>
        {/* Decorative gradient overlay */}
        <div className={cn(
          "absolute inset-0 pointer-events-none",
          isFullyPaid
            ? "bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10"
            : "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-green-500/10"
        )} />

        {/* Sparkle decorations */}
        {isFullyPaid && (
          <>
            <div className="absolute top-4 left-8 opacity-60">
              <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
            </div>
            <div className="absolute top-12 right-12 opacity-40">
              <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" style={{ animationDelay: "0.5s" }} />
            </div>
            <div className="absolute bottom-8 left-16 opacity-50">
              <Sparkles className="h-5 w-5 text-orange-400 animate-pulse" style={{ animationDelay: "1s" }} />
            </div>
          </>
        )}

        <CardContent className="py-10 relative">
          <div className="text-center space-y-4">
            {/* Success Icon */}
            <div className={cn(
              "inline-flex p-5 rounded-full",
              isFullyPaid
                ? "bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 ring-4 ring-amber-200 dark:ring-amber-800"
                : "bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 ring-4 ring-emerald-200 dark:ring-emerald-800"
            )}>
              {isFullyPaid ? (
                <PartyPopper className={cn(
                  "h-12 w-12 text-amber-600 dark:text-amber-400",
                  "animate-bounce"
                )} style={{ animationDuration: "2s" }} />
              ) : (
                <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className={cn(
                "text-3xl font-bold",
                isFullyPaid
                  ? "bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-500 bg-clip-text text-transparent"
                  : "text-emerald-600 dark:text-emerald-400"
              )}>
                {isFullyPaid
                  ? (locale === "fr" ? "Scolarité soldée!" : "Tuition Fully Paid!")
                  : (locale === "fr" ? "Paiement enregistré!" : "Payment Recorded!")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {locale === "fr"
                  ? "Le paiement a été enregistré avec succès"
                  : "The payment has been successfully recorded"}
              </p>
            </div>

            {/* Receipt Number Badge */}
            <div className={cn(
              "inline-flex items-center gap-3 px-6 py-3 rounded-full",
              "bg-white/60 dark:bg-black/20",
              "border",
              isFullyPaid
                ? "border-amber-200 dark:border-amber-800"
                : "border-emerald-200 dark:border-emerald-800"
            )}>
              <Receipt className={cn(
                "h-5 w-5",
                isFullyPaid
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              )} />
              <span className="font-mono text-lg font-semibold">
                {data.receiptNumber}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardContent className="py-6 space-y-4">
          <h3 className="font-semibold text-center">
            {t?.paymentWizard?.paymentSummary || "Payment Summary"}
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {t?.paymentWizard?.student || "Student"}
              </span>
              <span className="font-medium">{studentName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {t?.paymentWizard?.grade || "Grade"}
              </span>
              <span>{data.gradeName}</span>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {t?.paymentWizard?.amount || "Amount"}
              </span>
              <span className={cn(
                typography.currency.lg,
                "text-emerald-600 dark:text-emerald-400"
              )}>
                {formatCurrency(data.paymentAmount || 0)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {t?.paymentWizard?.paymentMethod || "Method"}
              </span>
              <Badge variant="outline">
                {data.paymentMethod === "cash"
                  ? (locale === "fr" ? "Espèces" : "Cash")
                  : "Orange Money"}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {t?.paymentWizard?.payer || "Payer"}
              </span>
              <span>{data.payer?.name}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {t?.paymentWizard?.date || "Date"}
              </span>
              <span>{formatDate(data.createdAt || new Date().toISOString(), locale)}</span>
            </div>

            {!isFullyPaid && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {t?.paymentWizard?.newBalance || "New Balance"}
                  </span>
                  <span className={cn(typography.currency.md, "text-amber-600 dark:text-amber-400")}>
                    {formatCurrency((data.remainingBalance || 0) - (data.paymentAmount || 0))}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={handleDownloadPdf}
          disabled={isDownloading || !data.paymentId}
          className={cn("h-12", interactive.button)}
        >
          {isDownloading ? (
            <Loader2 className={cn(sizing.icon.sm, "mr-2 animate-spin")} />
          ) : (
            <Download className={cn(sizing.icon.sm, "mr-2")} />
          )}
          {t?.paymentWizard?.downloadReceipt || "Download Receipt"}
        </Button>

        <Button
          variant="outline"
          onClick={handlePrint}
          disabled={isPrinting || !data.paymentId}
          className={cn("h-12", interactive.button)}
        >
          {isPrinting ? (
            <Loader2 className={cn(sizing.icon.sm, "mr-2 animate-spin")} />
          ) : (
            <Printer className={cn(sizing.icon.sm, "mr-2")} />
          )}
          {t?.paymentWizard?.printReceipt || "Print Receipt"}
        </Button>
      </div>

      {/* Navigation Options */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={handleNewPayment}
          variant="default"
          size="lg"
          className={cn("w-full", interactive.button)}
        >
          <Plus className={cn(sizing.icon.sm, "mr-2")} />
          {t?.paymentWizard?.recordAnother || "Record Another Payment"}
        </Button>

        <Button
          asChild
          variant="ghost"
          size="lg"
          className="w-full"
        >
          <Link href={`/students/${data.studentId}`}>
            {t?.paymentWizard?.viewStudent || "View Student Profile"}
            <ArrowRight className={cn(sizing.icon.sm, "ml-2")} />
          </Link>
        </Button>

        {onComplete && (
          <Button
            onClick={onComplete}
            variant="ghost"
            size="lg"
            className="w-full"
          >
            {t?.common?.close || "Close"}
          </Button>
        )}
      </div>
    </div>
  )
}
