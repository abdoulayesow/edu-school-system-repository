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
import { sizing } from "@/lib/design-tokens"
import Link from "next/link"

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

interface Grade {
  id: string
  name: string
  level: string
  order: number
}

export default function EnrollmentsPage() {
  const { t } = useI18n()
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const [enrollmentsRes, gradesRes] = await Promise.all([
          fetch("/api/enrollments"),
          fetch("/api/grades")
        ])

        if (!enrollmentsRes.ok) {
          throw new Error("Failed to fetch enrollments")
        }
        const enrollmentsData = await enrollmentsRes.json()
        setEnrollments(enrollmentsData)

        if (gradesRes.ok) {
          const gradesData = await gradesRes.json()
          setGrades(gradesData.grades || [])
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load enrollments")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const getPaymentStatus = (enrollment: Enrollment) => {
    if (enrollment.status === "draft") return "pending"
    if (enrollment.totalPaid >= enrollment.tuitionFee) return "paid"
    if (enrollment.totalPaid > 0) return "pending"
    return "overdue"
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success text-success-foreground">{t.enrollments.paid}</Badge>
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">{t.enrollments.pendingPayment}</Badge>
      case "overdue":
        return <Badge variant="destructive">{t.enrollments.overdue}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Calculate summary stats
  const stats = useMemo(() => {
    const total = enrollments.length
    const drafts = enrollments.filter(e => e.status === "draft").length
    const submitted = enrollments.filter(e => e.status === "submitted").length
    const completed = enrollments.filter(e => e.status === "completed").length
    return { total, drafts, submitted, completed }
  }, [enrollments])

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      const matchesSearch = searchQuery === "" ||
        `${enrollment.firstName} ${enrollment.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.enrollmentNumber?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || enrollment.status === statusFilter
      const matchesGrade = gradeFilter === "all" || enrollment.grade?.id === gradeFilter

      return matchesSearch && matchesStatus && matchesGrade
    })
  }, [enrollments, searchQuery, statusFilter, gradeFilter])

  return (
    <PageContainer maxWidth="full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t.enrollments.title}</h1>
        <p className="text-muted-foreground">{t.enrollments.subtitle}</p>
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="needs_review">Needs Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>{t.enrollments.allStudents}</CardTitle>
              <CardDescription>{filteredEnrollments.length} {t.common.students}</CardDescription>
            </div>
            <Button
              asChild
              className="w-full sm:w-auto bg-[#e79908] hover:bg-[#d68907] text-black dark:bg-gspn-maroon-950 dark:hover:bg-gspn-maroon-900 dark:text-white"
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.enrollments.studentId}</TableHead>
                      <TableHead>{t.enrollments.fullName}</TableHead>
                      <TableHead>{t.common.level}</TableHead>
                      <TableHead>{t.enrollments.enrollmentDate}</TableHead>
                      <TableHead>{t.enrollments.paymentStatus}</TableHead>
                      <TableHead className="text-right">{t.common.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {searchQuery ? "No enrollments found matching your search" : "No enrollments yet"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEnrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">{enrollment.enrollmentNumber}</TableCell>
                          <TableCell>{enrollment.firstName} {enrollment.lastName}</TableCell>
                          <TableCell>{enrollment.grade?.name}</TableCell>
                          <TableCell>{new Date(enrollment.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{getPaymentBadge(getPaymentStatus(enrollment))}</TableCell>
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
            )}
          </CardContent>
        </Card>
    </PageContainer>
  )
}
