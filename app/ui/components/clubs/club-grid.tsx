"use client"

import { ClubCard } from "./club-card"
import { getCategoryConfig } from "./category-config"
import { cn } from "@/lib/utils"
import type { ApiClub } from "@/lib/hooks/use-api"

interface ClubGridProps {
  clubs: ApiClub[]
  getCategoryName: (club: ApiClub) => string
  formatCurrency: (amount: number) => string
  locale: string
  t: Record<string, unknown>
  categoryName?: string // Optional: for empty state display
}

/**
 * Empty state component with GSPN brand styling
 */
function EmptyState({
  categoryName,
  clubsT,
}: {
  categoryName?: string
  clubsT: Record<string, string>
}) {
  const config = getCategoryConfig(categoryName)
  const Icon = config.icon

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-500">
      {/* Large faded icon with maroon background */}
      <div
        className={cn(
          "flex h-24 w-24 items-center justify-center rounded-3xl mb-6",
          "bg-gspn-maroon-500/10"
        )}
      >
        <Icon className="h-12 w-12 text-gspn-maroon-500/40" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        {clubsT.noClubsInCategory || "Aucun club dans cette catégorie"}
      </h3>

      <p className="text-muted-foreground max-w-sm">
        {categoryName ? (
          <>
            {clubsT.clubsWillAppear || "Les clubs de"}{" "}
            <span className="font-medium text-gspn-maroon-600">
              {categoryName.toLowerCase()}
            </span>{" "}
            {clubsT.willBeDisplayed || "seront affichés ici une fois créés."}
          </>
        ) : (
          clubsT.noClubs || "Aucun club trouvé"
        )}
      </p>
    </div>
  )
}

export function ClubGrid({
  clubs,
  getCategoryName,
  formatCurrency,
  locale,
  t,
  categoryName,
}: ClubGridProps) {
  const clubsT = (t.clubs || {}) as Record<string, string>

  if (clubs.length === 0) {
    return <EmptyState categoryName={categoryName} clubsT={clubsT} />
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {clubs.map((club, index) => (
        <ClubCard
          key={club.id}
          club={club}
          categoryName={getCategoryName(club)}
          formatCurrency={formatCurrency}
          locale={locale}
          clubsT={clubsT}
          index={index}
        />
      ))}
    </div>
  )
}
