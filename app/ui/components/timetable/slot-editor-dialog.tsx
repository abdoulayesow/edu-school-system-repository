"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { useI18n } from "@/components/i18n-provider"
import { Loader2, AlertTriangle } from "lucide-react"

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
          setError(data.message || (locale === 'fr' ? 'Conflit de planning détecté' : 'Schedule conflict detected'))
        } else {
          setError(data.message || (locale === 'fr' ? 'Échec de l\'enregistrement' : 'Failed to save'))
        }
        return
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error("Error saving schedule slot:", err)
      setError(locale === 'fr' ? 'Une erreur est survenue' : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!slot) return

    if (!confirm(locale === 'fr' ? 'Supprimer ce créneau?' : 'Delete this slot?')) {
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
        setError(data.message || (locale === 'fr' ? 'Échec de la suppression' : 'Failed to delete'))
        return
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error("Error deleting schedule slot:", err)
      setError(locale === 'fr' ? 'Une erreur est survenue' : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {slot
              ? (locale === 'fr' ? 'Modifier le créneau' : 'Edit Slot')
              : (locale === 'fr' ? 'Ajouter un créneau' : 'Add Slot')}
          </DialogTitle>
          <DialogDescription>
            {dayLabels[locale as 'en' | 'fr'][dayOfWeek as keyof typeof dayLabels.en]}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Is Break Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isBreak"
              checked={isBreak}
              onCheckedChange={(checked) => setIsBreak(checked === true)}
            />
            <Label htmlFor="isBreak" className="cursor-pointer">
              {locale === 'fr' ? 'Pause / Récréation' : 'Break / Recess'}
            </Label>
          </div>

          {/* Subject Selection (hidden if break) */}
          {!isBreak && (
            <div className="space-y-2">
              <Label htmlFor="gradeSubjectId">
                {locale === 'fr' ? 'Matière' : 'Subject'} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={gradeSubjectId}
                onValueChange={setGradeSubjectId}
                required={!isBreak}
              >
                <SelectTrigger id="gradeSubjectId">
                  <SelectValue placeholder={locale === 'fr' ? 'Sélectionner une matière' : 'Select subject'} />
                </SelectTrigger>
                <SelectContent>
                  {gradeSubjects.map((gs) => (
                    <SelectItem key={gs.id} value={gs.id}>
                      {locale === 'fr' ? gs.subject.nameFr : gs.subject.name} ({gs.subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Teacher Selection */}
          <div className="space-y-2">
            <Label htmlFor="teacherProfileId">
              {locale === 'fr' ? 'Enseignant' : 'Teacher'}
            </Label>
            <Select
              value={teacherProfileId}
              onValueChange={setTeacherProfileId}
            >
              <SelectTrigger id="teacherProfileId">
                <SelectValue placeholder={locale === 'fr' ? 'Sélectionner un enseignant' : 'Select teacher'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  {locale === 'fr' ? 'Aucun' : 'None'}
                </SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.person.firstName} {teacher.person.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Room Location */}
          <div className="space-y-2">
            <Label htmlFor="roomLocation">
              {locale === 'fr' ? 'Salle' : 'Room'}
            </Label>
            <Input
              id="roomLocation"
              value={roomLocation}
              onChange={(e) => setRoomLocation(e.target.value)}
              placeholder={locale === 'fr' ? 'Ex: Salle 101' : 'Ex: Room 101'}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              {locale === 'fr' ? 'Notes' : 'Notes'}
            </Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={locale === 'fr' ? 'Notes optionnelles' : 'Optional notes'}
            />
          </div>

          {/* Error Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Conflict Details */}
          {conflicts.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">
                  {locale === 'fr' ? 'Conflits détectés:' : 'Conflicts detected:'}
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {conflicts.map((conflict, idx) => (
                    <li key={idx}>{conflict.details}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2">
            {slot && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {locale === 'fr' ? 'Supprimer' : 'Delete'}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {locale === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {locale === 'fr' ? 'Enregistrer' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
