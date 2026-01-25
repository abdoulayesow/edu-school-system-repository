"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCategoryConfig } from "./category-config"
import type { ApiClub } from "@/lib/hooks/use-api"

interface ClubCardProps {
  club: ApiClub
  categoryName: string
  formatCurrency: (amount: number) => string
  locale: string
  clubsT: Record<string, string>
  index?: number
}

/**
 * Circular capacity indicator component
 */
function CapacityRing({ current, max }: { current: number; max: number | null }) {
  if (max === null) {
    // Unlimited capacity
    return (
      <div className="flex items-center gap-1.5 text-sm text-gray-600">
        <Users className="h-4 w-4" />
        <span className="font-semibold">{current}</span>
      </div>
    )
  }

  const percentage = max > 0 ? (current / max) * 100 : 0
  const circumference = 2 * Math.PI * 16 // radius = 16
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getColorClass = () => {
    if (percentage >= 90) return "stroke-red-500"
    if (percentage >= 70) return "stroke-amber-500"
    return "stroke-emerald-500"
  }

  const getTextColorClass = () => {
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 70) return "text-amber-600"
    return "text-emerald-600"
  }

  return (
    <div className="relative w-11 h-11 shrink-0">
      <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r="16"
          className="fill-none stroke-gray-200"
          strokeWidth="4"
        />
        <circle
          cx="22"
          cy="22"
          r="16"
          className={cn("fill-none transition-all duration-500", getColorClass())}
          strokeWidth="4"
          strokeLinecap="round"
          style={{ strokeDasharray: circumference, strokeDashoffset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-[10px] font-bold leading-none", getTextColorClass())}>
          {current}
        </span>
        <span className="text-[8px] text-gray-400 leading-none">/{max}</span>
      </div>
    </div>
  )
}

export function ClubCard({
  club,
  categoryName,
  formatCurrency,
  locale,
  clubsT,
  index = 0,
}: ClubCardProps) {
  const router = useRouter()
  const isFull = club.capacity !== null && club._count.enrollments >= club.capacity
  const isAlmostFull = club.capacity !== null && club._count.enrollments >= club.capacity * 0.8

  // Get category-specific styling
  const config = getCategoryConfig(categoryName)
  const Icon = config.icon

  const handleEnroll = () => {
    router.push(`/clubs/enroll?clubId=${club.id}`)
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-white",
        "transition-all duration-300 ease-out",
        "hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1",
        "animate-in fade-in slide-in-from-bottom-4",
        isFull ? "border-gray-200 opacity-75" : config.borderColor
      )}
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
    >
      {/* Category gradient header */}
      <div
        className={cn(
          "h-1.5 bg-gradient-to-r transition-all duration-300",
          config.gradient,
          "group-hover:h-2"
        )}
      />

      <div className="p-5">
        {/* Header with icon and capacity */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl shrink-0",
              "bg-gradient-to-br shadow-lg transition-transform duration-300",
              "group-hover:scale-110 group-hover:rotate-3",
              config.gradient
            )}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>

          <div className="flex items-center gap-2">
            {isAlmostFull && !isFull && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-5 border-amber-300 text-amber-600 bg-amber-50"
              >
                <AlertCircle className="h-3 w-3 mr-0.5" />
                {clubsT.almostFull || "Almost Full"}
              </Badge>
            )}
            {isFull && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-5 border-red-300 text-red-600 bg-red-50"
              >
                {clubsT.full || "Full"}
              </Badge>
            )}
            <CapacityRing current={club._count.enrollments} max={club.capacity} />
          </div>
        </div>

        {/* Club name */}
        <h3
          className={cn(
            "font-bold text-lg text-gray-900 mb-1.5 line-clamp-2",
            "transition-colors duration-200",
            "group-hover:text-gray-700"
          )}
        >
          {locale === "fr" && club.nameFr ? club.nameFr : club.name}
        </h3>

        {/* Category badge */}
        <Badge
          variant="secondary"
          className={cn(
            "mb-3 font-medium text-xs",
            config.bgLight,
            config.accent
          )}
        >
          {categoryName}
        </Badge>

        {/* Description */}
        {club.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[2.5rem]">
            {club.description}
          </p>
        )}

        {/* Footer with price and action */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            {club.fee > 0 && (
              <div className="font-bold text-gray-900">{formatCurrency(club.fee)}</div>
            )}
            {club.monthlyFee && club.monthlyFee > 0 && (
              <div className="text-xs text-gray-500">
                +{formatCurrency(club.monthlyFee)}/{clubsT.month || "mois"}
              </div>
            )}
            {club.fee === 0 && (!club.monthlyFee || club.monthlyFee === 0) && (
              <div className="text-sm font-medium text-emerald-600">
                {clubsT.free || "Gratuit"}
              </div>
            )}
          </div>

          <Button
            size="sm"
            disabled={isFull}
            onClick={handleEnroll}
            className={cn(
              "shadow-md transition-all duration-200",
              "hover:shadow-lg hover:scale-105",
              isFull
                ? "bg-gray-400 cursor-not-allowed"
                : cn("bg-gradient-to-r text-white", config.gradient, `hover:${config.gradientHover}`)
            )}
          >
            <UserPlus className="h-4 w-4 mr-1.5" />
            {isFull ? clubsT.full || "Complet" : clubsT.enrollStudent || "Inscrire"}
          </Button>
        </div>
      </div>

      {/* Subtle hover glow effect */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
          "bg-gradient-to-t from-transparent via-transparent to-white/5"
        )}
      />
    </div>
  )
}
