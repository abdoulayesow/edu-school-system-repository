"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { PermissionGuard } from "@/components/permission-guard"
import { PageContainer } from "@/components/layout"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Pencil, Trash2, Clock, AlertTriangle } from "lucide-react"
import { componentClasses } from "@/lib/design-tokens"

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

interface SchoolYear {
  id: string
  name: string
  status: string
  isActive: boolean
}

export default function AdminTimePeriodsPage() {
  const { t, locale } = useI18n()
  const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([])
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    name: "",
    nameFr: "",
    startTime: "",
    endTime: "",
    order: 1,
    isActive: true,
  })

  // Load school years
  useEffect(() => {
    async function loadSchoolYears() {
      try {
        const res = await fetch("/api/school-years")
        if (res.ok) {
          const data = await res.json()
          setSchoolYears(data)
          const active = data.find((sy: SchoolYear) => sy.isActive)
          if (active) {
            setSelectedSchoolYearId(active.id)
          }
        }
      } catch (err) {
        console.error("Error loading school years:", err)
      }
    }
    loadSchoolYears()
  }, [])

  // Load time periods
  useEffect(() => {
    async function loadTimePeriods() {
      if (!selectedSchoolYearId) return
      setLoading(true)
      try {
        const url = new URL("/api/admin/time-periods", window.location.origin)
        url.searchParams.set("schoolYearId", selectedSchoolYearId)
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
    loadTimePeriods()
  }, [selectedSchoolYearId])

  const resetForm = () => {
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

  const openCreateDialog = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (period: TimePeriod) => {
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

  const openDeleteDialog = (period: TimePeriod) => {
    setSelectedPeriod(period)
    setIsDeleteDialogOpen(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const res = await fetch("/api/admin/time-periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          schoolYearId: selectedSchoolYearId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || (locale === 'fr' ? "Échec de la création" : "Failed to create"))
        return
      }

      setIsCreateDialogOpen(false)
      loadTimePeriods()
    } catch (err) {
      console.error("Error creating time period:", err)
      setError(locale === 'fr' ? "Une erreur est survenue" : "An error occurred")
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPeriod) return
    setError(null)

    try {
      const res = await fetch(`/api/admin/time-periods/${selectedPeriod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || (locale === 'fr' ? "Échec de la mise à jour" : "Failed to update"))
        return
      }

      setIsEditDialogOpen(false)
      loadTimePeriods()
    } catch (err) {
      console.error("Error updating time period:", err)
      setError(locale === 'fr' ? "Une erreur est survenue" : "An error occurred")
    }
  }

  const handleDelete = async () => {
    if (!selectedPeriod) return

    try {
      const res = await fetch(`/api/admin/time-periods/${selectedPeriod.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.message || (locale === 'fr' ? "Échec de la suppression" : "Failed to delete"))
        return
      }

      setIsDeleteDialogOpen(false)
      loadTimePeriods()
    } catch (err) {
      console.error("Error deleting time period:", err)
      alert(locale === 'fr' ? "Une erreur est survenue" : "An error occurred")
    }
  }

  const loadTimePeriods = () => {
    if (!selectedSchoolYearId) return
    setLoading(true)
    const url = new URL("/api/admin/time-periods", window.location.origin)
    url.searchParams.set("schoolYearId", selectedSchoolYearId)
    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        setTimePeriods(data.timePeriods || [])
      })
      .catch((err) => {
        console.error("Error loading time periods:", err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header accent bar */}
        <div className="h-1 bg-gspn-maroon-500 -mx-6" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {locale === 'fr' ? 'Périodes de Cours' : 'Time Periods'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {locale === 'fr'
                ? 'Gérer les périodes de cours pour l\'emploi du temps'
                : 'Manage time periods for the timetable'}
            </p>
          </div>
          <PermissionGuard resource="academic_year" action="create" inline>
            <Button onClick={openCreateDialog} className={componentClasses.primaryActionButton}>
              <Plus className="mr-2 h-4 w-4" />
              {locale === 'fr' ? 'Nouvelle Période' : 'New Period'}
            </Button>
          </PermissionGuard>
        </div>

        {/* School Year Selector */}
        <Card>
          <CardHeader>
            <CardTitle>
              {locale === 'fr' ? 'Année Scolaire' : 'School Year'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedSchoolYearId}
              onValueChange={setSelectedSchoolYearId}
            >
              <SelectTrigger>
                <SelectValue placeholder={locale === 'fr' ? 'Sélectionner...' : 'Select...'} />
              </SelectTrigger>
              <SelectContent>
                {schoolYears.map((sy) => (
                  <SelectItem key={sy.id} value={sy.id}>
                    {sy.name} {sy.isActive && `(${locale === 'fr' ? 'Active' : 'Active'})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Time Periods Table */}
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
              <CardTitle className="flex items-center gap-2">
                <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                  <Clock className="h-5 w-5 text-gspn-maroon-500" />
                </div>
                {locale === 'fr' ? 'Liste des Périodes' : 'Period List'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {locale === 'fr' ? 'Chargement...' : 'Loading...'}
              </div>
            ) : timePeriods.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {locale === 'fr'
                  ? 'Aucune période définie. Créez-en une pour commencer.'
                  : 'No time periods defined. Create one to get started.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gspn-gold-50/50 dark:bg-gspn-gold-950/20">
                    <TableHead>{locale === 'fr' ? 'Ordre' : 'Order'}</TableHead>
                    <TableHead>{locale === 'fr' ? 'Nom' : 'Name'}</TableHead>
                    <TableHead>{locale === 'fr' ? 'Horaire' : 'Time'}</TableHead>
                    <TableHead>{locale === 'fr' ? 'Statut' : 'Status'}</TableHead>
                    <TableHead className="text-right">
                      {locale === 'fr' ? 'Actions' : 'Actions'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timePeriods.map((period) => (
                    <TableRow key={period.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{period.order}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{period.name}</div>
                          {period.nameFr && (
                            <div className="text-sm text-muted-foreground">
                              {period.nameFr}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {period.startTime} - {period.endTime}
                      </TableCell>
                      <TableCell>
                        {period.isActive ? (
                          <Badge variant="default">
                            {locale === 'fr' ? 'Actif' : 'Active'}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {locale === 'fr' ? 'Inactif' : 'Inactive'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <PermissionGuard resource="academic_year" action="update" inline>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(period)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard resource="academic_year" action="delete" inline>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(period)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {locale === 'fr' ? 'Nouvelle Période' : 'New Period'}
            </DialogTitle>
            <DialogDescription>
              {locale === 'fr'
                ? 'Créer une nouvelle période de cours'
                : 'Create a new time period'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {locale === 'fr' ? 'Nom' : 'Name'} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={locale === 'fr' ? 'Période 1' : 'Period 1'}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameFr">
                {locale === 'fr' ? 'Nom (Français)' : 'Name (French)'}
              </Label>
              <Input
                id="nameFr"
                value={form.nameFr}
                onChange={(e) => setForm({ ...form, nameFr: e.target.value })}
                placeholder="Période 1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">
                  {locale === 'fr' ? 'Début' : 'Start'} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">
                  {locale === 'fr' ? 'Fin' : 'End'} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">
                {locale === 'fr' ? 'Ordre' : 'Order'} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="order"
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                {locale === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button type="submit">
                {locale === 'fr' ? 'Créer' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {locale === 'fr' ? 'Modifier la Période' : 'Edit Period'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                {locale === 'fr' ? 'Nom' : 'Name'} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nameFr">
                {locale === 'fr' ? 'Nom (Français)' : 'Name (French)'}
              </Label>
              <Input
                id="edit-nameFr"
                value={form.nameFr}
                onChange={(e) => setForm({ ...form, nameFr: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startTime">
                  {locale === 'fr' ? 'Début' : 'Start'} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endTime">
                  {locale === 'fr' ? 'Fin' : 'End'} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-order">
                {locale === 'fr' ? 'Ordre' : 'Order'} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-order"
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                {locale === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button type="submit">
                {locale === 'fr' ? 'Enregistrer' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {locale === 'fr' ? 'Confirmer la suppression' : 'Confirm deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {locale === 'fr'
                ? `Êtes-vous sûr de vouloir supprimer "${selectedPeriod?.name}"? Tous les créneaux associés seront également supprimés.`
                : `Are you sure you want to delete "${selectedPeriod?.name}"? All associated schedule slots will also be deleted.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {locale === 'fr' ? 'Annuler' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {locale === 'fr' ? 'Supprimer' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
