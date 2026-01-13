import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

/**
 * Query key factory for consistent cache key management
 *
 * Usage:
 * - queryKeys.grades() -> ["grades"]
 * - queryKeys.grades("sy-123") -> ["grades", "sy-123"]
 * - queryKeys.students({ gradeId: "g-123", search: "John" }) -> ["students", { gradeId: "g-123", search: "John" }]
 */
export const queryKeys = {
  // Grades
  grades: (schoolYearId?: string) =>
    schoolYearId ? (["grades", schoolYearId] as const) : (["grades"] as const),

  // Students
  students: (filters?: StudentFilters) =>
    filters ? (["students", filters] as const) : (["students"] as const),

  // Enrollments
  enrollments: (filters?: EnrollmentFilters) =>
    filters
      ? (["enrollments", filters] as const)
      : (["enrollments"] as const),

  // Activities
  activities: (filters?: ActivityFilters) =>
    filters
      ? (["activities", filters] as const)
      : (["activities"] as const),

  // School year
  schoolYearActive: () => ["school-year", "active"] as const,

  // Timetable
  timetable: (gradeId?: string) =>
    gradeId ? (["timetable", gradeId] as const) : (["timetable"] as const),

  // Subjects
  subjects: () => ["subjects"] as const,

  // Expenses
  expenses: (filters?: ExpenseFilters) =>
    filters ? (["expenses", filters] as const) : (["expenses"] as const),

  // Payments
  payments: (filters?: PaymentFilters) =>
    filters ? (["payments", filters] as const) : (["payments"] as const),
  paymentStats: () => ["payments", "stats"] as const,
} as const

// Filter types
interface StudentFilters {
  gradeId?: string
  schoolYearId?: string
  search?: string
  status?: string
  limit?: number
  offset?: number
}

interface EnrollmentFilters {
  status?: string
  schoolYearId?: string
  gradeId?: string
  search?: string
  drafts?: boolean
  limit?: number
  offset?: number
  startDate?: string
  endDate?: string
}

interface ActivityFilters {
  schoolYearId?: string
  type?: string
  status?: string
  search?: string
  view?: "activities" | "students"
  limit?: number
  offset?: number
}

interface ExpenseFilters {
  status?: string
  category?: string
  search?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

interface PaymentFilters {
  status?: string
  method?: string
  gradeId?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

// Pagination response type
interface PaginatedResponse<T> {
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  [key: string]: T[] | PaginatedResponse<T>["pagination"]
}

/**
 * Generic fetch function with error handling
 */
async function fetchApi<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message || `API error: ${res.status}`)
  }
  return res.json()
}

/**
 * Build URL with query params
 */
function buildUrl(
  base: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value))
    }
  }
  const queryString = searchParams.toString()
  return queryString ? `${base}?${queryString}` : base
}

// Response types
interface Grade {
  id: string
  name: string
  code: string | null
  level: string
  order: number
  tuitionFee: number
  capacity: number
  series: string | null
  isEnabled: boolean
  schoolYear: {
    id: string
    name: string
    isActive: boolean
  }
  gradeLeader: {
    id: string
    person: {
      firstName: string
      lastName: string
      photoUrl: string | null
    }
  } | null
  stats: {
    studentCount: number
    subjectCount: number
    attendanceRate: number | null
    paymentRate: number | null
    paymentBreakdown: {
      late: number
      onTime: number
      complete: number
    }
  }
}

interface GradesResponse {
  grades: Grade[]
}

/**
 * Hook: Fetch grades for a school year
 *
 * @param schoolYearId - Optional school year ID (defaults to active)
 * @returns Query result with grades data
 *
 * @example
 * const { data, isLoading, error } = useGrades()
 * const grades = data?.grades ?? []
 */
export function useGrades(schoolYearId?: string) {
  const url = buildUrl("/api/grades", { schoolYearId })

  return useQuery({
    queryKey: queryKeys.grades(schoolYearId),
    queryFn: () => fetchApi<GradesResponse>(url),
    // Grades change infrequently - cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook: Fetch active school year
 */
export function useActiveSchoolYear() {
  return useQuery({
    queryKey: queryKeys.schoolYearActive(),
    queryFn: () => fetchApi<{ id: string; name: string; grades: unknown[] }>("/api/school-years/active"),
    // Active school year rarely changes
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

interface SchoolYear {
  id: string
  name: string
  isActive: boolean
  status: string
  startDate: string
  endDate: string
}

/**
 * Hook: Fetch all school years (for filtering)
 */
export function useSchoolYears() {
  return useQuery({
    queryKey: ["school-years"],
    queryFn: () => fetchApi<SchoolYear[]>("/api/admin/school-years"),
    staleTime: 60 * 60 * 1000, // 1 hour - school years rarely change
  })
}

/**
 * Hook: Fetch subjects list
 */
export function useSubjects() {
  return useQuery({
    queryKey: queryKeys.subjects(),
    queryFn: () => fetchApi<unknown[]>("/api/admin/subjects"),
    // Subjects rarely change
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  })
}

/**
 * Hook: Invalidate related queries
 *
 * @example
 * const invalidate = useInvalidateQueries()
 * // After creating enrollment:
 * invalidate.enrollments()
 * invalidate.grades() // To refresh student counts
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient()

  return {
    grades: () => queryClient.invalidateQueries({ queryKey: ["grades"] }),
    students: () => queryClient.invalidateQueries({ queryKey: ["students"] }),
    enrollments: () =>
      queryClient.invalidateQueries({ queryKey: ["enrollments"] }),
    activities: () =>
      queryClient.invalidateQueries({ queryKey: ["activities"] }),
    schoolYear: () =>
      queryClient.invalidateQueries({ queryKey: ["school-year"] }),
    timetable: () =>
      queryClient.invalidateQueries({ queryKey: ["timetable"] }),
    subjects: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }),
    expenses: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
    payments: () => queryClient.invalidateQueries({ queryKey: ["payments"] }),
    accounting: () =>
      queryClient.invalidateQueries({ queryKey: ["accounting"] }),
    all: () => queryClient.invalidateQueries(),
  }
}

// ============================================
// Dashboard Hooks
// ============================================

interface AccountingBalance {
  summary: {
    totalConfirmedPayments: number
    totalPendingPayments: number
    totalPaidExpenses: number
    margin: number
  }
  payments: {
    byStatus: Record<string, { count: number; amount: number }>
    byMethod: Record<string, { count: number; amount: number; confirmed: number }>
  }
}

/**
 * Hook: Fetch accounting balance summary
 */
export function useAccountingBalance() {
  return useQuery({
    queryKey: ["accounting", "balance"],
    queryFn: () => fetchApi<AccountingBalance>("/api/accounting/balance"),
    staleTime: 60 * 1000, // 1 minute - financial data changes frequently
  })
}

export interface PendingEnrollment {
  id: string
  enrollmentNumber: string | null
  firstName: string
  lastName: string
  status: string
  adjustedTuitionFee: number | null
  originalTuitionFee: number
  adjustmentReason: string | null
  grade: { name: string }
}

/**
 * Hook: Fetch enrollments needing review
 */
export function usePendingEnrollments() {
  return useQuery({
    queryKey: ["enrollments", { status: "needs_review" }],
    queryFn: async (): Promise<PendingEnrollment[]> => {
      const res = await fetch("/api/enrollments?status=needs_review")
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(error.message || `API error: ${res.status}`)
      }
      const data = await res.json()
      // Handle both array and wrapped response formats
      return Array.isArray(data) ? data : (data.enrollments || [])
    },
    staleTime: 30 * 1000, // 30 seconds - action items
  })
}

interface BankDeposit {
  id: string
  amount: number
  depositDate: string
  reference: string
  isReconciled: boolean
}

interface BankDepositsResponse {
  deposits: BankDeposit[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

/**
 * Hook: Fetch unreconciled bank deposits
 */
export function useUnreconciledDeposits() {
  return useQuery({
    queryKey: ["bank-deposits", { isReconciled: false }],
    queryFn: () =>
      fetchApi<BankDepositsResponse>("/api/bank-deposits?isReconciled=false"),
    staleTime: 30 * 1000, // 30 seconds - action items
  })
}

interface PendingPayment {
  id: string
  amount: number
  method: string
  status: string
  receiptNumber: string
  createdAt: string
  enrollment: {
    student: {
      firstName: string
      lastName: string
    }
  } | null
  recorder: { name: string } | null
  cashDeposit: { id: string } | null
}

interface PaymentsResponse {
  payments: PendingPayment[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

/**
 * Hook: Fetch cash payments that haven't been deposited to bank yet
 * These are confirmed payments where method=cash and no cashDeposit record exists
 */
export function useCashNeedingDeposit() {
  return useQuery({
    queryKey: ["payments", { method: "cash", needsDeposit: true }],
    queryFn: async () => {
      const response = await fetchApi<PaymentsResponse>("/api/payments?method=cash")
      // Filter to only cash payments without a deposit
      const needingDeposit = response.payments.filter(p => !p.cashDeposit)
      return {
        ...response,
        payments: needingDeposit,
        pagination: {
          ...response.pagination,
          total: needingDeposit.length,
        },
      }
    },
    staleTime: 30 * 1000, // 30 seconds - action items
  })
}

// ============================================
// Students Hooks
// ============================================

export interface ApiStudent {
  id: string
  studentNumber: string
  firstName: string
  middleName?: string | null
  lastName: string
  dateOfBirth?: string
  email?: string | null
  status?: string
  photoUrl: string | null
  grade: {
    id: string
    name: string
    level: string
    order: number
  } | null
  roomAssignment: {
    id: string
    gradeRoom: { id: string; name: string; displayName: string | null }
  } | null
  paymentStatus: "late" | "on_time" | "in_advance" | "complete" | null
  enrollmentStatus: string | null
  attendanceStatus: "good" | "concerning" | "critical" | null
  balanceInfo: {
    tuitionFee: number
    totalPaid: number
    remainingBalance: number
    paymentPercentage: number
  } | null
}

interface StudentsResponse {
  students: ApiStudent[]
  pagination: {
    total: number
    filteredTotal?: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

/**
 * Hook: Fetch students with optional filters
 *
 * @example
 * const { data, isLoading } = useStudents({ gradeId: 'g-123', search: 'John' })
 */
export function useStudents(filters?: StudentFilters) {
  const url = buildUrl("/api/students", { ...filters })

  return useQuery({
    queryKey: queryKeys.students(filters),
    queryFn: () => fetchApi<StudentsResponse>(url),
    staleTime: 30 * 1000, // 30 seconds - student list changes with enrollments
  })
}

// ============================================
// Activities Hooks
// ============================================

export interface ApiActivity {
  id: string
  name: string
  description: string | null
  type: "club" | "sport" | "arts" | "academic" | "other"
  status: string
  fee: number
  capacity: number | null
  _count: {
    enrollments: number
  }
}

interface ActivitiesResponse {
  activities: ApiActivity[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface ApiEligibleStudent {
  enrollmentId: string
  studentProfileId: string
  firstName: string
  lastName: string
  studentNumber: string | null
  grade: {
    id: string
    name: string
    order: number
  }
  activityEnrollments: Array<{
    activity: { id: string; name: string; type: string }
  }>
}

interface EligibleStudentsResponse {
  students: ApiEligibleStudent[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

/**
 * Hook: Fetch activities with optional filters
 */
export function useActivities(filters?: ActivityFilters) {
  const url = buildUrl("/api/activities", { ...filters })

  return useQuery({
    queryKey: queryKeys.activities(filters),
    queryFn: () => fetchApi<ActivitiesResponse>(url),
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Hook: Fetch students eligible for activity enrollment
 */
export function useEligibleStudents() {
  return useQuery({
    queryKey: queryKeys.activities({ view: "students" }),
    queryFn: () =>
      fetchApi<EligibleStudentsResponse>("/api/activities?view=students"),
    staleTime: 30 * 1000, // 30 seconds
  })
}

interface EnrollInActivityParams {
  activityId: string
  studentProfileId: string
}

/**
 * Hook: Enroll a student in an activity (mutation)
 *
 * @example
 * const { mutate, isPending } = useEnrollInActivity()
 * mutate({ activityId: 'a-123', studentProfileId: 'sp-456' })
 */
export function useEnrollInActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ activityId, studentProfileId }: EnrollInActivityParams) => {
      const res = await fetch(`/api/activities/${activityId}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentProfileId }),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(error.message || `API error: ${res.status}`)
      }
      return res.json()
    },
    onSuccess: () => {
      // Invalidate activities to refresh counts
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    },
  })
}

// ============================================
// Admin Activities Hooks
// ============================================

interface AdminActivityFilters {
  schoolYearId: string
  type?: string
  status?: string
  search?: string
  limit?: number
  offset?: number
}

export interface AdminActivity {
  id: string
  name: string
  nameFr: string | null
  description: string | null
  type: "club" | "sport" | "arts" | "academic" | "other"
  startDate: string
  endDate: string
  fee: number
  capacity: number
  status: "draft" | "active" | "closed" | "completed" | "cancelled"
  isEnabled: boolean
  schoolYearId: string
  creator: { id: string; name: string | null; email: string | null }
  _count: { enrollments: number; payments: number }
}

interface AdminActivitiesResponse {
  activities: AdminActivity[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

/**
 * Hook: Fetch admin activities with filters
 */
export function useAdminActivities(filters: AdminActivityFilters) {
  const url = buildUrl("/api/admin/activities", { ...filters })

  return useQuery({
    queryKey: ["admin", "activities", filters],
    queryFn: () => fetchApi<AdminActivitiesResponse>(url),
    staleTime: 30 * 1000,
    enabled: !!filters.schoolYearId,
  })
}

interface CreateActivityInput {
  name: string
  nameFr?: string
  description?: string
  type: string
  startDate: string
  endDate: string
  fee: number
  capacity: number
  status: string
  schoolYearId: string
}

/**
 * Hook: Create a new activity (admin)
 */
export function useCreateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateActivityInput) => {
      const res = await fetch("/api/admin/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(error.message || `API error: ${res.status}`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "activities"] })
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    },
  })
}

interface UpdateActivityInput {
  id: string
  name?: string
  nameFr?: string
  description?: string
  type?: string
  startDate?: string
  endDate?: string
  fee?: number
  capacity?: number
  status?: string
}

/**
 * Hook: Update an activity (admin)
 */
export function useUpdateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateActivityInput) => {
      const res = await fetch(`/api/admin/activities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(error.message || `API error: ${res.status}`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "activities"] })
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    },
  })
}

/**
 * Hook: Delete an activity (admin)
 */
export function useDeleteActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (activityId: string) => {
      const res = await fetch(`/api/admin/activities/${activityId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(error.message || `API error: ${res.status}`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "activities"] })
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    },
  })
}

// ============================================
// Enrollments Hooks
// ============================================

export interface ApiEnrollment {
  id: string
  enrollmentNumber: string | null
  firstName: string
  middleName?: string | null
  lastName: string
  photoUrl?: string | null
  status: string
  gradeId: string
  adjustedTuitionFee: number | null
  originalTuitionFee: number
  adjustmentReason: string | null
  createdAt: string
  updatedAt: string
  grade: {
    name: string
    level: string
    tuitionFee: number
  } | null
  schoolYear: {
    name: string
  }
  totalPaid: number
  tuitionFee: number
}

interface EnrollmentsResponse {
  enrollments: ApiEnrollment[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  stats: {
    total: number
    draft: number
    submitted: number
    needsReview: number
    completed: number
  }
}

/**
 * Hook: Fetch enrollments with optional filters
 *
 * @example
 * const { data, isLoading } = useEnrollments({ status: 'submitted', gradeId: 'g-123' })
 */
export function useEnrollments(filters?: EnrollmentFilters) {
  const url = buildUrl("/api/enrollments", { ...filters })

  return useQuery({
    queryKey: queryKeys.enrollments(filters),
    queryFn: () => fetchApi<EnrollmentsResponse>(url),
    staleTime: 30 * 1000, // 30 seconds - enrollment status changes frequently
  })
}

/**
 * Hook: Submit an enrollment for review (mutation)
 */
export function useSubmitEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const res = await fetch(`/api/enrollments/${enrollmentId}/submit`, {
        method: "POST",
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(error.message || `API error: ${res.status}`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] })
    },
  })
}

/**
 * Hook: Delete an enrollment (mutation)
 */
export function useDeleteEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const res = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(error.message || `API error: ${res.status}`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] })
      queryClient.invalidateQueries({ queryKey: ["grades"] }) // Refresh student counts
    },
  })
}

// ============================================
// Expenses Hooks
// ============================================

export interface ApiExpense {
  id: string
  category: string
  description: string
  amount: number
  method: string
  date: string
  vendorName: string | null
  receiptUrl: string | null
  status: string
  rejectionReason: string | null
  createdAt: string
  approvedAt: string | null
  paidAt: string | null
  requester: {
    id: string
    name: string
  } | null
  approver: {
    id: string
    name: string
  } | null
}

interface ExpensesResponse {
  expenses: ApiExpense[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

/**
 * Hook: Fetch expenses with optional filters
 */
export function useExpenses(filters?: ExpenseFilters) {
  const url = buildUrl("/api/expenses", { ...filters })

  return useQuery({
    queryKey: queryKeys.expenses(filters),
    queryFn: () => fetchApi<ExpensesResponse>(url),
    staleTime: 30 * 1000, // 30 seconds - financial data needs freshness
  })
}

interface CreateExpenseInput {
  category: string
  description: string
  amount: number
  method: string
  date: string
  vendorName?: string
  receiptUrl?: string
}

/**
 * Hook: Create a new expense (mutation)
 */
export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateExpenseInput) => {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(error.message || `API error: ${res.status}`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      queryClient.invalidateQueries({ queryKey: ["accounting"] }) // Refresh balance
    },
  })
}

interface UpdateExpenseStatusInput {
  id: string
  action: "approve" | "reject" | "mark_paid"
  rejectionReason?: string
}

/**
 * Hook: Update expense status (approve/reject/mark_paid)
 */
export function useUpdateExpenseStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, action, rejectionReason }: UpdateExpenseStatusInput) => {
      const res = await fetch(`/api/expenses/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason }),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(error.message || `API error: ${res.status}`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      queryClient.invalidateQueries({ queryKey: ["accounting"] }) // Refresh balance
    },
  })
}

/**
 * Hook: Delete an expense (mutation)
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (expenseId: string) => {
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(error.message || `API error: ${res.status}`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      queryClient.invalidateQueries({ queryKey: ["accounting"] }) // Refresh balance
    },
  })
}

// ============================================
// Payments Hooks
// ============================================

export interface ApiPayment {
  id: string
  amount: number
  method: "cash" | "orange_money"
  status: string
  receiptNumber: string
  transactionRef: string | null
  notes: string | null
  createdAt: string
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
      photoUrl: string | null
    } | null
    grade: {
      id: string
      name: string
    } | null
  } | null
  recorder: {
    id: string
    name: string
    email: string
  } | null
  confirmer: {
    id: string
    name: string
  } | null
  reviewer: {
    id: string
    name: string
  } | null
  cashDeposit: {
    id: string
    depositDate: string
    reference: string
  } | null
}

interface FullPaymentsResponse {
  payments: ApiPayment[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

interface PaymentStats {
  today: {
    count: number
    amount: number
  }
  pending: {
    count: number
    amount: number
  }
  confirmedThisWeek: {
    count: number
    amount: number
  }
  byMethod: Record<string, { count: number; amount: number }>
}

/**
 * Hook: Fetch payments with optional filters
 */
export function usePayments(filters?: PaymentFilters) {
  const url = buildUrl("/api/payments", { ...filters })

  return useQuery({
    queryKey: queryKeys.payments(filters),
    queryFn: () => fetchApi<FullPaymentsResponse>(url),
    staleTime: 30 * 1000, // 30 seconds - financial data needs freshness
  })
}

/**
 * Hook: Fetch payment statistics
 */
export function usePaymentStats() {
  return useQuery({
    queryKey: queryKeys.paymentStats(),
    queryFn: () => fetchApi<PaymentStats>("/api/payments/stats"),
    staleTime: 60 * 1000, // 1 minute - aggregated stats
  })
}

interface CreatePaymentInput {
  enrollmentId: string
  amount: number
  method: string
  notes?: string
}

/**
 * Hook: Create a new payment (mutation)
 */
export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePaymentInput) => {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(error.message || `API error: ${res.status}`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      queryClient.invalidateQueries({ queryKey: ["accounting"] }) // Refresh balance
      queryClient.invalidateQueries({ queryKey: ["enrollments"] }) // Refresh payment totals
    },
  })
}

interface RecordCashDepositInput {
  paymentId: string
  depositDate: string
  reference: string
}

/**
 * Hook: Record a cash deposit for a payment (mutation)
 */
export function useRecordCashDeposit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ paymentId, depositDate, reference }: RecordCashDepositInput) => {
      const res = await fetch(`/api/payments/${paymentId}/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depositDate, reference }),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(error.message || `API error: ${res.status}`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      queryClient.invalidateQueries({ queryKey: ["bank-deposits"] })
    },
  })
}

interface ReviewPaymentInput {
  paymentId: string
  action: "confirm" | "reject"
  rejectionReason?: string
}

/**
 * Hook: Review a payment (confirm/reject)
 */
export function useReviewPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ paymentId, action, rejectionReason }: ReviewPaymentInput) => {
      const res = await fetch(`/api/payments/${paymentId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason }),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(error.message || `API error: ${res.status}`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      queryClient.invalidateQueries({ queryKey: ["accounting"] }) // Refresh balance
    },
  })
}
