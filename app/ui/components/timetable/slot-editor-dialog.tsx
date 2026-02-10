"use client"

import { useState, useEffect } from "react"
import { FormDialog, FormField } from "@/components/ui/form-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DialogFooter } from "@/components/ui/dialog"
import { useI18n } from "@/components/i18n-provider"
import { Loader2, AlertTriangle, Calendar } from "lucide-react"

export interface ScheduleSlot {
  id: string
  gradeSubjectId: string | null
  teacherProfileId: string | null
  roomLocation: string | null
  isBreak: boolean
  notes: string | null
}

export interface GradeSubject {
  id: string
  subject: {
    id: string
    name: string
    nameFr: string
    code: string
  }
}

export interface TeacherProfile {
  id: string
  person: {
    id: string
    firstName: string
    lastName: string
  }
}

export interface ConflictCheck {
  type: 'teacher' | 'room' | 'section'
  dayOfWeek: string
  timePeriodId: string
  details: string
}

interface SlotEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gradeRoomId: string
  timePeriodId: string
  dayOfWeek: string
  slot: ScheduleSlot | null
  gradeSubjects: GradeSubject[]
  teachers: TeacherProfile[]
  onSuccess: () => void
}

const dayLabels = {
  en: {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
  },
  fr: {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
  },
}

export function SlotEditorDialog({
  open,
  onOpenChange,
  gradeRoomId,
  timePeriodId,
  dayOfWeek,
  slot,
  gradeSubjects,
  teachers,
  onSuccess,
}: SlotEditorDialogProps) {
  const { t, locale } = useI18n()
  const s = t.timetable.slotEditor
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conflicts, setConflicts] = useState<ConflictCheck[]>([])

  // Form state
  const [isBreak, setIsBreak] = useState(false)
  const [gradeSubjectId, setGradeSubjectId] = useState<string>("")
  const [teacherProfileId, setTeacherProfileId] = useState<string>("")
  const [roomLocation, setRoomLocation] = useState<string>("")
  const [notes, setNotes] = useState<string>("")

  // Initialize form with slot data
  useEffect(() => {
    if (slot) {
      setIsBreak(slot.isBreak)
      setGradeSubjectId(slot.gradeSubjectId || "")
      setTeacherProfileId(slot.teacherProfileId || "")
      setRoomLocation(slot.roomLocation || "")
      setNotes(slot.notes || "")
    } else {
      // Reset form for new slot
      setIsBreak(false)
      setGradeSubjectId("")
      setTeacherProfileId("")
      setRoomLocation("")
      setNotes("")
    }
    setError(null)
    setConflicts([])
  }, [slot, open])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    setConflicts([])

    try {
      const payload = {
        gradeRoomId,
        timePeriodId,
        dayOfWeek,
        isBreak,
        gradeSubjectId: isBreak ? null : gradeSubjectId || null,
        teacherProfileId: teacherProfileId || null,
        roomLocation: roomLocation || null,
        notes: notes || null,
      }

      let response
      if (slot) {
        // Update existing slot
        response = await fetch(`/api/timetable/schedule-slots/${slot.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        // Create new slot
        response = await fetch("/api/timetable/schedule-slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      const data = await response.json()

      if (!response.ok) {
        if (data.conflicts) {
          setConflicts(data.conflicts)
          setError(data.message || s.conflictDetected)
        } else {
          setError(data.message || s.failedToSave)
        }
        return
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error("Error saving schedule slot:", err)
      setError(s.errorOccurred)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!slot) return

    if (!confirm(s.deleteConfirm)) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/timetable/schedule-slots/${slot.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || s.failedToDelete)
        return
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error("Error deleting schedule slot:", err)
      setError(s.errorOccurred)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={slot ? s.editSlot : s.addSlot}
      description={dayLabels[locale as 'en' | 'fr'][dayOfWeek as keyof typeof dayLabels.en]}
      icon={Calendar}
      accentColor="blue"
      maxWidth="sm:max-w-2xl"
      error={error}
      footer={
        <DialogFooter className="gap-2">
          {slot && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {s.deleteSlot}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t.common.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {s.save}
          </Button>
        </DialogFooter>
      }
    >
      {/* Is Break Toggle */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isBreak"
          checked={isBreak}
          onCheckedChange={(checked) => setIsBreak(checked === true)}
        />
        <Label htmlFor="isBreak" className="cursor-pointer">
          {s.breakRecess}
        </Label>
      </div>

      {/* Subject Selection (hidden if break) */}
      {!isBreak && (
        <FormField label={s.subject} required>
          <Select
            value={gradeSubjectId}
            onValueChange={setGradeSubjectId}
          >
            <SelectTrigger>
              <SelectValue placeholder={s.selectSubject} />
            </SelectTrigger>
            <SelectContent>
              {gradeSubjects.map((gs) => (
                <SelectItem key={gs.id} value={gs.id}>
                  {locale === 'fr' ? gs.subject.nameFr : gs.subject.name} ({gs.subject.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      )}

      {/* Teacher Selection */}
      <FormField label={s.teacher}>
        <Select
          value={teacherProfileId}
          onValueChange={setTeacherProfileId}
        >
          <SelectTrigger>
            <SelectValue placeholder={s.selectTeacher} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">
              {s.none}
            </SelectItem>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.person.firstName} {teacher.person.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      {/* Room Location */}
      <FormField label={s.room}>
        <Input
          value={roomLocation}
          onChange={(e) => setRoomLocation(e.target.value)}
          placeholder={s.roomPlaceholder}
        />
      </FormField>

      {/* Notes */}
      <FormField label="Notes">
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={s.notesPlaceholder}
        />
      </FormField>

      {/* Conflict Details */}
      {conflicts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">
              {s.conflictsDetected}
            </div>
            <ul className="list-disc list-inside space-y-1">
              {conflicts.map((conflict, idx) => (
                <li key={idx}>{conflict.details}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </FormDialog>
  )
}
