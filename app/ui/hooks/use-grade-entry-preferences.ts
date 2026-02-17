"use client"

import { useCallback, useEffect, useState } from "react"

// ============================================================================
// Types
// ============================================================================

export interface GradeEntryPreferences {
  gradeId: string
  subjectId: string
  evaluationType: "interrogation" | "devoir_surveille" | "composition"
  maxScore: number
  schoolYearId: string // Used to invalidate stale preferences
  lastUpdated: number
}

export interface GradeEntryDraft {
  gradeId: string
  subjectId: string
  trimesterId: string
  evaluationType: "interrogation" | "devoir_surveille" | "composition"
  evaluationDate: string
  maxScore: number
  entries: Record<string, { score: string; notes: string }>
  savedAt: number
}

const PREFERENCES_KEY = "gspn-grade-entry-preferences"
const DRAFT_KEY = "gspn-grade-entry-draft"
const DRAFT_MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours

// ============================================================================
// Hook: useGradeEntryPreferences
// ============================================================================

export function useGradeEntryPreferences(currentSchoolYearId: string | undefined) {
  const [preferences, setPreferences] = useState<GradeEntryPreferences | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const stored = localStorage.getItem(PREFERENCES_KEY)
      if (stored) {
        const parsed: GradeEntryPreferences = JSON.parse(stored)

        // Validate school year - clear stale preferences
        if (currentSchoolYearId && parsed.schoolYearId !== currentSchoolYearId) {
          localStorage.removeItem(PREFERENCES_KEY)
          setPreferences(null)
        } else {
          setPreferences(parsed)
        }
      }
    } catch (err) {
      console.error("Error loading grade entry preferences:", err)
      localStorage.removeItem(PREFERENCES_KEY)
    } finally {
      setIsLoaded(true)
    }
  }, [currentSchoolYearId])

  // Save preferences
  const savePreferences = useCallback(
    (updates: Partial<Omit<GradeEntryPreferences, "lastUpdated" | "schoolYearId">>) => {
      if (!currentSchoolYearId) return

      const newPrefs: GradeEntryPreferences = {
        gradeId: updates.gradeId ?? preferences?.gradeId ?? "",
        subjectId: updates.subjectId ?? preferences?.subjectId ?? "",
        evaluationType: updates.evaluationType ?? preferences?.evaluationType ?? "interrogation",
        maxScore: updates.maxScore ?? preferences?.maxScore ?? 20,
        schoolYearId: currentSchoolYearId,
        lastUpdated: Date.now(),
      }

      setPreferences(newPrefs)
      try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs))
      } catch (err) {
        console.error("Error saving grade entry preferences:", err)
      }
    },
    [currentSchoolYearId, preferences]
  )

  // Clear preferences
  const clearPreferences = useCallback(() => {
    setPreferences(null)
    try {
      localStorage.removeItem(PREFERENCES_KEY)
    } catch (err) {
      console.error("Error clearing grade entry preferences:", err)
    }
  }, [])

  return {
    preferences,
    isLoaded,
    savePreferences,
    clearPreferences,
  }
}

// ============================================================================
// Hook: useGradeEntryDraft
// ============================================================================

export function useGradeEntryDraft(trimesterId: string | undefined) {
  const [draft, setDraft] = useState<GradeEntryDraft | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load draft from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined" || !trimesterId) return

    try {
      const stored = localStorage.getItem(DRAFT_KEY)
      if (stored) {
        const parsed: GradeEntryDraft = JSON.parse(stored)

        // Check if draft is for current trimester and not expired
        const isExpired = Date.now() - parsed.savedAt > DRAFT_MAX_AGE
        const isSameTrimester = parsed.trimesterId === trimesterId

        if (isSameTrimester && !isExpired) {
          setDraft(parsed)
          setLastSaved(new Date(parsed.savedAt))
        } else {
          // Clear stale draft
          localStorage.removeItem(DRAFT_KEY)
        }
      }
    } catch (err) {
      console.error("Error loading grade entry draft:", err)
      localStorage.removeItem(DRAFT_KEY)
    } finally {
      setIsLoaded(true)
    }
  }, [trimesterId])

  // Save draft
  const saveDraft = useCallback(
    (draftData: Omit<GradeEntryDraft, "savedAt">) => {
      const newDraft: GradeEntryDraft = {
        ...draftData,
        savedAt: Date.now(),
      }

      setDraft(newDraft)
      setLastSaved(new Date())

      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(newDraft))
      } catch (err) {
        console.error("Error saving grade entry draft:", err)
      }
    },
    []
  )

  // Clear draft
  const clearDraft = useCallback(() => {
    setDraft(null)
    setLastSaved(null)
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch (err) {
      console.error("Error clearing grade entry draft:", err)
    }
  }, [])

  // Check if there's a matching draft for given context
  const hasMatchingDraft = useCallback(
    (gradeId: string, subjectId: string): boolean => {
      if (!draft) return false
      return draft.gradeId === gradeId && draft.subjectId === subjectId
    },
    [draft]
  )

  return {
    draft,
    isLoaded,
    lastSaved,
    saveDraft,
    clearDraft,
    hasMatchingDraft,
  }
}

// ============================================================================
// Utility: Format relative time for "Draft saved X ago"
// ============================================================================

export function formatRelativeTime(date: Date, locale: "en" | "fr"): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)

  if (diffSec < 10) {
    return locale === "fr" ? "à l'instant" : "just now"
  }
  if (diffSec < 60) {
    return locale === "fr" ? `il y a ${diffSec}s` : `${diffSec}s ago`
  }
  if (diffMin < 60) {
    return locale === "fr" ? `il y a ${diffMin}min` : `${diffMin}min ago`
  }
  return locale === "fr" ? `il y a ${diffHour}h` : `${diffHour}h ago`
}
