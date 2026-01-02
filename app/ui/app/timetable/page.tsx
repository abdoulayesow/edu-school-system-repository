"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, User, Clock, GraduationCap, Users, Loader2 } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { sizing } from "@/lib/design-tokens"

interface Grade {
  id: string
  name: string
  level: string
  studentCount: number
  subjectCount: number
}

interface Subject {
  id: string
  subjectId: string
  name: string
  code: string | null
  coefficient: number
  hoursPerWeek: number
  teacher: {
    id: string
    name: string
  } | null
}

interface GradeDetail {
  id: string
  name: string
  level: string
  studentCount: number
  leader: string | null
}

export default function TimetablePage() {
  const { t } = useI18n()
  const [grades, setGrades] = useState<Grade[]>([])
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null)
  const [gradeDetail, setGradeDetail] = useState<GradeDetail | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [totalHours, setTotalHours] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingSubjects, setLoadingSubjects] = useState(false)

  // Fetch grades on mount
  useEffect(() => {
    async function fetchGrades() {
      try {
        const res = await fetch("/api/timetable")
        if (res.ok) {
          const data = await res.json()
          setGrades(data.grades || [])
          // Select first grade by default
          if (data.grades?.length > 0) {
            setSelectedGradeId(data.grades[0].id)
          }
        }
      } catch (err) {
        console.error("Failed to fetch grades:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchGrades()
  }, [])

  // Fetch subjects when grade changes
  useEffect(() => {
    if (!selectedGradeId) return

    async function fetchSubjects() {
      setLoadingSubjects(true)
      try {
        const res = await fetch(`/api/timetable?gradeId=${selectedGradeId}`)
        if (res.ok) {
          const data = await res.json()
          setGradeDetail(data.grade)
          setSubjects(data.subjects || [])
          setTotalHours(data.totalHours || 0)
        }
      } catch (err) {
        console.error("Failed to fetch subjects:", err)
      } finally {
        setLoadingSubjects(false)
      }
    }
    fetchSubjects()
  }, [selectedGradeId])

  // Calculate stats
  const totalStudents = grades.reduce((sum, g) => sum + g.studentCount, 0)
  const totalSubjects = grades.reduce((sum, g) => sum + g.subjectCount, 0)

  if (loading) {
    return (
      <PageContainer maxWidth="full">
        <div className="mb-6">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t.classes.title}</h1>
        <p className="text-muted-foreground">{t.classes.subtitle}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.classes.totalClasses}</CardTitle>
            <GraduationCap className={sizing.icon.lg} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grades.length}</div>
            <p className="text-xs text-muted-foreground">{t.classes.allClasses}</p>
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.classes.totalStudents}</CardTitle>
            <Users className={sizing.icon.lg} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">{t.classes.acrossAllClasses}</p>
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.common.subjects}</CardTitle>
            <BookOpen className={sizing.icon.lg} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubjects}</div>
            <p className="text-xs text-muted-foreground">{t.classes.scheduledToday}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Grade List Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.classes.classes}</CardTitle>
              <CardDescription>{t.grades.selectClass}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {grades.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t.common.noData}
                </p>
              ) : (
                grades.map((grade) => (
                  <button
                    key={grade.id}
                    onClick={() => setSelectedGradeId(grade.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedGradeId === grade.id
                        ? "bg-primary/10 border-primary"
                        : "bg-background hover:bg-muted border-border"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium text-sm">{grade.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {grade.subjectCount} {t.common.subjects.toLowerCase()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {grade.studentCount}
                    </Badge>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.classes.statistics}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t.classes.totalClasses}</span>
                <span className="text-xl font-bold">{grades.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t.classes.totalStudents}</span>
                <span className="text-xl font-bold">{totalStudents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t.common.subjects}</span>
                <span className="text-xl font-bold text-primary">{totalSubjects}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects View */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {gradeDetail?.name || t.grades.selectClass}
              </CardTitle>
              <CardDescription>
                {gradeDetail ? (
                  <>
                    {gradeDetail.studentCount} {t.common.students}
                    {gradeDetail.leader && ` • ${gradeDetail.leader}`}
                    {` • ${totalHours}h/${t.common.week}`}
                  </>
                ) : (
                  t.grades.selectClass
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingSubjects ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
              ) : subjects.length > 0 ? (
                subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[60px] p-2 rounded-lg bg-muted">
                      <Clock className="size-4 text-muted-foreground mb-1" />
                      <span className="text-sm font-medium">{subject.hoursPerWeek}h</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <BookOpen className="size-4 text-primary" />
                            {subject.name}
                          </h3>
                          {subject.teacher ? (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <User className="size-3" />
                              {subject.teacher.name}
                            </p>
                          ) : (
                            <p className="text-sm text-yellow-600 flex items-center gap-1 mt-1">
                              <User className="size-3" />
                              {t.common.notAssigned}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Coef. {subject.coefficient}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : selectedGradeId ? (
                <div className="text-center py-12">
                  <BookOpen className="size-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t.common.noData}</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <GraduationCap className="size-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t.grades.selectClass}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
