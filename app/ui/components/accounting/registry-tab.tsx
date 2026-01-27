"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  CheckCircle2,
  Clock,
  Loader2,
  Wallet,
  ArrowRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/components/i18n-provider"
import { PermissionGuard } from "@/components/permission-guard"
import { StatCard } from "@/components/students"
import { typography, gradients, interactive, componentClasses } from "@/lib/design-tokens"
import { cn, formatDate } from "@/lib/utils"
import { formatCurrency, formatAmount, getTransactionTypeLabel, useCountUp } from "./utils"
import type { TreasuryBalance, RecentTransaction } from "./types"

interface RegistryTabProps {
  treasuryBalance: TreasuryBalance | null
  recentTransactions: RecentTransaction[]
  isLoadingTreasury: boolean
  isMounted: boolean
  onOpenDailyOpening: () => void
  onOpenDailyClosing: () => void
  onOpenSafeTransfer: () => void
  onOpenVerifyCash: () => void
}

export function RegistryTab({
  treasuryBalance,
  recentTransactions,
  isLoadingTreasury,
  isMounted,
  onOpenDailyOpening,
  onOpenDailyClosing,
  onOpenSafeTransfer,
  onOpenVerifyCash,
}: RegistryTabProps) {
  const { t, locale } = useI18n()
  const reg = t.treasury.registry

  // Animated balance
  const animatedRegistryBalance = useCountUp(treasuryBalance?.registryBalance || 0, 1000, isMounted)

  return (
    <div className="space-y-6">
      {/* Big Registry Balance Display - Enhanced */}
      <Card className={cn(
        "border-2 shadow-xl overflow-hidden relative",
        gradients.registry.light,
        gradients.registry.dark,
        gradients.registry.border,
        interactive.cardEnhanced,
        gradients.registry.glow
      )}>
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />

        <CardContent className="pt-8 pb-8 relative">
          <div className="text-center space-y-4">
            {/* Registry Status Indicator - Enhanced */}
            <div className="flex items-center justify-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30",
                "ring-2 ring-emerald-200 dark:ring-emerald-800",
                "transition-transform duration-300 hover:scale-110"
              )}>
                <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className={cn(
                "text-sm font-semibold uppercase tracking-wider",
                gradients.registry.text
              )}>
                {reg.registryOfTheDay}
              </span>
            </div>

            {/* THE BIG NUMBER with enhanced animation */}
            <div className="space-y-2">
              {isLoadingTreasury ? (
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-muted-foreground" />
              ) : (
                <>
                  <p className={cn(
                    typography.currency.hero,
                    "text-emerald-600 dark:text-emerald-400",
                    "drop-shadow-sm"
                  )}>
                    {formatCurrency(animatedRegistryBalance)}
                  </p>
                  <p className="text-xl font-medium text-emerald-600/60 dark:text-emerald-400/60">GNF</p>
                </>
              )}
            </div>

            {/* Label - Enhanced */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                {reg.registryBalance} ({reg.workingCash})
              </p>
            </div>

            {/* Float Information */}
            {!isLoadingTreasury && treasuryBalance && treasuryBalance.registryBalance > 0 && (
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>
                  {reg.floatAmount}: {formatCurrency(treasuryBalance.registryFloatAmount)} GNF
                </span>
                <span>•</span>
                <span>
                  {t.safe}: {formatCurrency(treasuryBalance.safeBalance)} GNF
                </span>
              </div>
            )}

            {/* Registry Status Indicator */}
            {!isLoadingTreasury && treasuryBalance && (
              <>
                {treasuryBalance.registryBalance === 0 ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{reg.registryClosed}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{reg.registryOpen}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title={reg.todaysEntries}
          value={`+${formatAmount(treasuryBalance?.todaySummary?.in || 0)}`}
          icon={ArrowDownToLine}
          variant="success"
          showAccentBar
          showIndicator
          coloredValue
        />
        <StatCard
          title={reg.todaysExits}
          value={`-${formatAmount(treasuryBalance?.todaySummary?.out || 0)}`}
          icon={ArrowUpFromLine}
          variant="danger"
          showAccentBar
          showIndicator
          coloredValue
        />
        <StatCard
          title={reg.todaysTransactions}
          value={treasuryBalance?.todaySummary?.transactionCount || 0}
          icon={Clock}
          variant="default"
          showAccentBar
          showIndicator
        />
      </div>

      {/* Registry Closed Warning */}
      {treasuryBalance?.registryBalance === 0 && (
        <Alert variant="default" className="border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/20">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">
            {t.treasury.registryClosedTitle}
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300/90">
            {t.treasury.registryClosedMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions - GSPN Brand Styling */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        <PermissionGuard resource="safe_balance" action="update" loading={<div className="h-16 animate-pulse bg-muted rounded-lg" />}>
          <Button
            size="lg"
            variant={treasuryBalance?.registryBalance === 0 ? "default" : "outline"}
            className={cn(
              "h-16 flex-col gap-2 w-full",
              treasuryBalance?.registryBalance === 0 && componentClasses.primaryActionButton
            )}
            onClick={onOpenDailyOpening}
            disabled={treasuryBalance?.registryBalance !== 0}
          >
            <ArrowDownToLine className="h-6 w-6" />
            <span className="text-sm font-medium">
              {treasuryBalance?.registryBalance === 0 ? reg.openDay : reg.alreadyOpen}
            </span>
          </Button>
        </PermissionGuard>

        <PermissionGuard resource="safe_balance" action="update" loading={<div className="h-16 animate-pulse bg-muted rounded-lg" />}>
          <Button
            size="lg"
            variant={(treasuryBalance?.registryBalance ?? 0) > 0 ? "default" : "outline"}
            className={cn(
              "h-16 flex-col gap-2 w-full",
              (treasuryBalance?.registryBalance ?? 0) > 0 && componentClasses.primaryActionButton
            )}
            onClick={onOpenDailyClosing}
            disabled={(treasuryBalance?.registryBalance ?? 0) === 0}
          >
            <ArrowUpFromLine className="h-6 w-6" />
            <span className="text-sm font-medium">
              {(treasuryBalance?.registryBalance ?? 0) > 0 ? reg.closeDay : reg.alreadyClosed}
            </span>
          </Button>
        </PermissionGuard>

        <PermissionGuard resource="safe_balance" action="create" loading={<div className="h-16 animate-pulse bg-muted rounded-lg" />}>
          <Button
            size="lg"
            variant="outline"
            className="h-16 flex-col gap-2 w-full border-gspn-maroon-200 hover:bg-gspn-maroon-50 hover:border-gspn-maroon-300 dark:border-gspn-maroon-800 dark:hover:bg-gspn-maroon-950/50"
            onClick={onOpenSafeTransfer}
          >
            <ArrowRight className="h-6 w-6 text-gspn-maroon-500" />
            <span className="text-sm font-medium">{reg.safeRegistryTransfer}</span>
          </Button>
        </PermissionGuard>

        <PermissionGuard resource="safe_expense" action="create" loading={<div className="h-16 animate-pulse bg-muted rounded-lg" />}>
          <Button
            size="lg"
            className={cn(
              "h-16 flex-col gap-2 w-full",
              treasuryBalance?.registryBalance === 0
                ? "bg-muted text-muted-foreground"
                : "text-white bg-gspn-maroon-500 hover:bg-gspn-maroon-600"
            )}
            onClick={() => treasuryBalance?.registryBalance !== 0 && window.location.assign("/accounting/expenses/new")}
            disabled={treasuryBalance?.registryBalance === 0}
          >
            <ArrowUpFromLine className="h-6 w-6" />
            <span className="text-sm font-medium">
              {treasuryBalance?.registryBalance === 0 ? reg.registryClosed : reg.recordExpense}
            </span>
          </Button>
        </PermissionGuard>

        <PermissionGuard resource="daily_verification" action="create" loading={<div className="h-16 animate-pulse bg-muted rounded-lg" />}>
          <Button
            size="lg"
            variant="secondary"
            className="h-16 flex-col gap-2 w-full bg-gspn-gold-100 hover:bg-gspn-gold-200 text-gspn-gold-800 dark:bg-gspn-gold-900/30 dark:hover:bg-gspn-gold-900/50 dark:text-gspn-gold-200"
            onClick={onOpenVerifyCash}
            disabled={!!treasuryBalance?.todayVerification}
          >
            <ClipboardCheck className="h-6 w-6" />
            <span className="text-sm font-medium">
              {treasuryBalance?.todayVerification ? reg.alreadyVerified : reg.verifyCash}
            </span>
          </Button>
        </PermissionGuard>
      </div>

      {/* Recent Transactions */}
      <Card className="border shadow-sm overflow-hidden">
        <div className="h-1 bg-gspn-maroon-500" />
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            <div>
              <CardTitle>{reg.recentMovements}</CardTitle>
              <CardDescription>
                {treasuryBalance?.todaySummary?.transactionCount || 0} {reg.todaysTransactions.toLowerCase()}
              </CardDescription>
            </div>
          </div>
          <Link href="/treasury/transactions">
            <Button variant="ghost" size="sm" className="text-gspn-maroon-600 hover:text-gspn-maroon-700 hover:bg-gspn-maroon-50">
              {reg.viewAll}
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {reg.noRecentTransactions}
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx, index) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                  style={{
                    opacity: isMounted ? 1 : 0,
                    transform: isMounted ? "translateX(0)" : "translateX(-10px)",
                    transition: `opacity 0.3s ease-out ${index * 0.05}s, transform 0.3s ease-out ${index * 0.05}s`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      tx.direction === "in"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}>
                      {tx.direction === "in" ? (
                        <ArrowDownRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {tx.description || getTransactionTypeLabel(tx.type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.recordedAt, locale)}
                        {tx.student && ` • ${tx.student.firstName} ${tx.student.lastName}`}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold tabular-nums ${
                    tx.direction === "in" ? "text-green-600" : "text-red-600"
                  }`}>
                    {tx.direction === "in" ? "+" : "-"}{formatCurrency(tx.amount)} GNF
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
