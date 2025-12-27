/**
 * Enrollment System Validation Schemas (Zod)
 *
 * These schemas are used for form validation in the enrollment wizard.
 */

import { z } from "zod"

// ============================================================================
// Step 1: Grade Selection Schema
// ============================================================================

export const gradeSelectionSchema = z.object({
  schoolYearId: z.string().min(1, "School year is required"),
  gradeId: z.string().min(1, "Grade is required"),
  level: z.enum(["elementary", "college", "high_school"], {
    required_error: "School level is required",
  }),
})

export type GradeSelectionFormData = z.infer<typeof gradeSelectionSchema>

// ============================================================================
// Step 2: Student Information Schema
// ============================================================================

export const studentInfoSchema = z
  .object({
    isReturningStudent: z.boolean(),
    studentId: z.string().optional(),

    // Personal info
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(100, "First name must be less than 100 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(100, "Last name must be less than 100 characters"),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["male", "female"]).optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    photoUrl: z.string().url().optional().or(z.literal("")),
    birthCertificateUrl: z.string().url().optional().or(z.literal("")),

    // Parent info - at least one parent name required
    fatherName: z.string().optional(),
    fatherPhone: z.string().optional(),
    fatherEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
    motherName: z.string().optional(),
    motherPhone: z.string().optional(),
    motherEmail: z.string().email("Invalid email address").optional().or(z.literal("")),

    // Address
    address: z.string().optional(),

    // Notes
    notes: z
      .array(
        z.object({
          title: z.string().min(1, "Note title is required"),
          content: z.string().min(1, "Note content is required"),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      // At least one parent name is required
      return (data.fatherName && data.fatherName.length > 0) || (data.motherName && data.motherName.length > 0)
    },
    {
      message: "At least one parent name is required (father or mother)",
      path: ["fatherName"],
    }
  )
  .refine(
    (data) => {
      // At least one phone number is required
      return (
        (data.phone && data.phone.length > 0) ||
        (data.fatherPhone && data.fatherPhone.length > 0) ||
        (data.motherPhone && data.motherPhone.length > 0)
      )
    },
    {
      message: "At least one phone number is required (student, father, or mother)",
      path: ["phone"],
    }
  )

export type StudentInfoFormData = z.infer<typeof studentInfoSchema>

// ============================================================================
// Step 3: Payment Breakdown Schema
// ============================================================================

export const paymentBreakdownSchema = z.object({
  originalTuitionFee: z.number().positive("Tuition fee must be positive"),
  adjustedTuitionFee: z.number().positive("Adjusted fee must be positive").optional(),
  adjustmentReason: z.string().optional(),
}).refine(
  (data) => {
    // If adjusted fee is set, reason is required
    if (data.adjustedTuitionFee && data.adjustedTuitionFee !== data.originalTuitionFee) {
      return data.adjustmentReason && data.adjustmentReason.length > 0
    }
    return true
  },
  {
    message: "Reason is required when adjusting the tuition fee",
    path: ["adjustmentReason"],
  }
)

export type PaymentBreakdownFormData = z.infer<typeof paymentBreakdownSchema>

// ============================================================================
// Step 4: Payment Transaction Schema
// ============================================================================

export const paymentTransactionSchema = z
  .object({
    skipPayment: z.boolean(),
    amount: z.number().positive("Amount must be positive").optional(),
    method: z.enum(["cash", "orange_money"]).optional(),
    receiptNumber: z.string().optional(),
    transactionRef: z.string().optional(),
    receiptImageUrl: z.string().optional(),
  })
  .refine(
    (data) => {
      // If not skipping, amount and method are required
      if (!data.skipPayment) {
        return data.amount && data.amount > 0 && data.method
      }
      return true
    },
    {
      message: "Amount and payment method are required",
      path: ["amount"],
    }
  )
  .refine(
    (data) => {
      // If not skipping, receipt number is required
      if (!data.skipPayment && data.amount && data.amount > 0) {
        return data.receiptNumber && data.receiptNumber.length > 0
      }
      return true
    },
    {
      message: "Receipt number is required",
      path: ["receiptNumber"],
    }
  )

export type PaymentTransactionFormData = z.infer<typeof paymentTransactionSchema>

// ============================================================================
// Enrollment Note Schema
// ============================================================================

export const enrollmentNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().min(1, "Content is required").max(2000, "Content must be less than 2000 characters"),
})

export type EnrollmentNoteFormData = z.infer<typeof enrollmentNoteSchema>

// ============================================================================
// Student Search Schema
// ============================================================================

export const studentSearchSchema = z.object({
  query: z.string().min(2, "Search query must be at least 2 characters"),
})

export type StudentSearchFormData = z.infer<typeof studentSearchSchema>

// ============================================================================
// Complete Enrollment Schema (for API submission)
// ============================================================================

export const enrollmentSubmissionSchema = z.object({
  schoolYearId: z.string().min(1),
  gradeId: z.string().min(1),
  studentId: z.string().optional(),
  isReturningStudent: z.boolean(),

  // Student info
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  photoUrl: z.string().optional(),
  birthCertificateUrl: z.string().optional(),

  // Parent info
  fatherName: z.string().optional(),
  fatherPhone: z.string().optional(),
  fatherEmail: z.string().email().optional().or(z.literal("")),
  motherName: z.string().optional(),
  motherPhone: z.string().optional(),
  motherEmail: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),

  // Financial
  originalTuitionFee: z.number().positive(),
  adjustedTuitionFee: z.number().positive().optional(),
  adjustmentReason: z.string().optional(),

  // Notes
  notes: z
    .array(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    )
    .optional(),
})

export type EnrollmentSubmissionData = z.infer<typeof enrollmentSubmissionSchema>

// ============================================================================
// Payment Submission Schema
// ============================================================================

export const paymentSubmissionSchema = z.object({
  enrollmentId: z.string().min(1),
  amount: z.number().positive(),
  method: z.enum(["cash", "orange_money"]),
  receiptNumber: z.string().min(1),
  transactionRef: z.string().optional(),
  receiptImageUrl: z.string().optional(),
  notes: z.string().optional(),
})

export type PaymentSubmissionData = z.infer<typeof paymentSubmissionSchema>

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validate a Guinean phone number
 * Guinea phone numbers: +224 or 00224 followed by 9 digits
 * Or just 9 digits starting with 6 (mobile)
 */
export function isValidGuineaPhone(phone: string): boolean {
  if (!phone) return true // Optional
  const cleaned = phone.replace(/[\s\-\(\)]/g, "")
  // +224 or 00224 prefix
  if (cleaned.startsWith("+224") || cleaned.startsWith("00224")) {
    const number = cleaned.replace(/^\+224|^00224/, "")
    return /^[6-9]\d{8}$/.test(number)
  }
  // Just the number
  return /^[6-9]\d{8}$/.test(cleaned)
}

/**
 * Format amount in GNF (Guinean Francs)
 */
export function formatGNF(amount: number): string {
  return new Intl.NumberFormat("fr-GN", {
    style: "currency",
    currency: "GNF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Parse GNF string back to number
 */
export function parseGNF(value: string): number {
  return parseInt(value.replace(/[^\d]/g, ""), 10) || 0
}
