import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date according to locale
 * - French (fr): DD/MM/YYYY
 * - English (en): MM/DD/YYYY
 */
export function formatDate(date: Date | string | null | undefined, locale: "en" | "fr" = "fr"): string {
  if (!date) return "-"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "-"

  return d.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/**
 * Format a date with long month name
 * - French (fr): 15 mars 2024
 * - English (en): March 15, 2024
 */
export function formatDateLong(date: Date | string | null | undefined, locale: "en" | "fr" = "fr"): string {
  if (!date) return "-"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "-"

  return d.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Format a date with day name
 * - French (fr): lundi 15 mars 2024
 * - English (en): Monday, March 15, 2024
 */
export function formatDateWithDay(date: Date | string | null | undefined, locale: "en" | "fr" = "fr"): string {
  if (!date) return "-"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "-"

  return d.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}
