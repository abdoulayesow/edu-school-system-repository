"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, ChevronRight, Loader2, FileText, Clock, CheckCircle2, Users } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { PermissionGuard } from "@/components/permission-guard"
import { DataPagination } from "@/components/data-pagination"
import { StatCard, FilterCard, HydratedSelect, type SelectOption } from "@/components/students"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { useEnrollments, useGrades, useActiveSchoolYear } from "@/lib/hooks/use-api"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { EmptyEnrollmentsIllustration } from "@/components/illustrations"

const ITEMS_PER_PAGE = 50

interface Enrollment {
  id: string
  enrollmentNumber: string
  firstName: string
  middleName?: string | null
  lastName: string
  photoUrl?: string | null
  status: string
  createdAt: string
  grade: {
    id: string
    name: string
    level: number
  } | null
  totalPaid: number
  tuitionFee: number
}

export default function EnrollmentsPage() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Pagination state
  const [offset, setOffset] = useState(0)
  const [limit, setLimit] = useState(ITEMS_PER_PAGE)

  // Get active school year
  const { data: activeSchoolYear } = useActiveSchoolYear()

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0)
  }, [searchQuery, statusFilter, gradeFilter, startDate, endDate])

  // Check if any filters are active (excluding school year which is always set)
  const hasActiveFilters = !!(searchQuery || statusFilter !== "all" || gradeFilter !== "all" || startDate || endDate)

  // Clear all filters (but keep school year)
  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setGradeFilter("all")
    setStartDate("")
    setEndDate("")
  }

  // React Query hooks
  const { data: enrollmentsData, isLoading: enrollmentsLoading, error: enrollmentsError } = useEnrollments({
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    gradeId: gradeFilter !== "all" ? gradeFilter : undefined,
    schoolYearId: activeSchoolYear?.id,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    limit,
    offset,
  })
  const { data: gradesData, isLoading: gradesLoading } = useGrades()

  // Extract data from query results
  const enrollments: Enrollment[] = useMemo(() => {
    const data = enrollmentsData?.enrollments ?? []
    // Map API response to local Enrollment type
    return data.map(e => ({
      id: e.id,
      enrollmentNumber: e.enrollmentNumber ?? "",
      firstName: e.firstName,
      middleName: e.middleName,
      lastName: e.lastName,
      photoUrl: e.photoUrl,
      status: e.status,
      createdAt: e.createdAt,
      grade: e.grade ? {
        id: e.gradeId,
        name: e.grade.name,
        level: parseInt(e.grade.level) || 0
      } : null,
      totalPaid: e.totalPaid ?? 0,
      tuitionFee: e.tuitionFee
    }))
  }, [enrollmentsData])

  const grades = gradesData?.grades ?? []
  const pagination = enrollmentsData?.pagination ?? null
  const isLoading = enrollmentsLoading || gradesLoading
  const error = enrollmentsError ? "Failed to load enrollments" : null

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

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * limit
    setOffset(newOffset)
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setOffset(0) // Reset to first page when changing limit
  }

  const getEnrollmentStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">{t.enrollments.draft}</Badge>
      case "submitted":
        return <Badge className="bg-blue-500 text-white">{t.enrollments.submitted}</Badge>
      case "needs_review":
        return <Badge className="bg-warning text-warning-foreground">{t.enrollments.needsReview}</Badge>
      case "completed":
        return <Badge className="bg-success text-success-foreground">{t.enrollments.completed}</Badge>
      case "rejected":
        return <Badge variant="destructive">{t.enrollments.rejected}</Badge>
      case "cancelled":
        return <Badge variant="secondary">{t.enrollments.cancelled}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get stats from API response (accurate totals, not just current page)
  const stats = useMemo(() => {
    const apiStats = enrollmentsData?.stats
    return {
      total: apiStats?.total ?? 0,
      drafts: apiStats?.draft ?? 0,
      submitted: apiStats?.submitted ?? 0,
      completed: apiStats?.completed ?? 0,
    }
  }, [enrollmentsData?.stats])

  // Server-side filtering is now handled by the API
  const filteredEnrollments = enrollments

  // Build status options for HydratedSelect
  const statusOptions: SelectOption[] = [
    { value: "all", label: t.enrollments.allStatuses },
    { value: "draft", label: t.enrollments.draft },
    { value: "submitted", label: t.enrollments.submitted },
    { value: "needs_review", label: t.enrollments.needsReview },
    { value: "completed", label: t.enrollments.completed },
    { value: "rejected", label: t.enrollments.rejected },
    { value: "cancelled", label: t.enrollments.cancelled },
  ]

  // Build grade options for HydratedSelect
  const gradeOptions: SelectOption[] = [
    { value: "all", label: t.enrollments.allGrades },
    ...grades.map(grade => ({
      value: grade.id,
      label: grade.name,
    })),
  ]

  return (
    <PageContainer maxWidth="full">
      {/* Page Header with Brand Styling */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="h-1 bg-gspn-maroon-500" />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                  <FileText className="h-6 w-6 text-gspn-maroon-500" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  {t.enrollments.title}
                </h1>
              </div>
              <p className="text-muted-foreground mt-1">
                {t.enrollments.subtitle}
              </p>
            </div>
            {/* Current School Year Indicator */}
            {activeSchoolYear && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gspn-maroon-50 dark:bg-gspn-maroon-950/30 border border-gspn-maroon-200 dark:border-gspn-maroon-800">
                <span className="text-sm text-gspn-maroon-700 dark:text-gspn-maroon-400">
                  {locale === "fr" ? "Année scolaire:" : "School Year:"}
                </span>
                <span className="text-sm font-semibold text-gspn-maroon-800 dark:text-gspn-maroon-300">
                  {activeSchoolYear.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title={t.enrollments.totalEnrollments}
          value={stats.total}
          description={t.enrollments.allEnrollments}
          icon={FileText}
        />
        <StatCard
          title={t.enrollments.draftEnrollments}
          value={stats.drafts}
          description={t.enrollments.inProgress}
          icon={Clock}
        />
        <StatCard
          title={t.enrollments.submitted}
          value={stats.submitted}
          description={t.enrollments.awaitingReview}
          icon={CheckCircle2}
        />
        <StatCard
          title={t.enrollments.completed}
          value={stats.completed}
          description={t.enrollments.approvedEnrollments}
          icon={Users}
        />
      </div>

      {/* Filters */}
      <FilterCard
        title={t.enrollments.filterEnrollments}
        showClear={hasActiveFilters}
        onClearFilters={clearFilters}
        clearLabel={locale === "fr" ? "Effacer les filtres" : "Clear filters"}
      >
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={t.enrollments.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <HydratedSelect
            value={statusFilter}
            onValueChange={setStatusFilter}
            placeholder={t.enrollments.allStatuses}
            options={statusOptions}
            width="w-full sm:w-[180px]"
          />

          {/* Grade Filter */}
          <HydratedSelect
            value={gradeFilter}
            onValueChange={setGradeFilter}
            placeholder={t.enrollments.allGrades}
            options={gradeOptions}
            width="w-full sm:w-[180px]"
          />

          {/* Start Date Filter */}
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full sm:w-[160px]"
            placeholder={locale === "fr" ? "Date début" : "Start date"}
          />

          {/* End Date Filter */}
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full sm:w-[160px]"
            placeholder={locale === "fr" ? "Date fin" : "End date"}
          />
        </div>
      </FilterCard>

      {/* Enrollments Table */}
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
              <div>
                <CardTitle>{t.enrollments.allStudents}</CardTitle>
                <CardDescription>
                  {filteredEnrollments.length} {t.common.students}
                  {pagination && ` sur ${pagination.total}`}
                </CardDescription>
              </div>
            </div>
            <PermissionGuard
              resource="student_enrollment"
              action="create"
              loading={<div className="h-9 w-40 animate-pulse bg-muted rounded-md" />}
            >
              <Button
                asChild
                variant="gold"
                className="w-full sm:w-auto"
              >
                <Link href="/students/enrollments/new">
                  <Plus className="h-4 w-4 mr-2" />
                  {t.enrollments.newEnrollment}
                </Link>
              </Button>
            </PermissionGuard>
          </div>
        </CardHeader>
        <CardContent>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gspn-maroon-500" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : (
              <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gspn-gold-50/50 dark:bg-gspn-gold-950/20">
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>{t.enrollments.fullName}</TableHead>
                      <TableHead>{t.enrollments.enrollmentId}</TableHead>
                      <TableHead>{t.common.level}</TableHead>
                      <TableHead>{t.enrollments.enrollmentDate}</TableHead>
                      <TableHead>{t.enrollments.enrollmentStatus}</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <Empty className="py-12">
                            <EmptyMedia variant="illustration">
                              <EmptyEnrollmentsIllustration />
                            </EmptyMedia>
                            <EmptyTitle>
                              {searchQuery || statusFilter !== "all" || gradeFilter !== "all"
                                ? t.common.noData
                                : t.enrollments.subtitle}
                            </EmptyTitle>
                            <EmptyDescription>{t.enrollments.subtitle}</EmptyDescription>
                          </Empty>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEnrollments.map((enrollment) => (
                        <TableRow
                          key={enrollment.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => router.push(`/enrollments/${enrollment.id}`)}
                        >
                          <TableCell>
                            <Avatar className="size-10">
                              <AvatarImage
                                src={enrollment.photoUrl ?? undefined}
                                alt={`${enrollment.firstName} ${enrollment.lastName}`}
                              />
                              <AvatarFallback>
                                {enrollment.firstName?.[0]}{enrollment.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">
                            {enrollment.firstName}
                            {enrollment.middleName && ` ${enrollment.middleName}`}
                            {' '}{enrollment.lastName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{enrollment.enrollmentNumber}</TableCell>
                          <TableCell>{enrollment.grade?.name}</TableCell>
                          <TableCell>{formatDate(enrollment.createdAt, locale)}</TableCell>
                          <TableCell>{getEnrollmentStatusBadge(enrollment.status)}</TableCell>
                          <TableCell className="text-right pr-4">
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              )}
              </>
            )}
          </CardContent>
        </Card>
    </PageContainer>
  )
}
