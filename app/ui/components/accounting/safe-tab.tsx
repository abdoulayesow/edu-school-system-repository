"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Loader2,
  BanknoteIcon,
  ArrowRight,
  ClipboardCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/components/i18n-provider"
import { PermissionGuard } from "@/components/permission-guard"
import { StatCard } from "@/components/students"
import { typography, gradients, interactive } from "@/lib/design-tokens"
import { cn, formatDate } from "@/lib/utils"
import { formatCurrency, formatAmount, getTransactionTypeLabel, statusConfig, useCountUp } from "./utils"
import type { TreasuryBalance, RecentTransaction } from "./types"

interface SafeTabProps {
  treasuryBalance: TreasuryBalance | null
  recentTransactions: RecentTransaction[]
  isLoadingTreasury: boolean
  isMounted: boolean
  onOpenSafeTransfer: () => void
  onOpenVerifyCash: () => void
}

export function SafeTab({
  treasuryBalance,
  recentTransactions,
  isLoadingTreasury,
  isMounted,
  onOpenSafeTransfer,
  onOpenVerifyCash,
}: SafeTabProps) {
  const { t, locale } = useI18n()
  const reg = t.treasury.registry

  // Animated balance
  const animatedSafeBalance = useCountUp(treasuryBalance?.safeBalance || 0, 1000, isMounted)
  const currentStatus = treasuryBalance?.status || "optimal"

  // Filter transactions relevant to safe
  const safeTransactions = recentTransactions.filter(tx =>
    tx.type === "safe_to_registry" ||
    tx.type === "registry_to_safe" ||
    tx.type === "bank_deposit" ||
    tx.type === "bank_withdrawal" ||
    tx.type === "adjustment"
  )

  return (
    <div className="space-y-6">
      {/* Safe Balance Display - Enhanced */}
      <Card className={cn(
        "border-2 shadow-xl overflow-hidden relative",
        gradients.safe.light,
        gradients.safe.dark,
        gradients.safe.border,
        interactive.cardEnhanced,
        gradients.safe.glow
      )}>
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-yellow-500/5 pointer-events-none" />

        <CardContent className="pt-8 pb-8 relative">
          <div className="text-center space-y-4">
            {/* Safe Header - Enhanced */}
            <div className="flex items-center justify-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30",
                "ring-2 ring-amber-200 dark:ring-amber-800",
                "transition-transform duration-300 hover:scale-110"
              )}>
                <BanknoteIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <span className={cn(
                "text-sm font-semibold uppercase tracking-wider",
                gradients.safe.text
              )}>
                {locale === "fr" ? "Coffre Fort" : "Safe"}
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
                    "text-amber-600 dark:text-amber-400",
                    "drop-shadow-sm"
                  )}>
                    {formatCurrency(animatedSafeBalance)}
                  </p>
                  <p className="text-xl font-medium text-amber-600/60 dark:text-amber-400/60">GNF</p>
                </>
              )}
            </div>

            {/* Label - Enhanced */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                {locale === "fr" ? "Solde Coffre Fort" : "Safe Balance"}
              </p>
            </div>

            {/* Safe status indicator */}
            {!isLoadingTreasury && treasuryBalance && (
              <div className={`flex items-center justify-center gap-2 text-sm ${
                statusConfig[currentStatus].textColor
              }`}>
                {(() => {
                  const StatusIcon = statusConfig[currentStatus].icon
                  return <StatusIcon className="h-4 w-4" />
                })()}
                <span>{statusConfig[currentStatus].label}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Safe Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title={locale === "fr" ? "Seuil minimum" : "Minimum Threshold"}
          value={formatAmount(treasuryBalance?.thresholds?.min || 0)}
          icon={AlertTriangle}
          variant="warning"
          showAccentBar
          showIndicator
        />
        <StatCard
          title={locale === "fr" ? "Seuil maximum" : "Maximum Threshold"}
          value={formatAmount(treasuryBalance?.thresholds?.max || 0)}
          icon={AlertTriangle}
          variant="info"
          showAccentBar
          showIndicator
        />
        <StatCard
          title={locale === "fr" ? "Dernière vérification" : "Last Verification"}
          value={treasuryBalance?.lastVerification?.at
            ? formatDate(treasuryBalance.lastVerification.at, locale)
            : (locale === "fr" ? "Jamais" : "Never")}
          icon={ClipboardCheck}
          variant="default"
          showAccentBar
          showIndicator
        />
      </div>

      {/* Quick Actions - GSPN Brand Styling */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
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

      {/* Today's Verification Status */}
      {treasuryBalance?.todayVerification && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              {locale === "fr" ? "Vérification du jour" : "Today's Verification"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{locale === "fr" ? "Solde attendu" : "Expected"}</span>
                <span className="font-medium">{formatAmount(treasuryBalance.todayVerification.expectedBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{locale === "fr" ? "Montant compté" : "Counted"}</span>
                <span className="font-medium">{formatAmount(treasuryBalance.todayVerification.countedBalance)}</span>
              </div>
              {treasuryBalance.todayVerification.discrepancy !== 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{locale === "fr" ? "Écart" : "Discrepancy"}</span>
                  <span className={`font-medium ${
                    treasuryBalance.todayVerification.discrepancy > 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {treasuryBalance.todayVerification.discrepancy > 0 ? "+" : ""}
                    {formatAmount(treasuryBalance.todayVerification.discrepancy)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{locale === "fr" ? "Vérifié par" : "Verified by"}</span>
                <span className="font-medium">{treasuryBalance.todayVerification.verifiedBy?.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Safe Transactions */}
      <Card className="border shadow-sm overflow-hidden">
        <div className="h-1 bg-amber-500" />
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <div>
              <CardTitle>{locale === "fr" ? "Mouvements récents du coffre" : "Recent Safe Transactions"}</CardTitle>
              <CardDescription>
                {locale === "fr" ? "Historique des transferts et ajustements" : "Transfer and adjustment history"}
              </CardDescription>
            </div>
          </div>
          <Link href="/treasury/transactions">
            <Button variant="ghost" size="sm">
              {reg.viewAll}
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {safeTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {locale === "fr" ? "Aucun mouvement récent du coffre" : "No recent safe transactions"}
            </div>
          ) : (
            <div className="space-y-3">
              {safeTransactions.map((tx, index) => (
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
                        ? "bg-amber-100 dark:bg-amber-900/30"
                        : "bg-orange-100 dark:bg-orange-900/30"
                    }`}>
                      {tx.direction === "in" ? (
                        <ArrowDownRight className="h-4 w-4 text-amber-600" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {tx.description || getTransactionTypeLabel(tx.type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.recordedAt, locale)}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold tabular-nums ${
                    tx.direction === "in" ? "text-amber-600" : "text-orange-600"
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
