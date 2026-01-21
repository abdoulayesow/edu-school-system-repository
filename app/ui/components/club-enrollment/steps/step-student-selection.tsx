"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Search,
  GraduationCap,
  Users,
  Loader2,
  AlertCircle,
  Filter,
  IdCard,
  CheckCircle2,
  ChevronDown,
  X,
  Calendar,
  Phone,
  Mail,
  UserCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { sizing } from "@/lib/design-tokens"
import { useI18n } from "@/components/i18n-provider"
import type { EligibleStudent } from "@/lib/types/club-enrollment"
import { useClubEnrollmentWizard } from "../wizard-context"

export function StepStudentSelection() {
  const { locale } = useI18n()
  const { state, setStudent } = useClubEnrollmentWizard()

  const [students, setStudents] = useState<EligibleStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGrade, setSelectedGrade] = useState<string>("all")
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [showAllStudents, setShowAllStudents] = useState(false)

  // Fetch eligible students for selected club
  useEffect(() => {
    const fetchStudents = async () => {
      if (!state.data.clubId) {
        setError("No club selected")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const res = await fetch(`/api/clubs/${state.data.clubId}/eligible-students`)
        if (!res.ok) throw new Error("Failed to fetch eligible students")
        const data = await res.json()
        const studentsList = data.students || data || []
        setStudents(studentsList)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load students")
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [state.data.clubId])

  // Extract unique grades grouped by level for filter
  const availableGradesByLevel = useMemo(() => {
    const gradeMap = new Map<string, Array<{ name: string; level: string }>>()

    students.forEach(s => {
      if (s.currentGrade) {
        const level = s.currentGrade.level
        if (!gradeMap.has(level)) {
          gradeMap.set(level, [])
        }
        const levelGrades = gradeMap.get(level)!
        // Add if not already present
        if (!levelGrades.some(g => g.name === s.currentGrade!.name)) {
          levelGrades.push({
            name: s.currentGrade.name,
            level: s.currentGrade.level
          })
        }
      }
    })

    // Sort levels in educational order
    const levelOrder = ['kindergarten', 'primary', 'middle', 'high']
    const sortedLevels = Array.from(gradeMap.entries())
      .sort(([a], [b]) => {
        const aIndex = levelOrder.indexOf(a)
        const bIndex = levelOrder.indexOf(b)
        return aIndex - bIndex
      })

    return new Map(sortedLevels)
  }, [students])

  // Helper to format level names
  const formatLevelName = (level: string) => {
    const levelNames: Record<string, string> = {
      kindergarten: 'Kindergarten',
      primary: 'Primary',
      middle: 'Middle School',
      high: 'High School'
    }
    return levelNames[level] || level
  }

  // Filter students by search query AND grade using useMemo for immediate updates
  const filteredStudentsList = useMemo(() => {
    let filtered = students

    // Filter by grade
    if (selectedGrade !== "all") {
      filtered = filtered.filter(s => s.currentGrade?.name === selectedGrade)
    }

    // Filter by search (name OR formatted student ID)
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((s) => {
        const fullName = `${s.person.firstName} ${s.person.lastName}`.toLowerCase()
        // Safely handle null/undefined formattedStudentId
        const formattedId = s.formattedStudentId?.toLowerCase() || ""
        return fullName.includes(query) || formattedId.includes(query)
      })
    }

    return filtered
  }, [students, selectedGrade, searchQuery])

  // Helper to build full name including middle name
  const getFullName = (person: EligibleStudent["person"]) => {
    const parts = [person.firstName]
    if (person.middleName) parts.push(person.middleName)
    parts.push(person.lastName)
    return parts.join(" ")
  }

  const handleSelectStudent = (student: EligibleStudent) => {
    // If clicking same student, expand/collapse
    if (expandedStudent === student.studentId) {
      setExpandedStudent(null)
    } else {
      setExpandedStudent(student.studentId)
    }
  }

  // Quick select - single click to select without expanding
  const handleQuickSelect = (student: EligibleStudent, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card expansion
    const fullName = getFullName(student.person)
    setStudent({
      studentId: student.studentId,
      studentName: fullName,
      studentGrade: student.currentGrade?.name || "Unknown",
      studentPhoto: student.person.photoUrl,
      studentDateOfBirth: student.person.dateOfBirth || null,
      studentGender: student.person.gender || null,
      studentParentInfo: student.parentInfo || null,
      enrollmentPayerInfo: student.enrollmentPayerInfo || undefined,
    })
  }

  const handleConfirmStudent = (student: EligibleStudent) => {
    const fullName = getFullName(student.person)
    setStudent({
      // IMPORTANT: studentId in ClubEnrollmentData expects Person ID (not StudentProfile ID)
      // student.studentId contains the Person ID (see EligibleStudent type definition)
      // student.id contains the StudentProfile ID (not used in enrollment creation)
      studentId: student.studentId, // Person ID for enrollment creation
      studentName: fullName,
      studentGrade: student.currentGrade?.name || "Unknown",
      studentPhoto: student.person.photoUrl,
      studentDateOfBirth: student.person.dateOfBirth || null,
      studentGender: student.person.gender || null,
      studentParentInfo: student.parentInfo || null,
      enrollmentPayerInfo: student.enrollmentPayerInfo || undefined,
    })
    setExpandedStudent(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-GN", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Format date of birth for display
  const formatDateOfBirth = (dateStr: string | null | undefined) => {
    if (!dateStr) return null
    try {
      return new Date(dateStr).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } catch {
      return null
    }
  }

  // Format gender for display
  const formatGender = (gender: string | null | undefined) => {
    if (!gender) return null
    const genderMap: Record<string, { en: string; fr: string }> = {
      male: { en: "Male", fr: "Masculin" },
      female: { en: "Female", fr: "Féminin" },
      other: { en: "Other", fr: "Autre" },
    }
    const normalized = gender.toLowerCase()
    return genderMap[normalized]?.[locale === "fr" ? "fr" : "en"] || gender
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Select Student</h2>
          <p className="text-gray-600">Choose the student to enroll in this club</p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <Loader2 className={cn(sizing.icon.xl, "animate-spin text-primary")} />
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl opacity-30 animate-pulse" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Loading eligible students...</p>
        </div>

        {/* Loading skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-4 border-2 border-gray-200 rounded-xl animate-pulse"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Select Student</h2>
          <p className="text-gray-600">Choose the student to enroll in this club</p>
        </div>

        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="p-4 bg-red-100 rounded-full">
            <AlertCircle className={cn(sizing.icon.xl, "text-red-600")} />
          </div>
          <div className="text-center space-y-2 max-w-md">
            <h3 className="font-semibold text-lg text-gray-900">Unable to Load Students</h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Selected Club Header */}
      {state.data.clubName && (
        <div className="space-y-3">
          <div className="p-4 bg-gradient-to-br from-gspn-gold-50 to-gspn-gold-100 rounded-xl border-2 border-gspn-gold-200/50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gspn-gold-500 to-gspn-gold-600 flex items-center justify-center shadow-lg shadow-gspn-gold-500/30">
                  <Users className={cn(sizing.icon.sm, "text-white")} />
                </div>
                <div>
                  <div className="font-bold text-gray-900">
                    {locale === "fr" && state.data.clubNameFr
                      ? state.data.clubNameFr
                      : state.data.clubName}
                  </div>
                  {state.data.categoryName && (
                    <div className="text-sm text-gray-600">{state.data.categoryName}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {/* Show monthly fee if available, otherwise show enrollment fee */}
                {state.data.monthlyFee && state.data.monthlyFee > 0 ? (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">Monthly:</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(state.data.monthlyFee)}/mo
                    </span>
                  </div>
                ) : state.data.enrollmentFee && state.data.enrollmentFee > 0 ? (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">Fee:</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(state.data.enrollmentFee)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">Fee:</span>
                    <span className="font-semibold text-primary">Free</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Capacity Warning */}
          {state.data.capacity && state.data.currentEnrollments !== undefined &&
           state.data.currentEnrollments >= state.data.capacity && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2">
              <AlertCircle className={sizing.icon.sm} />
              <AlertDescription>
                This club has reached its maximum capacity ({state.data.capacity} students).
                No additional enrollments can be processed at this time.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Select Student</h2>
        <p className="text-gray-600">Choose an eligible student to enroll in this club</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className={cn(sizing.icon.sm, "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none")} aria-hidden="true" />
          <Input
            id="student-search"
            name="student-search"
            type="text"
            placeholder="Search by name or student ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-white border-2 border-gray-200 focus:border-primary transition-colors"
            aria-label="Search for students by name or ID"
            role="searchbox"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center"
              aria-label="Clear search"
            >
              <X className={sizing.icon.sm} />
            </button>
          )}
        </div>

        {/* Grade Filter */}
        <div className="relative w-full sm:w-48">
          <Filter className={cn(sizing.icon.sm, "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10")} aria-hidden="true" />
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-full h-11 bg-white border-2 border-gray-200 focus:border-primary pl-10" aria-label="Filter students by grade">
              <SelectValue>
                {selectedGrade === "all" ? "All Grades" : selectedGrade}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {Array.from(availableGradesByLevel.entries()).map(([level, grades]) => (
                <SelectGroup key={level}>
                  <SelectLabel className="font-semibold text-gray-700">
                    {formatLevelName(level)}
                  </SelectLabel>
                  {grades.map((grade) => (
                    <SelectItem key={grade.name} value={grade.name}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchQuery || selectedGrade !== "all") && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-gray-900">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {selectedGrade !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Grade: {selectedGrade}
              <button onClick={() => setSelectedGrade("all")} className="ml-1 hover:text-gray-900">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Students Grid */}
      {filteredStudentsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Animated icon container */}
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gspn-gold-100 to-gspn-gold-200
                          flex items-center justify-center shadow-lg shadow-gspn-gold-200/50 animate-pulse">
              <GraduationCap className="w-16 h-16 text-gspn-gold-600" />
            </div>
            {/* Floating decorative elements */}
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gspn-gold-400 animate-bounce shadow-md"
                 style={{ animationDelay: '0.2s', animationDuration: '2s' }} />
            <div className="absolute -bottom-1 -left-3 w-4 h-4 rounded-full bg-gspn-gold-300 animate-bounce shadow-md"
                 style={{ animationDelay: '0.4s', animationDuration: '2.5s' }} />
            <div className="absolute top-1/2 -right-4 w-3 h-3 rounded-full bg-gspn-gold-200 animate-bounce shadow-sm"
                 style={{ animationDelay: '0.6s', animationDuration: '3s' }} />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {students.length === 0
              ? "No Eligible Students Yet"
              : "No Students Match Your Search"}
          </h3>
          <p className="text-gray-600 text-center max-w-md leading-relaxed mb-6">
            {students.length === 0
              ? "Students must meet the club's eligibility criteria such as grade level and enrollment status."
              : "Try adjusting your search term or grade filter to find more students."}
          </p>

          {/* Helpful actions */}
          {(searchQuery || selectedGrade !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedGrade("all")
              }}
              className="mt-2 border-2 hover:bg-gspn-gold-50 hover:border-gspn-gold-300 transition-colors"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-sm text-gray-600 flex items-center justify-between px-1">
            <span className="font-medium">{filteredStudentsList.length} student{filteredStudentsList.length !== 1 ? 's' : ''} found</span>
            {state.data.studentId && (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Student selected
              </span>
            )}
          </div>

          {/* Elegant Student Showcase Grid - First 6 or All */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudentsList.slice(0, showAllStudents ? undefined : 6).map((student, index) => {
              const isSelected = state.data.studentId === student.studentId
              const isExpanded = expandedStudent === student.studentId
              const fullName = getFullName(student.person)
              const firstInitial = student.person.firstName?.[0] || "?"
              const lastInitial = student.person.lastName?.[0] || "?"
              const initials = `${firstInitial}${lastInitial}`
              const hasExistingEnrollments = student.clubEnrollments && student.clubEnrollments.length > 0

              return (
                <div
                  key={student.id}
                  className={cn(
                    "group relative rounded-2xl border-2 overflow-hidden transition-all duration-500 animate-in fade-in slide-in-from-bottom-2",
                    isSelected
                      ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-2xl shadow-green-500/30 scale-[1.02]"
                      : isExpanded
                      ? "border-primary bg-gradient-to-br from-gspn-gold-50 via-white to-gspn-gold-50/30 shadow-2xl shadow-primary/20 scale-[1.01]"
                      : "border-gray-200 bg-white hover:border-gspn-gold-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]"
                  )}
                  style={{ animationDelay: `${index * 80}ms` }}
                  role="article"
                  aria-label={`Student: ${fullName}`}
                >
                  {/* Decorative Top Bar */}
                  <div className={cn(
                    "h-1.5 w-full transition-all duration-500",
                    isSelected
                      ? "bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"
                      : "bg-gradient-to-r from-gspn-gold-400 via-gspn-gold-500 to-gspn-gold-400 opacity-0 group-hover:opacity-100"
                  )} />

                  {/* Main Card Content */}
                  <div
                    onClick={() => handleSelectStudent(student)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSelectStudent(student)
                      }
                    }}
                    className="w-full p-5 text-left cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} details for ${fullName}`}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5 animate-in zoom-in duration-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        SELECTED
                      </div>
                    )}

                    {/* Student Header */}
                    <div className="flex flex-col items-center text-center space-y-3 mb-4">
                      {/* Large Avatar */}
                      <div className="relative">
                        <Avatar className={cn(
                          "border-4 transition-all duration-500 ring-4",
                          isSelected
                            ? "w-24 h-24 border-green-400 ring-green-100"
                            : "w-20 h-20 border-white ring-gray-100 group-hover:w-24 group-hover:h-24 group-hover:border-gspn-gold-300 group-hover:ring-gspn-gold-100"
                        )}>
                          <AvatarImage src={student.person.photoUrl || undefined} alt={fullName} />
                          <AvatarFallback className={cn(
                            "font-bold text-2xl transition-colors",
                            isSelected ? "bg-green-100 text-green-700" : "bg-gradient-to-br from-gspn-gold-100 to-gspn-gold-200 text-gspn-gold-700"
                          )}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>

                        {/* Status Indicator Dot */}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full shadow-md"
                             title="Active Student" />
                      </div>

                      {/* Student Name */}
                      <div className="space-y-1">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">
                          {fullName}
                        </h3>
                        {student.formattedStudentId && (
                          <p className="text-xs font-mono text-gray-500 tracking-wide">
                            {student.formattedStudentId}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Student Meta Information */}
                    <div className="space-y-2.5">
                      {/* Grade Badge */}
                      {student.currentGrade && (
                        <div className="flex items-center justify-center gap-2 p-2.5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                          <GraduationCap className="w-4 h-4 text-gspn-gold-600" />
                          <span className="text-sm font-semibold text-gray-700">
                            {student.currentGrade.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({student.currentGrade.level})
                          </span>
                        </div>
                      )}

                      {/* Club Enrollments */}
                      {hasExistingEnrollments && (
                        <div className="flex items-center justify-center gap-2 p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-xs font-medium text-blue-700">
                            {student.clubEnrollments!.length} Active Club{student.clubEnrollments!.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Select & Expand Indicator */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500 flex items-center gap-1.5 group-hover:text-gspn-gold-600 transition-colors">
                        {isExpanded ? 'Click to collapse' : 'Click for details'}
                        <ChevronDown className={cn(
                          "w-3.5 h-3.5 transition-transform duration-300",
                          isExpanded && "rotate-180"
                        )} />
                      </span>

                      {/* Quick Select Button - Visible on hover */}
                      {!isSelected && (
                        <Button
                          size="sm"
                          onClick={(e) => handleQuickSelect(student, e)}
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-r from-gspn-gold-500 to-gspn-gold-600 hover:from-gspn-gold-600 hover:to-gspn-gold-700 text-white text-xs px-3 py-1 h-7 shadow-md"
                          aria-label={`Quick select ${fullName}`}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Select
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-300 border-t-2 border-gspn-gold-100">
                      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-4" />

                      {/* Personal Information Section */}
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                          <UserCircle className="w-4 h-4" />
                          Personal Information
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {/* Date of Birth */}
                          {student.person.dateOfBirth && (
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500">Date of Birth</div>
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                {formatDateOfBirth(student.person.dateOfBirth)}
                              </div>
                            </div>
                          )}

                          {/* Gender */}
                          {student.person.gender && (
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500">Gender</div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatGender(student.person.gender)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Parent Information Section */}
                      {(student.parentInfo?.fatherName || student.parentInfo?.motherName) && (
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                          <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            Parent Information
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {/* Father */}
                            {student.parentInfo?.fatherName && (
                              <div className="space-y-1.5">
                                <div className="text-xs text-gray-500 font-medium">Father</div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {student.parentInfo.fatherName}
                                </div>
                                {student.parentInfo?.fatherPhone && (
                                  <div className="text-xs text-gray-600 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {student.parentInfo.fatherPhone}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Mother */}
                            {student.parentInfo?.motherName && (
                              <div className="space-y-1.5">
                                <div className="text-xs text-gray-500 font-medium">Mother</div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {student.parentInfo.motherName}
                                </div>
                                {student.parentInfo?.motherPhone && (
                                  <div className="text-xs text-gray-600 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {student.parentInfo.motherPhone}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Detailed Information Grid */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        {/* Student ID */}
                        {student.formattedStudentId && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                              <IdCard className="w-3 h-3" />
                              Student ID
                            </div>
                            <div className="font-mono text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                              {student.formattedStudentId}
                            </div>
                          </div>
                        )}

                        {/* Grade Level */}
                        {student.currentGrade && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              Grade Level
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                              {student.currentGrade.name}
                              <span className="text-xs text-gray-500 ml-2">({student.currentGrade.level})</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Current Club Enrollments */}
                      {hasExistingEnrollments && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Current Clubs ({student.clubEnrollments!.length})
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {student.clubEnrollments!.map((enrollment, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {enrollment.club.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Confirm Selection Button */}
                      <Button
                        onClick={() => handleConfirmStudent(student)}
                        className={cn(
                          "w-full min-h-[44px] font-semibold transition-all duration-300",
                          isSelected
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gradient-to-r from-gspn-gold-500 to-gspn-gold-600 hover:from-gspn-gold-600 hover:to-gspn-gold-700 text-white shadow-lg shadow-gspn-gold-500/30"
                        )}
                        aria-label={`Confirm selection of ${fullName}`}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle2 className={cn(sizing.icon.sm, "mr-2")} />
                            Student Selected
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className={cn(sizing.icon.sm, "mr-2")} />
                            Confirm Selection
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* View All Students Button - Show if more than 6 students */}
          {filteredStudentsList.length > 6 && !showAllStudents && (
            <div className="pt-4 flex flex-col items-center gap-4 border-t-2 border-dashed border-gray-200">
              <p className="text-sm text-gray-600 font-medium">
                Showing 6 of {filteredStudentsList.length} students
              </p>
              <Button
                onClick={() => setShowAllStudents(true)}
                variant="outline"
                className="px-8 py-2.5 border-2 border-gspn-gold-300 text-gspn-gold-700 hover:bg-gspn-gold-50 hover:border-gspn-gold-400 hover:shadow-lg transition-all duration-300 font-semibold"
              >
                <Users className="w-4 h-4 mr-2" />
                View All {filteredStudentsList.length} Students
              </Button>
            </div>
          )}

          {/* Show Less Button - Show when viewing all students */}
          {filteredStudentsList.length > 6 && showAllStudents && (
            <div className="pt-4 flex flex-col items-center gap-4 border-t-2 border-dashed border-gray-200">
              <p className="text-sm text-gray-600 font-medium">
                Showing all {filteredStudentsList.length} students
              </p>
              <Button
                onClick={() => setShowAllStudents(false)}
                variant="outline"
                className="px-8 py-2.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg transition-all duration-300 font-semibold"
              >
                <Users className="w-4 h-4 mr-2" />
                Show Less
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
