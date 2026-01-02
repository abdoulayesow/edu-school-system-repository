"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Eye,
  Loader2,
  Users,
  Wallet,
  CalendarCheck,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { DataPagination } from "@/components/data-pagination"
import Link from "next/link"
import { sizing } from "@/lib/design-tokens"
import { useGrades, useStudents, type ApiStudent } from "@/lib/hooks/use-api"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { getStudentRowStatus } from "@/lib/status-helpers"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { EmptyStudentsIllustration } from "@/components/illustrations"

const ITEMS_PER_PAGE = 50

type Student = ApiStudent

export default function StudentsPage() {
  const { t } = useI18n()

  // Track if component is mounted to prevent hydration mismatches
  const [isMounted, setIsMounted] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all")
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<string>("all")

  // Debounce search query for server-side filtering (300ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Pagination state
  const [offset, setOffset] = useState(0)

  // Reset offset when server-side filters change
  useEffect(() => {
    setOffset(0)
  }, [debouncedSearchQuery, gradeFilter])

  // Also reset offset when client-side filters change
  useEffect(() => {
    setOffset(0)
  }, [paymentStatusFilter, attendanceStatusFilter])

  // React Query hooks - fetch data with automatic caching
  const { data: gradesData, isLoading: gradesLoading } = useGrades()
  const { data: studentsData, isLoading: studentsLoading, error: studentsError } = useStudents({
    search: debouncedSearchQuery || undefined,
    gradeId: gradeFilter !== "all" ? gradeFilter : undefined,
    limit: ITEMS_PER_PAGE,
    offset,
  })

  // Extract data with defaults
  const grades = gradesData?.grades ?? []
  const students = studentsData?.students ?? []
  const pagination = studentsData?.pagination ?? null
  const isLoading = gradesLoading || studentsLoading
  const error = studentsError ? "Failed to load students" : null

  // Set mounted flag after component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Client-side filtering for calculated fields only
  // (search and grade filtering is now handled server-side)
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesPayment = paymentStatusFilter === "all" || student.paymentStatus === paymentStatusFilter
      const matchesAttendance = attendanceStatusFilter === "all" || student.attendanceStatus === attendanceStatusFilter

      return matchesPayment && matchesAttendance
    })
  }, [students, paymentStatusFilter, attendanceStatusFilter])

  // Summary statistics
  const stats = useMemo(() => {
    const lateCount = students.filter(s => s.paymentStatus === "late").length
    const onTimeCount = students.filter(s => s.paymentStatus === "on_time").length
    const inAdvanceCount = students.filter(s => s.paymentStatus === "in_advance").length
    const completeCount = students.filter(s => s.paymentStatus === "complete").length

    const goodAttendance = students.filter(s => s.attendanceStatus === "good").length
    const concerningAttendance = students.filter(s => s.attendanceStatus === "concerning").length
    const criticalAttendance = students.filter(s => s.attendanceStatus === "critical").length

    return {
      total: students.length,
      payment: { late: lateCount, onTime: onTimeCount, inAdvance: inAdvanceCount, complete: completeCount },
      attendance: { good: goodAttendance, concerning: concerningAttendance, critical: criticalAttendance }
    }
  }, [students])

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination?.hasMore) {
      setOffset(pagination.offset + pagination.limit)
    }
  }

  const handlePrevPage = () => {
    if (pagination && pagination.offset > 0) {
      setOffset(Math.max(0, pagination.offset - pagination.limit))
    }
  }

  // Badge helper functions
  const getEnrollmentStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">-</Badge>

    // Type assertion for status keys that exist in enrollments translations
    const enrollments = t.enrollments as typeof t.enrollments & {
      statusDraft?: string
      statusSubmitted?: string
      statusNeedsReview?: string
      statusCompleted?: string
      statusRejected?: string
      statusCancelled?: string
    }

    const config: Record<string, { className: string; label: string; icon?: React.ElementType }> = {
      draft: {
        className: "bg-muted/10 text-muted-foreground border-muted/30",
        label: enrollments.statusDraft || "Draft"
      },
      submitted: {
        className: "bg-warning/10 text-warning border-warning/30",
        label: enrollments.statusSubmitted || "Submitted"
      },
      needs_review: {
        className: "bg-warning/10 text-warning border-warning/30",
        label: enrollments.statusNeedsReview || "Needs Review"
      },
      completed: {
        className: "bg-success/10 text-success border-success/30",
        label: enrollments.statusCompleted || "Completed",
        icon: CheckCircle
      },
      rejected: {
        className: "bg-destructive/10 text-destructive border-destructive/30",
        label: enrollments.statusRejected || "Rejected",
        icon: XCircle
      },
      cancelled: {
        className: "bg-destructive/10 text-destructive border-destructive/30",
        label: enrollments.statusCancelled || "Cancelled",
        icon: XCircle
      },
    }

    const { className, label, icon: Icon } = config[status] || { className: "", label: status }

    return (
      <Badge variant="outline" className={className}>
        {Icon && <Icon className="size-3 mr-1" />}
        {label}
      </Badge>
    )
  }

  const getAttendanceBadge = (status: string | null) => {
    if (!status) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600">
          {t.students.missingData || "Missing data"}
        </Badge>
      )
    }

    const config: Record<string, { className: string; label: string; icon: React.ElementType }> = {
      good: {
        className: "bg-success/10 text-success border-success/30",
        label: t.students.attendanceGood,
        icon: CheckCircle
      },
      concerning: {
        className: "bg-warning/10 text-warning border-warning/30",
        label: t.students.attendanceConcerning,
        icon: AlertCircle
      },
      critical: {
        className: "bg-destructive/10 text-destructive border-destructive/30",
        label: t.students.attendanceCritical,
        icon: XCircle
      },
    }

    const { className, label, icon: Icon } = config[status] || { className: "", label: status, icon: CheckCircle }

    return (
      <Badge variant="outline" className={`${className} gap-1`}>
        <Icon className="size-3" />
        {label}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">-</Badge>

    const config: Record<string, { className: string; label: string }> = {
      late: {
        className: "bg-destructive/10 text-destructive border-destructive/30",
        label: t.students.late
      },
      on_time: {
        className: "bg-success/10 text-success border-success/30",
        label: t.students.onTime
      },
      in_advance: {
        className: "bg-primary/10 text-primary border-primary/30",
        label: t.students.inAdvance
      },
      complete: {
        className: "bg-success/10 text-success border-success/30",
        label: t.students.complete
      },
    }

    const { className, label } = config[status] || { className: "", label: status }

    return (
      <Badge variant="outline" className={className}>
        {label}
      </Badge>
    )
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.students.title}</h1>
          <p className="text-muted-foreground">{t.students.subtitle}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {/* Total Students */}
          <Card className="py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.common.students}</CardTitle>
              <Users className={sizing.icon.lg} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {filteredStudents.length !== stats.total ? `${filteredStudents.length} ${t.students.displayed}` : ""}
              </p>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.students.balanceStatus}</CardTitle>
              <Wallet className={sizing.icon.lg} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.payment.late}</div>
              <p className="text-xs text-muted-foreground">
                {stats.payment.onTime} {t.students.onTime}, {stats.payment.inAdvance} {t.students.inAdvance}, {stats.payment.complete} {t.students.complete}
              </p>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card className="py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.nav.attendance}</CardTitle>
              <CalendarCheck className={sizing.icon.lg} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.attendance.good}</div>
              <p className="text-xs text-muted-foreground">
                {stats.attendance.concerning} {t.students.attendanceConcerning.toLowerCase()}, {stats.attendance.critical} {t.students.attendanceCritical.toLowerCase()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 py-2">
          <CardHeader className="pb-1 px-6 pt-3">
            <CardTitle className="text-sm">{t.students.filterStudents}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-2 px-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder={t.students.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Grade Filter */}
              {isMounted ? (
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={t.students.allGrades} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.students.allGrades}</SelectItem>
                    {grades.map(grade => (
                      <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="w-full sm:w-[180px] h-9 rounded-md border bg-transparent px-3 py-2 flex items-center text-sm text-muted-foreground">
                  {t.students.allGrades}
                </div>
              )}

              {/* Payment Status Filter */}
              {isMounted ? (
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={t.students.allPayments} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.students.allPayments}</SelectItem>
                    <SelectItem value="late">{t.students.late}</SelectItem>
                    <SelectItem value="on_time">{t.students.onTime}</SelectItem>
                    <SelectItem value="in_advance">{t.students.inAdvance}</SelectItem>
                    <SelectItem value="complete">{t.students.complete}</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="w-full sm:w-[180px] h-9 rounded-md border bg-transparent px-3 py-2 flex items-center text-sm text-muted-foreground">
                  {t.students.allPayments}
                </div>
              )}

              {/* Attendance Status Filter */}
              {isMounted ? (
                <Select value={attendanceStatusFilter} onValueChange={setAttendanceStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={t.students.allAttendances} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.students.allAttendances}</SelectItem>
                    <SelectItem value="good">{t.students.attendanceGood}</SelectItem>
                    <SelectItem value="concerning">{t.students.attendanceConcerning}</SelectItem>
                    <SelectItem value="critical">{t.students.attendanceCritical}</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="w-full sm:w-[180px] h-9 rounded-md border bg-transparent px-3 py-2 flex items-center text-sm text-muted-foreground">
                  {t.students.allAttendances}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>{t.students.title}</CardTitle>
                <CardDescription>
                  {filteredStudents.length} {t.common.students}
                  {pagination && ` sur ${pagination.total}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : (
              <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>{t.enrollments.fullName}</TableHead>
                      <TableHead>{t.enrollments.studentId}</TableHead>
                      <TableHead>{t.common.level}</TableHead>
                      <TableHead>{t.students.room}</TableHead>
                      <TableHead>{t.enrollments.paymentStatus}</TableHead>
                      <TableHead>{t.nav.attendance}</TableHead>
                      <TableHead className="text-right">{t.common.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="p-0">
                          <Empty className="py-12">
                            <EmptyMedia variant="illustration">
                              <EmptyStudentsIllustration />
                            </EmptyMedia>
                            <EmptyTitle>
                              {searchQuery || gradeFilter !== "all" || paymentStatusFilter !== "all" || attendanceStatusFilter !== "all"
                                ? t.students.noStudentsFound
                                : t.students.noStudentsEnrolled}
                            </EmptyTitle>
                            <EmptyDescription>{t.students.subtitle}</EmptyDescription>
                          </Empty>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id} status={getStudentRowStatus(student.paymentStatus ?? undefined, student.attendanceStatus ?? undefined)} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <Avatar className="size-10">
                              <AvatarImage src={student.photoUrl ?? undefined} alt={`${student.firstName} ${student.lastName}`} />
                              <AvatarFallback>
                                {student.firstName?.[0]}{student.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {student.studentNumber}
                          </TableCell>
                          <TableCell>{student.grade?.name ?? "-"}</TableCell>
                          <TableCell>
                            {student.roomAssignment?.gradeRoom?.displayName ||
                              student.roomAssignment?.gradeRoom?.name ||
                              "-"}
                          </TableCell>
                          <TableCell>
                            {getPaymentStatusBadge(student.paymentStatus)}
                          </TableCell>
                          <TableCell>
                            {getAttendanceBadge(student.attendanceStatus)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/students/${student.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                {t.common.view}
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {pagination && (
                <DataPagination
                  pagination={pagination}
                  onPrevPage={handlePrevPage}
                  onNextPage={handleNextPage}
                />
              )}
              </>
            )}
          </CardContent>
        </Card>
    </PageContainer>
  )
}
