"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import {
  Loader2,
  Search,
  User,
  GraduationCap,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  UserCircle,
  Users,
  Sparkles,
  X,
} from "lucide-react"
import { usePaymentWizard } from "../wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { useGrades } from "@/lib/hooks/use-api"
import { cn, formatDateLong } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/currency"
import { sizing, typography, gradients, interactive } from "@/lib/design-tokens"
import { Button } from "@/components/ui/button"

interface StudentSearchResult {
  id: string
  studentNumber: string
  firstName: string
  lastName: string
  fullName: string
  photoUrl?: string
  grade?: { id: string; name: string }
  enrollmentId?: string
  balanceInfo?: {
    tuitionFee: number
    totalPaid: number
    remainingBalance: number
  }
}

export function StepStudentSelection() {
  const { t, locale } = useI18n()
  const { state, loadStudent, updateData } = usePaymentWizard()
  const { data, isFullyPaid } = state
  const { data: gradesData } = useGrades()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [balanceStatusFilter, setBalanceStatusFilter] = useState<string>("outstanding")
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get grades list
  const grades = gradesData?.grades || []

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Perform search with current filters
  const performSearch = useCallback(async (query: string, grade: string, balanceStatus: string) => {
    if (query.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    setIsSearching(true)
    try {
      const params = new URLSearchParams({
        q: query,
        limit: "10",
      })
      if (grade && grade !== "all") {
        params.set("gradeId", grade)
      }
      if (balanceStatus && balanceStatus !== "all") {
        params.set("balanceStatus", balanceStatus)
      }
      const response = await fetch(`/api/students/search?${params.toString()}`)
      if (response.ok) {
        const responseData = await response.json()
        setSearchResults(responseData.students || [])
        setShowDropdown(true)
      }
    } catch (err) {
      console.error("Search failed:", err)
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Handle search input change with debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value, gradeFilter, balanceStatusFilter)
    }, 300)
  }

  // Re-search when filters change (only if there's a search query)
  useEffect(() => {
    if (searchQuery.length >= 2) {
      // Clear timeout to avoid duplicate searches
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      performSearch(searchQuery, gradeFilter, balanceStatusFilter)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradeFilter, balanceStatusFilter])

  // Check if any filter is active
  const hasActiveFilters = gradeFilter !== "all" || balanceStatusFilter !== "all"

  // Clear all filters
  const clearFilters = () => {
    setGradeFilter("all")
    setBalanceStatusFilter("all")
  }

  // Load full balance data when student is selected
  const handleSelectStudent = async (student: StudentSearchResult) => {
    setShowDropdown(false)
    setSearchQuery(student.fullName)
    setIsLoadingBalance(true)

    try {
      // Fetch full balance info
      const response = await fetch(`/api/students/${student.id}/balance`)
      if (response.ok) {
        const balanceData = await response.json()

        // Map schedule progress to our format
        const scheduleProgress = (balanceData.scheduleProgress || []).map((s: {
          id: string
          scheduleNumber: number
          amount: number
          paidAmount: number
          remainingAmount: number
          isPaid: boolean
          dueDate: string
          months: string[]
        }) => ({
          id: s.id,
          scheduleNumber: s.scheduleNumber,
          amount: s.amount,
          paidAmount: s.paidAmount,
          remainingAmount: s.remainingAmount,
          isPaid: s.isPaid,
          dueDate: s.dueDate,
          months: s.months || [],
        }))

        // Map previous payments
        const previousPayments = (balanceData.payments || [])
          .filter((p: { status: string }) => p.status === "confirmed")
          .map((p: {
            id: string
            amount: number
            method: "cash" | "orange_money"
            receiptNumber: string
            recordedAt: string
            recorder?: { name: string }
          }) => ({
            id: p.id,
            amount: p.amount,
            method: p.method,
            receiptNumber: p.receiptNumber,
            recordedAt: p.recordedAt,
            recorderName: p.recorder?.name,
          }))

        // Prepare enrollment payer info
        const enrollmentPayerInfo = {
          fatherName: balanceData.enrollment?.fatherName,
          fatherPhone: balanceData.enrollment?.fatherPhone,
          fatherEmail: balanceData.enrollment?.fatherEmail,
          motherName: balanceData.enrollment?.motherName,
          motherPhone: balanceData.enrollment?.motherPhone,
          motherEmail: balanceData.enrollment?.motherEmail,
          enrollingPersonType: balanceData.enrollment?.enrollingPersonType,
          enrollingPersonName: balanceData.enrollment?.enrollingPersonName,
          enrollingPersonRelation: balanceData.enrollment?.enrollingPersonRelation,
          enrollingPersonPhone: balanceData.enrollment?.enrollingPersonPhone,
          enrollingPersonEmail: balanceData.enrollment?.enrollingPersonEmail,
        }

        // Load student data into wizard
        loadStudent({
          studentId: student.id,
          studentNumber: student.studentNumber,
          studentFirstName: student.firstName,
          studentMiddleName: balanceData.student?.middleName,
          studentLastName: student.lastName,
          studentPhotoUrl: balanceData.student?.photoUrl || student.photoUrl,
          studentDateOfBirth: balanceData.student?.dateOfBirth,
          studentGender: balanceData.student?.gender,
          studentPhone: balanceData.student?.phone,
          studentEmail: balanceData.student?.email,
          studentAddress: balanceData.enrollment?.address,
          enrollmentId: balanceData.enrollment?.id,
          gradeId: balanceData.enrollment?.grade?.id,
          gradeName: balanceData.enrollment?.grade?.name,
          schoolYearId: balanceData.enrollment?.schoolYear?.id,
          schoolYearName: balanceData.enrollment?.schoolYear?.name,
          tuitionFee: balanceData.balance?.tuitionFee || 0,
          totalPaid: balanceData.balance?.totalPaid || 0,
          remainingBalance: balanceData.balance?.remainingBalance || 0,
          paymentStatus: balanceData.balance?.paymentStatus || "on_time",
          expectedPaymentPercentage: balanceData.balance?.expectedPaymentPercentage || 0,
          actualPaymentPercentage: balanceData.balance?.paymentPercentage || 0,
          scheduleProgress,
          previousPayments,
          enrollmentPayerInfo,
        })
      }
    } catch (err) {
      console.error("Failed to load balance:", err)
    } finally {
      setIsLoadingBalance(false)
    }
  }

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
            <CheckCircle2 className={`${sizing.icon.xs} mr-1`} />
            {locale === "fr" ? "Payé" : "Paid"}
          </Badge>
        )
      case "in_advance":
        return (
          <Badge className="bg-nav-highlight/20 text-nav-highlight dark:bg-gspn-gold-900/30 dark:text-gspn-gold-200 border-0">
            {locale === "fr" ? "En avance" : "In Advance"}
          </Badge>
        )
      case "late":
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
            <AlertCircle className={`${sizing.icon.xs} mr-1`} />
            {locale === "fr" ? "En retard" : "Late"}
          </Badge>
        )
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-0">
            {locale === "fr" ? "À jour" : "On Time"}
          </Badge>
        )
    }
  }

  // Format full name including middle name
  const formatFullName = () => {
    const parts = [data.studentFirstName, data.studentMiddleName, data.studentLastName].filter(Boolean)
    return parts.join(" ")
  }

  // Format gender label
  const formatGender = (gender?: string) => {
    if (!gender) return null
    if (locale === "fr") {
      return gender === "male" ? "Masculin" : "Féminin"
    }
    return gender === "male" ? "Male" : "Female"
  }

  return (
    <div className="space-y-6">
      {/* Unified Search & Filter Bar */}
      <div className="relative" ref={dropdownRef}>
        {/* Single-line search + filters - unified surface */}
        <div className="flex items-center h-12 rounded-lg border bg-background shadow-sm overflow-hidden transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/20">
          {/* Search Input - primary action area */}
          <div className="relative flex-1 min-w-0 h-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
            <Input
              id="student-search"
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              placeholder={t?.paymentWizard?.searchPlaceholder || "Enter student name or number..."}
              className="h-full pl-10 pr-3 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-primary" />
            )}
          </div>

          {/* Filters section - grouped with subtle separator */}
          <div className="flex items-center h-full border-l bg-muted/30">
            {/* Grade Filter */}
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className={cn(
                "h-full w-[120px] rounded-none border-0 bg-transparent px-3 text-xs font-medium transition-colors",
                "focus:ring-0 focus:ring-offset-0 focus:bg-muted/50",
                "[&>svg:last-child]:size-3 [&>svg:last-child]:opacity-50",
                gradeFilter !== "all" && "bg-primary/5 text-primary"
              )}>
                <GraduationCap className={cn(
                  "size-3.5 mr-1.5 shrink-0",
                  gradeFilter !== "all" ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="truncate">
                  {gradeFilter === "all"
                    ? (t?.accounting?.allGrades || "Grade")
                    : grades.find(g => g.id === gradeFilter)?.name || "Grade"}
                </span>
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">{t?.accounting?.allGrades || "All grades"}</SelectItem>
                {grades.map((grade) => (
                  <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Subtle divider between filters */}
            <div className="h-5 w-px bg-border/50" />

            {/* Balance Filter */}
            <Select value={balanceStatusFilter} onValueChange={setBalanceStatusFilter}>
              <SelectTrigger className={cn(
                "h-full w-[130px] rounded-none border-0 bg-transparent px-3 text-xs font-medium transition-colors",
                "focus:ring-0 focus:ring-offset-0 focus:bg-muted/50",
                "[&>svg:last-child]:size-3 [&>svg:last-child]:opacity-50",
                balanceStatusFilter === "outstanding" && "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
                balanceStatusFilter === "paid_up" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              )}>
                {balanceStatusFilter === "outstanding" ? (
                  <span className="size-2 rounded-full bg-amber-500 mr-1.5 shrink-0" />
                ) : balanceStatusFilter === "paid_up" ? (
                  <span className="size-2 rounded-full bg-emerald-500 mr-1.5 shrink-0" />
                ) : (
                  <Wallet className="size-3.5 mr-1.5 text-muted-foreground shrink-0" />
                )}
                <span className="truncate">
                  {balanceStatusFilter === "all"
                    ? (t?.accounting?.allBalances || "Balance")
                    : balanceStatusFilter === "outstanding"
                      ? (t?.accounting?.outstandingBalance || "Outstanding")
                      : (t?.accounting?.paidUp || "Paid")}
                </span>
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">{t?.accounting?.allBalances || "All balances"}</SelectItem>
                <SelectItem value="outstanding">
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                    {t?.accounting?.outstandingBalance || "Outstanding"}
                  </span>
                </SelectItem>
                <SelectItem value="paid_up">
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                    {t?.accounting?.paidUp || "Paid up"}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Clear filters - only when active */}
            {hasActiveFilters && (
              <>
                <div className="h-5 w-px bg-border/50" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-full px-3 rounded-none text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                >
                  <X className="size-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <Card className="absolute left-0 right-0 top-full mt-2 z-50 shadow-xl border max-h-[320px] overflow-auto animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <CardContent className="p-1">
              {searchResults.map((student) => (
                <button
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-md text-left",
                    "hover:bg-accent transition-colors",
                    student.id === data.studentId && "bg-accent"
                  )}
                >
                  <Avatar className={sizing.avatar.md}>
                    <AvatarImage src={student.photoUrl} alt={student.fullName} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {student.firstName[0]}{student.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{student.fullName}</span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {student.studentNumber}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {student.grade && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className={sizing.icon.xs} />
                          {student.grade.name}
                        </span>
                      )}
                      {student.balanceInfo && (
                        <span className={cn(
                          "flex items-center gap-1",
                          student.balanceInfo.remainingBalance === 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                        )}>
                          <Wallet className={sizing.icon.xs} />
                          {student.balanceInfo.remainingBalance === 0
                            ? (locale === "fr" ? "Payé" : "Paid")
                            : formatCurrency(student.balanceInfo.remainingBalance)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Loading Balance */}
      {isLoadingBalance && (
        <Card className="border-dashed border-2">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className={`${sizing.icon.lg} animate-spin`} />
              <span className="text-sm">{t?.common?.loading || "Loading student information..."}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Student - Complete Profile Display */}
      {data.studentId && !isLoadingBalance && (
        <div className="space-y-4">
          {/* Student Identity Card - Hero Section */}
          <Card className={cn(
            "border-2 shadow-lg overflow-hidden relative",
            isFullyPaid
              ? cn(gradients.safe.light, gradients.safe.dark, gradients.safe.border)
              : "border-primary/30 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950"
          )}>
            {/* Decorative gradient overlay */}
            <div className={cn(
              "absolute inset-0 pointer-events-none",
              isFullyPaid
                ? "bg-gradient-to-br from-amber-500/5 via-transparent to-yellow-500/5"
                : "bg-gradient-to-br from-primary/5 via-transparent to-primary/5"
            )} />

            {/* Sparkle decorations for fully paid */}
            {isFullyPaid && (
              <>
                <div className="absolute top-4 right-8 opacity-60">
                  <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                </div>
                <div className="absolute bottom-8 left-12 opacity-40">
                  <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" style={{ animationDelay: "0.5s" }} />
                </div>
              </>
            )}

            <CardContent className="pt-6 pb-6 relative">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Student Photo & Basic Info */}
                <div className="flex items-start gap-4 md:w-1/3">
                  <Avatar className={cn("h-20 w-20 ring-4 ring-background shadow-xl shrink-0")}>
                    <AvatarImage src={data.studentPhotoUrl} alt={formatFullName()} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                      {data.studentFirstName?.[0]}{data.studentLastName?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-2 min-w-0 flex-1">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight truncate">{formatFullName()}</h3>
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        <Badge variant="outline" className="font-mono text-xs">
                          {data.studentNumber}
                        </Badge>
                        {getStatusBadge(data.paymentStatus)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className={sizing.icon.sm} />
                      <span className="font-medium">{data.gradeName}</span>
                      <span>•</span>
                      <span>{data.schoolYearName}</span>
                    </div>
                  </div>
                </div>

                {/* Student Personal Details */}
                <div className="flex-1 md:border-l md:pl-6">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {locale === "fr" ? "Informations Personnelles" : "Personal Information"}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {/* Date of Birth */}
                    {data.studentDateOfBirth && (
                      <div className="flex items-center gap-2">
                        <Calendar className={cn(sizing.icon.sm, "text-muted-foreground shrink-0")} />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{locale === "fr" ? "Date de naissance" : "Date of Birth"}</p>
                          <p className="text-sm font-medium truncate">
                            {formatDateLong(new Date(data.studentDateOfBirth), locale)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Gender */}
                    {data.studentGender && (
                      <div className="flex items-center gap-2">
                        <UserCircle className={cn(sizing.icon.sm, "text-muted-foreground shrink-0")} />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{locale === "fr" ? "Genre" : "Gender"}</p>
                          <p className="text-sm font-medium truncate">{formatGender(data.studentGender)}</p>
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    {data.studentPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className={cn(sizing.icon.sm, "text-muted-foreground shrink-0")} />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{locale === "fr" ? "Téléphone" : "Phone"}</p>
                          <p className="text-sm font-medium truncate">{data.studentPhone}</p>
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {data.studentEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className={cn(sizing.icon.sm, "text-muted-foreground shrink-0")} />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm font-medium truncate">{data.studentEmail}</p>
                        </div>
                      </div>
                    )}

                    {/* Address */}
                    {data.studentAddress && (
                      <div className="flex items-center gap-2 col-span-2">
                        <MapPin className={cn(sizing.icon.sm, "text-muted-foreground shrink-0")} />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{locale === "fr" ? "Adresse" : "Address"}</p>
                          <p className="text-sm font-medium truncate">{data.studentAddress}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent/Guardian Information */}
          {data.enrollmentPayerInfo && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className={sizing.icon.sm} />
                  {locale === "fr" ? "Parents / Tuteurs" : "Parents / Guardians"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Father Info */}
                  {data.enrollmentPayerInfo.fatherName && (
                    <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50">
                          <User className={cn(sizing.icon.sm, "text-blue-600 dark:text-blue-400")} />
                        </div>
                        <span className="font-semibold text-blue-900 dark:text-blue-100">
                          {locale === "fr" ? "Père" : "Father"}
                        </span>
                      </div>
                      <div className="space-y-2 ml-8">
                        <p className="font-medium">{data.enrollmentPayerInfo.fatherName}</p>
                        {data.enrollmentPayerInfo.fatherPhone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Phone className={sizing.icon.xs} />
                            {data.enrollmentPayerInfo.fatherPhone}
                          </p>
                        )}
                        {data.enrollmentPayerInfo.fatherEmail && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Mail className={sizing.icon.xs} />
                            {data.enrollmentPayerInfo.fatherEmail}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mother Info */}
                  {data.enrollmentPayerInfo.motherName && (
                    <div className="p-4 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-full bg-rose-100 dark:bg-rose-900/50">
                          <User className={cn(sizing.icon.sm, "text-rose-600 dark:text-rose-400")} />
                        </div>
                        <span className="font-semibold text-rose-900 dark:text-rose-100">
                          {locale === "fr" ? "Mère" : "Mother"}
                        </span>
                      </div>
                      <div className="space-y-2 ml-8">
                        <p className="font-medium">{data.enrollmentPayerInfo.motherName}</p>
                        {data.enrollmentPayerInfo.motherPhone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Phone className={sizing.icon.xs} />
                            {data.enrollmentPayerInfo.motherPhone}
                          </p>
                        )}
                        {data.enrollmentPayerInfo.motherEmail && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Mail className={sizing.icon.xs} />
                            {data.enrollmentPayerInfo.motherEmail}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Other Enrolling Person */}
                  {data.enrollmentPayerInfo.enrollingPersonType === "other" && data.enrollmentPayerInfo.enrollingPersonName && (
                    <div className="p-4 rounded-lg bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/50 md:col-span-2">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-full bg-violet-100 dark:bg-violet-900/50">
                          <Users className={cn(sizing.icon.sm, "text-violet-600 dark:text-violet-400")} />
                        </div>
                        <span className="font-semibold text-violet-900 dark:text-violet-100">
                          {locale === "fr" ? "Autre Contact" : "Other Contact"}
                          {data.enrollmentPayerInfo.enrollingPersonRelation && (
                            <span className="font-normal text-muted-foreground ml-2">
                              ({data.enrollmentPayerInfo.enrollingPersonRelation})
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="space-y-2 ml-8">
                        <p className="font-medium">{data.enrollmentPayerInfo.enrollingPersonName}</p>
                        {data.enrollmentPayerInfo.enrollingPersonPhone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Phone className={sizing.icon.xs} />
                            {data.enrollmentPayerInfo.enrollingPersonPhone}
                          </p>
                        )}
                        {data.enrollmentPayerInfo.enrollingPersonEmail && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Mail className={sizing.icon.xs} />
                            {data.enrollmentPayerInfo.enrollingPersonEmail}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Balance Summary Card */}
          <Card className={cn(
            "border-2 shadow-md",
            isFullyPaid
              ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20"
              : "border-amber-200 dark:border-amber-800"
          )}>
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    isFullyPaid
                      ? "bg-emerald-100 dark:bg-emerald-900/50"
                      : "bg-amber-100 dark:bg-amber-900/50"
                  )}>
                    <Wallet className={cn(
                      sizing.icon.md,
                      isFullyPaid
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    )} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t?.paymentWizard?.remainingBalance || "Remaining Balance"}
                    </p>
                    <p className={cn(
                      typography.currency.lg,
                      isFullyPaid
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    )}>
                      {isFullyPaid ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className={sizing.icon.md} />
                          {locale === "fr" ? "Payé intégralement" : "Fully Paid"}
                        </span>
                      ) : (
                        formatCurrency(data.remainingBalance)
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {t?.paymentWizard?.totalPaid || "Total Paid"}
                  </p>
                  <p className={cn(typography.currency.sm, "text-foreground")}>
                    {formatCurrency(data.totalPaid)} / {formatCurrency(data.tuitionFee)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!data.studentId && !isLoadingBalance && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className={cn(
              "p-5 rounded-2xl bg-gradient-to-br from-muted to-muted/50 mb-5",
              interactive.scale
            )}>
              <User className={`${sizing.icon.xl} text-muted-foreground`} />
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground">
              {t?.paymentWizard?.noStudentSelected || "No student selected"}
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              {t?.paymentWizard?.searchToSelect || "Search above to find and select a student to record a payment"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
