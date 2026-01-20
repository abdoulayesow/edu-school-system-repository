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
  X
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
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((s) => {
        const fullName = `${s.person.firstName} ${s.person.lastName}`.toLowerCase()
        const formattedId = (s.formattedStudentId || "").toLowerCase()
        return fullName.includes(query) || formattedId.includes(query)
      })
    }

    return filtered
  }, [students, selectedGrade, searchQuery])

  const handleSelectStudent = (student: EligibleStudent) => {
    // If clicking same student, expand/collapse
    if (expandedStudent === student.studentId) {
      setExpandedStudent(null)
    } else {
      setExpandedStudent(student.studentId)
    }
  }

  const handleConfirmStudent = (student: EligibleStudent) => {
    setStudent({
      // IMPORTANT: studentId in ClubEnrollmentData expects Person ID (not StudentProfile ID)
      // student.studentId contains the Person ID (see EligibleStudent type definition)
      // student.id contains the StudentProfile ID (not used in enrollment creation)
      studentId: student.studentId, // Person ID for enrollment creation
      studentName: `${student.person.firstName} ${student.person.lastName}`,
      studentGrade: student.currentGrade?.name || "Unknown",
      studentPhoto: student.person.photoUrl,
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
        <div className="space-y-3">
          <div className="text-sm text-gray-600 flex items-center justify-between px-1">
            <span>{filteredStudentsList.length} student{filteredStudentsList.length !== 1 ? 's' : ''} found</span>
            {state.data.studentId && (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Student selected
              </span>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {filteredStudentsList.map((student, index) => {
              const isSelected = state.data.studentId === student.studentId
              const isExpanded = expandedStudent === student.studentId
              const fullName = `${student.person.firstName} ${student.person.lastName}`
              const initials = `${student.person.firstName[0]}${student.person.lastName[0]}`
              const hasExistingEnrollments = student.clubEnrollments && student.clubEnrollments.length > 0

              return (
                <div
                  key={student.id}
                  className={cn(
                    "group relative rounded-xl border-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-2",
                    isSelected
                      ? "border-green-500 bg-green-50/50 shadow-xl shadow-green-500/20 scale-[1.02]"
                      : isExpanded
                      ? "border-primary bg-gradient-to-br from-gspn-gold-50 to-white shadow-xl shadow-primary/10 scale-[1.01]"
                      : "border-gray-200 bg-white hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01]"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                  role="article"
                  aria-label={`Student: ${fullName}`}
                >
                  {/* Compact View */}
                  <button
                    onClick={() => handleSelectStudent(student)}
                    className="w-full p-4 text-left group min-h-[44px]"
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} details for ${fullName}`}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 z-10 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        SELECTED
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <Avatar className={cn(
                        "border-2 transition-all duration-300",
                        isSelected ? "w-14 h-14 border-green-400" : "w-12 h-12 border-gray-200"
                      )}>
                        <AvatarImage src={student.person.photoUrl || undefined} alt={fullName} />
                        <AvatarFallback className={cn(
                          "font-semibold transition-colors",
                          isSelected ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"
                        )}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                          {fullName}
                          <ChevronDown className={cn(
                            "w-4 h-4 text-gray-400 transition-transform duration-300",
                            isExpanded && "rotate-180"
                          )} />
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {student.currentGrade && (
                            <Badge variant="outline" className="text-xs">
                              <GraduationCap className="w-3 h-3 mr-1" />
                              {student.currentGrade.name}
                            </Badge>
                          )}
                          {student.formattedStudentId && (
                            <Badge variant="secondary" className="text-xs font-mono">
                              <IdCard className="w-3 h-3 mr-1" />
                              {student.formattedStudentId}
                            </Badge>
                          )}
                        </div>

                        {/* Existing Club Enrollments */}
                        {hasExistingEnrollments && !isExpanded && (
                          <div className="text-xs text-gray-500">
                            {student.clubEnrollments!.length} active club{student.clubEnrollments!.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

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
        </div>
      )}
    </div>
  )
}
