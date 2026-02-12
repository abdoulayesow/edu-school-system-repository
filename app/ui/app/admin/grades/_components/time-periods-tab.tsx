"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { PermissionGuard } from "@/components/permission-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Pencil, Trash2, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { componentClasses } from "@/lib/design-tokens"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TimePeriod {
  id: string
  name: string
  nameFr: string | null
  startTime: string
  endTime: string
  order: number
  isActive: boolean
  _count?: { scheduleSlots: number }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TimePeriodsTabProps {
  selectedYearId: string
  canEdit: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TimePeriodsTab({ selectedYearId, canEdit }: TimePeriodsTabProps) {
  const { t, locale } = useI18n()

  const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name: "",
    nameFr: "",
    startTime: "",
    endTime: "",
    order: 1,
    isActive: true,
  })

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (selectedYearId) loadTimePeriods()
  }, [selectedYearId])

  async function loadTimePeriods() {
    setLoading(true)
    try {
      const url = new URL("/api/admin/time-periods", window.location.origin)
      url.searchParams.set("schoolYearId", selectedYearId)
      const res = await fetch(url.toString())
      if (res.ok) {
        const data = await res.json()
        setTimePeriods(data.timePeriods || [])
      }
    } catch (err) {
      console.error("Error loading time periods:", err)
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Form helpers
  // ---------------------------------------------------------------------------

  function resetForm() {
    setForm({
      name: "",
      nameFr: "",
      startTime: "",
      endTime: "",
      order: timePeriods.length + 1,
      isActive: true,
    })
    setError(null)
  }

  function openCreateDialog() {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  function openEditDialog(period: TimePeriod) {
    setSelectedPeriod(period)
    setForm({
      name: period.name,
      nameFr: period.nameFr || "",
      startTime: period.startTime,
      endTime: period.endTime,
      order: period.order,
      isActive: period.isActive,
    })
    setError(null)
    setIsEditDialogOpen(true)
  }

  function openDeleteDialog(period: TimePeriod) {
    setSelectedPeriod(period)
    setIsDeleteDialogOpen(true)
  }

  // ---------------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------------

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/time-periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, schoolYearId: selectedYearId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || t.common.error)
        return
      }
      setIsCreateDialogOpen(false)
      loadTimePeriods()
    } catch {
      setError(t.common.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPeriod) return
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/time-periods/${selectedPeriod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || t.common.error)
        return
      }
      setIsEditDialogOpen(false)
      loadTimePeriods()
    } catch {
      setError(t.common.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!selectedPeriod) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/time-periods/${selectedPeriod.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        alert(data.message || t.common.error)
        return
      }
      setIsDeleteDialogOpen(false)
      loadTimePeriods()
    } catch {
      alert(t.common.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Shared form fields (used in both create and edit dialogs)
  // ---------------------------------------------------------------------------

  function renderFormFields() {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="period-name">
            {t.classes.periodName} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="period-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={locale === "fr" ? "Période 1" : "Period 1"}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="period-name-fr">{t.classes.periodNameFr}</Label>
          <Input
            id="period-name-fr"
            value={form.nameFr}
            onChange={(e) => setForm({ ...form, nameFr: e.target.value })}
            placeholder="Période 1"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="period-start">
              {t.classes.startTime} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="period-start"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="period-end">
              {t.classes.endTime} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="period-end"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="period-order">
            {t.classes.periodOrder} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="period-order"
            type="number"
            min="1"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
            required
          />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
              <CardTitle className="flex items-center gap-2">
                <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                  <Clock className="h-5 w-5 text-gspn-maroon-500" />
                </div>
                {t.classes.timePeriods}
              </CardTitle>
            </div>
            {canEdit && (
              <PermissionGuard resource="academic_year" action="create" inline>
                <Button onClick={openCreateDialog} className={componentClasses.primaryActionButton}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t.classes.createPeriod}
                </Button>
              </PermissionGuard>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : timePeriods.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>{t.classes.noPeriodsDefinedCreate}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className={componentClasses.tableHeaderRow}>
                  <TableHead>{t.classes.periodOrder}</TableHead>
                  <TableHead>{t.classes.periodName}</TableHead>
                  <TableHead>{t.classes.startTime} – {t.classes.endTime}</TableHead>
                  <TableHead>{t.admin.statusColumn}</TableHead>
                  {canEdit && <TableHead className="text-right">{t.admin.actionsColumn}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {timePeriods.map((period, index) => (
                  <TableRow
                    key={period.id}
                    className={`${componentClasses.tableRowHover} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <TableCell className="font-mono font-medium text-gspn-maroon-600">{period.order}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{period.name}</div>
                        {period.nameFr && <div className="text-sm text-muted-foreground">{period.nameFr}</div>}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {period.startTime} – {period.endTime}
                    </TableCell>
                    <TableCell>
                      {period.isActive ? (
                        <Badge variant="default">{t.admin.statusActive}</Badge>
                      ) : (
                        <Badge variant="secondary">{locale === "fr" ? "Inactif" : "Inactive"}</Badge>
                      )}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <PermissionGuard resource="academic_year" action="update" inline>
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(period)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard resource="academic_year" action="delete" inline>
                            <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(period)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </PermissionGuard>
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
            <DialogTitle>{t.classes.createPeriod}</DialogTitle>
            <DialogDescription>
              {locale === "fr" ? "Créer une nouvelle période de cours" : "Create a new time period for the timetable"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            {renderFormFields()}
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>{t.common.cancel}</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t.common.create}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.classes.editPeriod}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            {renderFormFields()}
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>{t.common.cancel}</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t.common.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.classes.deletePeriod}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.classes.confirmDeletePeriod.replace("{name}", selectedPeriod?.name || "")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive text-destructive-foreground">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
