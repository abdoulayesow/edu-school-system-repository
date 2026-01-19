"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { BookOpen, Users, Plus, Search, Loader2, Sparkles, Calendar, Banknote, ArrowLeft, CheckCircle2, AlertCircle, UserPlus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { PermissionGuard, NoPermission } from "@/components/permission-guard"
import { DataPagination } from "@/components/data-pagination"
import { sizing } from "@/lib/design-tokens"
import { toast } from "sonner"
import {
  useClubs,
  useClubCategories,
  useEligibleStudents,
  useEnrollInClub,
  type ApiClub,
  type ApiEligibleStudent,
  type ClubCategory,
} from "@/lib/hooks/use-api"

const ITEMS_PER_PAGE = 50

type Club = ApiClub
type EligibleStudent = ApiEligibleStudent
type PaymentType = "one_time" | "monthly" | "trimester"

// Check if a student is eligible for a club based on eligibility rules
function checkEligibility(
  student: EligibleStudent,
  club: Club
): { eligible: boolean; reason?: string } {
  if (!club.eligibilityRule) {
    // No eligibility rule means all grades are eligible
    return { eligible: true }
  }

  const rule = club.eligibilityRule
  const studentGradeId = student.grade.id
  const allowedGradeIds = rule.gradeRules.map((gr) => gr.gradeId)

  if (rule.ruleType === "include_only") {
    // Student's grade must be in the list
    if (!allowedGradeIds.includes(studentGradeId)) {
      const allowedGradeNames = rule.gradeRules.map((gr) => gr.grade.name).join(", ")
      return {
        eligible: false,
        reason: `Only for: ${allowedGradeNames}`,
      }
    }
  } else if (rule.ruleType === "exclude_only") {
    // Student's grade must NOT be in the list
    if (allowedGradeIds.includes(studentGradeId)) {
      return {
        eligible: false,
        reason: `Not available for ${student.grade.name}`,
      }
    }
  }

  return { eligible: true }
}

// Month names for school year (October to July)
const SCHOOL_MONTHS = [
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
]

export default function ClubsPage() {
  const { t, locale } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [openAssignStudent, setOpenAssignStudent] = useState(false)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [studentSearch, setStudentSearch] = useState("")

  // Enhanced enrollment flow state
  const [enrollmentStep, setEnrollmentStep] = useState<"select_student" | "payment_options">("select_student")
  const [selectedStudent, setSelectedStudent] = useState<EligibleStudent | null>(null)
  const [paymentType, setPaymentType] = useState<PaymentType>("one_time")
  const [startMonth, setStartMonth] = useState<number>(10) // October by default
  const [totalMonths, setTotalMonths] = useState<number>(3) // Trimester by default

  // Pagination state
  const [offset, setOffset] = useState(0)

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0)
  }, [searchQuery, categoryFilter])

  // React Query hooks - fetch data with automatic caching
  const { data: clubsData, isLoading: clubsLoading } = useClubs({
    categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
    limit: ITEMS_PER_PAGE,
    offset,
  })
  const { data: categoriesData, isLoading: categoriesLoading } = useClubCategories("active")
  const { data: studentsData, isLoading: studentsLoading } = useEligibleStudents()
  const enrollMutation = useEnrollInClub()

  // Extract data with defaults
  const clubs = clubsData?.clubs ?? []
  const pagination = clubsData?.pagination ?? null
  const categories = categoriesData ?? []
  const students = studentsData?.students ?? []
  const loading = clubsLoading || studentsLoading || categoriesLoading

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
    const total = clubs.length
    const enrolledStudents = clubs.reduce((sum, c) => sum + c._count.enrollments, 0)
    const byCategory: Record<string, number> = {}
    categories.forEach((cat) => {
      byCategory[cat.id] = clubs.filter((c) => c.categoryId === cat.id).length
    })
    const uncategorized = clubs.filter((c) => !c.categoryId).length
    return { total, enrolledStudents, byCategory, uncategorized }
  }, [clubs, categories])

  // Get category name
  const getCategoryName = (club: Club) => {
    if (!club.category) return t.clubs?.uncategorized || "Uncategorized"
    return locale === "fr" ? club.category.nameFr : club.category.name
  }

  // Filter clubs
  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      const matchesSearch =
        searchQuery === "" ||
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.nameFr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (club.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

      const matchesCategory = categoryFilter === "all" || club.categoryId === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [clubs, searchQuery, categoryFilter])

  // Filter students for dialog
  const filteredStudents = useMemo(() => {
    if (!selectedClub) return []

    return students.filter((student) => {
      // Check if already enrolled in this club
      const alreadyEnrolled = student.clubEnrollments.some(
        (ce) => ce.club.id === selectedClub.id
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
  }, [students, selectedClub, studentSearch])

  // Reset enrollment flow
  const resetEnrollmentFlow = () => {
    setEnrollmentStep("select_student")
    setSelectedStudent(null)
    setPaymentType("one_time")
    setStartMonth(10)
    setTotalMonths(3)
  }

  // Handle student selection - move to payment options if club has monthly fee
  function handleSelectStudent(student: EligibleStudent) {
    if (!selectedClub) return

    // If club has monthly fee, show payment options
    if (selectedClub.monthlyFee && selectedClub.monthlyFee > 0) {
      setSelectedStudent(student)
      setEnrollmentStep("payment_options")
    } else {
      // No monthly fee - enroll directly with one-time fee
      handleEnrollWithOptions(student, "one_time")
    }
  }

  // Enroll student with selected payment options
  function handleEnrollWithOptions(student: EligibleStudent, type: PaymentType) {
    if (!selectedClub) return

    const currentYear = new Date().getFullYear()
    const enrollmentData: {
      clubId: string
      studentProfileId: string
      startMonth?: number
      startYear?: number
      totalMonths?: number
    } = {
      clubId: selectedClub.id,
      studentProfileId: student.studentProfileId,
    }

    // Add monthly enrollment data based on payment type
    if (type !== "one_time" && selectedClub.monthlyFee && selectedClub.monthlyFee > 0) {
      enrollmentData.startMonth = startMonth
      enrollmentData.startYear = startMonth >= 9 ? currentYear : currentYear + 1 // School year logic
      enrollmentData.totalMonths = type === "trimester" ? 3 : totalMonths
    }

    enrollMutation.mutate(enrollmentData, {
      onSuccess: () => {
        toast.success(`${student.firstName} ${student.lastName} enrolled successfully`)
        resetEnrollmentFlow()
        setOpenAssignStudent(false)
      },
      onError: (error) => {
        toast.error(error.message || "Failed to enroll student")
      },
    })
  }

  // Handle final enrollment confirmation
  function handleConfirmEnrollment() {
    if (!selectedStudent) return
    handleEnrollWithOptions(selectedStudent, paymentType)
  }

  // Calculate total fee for display
  const calculateTotalFee = () => {
    if (!selectedClub) return 0
    if (paymentType === "one_time") return selectedClub.fee
    if (!selectedClub.monthlyFee) return selectedClub.fee

    const months = paymentType === "trimester" ? 3 : totalMonths
    return selectedClub.monthlyFee * months
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
            description={t.clubs?.noPermission || "You don't have permission to view clubs."}
          />
        </PageContainer>
      }
    >
    <PageContainer maxWidth="full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t.clubs?.title || "Clubs"}</h1>
        <p className="text-muted-foreground">{t.clubs?.subtitle || "Manage and enroll students in clubs"}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.clubs?.totalClubs || "Total Clubs"}</CardTitle>
            <BookOpen className={sizing.icon.lg} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{t.clubs?.allClubs || "All clubs"}</p>
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.clubs?.categories || "Categories"}</CardTitle>
            <Sparkles className={sizing.icon.lg} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">{t.clubs?.activeCategories || "Active categories"}</p>
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.clubs?.enrolledStudents || "Enrolled Students"}</CardTitle>
            <Users className={sizing.icon.lg} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrolledStudents}</div>
            <p className="text-xs text-muted-foreground">{t.clubs?.totalEnrollments || "Total enrollments"}</p>
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.clubs?.availableSpots || "Available Spots"}</CardTitle>
            <Plus className={sizing.icon.lg} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clubs.reduce((sum, c) => sum + (c.capacity ? c.capacity - c._count.enrollments : 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">{t.clubs?.acrossAllClubs || "Across all clubs"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 py-2">
        <CardHeader className="pb-1 px-6 pt-3">
          <CardTitle className="text-sm">{t.clubs?.filterClubs || "Filter Clubs"}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-2 px-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={t.clubs?.searchPlaceholder || "Search clubs..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={t.clubs?.allCategories || "All categories"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.clubs?.allCategories || "All categories"}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {locale === "fr" ? cat.nameFr : cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">{t.common?.all || "All"} ({clubs.length})</TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {locale === "fr" ? cat.nameFr : cat.name} ({stats.byCategory[cat.id] || 0})
            </TabsTrigger>
          ))}
          {stats.uncategorized > 0 && (
            <TabsTrigger value="uncategorized">
              {t.clubs?.uncategorized || "Other"} ({stats.uncategorized})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ClubGrid
            clubs={filteredClubs}
            getCategoryName={getCategoryName}
            formatCurrency={formatCurrency}
            locale={locale}
            t={t}
            onAssign={(club) => {
              setSelectedClub(club)
              setStudentSearch("")
              setOpenAssignStudent(true)
            }}
          />
        </TabsContent>

        {categories.map((cat) => (
          <TabsContent key={cat.id} value={cat.id} className="space-y-4">
            <ClubGrid
              clubs={filteredClubs.filter((c) => c.categoryId === cat.id)}
              getCategoryName={getCategoryName}
              formatCurrency={formatCurrency}
              locale={locale}
              t={t}
              onAssign={(club) => {
                setSelectedClub(club)
                setStudentSearch("")
                setOpenAssignStudent(true)
              }}
            />
          </TabsContent>
        ))}

        {stats.uncategorized > 0 && (
          <TabsContent value="uncategorized" className="space-y-4">
            <ClubGrid
              clubs={filteredClubs.filter((c) => !c.categoryId)}
              getCategoryName={getCategoryName}
              formatCurrency={formatCurrency}
              locale={locale}
              t={t}
              onAssign={(club) => {
                setSelectedClub(club)
                setStudentSearch("")
                setOpenAssignStudent(true)
              }}
            />
          </TabsContent>
        )}
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

      {/* Assign Student Dialog - Enhanced with Payment Options */}
      <Dialog
        open={openAssignStudent}
        onOpenChange={(open) => {
          setOpenAssignStudent(open)
          if (!open) resetEnrollmentFlow()
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {enrollmentStep === "payment_options"
                ? (t.clubs?.selectPaymentOption || "Select Payment Option")
                : (t.clubs?.assignStudentTitle || "Assign Student")}
            </DialogTitle>
            <DialogDescription>
              {enrollmentStep === "payment_options" && selectedStudent ? (
                <span className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{selectedStudent.firstName} {selectedStudent.lastName}</span>
                  <span>→</span>
                  <span>{locale === "fr" && selectedClub?.nameFr ? selectedClub.nameFr : selectedClub?.name}</span>
                </span>
              ) : selectedClub ? (
                `${t.clubs?.searchAndAdd || "Search and add student to"} ${locale === "fr" && selectedClub.nameFr ? selectedClub.nameFr : selectedClub.name}`
              ) : (
                t.clubs?.searchAndAdd || "Search and add student"
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Select Student */}
          {enrollmentStep === "select_student" && (
            <div className="space-y-4 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t.clubs?.searchStudentPlaceholder || "Search by name or student number..."}
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {studentSearch ? t.clubs?.noMatchingStudents || "No matching students" : t.clubs?.allEnrolled || "All students are already enrolled"}
                  </div>
                ) : (
                  <TooltipProvider>
                    {filteredStudents.slice(0, 20).map((student) => {
                      const eligibility = selectedClub ? checkEligibility(student, selectedClub) : { eligible: true }
                      const isLoading = enrollMutation.isPending && enrollMutation.variables?.studentProfileId === student.studentProfileId

                      return (
                        <div
                          key={student.studentProfileId}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border transition-colors",
                            eligibility.eligible
                              ? "bg-card hover:bg-muted/50"
                              : "bg-muted/30 opacity-75"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium text-foreground">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {student.studentNumber} - {student.grade.name}
                              </p>
                            </div>
                            {!eligibility.eligible && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="size-4 text-amber-500 flex-shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[200px]">
                                  <p className="text-xs">{eligibility.reason}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          {eligibility.eligible ? (
                            <Button
                              size="sm"
                              onClick={() => handleSelectStudent(student)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                t.common?.add || "Add"
                              )}
                            </Button>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                                  {t.clubs?.notEligible || "Not eligible"}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-[200px]">
                                <p className="text-xs">{eligibility.reason}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      )
                    })}
                  </TooltipProvider>
                )}
                {filteredStudents.length > 20 && (
                  <p className="text-center text-sm text-muted-foreground py-2">
                    {t.clubs?.showingLimited || `Showing 20 of ${filteredStudents.length} students. Use search to filter.`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Payment Options */}
          {enrollmentStep === "payment_options" && selectedClub && (
            <div className="space-y-6 py-4">
              {/* Payment Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">{t.clubs?.paymentType || "Payment Type"}</Label>
                <RadioGroup
                  value={paymentType}
                  onValueChange={(value) => setPaymentType(value as PaymentType)}
                  className="grid gap-3"
                >
                  {/* One-time Payment Option */}
                  <label
                    htmlFor="one_time"
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      paymentType === "one_time"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/30"
                    )}
                  >
                    <RadioGroupItem value="one_time" id="one_time" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Banknote className="size-4 text-emerald-600" />
                        <span className="font-medium">{t.clubs?.oneTimePayment || "One-time Payment"}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t.clubs?.oneTimePaymentDesc || "Pay the full enrollment fee upfront"}
                      </p>
                    </div>
                    <span className="font-semibold text-lg">{formatCurrency(selectedClub.fee)}</span>
                  </label>

                  {/* Trimester Payment Option */}
                  <label
                    htmlFor="trimester"
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      paymentType === "trimester"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/30"
                    )}
                  >
                    <RadioGroupItem value="trimester" id="trimester" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-blue-600" />
                        <span className="font-medium">{t.clubs?.trimesterPayment || "Trimester (3 months)"}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t.clubs?.trimesterPaymentDesc || "Pay for 3 months at a time"}
                      </p>
                    </div>
                    <span className="font-semibold text-lg">
                      {formatCurrency((selectedClub.monthlyFee || 0) * 3)}
                    </span>
                  </label>

                  {/* Monthly Payment Option */}
                  <label
                    htmlFor="monthly"
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      paymentType === "monthly"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/30"
                    )}
                  >
                    <RadioGroupItem value="monthly" id="monthly" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-amber-600" />
                        <span className="font-medium">{t.clubs?.monthlyPayment || "Monthly Payment"}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t.clubs?.monthlyPaymentDesc || "Pay month by month"}
                      </p>
                    </div>
                    <span className="font-semibold text-lg">
                      {formatCurrency(selectedClub.monthlyFee || 0)}/{t.clubs?.month || "mo"}
                    </span>
                  </label>
                </RadioGroup>
              </div>

              {/* Month Selection for monthly/trimester */}
              {paymentType !== "one_time" && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t.clubs?.startMonth || "Start Month"}</Label>
                  <Select value={startMonth.toString()} onValueChange={(v) => setStartMonth(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.clubs?.selectMonth || "Select month"} />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHOOL_MONTHS.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {t.months?.[month.label.toLowerCase() as keyof typeof t.months] || month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Duration Selection for monthly only */}
              {paymentType === "monthly" && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t.clubs?.duration || "Duration (months)"}</Label>
                  <Select value={totalMonths.toString()} onValueChange={(v) => setTotalMonths(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? (t.clubs?.monthSingular || "month") : (t.clubs?.monthsPlural || "months")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Total Summary */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t.clubs?.paymentSummary || "Payment Summary"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t.clubs?.totalAmount || "Total Amount"}</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(calculateTotalFee())}</span>
                </div>
                {paymentType !== "one_time" && (
                  <p className="text-xs text-muted-foreground">
                    {paymentType === "trimester" ? "3" : totalMonths} {t.clubs?.monthsOf || "months of"} {formatCurrency(selectedClub.monthlyFee || 0)}/{t.clubs?.month || "mo"}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Footer with actions for payment options step */}
          {enrollmentStep === "payment_options" && (
            <DialogFooter className="flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  setEnrollmentStep("select_student")
                  setSelectedStudent(null)
                }}
                className="flex-1 sm:flex-none"
              >
                <ArrowLeft className="size-4 mr-2" />
                {t.common?.back || "Back"}
              </Button>
              <Button
                onClick={handleConfirmEnrollment}
                disabled={enrollMutation.isPending}
                className="flex-1 sm:flex-none"
              >
                {enrollMutation.isPending ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4 mr-2" />
                )}
                {t.clubs?.confirmEnrollment || "Confirm Enrollment"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
    </PermissionGuard>
  )
}

// ClubGrid component for rendering club cards
function ClubGrid({
  clubs,
  getCategoryName,
  formatCurrency,
  locale,
  t,
  onAssign,
}: {
  clubs: Club[]
  getCategoryName: (club: Club) => string
  formatCurrency: (amount: number) => string
  locale: string
  t: Record<string, unknown>
  onAssign: (club: Club) => void
}) {
  const clubsT = (t.clubs || {}) as Record<string, string>

  if (clubs.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <BookOpen className="size-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{clubsT.noClubs || "No clubs found"}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {clubs.map((club) => (
        <Card key={club.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <CardTitle className="text-lg">
                {locale === "fr" && club.nameFr ? club.nameFr : club.name}
              </CardTitle>
              <Badge variant="secondary">{getCategoryName(club)}</Badge>
            </div>
            <CardDescription className="space-y-1">
              {club.description && (
                <p className="text-sm line-clamp-2">{club.description}</p>
              )}
              {club.leader && (
                <p className="text-xs text-muted-foreground">
                  {clubsT.leader || "Leader"}: {club.leader.name}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm mt-2">
                <span className="flex items-center gap-1">
                  <Users className="size-3 text-muted-foreground" />
                  {club._count.enrollments}
                  {club.capacity && `/${club.capacity}`}
                </span>
                {club.fee > 0 && (
                  <span className="font-medium text-foreground">
                    {formatCurrency(club.fee)}
                  </span>
                )}
                {club.monthlyFee && club.monthlyFee > 0 && (
                  <span className="text-xs text-muted-foreground">
                    +{formatCurrency(club.monthlyFee)}/{clubsT.month || "mo"}
                  </span>
                )}
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="default"
              className="w-full bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                // Navigate to enrollment wizard with pre-selected club
                window.location.href = `/clubs/enroll?clubId=${club.id}`
              }}
              disabled={club.capacity !== null && club._count.enrollments >= club.capacity}
            >
              <UserPlus className="size-4 mr-2" />
              {club.capacity !== null && club._count.enrollments >= club.capacity
                ? clubsT.full || "Full"
                : clubsT.enrollStudent || "Enroll Student"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
