"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  iconColor?: string
  delay?: number
}

export function StatsCard({ label, value, icon: Icon, iconColor, delay }: StatsCardProps) {
  return (
    <Card
      className={cn(
        "border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500",
        delay && `delay-${delay}`
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          </div>
          <Icon className={cn("w-10 h-10", iconColor || "text-gspn-maroon-500/30")} />
        </div>
      </CardContent>
    </Card>
  )
}
