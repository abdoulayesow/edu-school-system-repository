"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Calendar, Users, Coins, CheckCircle } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { WizardStepProps, CategoryOption } from "../types"
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
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([])

  // Fetch teachers for leader name
  useEffect(() => {
    async function fetchTeachers() {
      try {
        const res = await fetch("/api/admin/teachers?limit=500")
        const result = await res.json()
        const teacherList = (result.teachers || result).map((t: any) => ({
          id: t.id,
          name: `${t.firstName} ${t.lastName}`,
        }))
        setTeachers(teacherList)
      } catch (error) {
        console.error("Failed to fetch teachers:", error)
      }
    }
    fetchTeachers()
  }, [])

  const selectedCategory = categories.find((c) => c.id === data.categoryId)
  const selectedLeader = teachers.find((t) => t.id === data.leaderId)

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
        {selectedLeader && (
          <ReviewItem
            icon={<Users className="h-5 w-5" />}
            label="Club Leader"
            value={selectedLeader.name}
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
