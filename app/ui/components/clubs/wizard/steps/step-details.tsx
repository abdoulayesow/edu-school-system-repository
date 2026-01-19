"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar, Coins, GraduationCap, Briefcase, Users } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { WizardStepProps, SchoolYearDates, LeaderOption, ClubLeaderType } from "../types"

export function StepDetails({ data, updateData, errors }: WizardStepProps) {
  const { t } = useI18n()
  const [leaders, setLeaders] = useState<LeaderOption[]>([])
  const [schoolYearDates, setSchoolYearDates] = useState<SchoolYearDates | null>(null)
  const [isLoadingLeaders, setIsLoadingLeaders] = useState(false)
  const [selectedRole, setSelectedRole] = useState<ClubLeaderType>(data.leaderType || "")

  // Role options configuration
  const roleOptions = [
    {
      value: "teacher" as ClubLeaderType,
      label: t.clubWizard.roleTeachers,
      icon: GraduationCap,
      description: "Faculty members and educators",
      endpoint: "/api/admin/teachers?limit=500",
    },
    {
      value: "staff" as ClubLeaderType,
      label: t.clubWizard.roleStaff,
      icon: Briefcase,
      description: "Administrative and support staff",
      endpoint: "/api/admin/staff-leaders",
    },
    {
      value: "student" as ClubLeaderType,
      label: t.clubWizard.roleStudents,
      icon: Users,
      description: "Student leaders and representatives",
      endpoint: "/api/admin/student-leaders",
    },
  ]

  // Fetch leaders when role selection changes
  useEffect(() => {
    if (!selectedRole) {
      setLeaders([])
      return
    }

    const roleConfig = roleOptions.find((r) => r.value === selectedRole)
    if (!roleConfig) return

    async function fetchLeaders() {
      setIsLoadingLeaders(true)
      try {
        const res = await fetch(roleConfig!.endpoint)
        const result = await res.json()

        // Transform based on role type
        let transformedLeaders: LeaderOption[] = []

        if (selectedRole === "teacher") {
          const teachers = result.teachers || result
          transformedLeaders = teachers.map((t: any) => ({
            id: t.id,
            name: `${t.firstName} ${t.lastName}`,
            type: "teacher" as ClubLeaderType,
            photoUrl: t.photoUrl,
          }))
        } else if (selectedRole === "staff") {
          transformedLeaders = result.map((s: any) => ({
            id: s.id,
            name: s.name,
            type: "staff" as ClubLeaderType,
            email: s.email,
            role: s.staffRole,
            photoUrl: s.photoUrl,
          }))
        } else if (selectedRole === "student") {
          transformedLeaders = result.map((s: any) => ({
            id: s.id,
            name: `${s.person.firstName} ${s.person.lastName}`,
            type: "student" as ClubLeaderType,
            grade: s.currentGrade?.name,
            photoUrl: s.person.photoUrl,
          }))
        }

        setLeaders(transformedLeaders)
      } catch (error) {
        console.error("Failed to fetch leaders:", error)
      } finally {
        setIsLoadingLeaders(false)
      }
    }

    fetchLeaders()
  }, [selectedRole])

  // Handle role selection
  function handleRoleSelect(role: ClubLeaderType) {
    setSelectedRole(role)
    updateData({ leaderType: role, leaderId: "" }) // Reset leader when role changes
  }

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
    <div className="space-y-8">
      {/* Leader Selection Section */}
      <div className="space-y-6">
        {/* Section Header */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {t.clubWizard.leaderRole}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.clubWizard.leaderRoleDescription}
          </p>
        </div>

        {/* Role Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roleOptions.map((role, index) => {
            const isSelected = selectedRole === role.value
            const Icon = role.icon

            return (
              <button
                key={role.value}
                type="button"
                onClick={() => handleRoleSelect(role.value)}
                className={cn(
                  "group relative overflow-hidden rounded-xl border-2 p-5 text-left transition-all duration-300",
                  "hover:shadow-lg hover:-translate-y-0.5",
                  isSelected
                    ? "border-[#D4AF37] bg-gradient-to-br from-amber-50/80 to-yellow-50/80 dark:from-amber-950/30 dark:to-yellow-950/30 shadow-md scale-[1.02]"
                    : "border-border bg-card hover:border-border/80 hover:bg-accent/50",
                  // Staggered animation on mount
                  "animate-fade-in-up",
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                    <div className="absolute top-2 right-2 w-3 h-3 bg-[#D4AF37] rounded-full shadow-lg animate-pulse" />
                  </div>
                )}

                {/* Icon container */}
                <div
                  className={cn(
                    "inline-flex items-center justify-center rounded-lg p-2.5 mb-3 transition-all duration-300",
                    isSelected
                      ? "bg-[#D4AF37] text-white shadow-md"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Role title */}
                <div className="space-y-1">
                  <div
                    className={cn(
                      "font-semibold text-base transition-colors",
                      isSelected
                        ? "text-amber-900 dark:text-amber-100"
                        : "text-foreground"
                    )}
                  >
                    {role.label}
                  </div>
                  <p
                    className={cn(
                      "text-xs leading-relaxed transition-colors",
                      isSelected
                        ? "text-amber-700 dark:text-amber-300"
                        : "text-muted-foreground"
                    )}
                  >
                    {role.description}
                  </p>
                </div>

                {/* Subtle accent border on hover */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none",
                    isSelected
                      ? "opacity-100 ring-2 ring-[#D4AF37]/30 ring-offset-2 ring-offset-background"
                      : "opacity-0 group-hover:opacity-50 ring-1 ring-primary/20"
                  )}
                />
              </button>
            )
          })}
        </div>

        {/* Leader Dropdown - Appears when role is selected */}
        <div
          className={cn(
            "transition-all duration-300 overflow-hidden",
            selectedRole
              ? "opacity-100 max-h-32 animate-fade-in-up"
              : "opacity-0 max-h-0 pointer-events-none"
          )}
        >
          <div className="space-y-2 pt-2">
            <Label htmlFor="leader" className="text-sm font-medium">
              {selectedRole && t.clubWizard.selectLeaderByRole.replace("{role}", roleOptions.find(r => r.value === selectedRole)?.label.toLowerCase() || "")}
              <span className="text-muted-foreground ml-1">(optional)</span>
            </Label>
            <Select
              value={data.leaderId}
              onValueChange={(value) => updateData({ leaderId: value })}
              disabled={!selectedRole}
            >
              <SelectTrigger
                id="leader"
                className={cn(
                  "h-12 transition-all duration-200",
                  errors.leaderId && "border-red-500 focus-visible:ring-red-500"
                )}
              >
                <SelectValue
                  placeholder={
                    isLoadingLeaders
                      ? "Loading..."
                      : leaders.length === 0
                      ? "No options available"
                      : "Select a leader"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {isLoadingLeaders ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : leaders.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No leaders available
                  </SelectItem>
                ) : (
                  leaders.map((leader) => (
                    <SelectItem key={leader.id} value={leader.id}>
                      <div className="flex items-center gap-2">
                        <span>{leader.name}</span>
                        {leader.role && (
                          <span className="text-xs text-muted-foreground">
                            ({leader.role})
                          </span>
                        )}
                        {leader.grade && (
                          <span className="text-xs text-muted-foreground">
                            ({leader.grade})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.leaderId && (
              <p className="text-sm text-red-500 animate-fade-in">
                {t[errors.leaderId as keyof typeof t] as string}
              </p>
            )}
            {errors.leaderType && (
              <p className="text-sm text-red-500 animate-fade-in">
                {t[errors.leaderType as keyof typeof t] as string}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t" />

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
