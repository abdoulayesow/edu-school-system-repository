"use client"

import { Suspense, useState, useEffect, useMemo } from "react"
import { PageContainer } from "@/components/layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
import { useToast } from "@/components/ui/use-toast"
import { formatDateLong, cn } from "@/lib/utils"
import {
  CalendarDays,
  CalendarRange,
  School,
  Users,
  BookOpen,
  ChevronRight,
  Loader2,
  Calculator,
  Play,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { componentClasses, typography, interactive } from "@/lib/design-tokens"

// ============================================================================
// Types
// ============================================================================

interface SchoolYear {
  id: string
  name: string
  status: "new" | "active" | "passed"
  isActive: boolean
  gradesCount: number
  enrollmentsCount: number
}

interface Trimester {
  id: string
  name: string
  nameFr: string
  nameEn: string
  number: number
  startDate: string
  endDate: string
  isActive: boolean
  evaluationsCount: number
  schoolYearId: string
}

interface Grade {
  id: string
  name: string
  code: string | null
  isEnabled: boolean
  rooms: { id: string; name: string }[]
  subjects: { id: string }[]
  _count: { enrollments: number }
}

interface Teacher {
  id: string
  name: string
  email: string
  workload: {
    totalHours: number
    assignmentsCount: number
  }
}

interface Subject {
  id: string
  code: string
  nameFr: string
  nameEn: string
}

interface AcademicStats {
  schoolYear: SchoolYear | null
  trimester: Trimester | null
  trimesters: Trimester[]
  grades: Grade[]
  teachers: Teacher[]
  subjects: Subject[]
  unassignedSubjectsCount: number
  teachersWithoutAssignments: number
}

// ============================================================================
// Helpers
// ============================================================================

function getLocalizedTrimesterName(trimester: Trimester | null, locale: string): string {
  if (!trimester) return "—"
  return locale === "fr" ? trimester.nameFr : trimester.nameEn
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function HubSkeleton() {
  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Cards grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

// ============================================================================
// Status Card Component
// ============================================================================

interface StatusCardProps {
  title: string
  icon: React.ElementType
  href: string
  stat: string | number
  statLabel: string
  description?: string
  badge?: { label: string; variant: "success" | "warning" | "default" | "secondary" }
  warning?: string
  delay?: number
}

function StatusCard({
  title,
  icon: Icon,
  href,
  stat,
  statLabel,
  description,
  badge,
  warning,
  delay = 0,
}: StatusCardProps) {
  const { t } = useI18n()

  const getBadgeClasses = (variant: "success" | "warning" | "default" | "secondary") => {
    switch (variant) {
      case "success":
        return "bg-success text-success-foreground"
      case "warning":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      case "secondary":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-nav-highlight text-black dark:bg-gspn-gold-500 dark:text-gspn-gold-950"
    }
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border shadow-sm group",
        interactive.cardEnhanced,
        "animate-in fade-in slide-in-from-bottom-4 duration-500",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Maroon accent bar */}
      <div className="h-1 bg-gspn-maroon-500" />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
          </div>
          {badge && (
            <Badge className={getBadgeClasses(badge.variant)}>
              {badge.label}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main stat */}
        <div className="space-y-1">
          <div className={cn(typography.stat.md, "text-foreground")}>
            {stat}
          </div>
          <p className="text-sm text-muted-foreground">{statLabel}</p>
        </div>

        {/* Description or warning */}
        {warning ? (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-sm">{warning}</p>
          </div>
        ) : description ? (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        ) : null}

        {/* Action button */}
        <Button
          asChild
          variant="outline"
          className="w-full group-hover:bg-gspn-gold-50 group-hover:border-gspn-gold-200 dark:group-hover:bg-gspn-gold-950/20 dark:group-hover:border-gspn-gold-800 transition-colors"
        >
          <Link href={href} className="flex items-center justify-center gap-2">
            <Icon className="h-4 w-4" />
            <span>{t.common.manage}</span>
            <ChevronRight className="h-4 w-4 ml-auto opacity-50 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Main Page Content
// ============================================================================

function AcademicHubContent() {
  const { t, locale } = useI18n()
  const { toast } = useToast()

  // Data states
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<AcademicStats>({
    schoolYear: null,
    trimester: null,
    trimesters: [],
    grades: [],
    teachers: [],
    subjects: [],
    unassignedSubjectsCount: 0,
    teachersWithoutAssignments: 0,
  })

  // Action states
  const [isCalculating, setIsCalculating] = useState(false)
  const [isActivatingTrimester, setIsActivatingTrimester] = useState(false)
  const [showActivateDialog, setShowActivateDialog] = useState(false)
  const [showRecalculateDialog, setShowRecalculateDialog] = useState(false)

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData()
  }, [])

  async function fetchAllData() {
    setIsLoading(true)
    try {
      // Fetch all data in parallel
      const [schoolYearsRes, trimestersRes, gradesRes, teachersRes, subjectsRes] = await Promise.all([
        fetch("/api/admin/school-years"),
        fetch("/api/admin/trimesters"),
        fetch("/api/admin/grades"),
        fetch("/api/admin/teachers"),
        fetch("/api/admin/subjects"),
      ])

      const [schoolYears, allTrimesters, grades, teachers, subjects] = await Promise.all([
        schoolYearsRes.ok ? schoolYearsRes.json() : [],
        trimestersRes.ok ? trimestersRes.json() : [],
        gradesRes.ok ? gradesRes.json() : [],
        teachersRes.ok ? teachersRes.json() : [],
        subjectsRes.ok ? subjectsRes.json() : [],
      ])

      // Find active school year
      const activeSchoolYear = schoolYears.find((sy: SchoolYear) => sy.isActive || sy.status === "active") || null

      // Filter trimesters to active school year and find active one
      const yearTrimesters = activeSchoolYear
        ? allTrimesters.filter((tr: Trimester) => tr.schoolYearId === activeSchoolYear.id)
        : []
      const activeTrimester = yearTrimesters.find((tr: Trimester) => tr.isActive) || null

      // Calculate warnings
      const enabledGrades = grades.filter((g: Grade) => g.isEnabled)
      let unassignedCount = 0
      enabledGrades.forEach((grade: Grade) => {
        const assignedSubjectIds = new Set(grade.subjects?.map((s: { id: string }) => s.id) || [])
        subjects.forEach((subject: Subject) => {
          if (!assignedSubjectIds.has(subject.id)) {
            unassignedCount++
          }
        })
      })

      const teachersWithoutAssignments = teachers.filter(
        (teacher: Teacher) => teacher.workload?.assignmentsCount === 0
      ).length

      setStats({
        schoolYear: activeSchoolYear,
        trimester: activeTrimester,
        trimesters: yearTrimesters,
        grades: enabledGrades,
        teachers,
        subjects,
        unassignedSubjectsCount: unassignedCount,
        teachersWithoutAssignments,
      })
    } catch (error) {
      console.error("Error fetching academic data:", error)
      toast({
        title: t.common.error,
        description: t.common.errorFetchingData,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get next trimester to activate
  const nextTrimester = useMemo(() => {
    if (!stats.trimester || stats.trimesters.length === 0) return null
    const currentIndex = stats.trimesters.findIndex(tr => tr.id === stats.trimester?.id)
    if (currentIndex === -1 || currentIndex >= stats.trimesters.length - 1) return null
    return stats.trimesters[currentIndex + 1]
  }, [stats.trimester, stats.trimesters])

  // Handle trimester activation
  async function handleActivateTrimester() {
    if (!nextTrimester) return

    setIsActivatingTrimester(true)
    try {
      const res = await fetch(`/api/admin/trimesters/${nextTrimester.id}/activate`, {
        method: "POST",
      })

      if (res.ok) {
        toast({
          title: t.common.success,
          description: `${getLocalizedTrimesterName(nextTrimester, locale)} ${t.admin.trimesterActivated}`,
        })
        fetchAllData()
      } else {
        const data = await res.json()
        toast({
          title: t.common.error,
          description: data.message || t.common.errorOccurred,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error activating trimester:", error)
      toast({
        title: t.common.error,
        description: t.common.errorOccurred,
        variant: "destructive",
      })
    } finally {
      setIsActivatingTrimester(false)
      setShowActivateDialog(false)
    }
  }

  // Handle grade recalculation
  async function handleRecalculateGrades() {
    if (!stats.trimester) return

    setIsCalculating(true)
    try {
      const res = await fetch("/api/evaluations/calculate-averages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trimesterId: stats.trimester.id,
          scope: "all"
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast({
          title: t.common.success,
          description: data.message || t.admin.academicHub.calculationsComplete,
        })
      } else {
        const data = await res.json()
        toast({
          title: t.common.error,
          description: data.message || t.common.errorOccurred,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error recalculating grades:", error)
      toast({
        title: t.common.error,
        description: t.common.errorOccurred,
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
      setShowRecalculateDialog(false)
    }
  }

  // Format date helper
  function formatDate(dateStr: string) {
    return formatDateLong(dateStr, locale)
  }

  // Calculate room count
  const totalRooms = useMemo(() => {
    return stats.grades.reduce((sum, grade) => sum + (grade.rooms?.length || 0), 0)
  }, [stats.grades])

  // Calculate total assignments
  const totalAssignments = useMemo(() => {
    return stats.teachers.reduce((sum, teacher) => sum + (teacher.workload?.assignmentsCount || 0), 0)
  }, [stats.teachers])

  // Check if all configuration is complete (no warnings)
  const isConfigurationComplete = useMemo(() => {
    return stats.unassignedSubjectsCount === 0 && stats.teachersWithoutAssignments === 0
  }, [stats.unassignedSubjectsCount, stats.teachersWithoutAssignments])

  if (isLoading) {
    return <HubSkeleton />
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
              <Sparkles className="h-6 w-6 text-gspn-maroon-500" />
            </div>
            <div>
              <h1 className={typography.heading.page}>
                {t.admin.academicHub.title}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t.admin.academicHub.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* School Year Card */}
          <StatusCard
            title={t.admin.schoolYears}
            icon={CalendarDays}
            href="/admin/school-years"
            stat={stats.schoolYear?.name || "—"}
            statLabel={t.admin.activeYear}
            badge={stats.schoolYear ? {
              label: stats.schoolYear.status === "active" ? t.admin.statusActive : t.admin.statusNew,
              variant: stats.schoolYear.status === "active" ? "success" : "default"
            } : undefined}
            delay={0}
          />

          {/* Trimesters Card */}
          <StatusCard
            title={t.admin.trimesters}
            icon={CalendarRange}
            href="/admin/trimesters"
            stat={getLocalizedTrimesterName(stats.trimester, locale)}
            statLabel={t.admin.academicHub.activeTrimester}
            description={stats.trimester
              ? `${formatDate(stats.trimester.startDate)} - ${formatDate(stats.trimester.endDate)}`
              : undefined
            }
            badge={stats.trimester ? {
              label: t.admin.statusActive,
              variant: "success"
            } : undefined}
            delay={75}
          />

          {/* Grades Card */}
          <StatusCard
            title={t.admin.gradesAndRooms}
            icon={School}
            href="/admin/grades"
            stat={stats.grades.length}
            statLabel={`${t.admin.academicHub.gradesLabel} • ${totalRooms} ${t.admin.academicHub.roomsLabel}`}
            delay={150}
          />

          {/* Teachers Card */}
          <StatusCard
            title={t.admin.teachersAndClasses}
            icon={Users}
            href="/admin/teachers"
            stat={stats.teachers.length}
            statLabel={`${t.admin.academicHub.teachersLabel} • ${totalAssignments} ${t.admin.academicHub.assignmentsLabel}`}
            warning={stats.teachersWithoutAssignments > 0
              ? `${stats.teachersWithoutAssignments} ${t.admin.academicHub.teachersWithoutAssignments}`
              : undefined
            }
            delay={225}
          />

          {/* Subjects Card */}
          <StatusCard
            title={t.admin.subjects}
            icon={BookOpen}
            href="/admin/grades"
            stat={stats.subjects.length}
            statLabel={t.admin.academicHub.configuredSubjects}
            warning={stats.unassignedSubjectsCount > 0
              ? `${stats.unassignedSubjectsCount} ${t.admin.academicHub.unassignedToGrades}`
              : undefined
            }
            badge={stats.unassignedSubjectsCount === 0 ? {
              label: t.admin.academicHub.allConfigured,
              variant: "success"
            } : undefined}
            delay={300}
          />
        </div>

        {/* Quick Actions Section */}
        <div className="space-y-4">
          <h2 className={cn(typography.heading.label, "flex items-center gap-2")}>
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            {t.admin.academicHub.quickActions}
          </h2>

          <div className="flex flex-wrap gap-3">
            {/* Activate Next Trimester */}
            {nextTrimester && (
              <Button
                className={componentClasses.primaryActionButton}
                onClick={() => setShowActivateDialog(true)}
                disabled={isActivatingTrimester}
              >
                {isActivatingTrimester ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {t.admin.academicHub.activateNextTrimester}
              </Button>
            )}

            {/* Recalculate Grades */}
            {stats.trimester && (
              <Button
                variant="outline"
                onClick={() => setShowRecalculateDialog(true)}
                disabled={isCalculating}
                className="hover:bg-gspn-gold-50 hover:border-gspn-gold-200 dark:hover:bg-gspn-gold-950/20"
              >
                {isCalculating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Calculator className="h-4 w-4 mr-2" />
                )}
                {t.admin.academicHub.recalculateAllGrades}
              </Button>
            )}
          </div>
        </div>

        {/* Configuration Status Summary */}
        <Card className="border-2 border-dashed border-muted-foreground/20">
          <CardContent className="py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-full",
                  isConfigurationComplete
                    ? "bg-success/10"
                    : "bg-amber-100 dark:bg-amber-900/30"
                )}>
                  {isConfigurationComplete ? (
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {isConfigurationComplete
                      ? t.admin.academicHub.configurationComplete
                      : t.admin.academicHub.configurationIncomplete
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isConfigurationComplete
                      ? t.admin.academicHub.allAcademicEntitiesConfigured
                      : t.admin.academicHub.reviewWarningsAbove
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activate Trimester Dialog */}
      <AlertDialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t.admin.academicHub.activateNextTrimester}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.academicHub.activateTrimesterConfirm}{" "}
              <strong>
                {getLocalizedTrimesterName(nextTrimester, locale)}
              </strong>?{" "}
              {t.admin.academicHub.currentTrimesterDeactivated}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className={componentClasses.primaryActionButton}
              onClick={handleActivateTrimester}
              disabled={isActivatingTrimester}
            >
              {isActivatingTrimester ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {t.common.activate}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Recalculate Dialog */}
      <AlertDialog open={showRecalculateDialog} onOpenChange={setShowRecalculateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t.admin.academicHub.recalculateAllGrades}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.academicHub.recalculateConfirm}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className={componentClasses.primaryActionButton}
              onClick={handleRecalculateGrades}
              disabled={isCalculating}
            >
              {isCalculating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4 mr-2" />
              )}
              {t.common.recalculate}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}

// ============================================================================
// Page Export with Suspense Boundary
// ============================================================================

export default function AcademicHubPage() {
  return (
    <Suspense fallback={<HubSkeleton />}>
      <AcademicHubContent />
    </Suspense>
  )
}
