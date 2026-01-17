"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar, Coins, User } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { WizardStepProps, SchoolYearDates } from "../types"

export function StepDetails({ data, updateData, errors }: WizardStepProps) {
  const { t } = useI18n()
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([])
  const [schoolYearDates, setSchoolYearDates] = useState<SchoolYearDates | null>(null)
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true)

  // Fetch teachers
  useEffect(() => {
    async function fetchTeachers() {
      try {
        const res = await fetch("/api/admin/teachers?limit=500")
        const result = await res.json()
        const teacherList = (result.teachers || result).map((t: any) => ({
          id: t.id,
          name: `${t.firstName} ${t.lastName}`,
        }))
        setTeachers(teacherList)
      } catch (error) {
        console.error("Failed to fetch teachers:", error)
      } finally {
        setIsLoadingTeachers(false)
      }
    }
    fetchTeachers()
  }, [])

  // Fetch school year dates
  useEffect(() => {
    async function fetchSchoolYear() {
      try {
        const res = await fetch("/api/admin/school-years")
        const years = await res.json()
        const activeYear = years.find((y: any) => y.isActive)
        if (activeYear) {
          setSchoolYearDates({
            startDate: activeYear.startDate,
            endDate: activeYear.endDate,
            id: activeYear.id,
          })
          // Set school year ID
          updateData({ schoolYearId: activeYear.id })
        }
      } catch (error) {
        console.error("Failed to fetch school year:", error)
      }
    }
    fetchSchoolYear()
  }, [])

  // Auto-populate dates when toggle is enabled
  useEffect(() => {
    if (data.followSchoolYear && schoolYearDates) {
      updateData({
        startDate: formatDateForInput(schoolYearDates.startDate),
        endDate: formatDateForInput(schoolYearDates.endDate),
      })
    }
  }, [data.followSchoolYear, schoolYearDates])

  function formatDateForInput(dateString: string): string {
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "closed", label: "Closed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Club Leader */}
      <div className="space-y-2">
        <Label htmlFor="leader" className="text-sm font-semibold flex items-center gap-2">
          <User className="h-4 w-4" />
          {t.clubWizard.leader}
        </Label>
        <Select
          value={data.leaderId}
          onValueChange={(value) => updateData({ leaderId: value })}
        >
          <SelectTrigger id="leader" className="h-12">
            <SelectValue placeholder={t.clubWizard.selectLeader} />
          </SelectTrigger>
          <SelectContent>
            {isLoadingTeachers ? (
              <SelectItem value="loading" disabled>
                Loading teachers...
              </SelectItem>
            ) : teachers.length === 0 ? (
              <SelectItem value="none" disabled>
                No teachers available
              </SelectItem>
            ) : (
              teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Currently only teachers can be club leaders
        </p>
      </div>

      {/* Follow School Year Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-amber-600" />
            <div>
              <div className="font-semibold">{t.clubWizard.followSchoolYear}</div>
              <div className="text-sm text-muted-foreground">
                {t.clubWizard.followSchoolYearHint}
              </div>
            </div>
          </div>
          <Switch
            checked={data.followSchoolYear}
            onCheckedChange={(checked) => updateData({ followSchoolYear: checked })}
          />
        </div>

        {/* Date Inputs */}
        <div
          className={cn(
            "grid md:grid-cols-2 gap-4 transition-all duration-300 overflow-hidden",
            data.followSchoolYear ? "opacity-50 pointer-events-none" : "opacity-100"
          )}
        >
          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-semibold">
              {t.clubWizard.startDate}
            </Label>
            <Input
              id="startDate"
              type="date"
              value={data.startDate}
              onChange={(e) => updateData({ startDate: e.target.value })}
              disabled={data.followSchoolYear}
              className="h-12"
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-semibold">
              {t.clubWizard.endDate}
            </Label>
            <Input
              id="endDate"
              type="date"
              value={data.endDate}
              onChange={(e) => updateData({ endDate: e.target.value })}
              disabled={data.followSchoolYear}
              className={cn(
                "h-12",
                errors.endDate && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            {errors.endDate && (
              <p className="text-sm text-red-500">
                {String(t[errors.endDate as keyof typeof t])}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Capacity and Status */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Capacity */}
        <div className="space-y-2">
          <Label htmlFor="capacity" className="text-sm font-semibold">
            {t.clubWizard.capacity} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="capacity"
            type="number"
            min={1}
            value={data.capacity}
            onChange={(e) => updateData({ capacity: parseInt(e.target.value) || 1 })}
            className={cn(
              "h-12",
              errors.capacity && "border-red-500 focus-visible:ring-red-500"
            )}
          />
          {errors.capacity && (
            <p className="text-sm text-red-500">
              {String(t[errors.capacity as keyof typeof t])}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-semibold">
            {t.clubWizard.status} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.status}
            onValueChange={(value) => updateData({ status: value as any })}
          >
            <SelectTrigger id="status" className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fees - Split Panel */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Monthly Fee - REQUIRED (emphasized) */}
        <div className="relative p-5 rounded-xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-400 dark:border-amber-600 shadow-lg">
          <div className="absolute -top-3 left-4 px-2 bg-amber-500 text-white text-xs font-bold rounded-full uppercase">
            Required
          </div>
          <Label
            htmlFor="monthlyFee"
            className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-100"
          >
            <Coins className="h-5 w-5" />
            {t.clubWizard.monthlyFee}
          </Label>
          <Input
            id="monthlyFee"
            type="number"
            min={0}
            value={data.monthlyFee}
            onChange={(e) =>
              updateData({ monthlyFee: parseInt(e.target.value) || 0 })
            }
            className={cn(
              "mt-2 h-12 text-lg font-mono border-2 border-amber-300",
              errors.monthlyFee && "border-red-500 focus-visible:ring-red-500"
            )}
            placeholder="0"
          />
          {errors.monthlyFee && (
            <p className="text-sm text-red-500 mt-1">
              {String(t[errors.monthlyFee as keyof typeof t])}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {t.clubWizard.monthlyFeeRequired}
          </p>
        </div>

        {/* One-time Fee - Optional (subdued) */}
        <div className="p-5 rounded-xl bg-muted/30 border border-border">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="oneTimeFee" className="text-muted-foreground">
              {t.clubWizard.oneTimeFee}
            </Label>
            <span className="text-xs bg-muted px-2 py-0.5 rounded">
              {t.clubWizard.oneTimeFeeOptional}
            </span>
          </div>
          <Input
            id="oneTimeFee"
            type="number"
            min={0}
            value={data.fee}
            onChange={(e) => updateData({ fee: parseInt(e.target.value) || 0 })}
            className="mt-2 h-12 font-mono"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  )
}
