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

  // Clubs
  clubs: (filters?: ClubFilters) =>
    filters
      ? (["clubs", filters] as const)
      : (["clubs"] as const),
  clubCategories: () => ["club-categories"] as const,

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
  paymentStats: (filters?: PaymentStatsFilters) =>
    filters ? (["payments", "stats", filters] as const) : (["payments", "stats"] as const),
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

interface ClubFilters {
  schoolYearId?: string
  categoryId?: string
  status?: string
  search?: string
  view?: "clubs" | "students"
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
  paymentType?: string // "tuition" or "club"
  gradeId?: string
  balanceStatus?: string // "outstanding" (still owes) or "paid_up" (fully paid)
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

interface PaymentStatsFilters {
  startDate?: string
  endDate?: string
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
// Clubs Hooks
// ============================================

export interface ApiClubCategory {
  id: string
  name: string
  nameFr: string
}

export interface ApiClubEligibilityRule {
  id: string
  ruleType: "all_grades" | "include_only" | "exclude_only"
  gradeRules: Array<{
    gradeId: string
    grade: { id: string; name: string; order: number }
  }>
}

export interface ApiClub {
  id: string
  name: string
  nameFr: string | null
  description: string | null
  categoryId: string | null
  category: ApiClubCategory | null
  status: string
  fee: number
  monthlyFee: number | null
  capacity: number | null
  leaderId: string | null
  leaderType: "teacher" | "staff" | "student" | null
  leader: {
    id: string
    name: string
    type: "teacher" | "staff" | "student"
    photoUrl?: string | null
    email?: string | null
    role?: string | null
    grade?: string | null
  } | null
  eligibilityRule: ApiClubEligibilityRule | null
  _count: {
    enrollments: number
  }
}

interface ClubsResponse {
  clubs: ApiClub[]
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
  clubEnrollments: Array<{
    club: { id: string; name: string; categoryId: string | null }
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
 * Hook: Fetch clubs with optional filters
 */
export function useClubs(filters?: ClubFilters) {
  const url = buildUrl("/api/clubs", { ...filters })

  return useQuery({
    queryKey: queryKeys.clubs(filters),
    queryFn: () => fetchApi<ClubsResponse>(url),
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Hook: Fetch students eligible for club enrollment
 */
export function useEligibleStudents() {
  return useQuery({
    queryKey: queryKeys.clubs({ view: "students" }),
    queryFn: () =>
      fetchApi<EligibleStudentsResponse>("/api/clubs?view=students"),
    staleTime: 30 * 1000, // 30 seconds
  })
}

interface EnrollInClubParams {
  clubId: string
  studentProfileId: string
  startMonth?: number
  startYear?: number
  totalMonths?: number
}

/**
 * Hook: Enroll a student in a club (mutation)
 *
 * @example
 * const { mutate, isPending } = useEnrollInClub()
 * mutate({ clubId: 'c-123', studentProfileId: 'sp-456' })
 */
export function useEnrollInClub() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ clubId, ...data }: EnrollInClubParams) => {
      const res = await fetch(`/api/admin/clubs/${clubId}/enrollments`, {
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
      // Invalidate clubs to refresh counts
      queryClient.invalidateQueries({ queryKey: ["clubs"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "clubs"] })
    },
  })
}

// ============================================
// Club Categories Hooks
// ============================================

export interface ClubCategory {
  id: string
  name: string
  nameFr: string
  description: string | null
  status: "active" | "inactive"
  order: number
  _count: { clubs: number }
}

/**
 * Hook: Fetch all club categories
 */
export function useClubCategories(status?: "active" | "inactive") {
  const url = buildUrl("/api/admin/club-categories", { status })

  return useQuery({
    queryKey: queryKeys.clubCategories(),
    queryFn: () => fetchApi<ClubCategory[]>(url),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

interface CreateClubCategoryInput {
  name: string
  nameFr: string
  description?: string
  status?: "active" | "inactive"
  order?: number
}

/**
 * Hook: Create a new club category
 */
export function useCreateClubCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateClubCategoryInput) => {
      const res = await fetch("/api/admin/club-categories", {
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
      queryClient.invalidateQueries({ queryKey: ["club-categories"] })
    },
  })
}

interface UpdateClubCategoryInput {
  id: string
  name?: string
  nameFr?: string
  description?: string
  status?: "active" | "inactive"
  order?: number
}

/**
 * Hook: Update a club category
 */
export function useUpdateClubCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateClubCategoryInput) => {
      const res = await fetch(`/api/admin/club-categories/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["club-categories"] })
    },
  })
}

/**
 * Hook: Delete a club category
 */
export function useDeleteClubCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const res = await fetch(`/api/admin/club-categories/${categoryId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(error.message || `API error: ${res.status}`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-categories"] })
    },
  })
}

// ============================================
// Admin Clubs Hooks
// ============================================

interface AdminClubFilters {
  schoolYearId: string
  categoryId?: string
  status?: string
  search?: string
  limit?: number
  offset?: number
}

export interface AdminClub {
  id: string
  name: string
  nameFr: string | null
  description: string | null
  categoryId: string | null
  category: ApiClubCategory | null
  leaderId: string | null
  leaderType: "teacher" | "staff" | "student" | null
  leader: {
    id: string
    name: string
    type: "teacher" | "staff" | "student"
    photoUrl?: string | null
    email?: string | null
    role?: string | null
    grade?: string | null
  } | null
  startDate: string
  endDate: string
  fee: number
  monthlyFee: number | null
  capacity: number
  status: "draft" | "active" | "closed" | "completed" | "cancelled"
  isEnabled: boolean
  schoolYearId: string
  creator: { id: string; name: string | null; email: string | null }
  eligibilityRule: ApiClubEligibilityRule | null
  _count: { enrollments: number; payments: number }
}

interface AdminClubsResponse {
  clubs: AdminClub[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

/**
 * Hook: Fetch admin clubs with filters
 */
export function useAdminClubs(filters: AdminClubFilters) {
  const url = buildUrl("/api/admin/clubs", { ...filters })

  return useQuery({
    queryKey: ["admin", "clubs", filters],
    queryFn: () => fetchApi<AdminClubsResponse>(url),
    staleTime: 30 * 1000,
    enabled: !!filters.schoolYearId,
  })
}

interface CreateClubInput {
  name: string
  nameFr?: string
  description?: string
  categoryId?: string
  leaderId?: string
  leaderType?: "teacher" | "staff" | "student"
  startDate: string
  endDate: string
  fee: number
  monthlyFee?: number
  capacity: number
  status: string
  schoolYearId: string
}

/**
 * Hook: Create a new club (admin)
 */
export function useCreateClub() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateClubInput) => {
      const res = await fetch("/api/admin/clubs", {
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
      queryClient.invalidateQueries({ queryKey: ["admin", "clubs"] })
      queryClient.invalidateQueries({ queryKey: ["clubs"] })
    },
  })
}

interface UpdateClubInput {
  id: string
  name?: string
  nameFr?: string
  description?: string
  categoryId?: string | null
  leaderId?: string | null
  leaderType?: "teacher" | "staff" | "student" | null
  startDate?: string
  endDate?: string
  fee?: number
  monthlyFee?: number | null
  capacity?: number
  status?: string
}

/**
 * Hook: Update a club (admin)
 */
export function useUpdateClub() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateClubInput) => {
      const res = await fetch(`/api/admin/clubs/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["admin", "clubs"] })
      queryClient.invalidateQueries({ queryKey: ["clubs"] })
    },
  })
}

/**
 * Hook: Delete a club (admin)
 */
export function useDeleteClub() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (clubId: string) => {
      const res = await fetch(`/api/admin/clubs/${clubId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(error.message || `API error: ${res.status}`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "clubs"] })
      queryClient.invalidateQueries({ queryKey: ["clubs"] })
    },
  })
}

// ============================================
// Club Eligibility Rules Hooks
// ============================================

interface UpdateEligibilityRuleInput {
  clubId: string
  ruleType: "all_grades" | "include_only" | "exclude_only"
  gradeIds: string[]
}

/**
 * Hook: Update eligibility rule for a club
 */
export function useUpdateClubEligibilityRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ clubId, ruleType, gradeIds }: UpdateEligibilityRuleInput) => {
      const res = await fetch(`/api/admin/clubs/${clubId}/eligibility-rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleType, gradeIds }),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(error.message || `API error: ${res.status}`)
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "clubs"] })
      queryClient.invalidateQueries({ queryKey: ["clubs"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "clubs", variables.clubId] })
    },
  })
}

// ============================================
// Club Enrollments Hooks
// ============================================

export interface ClubMonthlyPayment {
  id: string
  month: number
  year: number
  amount: number
  isPaid: boolean
  paidAt: string | null
  clubPaymentId: string | null
}

export interface ClubEnrollmentWithPayments {
  id: string
  clubId: string
  status: string
  enrolledAt: string
  startMonth: number | null
  startYear: number | null
  totalMonths: number | null
  totalFee: number | null
  studentProfile: {
    id: string
    person: {
      firstName: string
      lastName: string
    }
  }
  enroller: {
    id: string
    name: string | null
  }
  payments: Array<{
    id: string
    amount: number
    method: string
    status: string
    receiptNumber: string
    recordedAt: string
  }>
  monthlyPayments: ClubMonthlyPayment[]
}

/**
 * Hook: Fetch enrollments for a specific club
 */
export function useClubEnrollments(clubId: string | null) {
  return useQuery({
    queryKey: ["admin", "clubs", clubId, "enrollments"],
    queryFn: () => fetchApi<ClubEnrollmentWithPayments[]>(`/api/admin/clubs/${clubId}/enrollments`),
    staleTime: 30 * 1000,
    enabled: !!clubId,
  })
}

interface MarkMonthlyPaymentPaidInput {
  clubId: string
  enrollmentId: string
  paymentId: string
  method: "cash" | "orange_money"
  notes?: string
}

/**
 * Hook: Mark a monthly payment as paid
 */
export function useMarkMonthlyPaymentPaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ clubId, enrollmentId, paymentId, method, notes }: MarkMonthlyPaymentPaidInput) => {
      const res = await fetch(
        `/api/admin/clubs/${clubId}/enrollments/${enrollmentId}/monthly-payments/${paymentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method, notes }),
        }
      )
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(error.message || `API error: ${res.status}`)
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "clubs", variables.clubId, "enrollments"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "clubs"] })
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
  paymentType: "tuition" | "club"
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
      dateOfBirth: string | null
      guardianName: string | null
      guardianPhone: string | null
      guardianEmail: string | null
    } | null
    grade: {
      id: string
      name: string
    } | null
  } | null
  clubEnrollment: {
    id: string
    club: {
      id: string
      name: string
      nameFr: string | null
      fee: number | null
      monthlyFee: number | null
    }
    student: {
      id: string
      firstName: string
      lastName: string
      dateOfBirth: string | null
      guardianName: string | null
      guardianPhone: string | null
      guardianEmail: string | null
      photoUrl: string | null
    }
    studentNumber: string
    studentProfile: {
      id: string
      studentNumber: string
      person: {
        id: string
        firstName: string
        lastName: string
        dateOfBirth: string | null
        email: string | null
        phone: string | null
        photoUrl: string | null
        gender: "male" | "female" | null
      }
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
  reversed?: {
    count: number
    amount: number
  }
  confirmedThisWeek: {
    count: number
    amount: number
  }
  byMethod: Record<string, { count: number; amount: number }>
  byType?: {
    tuition: { count: number; amount: number }
    club: { count: number; amount: number }
  }
  allTime?: {
    cash: { count: number; amount: number }
    orange_money: { count: number; amount: number }
  }
  filterApplied?: boolean
  filterRange?: {
    startDate: string | null
    endDate: string | null
  } | null
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
 * @param filters - Optional date filters to scope stats
 */
export function usePaymentStats(filters?: PaymentStatsFilters) {
  const url = buildUrl("/api/payments/stats", { ...filters })

  return useQuery({
    queryKey: queryKeys.paymentStats(filters),
    queryFn: () => fetchApi<PaymentStats>(url),
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
