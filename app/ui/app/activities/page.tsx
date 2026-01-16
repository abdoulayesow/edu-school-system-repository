"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BookOpen, Users, Plus, Search, Loader2, Trophy, Palette, GraduationCap, Sparkles } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { PermissionGuard, NoPermission } from "@/components/permission-guard"
import { DataPagination } from "@/components/data-pagination"
import { sizing } from "@/lib/design-tokens"
import { toast } from "sonner"
import {
  useActivities,
  useEligibleStudents,
  useEnrollInActivity,
  type ApiActivity,
  type ApiEligibleStudent,
} from "@/lib/hooks/use-api"

const ITEMS_PER_PAGE = 50

type Activity = ApiActivity
type EligibleStudent = ApiEligibleStudent

const typeIcons: Record<string, React.ReactNode> = {
  club: <Users className="size-5" />,
  sport: <Trophy className="size-5" />,
  arts: <Palette className="size-5" />,
  academic: <GraduationCap className="size-5" />,
  other: <Sparkles className="size-5" />,
}

const typeColors: Record<string, string> = {
  club: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  sport: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  arts: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  academic: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
}

export default function ActivitiesPage() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [openAssignStudent, setOpenAssignStudent] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [studentSearch, setStudentSearch] = useState("")

  // Pagination state
  const [offset, setOffset] = useState(0)

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0)
  }, [searchQuery, typeFilter])

  // React Query hooks - fetch data with automatic caching
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities({
    type: typeFilter !== "all" ? typeFilter : undefined,
    limit: ITEMS_PER_PAGE,
    offset,
  })
  const { data: studentsData, isLoading: studentsLoading } = useEligibleStudents()
  const enrollMutation = useEnrollInActivity()

  // Extract data with defaults
  const activities = activitiesData?.activities ?? []
  const pagination = activitiesData?.pagination ?? null
  const students = studentsData?.students ?? []
  const loading = activitiesLoading || studentsLoading

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

  // Calculate summary stats
  const stats = useMemo(() => {
    const total = activities.length
    const clubs = activities.filter((a) => a.type === "club").length
    const sports = activities.filter((a) => a.type === "sport").length
    const arts = activities.filter((a) => a.type === "arts").length
    const academic = activities.filter((a) => a.type === "academic").length
    const enrolledStudents = activities.reduce((sum, a) => sum + a._count.enrollments, 0)
    return { total, clubs, sports, arts, academic, enrolledStudents }
  }, [activities])

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch =
        searchQuery === "" ||
        activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

      const matchesType = typeFilter === "all" || activity.type === typeFilter

      return matchesSearch && matchesType
    })
  }, [activities, searchQuery, typeFilter])

  // Filter students for dialog
  const filteredStudents = useMemo(() => {
    if (!selectedActivity) return []

    return students.filter((student) => {
      // Check if already enrolled in this activity
      const alreadyEnrolled = student.activityEnrollments.some(
        (ae) => ae.activity.id === selectedActivity.id
      )
      if (alreadyEnrolled) return false

      // Search filter
      const matchesSearch =
        studentSearch === "" ||
        student.firstName.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.lastName.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.studentNumber?.toLowerCase().includes(studentSearch.toLowerCase())

      return matchesSearch
    })
  }, [students, selectedActivity, studentSearch])

  // Enroll student in activity
  function handleEnroll(student: EligibleStudent) {
    if (!selectedActivity) return

    enrollMutation.mutate(
      { activityId: selectedActivity.id, studentProfileId: student.studentProfileId },
      {
        onSuccess: () => {
          toast.success(`${student.firstName} ${student.lastName} enrolled successfully`)
        },
        onError: (error) => {
          toast.error(error.message || "Failed to enroll student")
        },
      }
    )
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-GN", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount)

  if (loading) {
    return (
      <PageContainer maxWidth="full">
        <div className="mb-6">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PermissionGuard
      checks={[
        { resource: "students", action: "view" },
        { resource: "classes", action: "view" },
      ]}
      fallback={
        <PageContainer maxWidth="full">
          <NoPermission
            title={t.permissions?.accessDenied || "Access Denied"}
            description={t.permissions?.noActivitiesPermission || "You don't have permission to view activities."}
          />
        </PageContainer>
      }
    >
    <PageContainer maxWidth="full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t.activities.title}</h1>
        <p className="text-muted-foreground">{t.activities.subtitle}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.activities.totalActivities}</CardTitle>
            <BookOpen className={sizing.icon.lg} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{t.activities.allActivities}</p>
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clubs & Sports</CardTitle>
            <Trophy className={sizing.icon.lg} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clubs + stats.sports}</div>
            <p className="text-xs text-muted-foreground">{stats.clubs} clubs, {stats.sports} sports</p>
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arts & Academic</CardTitle>
            <Palette className={sizing.icon.lg} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.arts + stats.academic}</div>
            <p className="text-xs text-muted-foreground">{stats.arts} arts, {stats.academic} academic</p>
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.activities.enrolledStudents}</CardTitle>
            <Users className={sizing.icon.lg} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrolledStudents}</div>
            <p className="text-xs text-muted-foreground">{t.activities.totalEnrollments}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 py-2">
        <CardHeader className="pb-1 px-6 pt-3">
          <CardTitle className="text-sm">{t.activities.filterActivities}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-2 px-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t.activities.allTypes} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.activities.allTypes}</SelectItem>
                <SelectItem value="club">Clubs</SelectItem>
                <SelectItem value="sport">Sports</SelectItem>
                <SelectItem value="arts">Arts</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({activities.length})</TabsTrigger>
          <TabsTrigger value="club">Clubs ({stats.clubs})</TabsTrigger>
          <TabsTrigger value="sport">Sports ({stats.sports})</TabsTrigger>
          <TabsTrigger value="arts">Arts ({stats.arts})</TabsTrigger>
          <TabsTrigger value="academic">Academic ({stats.academic})</TabsTrigger>
        </TabsList>

        {["all", "club", "sport", "arts", "academic"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(tab === "all" ? filteredActivities : filteredActivities.filter((a) => a.type === tab)).length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="size-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t.activities.noActivities}</p>
                </div>
              ) : (
                (tab === "all" ? filteredActivities : filteredActivities.filter((a) => a.type === tab)).map(
                  (activity) => (
                    <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded ${typeColors[activity.type]}`}>
                              {typeIcons[activity.type]}
                            </div>
                            <CardTitle className="text-lg">{activity.name}</CardTitle>
                          </div>
                          <Badge className={typeColors[activity.type]}>
                            {activity.type}
                          </Badge>
                        </div>
                        <CardDescription className="space-y-1">
                          {activity.description && (
                            <p className="text-sm line-clamp-2">{activity.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm mt-2">
                            <span className="flex items-center gap-1">
                              <Users className="size-3 text-muted-foreground" />
                              {activity._count.enrollments}
                              {activity.capacity && `/${activity.capacity}`}
                            </span>
                            {activity.fee > 0 && (
                              <span className="font-medium text-foreground">
                                {formatCurrency(activity.fee)}
                              </span>
                            )}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => {
                            setSelectedActivity(activity)
                            setStudentSearch("")
                            setOpenAssignStudent(true)
                          }}
                          disabled={activity.capacity !== null && activity._count.enrollments >= activity.capacity}
                        >
                          <Plus className="size-4 mr-2" />
                          {activity.capacity !== null && activity._count.enrollments >= activity.capacity
                            ? "Full"
                            : t.activities.assignStudent}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                )
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Pagination */}
      {pagination && (
        <DataPagination
          pagination={pagination}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          className="mt-6"
        />
      )}

      {/* Assign Student Dialog */}
      <Dialog open={openAssignStudent} onOpenChange={setOpenAssignStudent}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.activities.assignStudentTitle}</DialogTitle>
            <DialogDescription>
              {selectedActivity
                ? `${t.activities.searchAndAdd} ${selectedActivity.name}`
                : t.activities.searchAndAdd}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.activities.searchStudentPlaceholder}
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {studentSearch ? "No matching students" : "All students are already enrolled"}
                </div>
              ) : (
                filteredStudents.slice(0, 20).map((student) => (
                  <div
                    key={student.studentProfileId}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {student.studentNumber} - {student.grade.name}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleEnroll(student)}
                      disabled={enrollMutation.isPending && enrollMutation.variables?.studentProfileId === student.studentProfileId}
                    >
                      {enrollMutation.isPending && enrollMutation.variables?.studentProfileId === student.studentProfileId ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        t.common.add
                      )}
                    </Button>
                  </div>
                ))
              )}
              {filteredStudents.length > 20 && (
                <p className="text-center text-sm text-muted-foreground py-2">
                  Showing 20 of {filteredStudents.length} students. Use search to filter.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
    </PermissionGuard>
  )
}
