"use client"

import { useState, useMemo, useEffect, lazy, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { sizing } from "@/lib/design-tokens"
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

  // Track if component is mounted to prevent hydration mismatches
  const [isMounted, setIsMounted] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [offset, setOffset] = useState(0)

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0)
  }, [searchQuery, categoryFilter])

  // React Query hooks - fetch data with automatic caching
  const { data: clubsData, isLoading: clubsLoading, error: clubsError } = useClubs({
    categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
    limit: ITEMS_PER_PAGE,
    offset,
  })
  const { data: categoriesData, isLoading: categoriesLoading } = useClubCategories("active")

  // Extract data with defaults
  const clubs = clubsData?.clubs ?? []
  const pagination = clubsData?.pagination ?? null
  const categories = categoriesData ?? []
  const isLoading = clubsLoading || categoriesLoading
  const error = clubsError ? "Failed to load clubs" : null

  // Set mounted flag after component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check if any filters are active
  const hasActiveFilters = searchQuery || categoryFilter !== "all"

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
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
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t.clubs?.title || "Clubs & Activités"}
            </h1>
            <p className="text-muted-foreground">
              {t.clubs?.subtitle || "Inscrivez les élèves aux clubs parascolaires"}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {/* Total Clubs */}
          <Card className="py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.clubs?.totalClubs || "Total Clubs"}</CardTitle>
              <BookOpen className={sizing.icon.lg} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeClubs} {locale === "fr" ? "avec inscriptions" : "with enrollments"}
              </p>
            </CardContent>
          </Card>

          {/* Enrolled Students */}
          <Card className="py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.clubs?.enrolledStudents || "Students Enrolled"}</CardTitle>
              <Users className={sizing.icon.lg} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.enrolledStudents}</div>
              <p className="text-xs text-muted-foreground">
                {locale === "fr" ? "Inscriptions actives" : "Active enrollments"}
              </p>
            </CardContent>
          </Card>

          {/* Available Spots */}
          <Card className="py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.clubs?.availableSpots || "Available Spots"}</CardTitle>
              <UserPlus className={sizing.icon.lg} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableSpots}</div>
              <p className="text-xs text-muted-foreground">
                {locale === "fr" ? "Places restantes" : "Remaining capacity"}
              </p>
            </CardContent>
          </Card>

          {/* Active This Month */}
          <Card className="py-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{locale === "fr" ? "Catégories" : "Categories"}</CardTitle>
              <Calendar className={sizing.icon.lg} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">
                {locale === "fr" ? "Types de clubs" : "Club types"}
              </p>
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
              {isMounted ? (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder={t.clubs?.allCategories || "All Categories"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.clubs?.allCategories || "All Categories"}</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {locale === "fr" ? cat.nameFr : cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="w-full sm:w-[200px] h-9 rounded-md border bg-transparent px-3 py-2 flex items-center text-sm text-muted-foreground">
                  {t.clubs?.allCategories || "All Categories"}
                </div>
              )}
            </div>

            {/* Clear Filters Link */}
            {hasActiveFilters && (
              <div className="mt-2">
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:underline cursor-pointer"
                >
                  {locale === "fr" ? "Effacer les filtres" : "Clear filters"}
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clubs Grid */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>{t.clubs?.title || "Clubs"}</CardTitle>
                <CardDescription>
                  {filteredClubs.length} {locale === "fr" ? "clubs" : "clubs"}
                  {pagination && ` ${locale === "fr" ? "sur" : "of"} ${pagination.total}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                    onPrevPage={handlePrevPage}
                    onNextPage={handleNextPage}
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
