"use client"

import { useState, useMemo, useEffect, lazy, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, Users, Plus, Search, Sparkles } from "lucide-react"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
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

  // Extract data with defaults
  const clubs = clubsData?.clubs ?? []
  const pagination = clubsData?.pagination ?? null
  const categories = categoriesData ?? []
  const loading = clubsLoading || categoriesLoading

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
          <Suspense fallback={<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-48" /><Skeleton className="h-48" /><Skeleton className="h-48" /></div>}>
            <ClubGrid
              clubs={filteredClubs}
              getCategoryName={getCategoryName}
              formatCurrency={formatCurrency}
              locale={locale}
              t={t}
            />
          </Suspense>
        </TabsContent>

        {categories.map((cat) => (
          <TabsContent key={cat.id} value={cat.id} className="space-y-4">
            <Suspense fallback={<Skeleton className="h-48" />}>
              <ClubGrid
                clubs={filteredClubs.filter((c) => c.categoryId === cat.id)}
                getCategoryName={getCategoryName}
                formatCurrency={formatCurrency}
                locale={locale}
                t={t}
              />
            </Suspense>
          </TabsContent>
        ))}

        {stats.uncategorized > 0 && (
          <TabsContent value="uncategorized" className="space-y-4">
            <Suspense fallback={<Skeleton className="h-48" />}>
              <ClubGrid
                clubs={filteredClubs.filter((c) => !c.categoryId)}
                getCategoryName={getCategoryName}
                formatCurrency={formatCurrency}
                locale={locale}
                t={t}
              />
            </Suspense>
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
    </PageContainer>
    </PermissionGuard>
  )
}
