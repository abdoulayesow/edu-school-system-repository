"use client"

import React from "react"
import { CheckCircle2, Eye, UserPlus, ArrowLeft } from "lucide-react"
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

  const handleEnrollAnother = () => {
    reset()
  }

  const handleViewEnrollment = () => {
    if (state.data.enrollmentId) {
      router.push(`/club-enrollments/${state.data.enrollmentId}`)
    }
  }

  const handleReturnToClubs = () => {
    router.push("/clubs")
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Enrollment Successful!</h2>
        <p className="text-lg text-gray-600">
          Student has been successfully enrolled in the club
        </p>
      </div>

      {/* Enrollment Details Card */}
      <div className="p-8 bg-white border-2 border-gray-200 rounded-2xl shadow-lg space-y-6">
        {/* Enrollment Number */}
        {state.data.enrollmentNumber && (
          <div className="text-center pb-6 border-b-2 border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Enrollment Number</div>
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
            <div className="font-bold text-lg text-gray-900">{state.data.studentName}</div>
            {state.data.studentGrade && (
              <Badge variant="outline" className="mt-1">
                {state.data.studentGrade}
              </Badge>
            )}
          </div>
        </div>

        {/* Club Info */}
        <div>
          <div className="text-sm text-gray-500 mb-2">Enrolled in</div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="font-bold text-lg text-gray-900 mb-1">
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
            <div className="text-sm text-gray-500 mb-2">Payment Recorded</div>
            <div className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-xl">
              <span className="text-gray-700">Amount Paid</span>
              <span className="font-bold text-green-700 text-lg">
                {formatCurrency(state.data.paymentAmount)}
              </span>
            </div>
            {state.data.receiptNumber && (
              <div className="mt-2 text-sm text-gray-600">
                Receipt: <span className="font-mono font-semibold">{state.data.receiptNumber}</span>
              </div>
            )}
          </div>
        )}

        {/* Status Badge */}
        {state.data.status && (
          <div className="pt-6 border-t-2 border-gray-100">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleReturnToClubs}
          variant="outline"
          className="flex-1 h-12 gap-2"
        >
          <ArrowLeft className={sizing.icon.sm} />
          Return to Clubs
        </Button>

        {state.data.enrollmentId && (
          <Button
            onClick={handleViewEnrollment}
            variant="outline"
            className="flex-1 h-12 gap-2"
          >
            <Eye className={sizing.icon.sm} />
            View Enrollment
          </Button>
        )}

        <Button
          onClick={handleEnrollAnother}
          className="flex-1 h-12 gap-2 bg-amber-600 hover:bg-amber-700 text-white"
        >
          <UserPlus className={sizing.icon.sm} />
          Enroll Another Student
        </Button>
      </div>
    </div>
  )
}
