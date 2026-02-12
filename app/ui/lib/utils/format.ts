// ============================================================================
// FORMAT UTILITIES
// Shared formatting helpers used across the application
// ============================================================================

const gnfFormatter = new Intl.NumberFormat("fr-GN", {
  style: "currency",
  currency: "GNF",
  minimumFractionDigits: 0,
})

/**
 * Format a number as Guinean Franc (GNF) currency.
 */
export function formatGNF(amount: number): string {
  return gnfFormatter.format(amount)
}
