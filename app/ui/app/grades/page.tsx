"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  BookOpen,
  CalendarCheck,
  Wallet,
  Loader2,
  GraduationCap,
  User,
  ChevronRight
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import Link from "next/link"
import { PageContainer } from "@/components/layout"

interface GradeLeader {
  id: string
  person: {
    firstName: string
    lastName: string
    photoUrl: string | null
  }
}

interface Grade {
  id: string
  name: string
  code: string
  level: string
  order: number
  gradeLeader: GradeLeader | null
  schoolYear: {
    id: string
    name: string
    isActive: boolean
  }
  stats: {
    studentCount: number
    subjectCount: number
    attendanceRate: number | null
    paymentRate: number | null
    paymentBreakdown: {
      late: number
      onTime: number
      complete: number
    }
  }
}

export default function GradesPage() {
  const { t } = useI18n()

  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [levelFilter, setLevelFilter] = useState<string>("all")

  useEffect(() => {
    async function fetchGrades() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/grades")
        if (!response.ok) {
          throw new Error("Failed to fetch grades")
        }
        const data = await response.json()
        setGrades(data.grades || [])
      } catch (err) {
        console.error("Error fetching grades:", err)
        setError("Failed to load grades")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGrades()
  }, [])

  // Get unique levels for filter
  const levels = useMemo(() => {
    const uniqueLevels = [...new Set(grades.map(g => g.level))]
    return uniqueLevels.sort()
  }, [grades])

  // Filter grades by level
  const filteredGrades = useMemo(() => {
    if (levelFilter === "all") return grades
    return grades.filter(g => g.level === levelFilter)
  }, [grades, levelFilter])

  // Summary stats
  const stats = useMemo(() => {
    const totalStudents = grades.reduce((sum, g) => sum + g.stats.studentCount, 0)
    const totalSubjects = grades.reduce((sum, g) => sum + g.stats.subjectCount, 0)
    const gradesWithAttendance = grades.filter(g => g.stats.attendanceRate !== null)
    const avgAttendance = gradesWithAttendance.length > 0
      ? Math.round(gradesWithAttendance.reduce((sum, g) => sum + (g.stats.attendanceRate || 0), 0) / gradesWithAttendance.length)
      : 0
    const gradesWithPayment = grades.filter(g => g.stats.paymentRate !== null)
    const avgPayment = gradesWithPayment.length > 0
      ? Math.round(gradesWithPayment.reduce((sum, g) => sum + (g.stats.paymentRate || 0), 0) / gradesWithPayment.length)
      : 0

    return { totalStudents, totalSubjects, avgAttendance, avgPayment }
  }, [grades])

  const getAttendanceColor = (rate: number | null) => {
    if (rate === null) return "text-muted-foreground"
    if (rate >= 90) return "text-success"
    if (rate >= 70) return "text-warning"
    return "text-destructive"
  }

  const getPaymentColor = (rate: number | null) => {
    if (rate === null) return "text-muted-foreground"
    if (rate >= 80) return "text-success"
    if (rate >= 50) return "text-warning"
    return "text-destructive"
  }

  return (
    <PageContainer maxWidth="full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des classes</h1>
          <p className="text-muted-foreground">Visualiser et gérer les classes de l'année scolaire</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <GraduationCap className="size-4" />
                Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{grades.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="size-4" />
                {t.common.students}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CalendarCheck className="size-4" />
                {t.gradesEnhanced.attendanceRatio}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getAttendanceColor(stats.avgAttendance)}`}>
                {stats.avgAttendance}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="size-4" />
                {t.gradesEnhanced.paymentRatio}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getPaymentColor(stats.avgPayment)}`}>
                {stats.avgPayment}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Niveau:</span>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tous les niveaux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.gradesEnhanced.allLevels}</SelectItem>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Grades Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">{error}</div>
        ) : filteredGrades.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {t.gradesEnhanced.noGradesFound}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGrades.map((grade) => (
              <Link key={grade.id} href={`/grades/${grade.id}`}>
                <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{grade.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{grade.level}</Badge>
                          <span>{grade.stats.studentCount} {t.gradesEnhanced.studentsCount}</span>
                        </CardDescription>
                      </div>
                      <ChevronRight className="size-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Grade Leader */}
                    <div className="flex items-center gap-3">
                      {grade.gradeLeader ? (
                        <>
                          <Avatar className="size-8">
                            <AvatarImage src={grade.gradeLeader.person.photoUrl ?? undefined} />
                            <AvatarFallback>
                              {grade.gradeLeader.person.firstName[0]}{grade.gradeLeader.person.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <p className="font-medium">
                              {grade.gradeLeader.person.firstName} {grade.gradeLeader.person.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">{t.gradesEnhanced.gradeLeader}</p>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <User className="size-4" />
                          <span>{t.gradesEnhanced.noLeaderAssigned}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="space-y-3">
                      {/* Attendance */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <CalendarCheck className="size-3" />
                            {t.gradesEnhanced.attendance}
                          </span>
                          <span className={getAttendanceColor(grade.stats.attendanceRate)}>
                            {grade.stats.attendanceRate !== null ? `${grade.stats.attendanceRate}%` : '-'}
                          </span>
                        </div>
                        <Progress
                          value={grade.stats.attendanceRate ?? 0}
                          className="h-2"
                        />
                      </div>

                      {/* Payment */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Wallet className="size-3" />
                            {t.gradesEnhanced.payment}
                          </span>
                          <span className={getPaymentColor(grade.stats.paymentRate)}>
                            {grade.stats.paymentRate !== null ? `${grade.stats.paymentRate}%` : '-'}
                          </span>
                        </div>
                        <Progress
                          value={grade.stats.paymentRate ?? 0}
                          className="h-2"
                        />
                      </div>

                      {/* Payment breakdown */}
                      <div className="flex gap-3 text-xs pt-1">
                        <span className="text-destructive">{grade.stats.paymentBreakdown.late} {t.students.late}</span>
                        <span className="text-success">{grade.stats.paymentBreakdown.onTime} {t.students.onTime}</span>
                        <span className="text-success">{grade.stats.paymentBreakdown.complete} {t.students.complete}</span>
                      </div>
                    </div>

                    {/* Subjects count */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                      <BookOpen className="size-4" />
                      <span>{grade.stats.subjectCount} {t.gradesEnhanced.subjects.toLowerCase()}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
    </PageContainer>
  )
}
