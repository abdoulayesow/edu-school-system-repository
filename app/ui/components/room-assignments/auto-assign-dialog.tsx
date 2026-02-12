"use client"

import { useState, useEffect } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { FormDialog, FormField } from "@/components/ui/form-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

interface Room {
  id: string
  name: string
  displayName: string
  capacity: number
  isActive: boolean
  _count: {
    studentAssignments: number
  }
}

interface UnassignedStudent {
  id: string
  firstName: string
  lastName: string
  studentNumber?: string
  gender?: 'male' | 'female' | string
  dateOfBirth?: Date | string
  enrollmentDate?: Date | string
  isLocked: boolean
}

interface AutoAssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gradeId: string
  gradeName: string
  schoolYearId: string
  rooms: Room[]
  onSuccess: () => void
}

interface BalanceReport {
  roomDistributions: Array<{
    roomId: string
    roomName: string
    totalAssigned: number
    maleCount: number
    femaleCount: number
    unknownGenderCount: number
    averageAge: number | null
  }>
  overallGenderRatio: {
    male: number
    female: number
    unknown: number
  }
  balanceScore: number
}

// ============================================================================
// Component
// ============================================================================

export function AutoAssignDialog({
  open,
  onOpenChange,
  gradeId,
  gradeName,
  schoolYearId,
  rooms,
  onSuccess,
}: AutoAssignDialogProps) {
  const { t } = useI18n()

  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [unassignedStudents, setUnassignedStudents] = useState<UnassignedStudent[]>([])
  const [balanceReport, setBalanceReport] = useState<BalanceReport | null>(null)

  // Fetch unassigned students when dialog opens
  useEffect(() => {
    if (open) {
      fetchUnassignedStudents()
      setSelectedRoomIds(new Set())
      setError(null)
      setSuccessMessage(null)
      setBalanceReport(null)
    }
  }, [open, gradeId, schoolYearId])

  async function fetchUnassignedStudents() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/admin/room-assignments?gradeId=${gradeId}&schoolYearId=${schoolYearId}&unassigned=true`
      )

      if (!response.ok) {
        throw new Error(t.admin.roomAssignments.fetchError)
      }

      const data = await response.json()
      setUnassignedStudents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.roomAssignments.fetchError)
    } finally {
      setIsLoading(false)
    }
  }

  function toggleRoom(roomId: string) {
    const newSelected = new Set(selectedRoomIds)
    if (newSelected.has(roomId)) {
      newSelected.delete(roomId)
    } else {
      newSelected.add(roomId)
    }
    setSelectedRoomIds(newSelected)
  }

  function selectAllRooms() {
    setSelectedRoomIds(new Set(rooms.map(r => r.id)))
  }

  function deselectAllRooms() {
    setSelectedRoomIds(new Set())
  }

  // Calculate preview statistics
  const eligibleStudents = unassignedStudents.filter(s => !s.isLocked)
  const lockedCount = unassignedStudents.length - eligibleStudents.length
  const selectedRooms = rooms.filter(r => selectedRoomIds.has(r.id))
  const totalCapacity = selectedRooms.reduce((sum, r) => sum + (r.capacity - r._count.studentAssignments), 0)

  const maleCount = eligibleStudents.filter(s => s.gender === 'male').length
  const femaleCount = eligibleStudents.filter(s => s.gender === 'female').length
  const totalWithGender = maleCount + femaleCount

  const malePercentage = totalWithGender > 0 ? Math.round((maleCount / totalWithGender) * 100) : 50
  const femalePercentage = totalWithGender > 0 ? Math.round((femaleCount / totalWithGender) * 100) : 50

  const minPerRoom = selectedRooms.length > 0 ? Math.floor(Math.min(eligibleStudents.length, totalCapacity) / selectedRooms.length) : 0
  const maxPerRoom = selectedRooms.length > 0 ? Math.ceil(Math.min(eligibleStudents.length, totalCapacity) / selectedRooms.length) : 0

  async function handleAutoAssign() {
    if (selectedRoomIds.size === 0) {
      setError(t.admin.roomAssignments.noRoomsSelected)
      return
    }

    setIsAssigning(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/admin/room-assignments/auto-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeId,
          schoolYearId,
          roomIds: Array.from(selectedRoomIds)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t.admin.roomAssignments.autoAssignError)
      }

      setSuccessMessage(
        t.admin.roomAssignments.autoAssignSuccess.replace(
          '{count}',
          data.result.assignedCount.toString()
        )
      )
      setBalanceReport(data.result.balanceReport)

      // Refresh unassigned students
      await fetchUnassignedStudents()

      // Notify parent to refresh
      setTimeout(() => {
        onSuccess()
        if (data.result.unassignedCount === 0) {
          onOpenChange(false)
        }
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.roomAssignments.autoAssignError)
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.admin.roomAssignments.autoAssignDialogTitle}
      description={t.admin.roomAssignments.autoAssignDialogDescription}
      icon={Sparkles}
      accentColor="gold"
      maxWidth="sm:max-w-2xl"
      submitLabel={isAssigning
        ? t.admin.roomAssignments.autoAssigning
        : t.admin.roomAssignments.autoAssignButton.replace('{count}', eligibleStudents.length.toString())
      }
      submitIcon={Sparkles}
      onSubmit={handleAutoAssign}
      onCancel={() => onOpenChange(false)}
      isSubmitting={isAssigning}
      isDisabled={
        isLoading ||
        selectedRoomIds.size === 0 ||
        eligibleStudents.length === 0
      }
      error={error}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Room Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                {t.admin.roomAssignments.selectRoomsToAutoAssign}
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllRooms}
                  disabled={rooms.length === 0}
                >
                  {t.admin.roomAssignments.selectAllRooms}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deselectAllRooms}
                  disabled={selectedRoomIds.size === 0}
                >
                  {t.admin.roomAssignments.deselectAllRooms}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {rooms.map(room => {
                const currentCount = room._count.studentAssignments
                const availableSlots = room.capacity - currentCount
                return (
                  <div
                    key={room.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={`room-${room.id}`}
                      checked={selectedRoomIds.has(room.id)}
                      onCheckedChange={() => toggleRoom(room.id)}
                    />
                    <Label
                      htmlFor={`room-${room.id}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{room.displayName}</span>
                        <span className="text-sm text-muted-foreground">
                          {currentCount}/{room.capacity}
                          {availableSlots > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              {availableSlots}
                            </Badge>
                          )}
                          {availableSlots === 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {t.admin.roomAssignments.roomFull}
                            </Badge>
                          )}
                        </span>
                      </div>
                    </Label>
                  </div>
                )
              })}

              {rooms.length === 0 && (
                <Alert>
                  <AlertDescription>
                    {t.admin.roomAssignments.noRoomsAvailable}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <Separator />

          {/* Preview */}
          {!balanceReport && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                {t.admin.roomAssignments.previewTitle}
              </Label>

              <div className="p-4 rounded-xl bg-muted/50 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t.admin.roomAssignments.studentsToAssign.replace('{count}', eligibleStudents.length.toString())}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t.admin.roomAssignments.roomsSelected.replace('{count}', selectedRoomIds.size.toString())}
                  </span>
                </div>

                {selectedRoomIds.size > 0 && eligibleStudents.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t.admin.roomAssignments.studentsPerRoom
                        .replace('{min}', minPerRoom.toString())
                        .replace('{max}', maxPerRoom.toString())}
                    </span>
                  </div>
                )}

                {totalWithGender > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t.admin.roomAssignments.genderRatio
                        .replace('{male}', malePercentage.toString())
                        .replace('{female}', femalePercentage.toString())}
                    </span>
                  </div>
                )}

                {lockedCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-amber-600 dark:text-amber-500">
                      {t.admin.roomAssignments.lockedStudentsExcluded.replace('{count}', lockedCount.toString())}
                    </span>
                  </div>
                )}

                {lockedCount === 0 && unassignedStudents.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t.admin.roomAssignments.noLockedStudents}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Balance Report (after assignment) */}
          {balanceReport && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                {t.admin.roomAssignments.distributionSummary}
              </Label>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-emerald-900 dark:text-emerald-100">
                    {t.admin.roomAssignments.balanceScore
                      .replace('{score}', balanceReport.balanceScore.toString())}
                  </span>
                </div>

                <Separator className="bg-emerald-200 dark:bg-emerald-800" />

                <div className="space-y-2 text-sm">
                  {balanceReport.roomDistributions
                    .filter(d => d.totalAssigned > 0)
                    .map(dist => (
                      <div key={dist.roomId} className="flex items-center justify-between">
                        <span className="font-medium">{dist.roomName}</span>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>
                            {dist.totalAssigned}
                          </span>
                          <span className="text-xs">
                            ({dist.maleCount} ♂, {dist.femaleCount} ♀)
                          </span>
                          {dist.averageAge && (
                            <span className="text-xs">
                              {dist.averageAge}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className={cn(
              "p-4 rounded-xl border",
              "bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-950/10",
              "border-emerald-300 dark:border-emerald-700"
            )}>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {successMessage}
              </p>
            </div>
          )}
        </div>
      )}
    </FormDialog>
  )
}
