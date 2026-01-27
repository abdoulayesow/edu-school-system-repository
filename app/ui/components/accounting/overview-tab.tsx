"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  BanknoteIcon,
  Smartphone,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react"
import { PieChart, Pie, ResponsiveContainer, Legend, Tooltip } from "recharts"
import Link from "next/link"
import { useI18n } from "@/components/i18n-provider"
import { typography, interactive, componentClasses } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"
import { formatCurrency, formatAmount } from "./utils"
import type { BalanceData } from "./types"

interface OverviewTabProps {
  balanceData: BalanceData | null
  isLoadingBalance: boolean
}

export function OverviewTab({
  balanceData,
  isLoadingBalance,
}: OverviewTabProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-6">
      {/* Payment Method Breakdown Chart */}
      <Card className="border shadow-sm overflow-hidden">
        <div className="h-1 bg-gspn-maroon-500" />
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            Répartition par méthode de paiement
          </CardTitle>
          <CardDescription>Distribution des paiements confirmés</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBalance ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Pie Chart */}
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Espèces",
                          value: balanceData?.payments.byMethod.cash?.confirmed || 0,
                          fill: "#10b981",
                        },
                        {
                          name: "Orange Money",
                          value: balanceData?.payments.byMethod.orange_money?.confirmed || 0,
                          fill: "#f97316",
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ""
                      }
                      outerRadius={100}
                      dataKey="value"
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value) + " GNF"}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Summary Stats */}
              <div className="flex flex-col justify-center space-y-4">
                {/* Cash Confirmed Card */}
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-950/10 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <BanknoteIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Espèces confirmées</p>
                  </div>
                  <p className={cn(typography.currency.md, "text-emerald-600 dark:text-emerald-400")}>
                    {formatCurrency(balanceData?.payments.byMethod.cash?.confirmed || 0)}
                  </p>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                    {balanceData?.payments.byMethod.cash?.count || 0} transactions
                  </p>
                </div>

                {/* Orange Money Confirmed Card */}
                <div className="rounded-xl border border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-orange-50/50 dark:from-orange-950/30 dark:to-orange-950/10 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <Smartphone className="size-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">Orange Money confirmé</p>
                  </div>
                  <p className={cn(typography.currency.md, "text-orange-600 dark:text-orange-400")}>
                    {formatCurrency(balanceData?.payments.byMethod.orange_money?.confirmed || 0)}
                  </p>
                  <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">
                    {balanceData?.payments.byMethod.orange_money?.count || 0} transactions
                  </p>
                </div>

                {/* Total Confirmed Card - GSPN Gold */}
                <div className="rounded-xl border-2 border-gspn-gold-400 dark:border-gspn-gold-600 bg-gradient-to-br from-gspn-gold-50 via-gspn-gold-50/80 to-amber-50/50 dark:from-gspn-gold-950/40 dark:via-gspn-gold-950/20 dark:to-amber-950/10 p-4 shadow-md hover:shadow-lg transition-shadow">
                  <p className="text-sm font-semibold text-gspn-gold-700 dark:text-gspn-gold-300 mb-2">
                    Total confirmé
                  </p>
                  <p className={cn(typography.currency.lg, "text-gspn-gold-600 dark:text-gspn-gold-400")}>
                    {formatCurrency(
                      (balanceData?.payments.byMethod.cash?.confirmed || 0) +
                      (balanceData?.payments.byMethod.orange_money?.confirmed || 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Breakdown by Payment Method */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className={cn(
          "border shadow-md overflow-hidden relative",
          interactive.card,
          "hover:shadow-emerald-500/10"
        )}>
          <div className="h-1 bg-emerald-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-transparent dark:from-emerald-950/10 pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <BanknoteIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              {t.accounting.byMethod}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {isLoadingBalance ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cash Row */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                      <BanknoteIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-700 dark:text-emerald-300">{t.accounting.cashPayments}</p>
                      <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                        {balanceData?.payments.byMethod.cash?.count || 0} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-700 dark:text-emerald-300">{formatAmount(balanceData?.payments.byMethod.cash?.amount || 0)}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      {formatAmount(balanceData?.payments.byMethod.cash?.confirmed || 0)} confirmé
                    </p>
                  </div>
                </div>
                {/* Orange Money Row */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/40">
                      <Smartphone className="size-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-orange-700 dark:text-orange-300">{t.accounting.orangeMoneyPayments}</p>
                      <p className="text-xs text-orange-600/70 dark:text-orange-400/70">
                        {balanceData?.payments.byMethod.orange_money?.count || 0} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-700 dark:text-orange-300">{formatAmount(balanceData?.payments.byMethod.orange_money?.amount || 0)}</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      {formatAmount(balanceData?.payments.byMethod.orange_money?.confirmed || 0)} confirmé
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Breakdown by Status */}
        <Card className={cn(
          "border shadow-md overflow-hidden relative",
          interactive.card,
          "hover:shadow-gspn-maroon-500/10"
        )}>
          <div className="h-1 bg-gspn-maroon-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-gspn-maroon-50/30 to-transparent dark:from-gspn-maroon-950/10 pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gspn-maroon-100 dark:bg-gspn-maroon-900/30">
                <ClipboardCheck className="size-4 text-gspn-maroon-600 dark:text-gspn-maroon-400" />
              </div>
              {t.accounting.byStatus}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {isLoadingBalance ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Confirmed */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-emerald-500 shadow-sm" />
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{t.accounting.confirmed}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">{formatAmount(balanceData?.payments.byStatus.confirmed?.amount || 0)}</span>
                    <span className="text-xs text-emerald-600/70 dark:text-emerald-400/70 ml-2">({balanceData?.payments.byStatus.confirmed?.count || 0})</span>
                  </div>
                </div>
                {/* Reversed */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/50">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-orange-500 shadow-sm" />
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Annulés</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-orange-700 dark:text-orange-300">{formatAmount(balanceData?.payments.byStatus.reversed?.amount || 0)}</span>
                    <span className="text-xs text-orange-600/70 dark:text-orange-400/70 ml-2">({balanceData?.payments.byStatus.reversed?.count || 0})</span>
                  </div>
                </div>
                {/* Failed */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-red-500 shadow-sm" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">Échoués</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-red-700 dark:text-red-300">{formatAmount(balanceData?.payments.byStatus.failed?.amount || 0)}</span>
                    <span className="text-xs text-red-600/70 dark:text-red-400/70 ml-2">({balanceData?.payments.byStatus.failed?.count || 0})</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Link to full payments page */}
      <div className="flex justify-center">
        <Button asChild className={cn("px-6", componentClasses.primaryActionButton)}>
          <Link href="/accounting/payments">
            {t.accounting.viewAllPayments}
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
