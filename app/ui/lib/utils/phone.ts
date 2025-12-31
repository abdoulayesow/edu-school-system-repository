/**
 * Phone number formatting utilities for Guinea (+224)
 */

const GUINEA_CODE = "+224"
const EXPECTED_DIGITS = 9 // After country code: XXX XX XX XX

/**
 * Format a phone number to +224 XXX XX XX XX pattern
 * @param value - Raw phone input
 * @returns Formatted phone number
 */
export function formatGuineaPhone(value: string): string {
  // Remove all non-digit characters except +
  let digits = value.replace(/[^\d+]/g, "")

  // Handle country code
  if (digits.startsWith("+224")) {
    digits = digits.slice(4)
  } else if (digits.startsWith("224")) {
    digits = digits.slice(3)
  } else if (digits.startsWith("+")) {
    digits = digits.slice(1)
  }

  // Keep only digits
  digits = digits.replace(/\D/g, "")

  // Limit to expected digits
  digits = digits.slice(0, EXPECTED_DIGITS)

  // Format as XXX XX XX XX
  let formatted = GUINEA_CODE
  if (digits.length > 0) {
    formatted += " " + digits.slice(0, 3)
  }
  if (digits.length > 3) {
    formatted += " " + digits.slice(3, 5)
  }
  if (digits.length > 5) {
    formatted += " " + digits.slice(5, 7)
  }
  if (digits.length > 7) {
    formatted += " " + digits.slice(7, 9)
  }

  return formatted
}

/**
 * Validate if phone number has the expected number of digits
 * @param value - Phone number to validate
 * @returns true if valid (9 digits after country code)
 */
export function isValidGuineaPhone(value: string | undefined | null): boolean {
  if (!value) return false

  // Extract digits only (excluding country code)
  let digits = value.replace(/[^\d]/g, "")

  // Remove country code digits if present
  if (digits.startsWith("224")) {
    digits = digits.slice(3)
  }

  return digits.length === EXPECTED_DIGITS
}

/**
 * Check if phone value is empty or just the default prefix
 * @param value - Phone number to check
 * @returns true if empty or just the default "+224" prefix
 */
export function isPhoneEmpty(value: string | undefined | null): boolean {
  if (!value) return true
  const trimmed = value.trim()
  return trimmed === "" || trimmed === "+224" || trimmed === "+224 "
}

/**
 * Get the raw digits from a formatted phone number (excluding country code)
 * @param value - Formatted phone number
 * @returns Raw digits
 */
export function getPhoneDigits(value: string | undefined | null): string {
  if (!value) return ""

  let digits = value.replace(/[^\d]/g, "")

  if (digits.startsWith("224")) {
    digits = digits.slice(3)
  }

  return digits
}
