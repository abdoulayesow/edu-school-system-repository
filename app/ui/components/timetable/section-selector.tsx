'use client'

import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/components/i18n-provider'

export interface GradeRoom {
  id: string
  displayName: string
  grade: {
    id: string
    name: string
  }
}

export interface SectionSelectorProps {
  gradeRooms: GradeRoom[]
  value: string
  onValueChange: (gradeRoomId: string) => void
  label?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function SectionSelector({
  gradeRooms,
  value,
  onValueChange,
  label,
  placeholder,
  className,
  disabled = false,
}: SectionSelectorProps) {
  const { locale } = useI18n()

  const defaultLabel = locale === 'fr' ? 'Section' : 'Section'
  const defaultPlaceholder = locale === 'fr' ? 'Sélectionner une section' : 'Select a section'

  // Group grade rooms by grade
  const groupedRooms = React.useMemo(() => {
    const groups = new Map<string, GradeRoom[]>()

    gradeRooms.forEach((room) => {
      const gradeName = room.grade.name
      if (!groups.has(gradeName)) {
        groups.set(gradeName, [])
      }
      groups.get(gradeName)!.push(room)
    })

    return groups
  }, [gradeRooms])

  return (
    <div className={className}>
      {label !== undefined && label && (
        <Label htmlFor="section-selector" className="mb-2 block">
          {label || defaultLabel}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || gradeRooms.length === 0}
      >
        <SelectTrigger id="section-selector">
          <SelectValue placeholder={placeholder || defaultPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {gradeRooms.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              {locale === 'fr' ? 'Aucune section disponible' : 'No sections available'}
            </div>
          ) : (
            Array.from(groupedRooms.entries()).map(([gradeName, rooms]) => (
              <React.Fragment key={gradeName}>
                {groupedRooms.size > 1 && (
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {gradeName}
                  </div>
                )}
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.displayName}
                  </SelectItem>
                ))}
              </React.Fragment>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
