/**
 * Enrollment System Calculations
 *
 * Payment schedule calculations and other business logic.
 */

import { PAYMENT_SCHEDULE_CONFIG, type PaymentScheduleNumber, type PaymentSchedule, type Payment } from "./types"

// ============================================================================
// Payment Schedule Calculations
// ============================================================================

export interface CalculatedSchedule {
  scheduleNumber: PaymentScheduleNumber
  amount: number
  months: string[]
  monthsFr: string[]
  description: string
  descriptionFr: string
  dueDate: Date
}

/**
 * Calculate payment schedules for a given total amount
 *
 * Divides the total into 3 equal schedules:
 * - Schedule 1: September + October + May (1/3)
 * - Schedule 2: November + December + January (1/3)
 * - Schedule 3: February + March + April (remaining)
 *
 * @param totalAmount - Total tuition fee in GNF
 * @param schoolYearStartDate - Start date of the school year (e.g., September 1, 2025)
 * @returns Array of 3 calculated schedules
 */
export function calculatePaymentSchedules(
  totalAmount: number,
  schoolYearStartDate: Date
): CalculatedSchedule[] {
  // Divide into 3 equal parts (Schedule 3 gets any remainder)
  const perSchedule = Math.floor(totalAmount / 3)
  const remainder = totalAmount - perSchedule * 2

  const year = schoolYearStartDate.getFullYear()
  const nextYear = year + 1

  return [
    {
      scheduleNumber: 1 as PaymentScheduleNumber,
      amount: perSchedule,
      months: [...PAYMENT_SCHEDULE_CONFIG[1].months],
      monthsFr: [...PAYMENT_SCHEDULE_CONFIG[1].monthsFr],
      description: PAYMENT_SCHEDULE_CONFIG[1].description,
      descriptionFr: PAYMENT_SCHEDULE_CONFIG[1].descriptionFr,
      dueDate: new Date(year, 8, 1), // September 1
    },
    {
      scheduleNumber: 2 as PaymentScheduleNumber,
      amount: perSchedule,
      months: [...PAYMENT_SCHEDULE_CONFIG[2].months],
      monthsFr: [...PAYMENT_SCHEDULE_CONFIG[2].monthsFr],
      description: PAYMENT_SCHEDULE_CONFIG[2].description,
      descriptionFr: PAYMENT_SCHEDULE_CONFIG[2].descriptionFr,
      dueDate: new Date(year, 10, 1), // November 1
    },
    {
      scheduleNumber: 3 as PaymentScheduleNumber,
      amount: remainder,
      months: [...PAYMENT_SCHEDULE_CONFIG[3].months],
      monthsFr: [...PAYMENT_SCHEDULE_CONFIG[3].monthsFr],
      description: PAYMENT_SCHEDULE_CONFIG[3].description,
      descriptionFr: PAYMENT_SCHEDULE_CONFIG[3].descriptionFr,
      dueDate: new Date(nextYear, 1, 1), // February 1
    },
  ]
}

/**
 * Calculate what schedules and months a payment amount covers
 *
 * @param paymentAmount - Amount being paid
 * @param schedules - Array of payment schedules
 * @param existingPayments - Array of existing payments
 * @returns Object with coverage information
 */
export function calculatePaymentCoverage(
  paymentAmount: number,
  schedules: PaymentSchedule[],
  existingPayments: Payment[]
): {
  schedulesCovered: Array<{
    scheduleNumber: number
    percentCovered: number
    monthsCovered: string[]
  }>
  totalCovered: number
  remainingAmount: number
} {
  // Calculate total already paid
  const totalPaid = existingPayments
    .filter((p) => p.status === "confirmed" || p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0)

  // Sort schedules by number
  const sortedSchedules = [...schedules].sort((a, b) => a.scheduleNumber - b.scheduleNumber)

  let remainingPayment = paymentAmount
  let runningTotal = totalPaid
  const schedulesCovered: Array<{
    scheduleNumber: number
    percentCovered: number
    monthsCovered: string[]
  }> = []

  for (const schedule of sortedSchedules) {
    if (remainingPayment <= 0) break

    // Calculate how much of this schedule is already covered
    const schedulePaidBefore = Math.min(runningTotal, schedule.amount)
    const scheduleRemaining = schedule.amount - schedulePaidBefore
    runningTotal = Math.max(0, runningTotal - schedule.amount)

    if (scheduleRemaining > 0) {
      // This schedule still needs payment
      const amountForThisSchedule = Math.min(remainingPayment, scheduleRemaining)
      const totalPaidForSchedule = schedulePaidBefore + amountForThisSchedule
      const percentCovered = Math.round((totalPaidForSchedule / schedule.amount) * 100)

      // Calculate which months are covered based on percentage
      const monthsCovered: string[] = []
      if (percentCovered >= 33) monthsCovered.push(schedule.months[0])
      if (percentCovered >= 66) monthsCovered.push(schedule.months[1])
      if (percentCovered >= 100) monthsCovered.push(schedule.months[2])

      schedulesCovered.push({
        scheduleNumber: schedule.scheduleNumber,
        percentCovered,
        monthsCovered,
      })

      remainingPayment -= amountForThisSchedule
    }
  }

  return {
    schedulesCovered,
    totalCovered: paymentAmount - remainingPayment,
    remainingAmount: remainingPayment,
  }
}

/**
 * Calculate enrollment financial summary
 */
export function calculateEnrollmentSummary(
  totalOwed: number,
  payments: Payment[]
): {
  totalPaid: number
  totalRemaining: number
  percentPaid: number
  isFullyPaid: boolean
} {
  const confirmedPayments = payments.filter(
    (p) => p.status === "confirmed" || p.status === "pending"
  )
  const totalPaid = confirmedPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalRemaining = Math.max(0, totalOwed - totalPaid)
  const percentPaid = totalOwed > 0 ? Math.round((totalPaid / totalOwed) * 100) : 0

  return {
    totalPaid,
    totalRemaining,
    percentPaid,
    isFullyPaid: totalRemaining === 0,
  }
}

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generate a student number (STU-00001)
 *
 * @param currentCount - Current count of students in the system
 * @returns Formatted student number
 */
export function generateStudentNumber(currentCount: number): string {
  const nextNumber = currentCount + 1
  return `STU-${String(nextNumber).padStart(5, "0")}`
}

/**
 * Generate an enrollment number (ENR-2025-00001)
 *
 * @param schoolYearName - School year name (e.g., "2025 - 2026")
 * @param currentCount - Current count of enrollments for this school year
 * @returns Formatted enrollment number
 */
export function generateEnrollmentNumber(schoolYearName: string, currentCount: number): string {
  const yearPrefix = schoolYearName.split(" ")[0] // Extract "2025" from "2025 - 2026"
  const nextNumber = currentCount + 1
  return `ENR-${yearPrefix}-${String(nextNumber).padStart(5, "0")}`
}

/**
 * Generate a receipt number
 *
 * @param method - Payment method (cash or orange_money)
 * @param year - Current year
 * @param sequence - Sequence number for this year
 * @returns Formatted receipt number
 */
export function generateReceiptNumber(
  method: "cash" | "orange_money",
  year: number,
  sequence: number
): string {
  const prefix = method === "cash" ? "CASH" : "OM"
  return `${prefix}-${year}-${String(sequence).padStart(5, "0")}`
}

// ============================================================================
// Date Calculations
// ============================================================================

/**
 * Calculate draft expiration date (10 days from now)
 */
export function calculateDraftExpiration(): Date {
  const date = new Date()
  date.setDate(date.getDate() + 10)
  return date
}

/**
 * Calculate auto-approval date (3 days from submission)
 */
export function calculateAutoApprovalDate(submissionDate: Date = new Date()): Date {
  const date = new Date(submissionDate)
  date.setDate(date.getDate() + 3)
  return date
}

/**
 * Check if a date is within the enrollment period
 */
export function isWithinEnrollmentPeriod(
  date: Date,
  enrollmentStart: Date,
  enrollmentEnd: Date
): boolean {
  return date >= enrollmentStart && date <= enrollmentEnd
}

/**
 * Get the current school year based on today's date
 *
 * School years run from September to June:
 * - Sep 2025 to June 2026 = "2025 - 2026"
 */
export function getCurrentSchoolYearName(date: Date = new Date()): string {
  const month = date.getMonth() // 0-11
  const year = date.getFullYear()

  // If before September, we're in the previous year's school year
  // If September or later, we're in the current year's school year
  const startYear = month < 8 ? year - 1 : year // 8 = September
  const endYear = startYear + 1

  return `${startYear} - ${endYear}`
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format a date for display in French format (DD/MM/YYYY)
 */
export function formatDateFr(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/**
 * Format a date for display with month name
 */
export function formatDateLong(date: Date | string, locale: "en" | "fr" = "fr"): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ""
  const cleaned = phone.replace(/[^\d+]/g, "")

  // Format as +224 XXX XX XX XX
  if (cleaned.startsWith("+224")) {
    const number = cleaned.slice(4)
    return `+224 ${number.slice(0, 3)} ${number.slice(3, 5)} ${number.slice(5, 7)} ${number.slice(7)}`
  }

  // Format as XXX XX XX XX
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`
  }

  return phone
}
