"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Loader2,
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wallet,
  CalendarCheck,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Receipt,
  TrendingUp,
  TrendingDown,
  Minus,
  DoorOpen,
  Edit2,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout/PageContainer"
import { cn, formatDateLong } from "@/lib/utils"
import Link from "next/link"
import { StudentRoomChangeDialog } from "@/components/room-assignments"

interface Person {
  id: string
  photoUrl?: string | null
  gender?: string | null
  address?: string | null
  phone?: string | null
}

interface RoomAssignment {
  id: string
  gradeRoom: {
    id: string
    name: string
    displayName: string | null
  }
}

interface StudentProfile {
  id: string
  person: Person
  currentGrade?: {
    id: string
    name: string
    level: string
  } | null
  roomAssignments?: RoomAssignment[]
}

interface Payment {
  id: string
  amount: number
  status: string
  method: string
  receiptNumber?: string | null
  recordedAt: string
  confirmedAt?: string | null
  recorder?: { name: string } | null
  reviewer?: { name: string } | null
}

interface Enrollment {
  id: string
  status: string
  originalTuitionFee: number
  adjustedTuitionFee?: number | null
  createdAt: string
  grade: {
    id: string
    name: string
    level: string
    order: number
  }
  schoolYear: {
    id: string
    name: string
    isActive: boolean
  }
  payments: Payment[]
}

interface BalanceInfo {
  tuitionFee: number
  totalPaid: number
  remainingBalance: number
  paymentPercentage: number
  paymentStatus: string
  expectedPaymentPercentage: number
}

interface AttendanceSummary {
  total: number
  present: number
  absent: number
  late: number
  excused: number
  attendanceRate: number
}

interface StudentDetail {
  id: string
  studentNumber: string
  firstName: string
  lastName: string
  email?: string | null
  dateOfBirth?: string | null
  status: string
  enrollmentDate: string
  studentProfile?: StudentProfile | null
  enrollments: Enrollment[]
  balanceInfo?: BalanceInfo | null
  attendanceSummary?: AttendanceSummary | null
}

export default function StudentDetailPage() {
  const { t, locale } = useI18n()
  const params = useParams()
  const studentId = params.id as string

  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roomChangeDialogOpen, setRoomChangeDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchStudent() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/students/${studentId}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Student not found")
          }
          throw new Error("Failed to fetch student")
        }
        const data = await response.json()
        setStudent(data)
      } catch (err) {
        console.error("Error fetching student:", err)
        setError(err instanceof Error ? err.message : "Failed to load student details")
      } finally {
        setIsLoading(false)
      }
    }

    if (studentId) {
      fetchStudent()
    }
  }, [studentId])

  // Refetch student data after room change
  async function refetchStudent() {
    try {
      const response = await fetch(`/api/students/${studentId}`)
      if (response.ok) {
        const data = await response.json()
        setStudent(data)
      }
    } catch (err) {
      console.error("Error refetching student:", err)
    }
  }

  // Get current room assignment
  const currentRoomAssignment = student?.studentProfile?.roomAssignments?.[0]
  const currentRoomName = currentRoomAssignment?.gradeRoom?.displayName || currentRoomAssignment?.gradeRoom?.name

  // Get active school year from enrollments
  const activeEnrollment = student?.enrollments?.find(e => e.schoolYear.isActive)
  const activeSchoolYearId = activeEnrollment?.schoolYear.id

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' GNF'
  }

  const formatDate = (dateString: string) => {
    return formatDateLong(dateString, locale)
  }

  const formatDateTime = (dateString: string) => {
    const d = new Date(dateString)
    const datePart = formatDateLong(dateString, locale)
    const timePart = d.toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", {
      hour: '2-digit',
      minute: '2-digit'
    })
    return `${datePart}, ${timePart}`
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      active: { variant: "default", label: "Actif" },
      inactive: { variant: "secondary", label: "Inactif" },
      graduated: { variant: "outline", label: "Diplômé" },
      transferred: { variant: "outline", label: "Transféré" },
      suspended: { variant: "destructive", label: "Suspendu" }
    }
    const config = statusConfig[status] || { variant: "secondary", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      late: { color: "bg-destructive/10 text-destructive", label: t.students.late },
      on_time: { color: "bg-success/10 text-success", label: t.students.onTime },
      in_advance: { color: "bg-primary/10 text-primary", label: t.students.inAdvance },
      complete: { color: "bg-success/10 text-success", label: t.students.complete }
    }
    const config = statusConfig[status] || { color: "bg-muted", label: status }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: "Espèces",
      orange_money: "Orange Money",
      bank_transfer: "Virement bancaire"
    }
    return methods[method] || method
  }

  const getPaymentStatusLabel = (status: string) => {
    const statuses: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending_deposit: { label: "En attente de dépôt", variant: "secondary" },
      deposited: { label: "Déposé", variant: "outline" },
      pending_review: { label: "En attente de validation", variant: "secondary" },
      confirmed: { label: "Confirmé", variant: "default" },
      rejected: { label: "Rejeté", variant: "destructive" }
    }
    const config = statuses[status] || { label: status, variant: "secondary" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getEnrollmentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "secondary", label: "Brouillon" },
      submitted: { variant: "outline", label: "Soumis" },
      needs_review: { variant: "secondary", label: "En attente" },
      completed: { variant: "default", label: "Complété" },
      approved: { variant: "default", label: "Approuvé" },
      rejected: { variant: "destructive", label: "Rejeté" },
      cancelled: { variant: "destructive", label: "Annulé" }
    }
    const config = statusConfig[status] || { variant: "secondary", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !student) {
    return (
      <PageContainer maxWidth="lg">
        <Link href="/students" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="size-4" />
          {t.common.back}
        </Link>
        <div className="text-center py-12 text-destructive">{error || "Student not found"}</div>
      </PageContainer>
    )
  }

  // Calculate total payments across all enrollments
  const allPayments = student.enrollments.flatMap(e =>
    e.payments.map(p => ({ ...p, enrollment: e }))
  )

  return (
    <PageContainer maxWidth="full">
      {/* Back link */}
      <Link href="/students" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="size-4" />
        Retour aux élèves
      </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <Avatar className="size-20">
              <AvatarImage src={student.studentProfile?.person?.photoUrl ?? undefined} />
              <AvatarFallback className="text-xl">
                {student.firstName[0]}{student.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-foreground">
                  {student.firstName} {student.lastName}
                </h1>
                {getStatusBadge(student.status)}
              </div>
              <p className="text-muted-foreground mb-2">
                {student.studentNumber}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {student.studentProfile?.currentGrade && (
                  <Badge variant="outline" className="gap-1">
                    <GraduationCap className="size-3" />
                    {student.studentProfile.currentGrade.name}
                  </Badge>
                )}
                {currentRoomName ? (
                  <Badge variant="secondary" className="gap-1">
                    <DoorOpen className="size-3" />
                    {currentRoomName}
                    {activeSchoolYearId && student.studentProfile?.currentGrade && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-primary/10"
                        onClick={() => setRoomChangeDialogOpen(true)}
                      >
                        <Edit2 className="size-3" />
                      </Button>
                    )}
                  </Badge>
                ) : (
                  activeSchoolYearId && student.studentProfile?.currentGrade && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 h-6"
                      onClick={() => setRoomChangeDialogOpen(true)}
                    >
                      <DoorOpen className="size-3" />
                      {t.students.room}
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
          {student.balanceInfo && (
            <Card className="w-full md:w-auto">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{student.balanceInfo.paymentPercentage}%</p>
                    <p className="text-xs text-muted-foreground">Paiement</p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div className="text-center">
                    {getPaymentStatusBadge(student.balanceInfo.paymentStatus)}
                    <p className="text-xs text-muted-foreground mt-1">Statut</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="size-4" />
                Solde restant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {student.balanceInfo ? formatCurrency(student.balanceInfo.remainingBalance) : "N/A"}
              </div>
              {student.balanceInfo && (
                <Progress value={student.balanceInfo.paymentPercentage} className="h-2 mt-2" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="size-4" />
                Total payé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {student.balanceInfo ? formatCurrency(student.balanceInfo.totalPaid) : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                sur {student.balanceInfo ? formatCurrency(student.balanceInfo.tuitionFee) : "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CalendarCheck className="size-4" />
                Présence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (student.attendanceSummary?.attendanceRate ?? 0) >= 80 ? 'text-success' :
                (student.attendanceSummary?.attendanceRate ?? 0) >= 60 ? 'text-warning' : 'text-destructive'
              }`}>
                {student.attendanceSummary?.attendanceRate ?? 0}%
              </div>
              <Progress
                value={student.attendanceSummary?.attendanceRate ?? 0}
                className="h-2 mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Receipt className="size-4" />
                Inscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student.enrollments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">année(s) scolaire(s)</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="enrollments">Inscriptions ({student.enrollments.length})</TabsTrigger>
            <TabsTrigger value="payments">Paiements ({allPayments.length})</TabsTrigger>
            <TabsTrigger value="attendance">Présence</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Personal Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="size-5" />
                    {t.students.personalInfo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Prénom</p>
                      <p className="font-medium">{student.firstName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nom</p>
                      <p className="font-medium">{student.lastName}</p>
                    </div>
                  </div>

                  {student.dateOfBirth && (
                    <div className="flex items-center gap-3">
                      <Calendar className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Date de naissance</p>
                        <p className="font-medium">{formatDate(student.dateOfBirth)}</p>
                      </div>
                    </div>
                  )}

                  {student.studentProfile?.person?.gender && (
                    <div className="flex items-center gap-3">
                      <User className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Genre</p>
                        <p className="font-medium">
                          {student.studentProfile.person.gender === 'male' ? 'Masculin' : 'Féminin'}
                        </p>
                      </div>
                    </div>
                  )}

                  {student.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{student.email}</p>
                      </div>
                    </div>
                  )}

                  {student.studentProfile?.person?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Téléphone</p>
                        <p className="font-medium">{student.studentProfile.person.phone}</p>
                      </div>
                    </div>
                  )}

                  {student.studentProfile?.person?.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Adresse</p>
                        <p className="font-medium">{student.studentProfile.person.address}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Attendance Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarCheck className="size-5" />
                    {t.students.attendanceHistory}
                  </CardTitle>
                  <CardDescription>
                    {student.attendanceSummary?.total ?? 0} enregistrements au total
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {student.attendanceSummary && student.attendanceSummary.total > 0 ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10">
                          <CheckCircle className="size-5 text-success" />
                          <div>
                            <p className="text-2xl font-bold text-success">{student.attendanceSummary.present}</p>
                            <p className="text-xs text-muted-foreground">Présents</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10">
                          <XCircle className="size-5 text-destructive" />
                          <div>
                            <p className="text-2xl font-bold text-destructive">{student.attendanceSummary.absent}</p>
                            <p className="text-xs text-muted-foreground">Absents</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10">
                          <Clock className="size-5 text-warning" />
                          <div>
                            <p className="text-2xl font-bold text-warning">{student.attendanceSummary.late}</p>
                            <p className="text-xs text-muted-foreground">En retard</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                          <AlertCircle className="size-5 text-muted-foreground" />
                          <div>
                            <p className="text-2xl font-bold">{student.attendanceSummary.excused}</p>
                            <p className="text-xs text-muted-foreground">Excusés</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Taux de présence</span>
                          <span className={`text-lg font-bold ${
                            student.attendanceSummary.attendanceRate >= 80 ? 'text-success' :
                            student.attendanceSummary.attendanceRate >= 60 ? 'text-warning' : 'text-destructive'
                          }`}>
                            {student.attendanceSummary.attendanceRate}%
                          </span>
                        </div>
                        <Progress value={student.attendanceSummary.attendanceRate} className="h-2 mt-2" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun enregistrement de présence
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Summary Card */}
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="size-5" />
                      {t.students.paymentHistory}
                    </CardTitle>
                    <CardDescription>
                      {student.balanceInfo ?
                        `${formatCurrency(student.balanceInfo.totalPaid)} payé sur ${formatCurrency(student.balanceInfo.tuitionFee)}` :
                        "Aucune inscription active"
                      }
                    </CardDescription>
                  </div>
                  <Link href={`/students/${student.id}/payments`}>
                    <Button variant="outline" size="sm">
                      {t.common.viewDetails}
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {student.balanceInfo ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progression des paiements</span>
                          <span className="font-medium">{student.balanceInfo.paymentPercentage}%</span>
                        </div>
                        <Progress value={student.balanceInfo.paymentPercentage} className="h-3" />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                        <div className="text-center p-3 rounded-lg bg-muted">
                          <p className="text-lg font-bold">{formatCurrency(student.balanceInfo.tuitionFee)}</p>
                          <p className="text-xs text-muted-foreground">Frais de scolarité</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-success/10">
                          <p className="text-lg font-bold text-success">{formatCurrency(student.balanceInfo.totalPaid)}</p>
                          <p className="text-xs text-muted-foreground">Montant payé</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-destructive/10">
                          <p className="text-lg font-bold text-destructive">{formatCurrency(student.balanceInfo.remainingBalance)}</p>
                          <p className="text-xs text-muted-foreground">{t.students.remainingBalance}</p>
                        </div>
                        <div className={cn(
                          "text-center p-3 rounded-lg",
                          student.balanceInfo.paymentStatus === "complete" && "bg-success/10"
                        )}>
                          {getPaymentStatusBadge(student.balanceInfo.paymentStatus)}
                          <p className="text-xs text-muted-foreground mt-2">Statut</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune inscription active avec informations de paiement
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enrollments Tab */}
          <TabsContent value="enrollments">
            <Card>
              <CardHeader>
                <CardTitle>Historique des inscriptions</CardTitle>
                <CardDescription>{student.enrollments.length} inscription(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Année scolaire</TableHead>
                        <TableHead>Classe</TableHead>
                        <TableHead>Niveau</TableHead>
                        <TableHead className="text-right">Frais de scolarité</TableHead>
                        <TableHead className="text-right">Montant payé</TableHead>
                        <TableHead className="text-center">Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.enrollments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Aucune inscription
                          </TableCell>
                        </TableRow>
                      ) : (
                        student.enrollments.map((enrollment) => {
                          const tuition = enrollment.adjustedTuitionFee ?? enrollment.originalTuitionFee
                          const confirmedPayments = enrollment.payments.filter(p => p.status === 'confirmed')
                          const totalPaid = confirmedPayments.reduce((sum, p) => sum + p.amount, 0)
                          const percentage = Math.round((totalPaid / tuition) * 100)

                          return (
                            <TableRow key={enrollment.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{enrollment.schoolYear.name}</span>
                                  {enrollment.schoolYear.isActive && (
                                    <Badge variant="outline" className="text-xs">Actuel</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{enrollment.grade.name}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{enrollment.grade.level}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(tuition)}
                                {enrollment.adjustedTuitionFee && enrollment.adjustedTuitionFee !== enrollment.originalTuitionFee && (
                                  <p className="text-xs text-muted-foreground line-through">
                                    {formatCurrency(enrollment.originalTuitionFee)}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span className={totalPaid >= tuition ? 'text-success' : ''}>
                                    {formatCurrency(totalPaid)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">({percentage}%)</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {getEnrollmentStatusBadge(enrollment.status)}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Historique des paiements</CardTitle>
                <CardDescription>{allPayments.length} paiement(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Année scolaire</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead>Méthode</TableHead>
                        <TableHead>N° Reçu</TableHead>
                        <TableHead>Enregistré par</TableHead>
                        <TableHead className="text-center">Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Aucun paiement enregistré
                          </TableCell>
                        </TableRow>
                      ) : (
                        allPayments
                          .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                          .map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell className="text-sm">
                                {formatDateTime(payment.recordedAt)}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{payment.enrollment.schoolYear.name}</span>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(payment.amount)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{getPaymentMethodLabel(payment.method)}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {payment.receiptNumber || "-"}
                              </TableCell>
                              <TableCell className="text-sm">
                                {payment.recorder?.name || "-"}
                              </TableCell>
                              <TableCell className="text-center">
                                {getPaymentStatusLabel(payment.status)}
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Historique de présence</CardTitle>
                <CardDescription>
                  Taux de présence: {student.attendanceSummary?.attendanceRate ?? 0}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                {student.attendanceSummary && student.attendanceSummary.total > 0 ? (
                  <div className="space-y-6">
                    {/* Attendance Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center p-4 rounded-lg bg-muted">
                        <p className="text-3xl font-bold">{student.attendanceSummary.total}</p>
                        <p className="text-sm text-muted-foreground">Total séances</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-success/10">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="size-5 text-success" />
                          <p className="text-3xl font-bold text-success">{student.attendanceSummary.present}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Présent</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-destructive/10">
                        <div className="flex items-center justify-center gap-2">
                          <XCircle className="size-5 text-destructive" />
                          <p className="text-3xl font-bold text-destructive">{student.attendanceSummary.absent}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Absent</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-warning/10">
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="size-5 text-warning" />
                          <p className="text-3xl font-bold text-warning">{student.attendanceSummary.late}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">En retard</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-blue-500/10">
                        <div className="flex items-center justify-center gap-2">
                          <AlertCircle className="size-5 text-blue-500" />
                          <p className="text-3xl font-bold text-blue-500">{student.attendanceSummary.excused}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Excusé</p>
                      </div>
                    </div>

                    {/* Attendance Rate Visual */}
                    <div className="p-6 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">Taux de présence global</h3>
                        <span className={`text-2xl font-bold ${
                          student.attendanceSummary.attendanceRate >= 80 ? 'text-success' :
                          student.attendanceSummary.attendanceRate >= 60 ? 'text-warning' : 'text-destructive'
                        }`}>
                          {student.attendanceSummary.attendanceRate}%
                        </span>
                      </div>
                      <Progress value={student.attendanceSummary.attendanceRate} className="h-4" />
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>0%</span>
                        <span className="text-warning">60%</span>
                        <span className="text-success">80%</span>
                        <span>100%</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        {student.attendanceSummary.attendanceRate >= 80 ? (
                          <span className="flex items-center gap-2 text-success">
                            <TrendingUp className="size-4" />
                            {t.students.attendanceGood}
                          </span>
                        ) : student.attendanceSummary.attendanceRate >= 60 ? (
                          <span className="flex items-center gap-2 text-warning">
                            <Minus className="size-4" />
                            {t.students.attendanceConcerning}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-destructive">
                            <TrendingDown className="size-4" />
                            {t.students.attendanceCritical}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarCheck className="size-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun enregistrement de présence disponible</p>
                    <p className="text-sm mt-2">Les données de présence apparaîtront ici une fois enregistrées</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Room Change Dialog */}
        {student.studentProfile && activeSchoolYearId && student.studentProfile.currentGrade && (
          <StudentRoomChangeDialog
            open={roomChangeDialogOpen}
            onOpenChange={setRoomChangeDialogOpen}
            studentId={student.id}
            studentName={`${student.firstName} ${student.lastName}`}
            studentProfileId={student.studentProfile.id}
            gradeId={student.studentProfile.currentGrade.id}
            gradeName={student.studentProfile.currentGrade.name}
            currentRoomId={currentRoomAssignment?.gradeRoom?.id || null}
            currentRoomName={currentRoomName || null}
            schoolYearId={activeSchoolYearId}
            onSuccess={refetchStudent}
          />
        )}
    </PageContainer>
  )
}
