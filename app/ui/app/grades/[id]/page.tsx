"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  BookOpen,
  CalendarCheck,
  Wallet,
  Loader2,
  ArrowLeft,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout/PageContainer"
import Link from "next/link"

interface Person {
  id?: string
  firstName: string
  lastName: string
  photoUrl?: string | null
  email?: string
}

interface TeacherProfile {
  id: string
  person: Person
}

interface Subject {
  id: string
  code: string
  nameFr: string
  nameEn: string
}

interface GradeSubject {
  id: string
  coefficient: number
  hoursPerWeek: number
  subject: Subject
  classAssignments: Array<{
    id: string
    teacherProfile: TeacherProfile
  }>
}

interface Enrollment {
  id: string
  student: {
    id: string
    firstName: string
    lastName: string
    studentNumber: string
  }
}

interface GradeDetail {
  id: string
  name: string
  code: string
  level: string
  order: number
  gradeLeader: {
    id: string
    person: Person
  } | null
  schoolYear: {
    id: string
    name: string
    isActive: boolean
  }
  subjects: GradeSubject[]
  enrollments: Enrollment[]
  studentCount: number
  attendanceSummary: {
    total: number
    present: number
    absent: number
    late: number
    excused: number
    attendanceRate: number
  }
  paymentSummary: {
    totalTuition: number
    totalPaid: number
    remainingBalance: number
    paymentRate: number
    breakdown: {
      late: number
      onTime: number
      inAdvance: number
      complete: number
    }
  }
}

export default function GradeDetailPage() {
  const { t } = useI18n()
  const params = useParams()
  const gradeId = params.id as string

  const [grade, setGrade] = useState<GradeDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGrade() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/grades/${gradeId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch grade")
        }
        const data = await response.json()
        setGrade(data)
      } catch (err) {
        console.error("Error fetching grade:", err)
        setError("Failed to load grade details")
      } finally {
        setIsLoading(false)
      }
    }

    if (gradeId) {
      fetchGrade()
    }
  }, [gradeId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' GNF'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !grade) {
    return (
      <PageContainer maxWidth="lg">
        <Link href="/grades" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="size-4" />
          Retour aux classes
        </Link>
        <div className="text-center py-12 text-destructive">{error || "Grade not found"}</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="lg">
      {/* Back link */}
      <Link href="/grades" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="size-4" />
        Retour aux classes
      </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{grade.name}</h1>
              <Badge variant="outline">{grade.level}</Badge>
            </div>
            <p className="text-muted-foreground">
              {grade.schoolYear.name} • {grade.studentCount} élèves
            </p>
          </div>

          {/* Grade Leader */}
          <Card className="w-full md:w-auto">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                {grade.gradeLeader ? (
                  <>
                    <Avatar className="size-12">
                      <AvatarImage src={grade.gradeLeader.person.photoUrl ?? undefined} />
                      <AvatarFallback>
                        {grade.gradeLeader.person.firstName[0]}{grade.gradeLeader.person.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {grade.gradeLeader.person.firstName} {grade.gradeLeader.person.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{t.gradesEnhanced.gradeLeader}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                      <User className="size-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Aucun responsable</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                        {t.gradesEnhanced.assignLeader}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="size-4" />
                Élèves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{grade.studentCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="size-4" />
                Matières
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{grade.subjects.length}</div>
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
              <div className="text-2xl font-bold text-success">{grade.attendanceSummary.attendanceRate}%</div>
              <Progress value={grade.attendanceSummary.attendanceRate} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="size-4" />
                Paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{grade.paymentSummary.paymentRate}%</div>
              <Progress value={grade.paymentSummary.paymentRate} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="students">Élèves ({grade.studentCount})</TabsTrigger>
            <TabsTrigger value="subjects">Matières ({grade.subjects.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Attendance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarCheck className="size-5" />
                    Résumé de présence
                  </CardTitle>
                  <CardDescription>
                    {grade.attendanceSummary.total} enregistrements au total
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10">
                      <CheckCircle className="size-5 text-success" />
                      <div>
                        <p className="text-2xl font-bold text-success">{grade.attendanceSummary.present}</p>
                        <p className="text-xs text-muted-foreground">Présents</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10">
                      <XCircle className="size-5 text-destructive" />
                      <div>
                        <p className="text-2xl font-bold text-destructive">{grade.attendanceSummary.absent}</p>
                        <p className="text-xs text-muted-foreground">Absents</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10">
                      <Clock className="size-5 text-warning" />
                      <div>
                        <p className="text-2xl font-bold text-warning">{grade.attendanceSummary.late}</p>
                        <p className="text-xs text-muted-foreground">En retard</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                      <AlertCircle className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{grade.attendanceSummary.excused}</p>
                        <p className="text-xs text-muted-foreground">Excusés</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="size-5" />
                    Résumé des paiements
                  </CardTitle>
                  <CardDescription>
                    {formatCurrency(grade.paymentSummary.totalPaid)} sur {formatCurrency(grade.paymentSummary.totalTuition)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progression globale</span>
                      <span className="font-medium">{grade.paymentSummary.paymentRate}%</span>
                    </div>
                    <Progress value={grade.paymentSummary.paymentRate} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="text-center p-3 rounded-lg bg-destructive/10">
                      <p className="text-xl font-bold text-destructive">{grade.paymentSummary.breakdown.late}</p>
                      <p className="text-xs text-muted-foreground">En retard</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-success/10">
                      <p className="text-xl font-bold text-success">{grade.paymentSummary.breakdown.onTime}</p>
                      <p className="text-xs text-muted-foreground">À jour</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-primary/10">
                      <p className="text-xl font-bold text-primary">{grade.paymentSummary.breakdown.inAdvance}</p>
                      <p className="text-xs text-muted-foreground">En avance</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-success/10">
                      <p className="text-xl font-bold text-success">{grade.paymentSummary.breakdown.complete}</p>
                      <p className="text-xs text-muted-foreground">Complet</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Solde restant</span>
                      <span className="font-medium text-destructive">{formatCurrency(grade.paymentSummary.remainingBalance)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>{t.gradesEnhanced.studentsInGrade}</CardTitle>
                <CardDescription>{grade.studentCount} élèves inscrits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Numéro</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grade.enrollments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                            Aucun élève inscrit
                          </TableCell>
                        </TableRow>
                      ) : (
                        grade.enrollments.map((enrollment) => (
                          <TableRow key={enrollment.id}>
                            <TableCell className="font-medium">
                              {enrollment.student.firstName} {enrollment.student.lastName}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {enrollment.student.studentNumber}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/students/${enrollment.student.id}`}>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects">
            <Card>
              <CardHeader>
                <CardTitle>{t.gradesEnhanced.subjectsList}</CardTitle>
                <CardDescription>{grade.subjects.length} matières enseignées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Matière</TableHead>
                        <TableHead>Enseignant</TableHead>
                        <TableHead className="text-center">{t.gradesEnhanced.coefficient}</TableHead>
                        <TableHead className="text-center">{t.gradesEnhanced.hoursPerWeek}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grade.subjects.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            Aucune matière assignée
                          </TableCell>
                        </TableRow>
                      ) : (
                        grade.subjects.map((gradeSubject) => {
                          const teacher = gradeSubject.classAssignments[0]?.teacherProfile
                          return (
                            <TableRow key={gradeSubject.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{gradeSubject.subject.nameFr}</p>
                                  <p className="text-xs text-muted-foreground">{gradeSubject.subject.code}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {teacher ? (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="size-6">
                                      <AvatarFallback className="text-xs">
                                        {teacher.person.firstName[0]}{teacher.person.lastName[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{teacher.person.firstName} {teacher.person.lastName}</span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">Non assigné</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline">{gradeSubject.coefficient}</Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {gradeSubject.hoursPerWeek}h
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
        </Tabs>
    </PageContainer>
  )
}
