"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, User, Users, Save } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout/PageContainer"
import { formatGuineaPhone } from "@/lib/utils/phone"
import Link from "next/link"

interface StudentData {
  id: string
  studentNumber: string
  firstName: string
  lastName: string
  email?: string | null
  dateOfBirth?: string | null
  status: string
  studentProfile?: {
    person?: {
      phone?: string | null
      address?: string | null
    } | null
  } | null
  enrollments?: Array<{
    id: string
    middleName?: string | null
    fatherName?: string | null
    fatherPhone?: string | null
    fatherEmail?: string | null
    motherName?: string | null
    motherPhone?: string | null
    motherEmail?: string | null
    address?: string | null
    schoolYear: { isActive: boolean }
  }>
}

export default function StudentEditPage() {
  const { t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<StudentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [status, setStatus] = useState("")

  // Parent info
  const [fatherName, setFatherName] = useState("")
  const [fatherPhone, setFatherPhone] = useState("")
  const [fatherEmail, setFatherEmail] = useState("")
  const [motherName, setMotherName] = useState("")
  const [motherPhone, setMotherPhone] = useState("")
  const [motherEmail, setMotherEmail] = useState("")

  useEffect(() => {
    async function fetchStudent() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/students/${studentId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch student")
        }
        const data = await response.json()
        setStudent(data)

        // Populate form fields
        setFirstName(data.firstName || "")
        setLastName(data.lastName || "")
        setDateOfBirth(data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "")
        setEmail(data.email || "")
        setPhone(data.studentProfile?.person?.phone || "")
        setAddress(data.studentProfile?.person?.address || "")
        setStatus(data.status || "active")

        // Get active enrollment for parent info
        const activeEnrollment = data.enrollments?.find(
          (e: { schoolYear: { isActive: boolean } }) => e.schoolYear.isActive
        )
        if (activeEnrollment) {
          setMiddleName(activeEnrollment.middleName || "")
          setFatherName(activeEnrollment.fatherName || "")
          setFatherPhone(activeEnrollment.fatherPhone || "")
          setFatherEmail(activeEnrollment.fatherEmail || "")
          setMotherName(activeEnrollment.motherName || "")
          setMotherPhone(activeEnrollment.motherPhone || "")
          setMotherEmail(activeEnrollment.motherEmail || "")
          if (activeEnrollment.address) {
            setAddress(activeEnrollment.address)
          }
        }
      } catch (err) {
        console.error("Error fetching student:", err)
        setError(err instanceof Error ? err.message : "Failed to load student")
      } finally {
        setIsLoading(false)
      }
    }

    if (studentId) {
      fetchStudent()
    }
  }, [studentId])

  const activeEnrollment = student?.enrollments?.find(
    (e) => e.schoolYear.isActive
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      // Update student info
      const studentResponse = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          dateOfBirth: dateOfBirth || undefined,
          email: email || null,
          phone: phone || null,
          address: address || null,
          status,
        }),
      })

      if (!studentResponse.ok) {
        const errorData = await studentResponse.json()
        throw new Error(errorData.message || "Failed to update student")
      }

      // Update enrollment parent info if there's an active enrollment
      if (activeEnrollment) {
        const enrollmentResponse = await fetch(`/api/enrollments/${activeEnrollment.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            middleName: middleName || "",
            fatherName: fatherName || "",
            fatherPhone: fatherPhone || "",
            fatherEmail: fatherEmail || "",
            motherName: motherName || "",
            motherPhone: motherPhone || "",
            motherEmail: motherEmail || "",
            address: address || "",
          }),
        })

        if (!enrollmentResponse.ok) {
          console.warn("Could not update enrollment parent info")
        }
      }

      // Navigate back to student page
      router.push(`/students/${studentId}`)
    } catch (err) {
      console.error("Error saving student:", err)
      setError(err instanceof Error ? err.message : "Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !student) {
    return (
      <PageContainer maxWidth="lg">
        <Link href={`/students/${studentId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="size-4" />
          {t.common.back}
        </Link>
        <div className="text-center py-12 text-destructive">{error}</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="lg">
      {/* Back link */}
      <Link href={`/students/${studentId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="size-4" />
        {t.students.backToProfile}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {t.students.editStudent}
        </h1>
        <p className="text-muted-foreground">
          {student?.firstName} {student?.lastName} • {student?.studentNumber}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              {t.students.personalInfo}
            </CardTitle>
            <CardDescription>
              {t.students.basicStudentInfo}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t.students.firstName} *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">{t.students.middleName}</Label>
                <Input
                  id="middleName"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t.students.lastName} *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">{t.students.dateOfBirth}</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">{t.students.status}</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t.students.statusActive}</SelectItem>
                    <SelectItem value="inactive">{t.students.statusInactive}</SelectItem>
                    <SelectItem value="transferred">{t.students.statusTransferred}</SelectItem>
                    <SelectItem value="graduated">{t.students.statusGraduated}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t.students.phone}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={(e) => {
                    const formatted = formatGuineaPhone(e.target.value)
                    setPhone(formatted)
                  }}
                  placeholder="+224 XXX XX XX XX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t.students.address}</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Parent Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              {t.students.parentInformation}
            </CardTitle>
            <CardDescription>
              {t.students.parentContactDetails}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Father */}
            <div className="space-y-4">
              <h4 className="font-medium">{t.students.father}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherName">{t.students.fullName}</Label>
                  <Input
                    id="fatherName"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherPhone">{t.students.phone}</Label>
                  <Input
                    id="fatherPhone"
                    type="tel"
                    value={fatherPhone}
                    onChange={(e) => setFatherPhone(e.target.value)}
                    onBlur={(e) => {
                      const formatted = formatGuineaPhone(e.target.value)
                      setFatherPhone(formatted)
                    }}
                    placeholder="+224 XXX XX XX XX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherEmail">Email</Label>
                  <Input
                    id="fatherEmail"
                    type="email"
                    value={fatherEmail}
                    onChange={(e) => setFatherEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Mother */}
            <div className="space-y-4">
              <h4 className="font-medium">{t.students.mother}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motherName">{t.students.fullName}</Label>
                  <Input
                    id="motherName"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherPhone">{t.students.phone}</Label>
                  <Input
                    id="motherPhone"
                    type="tel"
                    value={motherPhone}
                    onChange={(e) => setMotherPhone(e.target.value)}
                    onBlur={(e) => {
                      const formatted = formatGuineaPhone(e.target.value)
                      setMotherPhone(formatted)
                    }}
                    placeholder="+224 XXX XX XX XX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherEmail">Email</Label>
                  <Input
                    id="motherEmail"
                    type="email"
                    value={motherEmail}
                    onChange={(e) => setMotherEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/students/${studentId}`)}
            disabled={isSaving}
          >
            {t.common.cancel}
          </Button>
          <Button
            type="submit"
            variant="gold"
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t.students.saving}
              </>
            ) : (
              <>
                <Save className="size-4" />
                {t.common.save}
              </>
            )}
          </Button>
        </div>
      </form>
    </PageContainer>
  )
}
