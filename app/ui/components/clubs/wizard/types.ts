// Club Wizard Types

export type ClubStatus = "active" | "draft" | "closed" | "completed" | "cancelled"
export type EligibilityRuleType = "all_grades" | "include_only" | "exclude_only"

export interface ClubWizardData {
  name: string
  description: string
  categoryId: string
  leaderId: string
  followSchoolYear: boolean
  startDate: string
  endDate: string
  capacity: number
  status: ClubStatus
  monthlyFee: number
  fee: number
  schoolYearId: string
  eligibilityRuleType: EligibilityRuleType
  eligibilityGradeIds: string[]
}

export interface ClubWizardProps {
  onComplete: (data: ClubWizardData) => void
  onCancel?: () => void
}

export interface WizardStepProps {
  data: ClubWizardData
  updateData: (updates: Partial<ClubWizardData>) => void
  errors: Record<string, string>
}

export interface SchoolYearDates {
  startDate: string
  endDate: string
  id: string
}

export interface CategoryOption {
  id: string
  name: string
  nameFr: string
  description?: string
  status: string
}

export interface LeaderOption {
  id: string
  name: string
  type: "teacher" | "staff" | "student"
}

export const initialWizardData: ClubWizardData = {
  name: "",
  description: "",
  categoryId: "",
  leaderId: "",
  followSchoolYear: false,
  startDate: "",
  endDate: "",
  capacity: 30,
  status: "active",
  monthlyFee: 0,
  fee: 0,
  schoolYearId: "",
  eligibilityRuleType: "all_grades",
  eligibilityGradeIds: [],
}
