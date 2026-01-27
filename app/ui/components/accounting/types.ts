// =============================================================================
// ACCOUNTING TYPES - Shared types for accounting components
// =============================================================================

export interface Payment {
  id: string
  amount: number
  method: "cash" | "orange_money"
  status: "confirmed" | "reversed" | "failed"
  receiptNumber: string
  transactionRef: string | null
  recordedAt: string
  confirmedAt: string | null
  enrollment: {
    id: string
    enrollmentNumber: string
    student: {
      id: string
      firstName: string
      lastName: string
      studentNumber: string
    } | null
    grade: {
      id: string
      name: string
    } | null
  } | null
  recorder: { id: string; name: string; email: string } | null
}

export interface BalanceSummary {
  totalConfirmedPayments: number
  totalPendingPayments: number
  totalPaidExpenses: number
  totalPendingExpenses: number
  cashAvailable: number
  cashPending: number
  margin: number
}

export interface BalanceData {
  summary: BalanceSummary
  payments: {
    byStatus: Record<string, { count: number; amount: number }>
    byMethod: Record<string, { count: number; amount: number; confirmed: number }>
    byGrade: Record<string, { count: number; amount: number; confirmed: number }>
    total: { count: number; amount: number }
  }
  expenses: {
    byStatus: Record<string, { count: number; amount: number }>
    byCategory: Record<string, { count: number; amount: number }>
    total: { count: number; amount: number }
  }
}

export interface TreasuryBalance {
  registryBalance: number
  registryFloatAmount: number
  safeBalance: number
  bankBalance: number
  mobileMoneyBalance: number
  totalLiquidAssets: number
  thresholds: {
    min: number
    max: number
  }
  status: "critical" | "warning" | "optimal" | "excess"
  lastVerification: {
    at: string
    byId: string
  } | null
  todayVerification: {
    id: string
    status: string
    expectedBalance: number
    countedBalance: number
    discrepancy: number
    verifiedAt: string
    verifiedBy: { id: string; name: string }
  } | null
  todaySummary: {
    in: number
    out: number
    net: number
    transactionCount: number
  }
  updatedAt: string
}

export interface RecentTransaction {
  id: string
  type: string
  direction: "in" | "out"
  amount: number
  description: string | null
  recordedAt: string
  recorder: { id: string; name: string }
  student: { firstName: string; lastName: string } | null
}

export interface BankTransfer {
  id: string
  type: "deposit" | "withdrawal"
  amount: number
  depositSlipNumber: string | null
  notes: string | null
  createdAt: string
  recordedBy: { name: string }
}
