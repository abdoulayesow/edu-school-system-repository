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
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout/PageContainer"
import Link from "next/link"
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

const statusConfig: Record<EnrollmentStatus, { label: string; labelFr: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  draft: { label: "Draft", labelFr: "Brouillon", variant: "secondary", icon: FileText },
  submitted: { label: "Submitted", labelFr: "Soumis", variant: "default", icon: Clock },
  needs_review: { label: "Needs Review", labelFr: "En attente de validation", variant: "outline", icon: AlertCircle },
  completed: { label: "Completed", labelFr: "Termine", variant: "default", icon: CheckCircle },
  rejected: { label: "Rejected", labelFr: "Rejete", variant: "destructive", icon: XCircle },
  cancelled: { label: "Cancelled", labelFr: "Annule", variant: "secondary", icon: XCircle },
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
      <PageContainer maxWidth="lg">
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
    <PageContainer maxWidth="lg">
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
                <Badge variant={status.variant} className="gap-1">
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
            {canApproveReject && (
              <>
                <Button variant="default" onClick={() => setShowApproveDialog(true)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {locale === "fr" ? "Approuver" : "Approve"}
                </Button>
                <Button variant="destructive" onClick={() => setShowRejectDialog(true)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  {locale === "fr" ? "Rejeter" : "Reject"}
                </Button>
              </>
            )}
            {canCancel && (
              <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
                <XCircle className="h-4 w-4 mr-2" />
                {locale === "fr" ? "Annuler" : "Cancel"}
              </Button>
            )}
            {enrollment.status === "draft" && (
              <Button asChild>
                <Link href={`/enrollments/new?draft=${enrollment.id}`}>
                  {t.common.edit}
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

            {/* Parent Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t.enrollments.guardianInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Father */}
                {(enrollment.fatherName || enrollment.fatherPhone) && (
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{locale === "fr" ? "Pere" : "Father"}</p>
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
                    <Separator />
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">{locale === "fr" ? "Mere" : "Mother"}</p>
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
                            className="bg-primary h-2 rounded-full transition-all"
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
                    className="bg-primary h-3 rounded-full transition-all"
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
    </PageContainer>
  )
}
