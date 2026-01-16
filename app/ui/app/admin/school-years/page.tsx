"use client"

import { useState, useEffect, useMemo } from "react"
import { PageContainer } from "@/components/layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useI18n } from "@/components/i18n-provider"
import { PermissionGuard, usePermissions } from "@/components/permission-guard"
import { formatDateLong } from "@/lib/utils"
import {
  Plus,
  CalendarDays,
  CheckCircle2,
  Clock,
  Archive,
  Edit,
  Trash2,
  Copy,
  Play,
  Loader2,
  GraduationCap,
  Users,
} from "lucide-react"

interface SchoolYear {
  id: string
  name: string
  startDate: string
  endDate: string
  enrollmentStart: string
  enrollmentEnd: string
  isActive: boolean
  status: "new" | "active" | "passed"
  gradesCount: number
  enrollmentsCount: number
  createdAt: string
}

export default function SchoolYearsPage() {
  const { t, locale } = useI18n()
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false)
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Form states
  const [selectedYear, setSelectedYear] = useState<SchoolYear | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    enrollmentStart: "",
    enrollmentEnd: "",
  })
  const [copyConfig, setCopyConfig] = useState({
    sourceYearId: "",
    copyGrades: true,
    copySubjects: true,
    copyRooms: true,
  })

  useEffect(() => {
    setIsMounted(true)
    fetchSchoolYears()
  }, [])

  async function fetchSchoolYears() {
    try {
      const res = await fetch("/api/admin/school-years")
      if (res.ok) {
        const data = await res.json()
        setSchoolYears(data)
      }
    } catch (err) {
      console.error("Error fetching school years:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const activeYear = useMemo(
    () => schoolYears.find((sy) => sy.status === "active"),
    [schoolYears]
  )
  const newYear = useMemo(
    () => schoolYears.find((sy) => sy.status === "new"),
    [schoolYears]
  )

  function formatDisplayDate(dateStr: string) {
    return formatDateLong(dateStr, locale)
  }

  function formatDateForInput(dateStr: string) {
    return new Date(dateStr).toISOString().split("T")[0]
  }

  function getStatusBadge(status: SchoolYear["status"]) {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">{t.admin.statusActive}</Badge>
      case "new":
        return <Badge className="bg-nav-highlight text-white dark:bg-gspn-gold-500 dark:text-gspn-gold-950">{t.admin.statusNew}</Badge>
      case "passed":
        return <Badge variant="secondary">{t.admin.statusPassed}</Badge>
    }
  }

  async function handleCreate() {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/school-years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setIsCreateDialogOpen(false)
        setFormData({ name: "", startDate: "", endDate: "", enrollmentStart: "", enrollmentEnd: "" })
        fetchSchoolYears()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to create school year")
      }
    } catch (err) {
      console.error("Error creating school year:", err)
      alert("Failed to create school year")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate() {
    if (!selectedYear) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/school-years/${selectedYear.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setIsEditDialogOpen(false)
        setSelectedYear(null)
        fetchSchoolYears()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to update school year")
      }
    } catch (err) {
      console.error("Error updating school year:", err)
      alert("Failed to update school year")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleActivate() {
    if (!selectedYear) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/school-years/${selectedYear.id}/activate`, {
        method: "POST",
      })
      if (res.ok) {
        setIsActivateDialogOpen(false)
        setSelectedYear(null)
        fetchSchoolYears()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to activate school year")
      }
    } catch (err) {
      console.error("Error activating school year:", err)
      alert("Failed to activate school year")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCopyConfig() {
    if (!selectedYear) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/school-years/${selectedYear.id}/copy-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copyConfig),
      })
      if (res.ok) {
        setIsCopyDialogOpen(false)
        setSelectedYear(null)
        setCopyConfig({ sourceYearId: "", copyGrades: true, copySubjects: true, copyRooms: true })
        fetchSchoolYears()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to copy configuration")
      }
    } catch (err) {
      console.error("Error copying configuration:", err)
      alert("Failed to copy configuration")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!selectedYear) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/school-years/${selectedYear.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setIsDeleteDialogOpen(false)
        setSelectedYear(null)
        fetchSchoolYears()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to delete school year")
      }
    } catch (err) {
      console.error("Error deleting school year:", err)
      alert("Failed to delete school year")
    } finally {
      setIsSubmitting(false)
    }
  }

  function openEditDialog(year: SchoolYear) {
    setSelectedYear(year)
    setFormData({
      name: year.name,
      startDate: formatDateForInput(year.startDate),
      endDate: formatDateForInput(year.endDate),
      enrollmentStart: formatDateForInput(year.enrollmentStart),
      enrollmentEnd: formatDateForInput(year.enrollmentEnd),
    })
    setIsEditDialogOpen(true)
  }

  function openCopyDialog(year: SchoolYear) {
    setSelectedYear(year)
    setCopyConfig({ sourceYearId: "", copyGrades: true, copySubjects: true, copyRooms: true })
    setIsCopyDialogOpen(true)
  }

  if (!isMounted) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t.admin.schoolYearsTitle}</h1>
          <p className="text-muted-foreground">{t.admin.schoolYearsSubtitle}</p>
        </div>
        <PermissionGuard resource="academic_year" action="create" inline>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!!newYear}>
                <Plus className="h-4 w-4 mr-2" />
                {t.admin.createSchoolYear}
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.admin.createSchoolYear}</DialogTitle>
              <DialogDescription>
                {t.admin.schoolYearsSubtitle}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t.admin.schoolYearName}</Label>
                <Input
                  id="name"
                  placeholder={t.admin.schoolYearNamePlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">{t.admin.startDate}</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">{t.admin.endDate}</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="enrollmentStart">{t.admin.enrollmentStartDate}</Label>
                  <Input
                    id="enrollmentStart"
                    type="date"
                    value={formData.enrollmentStart}
                    onChange={(e) => setFormData({ ...formData, enrollmentStart: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="enrollmentEnd">{t.admin.enrollmentEndDate}</Label>
                  <Input
                    id="enrollmentEnd"
                    type="date"
                    value={formData.enrollmentEnd}
                    onChange={(e) => setFormData({ ...formData, enrollmentEnd: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleCreate} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t.common.save}
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </PermissionGuard>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.activeYear}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeYear?.name || t.admin.noActiveYear}
            </div>
            {activeYear && (
              <p className="text-xs text-muted-foreground mt-1">
                {activeYear.gradesCount} {t.admin.grades.toLowerCase()}, {activeYear.enrollmentsCount} {t.common.students}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.newYear}</CardTitle>
            <Clock className="h-4 w-4 text-nav-highlight dark:text-gspn-gold-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {newYear?.name || t.admin.noNewYear}
            </div>
            {newYear && (
              <p className="text-xs text-muted-foreground mt-1">
                {newYear.gradesCount} {t.admin.grades.toLowerCase()} {t.admin.configured}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.totalYears}</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schoolYears.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {schoolYears.filter((sy) => sy.status === "passed").length} {t.admin.passed}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* School Years Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.admin.schoolYears}</CardTitle>
          <CardDescription>{t.admin.schoolYearsSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : schoolYears.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.admin.noDataFound}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.admin.schoolYearName}</TableHead>
                  <TableHead>{t.admin.startDate}</TableHead>
                  <TableHead>{t.admin.endDate}</TableHead>
                  <TableHead>{t.common.status}</TableHead>
                  <TableHead className="text-center">
                    <GraduationCap className="h-4 w-4 inline mr-1" />
                    {t.admin.grades}
                  </TableHead>
                  <TableHead className="text-center">
                    <Users className="h-4 w-4 inline mr-1" />
                    {t.admin.students}
                  </TableHead>
                  <TableHead className="text-right">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolYears.map((year) => (
                  <TableRow key={year.id}>
                    <TableCell className="font-medium">{year.name}</TableCell>
                    <TableCell>{formatDisplayDate(year.startDate)}</TableCell>
                    <TableCell>{formatDisplayDate(year.endDate)}</TableCell>
                    <TableCell>{getStatusBadge(year.status)}</TableCell>
                    <TableCell className="text-center">{year.gradesCount}</TableCell>
                    <TableCell className="text-center">{year.enrollmentsCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {year.status === "new" && (
                          <>
                            <PermissionGuard resource="academic_year" action="update" inline>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCopyDialog(year)}
                                title={t.admin.copyFromPreviousYear}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard resource="academic_year" action="update" inline>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedYear(year)
                                  setIsActivateDialogOpen(true)
                                }}
                                title={t.admin.activateSchoolYear}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                          </>
                        )}
                        {year.status !== "passed" && (
                          <PermissionGuard resource="academic_year" action="update" inline>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(year)}
                              title={t.common.edit}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                        )}
                        {year.status === "new" && (
                          <PermissionGuard resource="academic_year" action="delete" inline>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedYear(year)
                                setIsDeleteDialogOpen(true)
                              }}
                              title={t.common.delete}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.editSchoolYear}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">{t.admin.schoolYearName}</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-startDate">{t.admin.startDate}</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-endDate">{t.admin.endDate}</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-enrollmentStart">{t.admin.enrollmentStartDate}</Label>
                <Input
                  id="edit-enrollmentStart"
                  type="date"
                  value={formData.enrollmentStart}
                  onChange={(e) => setFormData({ ...formData, enrollmentStart: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-enrollmentEnd">{t.admin.enrollmentEndDate}</Label>
                <Input
                  id="edit-enrollmentEnd"
                  type="date"
                  value={formData.enrollmentEnd}
                  onChange={(e) => setFormData({ ...formData, enrollmentEnd: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy Config Dialog */}
      <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.copyFromPreviousYear}</DialogTitle>
            <DialogDescription>
              {t.admin.copyConfigDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t.admin.selectSourceYear}</Label>
              <Select
                value={copyConfig.sourceYearId}
                onValueChange={(value) => setCopyConfig({ ...copyConfig, sourceYearId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.admin.selectSourceYear} />
                </SelectTrigger>
                <SelectContent>
                  {schoolYears
                    .filter((sy) => sy.id !== selectedYear?.id && sy.gradesCount > 0)
                    .map((sy) => (
                      <SelectItem key={sy.id} value={sy.id}>
                        {sy.name} ({sy.gradesCount} grades)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="copyGrades"
                  checked={copyConfig.copyGrades}
                  onChange={(e) => setCopyConfig({ ...copyConfig, copyGrades: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="copyGrades">{t.admin.copyGrades}</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="copySubjects"
                  checked={copyConfig.copySubjects}
                  onChange={(e) => setCopyConfig({ ...copyConfig, copySubjects: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="copySubjects">{t.admin.copySubjects}</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="copyRooms"
                  checked={copyConfig.copyRooms}
                  onChange={(e) => setCopyConfig({ ...copyConfig, copyRooms: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="copyRooms">{t.admin.copyRooms}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCopyDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button
              onClick={handleCopyConfig}
              disabled={isSubmitting || !copyConfig.sourceYearId}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.admin.copyFromPreviousYear}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Confirmation Dialog */}
      <AlertDialog open={isActivateDialogOpen} onOpenChange={setIsActivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.activateSchoolYear}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.activateConfirmation}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivate} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.admin.activateSchoolYear}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.deleteGrade}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.deleteGradeConfirmation}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
