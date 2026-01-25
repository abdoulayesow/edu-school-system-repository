import { ClubWizardData } from "./types"

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateStep1(data: ClubWizardData): ValidationResult {
  const errors: Record<string, string> = {}

  // Name validation
  if (!data.name || data.name.trim().length < 3) {
    errors.name = "clubWizard.nameMinLength"
  }

  // Category validation
  if (!data.categoryId) {
    errors.categoryId = "clubWizard.categoryRequired"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateStep2(data: ClubWizardData): ValidationResult {
  const errors: Record<string, string> = {}

  // Leader validation (optional but if one is set, both must be)
  if (data.leaderType && !data.leaderId) {
    errors.leaderId = "clubWizard.leaderRequired"
  }
  if (data.leaderId && !data.leaderType) {
    errors.leaderType = "clubWizard.leaderTypeRequired"
  }

  // Monthly fee validation (required)
  if (data.monthlyFee < 0) {
    errors.monthlyFee = "clubWizard.monthlyFeeMin"
  }

  // Capacity validation
  if (data.capacity < 1) {
    errors.capacity = "clubWizard.capacityMin"
  }

  // Date validation (only if dates are provided and not following school year)
  if (!data.followSchoolYear && data.startDate && data.endDate) {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    if (end <= start) {
      errors.endDate = "clubWizard.endDateAfterStart"
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateStep3(data: ClubWizardData): ValidationResult {
  // Step 3 is review only, no validation needed
  return {
    isValid: true,
    errors: {},
  }
}

export function canProceedToStep(
  currentStep: number,
  data: ClubWizardData
): boolean {
  switch (currentStep) {
    case 1:
      return validateStep1(data).isValid
    case 2:
      return validateStep2(data).isValid
    case 3:
      return validateStep3(data).isValid
    default:
      return false
  }
}
