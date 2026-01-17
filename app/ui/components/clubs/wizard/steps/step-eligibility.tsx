"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, Info } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { WizardStepProps, EligibilityRuleType } from "../types"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Grade {
  id: string
  name: string
  nameFr: string
  level: string
  order: number
}

const levelOrder = ["kindergarten", "primary", "middle", "high"]

export function StepEligibility({ data, updateData, errors }: WizardStepProps) {
  const { t, locale } = useI18n()
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoadingGrades, setIsLoadingGrades] = useState(true)

  useEffect(() => {
    async function fetchGrades() {
      try {
        const res = await fetch("/api/admin/grades")
        const result = await res.json()
        const gradeList = (result.grades || result)
          .sort((a: Grade, b: Grade) => {
            const levelDiff = levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
            if (levelDiff !== 0) return levelDiff
            return a.order - b.order
          })
        setGrades(gradeList)
      } catch (error) {
        console.error("Failed to fetch grades:", error)
      } finally {
        setIsLoadingGrades(false)
      }
    }
    fetchGrades()
  }, [])

  const toggleGrade = (gradeId: string) => {
    const currentIds = data.eligibilityGradeIds || []
    const newIds = currentIds.includes(gradeId)
      ? currentIds.filter(id => id !== gradeId)
      : [...currentIds, gradeId]
    updateData({ eligibilityGradeIds: newIds })
  }

  const gradesByLevel = grades.reduce((acc, grade) => {
    if (!acc[grade.level]) acc[grade.level] = []
    acc[grade.level].push(grade)
    return acc
  }, {} as Record<string, Grade[]>)

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      kindergarten: locale === "fr" ? "Maternelle" : "Kindergarten",
      primary: locale === "fr" ? "Primaire" : "Primary",
      middle: locale === "fr" ? "Collège" : "Middle School",
      high: locale === "fr" ? "Lycée" : "High School",
    }
    return labels[level] || level
  }

  const getHintText = () => {
    switch (data.eligibilityRuleType) {
      case "all_grades":
        return t.clubs?.allGradesHint || "Any student can enroll in this club"
      case "include_only":
        return t.clubs?.includeOnlyHint || "Only students in selected grades can enroll"
      case "exclude_only":
        return t.clubs?.excludeGradesHint || "Students in selected grades cannot enroll"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3 pb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
          <Shield className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">
            {t.clubs?.eligibilityRules || "Eligibility Rules"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.clubs?.eligibilityRulesDescription || "Set which grades can enroll in this club"}
          </p>
        </div>
      </div>

      {/* Rule Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="ruleType" className="text-sm font-semibold">
          {t.clubs?.ruleType || "Rule Type"}
        </Label>
        <Select
          value={data.eligibilityRuleType}
          onValueChange={(value: EligibilityRuleType) => {
            updateData({ eligibilityRuleType: value })
            if (value === "all_grades") {
              updateData({ eligibilityGradeIds: [] })
            }
          }}
        >
          <SelectTrigger id="ruleType" className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_grades">
              {t.clubs?.allGradesRule || "All grades allowed"}
            </SelectItem>
            <SelectItem value="include_only">
              {t.clubs?.includeOnlyGrades || "Only specific grades"}
            </SelectItem>
            <SelectItem value="exclude_only">
              {t.clubs?.excludeGradesRule || "All except specific grades"}
            </SelectItem>
          </SelectContent>
        </Select>

        <Alert className="mt-3">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {getHintText()}
          </AlertDescription>
        </Alert>
      </div>

      {/* Grade Selection */}
      {data.eligibilityRuleType !== "all_grades" && (
        <div className="space-y-4">
          <Label className="text-sm font-semibold">
            {data.eligibilityRuleType === "include_only"
              ? (t.clubs?.selectAllowedGrades || "Select allowed grades")
              : (t.clubs?.selectExcludedGrades || "Select grades to exclude")}
          </Label>

          {isLoadingGrades ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              {t.common?.loading || "Loading..."}
            </div>
          ) : (
            <div className="border rounded-lg p-4 space-y-6 max-h-[400px] overflow-y-auto">
              {levelOrder.map((level) => {
                const levelGrades = gradesByLevel[level]
                if (!levelGrades || levelGrades.length === 0) return null

                return (
                  <div key={level} className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      {getLevelLabel(level)}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {levelGrades.map((grade) => {
                        const isSelected = (data.eligibilityGradeIds || []).includes(grade.id)
                        return (
                          <div
                            key={grade.id}
                            className={cn(
                              "flex items-center space-x-3 rounded-lg border p-3 transition-colors cursor-pointer hover:bg-muted/50",
                              isSelected && "bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700"
                            )}
                            onClick={() => toggleGrade(grade.id)}
                          >
                            <Checkbox
                              id={`grade-${grade.id}`}
                              checked={isSelected}
                              onCheckedChange={() => toggleGrade(grade.id)}
                            />
                            <label
                              htmlFor={`grade-${grade.id}`}
                              className="text-sm font-medium leading-none cursor-pointer flex-1"
                            >
                              {locale === "fr" && grade.nameFr ? grade.nameFr : grade.name}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {data.eligibilityRuleType !== "all_grades" && (data.eligibilityGradeIds || []).length === 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {t.clubs?.selectAtLeastOneGrade || "Please select at least one grade"}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
