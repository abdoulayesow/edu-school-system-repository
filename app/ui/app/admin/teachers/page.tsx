"use client"

import { useState, useEffect, useMemo } from "react"
import { PageContainer } from "@/components/layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useI18n } from "@/components/i18n-provider"
import {
  Users,
  BookOpen,
  Loader2,
  Calendar,
  Clock,
  UserPlus,
  Trash2,
  GraduationCap,
  AlertCircle,
} from "lucide-react"

interface SchoolYear {
  id: string
  name: string
  status: "new" | "active" | "passed"
}

interface Person {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

interface Teacher {
  id: string
  personId: string
  employeeNumber: string | null
  specialization: string | null
  person: Person
  classAssignments: ClassAssignment[]
  workload: {
    totalHours: number
    assignmentsCount: number
    leadershipCount: number
  }
}

interface Subject {
  id: string
  code: string
  nameFr: string
  nameEn: string
}

interface Grade {
  id: string
  name: string
  order: number
  level: string
}

interface GradeSubject {
  id: string
  coefficient: number
  hoursPerWeek: number | null
  grade: Grade
  subject: Subject
}

interface ClassAssignment {
  id: string
  gradeSubjectId: string
  teacherProfileId: string
  schoolYearId: string
  gradeSubject: GradeSubject
  teacherProfile?: {
    id: string
    person: Person
  }
}

export default function TeachersPage() {
  const { t, locale } = useI18n()
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [selectedYearId, setSelectedYearId] = useState<string>("")
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [assignments, setAssignments] = useState<ClassAssignment[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("by-subject")

  // Dialog states
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)

  // Form states
  const [selectedGradeSubject, setSelectedGradeSubject] = useState<GradeSubject | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<ClassAssignment | null>(null)
  const [teacherSchedule, setTeacherSchedule] = useState<{
    teacher: Teacher | null
    assignmentsByGrade: Array<{
      grade: { id: string; name: string; order: number }
      subjects: Array<{
        subject: Subject
        coefficient: number
        hoursPerWeek: number | null
      }>
    }>
    workload: { totalHours: number; assignmentsCount: number }
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assignForm, setAssignForm] = useState({
    teacherProfileId: "",
  })

  useEffect(() => {
    setIsMounted(true)
    fetchSchoolYears()
  }, [])

  useEffect(() => {
    if (selectedYearId) {
      fetchTeachers()
      fetchAssignments()
      fetchGrades()
    }
  }, [selectedYearId])

  async function fetchSchoolYears() {
    try {
      const res = await fetch("/api/admin/school-years")
      if (res.ok) {
        const data = await res.json()
        setSchoolYears(data)
        const activeYear = data.find((sy: SchoolYear) => sy.status === "active")
        if (activeYear) {
          setSelectedYearId(activeYear.id)
        } else if (data.length > 0) {
          setSelectedYearId(data[0].id)
        }
      }
    } catch (err) {
      console.error("Error fetching school years:", err)
    }
  }

  async function fetchTeachers() {
    try {
      const res = await fetch(`/api/admin/teachers?schoolYearId=${selectedYearId}`)
      if (res.ok) {
        const data = await res.json()
        setTeachers(data)
      }
    } catch (err) {
      console.error("Error fetching teachers:", err)
    }
  }

  async function fetchAssignments() {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/class-assignments?schoolYearId=${selectedYearId}`)
      if (res.ok) {
        const data = await res.json()
        setAssignments(data)
      }
    } catch (err) {
      console.error("Error fetching assignments:", err)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchGrades() {
    try {
      const res = await fetch(`/api/admin/grades?schoolYearId=${selectedYearId}`)
      if (res.ok) {
        const data = await res.json()
        setGrades(data)
      }
    } catch (err) {
      console.error("Error fetching grades:", err)
    }
  }

  async function fetchTeacherSchedule(teacherId: string) {
    try {
      const res = await fetch(`/api/admin/teachers/${teacherId}/schedule?schoolYearId=${selectedYearId}`)
      if (res.ok) {
        const data = await res.json()
        setTeacherSchedule(data)
      }
    } catch (err) {
      console.error("Error fetching schedule:", err)
    }
  }

  const selectedSchoolYear = useMemo(
    () => schoolYears.find((sy) => sy.id === selectedYearId),
    [schoolYears, selectedYearId]
  )

  const canEdit = selectedSchoolYear?.status !== "passed"

  // Group assignments by grade for "By Subject" view
  const assignmentsByGrade = useMemo(() => {
    const grouped: Record<string, {
      grade: Grade
      subjects: Array<{
        gradeSubject: GradeSubject
        assignment?: ClassAssignment
      }>
    }> = {}

    // Get all grade subjects
    for (const grade of grades) {
      if (!grouped[grade.id]) {
        grouped[grade.id] = {
          grade,
          subjects: [],
        }
      }
      // Get subjects from the grade data (need to fetch from grades endpoint)
    }

    // Add assignments
    for (const assignment of assignments) {
      const gradeId = assignment.gradeSubject.grade.id
      if (!grouped[gradeId]) {
        grouped[gradeId] = {
          grade: assignment.gradeSubject.grade,
          subjects: [],
        }
      }
      grouped[gradeId].subjects.push({
        gradeSubject: assignment.gradeSubject,
        assignment,
      })
    }

    return Object.values(grouped).sort((a, b) => a.grade.order - b.grade.order)
  }, [assignments, grades])

  async function handleAssignTeacher() {
    if (!selectedGradeSubject) return
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/class-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeSubjectId: selectedGradeSubject.id,
          teacherProfileId: assignForm.teacherProfileId,
          schoolYearId: selectedYearId,
        }),
      })
      if (res.ok) {
        setIsAssignDialogOpen(false)
        setSelectedGradeSubject(null)
        setAssignForm({ teacherProfileId: "" })
        fetchAssignments()
        fetchTeachers()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to assign teacher")
      }
    } catch (err) {
      console.error("Error assigning teacher:", err)
      alert("Failed to assign teacher")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRemoveAssignment() {
    if (!selectedAssignment) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/class-assignments/${selectedAssignment.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setIsRemoveDialogOpen(false)
        setSelectedAssignment(null)
        fetchAssignments()
        fetchTeachers()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to remove assignment")
      }
    } catch (err) {
      console.error("Error removing assignment:", err)
      alert("Failed to remove assignment")
    } finally {
      setIsSubmitting(false)
    }
  }

  function openAssignDialog(gradeSubject: GradeSubject) {
    setSelectedGradeSubject(gradeSubject)
    setAssignForm({ teacherProfileId: "" })
    setIsAssignDialogOpen(true)
  }

  function openScheduleDialog(teacher: Teacher) {
    setSelectedTeacher(teacher)
    fetchTeacherSchedule(teacher.id)
    setIsScheduleDialogOpen(true)
  }

  if (!isMounted) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t.admin.teachersClassesTitle}</h1>
          <p className="text-muted-foreground">{t.admin.teachersClassesSubtitle}</p>
        </div>
        <Select value={selectedYearId} onValueChange={setSelectedYearId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t.admin.selectSchoolYear} />
          </SelectTrigger>
          <SelectContent>
            {schoolYears.map((sy) => (
              <SelectItem key={sy.id} value={sy.id}>
                {sy.name}
                {sy.status === "active" && " (Active)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.teachers}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {teachers.filter((t) => t.workload.assignmentsCount > 0).length} {t.admin.withAssignments}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.classAssignments}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t.admin.acrossGrades.replace("{count}", String(assignmentsByGrade.length))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.unassigned}</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grades.reduce((acc, g: any) => acc + (g.subjects?.length || 0), 0) - assignments.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t.admin.subjectsNeedTeachers}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="by-subject">
            <BookOpen className="h-4 w-4 mr-2" />
            {t.admin.bySubject}
          </TabsTrigger>
          <TabsTrigger value="by-teacher">
            <Users className="h-4 w-4 mr-2" />
            {t.admin.byTeacher}
          </TabsTrigger>
        </TabsList>

        {/* By Subject Tab */}
        <TabsContent value="by-subject">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : assignmentsByGrade.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>{t.admin.noSubjectsFound}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {assignmentsByGrade.map(({ grade, subjects }) => (
                <Card key={grade.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      {grade.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.admin.subjects}</TableHead>
                          <TableHead className="text-center">{t.admin.coefficient}</TableHead>
                          <TableHead className="text-center">{t.admin.hoursWeek}</TableHead>
                          <TableHead>{t.common.teacher}</TableHead>
                          <TableHead className="text-right">{t.common.actions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjects.map(({ gradeSubject, assignment }) => (
                          <TableRow key={gradeSubject.id}>
                            <TableCell>
                              <span className="font-medium">
                                {locale === "fr" ? gradeSubject.subject.nameFr : gradeSubject.subject.nameEn}
                              </span>
                              <span className="text-muted-foreground ml-2 text-sm">
                                ({gradeSubject.subject.code})
                              </span>
                            </TableCell>
                            <TableCell className="text-center">{gradeSubject.coefficient}</TableCell>
                            <TableCell className="text-center">
                              {gradeSubject.hoursPerWeek || "-"}
                            </TableCell>
                            <TableCell>
                              {assignment?.teacherProfile ? (
                                <span>
                                  {assignment.teacherProfile.person.firstName}{" "}
                                  {assignment.teacherProfile.person.lastName}
                                </span>
                              ) : (
                                <Badge variant="outline" className="text-orange-500 border-orange-500">
                                  {t.admin.unassigned}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {canEdit && (
                                <>
                                  {assignment ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedAssignment(assignment)
                                        setIsRemoveDialogOpen(true)
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openAssignDialog(gradeSubject)}
                                    >
                                      <UserPlus className="h-4 w-4 mr-1" />
                                      {t.admin.assignTeacher}
                                    </Button>
                                  )}
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* By Teacher Tab */}
        <TabsContent value="by-teacher">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>{t.admin.noTeachersFound}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teachers.map((teacher) => (
                <Card key={teacher.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>
                        {teacher.person.firstName} {teacher.person.lastName}
                      </span>
                      {teacher.workload.assignmentsCount === 0 && (
                        <Badge variant="outline" className="text-muted-foreground">
                          {t.admin.noClasses}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {teacher.specialization && (
                        <span className="block">{teacher.specialization}</span>
                      )}
                      {teacher.employeeNumber && (
                        <span className="text-xs">#{teacher.employeeNumber}</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {t.admin.teacherWorkload}
                        </span>
                        <span className="font-medium">
                          {teacher.workload.totalHours} {t.admin.hoursPerWeek}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          {t.admin.classes}
                        </span>
                        <span className="font-medium">
                          {teacher.workload.assignmentsCount}
                        </span>
                      </div>

                      {teacher.classAssignments.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-2">{t.admin.assignedSubjects}:</p>
                          <div className="flex flex-wrap gap-1">
                            {teacher.classAssignments.slice(0, 5).map((ca) => (
                              <Badge key={ca.id} variant="secondary" className="text-xs">
                                {ca.gradeSubject.subject.code}
                              </Badge>
                            ))}
                            {teacher.classAssignments.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{teacher.classAssignments.length - 5}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => openScheduleDialog(teacher)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        {t.admin.viewSchedule}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Assign Teacher Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.assignTeacher}</DialogTitle>
            <DialogDescription>
              {selectedGradeSubject && (
                <>
                  {selectedGradeSubject.grade.name} -{" "}
                  {locale === "fr" ? selectedGradeSubject.subject.nameFr : selectedGradeSubject.subject.nameEn}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={assignForm.teacherProfileId}
              onValueChange={(v) => setAssignForm({ teacherProfileId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.admin.selectTeacher} />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.person.firstName} {teacher.person.lastName}
                    {teacher.specialization && ` (${teacher.specialization})`}
                    {" - "}
                    {teacher.workload.totalHours}h/week
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button
              onClick={handleAssignTeacher}
              disabled={isSubmitting || !assignForm.teacherProfileId}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.admin.assignTeacher}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Teacher Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.admin.teacherSchedule}</DialogTitle>
            <DialogDescription>
              {selectedTeacher && (
                <>
                  {selectedTeacher.person.firstName} {selectedTeacher.person.lastName}
                  {selectedTeacher.specialization && ` - ${selectedTeacher.specialization}`}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {teacherSchedule ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{teacherSchedule.workload.totalHours}</div>
                    <div className="text-xs text-muted-foreground">{t.admin.hoursPerWeek}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{teacherSchedule.workload.assignmentsCount}</div>
                    <div className="text-xs text-muted-foreground">{t.admin.classes}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{teacherSchedule.assignmentsByGrade.length}</div>
                    <div className="text-xs text-muted-foreground">{t.admin.grades}</div>
                  </div>
                </div>

                {teacherSchedule.assignmentsByGrade.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t.admin.noAssignmentsForYear}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.admin.grades}</TableHead>
                        <TableHead>{t.admin.subjects}</TableHead>
                        <TableHead className="text-center">{t.admin.coefficientShort}</TableHead>
                        <TableHead className="text-center">{t.admin.hoursWeek}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teacherSchedule.assignmentsByGrade.map(({ grade, subjects }) =>
                        subjects.map((s, idx) => (
                          <TableRow key={`${grade.id}-${s.subject.id}`}>
                            {idx === 0 && (
                              <TableCell rowSpan={subjects.length} className="font-medium">
                                {grade.name}
                              </TableCell>
                            )}
                            <TableCell>
                              {locale === "fr" ? s.subject.nameFr : s.subject.nameEn}
                              <span className="text-muted-foreground ml-1">({s.subject.code})</span>
                            </TableCell>
                            <TableCell className="text-center">{s.coefficient}</TableCell>
                            <TableCell className="text-center">{s.hoursPerWeek || "-"}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              {t.common.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Assignment Confirmation */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.removeAssignment}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.removeAssignmentConfirm}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAssignment}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.admin.removeAssignment}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
