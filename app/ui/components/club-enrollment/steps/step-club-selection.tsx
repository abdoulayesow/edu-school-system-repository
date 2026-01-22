"use client"

import React, { useState, useEffect } from "react"
import { Search, Users, Calendar, DollarSign, User, Loader2, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { sizing } from "@/lib/design-tokens"
import { useI18n } from "@/components/i18n-provider"
import type { ClubOption } from "@/lib/types/club-enrollment"
import { useClubEnrollmentWizard } from "../wizard-context"

export function StepClubSelection() {
  const { t, locale } = useI18n()
  const { state, setClub } = useClubEnrollmentWizard()

  const [clubs, setClubs] = useState<ClubOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Fetch active clubs
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/clubs")
        if (!res.ok) throw new Error("Failed to fetch clubs")
        const data = await res.json()
        setClubs(data.clubs || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load clubs")
      } finally {
        setLoading(false)
      }
    }

    fetchClubs()
  }, [])

  // Get unique categories - optimized with useMemo
  const categories = React.useMemo(() => {
    const cats = new Set(clubs.map((c) => c.category?.name).filter(Boolean))
    return Array.from(cats) as string[]
  }, [clubs])

  // Filter clubs by category and search - optimized with useMemo for immediate updates
  const filteredClubs = React.useMemo(() => {
    let filtered = clubs

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((c) => c.category?.name === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.nameFr?.toLowerCase().includes(query) ||
          c.category?.name.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [clubs, selectedCategory, searchQuery])

  const handleSelectClub = (club: ClubOption) => {
    setClub({
      clubId: club.id,
      clubName: club.name,
      clubNameFr: club.nameFr,
      categoryName: club.category?.name || null,
      leaderName: club.leader?.name || null,
      enrollmentFee: club.fee,
      monthlyFee: club.monthlyFee,
      startDate: club.startDate,
      endDate: club.endDate,
      currentEnrollments: club._count.enrollments,
      capacity: club.capacity,
    })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-GN", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // Calculate capacity warning for selected club
  const selectedClub = clubs.find((c) => c.id === state.data.clubId)
  const selectedClubFillPercentage = selectedClub
    ? (selectedClub._count.enrollments / selectedClub.capacity) * 100
    : 0
  const showCapacityWarning = selectedClub && selectedClubFillPercentage >= 80 && selectedClubFillPercentage < 100

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Select a Club</h2>
        <p className="text-muted-foreground">Choose the club you want to enroll a student in</p>
      </div>

      {/* Capacity Warning */}
      {showCapacityWarning && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertDescription className="text-orange-800">
            <strong>Note:</strong> This club is at {Math.round(selectedClubFillPercentage)}% capacity ({selectedClub._count.enrollments}/{selectedClub.capacity} spots filled).
            Consider enrolling soon as spots are limited.
          </AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <Search className={cn(sizing.icon.sm, "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50")} />
        <Input
          type="text"
          placeholder="Search clubs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="all">All Clubs</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Clubs Grid */}
      {filteredClubs.length === 0 ? (
        <div className="text-center py-12">
          <Users className={cn(sizing.icon.xl, "mx-auto text-muted-foreground/30 mb-4")} />
          <p className="text-muted-foreground">No clubs found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClubs.map((club) => {
            const isSelected = state.data.clubId === club.id
            const isFull = club._count.enrollments >= club.capacity
            const fillPercentage = (club._count.enrollments / club.capacity) * 100

            return (
              <button
                key={club.id}
                onClick={() => !isFull && handleSelectClub(club)}
                disabled={isFull}
                className={cn(
                  "group relative p-5 rounded-xl border-2 transition-all duration-300 text-left",
                  "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
                  isSelected
                    ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                    : isFull
                    ? "border-border bg-muted/50 opacity-60 cursor-not-allowed"
                    : "border-border hover:border-amber-500 bg-card"
                )}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="h-6 w-6 absolute -top-2 -right-2 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                    <Check className={cn(sizing.icon.sm, "text-white")} />
                  </div>
                )}

                {/* Club Name */}
                <div className="mb-3">
                  <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-2">
                    {locale === "fr" && club.nameFr ? club.nameFr : club.name}
                  </h3>
                  {club.category && (
                    <Badge variant="secondary" className="text-xs">
                      {locale === "fr" && club.category.nameFr
                        ? club.category.nameFr
                        : club.category.name}
                    </Badge>
                  )}
                </div>

                {/* Leader */}
                {club.leader && (
                  <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                    <User className={sizing.icon.xs} />
                    <span className="truncate">{club.leader.name}</span>
                  </div>
                )}

                {/* Dates */}
                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                  <Calendar className={sizing.icon.xs} />
                  <span>
                    {formatDate(club.startDate)} - {formatDate(club.endDate)}
                  </span>
                </div>

                {/* Fees */}
                <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-amber-700 dark:text-amber-400">
                  <DollarSign className={sizing.icon.xs} />
                  <span>{formatCurrency(club.fee)}</span>
                  {club.monthlyFee && club.monthlyFee > 0 && (
                    <span className="text-muted-foreground font-normal">
                      + {formatCurrency(club.monthlyFee)}/mo
                    </span>
                  )}
                </div>

                {/* Capacity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Enrollment</span>
                    <span className="font-medium">
                      {club._count.enrollments}/{club.capacity}
                      {isFull && <span className="ml-2 text-red-600 font-semibold">FULL</span>}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500",
                        isFull
                          ? "bg-red-500"
                          : fillPercentage > 80
                          ? "bg-orange-500"
                          : "bg-amber-500"
                      )}
                      style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
