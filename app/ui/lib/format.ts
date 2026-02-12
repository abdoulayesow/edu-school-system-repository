export const DISCREPANCY_THRESHOLD = 50_000

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-GN", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatAmountWithCurrency(amount: number): string {
  return formatCurrency(amount) + " GNF"
}
