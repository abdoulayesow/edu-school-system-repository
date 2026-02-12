import { LucideIcon } from "lucide-react"

/**
 * Dashboard Metric Card Data
 *
 * Represents a single metric card on the dashboard
 */
export interface DashboardMetric {
  /** Display label for the metric */
  label: string
  /** Main value to display (number or formatted string) */
  value: string | number
  /** Secondary text below the main value */
  subtext?: string
  /** Icon component from lucide-react */
  icon: LucideIcon
  /** Color theme for the card */
  color: "maroon" | "emerald" | "amber" | "blue" | "red" | "gold"
  /** Optional trend indicator */
  trend?: {
    direction: "up" | "down"
    value: string
  }
  /** Optional link to detailed view */
  link?: string
}

/**
 * Chart Data Point
 *
 * Generic data point for charts (bar, line, pie)
 */
export interface ChartDataPoint {
  /** Label/name for the data point */
  name: string
  /** Numeric value */
  value: number
  /** Optional custom color */
  color?: string
  /** Optional additional data fields */
  [key: string]: string | number | undefined
}

/**
 * Pending Action Item
 *
 * Represents an item requiring user action/approval
 */
export interface PendingActionItem {
  /** Unique identifier */
  id: string
  /** Type of action (enrollment, deposit, payment, etc.) */
  type: "enrollment" | "deposit" | "payment" | "fee_waiver" | "cash_to_deposit"
  /** Primary title/name */
  title: string
  /** Secondary description */
  subtitle?: string
  /** Associated monetary amount */
  amount?: number
  /** Formatted amount string */
  amountFormatted?: string
  /** Action date or submission date */
  date: Date | string
  /** Link to detail page */
  link: string
  /** Badge variant for visual distinction */
  badge?: {
    text: string
    variant?: "default" | "outline" | "destructive" | "secondary"
  }
}

/**
 * Financial Summary Item
 *
 * Represents a financial event or summary line item
 */
export interface FinancialSummaryItem {
  /** Unique identifier */
  id: string
  /** Display label */
  label: string
  /** Main amount */
  amount: number
  /** Formatted amount string */
  amountFormatted: string
  /** Count or secondary metric */
  count?: number
  /** Secondary description */
  description?: string
  /** Color indicator for the dot/marker */
  color: "emerald" | "amber" | "red" | "maroon" | "blue"
  /** Border color variant */
  borderColor?: "emerald" | "amber" | "red" | "maroon" | "blue"
}

/**
 * Dashboard Stats Summary
 *
 * Aggregated statistics for dashboard overview
 */
export interface DashboardStatsSummary {
  totalEnrollment?: number
  totalGrades?: number
  totalStudents?: number
  totalRevenue?: number
  pendingApprovals?: number
  atRiskCount?: number
  avgAttendance?: number
  collectionRate?: number
}

/**
 * Payment Method Breakdown
 *
 * Revenue distribution by payment method
 */
export interface PaymentMethodBreakdown {
  cash: {
    count: number
    amount: number
    confirmed: number
  }
  orange_money: {
    count: number
    amount: number
    confirmed: number
  }
}

/**
 * Grade Enrollment Data
 *
 * Student enrollment data by grade for charts
 */
export interface GradeEnrollmentData {
  gradeId: string
  gradeName: string
  count: number
  capacity?: number
  level?: string
}

/**
 * Revenue Category Data
 *
 * Revenue breakdown by category for pie charts
 */
export interface RevenueCategoryData {
  category: string
  value: number
  color: string
  percentage?: number
}
