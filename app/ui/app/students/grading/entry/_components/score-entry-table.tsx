"use client"

import { useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { componentClasses } from "@/lib/design-tokens"
import type { GradeStudent, GradeEntry } from "@/lib/types/grading"

interface ScoreEntryTableProps {
  students: GradeStudent[]
  gradeEntries: Map<string, GradeEntry>
  maxScore: number
  onScoreChange: (studentProfileId: string, value: string) => void
  onNotesChange: (studentProfileId: string, value: string) => void
}

export function ScoreEntryTable({
  students,
  gradeEntries,
  maxScore,
  onScoreChange,
  onNotesChange,
}: ScoreEntryTableProps) {
  const { t } = useI18n()

  const scoreInputRefs = useRef<Map<string, HTMLInputElement>>(new Map())
  const notesInputRefs = useRef<Map<string, HTMLInputElement>>(new Map())

  const handleScoreKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, studentId: string, index: number) => {
      const studentIds = students.map((s) => s.studentProfileId)

      if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault()
        const nextIndex = index + 1
        if (nextIndex < studentIds.length) {
          scoreInputRefs.current.get(studentIds[nextIndex])?.focus()
        }
      } else if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault()
        const prevIndex = index - 1
        if (prevIndex >= 0) {
          notesInputRefs.current.get(studentIds[prevIndex])?.focus()
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        const nextIndex = index + 1
        if (nextIndex < studentIds.length) {
          scoreInputRefs.current.get(studentIds[nextIndex])?.focus()
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        const prevIndex = index - 1
        if (prevIndex >= 0) {
          scoreInputRefs.current.get(studentIds[prevIndex])?.focus()
        }
      }
    },
    [students]
  )

  const handleNotesKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, studentId: string, index: number) => {
      const studentIds = students.map((s) => s.studentProfileId)

      if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault()
        const nextIndex = index + 1
        if (nextIndex < studentIds.length) {
          scoreInputRefs.current.get(studentIds[nextIndex])?.focus()
        }
      } else if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault()
        scoreInputRefs.current.get(studentId)?.focus()
      }
    },
    [students]
  )

  if (students.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{t.grading.allStudents}</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className={componentClasses.tableHeaderRow}>
          <TableHead className="w-12">#</TableHead>
          <TableHead>{t.common.student}</TableHead>
          <TableHead className="w-32">
            {t.grading.score} ({t.grading.outOf} {maxScore})
          </TableHead>
          <TableHead>{t.grading.teacherRemark}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student, index) => {
          const entry = gradeEntries.get(student.studentProfileId)
          const score = entry?.score || ""
          const numScore = parseFloat(score)
          const isPassing = !isNaN(numScore) && numScore >= maxScore / 2

          return (
            <TableRow
              key={student.studentProfileId}
              className={cn(componentClasses.tableRowHover, "group")}
            >
              <TableCell className="text-muted-foreground">{index + 1}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {student.lastName} {student.firstName}
                  </div>
                  <div className="text-sm text-muted-foreground">{student.studentNumber}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Input
                    ref={(el) => {
                      if (el) scoreInputRefs.current.set(student.studentProfileId, el)
                    }}
                    type="number"
                    min="0"
                    max={maxScore}
                    step="0.5"
                    value={score}
                    onChange={(e) => onScoreChange(student.studentProfileId, e.target.value)}
                    onKeyDown={(e) => handleScoreKeyDown(e, student.studentProfileId, index)}
                    className={cn(
                      "w-20 transition-all",
                      "focus:ring-2 focus:ring-gspn-gold-500 focus:border-gspn-gold-500",
                      score !== ""
                        ? isPassing
                          ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                          : "border-red-500 bg-red-50/50 dark:bg-red-950/20"
                        : ""
                    )}
                    placeholder="--"
                  />
                  {score !== "" && (
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isPassing ? "text-green-600" : "text-red-600"
                      )}
                    >
                      /{maxScore}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Input
                  ref={(el) => {
                    if (el) notesInputRefs.current.set(student.studentProfileId, el)
                  }}
                  value={entry?.notes || ""}
                  onChange={(e) => onNotesChange(student.studentProfileId, e.target.value)}
                  onKeyDown={(e) => handleNotesKeyDown(e, student.studentProfileId, index)}
                  placeholder={t.grading.remarkPlaceholder}
                  className="max-w-md focus:ring-2 focus:ring-gspn-gold-500 focus:border-gspn-gold-500"
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
