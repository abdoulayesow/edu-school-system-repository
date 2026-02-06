/**
 * Shared search utilities for building Prisma query conditions.
 * Handles multi-word searches across name fields.
 */

type SearchMode = "insensitive" | "default"

interface NameSearchOptions {
  /** Include firstName field in search */
  firstName?: boolean
  /** Include lastName field in search */
  lastName?: boolean
  /** Include middleName field (nested in enrollments) */
  middleName?: boolean
  /** Include studentNumber field */
  studentNumber?: boolean
  /** Include enrollmentNumber field */
  enrollmentNumber?: boolean
  /** Case sensitivity mode */
  mode?: SearchMode
}

/**
 * Builds Prisma WHERE conditions for searching across name fields.
 * Handles multi-word queries like "John Doe" by requiring ALL terms
 * to match across ANY of the specified name fields.
 *
 * @example Single word: "John"
 * // Returns: { OR: [{ firstName: contains "John" }, { lastName: contains "John" }] }
 *
 * @example Multi-word: "John Doe"
 * // Returns: { AND: [
 * //   { OR: [{ firstName: contains "John" }, { lastName: contains "John" }] },
 * //   { OR: [{ firstName: contains "Doe" }, { lastName: contains "Doe" }] }
 * // ]}
 *
 * @param search - The search query string
 * @param options - Which fields to search and options
 * @returns Prisma WHERE condition object
 */
export function buildNameSearchConditions(
  search: string,
  options: NameSearchOptions = {}
): Record<string, unknown> {
  const {
    firstName = true,
    lastName = true,
    middleName = false,
    studentNumber = false,
    enrollmentNumber = false,
    mode = "insensitive",
  } = options

  const trimmed = search.trim()
  if (!trimmed) return {}

  const terms = trimmed.split(/\s+/).filter(Boolean)

  // Build field conditions for a single term
  const buildTermConditions = (term: string): Record<string, unknown>[] => {
    const conditions: Record<string, unknown>[] = []

    if (firstName) {
      conditions.push({ firstName: { contains: term, mode } })
    }
    if (lastName) {
      conditions.push({ lastName: { contains: term, mode } })
    }
    if (middleName) {
      conditions.push({
        enrollments: {
          some: { middleName: { contains: term, mode } },
        },
      })
    }
    if (studentNumber) {
      conditions.push({ studentNumber: { contains: term, mode } })
    }
    if (enrollmentNumber) {
      conditions.push({ enrollmentNumber: { contains: term, mode } })
    }

    return conditions
  }

  if (terms.length === 1) {
    // Single term: match any field
    return { OR: buildTermConditions(terms[0]) }
  }

  // Multiple terms: ALL terms must match (each can match any field)
  return {
    AND: terms.map((term) => ({
      OR: buildTermConditions(term),
    })),
  }
}

/**
 * Builds search conditions for nested student fields.
 * Use when searching students through a relation (e.g., enrollment.student).
 *
 * @param search - The search query string
 * @param options - Which fields to search
 * @returns Prisma WHERE condition for nested student object
 */
export function buildNestedStudentSearchConditions(
  search: string,
  options: Omit<NameSearchOptions, "middleName" | "enrollmentNumber"> = {}
): Record<string, unknown> {
  const {
    firstName = true,
    lastName = true,
    studentNumber = false,
    mode = "insensitive",
  } = options

  const trimmed = search.trim()
  if (!trimmed) return {}

  const terms = trimmed.split(/\s+/).filter(Boolean)

  const buildTermConditions = (term: string): Record<string, unknown>[] => {
    const conditions: Record<string, unknown>[] = []

    if (firstName) {
      conditions.push({ firstName: { contains: term, mode } })
    }
    if (lastName) {
      conditions.push({ lastName: { contains: term, mode } })
    }
    if (studentNumber) {
      conditions.push({ studentNumber: { contains: term, mode } })
    }

    return conditions
  }

  if (terms.length === 1) {
    return { student: { OR: buildTermConditions(terms[0]) } }
  }

  return {
    student: {
      AND: terms.map((term) => ({
        OR: buildTermConditions(term),
      })),
    },
  }
}
