"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Calendar, Users, Coins, CheckCircle, Shield, GraduationCap, Briefcase } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { WizardStepProps, CategoryOption, LeaderOption } from "../types"
import { useClubCategories } from "@/lib/hooks/use-api"

interface ReviewSectionProps {
  title: string
  onEdit: () => void
  children: React.ReactNode
}

function ReviewSection({ title, onEdit, children }: ReviewSectionProps) {
  const { t } = useI18n()

  return (
    <div className="rounded-xl border border-border p-6 space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="gap-2 text-gspn-gold-600 hover:text-gspn-gold-700 hover:bg-gspn-gold-50 dark:text-gspn-gold-400 dark:hover:bg-gspn-gold-950/30"
        >
          <Edit className="h-4 w-4" />
          {t.clubWizard.editSection}
        </Button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

interface ReviewItemProps {
  icon: React.ReactNode
  label: string
  value: string | number
  badge?: string
}

function ReviewItem({ icon, label, value, badge }: ReviewItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="font-medium flex items-center gap-2">
          {value}
          {badge && (
            <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface StepReviewProps extends WizardStepProps {
  onStepChange: (step: number) => void
}

export function StepReview({ data, updateData, errors, onStepChange }: StepReviewProps) {
  const { t, locale } = useI18n()
  const { data: categories = [] } = useClubCategories("active")
  const [leader, setLeader] = useState<LeaderOption | null>(null)
  const [grades, setGrades] = useState<Array<{ id: string; name: string; nameFr: string; level: string }>>([])

  // Fetch leader based on type
  useEffect(() => {
    if (!data.leaderId || !data.leaderType) {
      setLeader(null)
      return
    }

    async function fetchLeader() {
      try {
        let endpoint = ""
        switch (data.leaderType) {
          case "teacher":
            endpoint = "/api/admin/teachers?limit=500"
            break
          case "staff":
            endpoint = "/api/admin/staff-leaders"
            break
          case "student":
            endpoint = "/api/admin/student-leaders"
            break
          default:
            return
        }

        const res = await fetch(endpoint)
        const result = await res.json()

        // Find the specific leader from results
        let foundLeader: LeaderOption | null = null

        if (data.leaderType === "teacher") {
          const teachers = result.teachers || result
          const teacher = teachers.find((t: any) => t.id === data.leaderId)
          if (teacher) {
            foundLeader = {
              id: teacher.id,
              name: `${teacher.firstName} ${teacher.lastName}`,
              type: "teacher",
              photoUrl: teacher.photoUrl,
            }
          }
        } else if (data.leaderType === "staff") {
          const staff = result.find((s: any) => s.id === data.leaderId)
          if (staff) {
            foundLeader = {
              id: staff.id,
              name: staff.name,
              type: "staff",
              email: staff.email,
              role: staff.staffRole,
              photoUrl: staff.photoUrl,
            }
          }
        } else if (data.leaderType === "student") {
          const student = result.find((s: any) => s.id === data.leaderId)
          if (student) {
            foundLeader = {
              id: student.id,
              name: `${student.person.firstName} ${student.person.lastName}`,
              type: "student",
              grade: student.currentGrade?.name,
              photoUrl: student.person.photoUrl,
            }
          }
        }

        setLeader(foundLeader)
      } catch (error) {
        console.error("Failed to fetch leader:", error)
      }
    }

    fetchLeader()
  }, [data.leaderId, data.leaderType])

  // Fetch grades for eligibility display
  useEffect(() => {
    async function fetchGrades() {
      try {
        const res = await fetch("/api/admin/grades")
        const result = await res.json()
        setGrades(result.grades || result)
      } catch (error) {
        console.error("Failed to fetch grades:", error)
      }
    }
    fetchGrades()
  }, [])

  const selectedCategory = categories.find((c) => c.id === data.categoryId)

  // Get selected grade names
  const selectedGrades = grades.filter((g) => (data.eligibilityGradeIds || []).includes(g.id))

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("fr-GN", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  function formatDate(dateString: string): string {
    if (!dateString) return "Not set"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const statusLabels: Record<string, string> = {
    active: "Active",
    draft: "Draft",
    closed: "Closed",
    completed: "Completed",
    cancelled: "Cancelled",
  }

  // Get leader role label
  function getLeaderRoleLabel(): string {
    switch (data.leaderType) {
      case "teacher":
        return t.clubWizard?.roleTeachers || "Teacher"
      case "staff":
        return t.clubWizard?.roleStaff || "Staff Member"
      case "student":
        return t.clubWizard?.roleStudents || "Student"
      default:
        return ""
    }
  }

  // Get leader role icon
  function getLeaderRoleIcon() {
    switch (data.leaderType) {
      case "teacher":
        return <GraduationCap className="h-5 w-5" />
      case "staff":
        return <Briefcase className="h-5 w-5" />
      case "student":
        return <Users className="h-5 w-5" />
      default:
        return <Users className="h-5 w-5" />
    }
  }

  // Get eligibility rule type label
  function getEligibilityRuleLabel(): string {
    switch (data.eligibilityRuleType) {
      case "all_grades":
        return t.clubWizard?.eligibilityRuleCard?.allGrades?.title || "All Grades"
      case "include_only":
        return t.clubWizard?.eligibilityRuleCard?.includeOnly?.title || "Specific Grades"
      case "exclude_only":
        return t.clubWizard?.eligibilityRuleCard?.excludeOnly?.title || "Exclude Grades"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <ReviewSection
        title={t.clubWizard.basicInformation}
        onEdit={() => onStepChange(1)}
      >
        <ReviewItem
          icon={<CheckCircle className="h-5 w-5" />}
          label="Club Name"
          value={data.name}
        />
        {data.description && (
          <ReviewItem
            icon={<CheckCircle className="h-5 w-5" />}
            label="Description"
            value={data.description}
          />
        )}
        {selectedCategory && (
          <ReviewItem
            icon={<CheckCircle className="h-5 w-5" />}
            label="Category"
            value={locale === "fr" ? selectedCategory.nameFr : selectedCategory.name}
          />
        )}
      </ReviewSection>

      {/* Details & Schedule */}
      <ReviewSection
        title={t.clubWizard.detailsSchedule}
        onEdit={() => onStepChange(2)}
      >
        {leader && (
          <ReviewItem
            icon={getLeaderRoleIcon()}
            label="Club Leader"
            value={leader.name}
            badge={getLeaderRoleLabel()}
          />
        )}
        <ReviewItem
          icon={<Calendar className="h-5 w-5" />}
          label="Start Date"
          value={formatDate(data.startDate)}
          badge={data.followSchoolYear ? t.clubWizard.followingSchoolYear : undefined}
        />
        <ReviewItem
          icon={<Calendar className="h-5 w-5" />}
          label="End Date"
          value={formatDate(data.endDate)}
          badge={data.followSchoolYear ? t.clubWizard.followingSchoolYear : undefined}
        />
        <ReviewItem
          icon={<Users className="h-5 w-5" />}
          label="Maximum Capacity"
          value={`${data.capacity} students`}
        />
        <ReviewItem
          icon={<CheckCircle className="h-5 w-5" />}
          label="Status"
          value={statusLabels[data.status]}
        />
      </ReviewSection>

      {/* Eligibility Rules */}
      <ReviewSection
        title={t.clubWizard?.eligibilitySection || "Eligibility Rules"}
        onEdit={() => onStepChange(3)}
      >
        <ReviewItem
          icon={<Shield className="h-5 w-5" />}
          label={t.clubWizard?.ruleTypeLabel || "Rule Type"}
          value={getEligibilityRuleLabel()}
        />
        {data.eligibilityRuleType === "include_only" && selectedGrades.length > 0 && (
          <div className="flex items-start gap-3 mt-2">
            <div className="mt-0.5 text-muted-foreground">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">
                {t.clubWizard?.allowedGrades || "Allowed Grades"}
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedGrades.map((grade) => (
                  <span
                    key={grade.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                  >
                    {locale === "fr" && grade.nameFr ? grade.nameFr : grade.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        {data.eligibilityRuleType === "exclude_only" && selectedGrades.length > 0 && (
          <div className="flex items-start gap-3 mt-2">
            <div className="mt-0.5 text-muted-foreground">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">
                {t.clubWizard?.excludedGrades || "Excluded Grades"}
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedGrades.map((grade) => (
                  <span
                    key={grade.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  >
                    {locale === "fr" && grade.nameFr ? grade.nameFr : grade.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </ReviewSection>

      {/* Financial Information */}
      <ReviewSection
        title={t.clubWizard.financialInformation}
        onEdit={() => onStepChange(2)}
      >
        <ReviewItem
          icon={<Coins className="h-5 w-5" />}
          label={t.clubWizard.monthlyFee}
          value={formatCurrency(data.monthlyFee)}
          badge="Required"
        />
        {data.fee > 0 && (
          <ReviewItem
            icon={<Coins className="h-5 w-5" />}
            label={t.clubWizard.oneTimeFee}
            value={formatCurrency(data.fee)}
          />
        )}
      </ReviewSection>
    </div>
  )
}
