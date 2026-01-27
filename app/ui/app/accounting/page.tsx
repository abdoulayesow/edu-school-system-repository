"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  CheckCircle2,
  Clock,
  Loader2,
  Wallet,
  TrendingUp,
  TrendingDown,
  BanknoteIcon,
  Smartphone,
  Building2,
  ClipboardCheck,
  RefreshCw,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { BankTransferDialog } from "@/components/treasury/bank-transfer-dialog"
import { VerifyCashDialog } from "@/components/treasury/verify-cash-dialog"
import { MobileMoneyFeeDialog } from "@/components/treasury/mobile-money-fee-dialog"
import { DailyOpeningDialog } from "@/components/treasury/daily-opening-dialog"
import { DailyClosingDialog } from "@/components/treasury/daily-closing-dialog"
import { SafeTransferDialog } from "@/components/treasury/safe-transfer-dialog"
import { typography, interactive, componentClasses } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"

// Import extracted accounting components
import {
  RegistryTab,
  SafeTab,
  BankTab,
  MobileMoneyTab,
  OverviewTab,
  ValidationTab,
  formatAmount,
  useCountUp,
} from "@/components/accounting"
import type {
  Payment,
  BalanceData,
  TreasuryBalance,
  RecentTransaction,
  BankTransfer,
} from "@/components/accounting"

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function AccountingPage() {
  const { t, locale } = useI18n()
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Treasury dialogs
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [showFeeDialog, setShowFeeDialog] = useState(false)
  const [showDailyOpeningDialog, setShowDailyOpeningDialog] = useState(false)
  const [showDailyClosingDialog, setShowDailyClosingDialog] = useState(false)
  const [showSafeTransferDialog, setShowSafeTransferDialog] = useState(false)

  // Data state
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [treasuryBalance, setTreasuryBalance] = useState<TreasuryBalance | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [bankTransfers, setBankTransfers] = useState<BankTransfer[]>([])

  // Loading states
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [isLoadingPayments, setIsLoadingPayments] = useState(true)
  const [isLoadingTreasury, setIsLoadingTreasury] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filter states for Validation tab
  const [reviewTypeFilter, setReviewTypeFilter] = useState<string>("all")

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    const promises = [
      // Fetch balance data
      fetch("/api/accounting/balance").then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setBalanceData(data)
        }
      }),
      // Fetch payments
      fetch("/api/payments?limit=50").then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setPayments(data.payments || [])
        }
      }),
      // Fetch treasury balance
      fetch("/api/treasury/balance").then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setTreasuryBalance(data)
        }
      }),
      // Fetch recent transactions
      fetch("/api/treasury/transactions?limit=10").then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setRecentTransactions(data.data || [])
        }
      }),
      // Fetch bank transfers
      fetch("/api/treasury/bank-transfers?limit=10").then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setBankTransfers(data.data || [])
        }
      }),
    ]

    await Promise.allSettled(promises)
  }, [])

  // Initial data fetch
  useEffect(() => {
    async function init() {
      setIsLoadingBalance(true)
      setIsLoadingPayments(true)
      setIsLoadingTreasury(true)

      await fetchAllData()

      setIsLoadingBalance(false)
      setIsLoadingPayments(false)
      setIsLoadingTreasury(false)
    }
    init()
  }, [fetchAllData])

  // Client-side mount detection for hydration-safe rendering
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchAllData()
    setIsRefreshing(false)
  }

  // Filtered payments for Validation tab (reversed/failed payments)
  const pendingReviewItems = useMemo(() => {
    const pending = payments.filter((payment) => {
      // Include reversed or failed payments for review
      const needsReview = ["reversed", "failed"].includes(payment.status)
      if (!needsReview) return false

      if (reviewTypeFilter === "all") return true
      if (reviewTypeFilter === "reversed" && payment.status === "reversed") return true
      if (reviewTypeFilter === "failed" && payment.status === "failed") return true

      return false
    })
    return pending
  }, [payments, reviewTypeFilter])

  return (
    <PageContainer maxWidth="full">
      {/* Page Header with Brand Styling */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="h-1 bg-gspn-maroon-500" />
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                  <Wallet className="h-6 w-6 text-gspn-maroon-500" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  {t.accounting.title}
                </h1>
              </div>
              <p className="text-muted-foreground mt-1">
                {t.accounting.subtitle}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="shrink-0"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              {t?.common?.refresh || "Actualiser"}
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards - GSPN Brand Enhanced */}
      <div
        className="grid gap-5 md:grid-cols-4 mb-8"
        style={{
          opacity: isMounted ? 1 : 0,
          transform: isMounted ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
        }}
      >
        {/* Confirmed Payments */}
        <Card
          className={cn(
            "border shadow-md overflow-hidden relative",
            interactive.card,
            "hover:shadow-emerald-500/10"
          )}
          style={{
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.5s ease-out 0.1s, transform 0.5s ease-out 0.1s",
          }}
        >
          <div className="h-1 bg-emerald-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20 pointer-events-none" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              {locale === "fr" ? "Paiements confirmés" : "Confirmed Payments"}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {isLoadingBalance ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <div className={cn(typography.currency.md, "text-emerald-600 dark:text-emerald-400")}>
                {formatAmount(balanceData?.summary.totalConfirmedPayments || 0)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending */}
        <Card
          className={cn(
            "border shadow-md overflow-hidden relative",
            interactive.card,
            "hover:shadow-amber-500/10"
          )}
          style={{
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.5s ease-out 0.2s, transform 0.5s ease-out 0.2s",
          }}
        >
          <div className="h-1 bg-amber-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20 pointer-events-none" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              {locale === "fr" ? "En attente" : "Pending"}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {isLoadingBalance ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <div className={cn(typography.currency.md, "text-amber-600 dark:text-amber-400")}>
                {formatAmount(balanceData?.summary.totalPendingPayments || 0)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card
          className={cn(
            "border shadow-md overflow-hidden relative",
            interactive.card,
            "hover:shadow-red-500/10"
          )}
          style={{
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.5s ease-out 0.3s, transform 0.5s ease-out 0.3s",
          }}
        >
          <div className="h-1 bg-red-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent dark:from-red-950/20 pointer-events-none" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
                <TrendingDown className="size-3.5 text-red-600 dark:text-red-400" />
              </div>
              {locale === "fr" ? "Dépenses" : "Expenses"}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {isLoadingBalance ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <div className={cn(typography.currency.md, "text-red-600 dark:text-red-400")}>
                {formatAmount(balanceData?.summary.totalPaidExpenses || 0)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Net Margin - GSPN Gold Highlight */}
        <Card
          className={cn(
            "border shadow-md overflow-hidden relative",
            interactive.card,
            "hover:shadow-gspn-gold-500/10"
          )}
          style={{
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.5s ease-out 0.4s, transform 0.5s ease-out 0.4s",
          }}
        >
          <div className="h-1 bg-gspn-gold-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-gspn-gold-50/50 to-transparent dark:from-gspn-gold-950/20 pointer-events-none" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
              <div className="h-2 w-2 rounded-full bg-gspn-gold-500" />
              <div className="p-1.5 rounded-lg bg-gspn-gold-100 dark:bg-gspn-gold-900/30">
                <CheckCircle2 className="size-3.5 text-gspn-gold-600 dark:text-gspn-gold-400" />
              </div>
              {locale === "fr" ? "Marge nette" : "Net Margin"}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {isLoadingBalance ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <div className={cn(typography.currency.md, "text-gspn-gold-600 dark:text-gspn-gold-400")}>
                {formatAmount(balanceData?.summary.margin || 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation and Content */}
      {isMounted ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Custom Tab List - GSPN Brand Enhanced */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-muted/50 rounded-xl border border-border/50">
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                componentClasses.tabButtonBase,
                activeTab === "overview" ? componentClasses.tabButtonActive : componentClasses.tabButtonInactive
              )}
            >
              <TrendingUp className="h-4 w-4" />
              {locale === "fr" ? "Aperçu" : "Overview"}
            </button>
            <button
              onClick={() => setActiveTab("registry")}
              className={cn(
                componentClasses.tabButtonBase,
                activeTab === "registry" ? componentClasses.tabButtonActive : componentClasses.tabButtonInactive
              )}
            >
              <Wallet className="h-4 w-4" />
              {locale === "fr" ? "Caisse" : "Registry"}
            </button>
            <button
              onClick={() => setActiveTab("safe")}
              className={cn(
                componentClasses.tabButtonBase,
                activeTab === "safe" ? componentClasses.tabButtonActive : componentClasses.tabButtonInactive
              )}
            >
              <BanknoteIcon className="h-4 w-4" />
              {locale === "fr" ? "Coffre fort" : "Safe"}
            </button>
            <button
              onClick={() => setActiveTab("bank")}
              className={cn(
                componentClasses.tabButtonBase,
                activeTab === "bank" ? componentClasses.tabButtonActive : componentClasses.tabButtonInactive
              )}
            >
              <Building2 className="h-4 w-4" />
              {locale === "fr" ? "Banque" : "Bank"}
            </button>
            <button
              onClick={() => setActiveTab("mobile-money")}
              className={cn(
                componentClasses.tabButtonBase,
                activeTab === "mobile-money" ? componentClasses.tabButtonActive : componentClasses.tabButtonInactive
              )}
            >
              <Smartphone className="h-4 w-4" />
              Orange Money
            </button>
            <button
              onClick={() => setActiveTab("validation")}
              className={cn(
                componentClasses.tabButtonBase,
                activeTab === "validation" ? componentClasses.tabButtonActive : componentClasses.tabButtonInactive,
                "relative"
              )}
            >
              <ClipboardCheck className="h-4 w-4" />
              {locale === "fr" ? "Validation" : "Validation"}
              {pendingReviewItems.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-gspn-maroon-500 text-white text-xs w-5 h-5 font-medium">
                  {pendingReviewItems.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content - Using Extracted Components */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewTab
              balanceData={balanceData}
              isLoadingBalance={isLoadingBalance}
            />
          </TabsContent>

          <TabsContent value="registry" className="space-y-6">
            <RegistryTab
              treasuryBalance={treasuryBalance}
              recentTransactions={recentTransactions}
              isLoadingTreasury={isLoadingTreasury}
              isMounted={isMounted}
              onOpenDailyOpening={() => setShowDailyOpeningDialog(true)}
              onOpenDailyClosing={() => setShowDailyClosingDialog(true)}
              onOpenSafeTransfer={() => setShowSafeTransferDialog(true)}
              onOpenVerifyCash={() => setShowVerifyDialog(true)}
            />
          </TabsContent>

          <TabsContent value="safe" className="space-y-6">
            <SafeTab
              treasuryBalance={treasuryBalance}
              recentTransactions={recentTransactions}
              isLoadingTreasury={isLoadingTreasury}
              isMounted={isMounted}
              onOpenSafeTransfer={() => setShowSafeTransferDialog(true)}
              onOpenVerifyCash={() => setShowVerifyDialog(true)}
            />
          </TabsContent>

          <TabsContent value="bank" className="space-y-6">
            <BankTab
              treasuryBalance={treasuryBalance}
              bankTransfers={bankTransfers}
              isLoadingTreasury={isLoadingTreasury}
              isMounted={isMounted}
              onOpenBankTransfer={() => setShowTransferDialog(true)}
            />
          </TabsContent>

          <TabsContent value="mobile-money" className="space-y-6">
            <MobileMoneyTab
              treasuryBalance={treasuryBalance}
              recentTransactions={recentTransactions}
              isLoadingTreasury={isLoadingTreasury}
              isMounted={isMounted}
              onOpenFeeDialog={() => setShowFeeDialog(true)}
            />
          </TabsContent>

          <TabsContent value="validation" className="space-y-6">
            <ValidationTab
              payments={payments}
              isLoadingPayments={isLoadingPayments}
              reviewTypeFilter={reviewTypeFilter}
              onReviewTypeFilterChange={setReviewTypeFilter}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-6">
          <div className="h-10 w-48 bg-muted animate-pulse rounded-md" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-48 bg-muted animate-pulse rounded-lg" />
            <div className="h-48 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      )}

      {/* Treasury Dialogs */}
      <DailyOpeningDialog
        open={showDailyOpeningDialog}
        onOpenChange={setShowDailyOpeningDialog}
        onSuccess={handleRefresh}
        currentSafeBalance={treasuryBalance?.safeBalance || 0}
        currentRegistryBalance={treasuryBalance?.registryBalance || 0}
        defaultFloatAmount={treasuryBalance?.registryFloatAmount || 2000000}
      />

      <DailyClosingDialog
        open={showDailyClosingDialog}
        onOpenChange={setShowDailyClosingDialog}
        onSuccess={handleRefresh}
        currentRegistryBalance={treasuryBalance?.registryBalance || 0}
        currentSafeBalance={treasuryBalance?.safeBalance || 0}
      />

      <SafeTransferDialog
        open={showSafeTransferDialog}
        onOpenChange={setShowSafeTransferDialog}
        onSuccess={handleRefresh}
        currentSafeBalance={treasuryBalance?.safeBalance || 0}
        currentRegistryBalance={treasuryBalance?.registryBalance || 0}
      />

      <BankTransferDialog
        open={showTransferDialog}
        onOpenChange={setShowTransferDialog}
        onSuccess={handleRefresh}
        safeBalance={treasuryBalance?.safeBalance || 0}
        bankBalance={treasuryBalance?.bankBalance || 0}
      />

      <VerifyCashDialog
        open={showVerifyDialog}
        onOpenChange={setShowVerifyDialog}
        onSuccess={handleRefresh}
        expectedBalance={treasuryBalance?.safeBalance || 0}
      />

      <MobileMoneyFeeDialog
        open={showFeeDialog}
        onOpenChange={setShowFeeDialog}
        onSuccess={handleRefresh}
        currentBalance={treasuryBalance?.mobileMoneyBalance || 0}
      />
    </PageContainer>
  )
}
