"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  Download,
  Printer,
  Edit3,
  RotateCcw,
  User,
  Calendar,
  FileText,
  BanknoteIcon,
  Smartphone,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Receipt,
  Loader2,
  Mail,
  Phone,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { cn } from "@/lib/utils"
import type { ApiPayment } from "@/lib/hooks/use-api"
import { useToast } from "@/hooks/use-toast"
import { EditPaymentDialog } from "./components/edit-payment-dialog"
import { ReversePaymentDialog } from "./components/reverse-payment-dialog"

interface PaymentDetailsResponse extends ApiPayment {
  balanceInfo?: {
    tuitionFee: number
    totalPaid: number
    remainingBalance: number
  }
}

export default function PaymentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { t, locale } = useI18n()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const paymentId = params.id as string

  // State for PDF download and dialogs
  const [isDownloading, setIsDownloading] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isReverseDialogOpen, setIsReverseDialogOpen] = useState(false)

  // Fetch payment details
  const { data: payment, isLoading, error } = useQuery<PaymentDetailsResponse>({
    queryKey: ["payment", paymentId],
    queryFn: async () => {
      const res = await fetch(`/api/payments/${paymentId}`)
      if (!res.ok) {
        throw new Error("Failed to fetch payment")
      }
      return res.json()
    },
  })

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

  // Get student info (works for both tuition and club payments) - FIXED for club payments
  const getStudentInfo = () => {
    if (payment?.paymentType === "club" && payment.clubEnrollment) {
      const person = payment.clubEnrollment.studentProfile?.person
      if (!person) return null

      return {
        firstName: person.firstName,
        lastName: person.lastName,
        studentNumber: payment.clubEnrollment.studentProfile?.studentNumber || "",
        photoUrl: person.photoUrl || null,
        dateOfBirth: person.dateOfBirth || null,
        gender: person.gender || null,
        guardianName: null,
        guardianPhone: person.phone || null,
        guardianEmail: person.email || null,
        motherName: null,
        motherPhone: null,
        motherEmail: null,
        fatherName: null,
        fatherPhone: null,
        fatherEmail: null,
        gradeName: null,
        clubName: payment.clubEnrollment.club.name,
      }
    }
    if (payment?.enrollment) {
      return {
        firstName: payment.enrollment.student?.firstName || "",
        lastName: payment.enrollment.student?.lastName || "",
        studentNumber: payment.enrollment.student?.studentNumber || "",
        photoUrl: payment.enrollment.student?.photoUrl || null,
        dateOfBirth: payment.enrollment.student?.dateOfBirth || null,
        gender: null,
        guardianName: payment.enrollment.student?.guardianName || null,
        guardianPhone: payment.enrollment.student?.guardianPhone || null,
        guardianEmail: payment.enrollment.student?.guardianEmail || null,
        motherName: payment.enrollment.motherName || null,
        motherPhone: payment.enrollment.motherPhone || null,
        motherEmail: payment.enrollment.motherEmail || null,
        fatherName: payment.enrollment.fatherName || null,
        fatherPhone: payment.enrollment.fatherPhone || null,
        fatherEmail: payment.enrollment.fatherEmail || null,
        gradeName: payment.enrollment.grade?.name || null,
        clubName: null,
      }
    }
    return null
  }

  const studentInfo = getStudentInfo()

  // Parse payer information from notes
  const getPayerInfo = () => {
    if (!payment?.notes) return null
    try {
      const parsed = JSON.parse(payment.notes)
      if (parsed.payer && typeof parsed.payer === 'object') {
        return parsed.payer
      }
    } catch {
      // Not JSON or invalid format
    }
    return null
  }

  const payerInfo = getPayerInfo()
  const regularNotes = payerInfo ? null : payment?.notes

  // Get status config
  const getStatusConfig = () => {
    switch (payment?.status) {
      case "confirmed":
        return {
          icon: CheckCircle2,
          label: t.accounting.confirmed,
          className: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        }
      case "pending":
        return {
          icon: Clock,
          label: t.accounting.pending,
          className: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        }
      case "reversed":
        return {
          icon: RotateCcw,
          label: t.accounting.reversed,
          className: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
        }
      case "failed":
        return {
          icon: XCircle,
          label: t.accounting.failed,
          className: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
        }
      default:
        return {
          icon: AlertCircle,
          label: payment?.status || "Unknown",
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
    setIsDownloading(true)
    try {
      const url = `/api/payments/${payment?.id}/receipt-pdf?lang=${locale}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `receipt-${payment?.receiptNumber}.pdf`
      link.click()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error('PDF download error:', err)
      toast({
        variant: "destructive",
        title: "Download failed",
        description: err instanceof Error ? err.message : "Failed to download PDF",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  // Edit payment success handler
  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['payment', paymentId] })
    toast({
      title: t.accounting.paymentUpdated,
    })
  }

  // Reverse payment success handler
  const handleReverseSuccess = () => {
    toast({
      title: t.accounting.reverseSuccess,
    })
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
  if (error || !payment) {
    return (
      <div className="container max-w-5xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/accounting/payments")}
          className="mb-6"
        >
          <ArrowLeft className="size-4 mr-2" />
          {t.accounting.backToPayments}
        </Button>
        <Card className="border-destructive">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="size-12 mx-auto text-destructive" />
            <h2 className="text-xl font-semibold">{t.accounting.paymentNotFound}</h2>
            <p className="text-muted-foreground">{t.accounting.errorLoadingPayment}</p>
            <Button onClick={() => window.location.reload()}>
              {t.accounting.retry}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon
  const isClubPayment = payment.paymentType === "club"

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
            onClick={() => router.push("/accounting/payments")}
            className="group transition-all hover:scale-105"
          >
            <ArrowLeft className="size-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t.accounting.backToPayments}
          </Button>
        </div>

        {/* Receipt Card */}
        <Card className="print-area overflow-hidden shadow-lg bg-white dark:bg-card relative hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6 md:p-10 space-y-8">
            {/* Enhanced Header - Compact */}
            <div className="text-center space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-center gap-2.5">
                <Receipt className="size-5 text-muted-foreground" />
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                  {t.accounting.officialReceipt}
                </h1>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span>School Management System</span>
                <span>•</span>
                <span className="font-mono">{new Date(payment.recordedAt).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US")}</span>
              </div>

              {/* Inline receipt number */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-muted/60 to-muted/30 border">
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                  {t.accounting.receiptNumber}
                </span>
                <span className="text-base md:text-lg font-mono font-bold">
                  {payment.receiptNumber}
                </span>
              </div>
            </div>

            {/* Enhanced Hero Amount */}
            <div
              className={cn(
                "text-center py-6 md:py-8 rounded-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 border-2",
                isClubPayment
                  ? "bg-gradient-to-br from-purple-50 via-purple-100/50 to-purple-50 dark:from-purple-950/30 dark:via-purple-900/20 dark:to-purple-950/30 border-purple-200/50 dark:border-purple-800/50"
                  : "bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50 dark:from-blue-950/30 dark:via-blue-900/20 dark:to-blue-950/30 border-blue-200/50 dark:border-blue-800/50"
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
                  {t.accounting.amountPaid}
                </div>
                <div className={cn(
                  "text-5xl sm:text-6xl md:text-7xl font-bold font-mono tracking-tighter leading-none",
                  isClubPayment ? "text-purple-900 dark:text-purple-100" : "text-blue-900 dark:text-blue-100"
                )}>
                  {formatCurrency(payment.amount)}
                </div>

                {/* Enhanced badges */}
                <div className="flex items-center justify-center gap-2 md:gap-2.5 flex-wrap mt-4 md:mt-6 px-2 md:px-4">
                  <Badge className={cn(statusConfig.className, "shadow-lg ring-1 ring-black/5 transition-all hover:scale-105 cursor-default")}>
                    <StatusIcon className="size-3.5 mr-2" />
                    {statusConfig.label}
                  </Badge>

                  <Badge
                    variant="outline"
                    className={cn(
                      "font-semibold shadow-md transition-all hover:scale-105 cursor-default",
                      isClubPayment
                        ? "border-purple-400 bg-purple-100 text-purple-800 dark:border-purple-600 dark:bg-purple-950/70 dark:text-purple-200"
                        : "border-blue-400 bg-blue-100 text-blue-800 dark:border-blue-600 dark:bg-blue-950/70 dark:text-blue-200"
                    )}
                  >
                    {isClubPayment ? (
                      <><Sparkles className="size-3.5 mr-2" /> {t.accounting.clubPayments}</>
                    ) : (
                      <><BanknoteIcon className="size-3.5 mr-2" /> {t.accounting.tuitionPayments}</>
                    )}
                  </Badge>

                  <Badge variant="outline" className="shadow-md bg-background/50 transition-all hover:scale-105 cursor-default">
                    {payment.method === "cash" ? (
                      <><BanknoteIcon className="size-3.5 mr-2 text-emerald-600 dark:text-emerald-400" /> {t.accounting.cashPayments}</>
                    ) : (
                      <><Smartphone className="size-3.5 mr-2 text-orange-500" /> {t.accounting.orangeMoneyPayments}</>
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Full-width Content Section */}
            <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              {/* Student Information Card - Horizontal Layout */}
              {studentInfo && (
                <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <User className="size-4" />
                      {t.accounting.studentInformation}
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Avatar and Name */}
                      <div className="flex items-center gap-4 md:min-w-[300px]">
                        <Avatar className="size-20 ring-4 ring-slate-100 dark:ring-slate-800 shadow-lg shrink-0">
                          {studentInfo.photoUrl && (
                            <AvatarImage src={studentInfo.photoUrl} alt={`${studentInfo.firstName} ${studentInfo.lastName}`} />
                          )}
                          <AvatarFallback className="text-2xl font-bold" style={{
                            background: 'linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%)',
                            color: '#1e40af'
                          }}>
                            {studentInfo.firstName.charAt(0)}{studentInfo.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            {studentInfo.firstName} {studentInfo.lastName}
                          </div>
                          {studentInfo.studentNumber && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <span className="font-mono font-semibold tabular-nums">{studentInfo.studentNumber}</span>
                            </div>
                          )}
                          <div className="flex gap-2 flex-wrap pt-1">
                            {studentInfo.gradeName && (
                              <Badge variant="secondary" className="font-medium text-xs shadow-sm">
                                {studentInfo.gradeName}
                              </Badge>
                            )}
                            {studentInfo.clubName && (
                              <Badge className="font-medium text-xs shadow-sm" style={{
                                background: '#f3e8ff',
                                color: '#6b21a8',
                                borderColor: '#c084fc'
                              }}>
                                <Sparkles className="size-3 mr-1.5" />
                                {studentInfo.clubName}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contact Grid */}
                      <div className="flex-1 grid sm:grid-cols-2 gap-4">
                        {studentInfo.dateOfBirth && (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">
                            <div className="size-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                              <Calendar className="size-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs text-slate-500 dark:text-slate-400">Date of Birth</div>
                              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {new Date(studentInfo.dateOfBirth).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { dateStyle: "medium" })}
                              </div>
                            </div>
                          </div>
                        )}

                        {studentInfo.motherName && (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">
                            <div className="size-9 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center shrink-0">
                              <User className="size-4 text-pink-600 dark:text-pink-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs text-slate-500 dark:text-slate-400">Mother</div>
                              <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{studentInfo.motherName}</div>
                              {studentInfo.motherPhone && (
                                <div className="text-xs font-mono text-slate-600 dark:text-slate-400 tabular-nums">{studentInfo.motherPhone}</div>
                              )}
                            </div>
                          </div>
                        )}

                        {studentInfo.guardianName && (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">
                            <div className="size-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                              <User className="size-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs text-slate-500 dark:text-slate-400">Guardian</div>
                              <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{studentInfo.guardianName}</div>
                              {studentInfo.guardianPhone && (
                                <div className="text-xs font-mono text-slate-600 dark:text-slate-400 tabular-nums">{studentInfo.guardianPhone}</div>
                              )}
                            </div>
                          </div>
                        )}

                        {studentInfo.fatherName && (
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">
                            <div className="size-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                              <User className="size-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs text-slate-500 dark:text-slate-400">Father</div>
                              <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{studentInfo.fatherName}</div>
                              {studentInfo.fatherPhone && (
                                <div className="text-xs font-mono text-slate-600 dark:text-slate-400 tabular-nums">{studentInfo.fatherPhone}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline and Payment Breakdown - Side by Side */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Timeline with Payer Info Integrated */}
                <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Calendar className="size-4" />
                      {t.accounting.timeline}
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4 relative pl-8 before:absolute before:left-[11px] before:top-8 before:bottom-8 before:w-[2px] before:bg-gradient-to-b before:from-slate-300 before:via-slate-200 before:to-transparent dark:before:from-slate-600 dark:before:via-slate-700 dark:before:to-transparent">
                      {/* Payment Recorded Event - WITH PAYER INFO */}
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
                              {t.accounting.paymentRecorded}
                            </div>
                            <Badge variant="outline" className="text-xs px-2 py-0.5 border-slate-300 dark:border-slate-600">
                              {t.accounting.statusInitial}
                            </Badge>
                          </div>

                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-3 tabular-nums">
                            {formatDate(payment.recordedAt)}
                          </div>

                          {/* Payer Information Integrated */}
                          {payerInfo && (
                            <div className="mt-4 pt-3 border-t-2 border-slate-100 dark:border-slate-800 space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 flex items-center justify-center shrink-0 shadow-sm">
                                  <User className="size-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    {payerInfo.name}
                                  </div>
                                  {payerInfo.type && (
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                      {payerInfo.type === 'father' ? t.accounting.father :
                                       payerInfo.type === 'mother' ? t.accounting.mother :
                                       t.accounting.guardian}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="grid gap-2 text-xs">
                                {payerInfo.phone && (
                                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                    <Phone className="size-3.5 shrink-0" />
                                    <span className="font-mono tabular-nums">{payerInfo.phone}</span>
                                  </div>
                                )}
                                {payerInfo.email && (
                                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                    <Mail className="size-3.5 shrink-0" />
                                    <span className="truncate">{payerInfo.email}</span>
                                  </div>
                                )}
                              </div>

                              {/* Payment method and type */}
                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Method</div>
                                  <Badge variant="outline" className="text-xs px-2 py-0.5 w-full justify-start">
                                    {payment.method === "cash" ? (
                                      <><BanknoteIcon className="size-3 mr-1.5" /> {t.accounting.cashPayments}</>
                                    ) : (
                                      <><Smartphone className="size-3 mr-1.5" /> Orange</>
                                    )}
                                  </Badge>
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Type</div>
                                  <Badge variant="outline" className="text-xs px-2 py-0.5 w-full justify-start">
                                    {isClubPayment ? (
                                      <><Sparkles className="size-3 mr-1.5" /> Club</>
                                    ) : (
                                      <><BanknoteIcon className="size-3 mr-1.5" /> Tuition</>
                                    )}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}

                          {payment.recorder && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                              <User className="size-3.5" />
                              <span className="receipt-sans">Recorded by {payment.recorder.name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Confirmed Event */}
                      {payment.confirmedAt && (
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
                                {t.accounting.paymentConfirmed}
                              </div>
                              <Badge className="text-xs px-2 py-0.5 bg-emerald-600 dark:bg-emerald-700">
                                {t.accounting.statusVerified}
                              </Badge>
                            </div>

                            <div className="text-xs text-emerald-700 dark:text-emerald-300 font-mono tabular-nums">
                              {formatDate(payment.confirmedAt)}
                            </div>

                            {payment.confirmer && (
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
                                <User className="size-3.5" />
                                <span className="receipt-sans">Confirmed by {payment.confirmer.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Pending placeholder */}
                      {!payment.confirmedAt && (
                        <div className="relative opacity-50">
                          <div className="absolute left-[-27px] top-2 size-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 ring-4 ring-background" />
                          <div className="bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-4">
                            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                              Awaiting Confirmation
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Pending review</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown */}
                {!isClubPayment && payment.balanceInfo && (
                  <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm" style={{
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)'
                  }}>
                    <div className="px-6 py-4 border-b-2" style={{
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                      borderColor: '#38bdf8'
                    }}>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <BanknoteIcon className="size-4" />
                        {t.accounting.paymentBreakdown}
                      </h3>
                    </div>

                    <div className="p-6 space-y-5">
                      {/* Progress bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold" style={{ color: '#0c4a6e' }}>
                          <span>Payment Progress</span>
                          <span className="tabular-nums">{Math.round((payment.balanceInfo.totalPaid / payment.balanceInfo.tuitionFee) * 100)}%</span>
                        </div>
                        <div className="h-3 bg-white dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border-2 border-blue-200 dark:border-blue-800">
                          <div
                            className="h-full rounded-full transition-all duration-700 shadow-sm"
                            style={{
                              width: `${Math.min((payment.balanceInfo.totalPaid / payment.balanceInfo.tuitionFee) * 100, 100)}%`,
                              background: 'linear-gradient(90deg, #0ea5e9 0%, #10b981 100%)'
                            }}
                          />
                        </div>
                      </div>

                      <Separator className="bg-blue-200 dark:bg-blue-800" />

                      {/* Breakdown items */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800 shadow-sm">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {t.accounting.totalTuitionFee}
                          </span>
                          <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                            {formatCurrency(payment.balanceInfo.tuitionFee)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 shadow-sm">
                          <span className="text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                            <CheckCircle2 className="size-4" />
                            {t.accounting.amountPaid}
                          </span>
                          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 font-mono tabular-nums">
                            {formatCurrency(payment.balanceInfo.totalPaid)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center px-4 py-3 rounded-xl border-2 shadow-sm" style={{
                          background: '#dbeafe',
                          borderColor: '#60a5fa'
                        }}>
                          <span className="text-sm font-semibold" style={{ color: '#1e40af' }}>
                            {t.accounting.thisPayment}
                          </span>
                          <span className="text-sm font-bold font-mono tabular-nums" style={{ color: '#1e40af' }}>
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>
                      </div>

                      <Separator className="bg-blue-300 dark:bg-blue-700" />

                      {/* Remaining balance */}
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-base text-slate-900 dark:text-slate-100">
                          {t.accounting.remainingBalance}
                        </span>
                        <span
                          className="text-2xl font-bold font-mono tabular-nums"
                          style={{
                            color: payment.balanceInfo.remainingBalance > 0 ? '#f59e0b' : '#10b981'
                          }}
                        >
                          {formatCurrency(payment.balanceInfo.remainingBalance)}
                        </span>
                      </div>

                      {/* Fully paid badge */}
                      {payment.balanceInfo.remainingBalance === 0 && (
                        <div className="mt-4 p-4 rounded-xl border-2 shadow-md" style={{
                          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                          borderColor: '#6ee7b7'
                        }}>
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full flex items-center justify-center shadow-sm" style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            }}>
                              <CheckCircle2 className="size-6 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-bold" style={{ color: '#065f46' }}>
                                {t.accounting.paidUp}
                              </div>
                              <div className="text-xs" style={{ color: '#047857' }}>
                                Tuition fully paid
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Regular Notes (if present and no payer info) */}
                {regularNotes && (
                  <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 bg-amber-100 dark:bg-amber-900/30 border-b-2 border-amber-200 dark:border-amber-800">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-2">
                        <FileText className="size-4" />
                        {t.accounting.paymentNotes}
                      </h3>
                    </div>
                    <div className="p-6">
                      <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
                        {regularNotes}
                      </p>
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
                  className="gap-3 shadow-lg hover:shadow-xl transition-all group font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
                  }}
                >
                  <Printer className="size-5 group-hover:scale-110 transition-transform" />
                  <span>{t.accounting.printReceipt}</span>
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 shadow-md hover:shadow-lg transition-all flex-1 sm:flex-initial font-medium border-2 border-slate-300 dark:border-slate-600"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        <span>{t.common.downloading}</span>
                      </>
                    ) : (
                      <>
                        <Download className="size-5" />
                        <span>{t.accounting.downloadPDF}</span>
                      </>
                    )}
                  </Button>

                  {payment.status !== "confirmed" && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 shadow-md hover:shadow-lg transition-all flex-1 sm:flex-initial font-medium border-2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      onClick={() => setIsEditDialogOpen(true)}
                    >
                      <Edit3 className="size-5" />
                      <span>{t.accounting.editPayment}</span>
                    </Button>
                  )}

                  {payment.status === "confirmed" && (
                    <Button
                      variant="destructive"
                      size="lg"
                      className="gap-2 shadow-md flex-1 sm:flex-initial font-medium"
                      onClick={() => setIsReverseDialogOpen(true)}
                    >
                      <RotateCcw className="size-5" />
                      <span>{t.accounting.reverseTransaction}</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-8 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div className="font-mono tabular-nums">Receipt ID: {payment.receiptNumber}</div>
                <div className="opacity-70">
                  Generated on {new Date().toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { dateStyle: "long" })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Payment Dialog */}
        {payment && (
          <EditPaymentDialog
            payment={payment}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSuccess={handleEditSuccess}
          />
        )}

        {/* Reverse Payment Dialog */}
        {payment && (
          <ReversePaymentDialog
            payment={payment}
            open={isReverseDialogOpen}
            onOpenChange={setIsReverseDialogOpen}
            onSuccess={handleReverseSuccess}
          />
        )}
      </PageContainer>
    </>
  )
}
