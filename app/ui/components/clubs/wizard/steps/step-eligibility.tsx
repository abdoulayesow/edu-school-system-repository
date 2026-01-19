"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, Info, GraduationCap, CheckCircle2, XCircle, Users, BookOpen, Atom, FlaskConical } from "lucide-react"
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

// Level icon mapping
const levelIcons = {
  kindergarten: BookOpen,
  primary: Users,
  middle: Atom,
  high: FlaskConical,
}

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

  // Rule type configuration with GSPN styling
  const ruleTypeOptions = [
    {
      value: "all_grades" as EligibilityRuleType,
      icon: GraduationCap,
      title: t.clubWizard?.eligibilityRuleCard?.allGrades?.title || "All Grades",
      description: t.clubWizard?.eligibilityRuleCard?.allGrades?.description || "Any student can join",
      color: "emerald",
    },
    {
      value: "include_only" as EligibilityRuleType,
      icon: CheckCircle2,
      title: t.clubWizard?.eligibilityRuleCard?.includeOnly?.title || "Specific Grades",
      description: t.clubWizard?.eligibilityRuleCard?.includeOnly?.description || "Only selected grades",
      color: "blue",
    },
    {
      value: "exclude_only" as EligibilityRuleType,
      icon: XCircle,
      title: t.clubWizard?.eligibilityRuleCard?.excludeOnly?.title || "Exclude Grades",
      description: t.clubWizard?.eligibilityRuleCard?.excludeOnly?.description || "All except selected",
      color: "red",
    },
  ]

  const selectedCount = (data.eligibilityGradeIds || []).length

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {t.clubWizard?.eligibilityTitle || "Grade Eligibility"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t.clubWizard?.eligibilityDescription || "Define which students can join this club"}
        </p>
      </div>

      {/* Rule Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ruleTypeOptions.map((ruleType, index) => {
          const isSelected = data.eligibilityRuleType === ruleType.value
          const Icon = ruleType.icon

          return (
            <button
              key={ruleType.value}
              type="button"
              onClick={() => {
                updateData({ eligibilityRuleType: ruleType.value })
                if (ruleType.value === "all_grades") {
                  updateData({ eligibilityGradeIds: [] })
                }
              }}
              className={cn(
                "group relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-0.5",
                isSelected
                  ? "border-[#8B2332] bg-gradient-to-br from-rose-50/80 to-red-50/80 dark:from-rose-950/30 dark:to-red-950/30 shadow-md scale-[1.02]"
                  : "border-border bg-card hover:border-border/80 hover:bg-accent/50",
                "animate-fade-in-up",
              )}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                  <div className="absolute top-2 right-2 w-3 h-3 bg-[#8B2332] rounded-full shadow-lg animate-pulse" />
                </div>
              )}

              {/* Icon container */}
              <div
                className={cn(
                  "inline-flex items-center justify-center rounded-lg p-3 mb-4 transition-all duration-300",
                  isSelected
                    ? "bg-[#8B2332] text-white shadow-md"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}
              >
                <Icon className="h-6 w-6" />
              </div>

              {/* Rule title */}
              <div className="space-y-1.5">
                <div
                  className={cn(
                    "font-semibold text-base transition-colors",
                    isSelected
                      ? "text-rose-900 dark:text-rose-100"
                      : "text-foreground"
                  )}
                >
                  {ruleType.title}
                </div>
                <p
                  className={cn(
                    "text-sm leading-relaxed transition-colors",
                    isSelected
                      ? "text-rose-700 dark:text-rose-300"
                      : "text-muted-foreground"
                  )}
                >
                  {ruleType.description}
                </p>
              </div>

              {/* Subtle accent border on hover */}
              <div
                className={cn(
                  "absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none",
                  isSelected
                    ? "opacity-100 ring-2 ring-[#8B2332]/30 ring-offset-2 ring-offset-background"
                    : "opacity-0 group-hover:opacity-50 ring-1 ring-primary/20"
                )}
              />
            </button>
          )
        })}
      </div>

      {/* Grade Selection - Appears when include_only or exclude_only is selected */}
      <div
        className={cn(
          "transition-all duration-300 overflow-hidden",
          data.eligibilityRuleType !== "all_grades"
            ? "opacity-100 max-h-[2000px] animate-fade-in-up"
            : "opacity-0 max-h-0 pointer-events-none"
        )}
      >
        {data.eligibilityRuleType !== "all_grades" && (
          <div className="space-y-6 pt-2">
            {/* Header with badge */}
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                {data.eligibilityRuleType === "include_only"
                  ? (t.clubs?.selectAllowedGrades || "Select allowed grades")
                  : (t.clubs?.selectExcludedGrades || "Select grades to exclude")}
              </Label>
              {selectedCount > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B2332] text-white text-sm font-medium shadow-sm animate-scale-in">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>
                    {t.clubWizard?.selectedGradesCount?.replace("{count}", selectedCount.toString()) || `${selectedCount} grade(s) selected`}
                  </span>
                </div>
              )}
            </div>

            {isLoadingGrades ? (
              <div className="text-sm text-muted-foreground text-center py-12">
                {t.common?.loading || "Loading..."}
              </div>
            ) : (
              <div className="space-y-6">
                {levelOrder.map((level, levelIndex) => {
                  const levelGrades = gradesByLevel[level]
                  if (!levelGrades || levelGrades.length === 0) return null

                  const LevelIcon = levelIcons[level as keyof typeof levelIcons]

                  return (
                    <div
                      key={level}
                      className="space-y-4 animate-fade-in-up"
                      style={{
                        animationDelay: `${levelIndex * 80}ms`,
                      }}
                    >
                      {/* Level header with icon */}
                      <div className="flex items-center gap-2.5">
                        <div className="inline-flex items-center justify-center rounded-lg p-2 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800">
                          <LevelIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                          {getLevelLabel(level)}
                        </h4>
                      </div>

                      {/* Grade cards grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {levelGrades.map((grade) => {
                          const isSelected = (data.eligibilityGradeIds || []).includes(grade.id)
                          return (
                            <button
                              key={grade.id}
                              type="button"
                              onClick={() => toggleGrade(grade.id)}
                              className={cn(
                                "group relative flex items-center gap-3 rounded-lg border-2 p-3.5 transition-all duration-200",
                                "hover:shadow-md hover:-translate-y-0.5",
                                isSelected
                                  ? "border-[#D4AF37] bg-gradient-to-br from-amber-50/90 to-yellow-50/90 dark:from-amber-950/40 dark:to-yellow-950/40 shadow-sm"
                                  : "border-border bg-card hover:border-border/80 hover:bg-accent/30"
                              )}
                            >
                              {/* Checkbox */}
                              <div
                                className={cn(
                                  "flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-all duration-200",
                                  isSelected
                                    ? "bg-[#D4AF37] border-[#D4AF37]"
                                    : "bg-background border-muted-foreground/30 group-hover:border-primary/50"
                                )}
                              >
                                {isSelected && (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                                )}
                              </div>

                              {/* Grade label */}
                              <span
                                className={cn(
                                  "text-sm font-medium transition-colors flex-1 text-left",
                                  isSelected
                                    ? "text-amber-900 dark:text-amber-100"
                                    : "text-foreground"
                                )}
                              >
                                {locale === "fr" && grade.nameFr ? grade.nameFr : grade.name}
                              </span>

                              {/* Subtle glow when selected */}
                              {isSelected && (
                                <div className="absolute inset-0 rounded-lg ring-2 ring-[#D4AF37]/30 ring-offset-1 ring-offset-background pointer-events-none" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Warning when no grades selected */}
            {selectedCount === 0 && (
              <Alert className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 animate-fade-in">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm text-amber-900 dark:text-amber-100">
                  {t.clubs?.wizard?.selectAtLeastOneGrade || "Please select at least one grade"}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
