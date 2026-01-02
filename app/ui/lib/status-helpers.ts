/**
 * Status helper functions for consistent table row coloring
 * Maps domain-specific statuses to table row status variants
 */

export type RowStatus = 'success' | 'warning' | 'error' | 'info' | 'gold' | 'none'

/**
 * Get row status for enrollment records
 * - completed → success (green)
 * - submitted, needs_review → warning (amber)
 * - rejected, cancelled → error (red)
 * - draft → info (blue)
 */
export function getEnrollmentRowStatus(status: string): RowStatus {
  const map: Record<string, RowStatus> = {
    completed: 'success',
    submitted: 'warning',
    needs_review: 'warning',
    rejected: 'error',
    cancelled: 'error',
    draft: 'info',
  }
  return map[status] || 'none'
}

/**
 * Get row status for payment records
 * - confirmed → success (green)
 * - pending_deposit, deposited, pending_review → warning (amber)
 * - rejected → error (red)
 */
export function getPaymentRowStatus(status: string): RowStatus {
  const map: Record<string, RowStatus> = {
    confirmed: 'success',
    pending_deposit: 'warning',
    deposited: 'warning',
    pending_review: 'warning',
    rejected: 'error',
  }
  return map[status] || 'none'
}

/**
 * Get row status for expense records
 * - paid → success (green)
 * - pending → warning (amber)
 * - approved → info (blue)
 * - rejected → error (red)
 */
export function getExpenseRowStatus(status: string): RowStatus {
  const map: Record<string, RowStatus> = {
    paid: 'success',
    pending: 'warning',
    approved: 'info',
    rejected: 'error',
  }
  return map[status] || 'none'
}

/**
 * Get row status for user records
 * - active → success (green)
 * - invited → warning (amber)
 * - inactive → error (red)
 */
export function getUserRowStatus(status: string): RowStatus {
  const map: Record<string, RowStatus> = {
    active: 'success',
    invited: 'warning',
    inactive: 'error',
  }
  return map[status] || 'none'
}

/**
 * Get row status for teacher records
 * - active → success (green)
 * - inactive → error (red)
 */
export function getTeacherRowStatus(status: string): RowStatus {
  return status === 'active' ? 'success' : status === 'inactive' ? 'error' : 'none'
}

/**
 * Get row status for student records based on payment and attendance
 * Priority: payment status > attendance status
 * - late payment → error (red)
 * - complete payment → success (green)
 * - critical attendance → error (red)
 * - concerning attendance → warning (amber)
 */
export function getStudentRowStatus(
  paymentStatus?: string,
  attendanceStatus?: string
): RowStatus {
  // Payment status takes priority
  if (paymentStatus === 'late') return 'error'
  if (paymentStatus === 'complete') return 'success'

  // Fall back to attendance status
  if (attendanceStatus === 'critical') return 'error'
  if (attendanceStatus === 'concerning') return 'warning'

  return 'none'
}
