"use client"

import React from "react"
import { ArrowLeft, ArrowRight, Save, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  const showBack = currentStep > 1 && currentStep < 4
  const showSave = currentStep >= 2 && currentStep <= 3 && onSave && isDirty
  const showNext = currentStep >= 1 && currentStep < 3
  const showSubmit = currentStep === 3

  return (
    <div className="flex items-center justify-between gap-3 pt-6 border-t">
      {/* Back Button */}
      <div>
        {showBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isSubmitting}
            className="gap-2"
          >
            <ArrowLeft className={sizing.icon.sm} />
            Previous
          </Button>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        {/* Save Draft Button */}
        {showSave && (
          <Button
            type="button"
            variant="outline"
            onClick={onSave}
            disabled={isSubmitting || !isDirty}
            className="gap-2"
          >
            <Save className={sizing.icon.sm} />
            Save Draft
          </Button>
        )}

        {/* Next Button */}
        {showNext && (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canProceed || isSubmitting}
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
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
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
  )
}
