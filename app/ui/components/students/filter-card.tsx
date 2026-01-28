"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface FilterCardProps {
  /** Title shown in the card header */
  title: string
  /** Filter controls (inputs, selects, etc.) */
  children: React.ReactNode
  /** Callback when clear filters is clicked */
  onClearFilters?: () => void
  /** Whether to show the clear filters button */
  showClear?: boolean
  /** Label for the clear filters button */
  clearLabel?: string
  /** Optional className for the card */
  className?: string
}

/**
 * Reusable filter card component following GSPN brand guidelines.
 * Wraps filter controls with consistent styling and clear filters functionality.
 *
 * @example
 * <FilterCard
 *   title="Filter Students"
 *   showClear={hasActiveFilters}
 *   onClearFilters={clearFilters}
 *   clearLabel="Clear filters"
 * >
 *   <div className="flex gap-4">
 *     <Input placeholder="Search..." />
 *     <Select>...</Select>
 *   </div>
 * </FilterCard>
 */
export function FilterCard({
  title,
  children,
  onClearFilters,
  showClear = false,
  clearLabel = "Clear filters",
  className,
}: FilterCardProps) {
  return (
    <Card className={cn("mb-6 py-2", className)}>
      <CardHeader className="pb-1 px-6 pt-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
          <CardTitle className="text-sm">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-2 px-6">
        {children}

        {showClear && onClearFilters && (
          <div className="mt-2">
            <button
              onClick={onClearFilters}
              className="text-sm text-gspn-maroon-500 hover:text-gspn-maroon-600 hover:underline cursor-pointer transition-colors"
            >
              {clearLabel}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
