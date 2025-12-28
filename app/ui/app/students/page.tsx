"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Eye,
  Loader2,
  Users,
  Wallet,
  CalendarCheck,
  Award,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import Link from "next/link"

interface Student {
  id: string
  studentNumber: string
  firstName: string
  lastName: string
  photoUrl: string | null
  grade: { id: string; name: string; level: number; order: number } | null
  paymentStatus: "late" | "on_time" | "in_advance" | "complete" | null
  attendanceStatus: "good" | "concerning" | "critical" | null
  balanceInfo: {
    tuitionFee: number
    totalPaid: number
    remainingBalance: number
    paymentPercentage: number
  } | null
}

interface Grade {
  id: string
  name: string
  level: number
  order: number
}

interface Pagination {
  total: number
  filteredTotal: number
  limit: number
  offset: number
  hasMore: boolean
}

export default function StudentsPage() {
  const { t } = useI18n()

  // Data states
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all")
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<string>("all")

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        const [gradesRes, studentsRes] = await Promise.all([
          fetch("/api/grades"),
          fetch("/api/students")
        ])

        if (!gradesRes.ok || !studentsRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const gradesData = await gradesRes.json()
        const studentsData = await studentsRes.json()

        setGrades(gradesData.grades || [])
        setStudents(studentsData.students || [])
        setPagination(studentsData.pagination || null)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load students")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Client-side filtering
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = searchQuery === "" ||
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentNumber?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesGrade = gradeFilter === "all" || student.grade?.id === gradeFilter
      const matchesPayment = paymentStatusFilter === "all" || student.paymentStatus === paymentStatusFilter
      const matchesAttendance = attendanceStatusFilter === "all" || student.attendanceStatus === attendanceStatusFilter

      return matchesSearch && matchesGrade && matchesPayment && matchesAttendance
    })
  }, [students, searchQuery, gradeFilter, paymentStatusFilter, attendanceStatusFilter])

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

  // Badge helper functions
  const getPaymentBadge = (status: string | null, balanceInfo: Student["balanceInfo"]) => {
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
        className: "bg-amber-500/10 text-amber-600 border-amber-500/30",
        label: t.students.goldMedal
      },
    }

    const { className, label } = config[status] || { className: "", label: status }

    return (
      <div className="flex flex-col gap-1">
        <Badge variant="outline" className={className}>
          {status === "complete" && <Award className="size-3 mr-1" />}
          {label}
        </Badge>
        {balanceInfo && status !== "complete" && (
          <div className="flex items-center gap-2">
            <Progress value={balanceInfo.paymentPercentage} className="h-1.5 w-16" />
            <span className="text-xs text-muted-foreground">{Math.round(balanceInfo.paymentPercentage)}%</span>
          </div>
        )}
      </div>
    )
  }

  const getAttendanceBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">-</Badge>

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
      <Badge variant="outline" className={className}>
        <Icon className="size-3 mr-1" />
        {label}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-4 lg:pt-4">
      <main className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.students.title}</h1>
          <p className="text-muted-foreground">{t.students.subtitle}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {/* Total Students */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="size-4" />
                {t.common.students}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredStudents.length !== stats.total && `${filteredStudents.length} affichés`}
              </p>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="size-4" />
                {t.students.balanceStatus}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-destructive">{stats.payment.late}</span>
                <span className="text-sm text-muted-foreground">{t.students.late}</span>
              </div>
              <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                <span className="text-success">{stats.payment.onTime} {t.students.onTime}</span>
                <span className="text-primary">{stats.payment.inAdvance} {t.students.inAdvance}</span>
                <span className="text-amber-600">{stats.payment.complete} {t.students.complete}</span>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CalendarCheck className="size-4" />
                Présence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-success">{stats.attendance.good}</span>
                <span className="text-sm text-muted-foreground">{t.students.attendanceGood}</span>
              </div>
              <div className="flex gap-3 mt-2 text-xs">
                <span className="text-warning">{stats.attendance.concerning} préoccupante</span>
                <span className="text-destructive">{stats.attendance.critical} critique</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
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

              {/* Payment Status Filter */}
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t.students.balanceStatus} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.students.allStatuses}</SelectItem>
                  <SelectItem value="late">{t.students.late}</SelectItem>
                  <SelectItem value="on_time">{t.students.onTime}</SelectItem>
                  <SelectItem value="in_advance">{t.students.inAdvance}</SelectItem>
                  <SelectItem value="complete">{t.students.complete}</SelectItem>
                </SelectContent>
              </Select>

              {/* Attendance Status Filter */}
              <Select value={attendanceStatusFilter} onValueChange={setAttendanceStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Présence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.students.allStatuses}</SelectItem>
                  <SelectItem value="good">{t.students.attendanceGood}</SelectItem>
                  <SelectItem value="concerning">{t.students.attendanceConcerning}</SelectItem>
                  <SelectItem value="critical">{t.students.attendanceCritical}</SelectItem>
                </SelectContent>
              </Select>
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>{t.enrollments.fullName}</TableHead>
                      <TableHead>{t.enrollments.studentId}</TableHead>
                      <TableHead>{t.common.level}</TableHead>
                      <TableHead>{t.students.balanceStatus}</TableHead>
                      <TableHead>Présence</TableHead>
                      <TableHead className="text-right">{t.common.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchQuery || gradeFilter !== "all" || paymentStatusFilter !== "all" || attendanceStatusFilter !== "all"
                            ? "Aucun étudiant trouvé avec ces critères"
                            : "Aucun étudiant inscrit"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50">
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
                            {getPaymentBadge(student.paymentStatus, student.balanceInfo)}
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
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
