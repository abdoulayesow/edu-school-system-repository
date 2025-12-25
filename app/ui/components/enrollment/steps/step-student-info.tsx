"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEnrollmentWizard } from "../wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { Search, Plus, X, User, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDebouncedCallback } from "use-debounce"

interface SearchResult {
  id: string
  studentNumber: string
  firstName: string
  lastName: string
  fullName: string
  email?: string
  dateOfBirth?: string
  guardianName?: string
  guardianPhone?: string
  lastEnrollment?: {
    gradeName: string
    schoolYearName: string
  }
}

export function StepStudentInfo() {
  const { t } = useI18n()
  const { state, updateData } = useEnrollmentWizard()
  const { data } = state

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Debounced search function
  const debouncedSearch = useDebouncedCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `/api/enrollments/search-student?q=${encodeURIComponent(query)}`
      )
      if (response.ok) {
        const results = await response.json()
        setSearchResults(results)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }, 300)

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    debouncedSearch(value)
  }

  // Handle student selection
  const handleSelectStudent = (student: SearchResult) => {
    updateData({
      isReturningStudent: true,
      studentId: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      dateOfBirth: student.dateOfBirth,
      fatherName: student.guardianName,
      fatherPhone: student.guardianPhone,
    })
    setSearchQuery("")
    setSearchResults([])
  }

  // Handle student type change
  const handleStudentTypeChange = (value: string) => {
    const isReturning = value === "returning"
    updateData({
      isReturningStudent: isReturning,
      studentId: isReturning ? data.studentId : undefined,
    })
  }

  // Add a note
  const handleAddNote = () => {
    const newNotes = [...(data.notes || []), { title: "", content: "" }]
    updateData({ notes: newNotes })
  }

  // Update a note
  const handleUpdateNote = (
    index: number,
    field: "title" | "content",
    value: string
  ) => {
    const newNotes = [...(data.notes || [])]
    newNotes[index] = { ...newNotes[index], [field]: value }
    updateData({ notes: newNotes })
  }

  // Remove a note
  const handleRemoveNote = (index: number) => {
    const newNotes = (data.notes || []).filter((_, i) => i !== index)
    updateData({ notes: newNotes })
  }

  return (
    <div className="space-y-8">
      {/* Student Type Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t.enrollmentWizard.studentInfo}</h3>
        <RadioGroup
          value={data.isReturningStudent ? "returning" : "new"}
          onValueChange={handleStudentTypeChange}
          className="grid grid-cols-2 gap-4"
        >
          <Label
            htmlFor="new"
            className={cn(
              "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors",
              !data.isReturningStudent && "border-primary bg-primary/5"
            )}
          >
            <RadioGroupItem value="new" id="new" />
            <User className="h-5 w-5" />
            <span>{t.enrollmentWizard.newStudent}</span>
          </Label>
          <Label
            htmlFor="returning"
            className={cn(
              "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors",
              data.isReturningStudent && "border-primary bg-primary/5"
            )}
          >
            <RadioGroupItem value="returning" id="returning" />
            <UserCheck className="h-5 w-5" />
            <span>{t.enrollmentWizard.returningStudent}</span>
          </Label>
        </RadioGroup>
      </div>

      {/* Student Search (for returning students) */}
      {data.isReturningStudent && (
        <div className="space-y-2">
          <Label>{t.enrollmentWizard.searchStudent}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.enrollmentWizard.searchStudent}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border rounded-lg divide-y">
              {searchResults.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => handleSelectStudent(student)}
                  className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{student.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.studentNumber}
                        {student.lastEnrollment && (
                          <> • {student.lastEnrollment.gradeName}</>
                        )}
                      </p>
                    </div>
                    <span className="text-sm text-primary">
                      {t.enrollmentWizard.selectThisStudent}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
            <p className="text-sm text-muted-foreground text-center py-2">
              {t.enrollmentWizard.noStudentFound}
            </p>
          )}
        </div>
      )}

      {/* Personal Information */}
      <div className="space-y-4">
        <h4 className="font-medium">{t.enrollmentWizard.personalInfo}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              {t.enrollmentWizard.firstName} *
            </Label>
            <Input
              id="firstName"
              value={data.firstName}
              onChange={(e) => updateData({ firstName: e.target.value })}
              placeholder={t.enrollmentWizard.firstName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t.enrollmentWizard.lastName} *</Label>
            <Input
              id="lastName"
              value={data.lastName}
              onChange={(e) => updateData({ lastName: e.target.value })}
              placeholder={t.enrollmentWizard.lastName}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">{t.enrollmentWizard.dateOfBirth}</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={data.dateOfBirth || ""}
              onChange={(e) => updateData({ dateOfBirth: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">{t.enrollmentWizard.gender}</Label>
            <Select
              value={data.gender || ""}
              onValueChange={(value) =>
                updateData({ gender: value as "male" | "female" })
              }
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder={t.common.select} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t.enrollmentWizard.male}</SelectItem>
                <SelectItem value="female">{t.enrollmentWizard.female}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">{t.enrollmentWizard.phone}</Label>
            <Input
              id="phone"
              type="tel"
              value={data.phone || ""}
              onChange={(e) => updateData({ phone: e.target.value })}
              placeholder="+224 XXX XX XX XX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t.enrollmentWizard.email}</Label>
            <Input
              id="email"
              type="email"
              value={data.email || ""}
              onChange={(e) => updateData({ email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>
        </div>
      </div>

      {/* Parent Information */}
      <div className="space-y-4">
        <h4 className="font-medium">{t.enrollmentWizard.parentInfo}</h4>

        {/* Father Info */}
        <Card>
          <CardContent className="pt-4">
            <h5 className="text-sm font-medium mb-3">
              {t.enrollmentWizard.fatherInfo}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fatherName">{t.enrollmentWizard.fatherName}</Label>
                <Input
                  id="fatherName"
                  value={data.fatherName || ""}
                  onChange={(e) => updateData({ fatherName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherPhone">{t.enrollmentWizard.fatherPhone}</Label>
                <Input
                  id="fatherPhone"
                  type="tel"
                  value={data.fatherPhone || ""}
                  onChange={(e) => updateData({ fatherPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherEmail">{t.enrollmentWizard.fatherEmail}</Label>
                <Input
                  id="fatherEmail"
                  type="email"
                  value={data.fatherEmail || ""}
                  onChange={(e) => updateData({ fatherEmail: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mother Info */}
        <Card>
          <CardContent className="pt-4">
            <h5 className="text-sm font-medium mb-3">
              {t.enrollmentWizard.motherInfo}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="motherName">{t.enrollmentWizard.motherName}</Label>
                <Input
                  id="motherName"
                  value={data.motherName || ""}
                  onChange={(e) => updateData({ motherName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherPhone">{t.enrollmentWizard.motherPhone}</Label>
                <Input
                  id="motherPhone"
                  type="tel"
                  value={data.motherPhone || ""}
                  onChange={(e) => updateData({ motherPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherEmail">{t.enrollmentWizard.motherEmail}</Label>
                <Input
                  id="motherEmail"
                  type="email"
                  value={data.motherEmail || ""}
                  onChange={(e) => updateData({ motherEmail: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">{t.enrollmentWizard.address}</Label>
          <Textarea
            id="address"
            value={data.address || ""}
            onChange={(e) => updateData({ address: e.target.value })}
            rows={2}
          />
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{t.enrollmentWizard.additionalNotes}</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddNote}
            className="bg-transparent"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t.enrollmentWizard.addNote}
          </Button>
        </div>

        {data.notes?.map((note, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                  <Input
                    placeholder={t.enrollmentWizard.noteTitle}
                    value={note.title}
                    onChange={(e) =>
                      handleUpdateNote(index, "title", e.target.value)
                    }
                  />
                  <Textarea
                    placeholder={t.enrollmentWizard.noteContent}
                    value={note.content}
                    onChange={(e) =>
                      handleUpdateNote(index, "content", e.target.value)
                    }
                    rows={2}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveNote(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
