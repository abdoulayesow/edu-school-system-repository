/**
 * Feature Flags Configuration
 *
 * Controls feature availability via environment variables.
 * Environment variables must use NEXT_PUBLIC_ prefix to be accessible in client components.
 */

/**
 * Phase 4 Grading Features Toggle
 *
 * Controls visibility and access to:
 * - Grade Entry page (/grades/entry)
 * - Bulletins page (/grades/bulletin)
 * - Class Ranking page (/grades/ranking)
 * - Teacher Remarks page (/grades/remarks)
 * - Conduct & Attendance page (/grades/conduct)
 * - Bulk calculation operations in trimester admin
 *
 * Set NEXT_PUBLIC_ENABLE_GRADING_FEATURES=false to disable these features.
 * Default: true (features enabled)
 *
 * @example
 * // .env.local
 * NEXT_PUBLIC_ENABLE_GRADING_FEATURES=true
 */
export const isGradingFeaturesEnabled =
  process.env.NEXT_PUBLIC_ENABLE_GRADING_FEATURES !== "false"
