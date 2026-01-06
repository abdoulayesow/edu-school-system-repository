"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Eye, Loader2, FileText, Clock, CheckCircle2, Users } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { DataPagination } from "@/components/data-pagination"
import { sizing } from "@/lib/design-tokens"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { useEnrollments, useGrades, useActiveSchoolYear } from "@/lib/hooks/use-api"
import { getEnrollmentRowStatus } from "@/lib/status-helpers"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { EmptyEnrollmentsIllustration } from "@/components/illustrations"

const ITEMS_PER_PAGE = 50

interface Enrollment {
  id: string
  enrollmentNumber: string
  firstName: string
  lastName: string
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
  const [isMounted, setIsMounted] = useState(false)
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
  const hasActiveFilters = searchQuery || statusFilter !== "all" || gradeFilter !== "all" || startDate || endDate

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
      lastName: e.lastName,
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

  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  const getPaymentStatus = (enrollment: Enrollment) => {
    if (enrollment.status === "draft") return "pending"
    if (enrollment.totalPaid >= enrollment.tuitionFee) return "paid"
    if (enrollment.totalPaid > 0) return "pending"
    return "overdue"
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

  return (
    <PageContainer maxWidth="full">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.enrollments.title}</h1>
          <p className="text-muted-foreground">{t.enrollments.subtitle}</p>
        </div>
        {/* Current School Year Indicator */}
        {activeSchoolYear && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <span className="text-sm text-amber-700 dark:text-amber-400">
              {locale === "fr" ? "Année scolaire:" : "School Year:"}
            </span>
            <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {activeSchoolYear.name}
            </span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.enrollments.totalEnrollments}</CardTitle>
            <FileText className={sizing.icon.lg} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{t.enrollments.allEnrollments}</p>
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.enrollments.draftEnrollments}</CardTitle>
            <Clock className={sizing.icon.lg} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
            <p className="text-xs text-muted-foreground">{t.enrollments.inProgress}</p>
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.enrollments.submitted}</CardTitle>
            <CheckCircle2 className={sizing.icon.lg} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submitted}</div>
            <p className="text-xs text-muted-foreground">{t.enrollments.awaitingReview}</p>
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.enrollments.completed}</CardTitle>
            <Users className={sizing.icon.lg} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">{t.enrollments.approvedEnrollments}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 py-2">
        <CardHeader className="pb-1 px-6 pt-3">
          <CardTitle className="text-sm">{t.enrollments.filterEnrollments}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-2 px-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={t.enrollments.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            {isMounted ? (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t.enrollments.allStatuses} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.enrollments.allStatuses}</SelectItem>
                  <SelectItem value="draft">{t.enrollments.draft}</SelectItem>
                  <SelectItem value="submitted">{t.enrollments.submitted}</SelectItem>
                  <SelectItem value="needs_review">{t.enrollments.needsReview}</SelectItem>
                  <SelectItem value="completed">{t.enrollments.completed}</SelectItem>
                  <SelectItem value="rejected">{t.enrollments.rejected}</SelectItem>
                  <SelectItem value="cancelled">{t.enrollments.cancelled}</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="w-full sm:w-[180px] h-9 rounded-md border bg-transparent px-3 py-2 flex items-center text-sm text-muted-foreground">
                {t.enrollments.allStatuses}
              </div>
            )}

            {/* Grade Filter */}
            {isMounted ? (
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t.enrollments.allGrades} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.enrollments.allGrades}</SelectItem>
                  {grades.map(grade => (
                    <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="w-full sm:w-[180px] h-9 rounded-md border bg-transparent px-3 py-2 flex items-center text-sm text-muted-foreground">
                {t.enrollments.allGrades}
              </div>
            )}

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

          {/* Clear Filters Link */}
          {hasActiveFilters && (
            <div className="mt-2">
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:underline cursor-pointer"
              >
                {locale === "fr" ? "Effacer les filtres" : "Clear filters"}
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>{t.enrollments.allStudents}</CardTitle>
              <CardDescription>
                {filteredEnrollments.length} {t.common.students}
                {pagination && ` sur ${pagination.total}`}
              </CardDescription>
            </div>
            <Button
              asChild
              variant="gold"
              className="w-full sm:w-auto"
            >
              <Link href="/enrollments/new">
                <Plus className="h-4 w-4 mr-2" />
                {t.enrollments.newEnrollment}
              </Link>
            </Button>
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
                      <TableHead>{t.enrollments.enrollmentDate}</TableHead>
                      <TableHead>{t.enrollments.fullName}</TableHead>
                      <TableHead>{t.enrollments.enrollmentId}</TableHead>
                      <TableHead>{t.common.level}</TableHead>
                      <TableHead>{t.enrollments.enrollmentStatus}</TableHead>
                      <TableHead className="text-right">{t.common.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="p-0">
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
                        <TableRow key={enrollment.id} status={getEnrollmentRowStatus(enrollment.status)}>
                          <TableCell>{formatDate(enrollment.createdAt, locale)}</TableCell>
                          <TableCell className="font-medium">{enrollment.firstName} {enrollment.lastName}</TableCell>
                          <TableCell className="text-muted-foreground">{enrollment.enrollmentNumber}</TableCell>
                          <TableCell>{enrollment.grade?.name}</TableCell>
                          <TableCell>{getEnrollmentStatusBadge(enrollment.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/enrollments/${enrollment.id}`}>
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
