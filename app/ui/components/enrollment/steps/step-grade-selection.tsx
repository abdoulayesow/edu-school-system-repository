"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useEnrollmentWizard } from "../wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { Users, Check, AlertTriangle, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/currency"
import type { SchoolLevel } from "@/lib/enrollment/types"
import { sizing } from "@/lib/design-tokens"

interface Grade {
  id: string
  name: string
  level: SchoolLevel
  order: number
  tuitionFee: number
  capacity: number
  enrollmentCount: number
}

interface SchoolYear {
  id: string
  name: string
  startDate: string
  endDate: string
  enrollmentStart: string
  enrollmentEnd: string
  isActive: boolean
  grades: Grade[]
}

// Soft limit for students per grade (warning threshold)
const GRADE_SOFT_LIMIT = 70

export function StepGradeSelection() {
  const { t } = useI18n()
  const { state, updateData } = useEnrollmentWizard()
  const { data } = state

  const [isLoading, setIsLoading] = useState(true)
  const [schoolYear, setSchoolYear] = useState<SchoolYear | null>(null)
  const [activeLevel, setActiveLevel] = useState<SchoolLevel>("kindergarten")
  const [error, setError] = useState<string | null>(null)

  // Fetch active school year with grades
  useEffect(() => {
    async function fetchSchoolYear() {
      try {
        const response = await fetch("/api/school-years/active")
        if (!response.ok) {
          throw new Error("Failed to fetch school year")
        }
        const data = await response.json()
        setSchoolYear(data)

        // Set school year ID if not already set
        if (!state.data.schoolYearId) {
          updateData({ schoolYearId: data.id })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchoolYear()
  }, [state.data.schoolYearId, updateData])

  // Filter grades by level
  const getGradesByLevel = (level: SchoolLevel): Grade[] => {
    if (!schoolYear) return []
    return schoolYear.grades.filter((g) => g.level === level)
  }

  // Check if a kindergarten grade is disabled (only GS is allowed, PS and MS are disabled)
  // PS = order -2, MS = order -1, GS = order 0
  const isGradeDisabled = (grade: Grade): boolean => {
    if (grade.level === "kindergarten" && grade.order < 0) {
      return true // Disable PS and MS
    }
    return false
  }

  // Check if grade is at or above soft limit
  const isAtSoftLimit = (grade: Grade): boolean => {
    return grade.enrollmentCount >= GRADE_SOFT_LIMIT
  }

  // Handle grade selection
  const handleSelectGrade = (grade: Grade) => {
    // Don't allow selection of disabled grades
    if (isGradeDisabled(grade)) {
      return
    }

    updateData({
      gradeId: grade.id,
      gradeName: grade.name,
      level: grade.level,
      tuitionFee: grade.tuitionFee,
      originalTuitionFee: grade.tuitionFee,
    })
  }


  // Get capacity percentage and color
  const getCapacityInfo = (enrolled: number, capacity: number) => {
    const percentage = Math.round((enrolled / capacity) * 100)
    let color: "green" | "orange" | "red"
    let bgColor: string
    let textColor: string

    if (percentage <= 55) {
      color = "green"
      bgColor = "bg-green-100"
      textColor = "text-green-700"
    } else if (percentage <= 65) {
      color = "orange"
      bgColor = "bg-orange-100"
      textColor = "text-orange-700"
    } else {
      color = "red"
      bgColor = "bg-red-100"
      textColor = "text-red-700"
    }

    return { percentage, color, bgColor, textColor }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{t.enrollmentWizard.selectGrade}</h3>
        <p className="text-sm text-muted-foreground">
          {t.enrollmentWizard.selectGradeDescription}
        </p>
      </div>

      {/* School Year Info */}
      {schoolYear && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            <strong>{t.enrollmentWizard.schoolYear}:</strong> {schoolYear.name}
          </span>
          <span>
            <strong>{t.enrollmentWizard.todayDate}:</strong>{" "}
            {new Date().toLocaleDateString("fr-GN")}
          </span>
        </div>
      )}

      {/* Level Tabs */}
      <Tabs
        value={activeLevel}
        onValueChange={(v) => setActiveLevel(v as SchoolLevel)}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="kindergarten">
            {t.enrollmentWizard.kindergarten}
          </TabsTrigger>
          <TabsTrigger value="elementary">
            {t.enrollmentWizard.elementary}
          </TabsTrigger>
          <TabsTrigger value="college">{t.enrollmentWizard.college}</TabsTrigger>
          <TabsTrigger value="high_school">
            {t.enrollmentWizard.highSchool}
          </TabsTrigger>
        </TabsList>

        {(["kindergarten", "elementary", "college", "high_school"] as SchoolLevel[]).map(
          (level) => (
            <TabsContent key={level} value={level}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getGradesByLevel(level).map((grade) => {
                  const isSelected = data.gradeId === grade.id
                  const capacityInfo = getCapacityInfo(grade.enrollmentCount, grade.capacity)
                  const disabled = isGradeDisabled(grade)
                  const atLimit = isAtSoftLimit(grade)

                  return (
                    <Card
                      key={grade.id}
                      className={cn(
                        "transition-all",
                        disabled
                          ? "opacity-50 cursor-not-allowed bg-muted/50"
                          : "cursor-pointer hover:border-primary",
                        isSelected && !disabled && "border-primary ring-2 ring-primary/20"
                      )}
                      onClick={() => handleSelectGrade(grade)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className={cn("text-base", disabled && "text-muted-foreground")}>
                            {grade.name}
                          </CardTitle>
                          {disabled ? (
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                              <Lock className={sizing.icon.sm + " text-muted-foreground"} />
                            </div>
                          ) : isSelected ? (
                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className={sizing.icon.sm + " text-primary-foreground"} />
                            </div>
                          ) : null}
                        </div>
                        <CardDescription className="flex items-center gap-1">
                          <Users className={sizing.icon.xs} />
                          {t.enrollmentWizard.studentsEnrolled.replace(
                            "{count}",
                            String(grade.enrollmentCount)
                          )}
                        </CardDescription>
                        {/* Disabled message for PS/MS */}
                        {disabled && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {t.enrollmentWizard.onlyGrandeSection || "Only Grande Section available for new enrollments"}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Soft limit warning */}
                        {atLimit && !disabled && (
                          <div className="flex items-center gap-2 p-2 rounded-md bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                            <AlertTriangle className={sizing.icon.sm + " text-orange-600 dark:text-orange-400"} />
                            <span className="text-xs text-orange-700 dark:text-orange-300">
                              {t.enrollmentWizard.atCapacityWarning || "At capacity limit (70 students)"}
                            </span>
                          </div>
                        )}

                        {/* Capacity indicator */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {t.enrollmentWizard.capacity || "Capacity"}
                            </span>
                            <span className={cn("font-medium", capacityInfo.textColor)}>
                              {capacityInfo.percentage}% ({grade.enrollmentCount}/{grade.capacity})
                            </span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                capacityInfo.color === "green" && "bg-green-500",
                                capacityInfo.color === "orange" && "bg-orange-500",
                                capacityInfo.color === "red" && "bg-red-500"
                              )}
                              style={{ width: `${Math.min(capacityInfo.percentage, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {t.enrollmentWizard.yearlyTuition}
                          </span>
                          <Badge variant="secondary" className="font-mono">
                            {formatCurrency(grade.tuitionFee)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          )
        )}
      </Tabs>

      {/* Selected Grade Summary */}
      {data.gradeId && (
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t.enrollmentWizard.selectGrade}
              </p>
              <p className="font-semibold">{data.gradeName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {t.enrollmentWizard.yearlyTuition}
              </p>
              <p className="font-semibold text-primary">
                {formatCurrency(data.tuitionFee)}
                <span className="text-sm font-normal text-muted-foreground">
                  {t.enrollmentWizard.perYear}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
