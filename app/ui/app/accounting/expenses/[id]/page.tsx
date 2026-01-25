"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Receipt,
  Loader2,
  User,
  Calendar,
  FileText,
  BanknoteIcon,
  Smartphone,
  Check,
  X,
  Trash2,
  Wrench,
  Zap,
  Users,
  Truck,
  Phone as PhoneIcon,
  HelpCircle,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { pdf } from "@react-pdf/renderer"
import { ExpenseReceiptDocument } from "@/lib/pdf/expense-receipt-document"

interface User {
  id: string
  name: string
  email?: string
}

interface Expense {
  id: string
  category: string
  description: string
  amount: number
  method: string
  date: string
  vendorName?: string | null
  receiptUrl?: string | null
  status: string
  rejectionReason?: string | null
  createdAt: string
  approvedAt?: string | null
  paidAt?: string | null
  requester?: User | null
  approver?: User | null
}

export default function ExpenseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { t, locale } = useI18n()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const expenseId = params.id as string

  // State for actions
  const [actionType, setActionType] = useState<"approve" | "reject" | "mark_paid" | "delete" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [safeBalance, setSafeBalance] = useState<number | null>(null)

  // Fetch expense details
  const { data: expense, isLoading, error } = useQuery<Expense>({
    queryKey: ["expense", expenseId],
    queryFn: async () => {
      const res = await fetch(`/api/expenses/${expenseId}`)
      if (!res.ok) {
        throw new Error("Failed to fetch expense")
      }
      return res.json()
    },
  })

  // Fetch safe balance for payment confirmation
  useEffect(() => {
    fetch('/api/treasury/balance')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          // Use the appropriate balance based on expense method
          if (expense?.method === "cash") {
            setSafeBalance(data.registryBalance || 0)
          } else if (expense?.method === "orange_money") {
            setSafeBalance(data.mobileMoneyBalance || 0)
          } else {
            setSafeBalance(data.safeBalance || 0)
          }
        }
      })
      .catch(console.error)
  }, [expense?.method])

  // Currency formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "fr" ? "fr-GN" : "en-US", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Date formatter
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString))
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ElementType> = {
      supplies: FileText,
      maintenance: Wrench,
      utilities: Zap,
      salary: Users,
      transport: Truck,
      communication: PhoneIcon,
      other: HelpCircle,
    }
    return icons[category] || HelpCircle
  }

  // Get category label
  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      supplies: t.expenses.categories.supplies,
      maintenance: t.expenses.categories.maintenance,
      utilities: t.expenses.categories.utilities,
      salary: t.expenses.categories.salary,
      transport: t.expenses.categories.transport,
      communication: t.expenses.categories.communication,
      other: t.expenses.categories.other,
    }
    return categories[category] || category
  }

  // Get status config
  const getStatusConfig = () => {
    switch (expense?.status) {
      case "approved":
        return {
          icon: CheckCircle2,
          label: t.expenses.approved,
          className: "bg-primary/10 text-primary border-primary/30",
        }
      case "pending":
        return {
          icon: Clock,
          label: t.expenses.pending,
          className: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        }
      case "rejected":
        return {
          icon: XCircle,
          label: t.expenses.rejected,
          className: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
        }
      case "paid":
        return {
          icon: CheckCircle2,
          label: t.expenses.paid,
          className: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        }
      default:
        return {
          icon: AlertCircle,
          label: expense?.status || "Unknown",
          className: "bg-gray-50 dark:bg-gray-950/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800",
        }
    }
  }

  // Print handler
  const handlePrint = () => {
    window.print()
  }

  // PDF download handler
  const handleDownloadPDF = async () => {
    if (!expense) return

    try {
      const pdfData: import("@/lib/pdf/expense-receipt-document").ExpenseReceiptData = {
        expenseId: expense.id,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        method: expense.method as "cash" | "orange_money",
        date: expense.date,
        transactionRef: undefined, // TODO: Add transactionRef to Expense interface if available
        supplier: undefined, // TODO: Add supplier to Expense interface
        billingReferenceId: undefined, // TODO: Add billingReferenceId to Expense interface
        requester: expense.requester || { name: "Unknown" },
        initiatedBy: undefined, // TODO: Add initiatedBy to Expense interface
        approver: expense.approver || undefined,
        approvedAt: expense.approvedAt || undefined,
        createdAt: expense.createdAt,
        status: expense.status,
      }

      // Generate PDF
      const doc = <ExpenseReceiptDocument data={pdfData} language={locale as "en" | "fr"} />
      const asPdf = pdf(doc)
      const blob = await asPdf.toBlob()

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `expense-${expense.id.substring(0, 8)}-receipt.pdf`
      link.click()

      // Cleanup
      URL.revokeObjectURL(url)

      toast({
        title: locale === "fr" ? "PDF téléchargé" : "PDF downloaded",
        description: locale === "fr" ? "Le reçu a été téléchargé avec succès" : "Receipt downloaded successfully",
      })
    } catch (error) {
      console.error("PDF generation error:", error)
      toast({
        variant: "destructive",
        title: locale === "fr" ? "Erreur de génération PDF" : "PDF generation error",
        description: locale === "fr" ? "Impossible de générer le PDF" : "Failed to generate PDF",
      })
    }
  }

  // Handle expense action
  const handleExpenseAction = async () => {
    if (!expense || !actionType) return

    setIsSubmitting(true)
    try {
      if (actionType === "delete") {
        const res = await fetch(`/api/expenses/${expense.id}`, {
          method: "DELETE",
        })
        if (!res.ok) throw new Error("Failed to delete expense")

        toast({
          title: t.expenses.expenseDeleted || "Expense deleted",
        })
        router.push("/expenses")
        return
      }

      // Use /pay route for mark_paid action, /approve route for approve/reject
      const endpoint = actionType === "mark_paid"
        ? `/api/expenses/${expense.id}/pay`
        : `/api/expenses/${expense.id}/approve`

      const body = actionType === "mark_paid"
        ? {} // pay route doesn't need action in body
        : {
            action: actionType,
            rejectionReason: actionType === "reject" ? rejectionReason : undefined,
          }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Action failed")
      }

      queryClient.invalidateQueries({ queryKey: ['expense', expenseId] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })

      toast({
        title: actionType === "approve" ? t.expenses.expenseApproved || "Expense approved" :
               actionType === "reject" ? t.expenses.expenseRejected || "Expense rejected" :
               t.expenses.expenseMarkedPaid || "Expense marked as paid",
      })

      setActionType(null)
      setRejectionReason("")
    } catch (err) {
      console.error('Expense action error:', err)
      toast({
        variant: "destructive",
        title: "Action failed",
        description: err instanceof Error ? err.message : "Failed to complete action",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <PageContainer maxWidth="full" className="space-y-6">
        <Skeleton className="h-10 w-48 animate-pulse" />
        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-6 md:p-10 space-y-8">
            <div className="text-center space-y-4">
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-12 w-48 mx-auto" />
            </div>
            <div className="py-12 rounded-2xl bg-muted/20 flex flex-col items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-80" />
            </div>
            <Skeleton className="h-96 w-full rounded-xl" />
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  // Error state
  if (error || !expense) {
    return (
      <div className="container max-w-5xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/expenses")}
          className="mb-6"
        >
          <ArrowLeft className="size-4 mr-2" />
          {t.expenses.backToExpenses || "Back to Expenses"}
        </Button>
        <Card className="border-destructive">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="size-12 mx-auto text-destructive" />
            <h2 className="text-xl font-semibold">{t.expenses.expenseNotFound || "Expense Not Found"}</h2>
            <p className="text-muted-foreground">{t.expenses.errorLoadingExpense || "Failed to load expense details"}</p>
            <Button onClick={() => window.location.reload()}>
              {t.accounting.retry || "Retry"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon
  const CategoryIcon = getCategoryIcon(expense.category)

  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @keyframes shimmer {
          from { background-position: -200% 0; }
          to { background-position: 200% 0; }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <PageContainer maxWidth="full" className="space-y-6">
        {/* Back Button */}
        <div className="no-print">
          <Button
            variant="ghost"
            onClick={() => router.push("/expenses")}
            className="group transition-all hover:scale-105"
          >
            <ArrowLeft className="size-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t.expenses.backToExpenses || "Back to Expenses"}
          </Button>
        </div>

        {/* Expense Card */}
        <Card className="print-area overflow-hidden shadow-lg bg-white dark:bg-card relative hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6 md:p-10 space-y-8">
            {/* Enhanced Header - Compact */}
            <div className="text-center space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-center gap-2.5">
                <Receipt className="size-5 text-muted-foreground" />
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                  {t.expenses.expenseDetails || "Expense Details"}
                </h1>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span>School Management System</span>
                <span>•</span>
                <span className="font-mono">{new Date(expense.createdAt).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US")}</span>
              </div>

              {/* Inline expense ID */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-muted/60 to-muted/30 border">
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                  {t.expenses.expenseId || "Expense ID"}
                </span>
                <span className="text-base md:text-lg font-mono font-bold">
                  {expense.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Enhanced Hero Amount */}
            <div
              className={cn(
                "text-center py-6 md:py-8 rounded-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 border-2",
                "bg-gradient-to-br from-orange-50 via-orange-100/50 to-orange-50 dark:from-orange-950/30 dark:via-orange-900/20 dark:to-orange-950/30 border-orange-200/50 dark:border-orange-800/50"
              )}
            >
              {/* Animated shimmer overlay */}
              <div className="absolute inset-0 opacity-20">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                  style={{
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 3s infinite linear'
                  }}
                />
              </div>

              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)`
              }} />

              <div className="relative z-10 space-y-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground/80">
                  {t.expenses.expenseAmount || "Expense Amount"}
                </div>
                <div className="text-5xl sm:text-6xl md:text-7xl font-bold font-mono tracking-tighter leading-none text-orange-900 dark:text-orange-100">
                  {formatCurrency(expense.amount)}
                </div>

                {/* Enhanced badges */}
                <div className="flex items-center justify-center gap-2 md:gap-2.5 flex-wrap mt-4 md:mt-6 px-2 md:px-4">
                  <Badge className={cn(statusConfig.className, "shadow-lg ring-1 ring-black/5 transition-all hover:scale-105 cursor-default")}>
                    <StatusIcon className="size-3.5 mr-2" />
                    {statusConfig.label}
                  </Badge>

                  <Badge
                    variant="outline"
                    className="font-semibold shadow-md transition-all hover:scale-105 cursor-default border-orange-400 bg-orange-100 text-orange-800 dark:border-orange-600 dark:bg-orange-950/70 dark:text-orange-200"
                  >
                    <CategoryIcon className="size-3.5 mr-2" />
                    {getCategoryLabel(expense.category)}
                  </Badge>

                  <Badge variant="outline" className="shadow-md bg-background/50 transition-all hover:scale-105 cursor-default">
                    {expense.method === "cash" ? (
                      <><BanknoteIcon className="size-3.5 mr-2 text-emerald-600 dark:text-emerald-400" /> {t.expenses.cash}</>
                    ) : (
                      <><Smartphone className="size-3.5 mr-2 text-orange-500" /> {t.expenses.orangeMoney}</>
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Full-width Content Section */}
            <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              {/* Expense Information Card */}
              <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <FileText className="size-4" />
                    {t.expenses.expenseInformation || "Expense Information"}
                  </h3>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">
                      <div className="size-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <Calendar className="size-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-slate-500 dark:text-slate-400">{t.expenses.expenseDate || "Expense Date"}</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {new Date(expense.date).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { dateStyle: "medium" })}
                        </div>
                      </div>
                    </div>

                    {expense.vendorName && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">
                        <div className="size-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                          <User className="size-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-slate-500 dark:text-slate-400">{t.expenses.vendor || "Vendor"}</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{expense.vendorName}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t.expenses.description}</div>
                    <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
                      {expense.description}
                    </p>
                  </div>

                  {expense.receiptUrl && (
                    <a
                      href={expense.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      <ExternalLink className="size-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {t.expenses.viewReceipt || "View Receipt"}
                      </span>
                    </a>
                  )}
                </div>
              </div>

              {/* Timeline and Requester - Side by Side */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Timeline */}
                <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Calendar className="size-4" />
                      {t.accounting.timeline || "Timeline"}
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4 relative pl-8 before:absolute before:left-[11px] before:top-8 before:bottom-8 before:w-[2px] before:bg-gradient-to-b before:from-slate-300 before:via-slate-200 before:to-transparent dark:before:from-slate-600 dark:before:via-slate-700 dark:before:to-transparent">
                      {/* Expense Created Event */}
                      <div className="relative group">
                        <div
                          className="absolute left-[-27px] top-2 size-6 rounded-full ring-4 ring-background shadow-lg transition-transform group-hover:scale-110"
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                          }}
                        />
                        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                              {t.expenses.expenseCreated || "Expense Created"}
                            </div>
                            <Badge variant="outline" className="text-xs px-2 py-0.5 border-slate-300 dark:border-slate-600">
                              {t.accounting.statusInitial || "Initial"}
                            </Badge>
                          </div>

                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-3 tabular-nums">
                            {formatDate(expense.createdAt)}
                          </div>

                          {expense.requester && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                              <User className="size-3.5" />
                              <span>Requested by {expense.requester.name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Approved Event */}
                      {expense.approvedAt && expense.status !== "rejected" && (
                        <div className="relative group">
                          <div
                            className="absolute left-[-27px] top-2 size-6 rounded-full ring-4 ring-background shadow-lg transition-transform group-hover:scale-110"
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            }}
                          />
                          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="text-base font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                                <CheckCircle2 className="size-5" />
                                {t.expenses.expenseApproved || "Expense Approved"}
                              </div>
                              <Badge className="text-xs px-2 py-0.5 bg-emerald-600 dark:bg-emerald-700">
                                {t.accounting.statusVerified || "Verified"}
                              </Badge>
                            </div>

                            <div className="text-xs text-emerald-700 dark:text-emerald-300 font-mono tabular-nums">
                              {formatDate(expense.approvedAt)}
                            </div>

                            {expense.approver && (
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
                                <User className="size-3.5" />
                                <span>Approved by {expense.approver.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Rejected Event */}
                      {expense.status === "rejected" && (
                        <div className="relative group">
                          <div
                            className="absolute left-[-27px] top-2 size-6 rounded-full ring-4 ring-background shadow-lg transition-transform group-hover:scale-110"
                            style={{
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                            }}
                          />
                          <div className="bg-red-50 dark:bg-red-950/30 rounded-xl border-2 border-red-200 dark:border-red-800 p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="text-base font-bold text-red-900 dark:text-red-100 flex items-center gap-2">
                                <XCircle className="size-5" />
                                {t.expenses.expenseRejected || "Expense Rejected"}
                              </div>
                            </div>

                            {expense.rejectionReason && (
                              <div className="text-sm text-red-800 dark:text-red-200 mt-2">
                                {expense.rejectionReason}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Paid Event */}
                      {expense.paidAt && (
                        <div className="relative group">
                          <div
                            className="absolute left-[-27px] top-2 size-6 rounded-full ring-4 ring-background shadow-lg transition-transform group-hover:scale-110"
                            style={{
                              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                            }}
                          />
                          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="text-base font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                                <CheckCircle2 className="size-5" />
                                {t.expenses.expensePaid || "Expense Paid"}
                              </div>
                              <Badge className="text-xs px-2 py-0.5 bg-emerald-600 dark:bg-emerald-700">
                                {t.expenses.completed || "Completed"}
                              </Badge>
                            </div>

                            <div className="text-xs text-emerald-700 dark:text-emerald-300 font-mono tabular-nums">
                              {formatDate(expense.paidAt)}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pending placeholder */}
                      {expense.status === "pending" && (
                        <div className="relative opacity-50">
                          <div className="absolute left-[-27px] top-2 size-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 ring-4 ring-background" />
                          <div className="bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-4">
                            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                              Awaiting Approval
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Pending review</div>
                          </div>
                        </div>
                      )}

                      {expense.status === "approved" && !expense.paidAt && (
                        <div className="relative opacity-50">
                          <div className="absolute left-[-27px] top-2 size-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 ring-4 ring-background" />
                          <div className="bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-4">
                            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                              Awaiting Payment
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Ready to be paid</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Requester Information */}
                {expense.requester && (
                  <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <User className="size-4" />
                        {t.expenses.requesterInformation || "Requester Information"}
                      </h3>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">
                        <div className="size-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                          <User className="size-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-slate-500 dark:text-slate-400">{t.common.name || "Name"}</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{expense.requester.name}</div>
                        </div>
                      </div>

                      {expense.requester.email && (
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">
                          <div className="size-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                            <FileText className="size-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs text-slate-500 dark:text-slate-400">{t.common.email || "Email"}</div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{expense.requester.email}</div>
                          </div>
                        </div>
                      )}

                      {expense.approver && (
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-100/50 dark:bg-emerald-800/50">
                          <div className="size-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs text-slate-500 dark:text-slate-400">{t.expenses.approvedBy || "Approved By"}</div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{expense.approver.name}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="no-print pt-10 border-t-2 border-slate-200 dark:border-slate-700 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-center">
                <Button
                  onClick={handlePrint}
                  size="lg"
                  variant="outline"
                  className="gap-3 shadow-lg hover:shadow-xl transition-all group font-semibold border-2"
                >
                  <Printer className="size-5 group-hover:scale-110 transition-transform" />
                  <span>{t.accounting.printReceipt || "Print"}</span>
                </Button>

                {/* Download PDF button - only for approved/paid expenses */}
                {(expense.status === "approved" || expense.status === "paid") && (
                  <Button
                    onClick={handleDownloadPDF}
                    size="lg"
                    variant="outline"
                    className="gap-3 shadow-lg hover:shadow-xl transition-all group font-semibold border-2 border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                  >
                    <Download className="size-5 group-hover:scale-110 transition-transform" />
                    <span>{t.expenses?.downloadPdf || "Download PDF"}</span>
                  </Button>
                )}

                <div className="flex gap-3 flex-wrap justify-center">
                  {expense.status === "pending" && (
                    <>
                      <Button
                        size="lg"
                        className="gap-2 shadow-md hover:shadow-lg transition-all font-medium"
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        }}
                        onClick={() => setActionType("approve")}
                      >
                        <Check className="size-5" />
                        <span>{t.expenses.approve || "Approve"}</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="lg"
                        className="gap-2 shadow-md hover:shadow-lg transition-all font-medium border-2 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => setActionType("reject")}
                      >
                        <X className="size-5" />
                        <span>{t.expenses.reject || "Reject"}</span>
                      </Button>

                      <Button
                        variant="destructive"
                        size="lg"
                        className="gap-2 shadow-md font-medium"
                        onClick={() => setActionType("delete")}
                      >
                        <Trash2 className="size-5" />
                        <span>{t.common.delete || "Delete"}</span>
                      </Button>
                    </>
                  )}

                  {expense.status === "approved" && (
                    <Button
                      size="lg"
                      className="gap-2 shadow-md hover:shadow-lg transition-all font-medium"
                      style={{
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
                      }}
                      onClick={() => setActionType("mark_paid")}
                    >
                      <CheckCircle2 className="size-5" />
                      <span>{t.expenses.markPaid || "Mark as Paid"}</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-8 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div className="font-mono tabular-nums">Expense ID: {expense.id.slice(0, 8).toUpperCase()}</div>
                <div className="opacity-70">
                  Generated on {new Date().toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { dateStyle: "long" })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContainer>

      {/* Action Confirmation Dialog */}
      <AlertDialog
        open={!!actionType}
        onOpenChange={(open) => {
          if (!open) {
            setActionType(null)
            setRejectionReason("")
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve" && (t.expenses.approveExpense || "Approve Expense")}
              {actionType === "reject" && (t.expenses.rejectExpense || "Reject Expense")}
              {actionType === "mark_paid" && (t.expenses.markAsPaid || "Mark as Paid")}
              {actionType === "delete" && (t.expenses.deleteExpense || "Delete Expense")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve" && (
                <>
                  {t.expenses.confirmApproveExpenseAmount || "Approve expense of"}{" "}
                  <strong>{formatCurrency(expense.amount)}</strong>?
                </>
              )}
              {actionType === "reject" && (
                <div className="space-y-4">
                  <p>{t.expenses.confirmRejectExpenseQuestion || "Are you sure you want to reject this expense?"}</p>
                  <div className="grid gap-2">
                    <Label>{t.expenses.rejectionReason || "Rejection Reason"} *</Label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder={t.expenses.rejectionReasonPlaceholder || "Enter reason for rejection"}
                      rows={2}
                    />
                  </div>
                </div>
              )}
              {actionType === "mark_paid" && (
                <div className="space-y-3">
                  <p>
                    {t.expenses.confirmMarkPaidExpenseAmount || "Mark expense of"}{" "}
                    <strong>{formatCurrency(expense.amount)}</strong>{" "}
                    {t.expenses.confirmMarkPaidExpenseAmountEnd || "as paid?"}
                  </p>

                  {safeBalance !== null && (
                    <div className="rounded-md border p-3 space-y-2 bg-muted/50">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current safe balance:</span>
                        <span className="font-medium">{formatCurrency(safeBalance)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount to deduct:</span>
                        <span className="font-medium text-destructive">
                          -{formatCurrency(expense.amount)}
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between text-sm font-semibold">
                        <span>New balance:</span>
                        <span className={
                          safeBalance - expense.amount < 0
                            ? 'text-destructive'
                            : 'text-success'
                        }>
                          {formatCurrency(safeBalance - expense.amount)}
                        </span>
                      </div>

                      {safeBalance < expense.amount && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            Insufficient funds in safe. Add funds before paying.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
              )}
              {actionType === "delete" && (
                <>
                  {t.expenses.confirmDeleteExpense || "Are you sure you want to delete this expense? This action cannot be undone."}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExpenseAction}
              disabled={
                isSubmitting ||
                (actionType === "reject" && !rejectionReason) ||
                (actionType === "mark_paid" && safeBalance !== null && safeBalance < expense.amount) ||
                false
              }
              className={actionType === "delete" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
              {actionType === "approve" && (t.expenses.approve || "Approve")}
              {actionType === "reject" && (t.expenses.reject || "Reject")}
              {actionType === "mark_paid" && (t.expenses.markPaid || "Mark Paid")}
              {actionType === "delete" && (t.common.delete || "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
