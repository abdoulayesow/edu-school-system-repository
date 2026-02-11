// ============================================================================
// SALARY TYPES
// Shared type definitions for salary management pages and components
// ============================================================================

import type {
  SalaryType,
  HoursRecordStatus,
  SalaryPaymentStatus,
  SalaryAdvanceStatus,
  RecoupmentStrategy,
} from "@prisma/client"

// Re-export enums for convenience
export type { SalaryType, HoursRecordStatus, SalaryPaymentStatus, SalaryAdvanceStatus, RecoupmentStrategy }

// ============================================================================
// SALARY RATES
// ============================================================================

export interface SalaryRateUser {
  id: string
  name: string | null
  email: string
  role: string
}

export interface SalaryRateWithUser {
  id: string
  userId: string
  salaryType: SalaryType
  hourlyRate: number | null
  fixedMonthly: number | null
  effectiveFrom: string
  effectiveTo: string | null
  createdAt: string
  updatedAt: string
  user: SalaryRateUser
}

export interface SalaryRateFilters {
  userId?: string
  salaryType?: SalaryType
  active?: boolean
  search?: string
  limit?: number
  offset?: number
}

export interface CreateSalaryRateData {
  userId: string
  salaryType: SalaryType
  hourlyRate?: number
  fixedMonthly?: number
  effectiveFrom: string
}

export interface UpdateSalaryRateData {
  id: string
  salaryType?: SalaryType
  hourlyRate?: number
  fixedMonthly?: number
  effectiveFrom?: string
  effectiveTo?: string
}

// ============================================================================
// HOURS RECORDS
// ============================================================================

export interface HoursRecordUser {
  id: string
  name: string | null
  email: string
  role: string
}

export interface HoursRecordWithRelations {
  id: string
  userId: string
  schoolYearId: string
  month: number
  year: number
  totalHours: number
  notes: string | null
  status: HoursRecordStatus
  submittedAt: string | null
  reviewedAt: string | null
  rejectionNote: string | null
  createdAt: string
  updatedAt: string
  user: HoursRecordUser
  submitter: { id: string; name: string | null } | null
  reviewer: { id: string; name: string | null } | null
  schoolYear: { id: string; name: string }
}

export interface HoursRecordFilters {
  schoolYearId?: string
  month?: number
  year?: number
  status?: HoursRecordStatus
  userId?: string
  search?: string
  limit?: number
  offset?: number
}

export interface CreateHoursRecordData {
  userId: string
  schoolYearId: string
  month: number
  year: number
  totalHours: number
  notes?: string
}

export interface BulkHoursEntry {
  userId: string
  totalHours: number
  notes?: string
}

export interface BulkHoursEntryData {
  schoolYearId: string
  month: number
  year: number
  entries: BulkHoursEntry[]
}

export interface ReviewHoursData {
  action: "approve" | "reject"
  rejectionNote?: string
}

// ============================================================================
// SALARY PAYMENTS
// ============================================================================

export interface SalaryPaymentWithRelations {
  id: string
  userId: string
  schoolYearId: string
  month: number
  year: number
  salaryType: SalaryType
  hoursRecordId: string | null
  salaryRateId: string
  hoursWorked: number | null
  hourlyRate: number | null
  fixedMonthly: number | null
  grossAmount: number
  advanceDeduction: number
  otherDeductions: number
  netAmount: number
  method: string
  status: SalaryPaymentStatus
  notes: string | null
  approvedAt: string | null
  paidAt: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
  user: { id: string; name: string | null; email: string; role: string }
  schoolYear: { id: string; name: string }
  hoursRecord: HoursRecordWithRelations | null
  salaryRate: SalaryRateWithUser
  approver: { id: string; name: string | null } | null
  payer: { id: string; name: string | null } | null
  canceller: { id: string; name: string | null } | null
  recoupments: AdvanceRecoupmentEntry[]
}

export interface SalaryPaymentFilters {
  schoolYearId?: string
  month?: number
  year?: number
  status?: SalaryPaymentStatus
  salaryType?: SalaryType
  userId?: string
  search?: string
  limit?: number
  offset?: number
}

export interface GenerateSalariesData {
  schoolYearId: string
  month: number
  year: number
}

export interface ApproveSalaryData {
  action: "approve" | "cancel"
  notes?: string
}

export interface PaySalaryData {
  method: "cash" | "orange_money"
  notes?: string
}

// ============================================================================
// SALARY ADVANCES
// ============================================================================

export interface SalaryAdvanceWithRelations {
  id: string
  userId: string
  amount: number
  method: string
  reason: string
  strategy: RecoupmentStrategy
  numberOfInstallments: number | null
  totalRecouped: number
  remainingBalance: number
  status: SalaryAdvanceStatus
  disbursedAt: string
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
  user: { id: string; name: string | null; email: string; role: string }
  disburser: { id: string; name: string | null }
  canceller: { id: string; name: string | null } | null
  recoupments: AdvanceRecoupmentEntry[]
}

export interface AdvanceRecoupmentEntry {
  id: string
  salaryAdvanceId: string
  salaryPaymentId: string
  amount: number
  installmentNumber: number | null
  createdAt: string
  salaryPayment?: {
    id: string
    month: number
    year: number
    paidAt: string | null
  }
}

export interface SalaryAdvanceFilters {
  userId?: string
  status?: SalaryAdvanceStatus
  strategy?: RecoupmentStrategy
  search?: string
  limit?: number
  offset?: number
}

export interface CreateAdvanceData {
  userId: string
  amount: number
  method: "cash" | "orange_money"
  reason: string
  strategy: RecoupmentStrategy
  numberOfInstallments?: number
}

export interface UpdateAdvanceData {
  id: string
  strategy?: RecoupmentStrategy
  numberOfInstallments?: number
  status?: "cancelled"
  cancellationNote?: string
}

// ============================================================================
// STATS
// ============================================================================

export interface SalaryPaymentStats {
  totalPayroll: number
  pending: { count: number; amount: number }
  approved: { count: number; amount: number }
  paid: { count: number; amount: number }
  cancelled: { count: number; amount: number }
}

export interface AdvanceStats {
  activeCount: number
  totalOutstanding: number
  thisMonthRecoupments: number
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface SalaryRatesResponse {
  rates: SalaryRateWithUser[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface HoursRecordsResponse {
  records: HoursRecordWithRelations[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface SalaryPaymentsResponse {
  payments: SalaryPaymentWithRelations[]
  stats: SalaryPaymentStats
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface SalaryAdvancesResponse {
  advances: SalaryAdvanceWithRelations[]
  stats: AdvanceStats
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}
