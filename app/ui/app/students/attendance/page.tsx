"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, XCircle, CalendarCheck, TrendingUp } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { StatCard } from "@/components/students"
import { useGrades } from "@/hooks/use-grades"
import { useAttendanceState, type EntryMode } from "@/hooks/use-attendance-state"
import { useAttendanceSummary } from "@/hooks/use-attendance-summary"
import { AttendanceHeader } from "@/components/attendance/attendance-header"
import { AttendanceFilters } from "@/components/attendance/attendance-filters"
import { AttendanceSelectionView } from "@/components/attendance/attendance-selection-view"
import { AttendanceRecording } from "@/components/attendance/attendance-recording"
import { ConfirmationDialog } from "@/components/attendance/confirmation-dialog"

export default function AttendancePage() {
  const { t, locale } = useI18n()

  // Selection state
  const [selectedGradeId, setSelectedGradeId] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [entryMode, setEntryMode] = useState<EntryMode>("checklist")

  // Recording state
  const [isRecording, setIsRecording] = useState(false)

  // Confirmation dialogs
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showNavigateAwayConfirm, setShowNavigateAwayConfirm] = useState(false)

  // Custom hooks
  const { grades, isLoading: isLoadingGrades, error: gradesError } = useGrades()
  const {
    attendanceData,
    localAttendance,
    isLoading: isLoadingAttendance,
    isSaving,
    error: attendanceError,
    fetchAttendance,
    initializeAttendance,
    toggleStatus,
    saveAttendance,
    setError,
  } = useAttendanceState(entryMode)

  const currentSummary = useAttendanceSummary(
    attendanceData?.students,
    localAttendance,
    entryMode
  )

  // Fetch attendance when grade and date change
  useEffect(() => {
    if (!selectedGradeId || selectedGradeId === "all" || !selectedDate) return

    fetchAttendance(selectedGradeId, selectedDate).then(data => {
      if (data?.session) {
        setEntryMode(data.session.entryMode)
        setIsRecording(true)
      } else {
        setIsRecording(false)
      }
    })
  }, [selectedGradeId, selectedDate, fetchAttendance])

  // Start recording attendance
  const handleStartRecording = () => {
    if (!attendanceData) return
    initializeAttendance(attendanceData.students)
    setIsRecording(true)
  }

  // Handle back navigation with unsaved changes check
  const handleBack = () => {
    if (attendanceData?.session && !attendanceData.session.isComplete) {
      setShowNavigateAwayConfirm(true)
    } else {
      setIsRecording(false)
    }
  }

  const confirmNavigateAway = () => {
    setIsRecording(false)
    setShowNavigateAwayConfirm(false)
  }

  // Handle save (draft)
  const handleSave = async () => {
    const success = await saveAttendance(selectedGradeId, selectedDate, false)
    if (success) {
      // Optionally show success toast
    }
  }

  // Handle submit (complete) with confirmation
  const handleSubmit = () => {
    setShowSubmitConfirm(true)
  }

  const confirmSubmit = async () => {
    const success = await saveAttendance(selectedGradeId, selectedDate, true)
    if (success) {
      setIsRecording(false)
      setShowSubmitConfirm(false)
    }
  }

  // Calculate summary stats for cards
  const attendanceStats = useMemo(() => {
    if (!currentSummary) {
      return {
        totalSessions: 0,
        avgAttendanceRate: 0,
        presentToday: 0,
        absentToday: 0
      }
    }

    const total = currentSummary.total
    const present = currentSummary.present + currentSummary.late + currentSummary.excused
    const avgRate = total > 0 ? Math.round((present / total) * 100) : 0

    return {
      totalSessions: 1,
      avgAttendanceRate: avgRate,
      presentToday: currentSummary.present + currentSummary.late + currentSummary.excused,
      absentToday: currentSummary.absent
    }
  }, [currentSummary])

  const selectedGrade = grades.find(g => g.id === selectedGradeId)
  const error = gradesError || attendanceError

  return (
    <PageContainer maxWidth="full">
      {/* Page Header with GSPN Brand Styling */}
      <AttendanceHeader />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title={t.attendance.totalSessions}
          value={attendanceStats.totalSessions}
          description={t.attendance.attendanceSessions}
          icon={CalendarCheck}
        />
        <StatCard
          title={t.attendance.averageAttendanceRate}
          value={`${attendanceStats.avgAttendanceRate}%`}
          description={t.attendance.overallRate}
          icon={TrendingUp}
        />
        <StatCard
          title={t.attendance.presentToday}
          value={attendanceStats.presentToday}
          description={t.attendance.studentsPresent}
          icon={CheckCircle2}
        />
        <StatCard
          title={t.attendance.absentToday}
          value={attendanceStats.absentToday}
          description={t.attendance.studentsAbsent}
          icon={XCircle}
        />
      </div>

      {/* Filters (only shown in selection mode) */}
      {!isRecording && (
        <AttendanceFilters
          grades={grades}
          isLoadingGrades={isLoadingGrades}
          selectedGradeId={selectedGradeId}
          selectedDate={selectedDate}
          entryMode={entryMode}
          onGradeChange={setSelectedGradeId}
          onDateChange={setSelectedDate}
          onEntryModeChange={setEntryMode}
        />
      )}

      {/* Main Content - Toggle between Selection and Recording Views */}
      {!isRecording ? (
        <AttendanceSelectionView
          attendanceData={attendanceData}
          entryMode={entryMode}
          selectedGradeId={selectedGradeId}
          selectedDate={selectedDate}
          locale={locale}
          isLoadingAttendance={isLoadingAttendance}
          onStartRecording={handleStartRecording}
        />
      ) : (
        attendanceData && currentSummary && (
          <AttendanceRecording
            gradeName={selectedGrade?.name || attendanceData.grade.name}
            date={selectedDate}
            locale={locale}
            students={attendanceData.students}
            localAttendance={localAttendance}
            currentSummary={currentSummary}
            entryMode={entryMode}
            isSaving={isSaving}
            onBack={handleBack}
            onToggleStatus={toggleStatus}
            onSave={handleSave}
            onSubmit={handleSubmit}
          />
        )
      )}

      {/* Error Display */}
      {error && (
        <Card className="mt-4 border-destructive">
          <CardContent className="pt-4 pb-4 text-center text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
        title={t.attendance.confirmSubmitTitle}
        description={t.attendance.confirmSubmitDescription}
        confirmText={t.attendance.confirm}
        cancelText={t.attendance.cancel}
        onConfirm={confirmSubmit}
        variant="default"
      />

      <ConfirmationDialog
        open={showNavigateAwayConfirm}
        onOpenChange={setShowNavigateAwayConfirm}
        title={t.attendance.confirmNavigateAwayTitle}
        description={t.attendance.confirmNavigateAwayDescription}
        confirmText={t.attendance.confirm}
        cancelText={t.attendance.cancel}
        onConfirm={confirmNavigateAway}
        variant="destructive"
      />
    </PageContainer>
  )
}
