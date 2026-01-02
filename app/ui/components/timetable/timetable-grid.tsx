'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export interface TimePeriod {
  id: string
  name: string
  nameFr: string | null
  startTime: string
  endTime: string
  order: number
}

export interface ScheduleSlot {
  id: string
  subject: {
    id: string
    name: string
    code: string
  } | null
  teacher: {
    id: string
    name: string
  } | null
  roomLocation: string | null
  isBreak: boolean
  notes: string | null
}

export interface DaySchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'
  periods: {
    timePeriodId: string
    timePeriod: TimePeriod
    slot: ScheduleSlot | null
  }[]
}

export interface TimetableGridProps {
  weeklySchedule: DaySchedule[]
  timePeriods: TimePeriod[]
  onSlotClick?: (day: string, timePeriodId: string, slot: ScheduleSlot | null) => void
  onAddSlot?: (day: string, timePeriodId: string) => void
  className?: string
  locale?: 'en' | 'fr'
}

const dayLabels = {
  en: {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
  },
  fr: {
    monday: 'Lun',
    tuesday: 'Mar',
    wednesday: 'Mer',
    thursday: 'Jeu',
    friday: 'Ven',
    saturday: 'Sam',
  },
}

export function TimetableGrid({
  weeklySchedule,
  timePeriods,
  onSlotClick,
  onAddSlot,
  className,
  locale = 'fr',
}: TimetableGridProps) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <div className="min-w-[800px]">
        {/* Header Row */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {/* Time Period Column Header */}
          <div className="font-semibold text-sm text-muted-foreground px-2 py-2">
            {locale === 'fr' ? 'Période' : 'Period'}
          </div>

          {/* Day Column Headers */}
          {weeklySchedule.map(({ day }) => (
            <div
              key={day}
              className="font-semibold text-sm text-center px-2 py-2 bg-muted/50 rounded-lg"
            >
              {dayLabels[locale][day]}
            </div>
          ))}
        </div>

        {/* Grid Body */}
        <div className="space-y-2">
          {timePeriods.map((period) => (
            <div key={period.id} className="grid grid-cols-7 gap-2">
              {/* Time Period Label */}
              <div className="flex flex-col justify-center px-2 py-2 text-xs border-r">
                <div className="font-medium">
                  {locale === 'fr' && period.nameFr ? period.nameFr : period.name}
                </div>
                <div className="text-muted-foreground">
                  {period.startTime} - {period.endTime}
                </div>
              </div>

              {/* Day Slots */}
              {weeklySchedule.map(({ day, periods }) => {
                const dayPeriod = periods.find((p) => p.timePeriodId === period.id)
                const slot = dayPeriod?.slot

                return (
                  <div key={`${day}-${period.id}`} className="relative">
                    {slot ? (
                      <Card
                        className={cn(
                          'p-2 cursor-pointer hover:shadow-md transition-shadow h-full min-h-[80px]',
                          slot.isBreak && 'bg-muted/30',
                          !slot.isBreak && 'bg-card'
                        )}
                        onClick={() => onSlotClick?.(day, period.id, slot)}
                      >
                        {slot.isBreak ? (
                          <div className="flex items-center justify-center h-full">
                            <Badge variant="outline" className="text-xs">
                              {locale === 'fr' ? 'Pause' : 'Break'}
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1 text-xs">
                            {slot.subject && (
                              <div className="font-semibold line-clamp-2">
                                {slot.subject.name}
                              </div>
                            )}
                            {slot.teacher && (
                              <div className="text-muted-foreground line-clamp-1">
                                {slot.teacher.name}
                              </div>
                            )}
                            {slot.roomLocation && (
                              <Badge variant="secondary" className="text-xs w-fit">
                                {slot.roomLocation}
                              </Badge>
                            )}
                            {slot.notes && (
                              <div className="text-muted-foreground italic line-clamp-1">
                                {slot.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    ) : (
                      <button
                        onClick={() => onAddSlot?.(day, period.id)}
                        className={cn(
                          'w-full h-full min-h-[80px] border-2 border-dashed border-muted-foreground/20',
                          'hover:border-primary/50 hover:bg-muted/20 rounded-lg',
                          'flex items-center justify-center transition-all',
                          'group'
                        )}
                      >
                        <Plus className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary/60" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {timePeriods.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {locale === 'fr'
              ? 'Aucune période définie. Créez des périodes pour commencer.'
              : 'No time periods defined. Create periods to get started.'}
          </div>
        )}
      </div>
    </div>
  )
}
