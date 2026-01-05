"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  User,
  Users,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Trash2,
  UserCheck,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout/PageContainer"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { EnrollmentStatus, PaymentSchedule, Payment, EnrollmentNote } from "@/lib/enrollment/types"

interface EnrollmentDetail {
  id: string
  enrollmentNumber: string | null
  firstName: string
  lastName: string
  dateOfBirth: string | null
  gender: string | null
  phone: string | null
  email: string | null
  photoUrl: string | null
  fatherName: string | null
  fatherPhone: string | null
  fatherEmail: string | null
  motherName: string | null
  motherPhone: string | null
  motherEmail: string | null
  address: string | null
  enrollingPersonType: string | null
  enrollingPersonName: string | null
  enrollingPersonRelation: string | null
  enrollingPersonPhone: string | null
  enrollingPersonEmail: string | null
  status: EnrollmentStatus
  currentStep: number
  isReturningStudent: boolean
  submittedAt: string | null
  approvedAt: string | null
  autoApproveAt: string | null
  statusComment: string | null
  statusChangedAt: string | null
  originalTuitionFee: number
  adjustedTuitionFee: number | null
  adjustmentReason: string | null
  createdAt: string
  tuitionFee: number
  totalPaid: number
  remainingBalance: number
  grade: {
    id: string
    name: string
    level: string
  }
  schoolYear: {
    id: string
    name: string
  }
  paymentSchedules: PaymentSchedule[]
  payments: Payment[]
  notes: (EnrollmentNote & { author: { name: string; email: string } })[]
  creator: { name: string; email: string }
  approver: { name: string; email: string } | null
}

const statusConfig: Record<EnrollmentStatus, { label: string; labelFr: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"; icon: React.ElementType; className?: string }> = {
  draft: { label: "Draft", labelFr: "Brouillon", variant: "secondary", icon: FileText },
  submitted: { label: "Submitted", labelFr: "Soumis", variant: "default", icon: Clock, className: "bg-blue-500 text-white dark:bg-blue-600" },
  needs_review: { label: "Needs Review", labelFr: "En attente de validation", variant: "warning", icon: AlertCircle },
  completed: { label: "Completed", labelFr: "Terminé", variant: "success", icon: CheckCircle },
  rejected: { label: "Rejected", labelFr: "Rejeté", variant: "destructive", icon: XCircle },
  cancelled: { label: "Cancelled", labelFr: "Annulé", variant: "secondary", icon: XCircle },
}

export default function EnrollmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { t, locale } = useI18n()
  const router = useRouter()
  const [enrollment, setEnrollment] = useState<EnrollmentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [comment, setComment] = useState("")
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    async function fetchEnrollment() {
      try {
        const response = await fetch(`/api/enrollments/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch enrollment")
        }
        const data = await response.json()
        setEnrollment(data)
      } catch (err) {
        console.error("Error fetching enrollment:", err)
        setError("Failed to load enrollment")
      } finally {
        setIsLoading(false)
      }
    }

    async function fetchUserRole() {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const session = await response.json()
          setUserRole(session?.user?.role || "")
        }
      } catch (err) {
        console.error("Error fetching session:", err)
      }
    }

    fetchEnrollment()
    fetchUserRole()
  }, [id])

  const handleApprove = async () => {
    if (!comment.trim()) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/enrollments/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: comment.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to approve enrollment")
      }

      const updated = await response.json()
      setEnrollment((prev) => prev ? { ...prev, ...updated } : null)
      setShowApproveDialog(false)
      setComment("")
    } catch (err) {
      console.error("Error approving enrollment:", err)
      alert(err instanceof Error ? err.message : "Failed to approve enrollment")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!comment.trim()) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/enrollments/${id}/approve`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: comment.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to reject enrollment")
      }

      const updated = await response.json()
      setEnrollment((prev) => prev ? { ...prev, ...updated } : null)
      setShowRejectDialog(false)
      setComment("")
    } catch (err) {
      console.error("Error rejecting enrollment:", err)
      alert(err instanceof Error ? err.message : "Failed to reject enrollment")
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!comment.trim()) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/enrollments/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: comment.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to cancel enrollment")
      }

      const updated = await response.json()
      setEnrollment((prev) => prev ? { ...prev, ...updated } : null)
      setShowCancelDialog(false)
      setComment("")
    } catch (err) {
      console.error("Error cancelling enrollment:", err)
      alert(err instanceof Error ? err.message : "Failed to cancel enrollment")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/enrollments/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to delete enrollment")
      }

      // Redirect to enrollments list after successful deletion
      router.push("/enrollments")
    } catch (err) {
      console.error("Error deleting enrollment:", err)
      alert(err instanceof Error ? err.message : "Failed to delete enrollment")
      setActionLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-GN", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !enrollment) {
    return (
      <PageContainer maxWidth="full">
        <div className="text-center py-8">
          <p className="text-destructive mb-4">{error || "Enrollment not found"}</p>
          <Button asChild>
            <Link href="/enrollments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.common.back}
            </Link>
          </Button>
        </div>
      </PageContainer>
    )
  }

  const status = statusConfig[enrollment.status]
  const StatusIcon = status.icon
  const isDirector = userRole === "director"
  const canApproveReject = isDirector && ["submitted", "needs_review"].includes(enrollment.status)
  const canCancel = enrollment.status === "draft"

  return (
    <PageContainer maxWidth="full">
      {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/enrollments">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {enrollment.firstName} {enrollment.lastName}
                </h1>
                <Badge variant={status.variant} className={cn("gap-1", status.className)}>
                  <StatusIcon className="h-3 w-3" />
                  {locale === "fr" ? status.labelFr : status.label}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {enrollment.enrollmentNumber || "Draft"} | {enrollment.grade.name} | {enrollment.schoolYear.name}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {canCancel && (
              <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
                <XCircle className="h-4 w-4 mr-2" />
                {locale === "fr" ? "Annuler" : "Cancel"}
              </Button>
            )}
            {(enrollment.status === "draft" || enrollment.status === "cancelled") && (
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white border-amber-500 hover:border-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t.common.delete}
              </Button>
            )}
            {["draft", "submitted", "needs_review"].includes(enrollment.status) && (
              <Button
                asChild
                className="bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700"
              >
                <Link href={enrollment.status === "draft"
                  ? `/enrollments/new?draft=${enrollment.id}&step=${enrollment.currentStep || 1}`
                  : `/enrollments/new?draft=${enrollment.id}&step=5`
                }>
                  {enrollment.status === "draft" ? t.enrollments.continueEnrollment : t.common.edit}
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Status Comment Alert */}
        {enrollment.statusComment && enrollment.status !== "draft" && (
          <Card className="mb-6 border-l-4 border-l-primary">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">
                    {locale === "fr" ? "Commentaire de statut" : "Status Comment"}
                  </p>
                  <p className="text-muted-foreground">{enrollment.statusComment}</p>
                  {enrollment.statusChangedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(enrollment.statusChangedAt)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Section Card */}
        {canApproveReject && (() => {
          const hasTuitionAdjustment = enrollment.adjustedTuitionFee &&
            enrollment.adjustedTuitionFee !== enrollment.originalTuitionFee
          const minimumPayment = Math.floor(enrollment.tuitionFee / 9)
          const hasLowInitialPayment = enrollment.status === "needs_review" &&
            !hasTuitionAdjustment &&
            enrollment.totalPaid < minimumPayment

          return (
            <Card className="mb-6 border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-5 w-5" />
                  {hasTuitionAdjustment
                    ? (locale === "fr" ? "Validation requise - Ajustement des frais" : "Review Required - Tuition Adjustment")
                    : hasLowInitialPayment
                      ? (locale === "fr" ? "Validation requise - Paiement initial insuffisant" : "Review Required - Low Initial Payment")
                      : (locale === "fr" ? "En attente de validation" : "Pending Review")
                  }
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasTuitionAdjustment && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {locale === "fr" ? "Frais original" : "Original Fee"}
                        </p>
                        <p className="font-medium">{formatCurrency(enrollment.originalTuitionFee)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {locale === "fr" ? "Frais ajusté" : "Adjusted Fee"}
                        </p>
                        <p className="font-medium">{formatCurrency(enrollment.adjustedTuitionFee!)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {locale === "fr" ? "Réduction" : "Discount"}
                        </p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(enrollment.originalTuitionFee - enrollment.adjustedTuitionFee!)}
                          {" "}
                          ({((1 - enrollment.adjustedTuitionFee! / enrollment.originalTuitionFee) * 100).toFixed(0)}%)
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {locale === "fr" ? "Raison de l'ajustement" : "Reason for Adjustment"}
                      </p>
                      <div className="bg-muted/50 rounded-lg p-3 border">
                        <p className="text-sm italic">
                          "{enrollment.adjustmentReason || (locale === "fr" ? "Aucune raison fournie" : "No reason provided")}"
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {hasLowInitialPayment && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {locale === "fr"
                        ? "Le paiement initial est inférieur au seuil minimum."
                        : "The initial payment is below the minimum threshold."}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {locale === "fr" ? "Frais de scolarité" : "Tuition Fee"}
                        </p>
                        <p className="font-medium">{formatCurrency(enrollment.tuitionFee)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {locale === "fr" ? "Minimum (1/9)" : "Minimum (1/9)"}
                        </p>
                        <p className="font-medium">{formatCurrency(minimumPayment)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {locale === "fr" ? "Montant payé" : "Amount Paid"}
                        </p>
                        <p className="font-medium text-orange-600">{formatCurrency(enrollment.totalPaid)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {locale === "fr" ? "Manque" : "Shortfall"}
                        </p>
                        <p className="font-medium text-red-600">{formatCurrency(minimumPayment - enrollment.totalPaid)}</p>
                      </div>
                    </div>
                  </>
                )}

                {!hasTuitionAdjustment && !hasLowInitialPayment && (
                  <p className="text-sm text-muted-foreground">
                    {locale === "fr"
                      ? "Cette inscription est en attente d'approbation du directeur."
                      : "This enrollment is awaiting director approval."}
                  </p>
                )}

                <Separator />
                <div className="flex gap-3 justify-end">
                  <Button
                    onClick={() => setShowApproveDialog(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {locale === "fr" ? "Approuver" : "Approve"}
                  </Button>
                  <Button
                    onClick={() => setShowRejectDialog(true)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {locale === "fr" ? "Rejeter" : "Reject"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })()}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t.enrollments.personalInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">{t.enrollments.firstName}</p>
                  <p className="font-medium">{enrollment.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.enrollments.lastName}</p>
                  <p className="font-medium">{enrollment.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.enrollments.dateOfBirth}</p>
                  <p className="font-medium flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(enrollment.dateOfBirth)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.enrollments.gender}</p>
                  <p className="font-medium">
                    {enrollment.gender === "male" ? t.enrollments.male : enrollment.gender === "female" ? t.enrollments.female : "-"}
                  </p>
                </div>
                {enrollment.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t.enrollments.phone}</p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {enrollment.phone}
                    </p>
                  </div>
                )}
                {enrollment.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t.enrollments.email}</p>
                    <p className="font-medium flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {enrollment.email}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Parents Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t.enrollments.parents}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Father */}
                {(enrollment.fatherName || enrollment.fatherPhone) && (
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{locale === "fr" ? "Père" : "Father"}</p>
                      <p className="font-medium">{enrollment.fatherName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t.enrollments.phone}</p>
                      <p className="font-medium">{enrollment.fatherPhone || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t.enrollments.email}</p>
                      <p className="font-medium">{enrollment.fatherEmail || "-"}</p>
                    </div>
                  </div>
                )}

                {/* Mother */}
                {(enrollment.motherName || enrollment.motherPhone) && (
                  <>
                    {(enrollment.fatherName || enrollment.fatherPhone) && <Separator />}
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">{locale === "fr" ? "Mère" : "Mother"}</p>
                        <p className="font-medium">{enrollment.motherName || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t.enrollments.phone}</p>
                        <p className="font-medium">{enrollment.motherPhone || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t.enrollments.email}</p>
                        <p className="font-medium">{enrollment.motherEmail || "-"}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Address */}
                {enrollment.address && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">{locale === "fr" ? "Adresse" : "Address"}</p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {enrollment.address}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Enrolled By */}
            {enrollment.enrollingPersonType && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    {t.enrollments.enrolledBy}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {enrollment.enrollingPersonType === "father" && (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">{t.enrollments.enrolledByFather}</p>
                        <p className="text-sm text-muted-foreground">{enrollment.fatherName}</p>
                      </div>
                    </div>
                  )}
                  {enrollment.enrollingPersonType === "mother" && (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                        <User className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <p className="font-medium">{t.enrollments.enrolledByMother}</p>
                        <p className="text-sm text-muted-foreground">{enrollment.motherName}</p>
                      </div>
                    </div>
                  )}
                  {enrollment.enrollingPersonType === "other" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="font-medium">{enrollment.enrollingPersonName}</p>
                          <p className="text-sm text-muted-foreground">{enrollment.enrollingPersonRelation}</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <p className="text-sm text-muted-foreground">{t.enrollments.phone}</p>
                          <p className="font-medium">{enrollment.enrollingPersonPhone || "-"}</p>
                        </div>
                        {enrollment.enrollingPersonEmail && (
                          <div>
                            <p className="text-sm text-muted-foreground">{t.enrollments.email}</p>
                            <p className="font-medium">{enrollment.enrollingPersonEmail}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payment Schedules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {locale === "fr" ? "Echeances de paiement" : "Payment Schedules"}
                </CardTitle>
                <CardDescription>
                  {locale === "fr" ? "3 echeances pour l'annee scolaire" : "3 payment schedules for the school year"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enrollment.paymentSchedules.map((schedule) => {
                    const paid = enrollment.payments
                      .filter((p) => p.paymentScheduleId === schedule.id && p.status === "confirmed")
                      .reduce((sum, p) => sum + p.amount, 0)
                    const percentPaid = Math.min(100, (paid / schedule.amount) * 100)

                    return (
                      <div key={schedule.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">
                              {locale === "fr" ? "Echeance" : "Schedule"} {schedule.scheduleNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {(schedule.months as string[]).join(", ")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(schedule.amount)}</p>
                            <p className="text-sm text-muted-foreground">
                              {locale === "fr" ? "Echeance:" : "Due:"} {formatDate(schedule.dueDate.toString())}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              enrollment.status === "needs_review"
                                ? "bg-amber-500 dark:bg-amber-400"
                                : "bg-primary"
                            }`}
                            style={{ width: `${percentPaid}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatCurrency(paid)} / {formatCurrency(schedule.amount)} ({percentPaid.toFixed(0)}%)
                        </p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {enrollment.notes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {locale === "fr" ? "Notes" : "Notes"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {enrollment.notes.map((note) => (
                      <div key={note.id} className="border-l-2 border-primary pl-4">
                        <p className="font-medium">{note.title}</p>
                        <p className="text-muted-foreground">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {note.author.name} - {formatDate(note.createdAt.toString())}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{locale === "fr" ? "Resume financier" : "Financial Summary"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{locale === "fr" ? "Frais de scolarite" : "Tuition Fee"}</span>
                  <span className="font-medium">{formatCurrency(enrollment.tuitionFee)}</span>
                </div>
                {enrollment.adjustedTuitionFee && enrollment.adjustedTuitionFee !== enrollment.originalTuitionFee && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{locale === "fr" ? "Frais original" : "Original Fee"}</span>
                    <span className="line-through">{formatCurrency(enrollment.originalTuitionFee)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{locale === "fr" ? "Total paye" : "Total Paid"}</span>
                  <span className="font-medium text-green-600">{formatCurrency(enrollment.totalPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{locale === "fr" ? "Solde restant" : "Remaining Balance"}</span>
                  <span className="font-medium text-orange-600">{formatCurrency(enrollment.remainingBalance)}</span>
                </div>
                <Separator />
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      enrollment.status === "needs_review"
                        ? "bg-amber-500 dark:bg-amber-400"
                        : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(100, (enrollment.totalPaid / enrollment.tuitionFee) * 100)}%` }}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  {((enrollment.totalPaid / enrollment.tuitionFee) * 100).toFixed(0)}% {locale === "fr" ? "paye" : "paid"}
                </p>
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>{locale === "fr" ? "Chronologie" : "Timeline"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">{locale === "fr" ? "Cree" : "Created"}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(enrollment.createdAt)}</p>
                    <p className="text-xs text-muted-foreground">{locale === "fr" ? "par" : "by"} {enrollment.creator.name}</p>
                  </div>
                </div>
                {enrollment.submittedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div>
                      <p className="font-medium">{locale === "fr" ? "Soumis" : "Submitted"}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(enrollment.submittedAt)}</p>
                    </div>
                  </div>
                )}
                {enrollment.autoApproveAt && enrollment.status === "submitted" && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                    <div>
                      <p className="font-medium">{locale === "fr" ? "Auto-approbation" : "Auto-Approval"}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(enrollment.autoApproveAt)}</p>
                    </div>
                  </div>
                )}
                {enrollment.approvedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <p className="font-medium">{locale === "fr" ? "Approuve" : "Approved"}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(enrollment.approvedAt)}</p>
                      {enrollment.approver && (
                        <p className="text-xs text-muted-foreground">{locale === "fr" ? "par" : "by"} {enrollment.approver.name}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Payments */}
            {enrollment.payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{locale === "fr" ? "Paiements recents" : "Recent Payments"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {enrollment.payments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          <p className="text-xs text-muted-foreground">{payment.receiptNumber}</p>
                        </div>
                        <Badge variant={payment.status === "confirmed" ? "default" : "outline"}>
                          {payment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === "fr" ? "Approuver l'inscription" : "Approve Enrollment"}</DialogTitle>
            <DialogDescription>
              {locale === "fr"
                ? "Veuillez fournir un commentaire pour approuver cette inscription."
                : "Please provide a comment to approve this enrollment."}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={locale === "fr" ? "Commentaire d'approbation..." : "Approval comment..."}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleApprove} disabled={!comment.trim() || actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {locale === "fr" ? "Approuver" : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === "fr" ? "Rejeter l'inscription" : "Reject Enrollment"}</DialogTitle>
            <DialogDescription>
              {locale === "fr"
                ? "Veuillez fournir une raison pour rejeter cette inscription."
                : "Please provide a reason for rejecting this enrollment."}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={locale === "fr" ? "Raison du rejet..." : "Rejection reason..."}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!comment.trim() || actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {locale === "fr" ? "Rejeter" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === "fr" ? "Annuler l'inscription" : "Cancel Enrollment"}</DialogTitle>
            <DialogDescription>
              {locale === "fr"
                ? "Veuillez fournir une raison pour annuler cette inscription."
                : "Please provide a reason for cancelling this enrollment."}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={locale === "fr" ? "Raison de l'annulation..." : "Cancellation reason..."}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={!comment.trim() || actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {locale === "fr" ? "Annuler" : "Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === "fr" ? "Supprimer l'inscription" : "Delete Enrollment"}</DialogTitle>
            <DialogDescription>
              {locale === "fr"
                ? "Cette action est irreversible. L'inscription sera definitivement supprimee."
                : "This action cannot be undone. The enrollment will be permanently deleted."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.common.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
