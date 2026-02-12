// ============================================================================
// GRADING UTILITIES
// Shared utility functions for grading-related pages and components
// ============================================================================

import type { DecisionType } from "@/lib/types/grading"

/**
 * Decision configuration for styling and icons
 */
export interface DecisionConfig {
  color: string
  bgColor: string
  iconName: "check-circle" | "alert-triangle" | "x-circle" | "alert-circle"
}

/**
 * Get styling configuration for a decision type
 */
export function getDecisionConfig(decision: DecisionType | null): DecisionConfig {
  switch (decision) {
    case "admis":
      return {
        color: "text-green-700 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        iconName: "check-circle",
      }
    case "rattrapage":
      return {
        color: "text-yellow-700 dark:text-yellow-400",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        iconName: "alert-triangle",
      }
    case "redouble":
      return {
        color: "text-red-700 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        iconName: "x-circle",
      }
    default:
      return {
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        iconName: "alert-circle",
      }
  }
}

/**
 * Calculate decision based on general average
 * - >= 10: admis (promoted)
 * - 8-10: rattrapage (remediation)
 * - < 8: redouble (repeat year)
 */
export function calculateDecision(average: number | null): DecisionType | null {
  if (average === null) return null
  if (average >= 10) return "admis"
  if (average >= 8) return "rattrapage"
  return "redouble"
}

/**
 * Get color class for a score value
 */
export function getScoreColor(score: number | null): string {
  if (score === null) return "text-muted-foreground"
  if (score >= 14) return "text-green-600 dark:text-green-400"
  if (score >= 10) return "text-blue-600 dark:text-blue-400"
  if (score >= 8) return "text-yellow-600 dark:text-yellow-400"
  return "text-red-600 dark:text-red-400"
}

/**
 * Get progress bar color based on completion percentage
 */
export function getProgressColor(progress: number): string {
  if (progress >= 100) return "bg-emerald-500"
  if (progress >= 60) return "bg-gspn-gold-500"
  if (progress > 0) return "bg-amber-500"
  return "bg-muted"
}

/**
 * Decision options for select dropdowns
 */
export const DECISION_OPTIONS: DecisionType[] = ["admis", "rattrapage", "redouble"]
