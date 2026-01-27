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
  Users,
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
  BookOpen,
  Trophy,
  Palette,
  Sparkles,
  ExternalLink,
  FileText,
  UserCheck,
  Banknote,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout/PageContainer"
import { PermissionGuard } from "@/components/permission-guard"
import { formatDateLong } from "@/lib/utils"
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

interface EnrollmentNote {
  id: string
  title: string
  content: string
  createdAt: string
  author?: { name: string } | null
}

interface Enrollment {
  id: string
  enrollmentNumber?: string | null
  status: string
  originalTuitionFee: number
  adjustedTuitionFee?: number | null
  createdAt: string
  middleName?: string | null
  fatherName?: string | null
  fatherPhone?: string | null
  fatherEmail?: string | null
  motherName?: string | null
  motherPhone?: string | null
  motherEmail?: string | null
  address?: string | null
  enrollingPersonType?: string | null
  enrollingPersonName?: string | null
  enrollingPersonRelation?: string | null
  enrollingPersonPhone?: string | null
  enrollingPersonEmail?: string | null
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
  creator?: { id: string; name: string } | null
  notes?: EnrollmentNote[]
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

interface ActivityEnrollment {
  enrollmentId: string
  status: string
  enrolledAt: string
  activity: {
    id: string
    name: string
    description: string | null
    type: "club" | "sport" | "arts" | "academic" | "other"
    status: string
    fee: number
    startDate: string | null
    endDate: string | null
  }
}

const activityTypeIcons: Record<string, React.ReactNode> = {
  club: <BookOpen className="size-4" />,
  sport: <Trophy className="size-4" />,
  arts: <Palette className="size-4" />,
  academic: <GraduationCap className="size-4" />,
  other: <Sparkles className="size-4" />,
}

const activityTypeColors: Record<string, string> = {
  club: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  sport: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  arts: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  academic: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
}

export default function StudentDetailPage() {
  const { t, locale } = useI18n()
  const params = useParams()
  const studentId = params.id as string

  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [activities, setActivities] = useState<ActivityEnrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roomChangeDialogOpen, setRoomChangeDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const [studentRes, activitiesRes] = await Promise.all([
          fetch(`/api/students/${studentId}`),
          fetch(`/api/students/${studentId}/activities`),
        ])

        if (!studentRes.ok) {
          if (studentRes.status === 404) {
            throw new Error("Student not found")
          }
          throw new Error("Failed to fetch student")
        }
        const studentData = await studentRes.json()
        setStudent(studentData)

        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json()
          setActivities(activitiesData.activities || [])
        }
      } catch (err) {
        console.error("Error fetching student:", err)
        setError(err instanceof Error ? err.message : "Failed to load student details")
      } finally {
        setIsLoading(false)
      }
    }

    if (studentId) {
      fetchData()
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
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" | "success"; label: string }> = {
      active: { variant: "success", label: "Actif" },
      inactive: { variant: "secondary", label: "Inactif" },
      graduated: { variant: "outline", label: "Diplômé" },
      transferred: { variant: "outline", label: "Transféré" },
      suspended: { variant: "destructive", label: "Suspendu" }
    }
    const config = statusConfig[status] || { variant: "secondary", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { textColor: string; bgColor: string; label: string }> = {
      late: { textColor: "text-destructive", bgColor: "bg-destructive/10", label: t.students.late },
      on_time: { textColor: "text-success", bgColor: "bg-success/10", label: t.students.onTime },
      in_advance: { textColor: "text-primary", bgColor: "bg-primary/10", label: t.students.inAdvance },
      complete: { textColor: "text-success", bgColor: "bg-success/10", label: t.students.complete }
    }
    return statusConfig[status] || { textColor: "text-muted-foreground", bgColor: "bg-muted", label: status }
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
    const statuses: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" }> = {
      confirmed: { label: "Confirmé", variant: "success" },
      reversed: { label: "Annulé", variant: "outline" },
      failed: { label: "Échoué", variant: "destructive" }
    }
    const config = statuses[status] || { label: status, variant: "secondary" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getEnrollmentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" | "success"; label: string }> = {
      draft: { variant: "secondary", label: "Brouillon" },
      submitted: { variant: "outline", label: "Soumis" },
      needs_review: { variant: "secondary", label: "En attente" },
      completed: { variant: "success", label: "Complété" },
      approved: { variant: "success", label: "Approuvé" },
      rejected: { variant: "destructive", label: "Rejeté" },
      cancelled: { variant: "destructive", label: "Annulé" }
    }
    const config = statusConfig[status] || { variant: "secondary", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getLevelLabel = (level: string) => {
    const labels = t.grades.levelLabels as Record<string, string>
    return labels[level] || level
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gspn-maroon-500" />
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
        {t.students.backToStudents}
      </Link>

      {/* Page Header with Brand Styling */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="h-1 bg-gspn-maroon-500" />
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar className="size-24 ring-4 ring-gspn-maroon-100 dark:ring-gspn-maroon-800 shadow-lg">
                <AvatarImage src={student.studentProfile?.person?.photoUrl ?? undefined} />
                <AvatarFallback className="text-2xl font-bold bg-gspn-maroon-500/10 text-gspn-maroon-700 dark:text-gspn-maroon-300">
                  {student.firstName[0]}{student.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-foreground">
                    {student.firstName}{activeEnrollment?.middleName ? ` ${activeEnrollment.middleName}` : ""} {student.lastName}
                  </h1>
                  {getStatusBadge(student.status)}
                </div>
                <p className="text-muted-foreground mb-2">
                  {student.studentNumber}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {student.studentProfile?.currentGrade && (
                    <Badge variant="outline" className="gap-1 h-6">
                      <GraduationCap className="size-3" />
                      {student.studentProfile.currentGrade.name}
                    </Badge>
                  )}
                  <PermissionGuard resource="room_assignments" action="update" inline>
                    {currentRoomName ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 h-6"
                        onClick={() => setRoomChangeDialogOpen(true)}
                      >
                        <DoorOpen className="size-3" />
                        {t.students.room}
                      </Button>
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
                  </PermissionGuard>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <PermissionGuard resource="students" action="update" inline>
                <Link href={`/students/${student.id}/edit`}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 shadow-md hover:shadow-lg transition-all border-2 border-gspn-maroon-300 dark:border-gspn-maroon-700 hover:bg-gspn-maroon-50 dark:hover:bg-gspn-maroon-950/30"
                  >
                    <Edit2 className="size-5" />
                    {t.students.editInfo}
                  </Button>
                </Link>
              </PermissionGuard>
              <PermissionGuard
                resource="payments"
                action="create"
                loading={<div className="h-11 w-40 animate-pulse bg-muted rounded-md" />}
              >
                <Link href={`/accounting/payments/new?studentId=${student.id}`}>
                  <Button
                    variant="gold"
                    size="lg"
                    className="gap-2 shadow-md hover:shadow-lg transition-all"
                    disabled={!student.balanceInfo || student.balanceInfo.remainingBalance <= 0}
                  >
                    <Banknote className="size-5" />
                    {t.students.makePayment}
                  </Button>
                </Link>
              </PermissionGuard>
            </div>
          </div>
        </div>
      </div>

        {/* Stats Cards - GSPN Brand Styled */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {/* Remaining Balance Card */}
          <Card className="border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="h-1 bg-gspn-maroon-500" />
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.students.remainingBalanceLabel}
                  </p>
                  <p className={`text-2xl font-bold font-mono tabular-nums ${
                    student.balanceInfo?.remainingBalance === 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gspn-maroon-600 dark:text-gspn-maroon-400'
                  }`}>
                    {student.balanceInfo ? formatCurrency(student.balanceInfo.remainingBalance) : "N/A"}
                  </p>
                </div>
                <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                  <Wallet className="size-5 text-gspn-maroon-500" />
                </div>
              </div>
              {student.balanceInfo && (
                <Progress
                  value={student.balanceInfo.paymentPercentage}
                  className="h-2 mt-3 bg-gspn-maroon-100 dark:bg-gspn-maroon-900/30 [&>div]:bg-gspn-maroon-500"
                />
              )}
            </CardContent>
          </Card>

          {/* Total Paid Card */}
          <Card className="border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="h-1 bg-emerald-500" />
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.students.totalPaid}
                  </p>
                  <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                    {student.balanceInfo ? formatCurrency(student.balanceInfo.totalPaid) : "N/A"}
                  </p>
                </div>
                <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                  <CreditCard className="size-5 text-emerald-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {t.students.of} {student.balanceInfo ? formatCurrency(student.balanceInfo.tuitionFee) : "N/A"}
              </p>
            </CardContent>
          </Card>

          {/* Attendance Card */}
          <Card className="border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className={`h-1 ${
              (student.attendanceSummary?.attendanceRate ?? 0) >= 80 ? 'bg-emerald-500' :
              (student.attendanceSummary?.attendanceRate ?? 0) >= 60 ? 'bg-gspn-gold-500' : 'bg-gspn-maroon-500'
            }`} />
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.students.attendanceLabel}
                  </p>
                  <p className={`text-2xl font-bold font-mono tabular-nums ${
                    (student.attendanceSummary?.attendanceRate ?? 0) >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                    (student.attendanceSummary?.attendanceRate ?? 0) >= 60 ? 'text-gspn-gold-600 dark:text-gspn-gold-400' : 'text-gspn-maroon-600 dark:text-gspn-maroon-400'
                  }`}>
                    {student.attendanceSummary?.attendanceRate ?? 0}%
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${
                  (student.attendanceSummary?.attendanceRate ?? 0) >= 80 ? 'bg-emerald-500/10' :
                  (student.attendanceSummary?.attendanceRate ?? 0) >= 60 ? 'bg-gspn-gold-500/10' : 'bg-gspn-maroon-500/10'
                }`}>
                  <CalendarCheck className={`size-5 ${
                    (student.attendanceSummary?.attendanceRate ?? 0) >= 80 ? 'text-emerald-500' :
                    (student.attendanceSummary?.attendanceRate ?? 0) >= 60 ? 'text-gspn-gold-500' : 'text-gspn-maroon-500'
                  }`} />
                </div>
              </div>
              <Progress
                value={student.attendanceSummary?.attendanceRate ?? 0}
                className={`h-2 mt-3 ${
                  (student.attendanceSummary?.attendanceRate ?? 0) >= 80
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 [&>div]:bg-emerald-500'
                    : (student.attendanceSummary?.attendanceRate ?? 0) >= 60
                      ? 'bg-gspn-gold-100 dark:bg-gspn-gold-900/30 [&>div]:bg-gspn-gold-500'
                      : 'bg-gspn-maroon-100 dark:bg-gspn-maroon-900/30 [&>div]:bg-gspn-maroon-500'
                }`}
              />
            </CardContent>
          </Card>

          {/* Payment Progress Card */}
          <Card className="border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="h-1 bg-gspn-gold-500" />
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.students.paymentProgressLabel}
                  </p>
                  <p className="text-2xl font-bold font-mono tabular-nums text-gspn-gold-600 dark:text-gspn-gold-400">
                    {student.balanceInfo?.paymentPercentage ?? 0}%
                  </p>
                </div>
                <div className="p-2.5 bg-gspn-gold-500/10 rounded-xl">
                  <Receipt className="size-5 text-gspn-gold-500" />
                </div>
              </div>
              <Progress
                value={student.balanceInfo?.paymentPercentage ?? 0}
                className="h-2 mt-3 bg-gspn-gold-100 dark:bg-gspn-gold-900/30 [&>div]:bg-gspn-gold-500"
              />
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t.students.overview}</TabsTrigger>
            <TabsTrigger value="enrollments">{t.students.enrollmentsTab} ({student.enrollments.length})</TabsTrigger>
            <TabsTrigger value="payments">{t.students.paymentsTab} ({allPayments.length})</TabsTrigger>
            <TabsTrigger value="attendance">{t.students.attendanceTab}</TabsTrigger>
            <TabsTrigger value="activities">{t.students.activitiesTab} ({activities.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Personal Info Card */}
              <div className="rounded-2xl border-2 border-gspn-maroon-200 dark:border-gspn-maroon-800 bg-gradient-to-br from-gspn-maroon-50/30 to-transparent dark:from-gspn-maroon-950/20 dark:to-transparent shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gspn-maroon-100 dark:bg-gspn-maroon-900/30 border-b-2 border-gspn-maroon-200 dark:border-gspn-maroon-800">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gspn-maroon-700 dark:text-gspn-maroon-300 flex items-center gap-2">
                    <User className="size-4" />
                    {t.students.personalInfo}
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.students.firstName}</p>
                      <p className="font-medium">
                        {student.firstName}
                        {activeEnrollment?.middleName && ` ${activeEnrollment.middleName}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t.students.lastName}</p>
                      <p className="font-medium">{student.lastName}</p>
                    </div>
                  </div>

                  {student.dateOfBirth && (
                    <div className="flex items-center gap-3">
                      <Calendar className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t.students.dateOfBirth}</p>
                        <p className="font-medium">{formatDate(student.dateOfBirth)}</p>
                      </div>
                    </div>
                  )}

                  {student.studentProfile?.person?.gender && (
                    <div className="flex items-center gap-3">
                      <User className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t.students.gender}</p>
                        <p className="font-medium">
                          {student.studentProfile.person.gender === 'male'
                            ? t.students.male
                            : t.students.female}
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
                        <p className="text-sm text-muted-foreground">{t.students.phone}</p>
                        <p className="font-medium">{student.studentProfile.person.phone}</p>
                      </div>
                    </div>
                  )}

                  {(student.studentProfile?.person?.address || activeEnrollment?.address) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t.students.address}</p>
                        <p className="font-medium">{student.studentProfile?.person?.address || activeEnrollment?.address}</p>
                      </div>
                    </div>
                  )}

                  {/* Enrolling Guardian */}
                  {activeEnrollment?.enrollingPersonName && (
                    <div className="pt-3 border-t">
                      <div className="flex items-center gap-3">
                        <Users className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">{t.students.enrollingGuardian}</p>
                          <p className="font-medium">
                            {activeEnrollment.enrollingPersonName}
                            {activeEnrollment.enrollingPersonRelation && (
                              <span className="text-sm text-muted-foreground ml-1">
                                ({activeEnrollment.enrollingPersonRelation})
                              </span>
                            )}
                          </p>
                          {activeEnrollment.enrollingPersonPhone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Phone className="size-3" />
                              {activeEnrollment.enrollingPersonPhone}
                            </p>
                          )}
                          {activeEnrollment.enrollingPersonEmail && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="size-3" />
                              {activeEnrollment.enrollingPersonEmail}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enrolling School Staff */}
                  {activeEnrollment?.creator && (
                    <div className="pt-3 border-t">
                      <div className="flex items-center gap-3">
                        <UserCheck className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">{t.students.enrollingSchoolStaff}</p>
                          <p className="font-medium">{activeEnrollment.creator.name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(activeEnrollment.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Family Information Card */}
              {activeEnrollment && (activeEnrollment.fatherName || activeEnrollment.motherName) && (
                <div className="rounded-2xl border-2 border-gspn-maroon-200 dark:border-gspn-maroon-800 bg-gradient-to-br from-gspn-maroon-50/30 to-transparent dark:from-gspn-maroon-950/20 dark:to-transparent shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gspn-maroon-100 dark:bg-gspn-maroon-900/30 border-b-2 border-gspn-maroon-200 dark:border-gspn-maroon-800">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gspn-maroon-700 dark:text-gspn-maroon-300 flex items-center gap-2">
                      <Users className="size-4" />
                      {t.students.familyInformation}
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {/* Father */}
                    {activeEnrollment.fatherName && (
                      <div>
                        <p className="text-sm font-medium mb-2">{t.students.father}</p>
                        <p className="font-medium">{activeEnrollment.fatherName}</p>
                        {activeEnrollment.fatherPhone && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Phone className="size-3" />
                            {activeEnrollment.fatherPhone}
                          </div>
                        )}
                        {activeEnrollment.fatherEmail && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Mail className="size-3" />
                            {activeEnrollment.fatherEmail}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mother */}
                    {activeEnrollment.motherName && (
                      <div>
                        <p className="text-sm font-medium mb-2">{t.students.mother}</p>
                        <p className="font-medium">{activeEnrollment.motherName}</p>
                        {activeEnrollment.motherPhone && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Phone className="size-3" />
                            {activeEnrollment.motherPhone}
                          </div>
                        )}
                        {activeEnrollment.motherEmail && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Mail className="size-3" />
                            {activeEnrollment.motherEmail}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Attendance Summary Card - only show if has data */}
              {student.attendanceSummary && student.attendanceSummary.total > 0 && (
                <div className="rounded-2xl border-2 border-gspn-maroon-200 dark:border-gspn-maroon-800 bg-gradient-to-br from-gspn-maroon-50/30 to-transparent dark:from-gspn-maroon-950/20 dark:to-transparent shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gspn-maroon-100 dark:bg-gspn-maroon-900/30 border-b-2 border-gspn-maroon-200 dark:border-gspn-maroon-800">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gspn-maroon-700 dark:text-gspn-maroon-300 flex items-center gap-2">
                      <CalendarCheck className="size-4" />
                      {t.students.attendanceHistory}
                    </h3>
                    <p className="text-xs text-gspn-maroon-600 dark:text-gspn-maroon-400 mt-1">
                      {student.attendanceSummary.total} {t.students.totalRecords}
                    </p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10">
                        <CheckCircle className="size-5 text-success" />
                        <div>
                          <p className="text-2xl font-bold text-success">{student.attendanceSummary.present}</p>
                          <p className="text-xs text-muted-foreground">{t.students.present}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10">
                        <XCircle className="size-5 text-destructive" />
                        <div>
                          <p className="text-2xl font-bold text-destructive">{student.attendanceSummary.absent}</p>
                          <p className="text-xs text-muted-foreground">{t.students.absent}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10">
                        <Clock className="size-5 text-warning" />
                        <div>
                          <p className="text-2xl font-bold text-warning">{student.attendanceSummary.late}</p>
                          <p className="text-xs text-muted-foreground">{t.students.lateLabel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <AlertCircle className="size-5 text-muted-foreground" />
                        <div>
                          <p className="text-2xl font-bold">{student.attendanceSummary.excused}</p>
                          <p className="text-xs text-muted-foreground">{t.students.excused}</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{t.students.attendanceRate}</span>
                        <span className={`text-lg font-bold ${
                          student.attendanceSummary.attendanceRate >= 80 ? 'text-success' :
                          student.attendanceSummary.attendanceRate >= 60 ? 'text-warning' : 'text-destructive'
                        }`}>
                          {student.attendanceSummary.attendanceRate}%
                        </span>
                      </div>
                      <Progress value={student.attendanceSummary.attendanceRate} className="h-2 mt-2 bg-gspn-maroon-100 dark:bg-gspn-maroon-900/30 [&>div]:bg-gspn-maroon-500" />
                    </div>
                  </div>
                </div>
              )}

              {/* Enrollment Notes Card */}
              {activeEnrollment?.notes && activeEnrollment.notes.length > 0 && (
                <div className="rounded-2xl border-2 border-gspn-maroon-200 dark:border-gspn-maroon-800 bg-gradient-to-br from-gspn-maroon-50/30 to-transparent dark:from-gspn-maroon-950/20 dark:to-transparent shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gspn-maroon-100 dark:bg-gspn-maroon-900/30 border-b-2 border-gspn-maroon-200 dark:border-gspn-maroon-800">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gspn-maroon-700 dark:text-gspn-maroon-300 flex items-center gap-2">
                      <FileText className="size-4" />
                      {t.students.enrollmentNotes}
                    </h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {activeEnrollment.notes.map((note) => (
                      <div key={note.id} className="p-3 rounded-lg bg-white dark:bg-slate-900 border-l-4 border-gspn-gold-500 shadow-sm">
                        <p className="font-medium text-sm">{note.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {note.author?.name && `${note.author.name} • `}
                          {formatDate(note.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </TabsContent>

          {/* Enrollments Tab */}
          <TabsContent value="enrollments">
            <Card className="border shadow-sm overflow-hidden">
              <div className="h-1 bg-gspn-maroon-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gspn-maroon-500/10 rounded-lg">
                    <GraduationCap className="size-5 text-gspn-maroon-500" />
                  </div>
                  {t.students.enrollmentHistory}
                </CardTitle>
                <CardDescription>{student.enrollments.length} {t.students.enrollmentCount}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gspn-gold-50/50 dark:bg-gspn-gold-950/20">
                        <TableHead>{t.students.enrollmentNumber}</TableHead>
                        <TableHead>{t.students.schoolYear}</TableHead>
                        <TableHead>{t.students.gradeLabel}</TableHead>
                        <TableHead>{t.students.levelLabel}</TableHead>
                        <TableHead className="text-right">{t.students.tuition}</TableHead>
                        <TableHead className="text-right">{t.students.amountPaid}</TableHead>
                        <TableHead className="text-center">{t.students.status}</TableHead>
                        <TableHead className="text-center">{t.students.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.enrollments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            {t.students.noEnrollments}
                          </TableCell>
                        </TableRow>
                      ) : (
                        student.enrollments.map((enrollment) => {
                          const tuition = enrollment.adjustedTuitionFee ?? enrollment.originalTuitionFee
                          // Include all payments except reversed and failed
                          const countablePayments = enrollment.payments.filter(p => !['reversed', 'failed'].includes(p.status))
                          const totalPaid = countablePayments.reduce((sum, p) => sum + p.amount, 0)
                          const percentage = Math.round((totalPaid / tuition) * 100)

                          return (
                            <TableRow key={enrollment.id}>
                              <TableCell className="text-muted-foreground text-sm">
                                {enrollment.enrollmentNumber || "-"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{enrollment.schoolYear.name}</span>
                                  {enrollment.schoolYear.isActive && (
                                    <Badge variant="outline" className="text-xs">{t.students.current}</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{enrollment.grade.name}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{getLevelLabel(enrollment.grade.level)}</Badge>
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
                              <TableCell className="text-center">
                                <Link href={`/students/enrollments/${enrollment.id}`}>
                                  <Button variant="ghost" size="sm" className="gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30">
                                    <ExternalLink className="size-3" />
                                    {t.students.viewEnrollment}
                                  </Button>
                                </Link>
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
          <TabsContent value="payments" className="space-y-4">
            {/* Payment Summary Card */}
            {student.balanceInfo && (
              <Card className="border shadow-sm overflow-hidden">
                <div className="h-1 bg-emerald-500" />
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Wallet className="size-5 text-emerald-500" />
                      </div>
                      {t.students.paymentHistory}
                    </CardTitle>
                    <CardDescription>
                      {formatCurrency(student.balanceInfo.totalPaid)} {t.students.paidOf} {formatCurrency(student.balanceInfo.tuitionFee)}
                    </CardDescription>
                  </div>
                  <Link href={`/students/${student.id}/payments`}>
                    <Button size="sm" className="gap-1 bg-gspn-gold-500 text-black hover:bg-gspn-gold-400 shadow-md">
                      <CreditCard className="size-4" />
                      {t.students.managePayments}
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{t.students.paymentProgress}</span>
                        <span className="font-medium">{student.balanceInfo.paymentPercentage}%</span>
                      </div>
                      <Progress value={student.balanceInfo.paymentPercentage} className="h-3 bg-emerald-100 dark:bg-emerald-900/30 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-gspn-gold-500" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                      <div className="text-center p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/30">
                        <p className="text-lg font-bold">{formatCurrency(student.balanceInfo.tuitionFee)}</p>
                        <p className="text-xs text-muted-foreground">{t.students.tuitionFee}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-success/10">
                        <p className="text-lg font-bold text-success">{formatCurrency(student.balanceInfo.totalPaid)}</p>
                        <p className="text-xs text-muted-foreground">{t.students.amountPaid}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{formatCurrency(student.balanceInfo.remainingBalance)}</p>
                        <p className="text-xs text-muted-foreground">{t.students.remainingBalance}</p>
                      </div>
                      {(() => {
                        const statusConfig = getPaymentStatusBadge(student.balanceInfo.paymentStatus)
                        return (
                          <div className={`text-center p-3 rounded-lg ${statusConfig.bgColor}`}>
                            <p className={`text-lg font-bold ${statusConfig.textColor}`}>{statusConfig.label}</p>
                            <p className="text-xs text-muted-foreground">{t.students.status}</p>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment History Table */}
            <Card className="border shadow-sm overflow-hidden">
              <div className="h-1 bg-gspn-maroon-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gspn-maroon-500/10 rounded-lg">
                    <Receipt className="size-5 text-gspn-maroon-500" />
                  </div>
                  {t.students.paymentHistory}
                </CardTitle>
                <CardDescription>{allPayments.length} {t.students.paymentCount}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gspn-gold-50/50 dark:bg-gspn-gold-950/20">
                        <TableHead>{t.students.date}</TableHead>
                        <TableHead>{t.students.schoolYear}</TableHead>
                        <TableHead className="text-right">{t.students.amount}</TableHead>
                        <TableHead>{t.students.method}</TableHead>
                        <TableHead>{t.students.receiptNumber}</TableHead>
                        <TableHead>{t.students.recordedBy}</TableHead>
                        <TableHead className="text-center">{t.students.status}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            {t.students.noPaymentsRecorded}
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
            <Card className="border shadow-sm overflow-hidden">
              <div className="h-1 bg-gspn-maroon-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gspn-maroon-500/10 rounded-lg">
                    <CalendarCheck className="size-5 text-gspn-maroon-500" />
                  </div>
                  {t.students.attendanceHistoryTitle}
                </CardTitle>
                <CardDescription>
                  {t.students.attendanceRate}: {student.attendanceSummary?.attendanceRate ?? 0}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                {student.attendanceSummary && student.attendanceSummary.total > 0 ? (
                  <div className="space-y-6">
                    {/* Attendance Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center p-4 rounded-lg bg-muted">
                        <p className="text-3xl font-bold">{student.attendanceSummary.total}</p>
                        <p className="text-sm text-muted-foreground">{t.students.totalSessions}</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-success/10">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="size-5 text-success" />
                          <p className="text-3xl font-bold text-success">{student.attendanceSummary.present}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{t.students.present}</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-destructive/10">
                        <div className="flex items-center justify-center gap-2">
                          <XCircle className="size-5 text-destructive" />
                          <p className="text-3xl font-bold text-destructive">{student.attendanceSummary.absent}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{t.students.absent}</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-warning/10">
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="size-5 text-warning" />
                          <p className="text-3xl font-bold text-warning">{student.attendanceSummary.late}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{t.students.lateLabel}</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-blue-500/10">
                        <div className="flex items-center justify-center gap-2">
                          <AlertCircle className="size-5 text-blue-500" />
                          <p className="text-3xl font-bold text-blue-500">{student.attendanceSummary.excused}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{t.students.excused}</p>
                      </div>
                    </div>

                    {/* Attendance Rate Visual */}
                    <div className="p-6 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">{t.students.overallAttendanceRate}</h3>
                        <span className={`text-2xl font-bold ${
                          student.attendanceSummary.attendanceRate >= 80 ? 'text-success' :
                          student.attendanceSummary.attendanceRate >= 60 ? 'text-warning' : 'text-destructive'
                        }`}>
                          {student.attendanceSummary.attendanceRate}%
                        </span>
                      </div>
                      <Progress value={student.attendanceSummary.attendanceRate} className="h-4 bg-gspn-maroon-100 dark:bg-gspn-maroon-900/30 [&>div]:bg-gradient-to-r [&>div]:from-gspn-maroon-500 [&>div]:to-emerald-500" />
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
                    <p>{t.students.noAttendanceRecords}</p>
                    <p className="text-sm mt-2">{t.students.noAttendanceDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities">
            <Card className="border shadow-sm overflow-hidden">
              <div className="h-1 bg-purple-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Sparkles className="size-5 text-purple-500" />
                  </div>
                  {t.students.enrolledActivities}
                </CardTitle>
                <CardDescription>{activities.length} {t.students.activityCount}</CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="size-12 mx-auto mb-4 opacity-50" />
                    <p>{t.students.noActivitiesEnrolled}</p>
                    <p className="text-sm mt-2">{t.students.noActivitiesDescription}</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activities.map((ae) => (
                      <div
                        key={ae.enrollmentId}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded ${activityTypeColors[ae.activity.type]}`}>
                              {activityTypeIcons[ae.activity.type]}
                            </div>
                            <h3 className="font-semibold">{ae.activity.name}</h3>
                          </div>
                          <Badge className={activityTypeColors[ae.activity.type]}>
                            {ae.activity.type}
                          </Badge>
                        </div>
                        {ae.activity.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {ae.activity.description}
                          </p>
                        )}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{t.students.enrolledOn}</span>
                            <span>{formatDate(ae.enrolledAt)}</span>
                          </div>
                          {ae.activity.fee > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">{t.students.fee}</span>
                              <span className="font-medium">{formatCurrency(ae.activity.fee)}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{t.students.status}</span>
                            <Badge variant={ae.status === "active" ? "default" : "secondary"}>
                              {ae.status === "active" ? t.students.activeStatus : ae.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
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
            studentName={`${student.firstName}${activeEnrollment?.middleName ? ` ${activeEnrollment.middleName}` : ""} ${student.lastName}`}
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
