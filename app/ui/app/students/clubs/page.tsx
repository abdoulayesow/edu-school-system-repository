"use client"

import { useState, useMemo, useEffect, lazy, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BookOpen,
  Users,
  UserPlus,
  Search,
  Loader2,
  Calendar,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { PermissionGuard, NoPermission } from "@/components/permission-guard"
import { DataPagination } from "@/components/data-pagination"
import { StatCard, FilterCard, HydratedSelect, type SelectOption } from "@/components/students"
import { usePagination } from "@/lib/hooks/use-pagination"
import {
  useClubs,
  useClubCategories,
  type ApiClub,
} from "@/lib/hooks/use-api"

// Dynamic import for ClubGrid component
const ClubGrid = lazy(() => import("@/components/clubs/club-grid").then(m => ({ default: m.ClubGrid })))

const ITEMS_PER_PAGE = 50

export default function ClubsPage() {
  const { t, locale } = useI18n()

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Pagination hook
  const { offset, limit, goToNextPage, goToPrevPage, reset } = usePagination({
    initialLimit: ITEMS_PER_PAGE,
  })

  // Reset pagination when filters change
  useEffect(() => {
    reset()
  }, [searchQuery, categoryFilter, reset])

  // React Query hooks - fetch data with automatic caching
  const { data: clubsData, isLoading: clubsLoading, error: clubsError } = useClubs({
    categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
    limit,
    offset,
  })
  const { data: categoriesData, isLoading: categoriesLoading } = useClubCategories("active")

  // Extract data with defaults
  const clubs = clubsData?.clubs ?? []
  const pagination = clubsData?.pagination ?? null
  const categories = categoriesData ?? []
  const isLoading = clubsLoading || categoriesLoading
  const error = clubsError ? "Failed to load clubs" : null

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== "" || categoryFilter !== "all"

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
  }

  // Summary statistics
  const stats = useMemo(() => {
    const total = clubs.length
    const enrolledStudents = clubs.reduce((sum, c) => sum + c._count.enrollments, 0)
    const availableSpots = clubs.reduce((sum, c) => {
      if (c.capacity === null) return sum // unlimited capacity
      return sum + Math.max(0, c.capacity - c._count.enrollments)
    }, 0)
    const activeClubs = clubs.filter(c => c._count.enrollments > 0).length

    return {
      total,
      enrolledStudents,
      availableSpots,
      activeClubs
    }
  }, [clubs])

  // Get category name
  const getCategoryName = (club: ApiClub) => {
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-GN", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount)

  // Build category options for HydratedSelect
  const categoryOptions: SelectOption[] = [
    { value: "all", label: t.clubs?.allCategories || "All Categories" },
    ...categories.map(cat => ({
      value: cat.id,
      label: locale === "fr" ? cat.nameFr : cat.name,
    })),
  ]

  return (
    <PermissionGuard
      checks={[
        { resource: "students", action: "view" },
        { resource: "classes", action: "view" },
      ]}
      fallback={
        <PageContainer>
          <NoPermission
            title={t.permissions?.accessDenied || "Access Denied"}
            description={t.clubs?.noPermission || "You don't have permission to view clubs."}
          />
        </PageContainer>
      }
    >
      <PageContainer>
        {/* Page Header with Brand Styling */}
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="h-1 bg-gspn-maroon-500" />
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                    <BookOpen className="h-6 w-6 text-gspn-maroon-500" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {t.clubs?.title || "Clubs & Activities"}
                  </h1>
                </div>
                <p className="text-muted-foreground mt-1">
                  {t.clubs?.subtitle || "Enroll students in extracurricular clubs"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard
            title={t.clubs?.totalClubs || "Total Clubs"}
            value={stats.total}
            description={`${stats.activeClubs} ${locale === "fr" ? "avec inscriptions" : "with enrollments"}`}
            icon={BookOpen}
          />
          <StatCard
            title={t.clubs?.enrolledStudents || "Students Enrolled"}
            value={stats.enrolledStudents}
            description={locale === "fr" ? "Inscriptions actives" : "Active enrollments"}
            icon={Users}
          />
          <StatCard
            title={t.clubs?.availableSpots || "Available Spots"}
            value={stats.availableSpots}
            description={locale === "fr" ? "Places restantes" : "Remaining capacity"}
            icon={UserPlus}
          />
          <StatCard
            title={locale === "fr" ? "Catégories" : "Categories"}
            value={categories.length}
            description={locale === "fr" ? "Types de clubs" : "Club types"}
            icon={Calendar}
          />
        </div>

        {/* Filters */}
        <FilterCard
          title={t.clubs?.filterClubs || "Filter Clubs"}
          showClear={hasActiveFilters}
          onClearFilters={clearFilters}
          clearLabel={locale === "fr" ? "Effacer les filtres" : "Clear filters"}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={t.clubs?.searchPlaceholder || "Search clubs..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <HydratedSelect
              value={categoryFilter}
              onValueChange={setCategoryFilter}
              placeholder={t.clubs?.allCategories || "All Categories"}
              options={categoryOptions}
              width="w-full sm:w-[200px]"
            />
          </div>
        </FilterCard>

        {/* Clubs Grid */}
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                <div>
                  <CardTitle>{t.clubs?.title || "Clubs"}</CardTitle>
                  <CardDescription>
                    {filteredClubs.length} {locale === "fr" ? "clubs" : "clubs"}
                    {pagination && ` ${locale === "fr" ? "sur" : "of"} ${pagination.total}`}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gspn-maroon-500" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : (
              <>
                <Suspense fallback={
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                  </div>
                }>
                  <ClubGrid
                    clubs={filteredClubs}
                    getCategoryName={getCategoryName}
                    formatCurrency={formatCurrency}
                    locale={locale}
                    t={t}
                  />
                </Suspense>

                {/* Pagination */}
                {pagination && (
                  <DataPagination
                    pagination={pagination}
                    onPrevPage={goToPrevPage}
                    onNextPage={() => goToNextPage(pagination.hasMore)}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    </PermissionGuard>
  )
}
