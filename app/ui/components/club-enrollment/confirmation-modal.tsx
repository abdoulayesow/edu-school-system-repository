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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertCircle,
  CheckCircle2,
  Users,
  Calendar,
  DollarSign,
  CreditCard,
  Loader2,
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const initials = data.studentName
    ? data.studentName
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "?"

  const totalFee = (data.enrollmentFee || 0) + (data.monthlyFee || 0)
  const hasPayment = data.paymentAmount && data.paymentAmount > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <CheckCircle2 className={cn(sizing.icon.md, "text-amber-700")} />
            </div>
            <div>
              <DialogTitle className="text-2xl">Confirm Enrollment</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Please review the enrollment details before submitting
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Student Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Users className={sizing.icon.sm} />
              Student Information
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <Avatar className="w-16 h-16 border-2 border-amber-300 shadow-sm">
                <AvatarImage src={data.studentPhoto || undefined} alt={data.studentName} />
                <AvatarFallback className="bg-amber-200 text-amber-800 font-semibold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-bold text-lg text-gray-900">{data.studentName}</div>
                {data.studentGrade && (
                  <Badge variant="outline" className="mt-1">
                    {data.studentGrade}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Club Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Calendar className={sizing.icon.sm} />
              Club Information
            </div>
            <div className="space-y-2 p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="text-sm text-gray-500 mb-1">Club Name</div>
                <div className="font-semibold text-gray-900">
                  {locale === "fr" && data.clubNameFr ? data.clubNameFr : data.clubName}
                </div>
                {data.categoryName && (
                  <Badge variant="secondary" className="mt-1">
                    {data.categoryName}
                  </Badge>
                )}
              </div>
              {data.startDate && data.endDate && (
                <div className="pt-2">
                  <div className="text-sm text-gray-500 mb-1">Duration</div>
                  <div className="text-sm text-gray-700">
                    {formatDate(data.startDate)} - {formatDate(data.endDate)}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Fee Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <DollarSign className={sizing.icon.sm} />
              Fee Breakdown
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Enrollment Fee</span>
                  <span className="font-semibold">{formatCurrency(data.enrollmentFee || 0)}</span>
                </div>
                {data.monthlyFee && data.monthlyFee > 0 && (
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Monthly Fee</span>
                    <span className="font-semibold">{formatCurrency(data.monthlyFee)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>Total Fee</span>
                  <span className="text-amber-700">{formatCurrency(totalFee)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {hasPayment && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <CreditCard className={sizing.icon.sm} />
                  Payment Details
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Payment Amount</span>
                      <span className="font-bold text-green-700">
                        {formatCurrency(data.paymentAmount!)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Payment Method</span>
                      <span className="font-semibold text-gray-900 capitalize">
                        {data.paymentMethod?.replace("_", " ")}
                      </span>
                    </div>
                    {data.receiptNumber && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Receipt Number</span>
                        <span className="font-mono font-semibold text-gray-900">
                          {data.receiptNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Warning if no payment */}
          {!hasPayment && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle className={cn(sizing.icon.sm, "text-amber-600 mt-0.5")} />
              <div className="flex-1 text-sm">
                <div className="font-semibold text-amber-900 mb-1">No Payment Recorded</div>
                <div className="text-amber-700">
                  This enrollment will be created without an initial payment. Payment can be
                  recorded later.
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {data.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-700">Additional Notes</div>
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                  {data.notes}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700 text-white gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className={cn(sizing.icon.sm, "animate-spin")} />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className={sizing.icon.sm} />
                Confirm Enrollment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
