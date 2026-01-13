"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle2,
  Clock,
  Loader2,
  Wallet,
  TrendingUp,
  TrendingDown,
  BanknoteIcon,
  Smartphone,
  ArrowRight,
  XCircle,
  Building2,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { PieChart, Pie, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { formatDate } from "@/lib/utils"
import { getPaymentRowStatus } from "@/lib/status-helpers"
import { RecordExpenseDialog } from "@/components/treasury/record-expense-dialog"
import { BankTransferDialog } from "@/components/treasury/bank-transfer-dialog"
import { VerifyCashDialog } from "@/components/treasury/verify-cash-dialog"
import { MobileMoneyFeeDialog } from "@/components/treasury/mobile-money-fee-dialog"
import { DailyOpeningDialog } from "@/components/treasury/daily-opening-dialog"
import { DailyClosingDialog } from "@/components/treasury/daily-closing-dialog"
import { SafeTransferDialog } from "@/components/treasury/safe-transfer-dialog"
import { PermissionGuard } from "@/components/permission-guard"
import { typography, gradients, interactive } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"

// =============================================================================
// CUSTOM HOOK: useCountUp - Animated number counting
// =============================================================================
function useCountUp(target: number, duration: number = 800, enabled: boolean = true) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!enabled || target === 0) {
      setCount(target)
      return
    }

    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function: easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      const current = Math.floor(startValue + (target - startValue) * eased)

      setCount(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration, enabled])

  return count
}

// =============================================================================
// TYPES
// =============================================================================
interface Payment {
  id: string
  amount: number
  method: "cash" | "orange_money"
  status: "confirmed" | "reversed" | "failed"
  receiptNumber: string
  transactionRef: string | null
  recordedAt: string
  confirmedAt: string | null
  enrollment: {
    id: string
    enrollmentNumber: string
    student: {
      id: string
      firstName: string
      lastName: string
      studentNumber: string
    } | null
    grade: {
      id: string
      name: string
    } | null
  } | null
  recorder: { id: string; name: string; email: string } | null
}

interface BalanceSummary {
  totalConfirmedPayments: number
  totalPendingPayments: number
  totalPaidExpenses: number
  totalPendingExpenses: number
  cashAvailable: number
  cashPending: number
  margin: number
}

interface BalanceData {
  summary: BalanceSummary
  payments: {
    byStatus: Record<string, { count: number; amount: number }>
    byMethod: Record<string, { count: number; amount: number; confirmed: number }>
    byGrade: Record<string, { count: number; amount: number; confirmed: number }>
    total: { count: number; amount: number }
  }
  expenses: {
    byStatus: Record<string, { count: number; amount: number }>
    byCategory: Record<string, { count: number; amount: number }>
    total: { count: number; amount: number }
  }
}

interface TreasuryBalance {
  registryBalance: number
  registryFloatAmount: number
  safeBalance: number
  bankBalance: number
  mobileMoneyBalance: number
  totalLiquidAssets: number
  thresholds: {
    min: number
    max: number
  }
  status: "critical" | "warning" | "optimal" | "excess"
  lastVerification: {
    at: string
    byId: string
  } | null
  todayVerification: {
    id: string
    status: string
    expectedBalance: number
    countedBalance: number
    discrepancy: number
    verifiedAt: string
    verifiedBy: { id: string; name: string }
  } | null
  todaySummary: {
    in: number
    out: number
    net: number
    transactionCount: number
  }
  updatedAt: string
}

interface RecentTransaction {
  id: string
  type: string
  direction: "in" | "out"
  amount: number
  description: string | null
  recordedAt: string
  recorder: { id: string; name: string }
  student: { firstName: string; lastName: string } | null
}

interface BankTransfer {
  id: string
  type: "deposit" | "withdrawal"
  amount: number
  depositSlipNumber: string | null
  notes: string | null
  createdAt: string
  recordedBy: { name: string }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-GN", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatAmount(amount: number): string {
  return formatCurrency(amount) + " GNF"
}

function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    student_payment: "Paiement scolarité",
    activity_payment: "Paiement activité",
    other_income: "Autre entrée",
    expense_payment: "Dépense",
    bank_deposit: "Dépôt en banque",
    bank_withdrawal: "Retrait de banque",
    adjustment: "Ajustement",
    mobile_money_income: "Reçu Orange Money",
    mobile_money_payment: "Dépense Orange Money",
    mobile_money_fee: "Frais Orange Money",
    reversal_student_payment: "Annulation paiement",
    reversal_expense_payment: "Annulation dépense",
    reversal_bank_deposit: "Annulation dépôt",
    reversal_mobile_money: "Annulation Orange Money",
    safe_to_registry: "Transfert coffre → caisse",
    registry_to_safe: "Transfert caisse → coffre",
    registry_adjustment: "Ajustement caisse",
  }
  return labels[type] || type
}

// Status indicator configuration
const statusConfig = {
  critical: {
    color: "bg-red-500",
    textColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
    label: "Critique",
    icon: XCircle,
  },
  warning: {
    color: "bg-orange-500",
    textColor: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    label: "Attention",
    icon: AlertTriangle,
  },
  optimal: {
    color: "bg-green-500",
    textColor: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    label: "Niveau optimal",
    icon: CheckCircle2,
  },
  excess: {
    color: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    label: "Excédent",
    icon: AlertTriangle,
  },
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function AccountingPage() {
  const { t, locale } = useI18n()
  const reg = t.treasury.registry
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Treasury dialogs
  const [showExpenseDialog, setShowExpenseDialog] = useState(false)
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

  // Animated counts
  const animatedRegistryBalance = useCountUp(treasuryBalance?.registryBalance || 0, 1000, isMounted)
  const animatedSafeBalance = useCountUp(treasuryBalance?.safeBalance || 0, 1000, isMounted)
  const animatedBankBalance = useCountUp(treasuryBalance?.bankBalance || 0, 1000, isMounted)
  const animatedMobileMoneyBalance = useCountUp(treasuryBalance?.mobileMoneyBalance || 0, 1000, isMounted)

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t.accounting.confirmed}
          </Badge>
        )
      case "reversed":
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500">
            <RefreshCw className="h-3 w-3 mr-1" />
            Annulé
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Échoué
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <BanknoteIcon className="h-3 w-3 mr-1" />
            Espèces
          </Badge>
        )
      case "orange_money":
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500">
            <Smartphone className="h-3 w-3 mr-1" />
            Orange Money
          </Badge>
        )
      default:
        return <Badge variant="outline">{method}</Badge>
    }
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

  const currentStatus = treasuryBalance?.status || "optimal"

  return (
    <PageContainer maxWidth="full">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.accounting.title}</h1>
          <p className="text-muted-foreground">{t.accounting.subtitle}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          {t?.common?.refresh || "Actualiser"}
        </Button>
      </div>

      {/* KPI Cards - Enhanced with gradients */}
      <div
        className="grid gap-5 md:grid-cols-4 mb-8"
        style={{
          opacity: isMounted ? 1 : 0,
          transform: isMounted ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
        }}
      >
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
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20 pointer-events-none" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              Paiements confirmés
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
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20 pointer-events-none" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              En attente
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
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent dark:from-red-950/20 pointer-events-none" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
              <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
                <TrendingDown className="size-3.5 text-red-600 dark:text-red-400" />
              </div>
              Dépenses
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

        <Card
          className={cn(
            "border-2 border-primary/40 shadow-lg overflow-hidden relative",
            interactive.cardEnhanced,
            "hover:shadow-primary/20"
          )}
          style={{
            opacity: isMounted ? 1 : 0,
            transform: isMounted ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.5s ease-out 0.4s, transform 0.5s ease-out 0.4s",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent pointer-events-none" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
              <div className="p-1.5 rounded-lg bg-primary/20">
                <Wallet className="size-3.5 text-primary" />
              </div>
              Marge nette
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {isLoadingBalance ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <div className={cn(typography.currency.md, "text-primary")}>
                {formatAmount(balanceData?.summary.margin || 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isMounted ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {locale === "fr" ? "Vue globale" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="registry" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              {locale === "fr" ? "Caisse" : "Registry"}
            </TabsTrigger>
            <TabsTrigger value="safe" className="flex items-center gap-2">
              <BanknoteIcon className="h-4 w-4" />
              {locale === "fr" ? "Coffre fort" : "Safe"}
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {locale === "fr" ? "Banque" : "Bank"}
            </TabsTrigger>
            <TabsTrigger value="mobile-money" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Orange Money
            </TabsTrigger>
            <TabsTrigger value="validation" className="relative flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              {locale === "fr" ? "Validation" : "Validation"}
              {pendingReviewItems.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs w-5 h-5">
                  {pendingReviewItems.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ================================================================= */}
          {/* REGISTRY (CAISSE) TAB - Daily working cash */}
          {/* ================================================================= */}
          <TabsContent value="registry" className="space-y-6">
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {reg.todaysEntries}
                  </CardTitle>
                  <ArrowDownToLine className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-green-600">
                    +{formatAmount(treasuryBalance?.todaySummary?.in || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {reg.todaysExits}
                  </CardTitle>
                  <ArrowUpFromLine className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-red-600">
                    -{formatAmount(treasuryBalance?.todaySummary?.out || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {reg.todaysTransactions}
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">
                    {treasuryBalance?.todaySummary?.transactionCount || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
              <PermissionGuard resource="safe_balance" action="update" loading={<div className="h-16 animate-pulse bg-muted rounded-lg" />}>
                <Button
                  size="lg"
                  variant={treasuryBalance?.registryBalance === 0 ? "default" : "outline"}
                  className="h-16 flex-col gap-2 w-full"
                  onClick={() => setShowDailyOpeningDialog(true)}
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
                  className="h-16 flex-col gap-2 w-full"
                  onClick={() => setShowDailyClosingDialog(true)}
                  disabled={(treasuryBalance?.registryBalance ?? 0) === 0}
                >
                  <ArrowUpFromLine className="h-6 w-6" />
                  <span className="text-sm font-medium">
                    {(treasuryBalance?.registryBalance ?? 0) > 0 ? reg.closeDay : reg.alreadyClosed}
                  </span>
                </Button>
              </PermissionGuard>

              <PermissionGuard resource="safe_balance" action="update" loading={<div className="h-16 animate-pulse bg-muted rounded-lg" />}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 flex-col gap-2 w-full"
                  onClick={() => setShowSafeTransferDialog(true)}
                >
                  <ArrowRight className="h-6 w-6" />
                  <span className="text-sm font-medium">{reg.safeRegistryTransfer}</span>
                </Button>
              </PermissionGuard>

              <PermissionGuard resource="safe_expense" action="create" loading={<div className="h-16 animate-pulse bg-muted rounded-lg" />}>
                <Button
                  size="lg"
                  variant="destructive"
                  className="h-16 flex-col gap-2 w-full"
                  onClick={() => setShowExpenseDialog(true)}
                >
                  <ArrowUpFromLine className="h-6 w-6" />
                  <span className="text-sm font-medium">{reg.recordExpense}</span>
                </Button>
              </PermissionGuard>

              <PermissionGuard resource="bank_transfers" action="create" loading={<div className="h-16 animate-pulse bg-muted rounded-lg" />}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 flex-col gap-2 w-full"
                  onClick={() => setShowTransferDialog(true)}
                >
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm font-medium">{reg.bankTransfer}</span>
                </Button>
              </PermissionGuard>

              <PermissionGuard resource="daily_verification" action="create" loading={<div className="h-16 animate-pulse bg-muted rounded-lg" />}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-16 flex-col gap-2 w-full"
                  onClick={() => setShowVerifyDialog(true)}
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{reg.recentMovements}</CardTitle>
                  <CardDescription>
                    {treasuryBalance?.todaySummary?.transactionCount || 0} {reg.todaysTransactions.toLowerCase()}
                  </CardDescription>
                </div>
                <Link href="/treasury/transactions">
                  <Button variant="ghost" size="sm">
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
          </TabsContent>

          {/* ================================================================= */}
          {/* SAFE (COFFRE FORT) TAB - Secure storage */}
          {/* ================================================================= */}
          <TabsContent value="safe" className="space-y-6">
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {locale === "fr" ? "Seuil minimum" : "Minimum Threshold"}
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-muted-foreground">
                    {formatAmount(treasuryBalance?.thresholds?.min || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {locale === "fr" ? "Seuil maximum" : "Maximum Threshold"}
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-muted-foreground">
                    {formatAmount(treasuryBalance?.thresholds?.max || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {locale === "fr" ? "Dernière vérification" : "Last Verification"}
                  </CardTitle>
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium">
                    {treasuryBalance?.lastVerification?.at
                      ? formatDate(treasuryBalance.lastVerification.at, locale)
                      : (locale === "fr" ? "Jamais" : "Never")}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
              <PermissionGuard resource="safe_balance" action="update" loading={<div className="h-16 animate-pulse bg-muted rounded-lg" />}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 flex-col gap-2 w-full"
                  onClick={() => setShowSafeTransferDialog(true)}
                >
                  <ArrowRight className="h-6 w-6" />
                  <span className="text-sm font-medium">{reg.safeRegistryTransfer}</span>
                </Button>
              </PermissionGuard>

              <PermissionGuard resource="bank_transfers" action="create" loading={<div className="h-16 animate-pulse bg-muted rounded-lg" />}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 flex-col gap-2 w-full"
                  onClick={() => setShowTransferDialog(true)}
                >
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm font-medium">{reg.bankTransfer}</span>
                </Button>
              </PermissionGuard>

              <PermissionGuard resource="daily_verification" action="create" loading={<div className="h-16 animate-pulse bg-muted rounded-lg" />}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-16 flex-col gap-2 w-full"
                  onClick={() => setShowVerifyDialog(true)}
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{locale === "fr" ? "Mouvements récents du coffre" : "Recent Safe Transactions"}</CardTitle>
                  <CardDescription>
                    {locale === "fr" ? "Historique des transferts et ajustements" : "Transfer and adjustment history"}
                  </CardDescription>
                </div>
                <Link href="/treasury/transactions">
                  <Button variant="ghost" size="sm">
                    {reg.viewAll}
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentTransactions.filter(tx =>
                  tx.type === "safe_to_registry" ||
                  tx.type === "registry_to_safe" ||
                  tx.type === "bank_deposit" ||
                  tx.type === "bank_withdrawal" ||
                  tx.type === "adjustment"
                ).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {locale === "fr" ? "Aucun mouvement récent du coffre" : "No recent safe transactions"}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTransactions
                      .filter(tx =>
                        tx.type === "safe_to_registry" ||
                        tx.type === "registry_to_safe" ||
                        tx.type === "bank_deposit" ||
                        tx.type === "bank_withdrawal" ||
                        tx.type === "adjustment"
                      )
                      .map((tx, index) => (
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
          </TabsContent>

          {/* ================================================================= */}
          {/* BANK TAB - Bank balance and transfers */}
          {/* ================================================================= */}
          <TabsContent value="bank" className="space-y-6">
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
                  onClick={() => setShowTransferDialog(true)}
                >
                  <Building2 className="h-5 w-5" />
                  <span className="font-medium">Nouveau transfert bancaire</span>
                </Button>
              </PermissionGuard>
            </div>

            {/* Recent Bank Transfers */}
            <Card>
              <CardHeader>
                <CardTitle>Transferts bancaires récents</CardTitle>
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
          </TabsContent>

          {/* ================================================================= */}
          {/* MOBILE MONEY TAB - New tab for Orange Money balance and transactions */}
          {/* ================================================================= */}
          <TabsContent value="mobile-money" className="space-y-6">
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
                resource="mobile_money"
                action="create"
                loading={<div className="h-16 w-72 animate-pulse bg-muted rounded-lg" />}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 px-8 flex items-center gap-3"
                  onClick={() => setShowFeeDialog(true)}
                >
                  <Smartphone className="h-5 w-5" />
                  <span className="font-medium">Enregistrer frais de transaction</span>
                </Button>
              </PermissionGuard>
            </div>

            {/* Recent Mobile Money Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Transactions Orange Money récentes</CardTitle>
                <CardDescription>
                  Historique des paiements et frais Orange Money
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentTransactions.filter(tx =>
                  tx.type === "mobile_money_income" ||
                  tx.type === "mobile_money_payment" ||
                  tx.type === "mobile_money_fee"
                ).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune transaction Orange Money récente
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTransactions
                      .filter(tx =>
                        tx.type === "mobile_money_income" ||
                        tx.type === "mobile_money_payment" ||
                        tx.type === "mobile_money_fee"
                      )
                      .map((tx, index) => (
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
          </TabsContent>

          {/* ================================================================= */}
          {/* OVERVIEW (VUE GLOBALE) TAB */}
          {/* ================================================================= */}
          <TabsContent value="overview" className="space-y-6">
            {/* Payment Method Breakdown Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Répartition par méthode de paiement</CardTitle>
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
                          >
                          </Pie>
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
                      <div className="rounded-lg border bg-muted/50 p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                          <p className="text-sm font-medium">Espèces confirmées</p>
                        </div>
                        <p className="text-2xl font-bold text-green-600 tabular-nums">
                          {formatCurrency(balanceData?.payments.byMethod.cash?.confirmed || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {balanceData?.payments.byMethod.cash?.count || 0} transactions
                        </p>
                      </div>

                      <div className="rounded-lg border bg-muted/50 p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-3 w-3 rounded-full bg-orange-500" />
                          <p className="text-sm font-medium">Orange Money confirmé</p>
                        </div>
                        <p className="text-2xl font-bold text-orange-600 tabular-nums">
                          {formatCurrency(balanceData?.payments.byMethod.orange_money?.confirmed || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {balanceData?.payments.byMethod.orange_money?.count || 0} transactions
                        </p>
                      </div>

                      <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Total confirmé
                        </p>
                        <p className="text-3xl font-bold text-primary tabular-nums">
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.accounting.byMethod}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingBalance ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                            <BanknoteIcon className="size-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{t.accounting.cashPayments}</p>
                            <p className="text-xs text-muted-foreground">
                              {balanceData?.payments.byMethod.cash?.count || 0} transactions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatAmount(balanceData?.payments.byMethod.cash?.amount || 0)}</p>
                          <p className="text-xs text-success">
                            {formatAmount(balanceData?.payments.byMethod.cash?.confirmed || 0)} confirmé
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                            <Smartphone className="size-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium">{t.accounting.orangeMoneyPayments}</p>
                            <p className="text-xs text-muted-foreground">
                              {balanceData?.payments.byMethod.orange_money?.count || 0} transactions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatAmount(balanceData?.payments.byMethod.orange_money?.amount || 0)}</p>
                          <p className="text-xs text-success">
                            {formatAmount(balanceData?.payments.byMethod.orange_money?.confirmed || 0)} confirmé
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Breakdown by Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.accounting.byStatus}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingBalance ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-green-500" />
                          <span className="text-sm">{t.accounting.confirmed}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{formatAmount(balanceData?.payments.byStatus.confirmed?.amount || 0)}</span>
                          <span className="text-xs text-muted-foreground ml-2">({balanceData?.payments.byStatus.confirmed?.count || 0})</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-orange-500" />
                          <span className="text-sm">Annulés</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{formatAmount(balanceData?.payments.byStatus.reversed?.amount || 0)}</span>
                          <span className="text-xs text-muted-foreground ml-2">({balanceData?.payments.byStatus.reversed?.count || 0})</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-red-500" />
                          <span className="text-sm">Échoués</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{formatAmount(balanceData?.payments.byStatus.failed?.amount || 0)}</span>
                          <span className="text-xs text-muted-foreground ml-2">({balanceData?.payments.byStatus.failed?.count || 0})</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Breakdown by Grade - Progress Bar Design */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t.accounting.byGrade}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingBalance ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : balanceData?.payments.byGrade && Object.keys(balanceData.payments.byGrade).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(balanceData.payments.byGrade)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([grade, data]) => {
                        const confirmedPercent = data.amount > 0
                          ? Math.round((data.confirmed / data.amount) * 100)
                          : 0
                        const progressColor = confirmedPercent >= 80
                          ? "bg-green-500"
                          : confirmedPercent >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"

                        return (
                          <div key={grade} className="flex items-center gap-4">
                            <div className="w-16 shrink-0">
                              <span className="font-medium text-sm">{grade}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="h-6 bg-muted rounded-full overflow-hidden relative">
                                <div
                                  className={`h-full ${progressColor} transition-all duration-300`}
                                  style={{ width: `${confirmedPercent}%` }}
                                />
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                                  {confirmedPercent}% {t.accounting.confirmedPercent}
                                </span>
                              </div>
                            </div>
                            <div className="w-32 text-right shrink-0">
                              <p className="font-bold text-sm">{formatAmount(data.amount)}</p>
                            </div>
                            <div className="w-24 text-right shrink-0 text-muted-foreground text-xs">
                              {data.count} {t.accounting.paymentsCount}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">Aucune donnée disponible</p>
                )}
              </CardContent>
            </Card>

            {/* Link to full payments page */}
            <div className="flex justify-center">
              <Button asChild variant="outline" className="bg-transparent">
                <Link href="/accounting/payments">
                  {t.accounting.viewAllPayments}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>

          {/* ================================================================= */}
          {/* VALIDATION TAB */}
          {/* ================================================================= */}
          <TabsContent value="validation" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{locale === "fr" ? "Validation" : "Validation"}</CardTitle>
                    <CardDescription>
                      {isLoadingPayments
                        ? (locale === "fr" ? "Chargement..." : "Loading...")
                        : `${pendingReviewItems.length} ${t.accounting.itemsToReview}`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={reviewTypeFilter} onValueChange={setReviewTypeFilter}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder={t.accounting.filterByType} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.accounting.allTypes}</SelectItem>
                        <SelectItem value="reversed">{locale === "fr" ? "Annulé" : "Reversed"}</SelectItem>
                        <SelectItem value="failed">{locale === "fr" ? "Échoué" : "Failed"}</SelectItem>
                      </SelectContent>
                    </Select>
                    {reviewTypeFilter !== "all" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReviewTypeFilter("all")}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        {t.common.reset}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingPayments ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  </div>
                ) : pendingReviewItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success opacity-50" />
                    <p>{t.accounting.noItemsToReview}</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.accounting.transactionId}</TableHead>
                          <TableHead>{t.common.student}</TableHead>
                          <TableHead className="text-right">{t.common.amount}</TableHead>
                          <TableHead>{t.accounting.method}</TableHead>
                          <TableHead>{t.common.date}</TableHead>
                          <TableHead>{t.common.status}</TableHead>
                          <TableHead className="text-right">{t.common.actions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingReviewItems.map((payment) => (
                          <TableRow key={payment.id} status={getPaymentRowStatus(payment.status)}>
                            <TableCell className="font-medium font-mono text-sm">
                              {payment.receiptNumber}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {payment.enrollment?.student?.firstName ?? "N/A"} {payment.enrollment?.student?.lastName ?? ""}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {payment.enrollment?.grade?.name ?? "-"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-mono font-semibold">
                              {formatAmount(payment.amount)}
                            </TableCell>
                            <TableCell>{getMethodBadge(payment.method)}</TableCell>
                            <TableCell>
                              {formatDate(payment.recordedAt, locale)}
                            </TableCell>
                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            <TableCell className="text-right">
                              {payment.status === "reversed" && (
                                <span className="text-xs text-orange-600">Annulé</span>
                              )}
                              {payment.status === "failed" && (
                                <span className="text-xs text-destructive">Échoué</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
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

      <RecordExpenseDialog
        open={showExpenseDialog}
        onOpenChange={setShowExpenseDialog}
        onSuccess={handleRefresh}
        currentBalance={treasuryBalance?.registryBalance || 0}
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
