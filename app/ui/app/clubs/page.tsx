"use client"

import { useState, useMemo, useEffect, lazy, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BookOpen,
  Users,
  UserPlus,
  Search,
  Layers,
  GraduationCap,
  Cpu,
  Trophy,
  Palette,
  Music,
  FlaskConical,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { PermissionGuard, NoPermission } from "@/components/permission-guard"
import { DataPagination } from "@/components/data-pagination"
import { cn } from "@/lib/utils"
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
      {/* Hero Header with Stats */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        {/* Decorative patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white rounded-full -translate-y-1/2" />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t.clubs?.title || "Clubs & Activités"}
          </h1>
          <p className="text-amber-100 mb-6">
            {t.clubs?.subtitle || "Inscrivez les élèves aux clubs parascolaires"}
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4">
            {[
              { label: t.clubs?.totalClubs || "Clubs actifs", value: stats.total, icon: BookOpen },
              { label: t.clubs?.enrolledStudents || "Élèves inscrits", value: stats.enrolledStudents, icon: Users },
              {
                label: t.clubs?.availableSpots || "Places disponibles",
                value: clubs.reduce((sum, c) => sum + (c.capacity ? c.capacity - c._count.enrollments : 0), 0),
                icon: UserPlus,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 transition-transform hover:scale-105"
              >
                <stat.icon className="h-5 w-5 text-white" />
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-amber-100">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder={t.clubs?.searchPlaceholder || "Rechercher un club..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-shadow"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        <TabsList className="flex flex-wrap gap-2 p-1.5 h-auto bg-gray-100/80 rounded-2xl">
          <TabsTrigger
            value="all"
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all",
              "data-[state=active]:bg-white data-[state=active]:shadow-md",
              "data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-white/50"
            )}
          >
            <Layers className="h-4 w-4" />
            <span>{t.common?.all || "Tous"}</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-900 text-white data-[state=inactive]:bg-gray-200 data-[state=inactive]:text-gray-600">
              {clubs.length}
            </span>
          </TabsTrigger>
          {categories.map((cat) => {
            const catName = (locale === "fr" ? cat.nameFr : cat.name).toLowerCase()
            const count = stats.byCategory[cat.id] || 0
            // Determine icon based on category name
            let CategoryIcon = Layers
            if (catName.includes("academ") || catName.includes("excell") || catName.includes("revis")) CategoryIcon = GraduationCap
            else if (catName.includes("tech") || catName.includes("innov") || catName.includes("info")) CategoryIcon = Cpu
            else if (catName.includes("sport") || catName.includes("athl")) CategoryIcon = Trophy
            else if (catName.includes("art") || catName.includes("creat")) CategoryIcon = Palette
            else if (catName.includes("music") || catName.includes("musiq") || catName.includes("spect")) CategoryIcon = Music
            else if (catName.includes("scien") || catName.includes("decouv")) CategoryIcon = FlaskConical

            return (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all",
                  "data-[state=active]:bg-white data-[state=active]:shadow-md",
                  "data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-white/50",
                  count === 0 && "opacity-50"
                )}
              >
                <CategoryIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{locale === "fr" ? cat.nameFr : cat.name}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs",
                  "data-[state=active]:bg-gray-900 data-[state=active]:text-white",
                  "data-[state=inactive]:bg-gray-200 data-[state=inactive]:text-gray-600"
                )}>
                  {count}
                </span>
              </TabsTrigger>
            )
          })}
          {stats.uncategorized > 0 && (
            <TabsTrigger
              value="uncategorized"
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all",
                "data-[state=active]:bg-white data-[state=active]:shadow-md",
                "data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-white/50"
              )}
            >
              <Layers className="h-4 w-4" />
              <span>{t.clubs?.uncategorized || "Autre"}</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-600">
                {stats.uncategorized}
              </span>
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
                categoryName={locale === "fr" ? cat.nameFr : cat.name}
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
