import { BookOpen } from "lucide-react"
import { ClubCard } from "./club-card"
import type { ApiClub } from "@/lib/hooks/use-api"

interface ClubGridProps {
  clubs: ApiClub[]
  getCategoryName: (club: ApiClub) => string
  formatCurrency: (amount: number) => string
  locale: string
  t: Record<string, unknown>
}

export function ClubGrid({
  clubs,
  getCategoryName,
  formatCurrency,
  locale,
  t,
}: ClubGridProps) {
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
        <ClubCard
          key={club.id}
          club={club}
          categoryName={getCategoryName(club)}
          formatCurrency={formatCurrency}
          locale={locale}
          clubsT={clubsT}
        />
      ))}
    </div>
  )
}
