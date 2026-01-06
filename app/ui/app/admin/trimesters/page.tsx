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
import { formatDateLong } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import {
  Plus,
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  Play,
  Loader2,
  Pause,
  GraduationCap,
  Calculator,
  ChevronDown,
  BookOpen,
  Users,
  Zap,
} from "lucide-react"

interface SchoolYear {
  id: string
  name: string
  isActive: boolean
}

interface Trimester {
  id: string
  schoolYearId: string
  schoolYearName: string
  isActiveSchoolYear: boolean
  number: number
  name: string
  nameFr: string
  nameEn: string
  startDate: string
  endDate: string
  isActive: boolean
  evaluationsCount: number
  createdAt: string
}

export default function TrimestersPage() {
  const { t, locale } = useI18n()
  const { toast } = useToast()
  const [trimesters, setTrimesters] = useState<Trimester[]>([])
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Calculation states
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationProgress, setCalculationProgress] = useState<string | null>(null)

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Form states
  const [selectedTrimester, setSelectedTrimester] = useState<Trimester | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    schoolYearId: "",
    number: 1,
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    setIsMounted(true)
    fetchSchoolYears()
  }, [])

  useEffect(() => {
    if (selectedSchoolYearId) {
      fetchTrimesters(selectedSchoolYearId)
    }
  }, [selectedSchoolYearId])

  async function fetchSchoolYears() {
    try {
      const res = await fetch("/api/admin/school-years")
      if (res.ok) {
        const data = await res.json()
        setSchoolYears(data)
        // Auto-select active school year
        const activeYear = data.find((sy: SchoolYear) => sy.isActive)
        if (activeYear) {
          setSelectedSchoolYearId(activeYear.id)
        } else if (data.length > 0) {
          setSelectedSchoolYearId(data[0].id)
        }
      }
    } catch (err) {
      console.error("Error fetching school years:", err)
    }
  }

  async function fetchTrimesters(schoolYearId: string) {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/trimesters?schoolYearId=${schoolYearId}`)
      if (res.ok) {
        const data = await res.json()
        setTrimesters(data)
      }
    } catch (err) {
      console.error("Error fetching trimesters:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const activeTrimester = useMemo(
    () => trimesters.find((t) => t.isActive),
    [trimesters]
  )

  const selectedSchoolYear = useMemo(
    () => schoolYears.find((sy) => sy.id === selectedSchoolYearId),
    [schoolYears, selectedSchoolYearId]
  )

  const existingTrimesterNumbers = useMemo(
    () => trimesters.map((t) => t.number),
    [trimesters]
  )

  const availableTrimesterNumbers = useMemo(
    () => [1, 2, 3].filter((n) => !existingTrimesterNumbers.includes(n)),
    [existingTrimesterNumbers]
  )

  function formatDisplayDate(dateStr: string) {
    return formatDateLong(dateStr, locale)
  }

  function formatDateForInput(dateStr: string) {
    return new Date(dateStr).toISOString().split("T")[0]
  }

  function getTrimesterName(number: number) {
    switch (number) {
      case 1:
        return locale === "fr" ? "1er Trimestre" : "1st Trimester"
      case 2:
        return locale === "fr" ? "2ème Trimestre" : "2nd Trimester"
      case 3:
        return locale === "fr" ? "3ème Trimestre" : "3rd Trimester"
      default:
        return `Trimester ${number}`
    }
  }

  async function handleCreate() {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/trimesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          schoolYearId: selectedSchoolYearId,
        }),
      })
      if (res.ok) {
        setIsCreateDialogOpen(false)
        setFormData({ schoolYearId: "", number: 1, startDate: "", endDate: "" })
        fetchTrimesters(selectedSchoolYearId)
      } else {
        const data = await res.json()
        alert(data.message || "Failed to create trimester")
      }
    } catch (err) {
      console.error("Error creating trimester:", err)
      alert("Failed to create trimester")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate() {
    if (!selectedTrimester) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/trimesters/${selectedTrimester.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: formData.startDate,
          endDate: formData.endDate,
        }),
      })
      if (res.ok) {
        setIsEditDialogOpen(false)
        setSelectedTrimester(null)
        fetchTrimesters(selectedSchoolYearId)
      } else {
        const data = await res.json()
        alert(data.message || "Failed to update trimester")
      }
    } catch (err) {
      console.error("Error updating trimester:", err)
      alert("Failed to update trimester")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleActivate() {
    if (!selectedTrimester) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/trimesters/${selectedTrimester.id}/activate`, {
        method: "POST",
      })
      if (res.ok) {
        setIsActivateDialogOpen(false)
        setSelectedTrimester(null)
        fetchTrimesters(selectedSchoolYearId)
      } else {
        const data = await res.json()
        alert(data.message || "Failed to activate trimester")
      }
    } catch (err) {
      console.error("Error activating trimester:", err)
      alert("Failed to activate trimester")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeactivate(trimester: Trimester) {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/trimesters/${trimester.id}/activate`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchTrimesters(selectedSchoolYearId)
      } else {
        const data = await res.json()
        alert(data.message || "Failed to deactivate trimester")
      }
    } catch (err) {
      console.error("Error deactivating trimester:", err)
      alert("Failed to deactivate trimester")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!selectedTrimester) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/trimesters/${selectedTrimester.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setIsDeleteDialogOpen(false)
        setSelectedTrimester(null)
        fetchTrimesters(selectedSchoolYearId)
      } else {
        const data = await res.json()
        alert(data.message || "Failed to delete trimester")
      }
    } catch (err) {
      console.error("Error deleting trimester:", err)
      alert("Failed to delete trimester")
    } finally {
      setIsSubmitting(false)
    }
  }

  function openEditDialog(trimester: Trimester) {
    setSelectedTrimester(trimester)
    setFormData({
      schoolYearId: trimester.schoolYearId,
      number: trimester.number,
      startDate: formatDateForInput(trimester.startDate),
      endDate: formatDateForInput(trimester.endDate),
    })
    setIsEditDialogOpen(true)
  }

  function openCreateDialog() {
    if (availableTrimesterNumbers.length === 0) {
      alert("All 3 trimesters already exist for this school year")
      return
    }
    setFormData({
      schoolYearId: selectedSchoolYearId,
      number: availableTrimesterNumbers[0],
      startDate: "",
      endDate: "",
    })
    setIsCreateDialogOpen(true)
  }

  // Calculation handlers
  async function handleCalculateAverages() {
    if (!activeTrimester) {
      toast({
        title: t.common.error,
        description: t.admin.noActiveTrimester,
        variant: "destructive",
      })
      return
    }

    setIsCalculating(true)
    setCalculationProgress(t.grading.calculatingSubjectAverages)

    try {
      const res = await fetch("/api/evaluations/calculate-averages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trimesterId: activeTrimester.id }),
      })

      if (res.ok) {
        const data = await res.json()
        toast({
          title: t.common.success,
          description: `${t.grading.calculationComplete}: ${data.count || 0} ${t.grading.subjectAverage.toLowerCase()}s`,
        })
        fetchTrimesters(selectedSchoolYearId)
      } else {
        const data = await res.json()
        toast({
          title: t.common.error,
          description: data.message || "Failed to calculate averages",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error calculating averages:", err)
      toast({
        title: t.common.error,
        description: "Failed to calculate averages",
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
      setCalculationProgress(null)
    }
  }

  async function handleCalculateSummaries() {
    if (!activeTrimester) {
      toast({
        title: t.common.error,
        description: t.admin.noActiveTrimester,
        variant: "destructive",
      })
      return
    }

    setIsCalculating(true)
    setCalculationProgress(t.grading.calculatingStudentSummaries)

    try {
      const res = await fetch("/api/evaluations/student-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trimesterId: activeTrimester.id }),
      })

      if (res.ok) {
        const data = await res.json()
        toast({
          title: t.common.success,
          description: `${t.grading.calculationComplete}: ${data.studentsProcessed || 0} ${t.common.students}`,
        })
        fetchTrimesters(selectedSchoolYearId)
      } else {
        const data = await res.json()
        toast({
          title: t.common.error,
          description: data.message || "Failed to calculate summaries",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error calculating summaries:", err)
      toast({
        title: t.common.error,
        description: "Failed to calculate summaries",
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
      setCalculationProgress(null)
    }
  }

  async function handleCalculateAll() {
    if (!activeTrimester) {
      toast({
        title: t.common.error,
        description: t.admin.noActiveTrimester,
        variant: "destructive",
      })
      return
    }

    setIsCalculating(true)

    // Step 1: Calculate subject averages
    setCalculationProgress(t.grading.calculatingSubjectAverages)
    try {
      const avgRes = await fetch("/api/evaluations/calculate-averages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trimesterId: activeTrimester.id }),
      })

      if (!avgRes.ok) {
        const data = await avgRes.json()
        throw new Error(data.message || "Failed to calculate averages")
      }

      // Step 2: Calculate student summaries
      setCalculationProgress(t.grading.calculatingStudentSummaries)
      const summaryRes = await fetch("/api/evaluations/student-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trimesterId: activeTrimester.id }),
      })

      if (!summaryRes.ok) {
        const data = await summaryRes.json()
        throw new Error(data.message || "Failed to calculate summaries")
      }

      const summaryData = await summaryRes.json()
      toast({
        title: t.common.success,
        description: `${t.grading.calculationComplete}: ${summaryData.studentsProcessed || 0} ${t.common.students}`,
      })
      fetchTrimesters(selectedSchoolYearId)
    } catch (err) {
      console.error("Error in bulk calculation:", err)
      toast({
        title: t.common.error,
        description: err instanceof Error ? err.message : "Failed to complete calculations",
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
      setCalculationProgress(null)
    }
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
          <h1 className="text-3xl font-bold">{t.admin.trimestersTitle}</h1>
          <p className="text-muted-foreground">{t.admin.trimestersSubtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedSchoolYearId} onValueChange={setSelectedSchoolYearId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t.admin.selectSchoolYear} />
            </SelectTrigger>
            <SelectContent>
              {schoolYears.map((sy) => (
                <SelectItem key={sy.id} value={sy.id}>
                  {sy.name} {sy.isActive && "(Active)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={!activeTrimester || isCalculating}>
                {isCalculating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Calculator className="h-4 w-4 mr-2" />
                )}
                {isCalculating ? calculationProgress : t.grading.calculationsMenu}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCalculateAverages} disabled={isCalculating}>
                <BookOpen className="h-4 w-4 mr-2" />
                {t.grading.calculateSubjectAverages}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCalculateSummaries} disabled={isCalculating}>
                <Users className="h-4 w-4 mr-2" />
                {t.grading.calculateStudentSummaries}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCalculateAll} disabled={isCalculating}>
                <Zap className="h-4 w-4 mr-2" />
                {t.grading.calculateAllNow}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={openCreateDialog}
            disabled={!selectedSchoolYearId || availableTrimesterNumbers.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.admin.createTrimester}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.activeTrimester}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeTrimester
                ? locale === "fr"
                  ? activeTrimester.nameFr
                  : activeTrimester.nameEn
                : t.admin.noActiveTrimester}
            </div>
            {activeTrimester && (
              <p className="text-xs text-muted-foreground mt-1">
                {activeTrimester.evaluationsCount} {t.admin.evaluationsCount.toLowerCase()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.totalTrimesters}</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trimesters.length} / 3</div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedSchoolYear?.name || t.admin.selectSchoolYear}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.evaluationsCount}</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trimesters.reduce((sum, t) => sum + t.evaluationsCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t.admin.acrossGrades.replace("{count}", String(trimesters.length))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trimesters Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.admin.trimesters}</CardTitle>
          <CardDescription>{t.admin.trimestersSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !selectedSchoolYearId ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.admin.selectSchoolYear}
            </div>
          ) : trimesters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.admin.noTrimesters}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.admin.trimester}</TableHead>
                  <TableHead>{t.admin.startDate}</TableHead>
                  <TableHead>{t.admin.endDate}</TableHead>
                  <TableHead className="text-center">{t.common.status}</TableHead>
                  <TableHead className="text-center">{t.admin.evaluationsCount}</TableHead>
                  <TableHead className="text-right">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trimesters
                  .sort((a, b) => a.number - b.number)
                  .map((trimester) => (
                    <TableRow key={trimester.id}>
                      <TableCell className="font-medium">
                        {locale === "fr" ? trimester.nameFr : trimester.nameEn}
                      </TableCell>
                      <TableCell>{formatDisplayDate(trimester.startDate)}</TableCell>
                      <TableCell>{formatDisplayDate(trimester.endDate)}</TableCell>
                      <TableCell className="text-center">
                        {trimester.isActive ? (
                          <Badge className="bg-green-500">{t.admin.active}</Badge>
                        ) : (
                          <Badge variant="secondary">{t.admin.statusNew}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{trimester.evaluationsCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!trimester.isActive && selectedSchoolYear?.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTrimester(trimester)
                                setIsActivateDialogOpen(true)
                              }}
                              title={t.admin.activateTrimester}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {trimester.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivate(trimester)}
                              title={t.admin.deactivateTrimester}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(trimester)}
                            title={t.common.edit}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!trimester.isActive && trimester.evaluationsCount === 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTrimester(trimester)
                                setIsDeleteDialogOpen(true)
                              }}
                              title={t.common.delete}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.createTrimester}</DialogTitle>
            <DialogDescription>{t.admin.trimestersSubtitle}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t.admin.trimesterNumber}</Label>
              <Select
                value={String(formData.number)}
                onValueChange={(v) => setFormData({ ...formData, number: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableTrimesterNumbers.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {getTrimesterName(n)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting || !formData.startDate || !formData.endDate}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.editTrimester}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t.admin.trimester}</Label>
              <div className="text-sm text-muted-foreground">
                {selectedTrimester && (locale === "fr" ? selectedTrimester.nameFr : selectedTrimester.nameEn)}
              </div>
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

      {/* Activate Confirmation Dialog */}
      <AlertDialog open={isActivateDialogOpen} onOpenChange={setIsActivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.activateTrimester}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.activateTrimesterConfirmation}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivate} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.admin.activateTrimester}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.deleteTrimester}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.deleteTrimesterConfirmation}
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
