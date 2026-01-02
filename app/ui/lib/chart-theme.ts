/**
 * Centralized chart color configuration for Recharts
 * Uses CSS custom properties for consistency with the design system
 */

/**
 * Primary chart color palette
 * Maps to CSS variables defined in globals.css
 */
export const chartColors = {
  primary: "hsl(var(--chart-1))",   // Maroon
  secondary: "hsl(var(--chart-2))", // Gold
  tertiary: "hsl(var(--chart-3))",  // Black
  success: "hsl(var(--chart-4))",   // Green
  warning: "hsl(var(--chart-5))",   // Amber
  purple: "hsl(var(--chart-6))",    // Purple (extended)
  blue: "hsl(var(--chart-7))",      // Blue (extended)
  brown: "hsl(var(--chart-8))",     // Brown (extended)
} as const

/**
 * Payment method specific colors
 * Used for pie charts and legends showing payment breakdown
 */
export const paymentMethodColors = {
  cash: "hsl(var(--chart-1))",        // Maroon
  orange_money: "hsl(var(--chart-2))", // Gold
} as const

/**
 * Status-based colors for charts
 * Used for showing payment/enrollment status distributions
 */
export const statusColors = {
  confirmed: "hsl(var(--success))",
  completed: "hsl(var(--success))",
  pending: "hsl(var(--warning))",
  rejected: "hsl(var(--destructive))",
  draft: "hsl(var(--muted))",
} as const

/**
 * Get an array of chart colors for multi-series data
 * Cycles through the palette if more colors are needed than available
 */
export function getChartColorArray(count: number): string[] {
  const colors = Object.values(chartColors)
  return Array.from({ length: count }, (_, i) => colors[i % colors.length])
}

/**
 * Get color by index from the chart palette
 */
export function getChartColor(index: number): string {
  const colors = Object.values(chartColors)
  return colors[index % colors.length]
}

/**
 * ChartConfig type for use with shadcn/ui Chart components
 */
export type ChartColorKey = keyof typeof chartColors
