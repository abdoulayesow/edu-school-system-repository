"use client"

import { useState, useEffect } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

interface DailyVerificationWarningProps {
  /** Called when user clicks "Verify Now" */
  onVerifyNow: () => void
  /** Called when user dismisses the warning */
  onDismiss?: () => void
  /** Whether to check on mount */
  checkOnMount?: boolean
}

const SESSION_KEY = "dailyVerificationDismissed"

export function DailyVerificationWarning({
  onVerifyNow,
  onDismiss,
  checkOnMount = true,
}: DailyVerificationWarningProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [verificationStatus, setVerificationStatus] = useState<{
    needsVerification: boolean
    todayVerification?: {
      id: string
      verifiedAt: string
      verifier?: { name: string }
    } | null
  } | null>(null)

  useEffect(() => {
    if (!checkOnMount) {
      setIsLoading(false)
      return
    }

    // Check if already dismissed in this session
    const dismissed = sessionStorage.getItem(SESSION_KEY)
    if (dismissed === new Date().toISOString().split("T")[0]) {
      setIsLoading(false)
      return
    }

    checkVerificationStatus()
  }, [checkOnMount])

  const checkVerificationStatus = async () => {
    try {
      const response = await fetch("/api/treasury/verifications?checkToday=true&limit=1")
      if (response.ok) {
        const data = await response.json()
        if (data.dailyStatus) {
          setVerificationStatus(data.dailyStatus)
          if (data.dailyStatus.needsVerification) {
            setOpen(true)
          }
        }
      }
    } catch (error) {
      console.error("Failed to check verification status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    // Remember dismissal for this session (same day only)
    sessionStorage.setItem(SESSION_KEY, new Date().toISOString().split("T")[0])
    setOpen(false)
    onDismiss?.()
  }

  const handleVerifyNow = () => {
    setOpen(false)
    onVerifyNow()
  }

  if (isLoading || !verificationStatus?.needsVerification) {
    return null
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {t.treasury.dailyVerificationNeeded}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>{t.treasury.dailyVerificationWarning}</p>
            <p className="text-muted-foreground">
              {t.treasury.verificationRecommendation}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={handleDismiss}>
            {t.treasury.continueAnyway}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleVerifyNow} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {t.treasury.verifyNow}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * Hook to check if daily verification is needed
 */
export function useDailyVerificationStatus() {
  const [status, setStatus] = useState<{
    isLoading: boolean
    needsVerification: boolean
    todayVerification?: {
      id: string
      verifiedAt: string
      verifier?: { name: string }
    } | null
  }>({
    isLoading: true,
    needsVerification: false,
  })

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/treasury/verifications?checkToday=true&limit=1")
      if (response.ok) {
        const data = await response.json()
        if (data.dailyStatus) {
          setStatus({
            isLoading: false,
            needsVerification: data.dailyStatus.needsVerification,
            todayVerification: data.dailyStatus.todayVerification,
          })
        } else {
          setStatus({ isLoading: false, needsVerification: false })
        }
      } else {
        setStatus({ isLoading: false, needsVerification: false })
      }
    } catch (error) {
      console.error("Failed to check verification status:", error)
      setStatus({ isLoading: false, needsVerification: false })
    }
  }

  return { ...status, refresh: checkStatus }
}
