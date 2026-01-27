"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { sizing, interactive } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

/** Color variants for semantic stat cards */
export type StatCardVariant =
  | "default"   // Maroon - neutral/brand
  | "success"   // Emerald - positive/confirmed
  | "warning"   // Orange - caution/pending
  | "danger"    // Red - negative/failed
  | "info"      // Blue - informational
  | "gold"      // Gold - totals/highlights

/** Variant color configurations */
const variantStyles: Record<StatCardVariant, {
  accentBar: string
  indicatorDot: string
  iconBg: string
  iconColor: string
  gradient: string
  hoverGlow: string
  valueColor?: string
}> = {
  default: {
    accentBar: "bg-gspn-maroon-500",
    indicatorDot: "bg-gspn-maroon-500",
    iconBg: "bg-gspn-maroon-500/10 dark:bg-gspn-maroon-500/20",
    iconColor: "text-gspn-maroon-500",
    gradient: "from-gspn-maroon-50/30 to-transparent dark:from-gspn-maroon-950/10",
    hoverGlow: "hover:shadow-gspn-maroon-500/10",
  },
  success: {
    accentBar: "bg-emerald-500",
    indicatorDot: "bg-emerald-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    gradient: "from-emerald-50/50 to-transparent dark:from-emerald-950/20",
    hoverGlow: "hover:shadow-emerald-500/10",
    valueColor: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    accentBar: "bg-orange-500",
    indicatorDot: "bg-orange-500",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600 dark:text-orange-400",
    gradient: "from-orange-50/50 to-transparent dark:from-orange-950/20",
    hoverGlow: "hover:shadow-orange-500/10",
    valueColor: "text-orange-600 dark:text-orange-400",
  },
  danger: {
    accentBar: "bg-red-500",
    indicatorDot: "bg-red-500",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    gradient: "from-red-50/50 to-transparent dark:from-red-950/20",
    hoverGlow: "hover:shadow-red-500/10",
    valueColor: "text-red-600 dark:text-red-400",
  },
  info: {
    accentBar: "bg-blue-500",
    indicatorDot: "bg-blue-500",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-50/50 to-transparent dark:from-blue-950/20",
    hoverGlow: "hover:shadow-blue-500/10",
    valueColor: "text-blue-600 dark:text-blue-400",
  },
  gold: {
    accentBar: "bg-gspn-gold-500",
    indicatorDot: "bg-gspn-gold-500",
    iconBg: "bg-gspn-gold-100 dark:bg-gspn-gold-900/30",
    iconColor: "text-gspn-gold-600 dark:text-gspn-gold-400",
    gradient: "from-gspn-gold-50/50 to-transparent dark:from-gspn-gold-950/20",
    hoverGlow: "hover:shadow-gspn-gold-500/10",
    valueColor: "text-gspn-gold-600 dark:text-gspn-gold-400",
  },
}

export interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  /** Color variant for semantic meaning (default: "default" = maroon) */
  variant?: StatCardVariant
  /** Show colored accent bar at top (default: false for backward compat) */
  showAccentBar?: boolean
  /** Show gradient background overlay (default: false for backward compat) */
  gradient?: boolean
  /** Show indicator dot next to title (default: false for backward compat) */
  showIndicator?: boolean
  /** Apply colored value text matching variant (default: false) */
  coloredValue?: boolean
  /** Optional className for the icon */
  iconClassName?: string
  /** Optional className for the card */
  className?: string
}

/**
 * Reusable stat card component following GSPN brand guidelines.
 * Used for summary statistics at the top of pages.
 *
 * @example
 * // Basic usage (backward compatible)
 * <StatCard
 *   title="Total Students"
 *   value={150}
 *   description="Active enrollments"
 *   icon={Users}
 * />
 *
 * @example
 * // Themed card for accounting
 * <StatCard
 *   title="Confirmed Payments"
 *   value="1,234,000 GNF"
 *   description="12 transactions"
 *   icon={TrendingUp}
 *   variant="success"
 *   showAccentBar
 *   gradient
 *   showIndicator
 *   coloredValue
 * />
 */
export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
  showAccentBar = false,
  gradient = false,
  showIndicator = false,
  coloredValue = false,
  iconClassName,
  className,
}: StatCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card className={cn(
      "overflow-hidden relative",
      showAccentBar && "border shadow-sm",
      gradient && interactive.card,
      gradient && styles.hoverGlow,
      !showAccentBar && !gradient && "py-5",
      className
    )}>
      {/* Accent bar */}
      {showAccentBar && <div className={cn("h-1", styles.accentBar)} />}

      {/* Gradient overlay */}
      {gradient && (
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br pointer-events-none",
          styles.gradient
        )} />
      )}

      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0 pb-2 relative",
        showAccentBar && "pt-4"
      )}>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {showIndicator && (
            <div className={cn("h-2 w-2 rounded-full", styles.indicatorDot)} />
          )}
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-lg", styles.iconBg)}>
          <Icon className={cn(sizing.icon.lg, styles.iconColor, iconClassName)} />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className={cn(
          "text-2xl font-bold",
          coloredValue && styles.valueColor
        )}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
