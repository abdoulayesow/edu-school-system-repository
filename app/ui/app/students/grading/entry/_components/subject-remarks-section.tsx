"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PermissionGuard } from "@/components/permission-guard"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { componentClasses } from "@/lib/design-tokens"
import { getScoreColor } from "@/lib/grading-utils"
import type { ActiveTrimester, SubjectAverage, RawSubjectAverageResponse } from "@/lib/types/grading"
import { Save, Loader2, MessageSquare, AlertCircle } from "lucide-react"

interface SubjectRemarksSectionProps {
  activeTrimester: ActiveTrimester
  selectedGradeId: string
  selectedSubjectId: string
  subjectLabel: string
}

export function SubjectRemarksSection({
  activeTrimester,
  selectedGradeId,
  selectedSubjectId,
  subjectLabel,
}: SubjectRemarksSectionProps) {
  const { t } = useI18n()
  const { toast } = useToast()

  const [averages, setAverages] = useState<SubjectAverage[]>([])
  const [remarks, setRemarks] = useState<Map<string, string>>(new Map())
  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchAverages = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        trimesterId: activeTrimester.id,
        gradeId: selectedGradeId,
        gradeSubjectId: selectedSubjectId,
      })

      const res = await fetch(`/api/evaluations/calculate-averages?${params}`)
      if (res.ok) {
        const data = await res.json()
        const transformed: SubjectAverage[] = data.map((avg: RawSubjectAverageResponse) => ({
          id: avg.id,
          studentProfileId: avg.studentProfileId,
          studentName: avg.studentName || "",
          studentNumber: avg.studentNumber || "",
          average: avg.average,
          teacherRemark: avg.teacherRemark,
        }))
        setAverages(transformed)

        const remarksMap = new Map<string, string>()
        transformed.forEach((avg) => {
          remarksMap.set(avg.id, avg.teacherRemark || "")
        })
        setRemarks(remarksMap)
        setHasChanges(false)
      }
    } catch (err) {
      console.error("Error fetching averages:", err)
    } finally {
      setIsLoading(false)
    }
  }, [activeTrimester.id, selectedGradeId, selectedSubjectId])

  useEffect(() => {
    fetchAverages()
  }, [fetchAverages])

  function handleRemarkChange(averageId: string, value: string) {
    setRemarks((prev) => {
      const newRemarks = new Map(prev)
      newRemarks.set(averageId, value)
      return newRemarks
    })
    setHasChanges(true)
  }

  async function handleSaveRemarks() {
    setIsSubmitting(true)
    try {
      const updates = Array.from(remarks.entries()).map(([id, remark]) => ({
        subjectAverageId: id,
        teacherRemark: remark || null,
      }))

      const res = await fetch("/api/evaluations/subject-averages/remarks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      })

      if (res.ok) {
        toast({
          title: t.common.success,
          description: t.grading.remarksSaved,
        })
        setHasChanges(false)
      } else {
        const data = await res.json()
        toast({
          title: t.common.error,
          description: data.message || t.grading.failedToSaveRemarks,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error saving remarks:", err)
      toast({
        title: t.common.error,
        description: t.grading.failedToSaveRemarks,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-gspn-maroon-500" />
        </CardContent>
      </Card>
    )
  }

  if (averages.length === 0) {
    return null
  }

  return (
    <Card className="border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
            <MessageSquare className="h-4 w-4 text-gspn-maroon-500" />
            {t.grading.subjectRemarks}
          </CardTitle>
          <CardDescription>
            {subjectLabel} — {averages.length} {t.common.students}
            {hasChanges && (
              <span className="ml-2 text-yellow-600">• {t.grading.unsavedChanges}</span>
            )}
          </CardDescription>
        </div>
        <PermissionGuard resource="report_cards" action="update" inline>
          <Button
            onClick={handleSaveRemarks}
            disabled={!hasChanges || isSubmitting}
            className={componentClasses.primaryActionButton}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t.grading.saveRemarks}
          </Button>
        </PermissionGuard>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className={componentClasses.tableHeaderRow}>
              <TableHead className="w-12">#</TableHead>
              <TableHead>{t.common.student}</TableHead>
              <TableHead className="w-24 text-center">{t.grading.average}</TableHead>
              <TableHead>{t.grading.teacherRemark}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {averages.map((avg, index) => (
              <TableRow key={avg.id} className={componentClasses.tableRowHover}>
                <TableCell className="text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{avg.studentName}</div>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`font-medium ${getScoreColor(avg.average)}`}>
                    {avg.average !== null ? avg.average.toFixed(2) : "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <Textarea
                    value={remarks.get(avg.id) || ""}
                    onChange={(e) => handleRemarkChange(avg.id, e.target.value)}
                    placeholder={t.grading.remarkPlaceholder}
                    className="min-h-[60px]"
                    rows={2}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
