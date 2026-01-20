"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, UserPlus } from "lucide-react"
import type { ApiClub } from "@/lib/hooks/use-api"

interface ClubCardProps {
  club: ApiClub
  categoryName: string
  formatCurrency: (amount: number) => string
  locale: string
  clubsT: Record<string, string>
}

export function ClubCard({
  club,
  categoryName,
  formatCurrency,
  locale,
  clubsT,
}: ClubCardProps) {
  const router = useRouter()
  const isFull = club.capacity !== null && club._count.enrollments >= club.capacity

  const handleEnroll = () => {
    // Navigate to enrollment wizard with pre-selected club
    router.push(`/clubs/enroll?clubId=${club.id}`)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg">
            {locale === "fr" && club.nameFr ? club.nameFr : club.name}
          </CardTitle>
          <Badge variant="secondary">{categoryName}</Badge>
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
          onClick={handleEnroll}
          disabled={isFull}
        >
          <UserPlus className="size-4 mr-2" />
          {isFull ? clubsT.full || "Full" : clubsT.enrollStudent || "Enroll Student"}
        </Button>
      </CardContent>
    </Card>
  )
}
