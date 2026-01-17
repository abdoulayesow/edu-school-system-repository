"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { PermissionGuard } from "@/components/permission-guard"
import { PageContainer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { ClubWizard } from "@/components/clubs/wizard/club-wizard"
import { EnrollStudentDialog } from "@/components/clubs/enroll-student-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataPagination } from "@/components/data-pagination"
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Calendar,
  Banknote,
  User,
  ChevronDown,
  FolderOpen,
  GripVertical,
  CheckCircle2,
  Clock,
  Circle,
  Smartphone,
  Shield,
  Printer,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
type ClubStatus = "draft" | "active" | "closed" | "completed" | "cancelled"
import {
  useAdminClubs,
  useClubCategories,
  useCreateClub,
  useUpdateClub,
  useDeleteClub,
  useCreateClubCategory,
  useUpdateClubCategory,
  useDeleteClubCategory,
  useClubEnrollments,
  useMarkMonthlyPaymentPaid,
  useGrades,
  useUpdateClubEligibilityRule,
  type AdminClub,
  type ClubCategory,
  type ClubEnrollmentWithPayments,
  type ClubMonthlyPayment,
} from "@/lib/hooks/use-api"
import { cn } from "@/lib/utils"
import { componentClasses } from "@/lib/design-tokens"

type Club = AdminClub

interface SchoolYear {
  id: string
  name: string
  status: string
  isActive: boolean
}

interface TeacherOption {
  id: string
  firstName: string
  lastName: string
}

const CLUB_STATUSES: ClubStatus[] = ["draft", "active", "closed", "completed", "cancelled"]

const ITEMS_PER_PAGE = 50

export default function AdminClubsPage() {
  const { t, locale } = useI18n()
  const [mounted, setMounted] = useState(false)
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [teachers, setTeachers] = useState<TeacherOption[]>([])
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<string>("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all")
  const [offset, setOffset] = useState(0)

  // Dialog states for clubs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)

  // Enrollments dialog state
  const [isEnrollmentsDialogOpen, setIsEnrollmentsDialogOpen] = useState(false)
  const [enrollmentsClub, setEnrollmentsClub] = useState<Club | null>(null)
  const [isEnrollStudentDialogOpen, setIsEnrollStudentDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<ClubEnrollmentWithPayments | null>(null)
  const [selectedMonthlyPayment, setSelectedMonthlyPayment] = useState<ClubMonthlyPayment | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "orange_money">("cash")

  // Eligibility rule editor state
  const [isEligibilityDialogOpen, setIsEligibilityDialogOpen] = useState(false)
  const [eligibilityClub, setEligibilityClub] = useState<Club | null>(null)
  const [eligibilityRuleType, setEligibilityRuleType] = useState<"all_grades" | "include_only" | "exclude_only">("all_grades")
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([])

  // Category management state
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false)
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ClubCategory | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    nameFr: "",
    description: "",
    status: "active" as "active" | "inactive",
    order: 0,
  })

  // Form state
  const [form, setForm] = useState({
    name: "",
    nameFr: "",
    description: "",
    categoryId: "",
    leaderId: "",
    startDate: "",
    endDate: "",
    fee: 0,
    monthlyFee: 0,
    capacity: 30,
    status: "draft" as ClubStatus,
  })

  // React Query hooks
  const { data: clubsData, isLoading: loading } = useAdminClubs({
    schoolYearId: selectedSchoolYearId,
    categoryId: selectedCategoryId !== "all" ? selectedCategoryId : undefined,
    limit: ITEMS_PER_PAGE,
    offset,
  })

  const { data: categories } = useClubCategories("active")

  const createMutation = useCreateClub()
  const updateMutation = useUpdateClub()
  const deleteMutation = useDeleteClub()

  // Category mutations
  const createCategoryMutation = useCreateClubCategory()
  const updateCategoryMutation = useUpdateClubCategory()
  const deleteCategoryMutation = useDeleteClubCategory()

  // Enrollments and payment tracking
  const { data: enrollments, isLoading: enrollmentsLoading } = useClubEnrollments(
    isEnrollmentsDialogOpen ? enrollmentsClub?.id ?? null : null
  )
  const markPaymentMutation = useMarkMonthlyPaymentPaid()

  // Grades and eligibility rules
  const { data: gradesData } = useGrades()
  const grades = gradesData?.grades ?? []
  const eligibilityMutation = useUpdateClubEligibilityRule()

  // All categories for management (both active and inactive)
  const { data: allCategories } = useClubCategories()

  const clubs = clubsData?.clubs ?? []
  const pagination = clubsData?.pagination ?? null

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load school years and teachers
  useEffect(() => {
    async function loadData() {
      try {
        const [syRes, teachersRes] = await Promise.all([
          fetch("/api/admin/school-years"),
          fetch("/api/admin/teachers?limit=500"),
        ])
        if (syRes.ok) {
          const data = await syRes.json()
          setSchoolYears(data)
          const active = data.find((sy: SchoolYear) => sy.isActive)
          if (active) {
            setSelectedSchoolYearId(active.id)
          }
        }
        if (teachersRes.ok) {
          const data = await teachersRes.json()
          setTeachers(data.teachers || [])
        }
      } catch (err) {
        console.error("Error loading data:", err)
      }
    }
    loadData()
  }, [])

  // Reset offset when category filter changes
  useEffect(() => {
    setOffset(0)
  }, [selectedCategoryId])

  const resetForm = () => {
    setForm({
      name: "",
      nameFr: "",
      description: "",
      categoryId: "",
      leaderId: "",
      startDate: "",
      endDate: "",
      fee: 0,
      monthlyFee: 0,
      capacity: 30,
      status: "draft",
    })
  }

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        ...form,
        categoryId: form.categoryId || undefined,
        leaderId: form.leaderId || undefined,
        monthlyFee: form.monthlyFee || undefined,
        schoolYearId: selectedSchoolYearId,
      })
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (err) {
      console.error("Error creating club:", err)
    }
  }

  const handleEdit = async () => {
    if (!selectedClub) return
    try {
      await updateMutation.mutateAsync({
        id: selectedClub.id,
        ...form,
        categoryId: form.categoryId || null,
        leaderId: form.leaderId || null,
        monthlyFee: form.monthlyFee || null,
      })
      setIsEditDialogOpen(false)
      setSelectedClub(null)
      resetForm()
    } catch (err) {
      console.error("Error updating club:", err)
    }
  }

  const handleDelete = async () => {
    if (!selectedClub) return
    try {
      await deleteMutation.mutateAsync(selectedClub.id)
      setIsDeleteDialogOpen(false)
      setSelectedClub(null)
    } catch (err) {
      console.error("Error deleting club:", err)
    }
  }

  // Category handlers
  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      nameFr: "",
      description: "",
      status: "active",
      order: (allCategories?.length ?? 0) + 1,
    })
  }

  const handleCreateCategory = async () => {
    try {
      await createCategoryMutation.mutateAsync({
        ...categoryForm,
        description: categoryForm.description || undefined,
      })
      setIsCategoryDialogOpen(false)
      resetCategoryForm()
    } catch (err) {
      console.error("Error creating category:", err)
    }
  }

  const handleEditCategory = async () => {
    if (!selectedCategory) return
    try {
      await updateCategoryMutation.mutateAsync({
        id: selectedCategory.id,
        ...categoryForm,
        description: categoryForm.description || undefined,
      })
      setIsEditCategoryDialogOpen(false)
      setSelectedCategory(null)
      resetCategoryForm()
    } catch (err) {
      console.error("Error updating category:", err)
    }
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return
    try {
      await deleteCategoryMutation.mutateAsync(selectedCategory.id)
      setIsDeleteCategoryDialogOpen(false)
      setSelectedCategory(null)
    } catch (err) {
      console.error("Error deleting category:", err)
    }
  }

  const openEditCategoryDialog = (category: ClubCategory) => {
    setSelectedCategory(category)
    setCategoryForm({
      name: category.name,
      nameFr: category.nameFr,
      description: category.description || "",
      status: category.status,
      order: category.order,
    })
    setIsEditCategoryDialogOpen(true)
  }

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

  const openEditDialog = (club: Club) => {
    setSelectedClub(club)
    setForm({
      name: club.name,
      nameFr: club.nameFr || "",
      description: club.description || "",
      categoryId: club.categoryId || "",
      leaderId: club.leaderId || "",
      startDate: club.startDate.split("T")[0],
      endDate: club.endDate.split("T")[0],
      fee: club.fee,
      monthlyFee: club.monthlyFee || 0,
      capacity: club.capacity,
      status: club.status,
    })
    setIsEditDialogOpen(true)
  }

  const getCategoryLabel = (club: Club) => {
    if (!club.category) return t.clubs?.uncategorized || "Uncategorized"
    return locale === "fr" ? club.category.nameFr : club.category.name
  }

  const getStatusLabel = (status: ClubStatus) => {
    const labels: Record<ClubStatus, string> = {
      draft: t.clubs?.statusDraft || "Draft",
      active: t.clubs?.statusActive || "Active",
      closed: t.clubs?.statusClosed || "Closed",
      completed: t.clubs?.statusCompleted || "Completed",
      cancelled: t.clubs?.statusCancelled || "Cancelled",
    }
    return labels[status]
  }

  const getStatusColor = (status: ClubStatus) => {
    const colors: Record<ClubStatus, string> = {
      draft: "bg-muted text-muted-foreground",
      active: "bg-success/20 text-success dark:bg-success/10",
      closed: "bg-warning/20 text-warning dark:bg-warning/10",
      completed: "bg-nav-highlight/20 text-nav-highlight dark:bg-gspn-gold-900/30 dark:text-gspn-gold-200",
      cancelled: "bg-destructive/20 text-destructive dark:bg-destructive/10",
    }
    return colors[status]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-GN", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Month helpers for payment tracking
  const MONTH_NAMES = locale === "fr"
    ? ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  const getMonthLabel = (month: number) => MONTH_NAMES[month - 1]
  const getMonthAbbrev = (month: number) => MONTH_NAMES[month - 1].substring(0, 3)

  const openEnrollmentsDialog = (club: Club) => {
    setEnrollmentsClub(club)
    setIsEnrollmentsDialogOpen(true)
  }

  const openPaymentDialog = (enrollment: ClubEnrollmentWithPayments, payment: ClubMonthlyPayment) => {
    setSelectedEnrollment(enrollment)
    setSelectedMonthlyPayment(payment)
    setPaymentMethod("cash")
    setIsPaymentDialogOpen(true)
  }

  const printReceipt = (clubId: string, paymentId: string) => {
    const url = `/api/admin/clubs/${clubId}/payments/${paymentId}/receipt-pdf?lang=${locale}`
    window.open(url, "_blank")
  }

  const handleMarkAsPaid = async () => {
    if (!enrollmentsClub || !selectedEnrollment || !selectedMonthlyPayment) return

    try {
      await markPaymentMutation.mutateAsync({
        clubId: enrollmentsClub.id,
        enrollmentId: selectedEnrollment.id,
        paymentId: selectedMonthlyPayment.id,
        method: paymentMethod,
      })
      setIsPaymentDialogOpen(false)
      setSelectedEnrollment(null)
      setSelectedMonthlyPayment(null)
    } catch (err) {
      console.error("Failed to mark payment:", err)
    }
  }

  const getPaymentsSummary = (enrollment: ClubEnrollmentWithPayments) => {
    const total = enrollment.monthlyPayments.length
    const paid = enrollment.monthlyPayments.filter(p => p.isPaid).length
    return { paid, total }
  }

  // Eligibility rule handlers
  const openEligibilityDialog = (club: Club) => {
    setEligibilityClub(club)
    if (club.eligibilityRule) {
      setEligibilityRuleType(club.eligibilityRule.ruleType)
      setSelectedGradeIds(club.eligibilityRule.gradeRules.map(gr => gr.gradeId))
    } else {
      setEligibilityRuleType("all_grades")
      setSelectedGradeIds([])
    }
    setIsEligibilityDialogOpen(true)
  }

  const handleUpdateEligibility = async () => {
    if (!eligibilityClub) return
    try {
      await eligibilityMutation.mutateAsync({
        clubId: eligibilityClub.id,
        ruleType: eligibilityRuleType,
        gradeIds: selectedGradeIds,
      })
      setIsEligibilityDialogOpen(false)
      setEligibilityClub(null)
    } catch (err) {
      console.error("Failed to update eligibility rule:", err)
    }
  }

  const toggleGradeSelection = (gradeId: string) => {
    setSelectedGradeIds(prev =>
      prev.includes(gradeId)
        ? prev.filter(id => id !== gradeId)
        : [...prev, gradeId]
    )
  }

  const getEligibilityBadge = (club: Club) => {
    if (!club.eligibilityRule) return null
    const rule = club.eligibilityRule
    if (rule.ruleType === "all_grades") return null
    const gradeNames = rule.gradeRules.map(gr => gr.grade.name).join(", ")
    if (rule.ruleType === "include_only") {
      return `${t.clubs?.onlyGrades || "Only"}: ${gradeNames}`
    }
    return `${t.clubs?.excludeGrades || "Except"}: ${gradeNames}`
  }

  // Group grades by level for display
  const gradesByLevel = grades.reduce((acc, grade) => {
    const level = grade.level as string
    if (!acc[level]) acc[level] = []
    acc[level].push(grade)
    return acc
  }, {} as Record<string, typeof grades>)

  const levelOrder = ["kindergarten", "primary", "middle", "high"]
  // Map database level values to i18n label keys
  const levelLabels: Record<string, string> = {
    kindergarten: t.grades?.levelLabels?.kindergarten || "Kindergarten",
    primary: t.grades?.levelLabels?.elementary || "Primary",
    middle: t.grades?.levelLabels?.college || "Middle School",
    high: t.grades?.levelLabels?.high_school || "High School",
  }

  // Prevent hydration mismatch by not rendering interactive components until mounted
  if (!mounted) {
    return (
      <PageContainer maxWidth="full">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{t.clubs?.adminTitle || "Clubs Management"}</h1>
              <p className="text-muted-foreground">{t.clubs?.adminSubtitle || "Create and manage clubs for the school year"}</p>
            </div>
          </div>
          <div className="text-center py-8 text-muted-foreground">{t.common?.loading || "Loading..."}</div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="full">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t.clubs?.adminTitle || "Clubs Management"}</h1>
            <p className="text-muted-foreground">{t.clubs?.adminSubtitle || "Create and manage clubs for the school year"}</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedSchoolYearId} onValueChange={setSelectedSchoolYearId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t.admin?.selectSchoolYear || "Select school year"} />
              </SelectTrigger>
              <SelectContent>
                {schoolYears.map((sy) => (
                  <SelectItem key={sy.id} value={sy.id}>
                    {sy.name}
                    {sy.isActive && " (Active)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <PermissionGuard resource="academic_year" action="create" inline>
              <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true) }}>
                <Plus className="h-4 w-4 mr-2" />
                {t.clubs?.addClub || "Add Club"}
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Category Management Collapsible */}
        <Collapsible
          open={isCategoryPanelOpen}
          onOpenChange={setIsCategoryPanelOpen}
          className="w-full"
        >
          <Card className={cn(
            "border-2 transition-all duration-200",
            isCategoryPanelOpen
              ? "border-gspn-gold-300 dark:border-gspn-gold-600"
              : "border-dashed border-muted-foreground/30 hover:border-muted-foreground/50"
          )}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50",
                      "dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-orange-950/30"
                    )}>
                      <FolderOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {t.clubs?.categoryManagement || "Category Management"}
                      </CardTitle>
                      <CardDescription>
                        {t.clubs?.categoryManagementDescription || "Organize clubs into categories"}
                        {allCategories && ` (${allCategories.length} ${t.clubs?.categories?.toLowerCase() || "categories"})`}
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-200",
                    isCategoryPanelOpen && "rotate-180"
                  )} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    {t.clubs?.categoryManagementHint || "Create categories to organize your clubs. Categories help students find clubs by type."}
                  </p>
                  <PermissionGuard resource="academic_year" action="create" inline>
                    <Button
                      size="sm"
                      onClick={() => {
                        resetCategoryForm()
                        setIsCategoryDialogOpen(true)
                      }}
                      className={componentClasses.primaryActionButton}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t.clubs?.addCategory || "Add Category"}
                    </Button>
                  </PermissionGuard>
                </div>

                {/* Category cards grid */}
                {!allCategories || allCategories.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
                    <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{t.clubs?.noCategories || "No categories yet"}</p>
                    <p className="text-sm">{t.clubs?.createFirstCategory || "Create your first category to organize clubs"}</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {allCategories.map((cat, index) => (
                      <div
                        key={cat.id}
                        className={cn(
                          "group relative p-4 rounded-lg border transition-all duration-200",
                          "hover:shadow-md hover:-translate-y-0.5",
                          cat.status === "active"
                            ? "bg-gradient-to-br from-emerald-50/50 via-teal-50/50 to-green-50/50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-green-950/20 border-emerald-200/50 dark:border-emerald-800/50"
                            : "bg-muted/30 border-muted"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <GripVertical className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {locale === "fr" ? cat.nameFr : cat.name}
                              </div>
                              {cat.description && (
                                <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <PermissionGuard resource="academic_year" action="update" inline>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditCategoryDialog(cat)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard resource="academic_year" action="delete" inline>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:text-destructive"
                                onClick={() => {
                                  setSelectedCategory(cat)
                                  setIsDeleteCategoryDialogOpen(true)
                                }}
                                disabled={cat._count.clubs > 0}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </PermissionGuard>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              cat.status === "active"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {cat.status === "active" ? (t.common?.active || "Active") : (t.common?.inactive || "Inactive")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {cat._count.clubs} {cat._count.clubs === 1 ? (t.clubs?.club || "club") : (t.clubs?.clubsLower || "clubs")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Category filter tabs */}
        <Tabs value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">{t.common?.all || "All"}</TabsTrigger>
            {categories?.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {locale === "fr" ? cat.nameFr : cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Clubs grid */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">{t.common?.loading || "Loading..."}</div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{t.clubs?.noClubs || "No clubs found"}</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clubs.map((club) => (
                <Card key={club.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {locale === "fr" && club.nameFr ? club.nameFr : club.name}
                        </CardTitle>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <Badge variant="outline">{getCategoryLabel(club)}</Badge>
                          <Badge className={getStatusColor(club.status)}>
                            {getStatusLabel(club.status)}
                          </Badge>
                          {getEligibilityBadge(club) && (
                            <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                              <Shield className="h-3 w-3 mr-1" />
                              {getEligibilityBadge(club)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {club.monthlyFee && club.monthlyFee > 0 && (
                          <PermissionGuard resource="schedule" action="view" inline>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEnrollmentsDialog(club)}
                              title={t.clubs?.viewEnrollments || "View Enrollments"}
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                        )}
                        <PermissionGuard resource="academic_year" action="update" inline>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEligibilityDialog(club)}
                            title={t.clubs?.editEligibility || "Edit Eligibility"}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard resource="academic_year" action="update" inline>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(club)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard resource="academic_year" action="delete" inline>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedClub(club)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {club.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {club.description}
                      </p>
                    )}
                    {club.leader && (
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{club.leader.person.firstName} {club.leader.person.lastName}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {club._count.enrollments}/{club.capacity} {t.clubs?.enrolled || "enrolled"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                        <span>{formatCurrency(club.fee)}</span>
                      </div>
                      {club.monthlyFee && club.monthlyFee > 0 && (
                        <div className="flex items-center gap-2 col-span-2 text-xs text-muted-foreground">
                          <span>+ {formatCurrency(club.monthlyFee)}/{t.clubs?.month || "month"}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 col-span-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(club.startDate).toLocaleDateString(locale)} -{" "}
                          {new Date(club.endDate).toLocaleDateString(locale)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {pagination && (
              <DataPagination
                pagination={pagination}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
              />
            )}
          </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false)
            setIsEditDialogOpen(false)
            setSelectedClub(null)
            resetForm()
          }
        }}
      >
        <DialogContent className={cn(
          "overflow-hidden flex flex-col",
          isCreateDialogOpen ? "max-w-4xl max-h-[90vh]" : "max-w-2xl max-h-[90vh]"
        )}>
          {/* Use wizard for create, old form for edit */}
          {isCreateDialogOpen ? (
            <ClubWizard
              onComplete={() => {
                setIsCreateDialogOpen(false)
                resetForm()
              }}
              onCancel={() => {
                setIsCreateDialogOpen(false)
                resetForm()
              }}
            />
          ) : (
            <>
              <DialogHeader className="pb-4 border-b border-border">
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="h-10 w-1 bg-gradient-to-b from-gspn-gold-400 via-gspn-gold-500 to-gspn-gold-600 rounded-full" />
                  {t.clubs?.editClub || "Edit Club"}
                </DialogTitle>
              </DialogHeader>

          <div className="overflow-y-auto flex-1 pr-2 -mr-2">
            <div className="grid gap-6 py-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-gspn-gold-200 via-gspn-gold-300 to-transparent dark:from-gspn-gold-800 dark:via-gspn-gold-700" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {t.clubs?.basicInformation || "Basic Information"}
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-l from-gspn-gold-200 via-gspn-gold-300 to-transparent dark:from-gspn-gold-800 dark:via-gspn-gold-700" />
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2.5">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      {t.clubs?.clubName || "Club Name"}
                      <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-amber-500 rounded-full">*</span>
                    </Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t.clubs?.clubNamePlaceholder || "Enter club name"}
                      className="h-11 border-2 focus-visible:border-gspn-gold-400 dark:focus-visible:border-gspn-gold-600 transition-colors"
                    />
                  </div>

                  <div className="grid gap-2.5">
                    <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      {t.clubs?.clubNameFr || "French Name"}
                      <span className="text-xs px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {t.common?.optional || "optional"}
                      </span>
                    </Label>
                    <Input
                      value={form.nameFr}
                      onChange={(e) => setForm({ ...form, nameFr: e.target.value })}
                      placeholder={t.clubs?.clubNameFrPlaceholder || "Enter French name (optional)"}
                      className="h-10"
                    />
                  </div>

                  <div className="grid gap-2.5">
                    <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      {t.clubs?.clubDescription || "Description"}
                      <span className="text-xs px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {t.common?.optional || "optional"}
                      </span>
                    </Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder={t.clubs?.clubDescriptionPlaceholder || "Describe the club activities and objectives"}
                      className="min-h-[100px] resize-none"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Organization Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-emerald-200 via-emerald-300 to-transparent dark:from-emerald-800 dark:via-emerald-700" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {t.clubs?.organization || "Organization"}
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-l from-emerald-200 via-emerald-300 to-transparent dark:from-emerald-800 dark:via-emerald-700" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2.5">
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t.clubs?.category || "Category"}
                    </Label>
                    <Select
                      value={form.categoryId || "__none__"}
                      onValueChange={(v) => setForm({ ...form, categoryId: v === "__none__" ? "" : v })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={t.clubs?.selectCategory || "Select..."} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">{t.clubs?.noCategory || "None"}</SelectItem>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {locale === "fr" ? cat.nameFr : cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2.5">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      {t.common?.status || "Status"}
                      <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-amber-500 rounded-full">*</span>
                    </Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) => setForm({ ...form, status: v as ClubStatus })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CLUB_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {getStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2.5">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t.clubs?.leader || "Leader"}
                  </Label>
                  <Select
                    value={form.leaderId || "__none__"}
                    onValueChange={(v) => setForm({ ...form, leaderId: v === "__none__" ? "" : v })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={t.clubs?.selectLeader || "Select leader..."} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{t.clubs?.noLeader || "None"}</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Schedule & Capacity Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-200 via-blue-300 to-transparent dark:from-blue-800 dark:via-blue-700" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {t.clubs?.scheduleCapacity || "Schedule & Capacity"}
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-l from-blue-200 via-blue-300 to-transparent dark:from-blue-800 dark:via-blue-700" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2.5">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      {t.clubs?.startDate || "Start Date"}
                      <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-amber-500 rounded-full">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="h-11 border-2 focus-visible:border-blue-400 dark:focus-visible:border-blue-600 transition-colors"
                    />
                  </div>

                  <div className="grid gap-2.5">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      {t.clubs?.endDate || "End Date"}
                      <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-amber-500 rounded-full">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="h-11 border-2 focus-visible:border-blue-400 dark:focus-visible:border-blue-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid gap-2.5">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    {t.clubs?.capacity || "Capacity"}
                    <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-amber-500 rounded-full">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 30 })}
                    className="h-11 border-2 focus-visible:border-blue-400 dark:focus-visible:border-blue-600 transition-colors"
                    placeholder="30"
                  />
                </div>
              </div>

              {/* Financial Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-amber-200 via-amber-300 to-transparent dark:from-amber-800 dark:via-amber-700" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {t.clubs?.fees || "Fees"}
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-l from-amber-200 via-amber-300 to-transparent dark:from-amber-800 dark:via-amber-700" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2.5">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      {t.clubs?.oneTimeFee || "One-time Fee"}
                      <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-amber-500 rounded-full">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={form.fee}
                        onChange={(e) => setForm({ ...form, fee: parseInt(e.target.value) || 0 })}
                        className="h-11 pr-12 border-2 focus-visible:border-amber-400 dark:focus-visible:border-amber-600 transition-colors font-mono"
                        placeholder="0"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                        GNF
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2.5">
                    <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      {t.clubs?.monthlyFee || "Monthly Fee"}
                      <span className="text-xs px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {t.common?.optional || "optional"}
                      </span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={form.monthlyFee}
                        onChange={(e) => setForm({ ...form, monthlyFee: parseInt(e.target.value) || 0 })}
                        className="h-11 pr-12 font-mono"
                        placeholder="0"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                        GNF
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border mt-2">
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 text-[9px] font-bold text-white bg-amber-500 rounded-full">*</span>
                {t.clubs?.requiredField || "Required field"}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    setIsEditDialogOpen(false)
                    resetForm()
                  }}
                  className="min-w-[100px]"
                >
                  {t.common?.cancel || "Cancel"}
                </Button>
                <Button
                  onClick={isEditDialogOpen ? handleEdit : handleCreate}
                  className={cn(
                    "min-w-[140px]",
                    componentClasses.primaryActionButton,
                    "shadow-lg hover:shadow-xl transition-all duration-200"
                  )}
                >
                  {isEditDialogOpen ? t.clubs?.updateClub || "Update Club" : t.clubs?.createClub || "Create Club"}
                </Button>
              </div>
            </div>
          </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.clubs?.deleteClub || "Delete Club"}</AlertDialogTitle>
            <AlertDialogDescription>{t.clubs?.confirmDelete || "Are you sure you want to delete this club? This action cannot be undone."}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common?.cancel || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t.common?.delete || "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Category Create/Edit Dialog */}
      <Dialog
        open={isCategoryDialogOpen || isEditCategoryDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCategoryDialogOpen(false)
            setIsEditCategoryDialogOpen(false)
            setSelectedCategory(null)
            resetCategoryForm()
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditCategoryDialogOpen
                ? t.clubs?.editCategory || "Edit Category"
                : t.clubs?.addCategory || "Add Category"}
            </DialogTitle>
            <DialogDescription>
              {isEditCategoryDialogOpen
                ? t.clubs?.editCategoryDescription || "Update the category details"
                : t.clubs?.addCategoryDescription || "Create a new category to organize clubs"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t.clubs?.categoryNameEn || "Name (English)"}</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder={t.clubs?.categoryNameEnPlaceholder || "e.g., Sports"}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t.clubs?.categoryNameFr || "Name (French)"}</Label>
              <Input
                value={categoryForm.nameFr}
                onChange={(e) => setCategoryForm({ ...categoryForm, nameFr: e.target.value })}
                placeholder={t.clubs?.categoryNameFrPlaceholder || "e.g., Sports"}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t.clubs?.categoryDescription || "Description"}</Label>
              <Textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder={t.clubs?.categoryDescriptionPlaceholder || "Optional description for this category"}
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t.common?.status || "Status"}</Label>
                <p className="text-xs text-muted-foreground">
                  {categoryForm.status === "active"
                    ? t.clubs?.categoryActiveHint || "Category is visible to users"
                    : t.clubs?.categoryInactiveHint || "Category is hidden from users"}
                </p>
              </div>
              <Switch
                checked={categoryForm.status === "active"}
                onCheckedChange={(checked) =>
                  setCategoryForm({ ...categoryForm, status: checked ? "active" : "inactive" })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>{t.clubs?.displayOrder || "Display Order"}</Label>
              <Input
                type="number"
                value={categoryForm.order}
                onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })}
                min={0}
              />
              <p className="text-xs text-muted-foreground">
                {t.clubs?.displayOrderHint || "Lower numbers appear first"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCategoryDialogOpen(false)
                setIsEditCategoryDialogOpen(false)
                setSelectedCategory(null)
                resetCategoryForm()
              }}
            >
              {t.common?.cancel || "Cancel"}
            </Button>
            <Button
              onClick={isEditCategoryDialogOpen ? handleEditCategory : handleCreateCategory}
              disabled={!categoryForm.name || !categoryForm.nameFr}
              className={componentClasses.primaryActionButton}
            >
              {isEditCategoryDialogOpen
                ? t.clubs?.updateCategory || "Update Category"
                : t.clubs?.createCategory || "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Delete confirmation dialog */}
      <AlertDialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.clubs?.deleteCategory || "Delete Category"}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCategory && selectedCategory._count.clubs > 0
                ? t.clubs?.cannotDeleteCategoryWithClubs || "This category cannot be deleted because it has clubs assigned to it. Please reassign or remove the clubs first."
                : t.clubs?.confirmDeleteCategory || "Are you sure you want to delete this category? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common?.cancel || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={selectedCategory ? selectedCategory._count.clubs > 0 : false}
            >
              {t.common?.delete || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Enrollments List Dialog */}
      <Dialog
        open={isEnrollmentsDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEnrollmentsDialogOpen(false)
            setEnrollmentsClub(null)
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t.clubs?.enrollments || "Enrollments"}
                  {enrollmentsClub && (
                    <span className="text-muted-foreground font-normal">
                      - {locale === "fr" && enrollmentsClub.nameFr ? enrollmentsClub.nameFr : enrollmentsClub.name}
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {t.clubs?.monthlyPaymentTracking || "Track monthly payment status for enrolled students"}
                </DialogDescription>
              </div>
              {enrollmentsClub && (
                <PermissionGuard resource="schedule" action="create" inline>
                  <Button
                    size="sm"
                    onClick={() => setIsEnrollStudentDialogOpen(true)}
                    className={componentClasses.primaryActionButton}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t.clubs?.enrollStudent || "Enroll Student"}
                  </Button>
                </PermissionGuard>
              )}
            </div>
          </DialogHeader>

          {enrollmentsLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              {t.common?.loading || "Loading..."}
            </div>
          ) : !enrollments || enrollments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>{t.clubs?.noEnrollments || "No enrollments yet"}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => {
                const summary = getPaymentsSummary(enrollment)
                const student = enrollment.studentProfile
                const studentName = `${student.person.firstName} ${student.person.lastName}`

                return (
                  <Card key={enrollment.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{studentName}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {t.clubs?.enrolledOn || "Enrolled"}: {new Date(enrollment.enrolledAt).toLocaleDateString(locale)}
                            {enrollment.enroller && (
                              <span className="ml-2">
                                {t.clubs?.by || "by"} {enrollment.enroller.name}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          {summary.total > 0 ? (
                            <Badge
                              variant="secondary"
                              className={cn(
                                summary.paid === summary.total
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                  : summary.paid > 0
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                    : "bg-muted text-muted-foreground"
                              )}
                            >
                              {(t.clubs?.monthsPaid || "{paid} of {total} months paid")
                                .replace("{paid}", String(summary.paid))
                                .replace("{total}", String(summary.total))}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              {t.clubs?.noMonthlyPayments || "No monthly payments"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {enrollment.monthlyPayments.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            {t.clubs?.monthlyPayments || "Monthly Payments"}
                          </p>
                          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                            {enrollment.monthlyPayments.map((payment) => {
                              const isPaid = payment.isPaid
                              const isPending = !isPaid
                              // Only calculate date on client to avoid hydration mismatch
                              const now = mounted ? new Date() : new Date(0)
                              const paymentDate = new Date(payment.year, payment.month - 1, 1)
                              const isUpcoming = paymentDate > now
                              const canPrint = isPaid && payment.clubPaymentId

                              return (
                                <div key={payment.id} className="relative group">
                                  <button
                                    disabled={isUpcoming && !isPaid}
                                    onClick={() => {
                                      if (isPaid) {
                                        // Do nothing on main button click for paid (print button handles it)
                                      } else if (!isUpcoming) {
                                        openPaymentDialog(enrollment, payment)
                                      }
                                    }}
                                    className={cn(
                                      "flex flex-col items-center p-1.5 rounded-md text-xs transition-all w-full",
                                      isPaid && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
                                      isPending && !isUpcoming && "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60 cursor-pointer",
                                      isUpcoming && "bg-slate-100 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 cursor-not-allowed opacity-60"
                                    )}
                                    title={isPaid
                                      ? `${t.clubs?.paid || "Paid"}: ${payment.paidAt ? new Date(payment.paidAt).toLocaleDateString(locale) : ""}`
                                      : isUpcoming
                                        ? t.clubs?.upcoming || "Upcoming"
                                        : t.clubs?.clickToMarkPaid || "Click to mark as paid"
                                    }
                                  >
                                    {isPaid ? (
                                      <CheckCircle2 className="h-3.5 w-3.5 mb-0.5" />
                                    ) : isUpcoming ? (
                                      <Circle className="h-3.5 w-3.5 mb-0.5" />
                                    ) : (
                                      <Clock className="h-3.5 w-3.5 mb-0.5" />
                                    )}
                                    <span className="font-medium">{getMonthAbbrev(payment.month)}</span>
                                    <span className="text-[10px] opacity-70">{payment.year}</span>
                                  </button>
                                  {/* Print button overlay for paid payments */}
                                  {canPrint && enrollmentsClub && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        printReceipt(enrollmentsClub.id, payment.clubPaymentId!)
                                      }}
                                      className="absolute -top-1 -right-1 p-1 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-emerald-200 dark:border-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                      title={t.clubs?.printReceipt || "Print Receipt"}
                                    >
                                      <Printer className="h-3 w-3 text-emerald-600" />
                                    </button>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>{t.clubs?.paid || "Paid"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-amber-600" />
                              <span>{t.clubs?.pending || "Pending"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Circle className="h-3 w-3 text-slate-400" />
                              <span>{t.clubs?.upcoming || "Upcoming"}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEnrollmentsDialogOpen(false)}>
              {t.common?.close || "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Payment Dialog */}
      <Dialog
        open={isPaymentDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsPaymentDialogOpen(false)
            setSelectedEnrollment(null)
            setSelectedMonthlyPayment(null)
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.clubs?.recordPayment || "Record Payment"}</DialogTitle>
            <DialogDescription>
              {t.clubs?.confirmPaymentDescription || "Mark this monthly payment as paid"}
            </DialogDescription>
          </DialogHeader>

          {selectedEnrollment && selectedMonthlyPayment && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.clubs?.student || "Student"}:</span>
                  <span className="font-medium">
                    {selectedEnrollment.studentProfile.person.firstName} {selectedEnrollment.studentProfile.person.lastName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.clubs?.month || "Month"}:</span>
                  <span className="font-medium">
                    {getMonthLabel(selectedMonthlyPayment.month)} {selectedMonthlyPayment.year}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.clubs?.amount || "Amount"}:</span>
                  <span className="font-medium">{formatCurrency(selectedMonthlyPayment.amount)}</span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>{t.clubs?.paymentMethod || "Payment Method"}</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as "cash" | "orange_money")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        <span>{t.clubs?.cash || "Cash"}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="orange_money">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <span>{t.clubs?.orangeMoney || "Orange Money"}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPaymentDialogOpen(false)
                setSelectedEnrollment(null)
                setSelectedMonthlyPayment(null)
              }}
            >
              {t.common?.cancel || "Cancel"}
            </Button>
            <Button
              onClick={handleMarkAsPaid}
              disabled={markPaymentMutation.isPending}
              className={componentClasses.primaryActionButton}
            >
              {markPaymentMutation.isPending
                ? t.common?.saving || "Saving..."
                : t.clubs?.confirmPayment || "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Eligibility Rule Editor Dialog */}
      <Dialog
        open={isEligibilityDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEligibilityDialogOpen(false)
            setEligibilityClub(null)
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t.clubs?.eligibilityRules || "Eligibility Rules"}
            </DialogTitle>
            <DialogDescription>
              {t.clubs?.eligibilityRulesDescription || "Set which grades can enroll in this club"}
            </DialogDescription>
          </DialogHeader>

          {eligibilityClub && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">
                  {locale === "fr" && eligibilityClub.nameFr ? eligibilityClub.nameFr : eligibilityClub.name}
                </p>
              </div>

              {/* Rule Type Selection */}
              <div className="grid gap-2">
                <Label>{t.clubs?.ruleType || "Rule Type"}</Label>
                <Select
                  value={eligibilityRuleType}
                  onValueChange={(v) => {
                    setEligibilityRuleType(v as "all_grades" | "include_only" | "exclude_only")
                    if (v === "all_grades") {
                      setSelectedGradeIds([])
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_grades">
                      {t.clubs?.allGradesAllowed || "All grades allowed"}
                    </SelectItem>
                    <SelectItem value="include_only">
                      {t.clubs?.includeOnlyGrades || "Only specific grades"}
                    </SelectItem>
                    <SelectItem value="exclude_only">
                      {t.clubs?.excludeGradesRule || "All except specific grades"}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {eligibilityRuleType === "all_grades" && (t.clubs?.allGradesHint || "Any student can enroll in this club")}
                  {eligibilityRuleType === "include_only" && (t.clubs?.includeOnlyHint || "Only students in selected grades can enroll")}
                  {eligibilityRuleType === "exclude_only" && (t.clubs?.excludeGradesHint || "Students in selected grades cannot enroll")}
                </p>
              </div>

              {/* Grade Selection (shown for include_only and exclude_only) */}
              {eligibilityRuleType !== "all_grades" && (
                <div className="grid gap-3">
                  <Label>
                    {eligibilityRuleType === "include_only"
                      ? (t.clubs?.selectAllowedGrades || "Select allowed grades")
                      : (t.clubs?.selectExcludedGrades || "Select grades to exclude")}
                  </Label>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto border rounded-lg p-3">
                    {levelOrder.map((level) => {
                      const levelGrades = gradesByLevel[level] || []
                      if (levelGrades.length === 0) return null

                      return (
                        <div key={level} className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {levelLabels[level]}
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {levelGrades
                              .sort((a, b) => a.order - b.order)
                              .map((grade) => (
                                <label
                                  key={grade.id}
                                  className={cn(
                                    "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors",
                                    selectedGradeIds.includes(grade.id)
                                      ? "bg-primary/10 border-primary"
                                      : "hover:bg-muted"
                                  )}
                                >
                                  <Checkbox
                                    checked={selectedGradeIds.includes(grade.id)}
                                    onCheckedChange={() => toggleGradeSelection(grade.id)}
                                  />
                                  <span className="text-sm">{grade.name}</span>
                                </label>
                              ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {selectedGradeIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t.clubs?.selectedGradesCount?.replace("{count}", String(selectedGradeIds.length)) ||
                        `${selectedGradeIds.length} grade(s) selected`}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEligibilityDialogOpen(false)
                setEligibilityClub(null)
              }}
            >
              {t.common?.cancel || "Cancel"}
            </Button>
            <Button
              onClick={handleUpdateEligibility}
              disabled={
                eligibilityMutation.isPending ||
                (eligibilityRuleType !== "all_grades" && selectedGradeIds.length === 0)
              }
              className={componentClasses.primaryActionButton}
            >
              {eligibilityMutation.isPending
                ? t.common?.saving || "Saving..."
                : t.clubs?.updateEligibility || "Update Eligibility"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enroll Student Dialog */}
      {enrollmentsClub && (
        <EnrollStudentDialog
          clubId={enrollmentsClub.id}
          clubName={locale === "fr" && enrollmentsClub.nameFr ? enrollmentsClub.nameFr : enrollmentsClub.name}
          open={isEnrollStudentDialogOpen}
          onOpenChange={setIsEnrollStudentDialogOpen}
          onSuccess={() => {
            // Refetch enrollments after successful enrollment
            // The react-query hook will automatically refetch
          }}
        />
      )}
    </PageContainer>
  )
}
