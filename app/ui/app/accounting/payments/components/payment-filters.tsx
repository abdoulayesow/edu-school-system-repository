"use client"

import { Search, X, BanknoteIcon, Smartphone, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import type { PaymentFilters } from "../hooks/use-payment-filters"
import { PaymentSearch } from "./payment-search"

interface PaymentFiltersProps {
  filters: PaymentFilters
  onFilterChange: <K extends keyof PaymentFilters>(key: K, value: PaymentFilters[K]) => void
  onClearFilters: () => void
  onQuickDateRange: (range: "today" | "week" | "month" | "all") => void
  activeFilterCount: number
  grades: Array<{ id: string; name: string }>
  isVisible?: boolean
}

export function PaymentFiltersPanel({
  filters,
  onFilterChange,
  onClearFilters,
  onQuickDateRange,
  activeFilterCount,
  grades,
  isVisible = true
}: PaymentFiltersProps) {
  const { t } = useI18n()

  return (
    <Card
      className={cn(
        "border shadow-sm transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      role="search"
      aria-label={t.accounting.filterPanel}
    >
      <CardContent className="pt-5 pb-4 px-6">
        <div className="flex flex-col gap-5">
          {/* Header with Search and Active Filter Count */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Search className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-semibold text-foreground">
                {t.accounting.filterPayments}
              </span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="animate-in fade-in slide-in-from-left-2 duration-300">
                  {activeFilterCount} {t.accounting.activeFilters}
                </Badge>
              )}
            </div>

            {/* Quick Date Presets */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t.accounting.selectDateRange}:</span>
              <div className="flex rounded-lg border bg-muted/30 p-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-3 text-xs rounded-md transition-all duration-200",
                    !filters.startDate && !filters.endDate
                      ? "bg-background shadow-sm font-semibold scale-105"
                      : "hover:bg-background/50 hover:scale-105"
                  )}
                  onClick={() => onQuickDateRange("all")}
                >
                  {t.accounting.all}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-3 text-xs rounded-md transition-all duration-200",
                    filters.startDate === new Date().toISOString().split("T")[0] &&
                    filters.endDate === new Date().toISOString().split("T")[0]
                      ? "bg-background shadow-sm font-semibold scale-105"
                      : "hover:bg-background/50 hover:scale-105"
                  )}
                  onClick={() => onQuickDateRange("today")}
                >
                  {t.accounting.today}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs rounded-md transition-all duration-200 hover:bg-background/50 hover:scale-105"
                  onClick={() => onQuickDateRange("week")}
                >
                  {t.accounting.sevenDays}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs rounded-md transition-all duration-200 hover:bg-background/50 hover:scale-105"
                  onClick={() => onQuickDateRange("month")}
                >
                  {t.accounting.thisMonth}
                </Button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <PaymentSearch
            value={filters.search}
            onChange={(value) => onFilterChange("search", value)}
            placeholder={t.accounting.searchPlaceholder}
          />

          {/* Filter Controls */}
          <div className="flex items-end gap-3 overflow-x-auto pb-2 -mb-2">
            <style jsx>{`
              div::-webkit-scrollbar {
                height: 6px;
              }
              div::-webkit-scrollbar-track {
                background: transparent;
              }
              div::-webkit-scrollbar-thumb {
                background: hsl(var(--muted-foreground) / 0.3);
                border-radius: 3px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: hsl(var(--muted-foreground) / 0.5);
              }
            `}</style>
            {/* Status Filter */}
            <div className="space-y-1.5 shrink-0">
              <Label className="text-xs text-muted-foreground">{t.accounting.filterByStatus}</Label>
              <Select value={filters.status} onValueChange={(value) => onFilterChange("status", value)}>
                <SelectTrigger suppressHydrationWarning
                  className={cn(
                    "w-[160px] h-9 transition-all",
                    filters.status !== "all" && "border-primary/50 bg-primary/5 shadow-sm"
                  )}
                >
                  <SelectValue placeholder={t.accounting.allStatuses} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.accounting.allStatuses}</SelectItem>
                  <SelectItem value="confirmed">
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      {t.accounting.confirmed}
                    </span>
                  </SelectItem>
                  <SelectItem value="reversed">
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-orange-500" />
                      {t.accounting.reversed}
                    </span>
                  </SelectItem>
                  <SelectItem value="failed">
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-red-500" />
                      {t.accounting.failed}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Method Filter */}
            <div className="space-y-1.5 shrink-0">
              <Label className="text-xs text-muted-foreground">{t.accounting.filterByMethod}</Label>
              <Select value={filters.method} onValueChange={(value) => onFilterChange("method", value)}>
                <SelectTrigger suppressHydrationWarning
                  className={cn(
                    "w-[160px] h-9 transition-all",
                    filters.method !== "all" && "border-primary/50 bg-primary/5 shadow-sm"
                  )}
                >
                  <SelectValue placeholder={t.accounting.allMethods} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.accounting.allMethods}</SelectItem>
                  <SelectItem value="cash">
                    <span className="flex items-center gap-2">
                      <BanknoteIcon className="size-3 text-emerald-600" />
                      {t.accounting.cashPayments}
                    </span>
                  </SelectItem>
                  <SelectItem value="orange_money">
                    <span className="flex items-center gap-2">
                      <Smartphone className="size-3 text-orange-500" />
                      {t.accounting.orangeMoneyPayments}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Type Filter - Enhanced */}
            <div className="space-y-1.5 shrink-0">
              <Label
                className={cn(
                  "text-xs font-semibold flex items-center gap-1.5",
                  filters.paymentType !== "all"
                    ? filters.paymentType === "tuition"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-purple-600 dark:text-purple-400"
                    : "text-muted-foreground"
                )}
              >
                {filters.paymentType === "tuition" && <BanknoteIcon className="size-3" />}
                {filters.paymentType === "club" && <Sparkles className="size-3" />}
                {t.accounting.filterByType}
              </Label>
              <Select value={filters.paymentType} onValueChange={(value) => onFilterChange("paymentType", value)}>
                <SelectTrigger suppressHydrationWarning
                  className={cn(
                    "w-[180px] h-9 transition-all font-medium",
                    filters.paymentType === "tuition" && "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 shadow-md ring-1 ring-blue-500/20",
                    filters.paymentType === "club" && "border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 shadow-md ring-1 ring-purple-500/20",
                    filters.paymentType === "all" && "border-border"
                  )}
                >
                  <SelectValue placeholder={t.accounting.allTypes} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="flex items-center gap-2 font-medium">
                      {t.accounting.allTypes}
                    </span>
                  </SelectItem>
                  <SelectItem value="tuition">
                    <span className="flex items-center gap-2 font-medium">
                      <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/50">
                        <BanknoteIcon className="size-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-blue-700 dark:text-blue-300">
                        {t.accounting.tuitionPayments}
                      </span>
                    </span>
                  </SelectItem>
                  <SelectItem value="club">
                    <span className="flex items-center gap-2 font-medium">
                      <div className="p-1 rounded bg-purple-100 dark:bg-purple-900/50">
                        <Sparkles className="size-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-purple-700 dark:text-purple-300">
                        {t.accounting.clubPayments}
                      </span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Grade Filter */}
            <div className="space-y-1.5 shrink-0">
              <Label className="text-xs text-muted-foreground">{t.accounting.filterByGrade}</Label>
              <Select value={filters.grade} onValueChange={(value) => onFilterChange("grade", value)}>
                <SelectTrigger suppressHydrationWarning
                  className={cn(
                    "w-[160px] h-9 transition-all",
                    filters.grade !== "all" && "border-primary/50 bg-primary/5 shadow-sm"
                  )}
                >
                  <SelectValue placeholder={t.accounting.allGrades} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.accounting.allGrades}</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Balance Status Filter */}
            <div className="space-y-1.5 shrink-0">
              <Label className="text-xs text-muted-foreground">{t.accounting.filterByBalance}</Label>
              <Select value={filters.balanceStatus} onValueChange={(value) => onFilterChange("balanceStatus", value)}>
                <SelectTrigger suppressHydrationWarning
                  className={cn(
                    "w-[180px] h-9 transition-all",
                    filters.balanceStatus !== "all" && "border-primary/50 bg-primary/5 shadow-sm"
                  )}
                >
                  <SelectValue placeholder={t.accounting.allBalances} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.accounting.allBalances}</SelectItem>
                  <SelectItem value="outstanding">
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-amber-500" />
                      {t.accounting.outstandingBalance}
                    </span>
                  </SelectItem>
                  <SelectItem value="paid_up">
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      {t.accounting.paidUp}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            <div className="space-y-1.5 shrink-0">
              <Label className="text-xs text-muted-foreground">{t.accounting.customRange}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => onFilterChange("startDate", e.target.value)}
                  className={cn(
                    "w-[130px] h-9 transition-all",
                    filters.startDate && "border-primary/50 bg-primary/5 shadow-sm"
                  )}
                  aria-label={t.accounting.startDate}
                />
                <span className="text-muted-foreground text-sm">→</span>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => onFilterChange("endDate", e.target.value)}
                  className={cn(
                    "w-[130px] h-9 transition-all",
                    filters.endDate && "border-primary/50 bg-primary/5 shadow-sm"
                  )}
                  aria-label={t.accounting.endDate}
                />
              </div>
            </div>

            {/* Clear All */}
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-9 text-muted-foreground hover:text-destructive transition-colors animate-in fade-in slide-in-from-right-2 duration-300"
              >
                <X className="size-3 mr-1" />
                {t.accounting.clearFilters}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
