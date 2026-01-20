"use client"

import React, { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, Save, Send, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { sizing } from "@/lib/design-tokens"
import type { ClubEnrollmentStep } from "@/lib/types/club-enrollment"

interface WizardNavigationProps {
  currentStep: ClubEnrollmentStep
  canProceed: boolean
  isSubmitting: boolean
  onPrevious?: () => void
  onNext?: () => void
  onSave?: () => Promise<void>
  onSubmit?: () => Promise<void>
  isDirty?: boolean
}

export function WizardNavigation({
  currentStep,
  canProceed,
  isSubmitting,
  onPrevious,
  onNext,
  onSave,
  onSubmit,
  isDirty = false,
}: WizardNavigationProps) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [showSavedMessage, setShowSavedMessage] = useState(false)

  const showBack = currentStep > 1 && currentStep < 4
  const showSave = currentStep >= 2 && currentStep <= 3 && onSave && isDirty
  const showNext = currentStep >= 1 && currentStep < 3
  const showSubmit = currentStep === 3

  // Handle save with status feedback
  const handleSaveClick = async () => {
    if (!onSave) return

    setSaveStatus("saving")
    setShowSavedMessage(false)

    try {
      await onSave()
      setSaveStatus("saved")
      setShowSavedMessage(true)

      // Hide saved message after 3 seconds
      setTimeout(() => {
        setShowSavedMessage(false)
        setSaveStatus("idle")
      }, 3000)
    } catch (error) {
      setSaveStatus("idle")
    }
  }

  // Reset save status when isDirty changes back to true
  useEffect(() => {
    if (isDirty && saveStatus === "saved") {
      setSaveStatus("idle")
      setShowSavedMessage(false)
    }
  }, [isDirty, saveStatus])

  return (
    <div className="flex flex-col gap-4 pt-6 border-t">
      {/* Save Status Indicator - Modern floating toast */}
      {showSavedMessage && (
        <div className="flex justify-center animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg shadow-green-500/30 font-medium">
            <Check className="w-4 h-4" />
            Draft saved successfully
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {/* Back Button */}
        <div>
          {showBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isSubmitting}
              className="gap-2 min-h-[44px]"
              aria-label="Go to previous step"
            >
              <ArrowLeft className={sizing.icon.sm} />
              Previous
            </Button>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Save Draft Button with Status */}
          {showSave && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveClick}
              disabled={isSubmitting || !isDirty || saveStatus === "saving"}
              className={cn(
                "gap-2 min-h-[44px] transition-all duration-200",
                saveStatus === "saving" && "bg-blue-50 border-blue-300",
                saveStatus === "saved" && "bg-green-50 border-green-300"
              )}
              aria-label="Save draft enrollment"
            >
              {saveStatus === "saving" ? (
                <>
                  <Loader2 className={cn(sizing.icon.sm, "animate-spin")} />
                  Saving...
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <Check className={sizing.icon.sm} />
                  Saved
                </>
              ) : (
                <>
                  <Save className={sizing.icon.sm} />
                  Save Draft
                </>
              )}
            </Button>
          )}

        {/* Next Button */}
        {showNext && (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canProceed || isSubmitting}
            className="gap-2 min-h-[44px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 font-semibold transition-all duration-200"
            aria-label="Continue to next step"
          >
            Continue
            <ArrowRight className={sizing.icon.sm} />
          </Button>
        )}

        {/* Submit Button */}
        {showSubmit && (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!canProceed || isSubmitting}
            className="gap-2 min-h-[44px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 font-semibold transition-all duration-200"
            aria-label="Submit enrollment"
          >
            {isSubmitting ? (
              <>
                <Loader2 className={cn(sizing.icon.sm, "animate-spin")} />
                Enrolling...
              </>
            ) : (
              <>
                <Send className={sizing.icon.sm} />
                Submit Enrollment
              </>
            )}
          </Button>
        )}
        </div>
      </div>
    </div>
  )
}
