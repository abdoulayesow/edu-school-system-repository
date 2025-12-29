/**
 * Formats a number as Guinean Franc (GNF) currency
 * Uses French locale for formatting (fr-GN)
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "1 500 000 GNF")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-GN', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
