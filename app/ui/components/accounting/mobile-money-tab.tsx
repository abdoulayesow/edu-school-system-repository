"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PermissionGuard } from "@/components/permission-guard"
import { typography, gradients, interactive } from "@/lib/design-tokens"
import { cn, formatDate } from "@/lib/utils"
import { formatCurrency, getTransactionTypeLabel, useCountUp } from "./utils"
import type { TreasuryBalance, RecentTransaction } from "./types"

interface MobileMoneyTabProps {
  treasuryBalance: TreasuryBalance | null
  recentTransactions: RecentTransaction[]
  isLoadingTreasury: boolean
  isMounted: boolean
  onOpenFeeDialog: () => void
}

export function MobileMoneyTab({
  treasuryBalance,
  recentTransactions,
  isLoadingTreasury,
  isMounted,
  onOpenFeeDialog,
}: MobileMoneyTabProps) {
  const { locale } = useI18n()

  // Animated balance
  const animatedMobileMoneyBalance = useCountUp(treasuryBalance?.mobileMoneyBalance || 0, 1000, isMounted)

  // Filter mobile money transactions
  const mobileMoneyTransactions = recentTransactions.filter(tx =>
    tx.type === "mobile_money_income" ||
    tx.type === "mobile_money_payment" ||
    tx.type === "mobile_money_fee"
  )

  return (
    <div className="space-y-6">
      {/* Mobile Money Balance Display - Enhanced */}
      <Card className={cn(
        "border-2 shadow-xl overflow-hidden relative",
        gradients.mobileMoney.light,
        gradients.mobileMoney.dark,
        gradients.mobileMoney.border,
        interactive.cardEnhanced,
        gradients.mobileMoney.glow
      )}>
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 pointer-events-none" />

        <CardContent className="pt-8 pb-8 relative">
          <div className="text-center space-y-4">
            {/* Mobile Money Header - Enhanced */}
            <div className="flex items-center justify-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30",
                "ring-2 ring-orange-200 dark:ring-orange-800",
                "transition-transform duration-300 hover:scale-110"
              )}>
                <Smartphone className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className={cn(
                "text-sm font-semibold uppercase tracking-wider",
                gradients.mobileMoney.text
              )}>
                Orange Money
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
                    "text-orange-600 dark:text-orange-400",
                    "drop-shadow-sm"
                  )}>
                    {formatCurrency(animatedMobileMoneyBalance)}
                  </p>
                  <p className="text-xl font-medium text-orange-600/60 dark:text-orange-400/60">GNF</p>
                </>
              )}
            </div>

            {/* Label - Enhanced */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100/50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                Solde Orange Money
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Fee Action */}
      <div className="flex justify-center">
        <PermissionGuard
          resource="payment_recording"
          action="create"
          loading={<div className="h-16 w-72 animate-pulse bg-muted rounded-lg" />}
        >
          <Button
            size="lg"
            variant="outline"
            className="h-16 px-8 flex items-center gap-3"
            onClick={onOpenFeeDialog}
          >
            <Smartphone className="h-5 w-5" />
            <span className="font-medium">Enregistrer frais de transaction</span>
          </Button>
        </PermissionGuard>
      </div>

      {/* Recent Mobile Money Transactions */}
      <Card className="border shadow-sm overflow-hidden">
        <div className="h-1 bg-orange-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-orange-500" />
            Transactions Orange Money récentes
          </CardTitle>
          <CardDescription>
            Historique des paiements et frais Orange Money
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mobileMoneyTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune transaction Orange Money récente
            </div>
          ) : (
            <div className="space-y-3">
              {mobileMoneyTransactions.map((tx, index) => (
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
