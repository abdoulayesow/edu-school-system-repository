"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  CheckCircle2,
  Loader2,
  ArrowRight,
  Sparkles,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { sizing } from "@/lib/design-tokens"
import { useI18n } from "@/components/i18n-provider"
import type { ClubEnrollmentData } from "@/lib/types/club-enrollment"

interface ConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: Partial<ClubEnrollmentData>
  isSubmitting: boolean
  onConfirm: () => void
}

export function ConfirmationModal({
  open,
  onOpenChange,
  data,
  isSubmitting,
  onConfirm,
}: ConfirmationModalProps) {
  const { t, locale } = useI18n()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-GN", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const initials = data.studentName
    ? data.studentName
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "?"

  const hasPayment = data.paymentAmount && data.paymentAmount > 0
  const clubName = locale === "fr" && data.clubNameFr ? data.clubNameFr : data.clubName

  const translations = {
    title: t.clubEnrollmentWizard?.confirmEnrollment || "Confirm Enrollment",
    description: t.clubEnrollmentWizard?.finalConfirmation || "You're about to complete this enrollment",
    withPayment: t.clubEnrollmentWizard?.withPayment || "with initial payment of",
    noPayment: t.clubEnrollmentWizard?.noPaymentNote || "No payment will be recorded",
    cancel: t.common?.cancel || "Cancel",
    confirm: t.clubEnrollmentWizard?.confirmAndSubmit || "Confirm & Submit",
    submitting: t.clubEnrollmentWizard?.confirmingEnrollment || "Submitting...",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center pb-2">
          {/* Animated success indicator */}
          <div className="mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-xl opacity-30 animate-pulse" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {translations.title}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {translations.description}
          </DialogDescription>
        </DialogHeader>

        {/* Compact visual flow: Student → Club */}
        <div className="py-6">
          <div className="flex items-center justify-center gap-3">
            {/* Student */}
            <div className="flex flex-col items-center">
              <Avatar className="h-14 w-14 border-2 border-amber-200 shadow-md">
                <AvatarImage src={data.studentPhoto || undefined} alt={data.studentName} />
                <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-100 text-amber-800 font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="mt-2 text-sm font-semibold text-gray-900 max-w-[100px] text-center truncate">
                {data.studentName}
              </span>
              {data.studentGrade && (
                <span className="text-xs text-gray-500">{data.studentGrade}</span>
              )}
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Club */}
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <span className="mt-2 text-sm font-semibold text-gray-900 max-w-[100px] text-center truncate">
                {clubName}
              </span>
              {data.categoryName && (
                <span className="text-xs text-gray-500">{data.categoryName}</span>
              )}
            </div>
          </div>

          {/* Payment summary */}
          <div className="mt-6 text-center">
            {hasPayment ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-emerald-700">
                  {translations.withPayment}{" "}
                  <span className="font-bold">{formatCurrency(data.paymentAmount!)}</span>
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
                <span className="text-sm text-amber-700">{translations.noPayment}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="flex-1"
          >
            {translations.cancel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={cn(
              "flex-1 gap-2 text-white shadow-lg transition-all duration-200",
              "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
              "hover:shadow-xl hover:scale-[1.02]"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className={cn(sizing.icon.sm, "animate-spin")} />
                {translations.submitting}
              </>
            ) : (
              <>
                <CheckCircle2 className={sizing.icon.sm} />
                {translations.confirm}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
