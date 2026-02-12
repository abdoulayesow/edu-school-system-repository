"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import type { Trimester, Grade, GradeSubject } from "@/lib/types/grading"

interface UseGradingFiltersOptions {
  /** Fetch trimesters and auto-select the active one */
  fetchTrimesters?: boolean
  /** Fetch grades from API */
  fetchGrades?: boolean
  /** Fetch subjects when grade changes */
  fetchSubjects?: boolean
  /** Pre-fetched grades (when parent already has them) */
  grades?: Grade[]
}

interface UseGradingFiltersReturn {
  trimesters: Trimester[]
  selectedTrimesterId: string
  setSelectedTrimesterId: (id: string) => void
  grades: Grade[]
  selectedGradeId: string
  setSelectedGradeId: (id: string) => void
  subjects: GradeSubject[]
  selectedSubjectId: string
  setSelectedSubjectId: (id: string) => void
  isLoading: boolean
  isLoadingSubjects: boolean
  error: string | null
}

export function useGradingFilters(options: UseGradingFiltersOptions = {}): UseGradingFiltersReturn {
  const { fetchTrimesters = false, fetchGrades = false, fetchSubjects = false, grades: externalGrades } = options
  const { t } = useI18n()
  const { toast } = useToast()

  const [trimesters, setTrimesters] = useState<Trimester[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [subjects, setSubjects] = useState<GradeSubject[]>([])

  const [selectedTrimesterId, setSelectedTrimesterId] = useState<string>("")
  const [selectedGradeId, setSelectedGradeId] = useState<string>("")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")

  const [isLoading, setIsLoading] = useState(fetchTrimesters || fetchGrades)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync external grades
  useEffect(() => {
    if (externalGrades) {
      setGrades(externalGrades)
    }
  }, [externalGrades])

  // Fetch trimesters + grades on mount
  useEffect(() => {
    if (!fetchTrimesters && !fetchGrades) return

    async function fetchInitialData() {
      try {
        setIsLoading(true)
        const promises: Promise<Response>[] = []

        if (fetchTrimesters) promises.push(fetch("/api/admin/trimesters"))
        if (fetchGrades) promises.push(fetch("/api/grades"))

        const responses = await Promise.all(promises)
        let responseIndex = 0

        if (fetchTrimesters) {
          const trimRes = responses[responseIndex++]
          if (trimRes.ok) {
            const trimData = await trimRes.json()
            setTrimesters(trimData)
            const active = trimData.find((t: Trimester) => t.isActive)
            if (active) {
              setSelectedTrimesterId(active.id)
            }
          }
        }

        if (fetchGrades) {
          const gradeRes = responses[responseIndex++]
          if (gradeRes.ok) {
            const gradeData = await gradeRes.json()
            setGrades(gradeData.grades || gradeData)
          }
        }
      } catch (err) {
        console.error("Error fetching initial data:", err)
        setError(t.grading.failedToLoadData)
        toast({ title: t.common.error, description: t.common.errorFetchingData, variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch subjects when grade changes (if requested)
  useEffect(() => {
    if (!fetchSubjects) return

    const gradeId = selectedGradeId
    if (!gradeId) {
      setSubjects([])
      setSelectedSubjectId("")
      return
    }

    async function loadSubjects() {
      setIsLoadingSubjects(true)
      try {
        const res = await fetch(`/api/grades/${gradeId}/subjects`)
        if (res.ok) {
          setSubjects(await res.json())
        }
      } catch (err) {
        console.error("Error fetching subjects:", err)
        toast({ title: t.common.error, description: t.common.errorFetchingData, variant: "destructive" })
      } finally {
        setIsLoadingSubjects(false)
      }
    }

    setSelectedSubjectId("")
    loadSubjects()
  }, [selectedGradeId, fetchSubjects]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    trimesters,
    selectedTrimesterId,
    setSelectedTrimesterId,
    grades,
    selectedGradeId,
    setSelectedGradeId,
    subjects,
    selectedSubjectId,
    setSelectedSubjectId,
    isLoading,
    isLoadingSubjects,
    error,
  }
}
