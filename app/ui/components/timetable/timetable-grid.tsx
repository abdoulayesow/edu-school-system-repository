'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  type TimetableGridProps,
  type DaySchedule,
  type TimePeriod,
  type ScheduleSlot,
  DAY_LABELS_SHORT,
} from '@/lib/types/timetable'

export function TimetableGrid({
  weeklySchedule,
  timePeriods,
  onSlotClick,
  onAddSlot,
  className,
  locale = 'fr',
  canEdit = true,
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
              {DAY_LABELS_SHORT[locale][day]}
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
                            <Badge className="text-xs bg-gspn-maroon-50 border-gspn-maroon-200 text-gspn-maroon-700 dark:bg-gspn-maroon-950/50 dark:border-gspn-maroon-800 dark:text-gspn-maroon-300">
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
                              <Badge className="text-xs w-fit bg-gspn-gold-50 border-gspn-gold-200 text-gspn-gold-700 dark:bg-gspn-gold-950/50 dark:border-gspn-gold-800 dark:text-gspn-gold-300">
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
                    ) : canEdit ? (
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
                    ) : (
                      <div className="w-full h-full min-h-[80px] border border-dashed border-muted-foreground/10 rounded-lg" />
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
