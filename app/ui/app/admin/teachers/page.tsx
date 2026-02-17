"use client"

import { Suspense, useState, useEffect, useMemo } from "react"
import { useUrlFilters, tabFilter, stringFilter } from "@/hooks/use-url-filters"
import { SearchInput } from "@/components/ui/search-input"
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
import { PermissionGuard } from "@/components/permission-guard"
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
import { componentClasses } from "@/lib/design-tokens"

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

const TABS = ["by-subject", "by-teacher"] as const
type TabValue = (typeof TABS)[number]

function TeachersPageContent() {
  const { t, locale } = useI18n()

  // URL-synced filters
  const { filters, setFilter } = useUrlFilters({
    tab: tabFilter(TABS, "by-subject"),
    q: stringFilter(),
  })
  const activeTab = filters.tab as TabValue
  const searchQuery = filters.q

  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [selectedYearId, setSelectedYearId] = useState<string>("")
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [assignments, setAssignments] = useState<ClassAssignment[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

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

  // Filter teachers by search query
  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teachers

    const query = searchQuery.toLowerCase()
    return teachers.filter((teacher) =>
      teacher.person.firstName.toLowerCase().includes(query) ||
      teacher.person.lastName.toLowerCase().includes(query) ||
      `${teacher.person.firstName} ${teacher.person.lastName}`.toLowerCase().includes(query) ||
      (teacher.specialization && teacher.specialization.toLowerCase().includes(query)) ||
      (teacher.employeeNumber && teacher.employeeNumber.toLowerCase().includes(query))
    )
  }, [teachers, searchQuery])

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
      {/* Header accent bar */}
      <div className="h-1 bg-gspn-maroon-500 -mx-6 mb-6" />

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
        <Card className="border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.teachers}</CardTitle>
            <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
              <Users className="h-4 w-4 text-gspn-maroon-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {teachers.filter((t) => t.workload.assignmentsCount > 0).length} {t.admin.withAssignments}
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.classAssignments}</CardTitle>
            <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
              <BookOpen className="h-4 w-4 text-gspn-maroon-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t.admin.acrossGrades.replace("{count}", String(assignmentsByGrade.length))}
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.unassigned}</CardTitle>
            <div className="p-2.5 bg-gspn-gold-500/10 rounded-xl">
              <AlertCircle className="h-4 w-4 text-gspn-gold-500" />
            </div>
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
      <Tabs value={activeTab} onValueChange={(v) => setFilter("tab", v as TabValue)}>
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
                <Card key={grade.id} className="border shadow-sm overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        {grade.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gspn-gold-50/50 dark:bg-gspn-gold-950/20">
                          <TableHead>{t.admin.subjects}</TableHead>
                          <TableHead className="text-center">{t.admin.coefficient}</TableHead>
                          <TableHead className="text-center">{t.admin.hoursWeek}</TableHead>
                          <TableHead>{t.common.teacher}</TableHead>
                          <TableHead className="text-right">{t.common.actions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjects.map(({ gradeSubject, assignment }) => (
                          <TableRow key={gradeSubject.id} className="hover:bg-muted/50 transition-colors">
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
                                    <PermissionGuard resource="teachers_assignment" action="delete" inline>
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
                                    </PermissionGuard>
                                  ) : (
                                    <PermissionGuard resource="teachers_assignment" action="create" inline>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openAssignDialog(gradeSubject)}
                                      >
                                        <UserPlus className="h-4 w-4 mr-1" />
                                        {t.admin.assignTeacher}
                                      </Button>
                                    </PermissionGuard>
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
          {/* Search Input */}
          <SearchInput
            placeholder={t.admin.searchTeachers}
            value={searchQuery}
            onChange={(v) => setFilter("q", v)}
            wrapperClassName="max-w-md mb-6"
          />

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>{searchQuery ? t.common.noResults : t.admin.noTeachersFound}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTeachers.map((teacher) => (
                <Card key={teacher.id} className="border shadow-sm">
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
                        size="sm"
                        className={`w-full mt-2 ${componentClasses.primaryActionButton}`}
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
              className={componentClasses.primaryActionButton}
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
                      <TableRow className="bg-gspn-gold-50/50 dark:bg-gspn-gold-950/20">
                        <TableHead>{t.admin.grades}</TableHead>
                        <TableHead>{t.admin.subjects}</TableHead>
                        <TableHead className="text-center">{t.admin.coefficientShort}</TableHead>
                        <TableHead className="text-center">{t.admin.hoursWeek}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teacherSchedule.assignmentsByGrade.map(({ grade, subjects }) =>
                        subjects.map((s, idx) => (
                          <TableRow key={`${grade.id}-${s.subject.id}`} className="hover:bg-muted/50 transition-colors">
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

export default function TeachersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gspn-maroon-500"></div></div>}>
      <TeachersPageContent />
    </Suspense>
  )
}
