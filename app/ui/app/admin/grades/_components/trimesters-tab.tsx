"use client"

import { useState, useEffect, useMemo } from "react"
import { useI18n } from "@/components/i18n-provider"
import { PermissionGuard } from "@/components/permission-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  CalendarDays,
  CheckCircle2,
  Pencil,
  Trash2,
  Play,
  Loader2,
  Pause,
  GraduationCap,
  CalendarRange,
} from "lucide-react"
import { componentClasses } from "@/lib/design-tokens"
import { formatDateLong } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TrimestersTabProps {
  selectedYearId: string
  canEdit: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TrimestersTab({ selectedYearId, canEdit }: TrimestersTabProps) {
  const { t, locale } = useI18n()

  const [trimesters, setTrimesters] = useState<Trimester[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTrimester, setSelectedTrimester] = useState<Trimester | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    number: 1,
    startDate: "",
    endDate: "",
  })

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const activeTrimester = useMemo(
    () => trimesters.find((tri) => tri.isActive),
    [trimesters]
  )

  const isActiveSchoolYear = useMemo(
    () => trimesters.length > 0 && trimesters[0].isActiveSchoolYear,
    [trimesters]
  )

  const existingNumbers = useMemo(
    () => trimesters.map((tri) => tri.number),
    [trimesters]
  )

  const availableNumbers = useMemo(
    () => [1, 2, 3].filter((n) => !existingNumbers.includes(n)),
    [existingNumbers]
  )

  const totalEvaluations = useMemo(
    () => trimesters.reduce((sum, tri) => sum + tri.evaluationsCount, 0),
    [trimesters]
  )

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (selectedYearId) loadTrimesters()
  }, [selectedYearId])

  async function loadTrimesters() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/trimesters?schoolYearId=${selectedYearId}`)
      if (res.ok) {
        const data = await res.json()
        setTrimesters(data)
      }
    } catch (err) {
      console.error("Error loading trimesters:", err)
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function getTrimesterLabel(number: number) {
    const key = `trimester${number}` as keyof typeof t.admin
    return t.admin[key] as string
  }

  function formatDisplayDate(dateStr: string) {
    return formatDateLong(dateStr, locale)
  }

  function formatDateForInput(dateStr: string) {
    return new Date(dateStr).toISOString().split("T")[0]
  }

  // ---------------------------------------------------------------------------
  // Dialog openers
  // ---------------------------------------------------------------------------

  function openCreateDialog() {
    if (availableNumbers.length === 0) return
    setFormData({
      number: availableNumbers[0],
      startDate: "",
      endDate: "",
    })
    setIsCreateDialogOpen(true)
  }

  function openEditDialog(trimester: Trimester) {
    setSelectedTrimester(trimester)
    setFormData({
      number: trimester.number,
      startDate: formatDateForInput(trimester.startDate),
      endDate: formatDateForInput(trimester.endDate),
    })
    setIsEditDialogOpen(true)
  }

  // ---------------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------------

  async function handleCreate() {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/trimesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, schoolYearId: selectedYearId }),
      })
      if (res.ok) {
        setIsCreateDialogOpen(false)
        loadTrimesters()
      } else {
        const data = await res.json()
        alert(data.message || t.common.error)
      }
    } catch {
      alert(t.common.error)
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
        loadTrimesters()
      } else {
        const data = await res.json()
        alert(data.message || t.common.error)
      }
    } catch {
      alert(t.common.error)
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
        loadTrimesters()
      } else {
        const data = await res.json()
        alert(data.message || t.common.error)
      }
    } catch {
      alert(t.common.error)
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
        loadTrimesters()
      } else {
        const data = await res.json()
        alert(data.message || t.common.error)
      }
    } catch {
      alert(t.common.error)
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
        loadTrimesters()
      } else {
        const data = await res.json()
        alert(data.message || t.common.error)
      }
    } catch {
      alert(t.common.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Shared form fields
  // ---------------------------------------------------------------------------

  function renderDateFields() {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tri-start">
            {t.admin.startDate} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tri-start"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tri-end">
            {t.admin.endDate} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tri-end"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.activeTrimester}</CardTitle>
            <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
              <CheckCircle2 className="h-4 w-4 text-gspn-maroon-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeTrimester
                ? locale === "fr" ? activeTrimester.nameFr : activeTrimester.nameEn
                : t.admin.noActiveTrimester}
            </div>
            {activeTrimester && (
              <p className="text-xs text-muted-foreground mt-1">
                {activeTrimester.evaluationsCount} {t.admin.evaluationsCount.toLowerCase()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.totalTrimesters}</CardTitle>
            <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
              <CalendarDays className="h-4 w-4 text-gspn-maroon-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trimesters.length} / 3</div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.admin.evaluationsCount}</CardTitle>
            <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
              <GraduationCap className="h-4 w-4 text-gspn-maroon-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvaluations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t.admin.acrossTrimesters.replace("{count}", String(trimesters.length))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trimesters Table */}
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
              <CardTitle className="flex items-center gap-2">
                <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                  <CalendarRange className="h-5 w-5 text-gspn-maroon-500" />
                </div>
                {t.admin.trimesters}
              </CardTitle>
            </div>
            {canEdit && (
              <PermissionGuard resource="academic_year" action="create" inline>
                <Button
                  onClick={openCreateDialog}
                  disabled={availableNumbers.length === 0}
                  className={componentClasses.primaryActionButton}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t.admin.createTrimester}
                </Button>
              </PermissionGuard>
            )}
          </div>
          <CardDescription>{t.admin.trimestersSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : trimesters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarRange className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>{t.admin.noTrimesters}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className={componentClasses.tableHeaderRow}>
                  <TableHead>{t.admin.trimester}</TableHead>
                  <TableHead>{t.admin.startDate}</TableHead>
                  <TableHead>{t.admin.endDate}</TableHead>
                  <TableHead className="text-center">{t.common.status}</TableHead>
                  <TableHead className="text-center">{t.admin.evaluationsCount}</TableHead>
                  {canEdit && <TableHead className="text-right">{t.common.actions}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {trimesters
                  .sort((a, b) => a.number - b.number)
                  .map((trimester, index) => (
                    <TableRow
                      key={trimester.id}
                      className={`${componentClasses.tableRowHover} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <TableCell className="font-medium">
                        {locale === "fr" ? trimester.nameFr : trimester.nameEn}
                      </TableCell>
                      <TableCell>{formatDisplayDate(trimester.startDate)}</TableCell>
                      <TableCell>{formatDisplayDate(trimester.endDate)}</TableCell>
                      <TableCell className="text-center">
                        {trimester.isActive ? (
                          <Badge className="bg-success text-success-foreground">{t.admin.active}</Badge>
                        ) : (
                          <Badge variant="secondary">{t.admin.statusNew}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {trimester.evaluationsCount}
                      </TableCell>
                      {canEdit && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {!trimester.isActive && isActiveSchoolYear && (
                              <PermissionGuard resource="academic_year" action="update" inline>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTrimester(trimester)
                                    setIsActivateDialogOpen(true)
                                  }}
                                  title={t.admin.activateTrimester}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              </PermissionGuard>
                            )}
                            {trimester.isActive && (
                              <PermissionGuard resource="academic_year" action="update" inline>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeactivate(trimester)}
                                  title={t.admin.deactivateTrimester}
                                >
                                  <Pause className="h-4 w-4" />
                                </Button>
                              </PermissionGuard>
                            )}
                            <PermissionGuard resource="academic_year" action="update" inline>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(trimester)}
                                title={t.common.edit}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                            {!trimester.isActive && trimester.evaluationsCount === 0 && (
                              <PermissionGuard resource="academic_year" action="delete" inline>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTrimester(trimester)
                                    setIsDeleteDialogOpen(true)
                                  }}
                                  title={t.common.delete}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </PermissionGuard>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Dialogs                                                             */}
      {/* ------------------------------------------------------------------ */}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.createTrimester}</DialogTitle>
            <DialogDescription>{t.admin.trimestersSubtitle}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.admin.trimesterNumber} <span className="text-destructive">*</span></Label>
              <Select
                value={String(formData.number)}
                onValueChange={(v) => setFormData({ ...formData, number: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableNumbers.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {getTrimesterLabel(n)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {renderDateFields()}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>{t.common.cancel}</Button>
            <Button onClick={handleCreate} disabled={isSubmitting || !formData.startDate || !formData.endDate}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.common.create}
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.admin.trimester}</Label>
              <div className="text-sm text-muted-foreground">
                {selectedTrimester && (locale === "fr" ? selectedTrimester.nameFr : selectedTrimester.nameEn)}
              </div>
            </div>
            {renderDateFields()}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>{t.common.cancel}</Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Confirmation */}
      <AlertDialog open={isActivateDialogOpen} onOpenChange={setIsActivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.activateTrimester}</AlertDialogTitle>
            <AlertDialogDescription>{t.admin.activateTrimesterConfirmation}</AlertDialogDescription>
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

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.deleteTrimester}</AlertDialogTitle>
            <AlertDialogDescription>{t.admin.deleteTrimesterConfirmation}</AlertDialogDescription>
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
    </>
  )
}
