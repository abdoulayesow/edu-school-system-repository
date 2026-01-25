"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface EligibleStudent {
  id: string
  studentId: string
  person: {
    firstName: string
    lastName: string
    photoUrl?: string | null
  }
  grade: {
    id: string
    name: string
    nameFr: string
  }
}

interface EnrollStudentDialogProps {
  clubId: string
  clubName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EnrollStudentDialog({
  clubId,
  clubName,
  open,
  onOpenChange,
  onSuccess,
}: EnrollStudentDialogProps) {
  const { t, locale } = useI18n()
  const { toast } = useToast()
  const [students, setStudents] = useState<EligibleStudent[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(true)
  const [selectedStudentProfileId, setSelectedStudentProfileId] = useState<string>("")
  const [startMonth, setStartMonth] = useState<number>(1)
  const [totalMonths, setTotalMonths] = useState<number>(10)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (open) {
      fetchEligibleStudents()
    }
  }, [open, clubId])

  async function fetchEligibleStudents() {
    try {
      setIsLoadingStudents(true)
      const res = await fetch(`/api/admin/clubs/${clubId}/eligible-students`)
      if (!res.ok) throw new Error("Failed to fetch eligible students")
      const data = await res.json()
      setStudents(data.students || [])
    } catch (error) {
      console.error("Error fetching eligible students:", error)
      toast({
        title: t.common?.error || "Error",
        description: "Failed to load eligible students",
        variant: "destructive",
      })
    } finally {
      setIsLoadingStudents(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedStudentProfileId) {
      toast({
        title: t.common?.error || "Error",
        description: "Please select a student",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/admin/clubs/${clubId}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentProfileId: selectedStudentProfileId,
          startMonth,
          totalMonths,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to enroll student")
      }

      toast({
        title: t.common?.success || "Success",
        description: "Student enrolled successfully",
      })

      // Reset form and close dialog
      setSelectedStudentProfileId("")
      setStartMonth(1)
      setTotalMonths(10)
      setSearchQuery("")
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error("Error enrolling student:", error)
      toast({
        title: t.common?.error || "Error",
        description: error.message || "Failed to enroll student",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredStudents = students.filter((student) => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    const fullName = `${student.person.firstName} ${student.person.lastName}`.toLowerCase()
    return fullName.includes(searchLower)
  })

  const selectedStudent = students.find((s) => s.id === selectedStudentProfileId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {t.clubs?.enrollStudent || "Enroll Student"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {clubName}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Selection */}
          <div className="space-y-2">
            <Label htmlFor="student">
              {t.clubs?.selectStudent || "Select Student"} *
            </Label>

            {isLoadingStudents ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : students.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {t.clubs?.noEligibleStudents || "No eligible students available"}
                </p>
              </div>
            ) : (
              <>
                {/* Search Input */}
                <Input
                  type="text"
                  placeholder={t.common?.search || "Search..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-2"
                />

                {/* Student List */}
                <div className="max-h-[300px] overflow-y-auto border rounded-lg">
                  {filteredStudents.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {t.common?.noResults || "No results found"}
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredStudents.map((student) => {
                        const isSelected = selectedStudentProfileId === student.id
                        const gradeName = locale === "fr" && student.grade.nameFr
                          ? student.grade.nameFr
                          : student.grade.name

                        return (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => setSelectedStudentProfileId(student.id)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50",
                              isSelected && "bg-violet-50 dark:bg-violet-900/20"
                            )}
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={student.person.photoUrl || undefined} />
                              <AvatarFallback>
                                {student.person.firstName[0]}
                                {student.person.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">
                                {student.person.firstName} {student.person.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {gradeName}
                              </p>
                            </div>
                            {isSelected && (
                              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-violet-600 dark:bg-violet-500 flex items-center justify-center">
                                <svg
                                  className="h-3 w-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Selected Student Summary */}
          {selectedStudent && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium mb-1">
                {t.clubs?.selectedStudent || "Selected Student"}:
              </p>
              <p className="text-sm">
                {selectedStudent.person.firstName} {selectedStudent.person.lastName} -{" "}
                {locale === "fr" && selectedStudent.grade.nameFr
                  ? selectedStudent.grade.nameFr
                  : selectedStudent.grade.name}
              </p>
            </div>
          )}

          {/* Enrollment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startMonth">
                {t.clubs?.startMonth || "Start Month"} *
              </Label>
              <Input
                id="startMonth"
                type="number"
                min={1}
                max={12}
                value={startMonth}
                onChange={(e) => setStartMonth(parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalMonths">
                {t.clubs?.totalMonths || "Total Months"} *
              </Label>
              <Input
                id="totalMonths"
                type="number"
                min={1}
                max={12}
                value={totalMonths}
                onChange={(e) => setTotalMonths(parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t.common?.cancel || "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={!selectedStudentProfileId || isSubmitting || students.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.common?.saving || "Saving..."}
                </>
              ) : (
                t.clubs?.enrollStudent || "Enroll Student"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
