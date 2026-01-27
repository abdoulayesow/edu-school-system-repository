"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Building2,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PermissionGuard } from "@/components/permission-guard"
import { typography, gradients, interactive } from "@/lib/design-tokens"
import { cn, formatDate } from "@/lib/utils"
import { formatCurrency, useCountUp } from "./utils"
import type { TreasuryBalance, BankTransfer } from "./types"

interface BankTabProps {
  treasuryBalance: TreasuryBalance | null
  bankTransfers: BankTransfer[]
  isLoadingTreasury: boolean
  isMounted: boolean
  onOpenBankTransfer: () => void
}

export function BankTab({
  treasuryBalance,
  bankTransfers,
  isLoadingTreasury,
  isMounted,
  onOpenBankTransfer,
}: BankTabProps) {
  const { locale } = useI18n()

  // Animated balance
  const animatedBankBalance = useCountUp(treasuryBalance?.bankBalance || 0, 1000, isMounted)

  return (
    <div className="space-y-6">
      {/* Bank Balance Display - Enhanced */}
      <Card className={cn(
        "border-2 shadow-xl overflow-hidden relative",
        gradients.bank.light,
        gradients.bank.dark,
        gradients.bank.border,
        interactive.cardEnhanced,
        gradients.bank.glow
      )}>
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

        <CardContent className="pt-8 pb-8 relative">
          <div className="text-center space-y-4">
            {/* Bank Header - Enhanced */}
            <div className="flex items-center justify-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30",
                "ring-2 ring-blue-200 dark:ring-blue-800",
                "transition-transform duration-300 hover:scale-110"
              )}>
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className={cn(
                "text-sm font-semibold uppercase tracking-wider",
                gradients.bank.text
              )}>
                Compte Bancaire
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
                    "text-blue-600 dark:text-blue-400",
                    "drop-shadow-sm"
                  )}>
                    {formatCurrency(animatedBankBalance)}
                  </p>
                  <p className="text-xl font-medium text-blue-600/60 dark:text-blue-400/60">GNF</p>
                </>
              )}
            </div>

            {/* Label - Enhanced */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Solde Banque
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Transfer Action */}
      <div className="flex justify-center">
        <PermissionGuard
          resource="bank_transfers"
          action="create"
          loading={<div className="h-16 w-72 animate-pulse bg-muted rounded-lg" />}
        >
          <Button
            size="lg"
            variant="outline"
            className="h-16 px-8 flex items-center gap-3"
            onClick={onOpenBankTransfer}
          >
            <Building2 className="h-5 w-5" />
            <span className="font-medium">Nouveau transfert bancaire</span>
          </Button>
        </PermissionGuard>
      </div>

      {/* Recent Bank Transfers */}
      <Card className="border shadow-sm overflow-hidden">
        <div className="h-1 bg-blue-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            Transferts bancaires récents
          </CardTitle>
          <CardDescription>
            Historique des dépôts et retraits
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bankTransfers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun transfert bancaire récent
            </div>
          ) : (
            <div className="space-y-3">
              {bankTransfers.map((transfer, index) => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                  style={{
                    opacity: isMounted ? 1 : 0,
                    transform: isMounted ? "translateX(0)" : "translateX(-10px)",
                    transition: `opacity 0.3s ease-out ${index * 0.05}s, transform 0.3s ease-out ${index * 0.05}s`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transfer.type === "deposit"
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-orange-100 dark:bg-orange-900/30"
                    }`}>
                      {transfer.type === "deposit" ? (
                        <ArrowUpFromLine className="h-4 w-4 text-blue-600" />
                      ) : (
                        <ArrowDownToLine className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {transfer.type === "deposit" ? "Dépôt en banque" : "Retrait de banque"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transfer.createdAt, locale)}
                        {transfer.depositSlipNumber && ` • ${transfer.depositSlipNumber}`}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold tabular-nums ${
                    transfer.type === "deposit" ? "text-blue-600" : "text-orange-600"
                  }`}>
                    {transfer.type === "deposit" ? "+" : "-"}{formatCurrency(transfer.amount)} GNF
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
