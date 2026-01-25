"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { sizing } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

export interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  /** Optional className for the icon (defaults to muted-foreground) */
  iconClassName?: string
  /** Optional className for the card */
  className?: string
}

/**
 * Reusable stat card component following GSPN brand guidelines.
 * Used for summary statistics at the top of pages.
 *
 * @example
 * <StatCard
 *   title="Total Students"
 *   value={150}
 *   description="Active enrollments"
 *   icon={Users}
 * />
 */
export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("py-5", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 bg-gspn-maroon-500/10 rounded-lg">
          <Icon className={cn(sizing.icon.lg, "text-gspn-maroon-500", iconClassName)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
