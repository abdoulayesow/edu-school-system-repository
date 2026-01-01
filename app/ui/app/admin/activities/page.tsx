"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Pencil, Trash2, Users, Calendar, Banknote } from "lucide-react"
import type { ActivityType, ActivityStatus } from "@prisma/client"

interface Activity {
  id: string
  name: string
  nameFr: string | null
  description: string | null
  type: ActivityType
  startDate: string
  endDate: string
  fee: number
  capacity: number
  status: ActivityStatus
  isEnabled: boolean
  schoolYearId: string
  creator: { id: string; name: string | null; email: string | null }
  _count: { enrollments: number; payments: number }
}

interface SchoolYear {
  id: string
  name: string
  status: string
  isActive: boolean
}

const ACTIVITY_TYPES: ActivityType[] = ["club", "sport", "arts", "academic", "other"]
const ACTIVITY_STATUSES: ActivityStatus[] = ["draft", "active", "closed", "completed", "cancelled"]

export default function AdminActivitiesPage() {
  const { t, locale } = useI18n()
  const [activities, setActivities] = useState<Activity[]>([])
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<string>("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  // Form state
  const [form, setForm] = useState({
    name: "",
    nameFr: "",
    description: "",
    type: "club" as ActivityType,
    startDate: "",
    endDate: "",
    fee: 0,
    capacity: 30,
    status: "draft" as ActivityStatus,
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

  // Load activities
  useEffect(() => {
    async function loadActivities() {
      if (!selectedSchoolYearId) return
      setLoading(true)
      try {
        const url = new URL("/api/admin/activities", window.location.origin)
        url.searchParams.set("schoolYearId", selectedSchoolYearId)
        const res = await fetch(url.toString())
        if (res.ok) {
          const data = await res.json()
          setActivities(data)
        }
      } catch (err) {
        console.error("Error loading activities:", err)
      } finally {
        setLoading(false)
      }
    }
    loadActivities()
  }, [selectedSchoolYearId])

  const filteredActivities = activities.filter(
    (a) => selectedType === "all" || a.type === selectedType
  )

  const resetForm = () => {
    setForm({
      name: "",
      nameFr: "",
      description: "",
      type: "club",
      startDate: "",
      endDate: "",
      fee: 0,
      capacity: 30,
      status: "draft",
    })
  }

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/admin/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          schoolYearId: selectedSchoolYearId,
        }),
      })
      if (res.ok) {
        const newActivity = await res.json()
        setActivities([...activities, newActivity])
        setIsCreateDialogOpen(false)
        resetForm()
      }
    } catch (err) {
      console.error("Error creating activity:", err)
    }
  }

  const handleEdit = async () => {
    if (!selectedActivity) return
    try {
      const res = await fetch(`/api/admin/activities/${selectedActivity.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const updated = await res.json()
        setActivities(activities.map((a) => (a.id === updated.id ? updated : a)))
        setIsEditDialogOpen(false)
        setSelectedActivity(null)
        resetForm()
      }
    } catch (err) {
      console.error("Error updating activity:", err)
    }
  }

  const handleDelete = async () => {
    if (!selectedActivity) return
    try {
      const res = await fetch(`/api/admin/activities/${selectedActivity.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setActivities(activities.filter((a) => a.id !== selectedActivity.id))
        setIsDeleteDialogOpen(false)
        setSelectedActivity(null)
      }
    } catch (err) {
      console.error("Error deleting activity:", err)
    }
  }

  const openEditDialog = (activity: Activity) => {
    setSelectedActivity(activity)
    setForm({
      name: activity.name,
      nameFr: activity.nameFr || "",
      description: activity.description || "",
      type: activity.type,
      startDate: activity.startDate.split("T")[0],
      endDate: activity.endDate.split("T")[0],
      fee: activity.fee,
      capacity: activity.capacity,
      status: activity.status,
    })
    setIsEditDialogOpen(true)
  }

  const getTypeLabel = (type: ActivityType) => {
    const labels: Record<ActivityType, string> = {
      club: t.activities.typeClub,
      sport: t.activities.typeSport,
      arts: t.activities.typeArts,
      academic: t.activities.typeAcademic,
      other: t.activities.typeOther,
    }
    return labels[type]
  }

  const getStatusLabel = (status: ActivityStatus) => {
    const labels: Record<ActivityStatus, string> = {
      draft: t.activities.statusDraft,
      active: t.activities.statusActive,
      closed: t.activities.statusClosed,
      completed: t.activities.statusCompleted,
      cancelled: t.activities.statusCancelled,
    }
    return labels[status]
  }

  const getStatusColor = (status: ActivityStatus) => {
    const colors: Record<ActivityStatus, string> = {
      draft: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800",
      closed: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-GN", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <PageContainer maxWidth="full">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t.activities.adminTitle}</h1>
            <p className="text-muted-foreground">{t.activities.adminSubtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedSchoolYearId} onValueChange={setSelectedSchoolYearId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t.admin.selectSchoolYear} />
              </SelectTrigger>
              <SelectContent>
                {schoolYears.map((sy) => (
                  <SelectItem key={sy.id} value={sy.id}>
                    {sy.name}
                    {sy.isActive && " (Active)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              {t.activities.addActivity}
            </Button>
          </div>
        </div>

        {/* Type filter tabs */}
        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList>
            <TabsTrigger value="all">{t.activities.tabAll}</TabsTrigger>
            {ACTIVITY_TYPES.map((type) => (
              <TabsTrigger key={type} value={type}>
                {getTypeLabel(type)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Activities grid */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">{t.common.loading}</div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{t.activities.noActivities}</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredActivities.map((activity) => (
              <Card key={activity.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {locale === "fr" && activity.nameFr ? activity.nameFr : activity.name}
                      </CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{getTypeLabel(activity.type)}</Badge>
                        <Badge className={getStatusColor(activity.status)}>
                          {getStatusLabel(activity.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(activity)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedActivity(activity)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {activity._count.enrollments}/{activity.capacity} {t.activities.enrolled}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      <span>{formatCurrency(activity.fee)}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(activity.startDate).toLocaleDateString(locale)} -{" "}
                        {new Date(activity.endDate).toLocaleDateString(locale)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false)
            setIsEditDialogOpen(false)
            setSelectedActivity(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? t.activities.editActivity : t.activities.addActivity}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t.activities.activityName}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t.activities.activityNameFr}</Label>
              <Input
                value={form.nameFr}
                onChange={(e) => setForm({ ...form, nameFr: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t.activities.activityDescription}</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t.activities.activityType}</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as ActivityType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t.common.status}</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as ActivityStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {getStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t.activities.startDate}</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t.activities.endDate}</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t.activities.activityFee} (GNF)</Label>
                <Input
                  type="number"
                  value={form.fee}
                  onChange={(e) => setForm({ ...form, fee: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t.activities.activityCapacity}</Label>
                <Input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 30 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
                resetForm()
              }}
            >
              {t.common.cancel}
            </Button>
            <Button onClick={isEditDialogOpen ? handleEdit : handleCreate}>
              {isEditDialogOpen ? t.activities.updateActivity : t.activities.createActivity}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.activities.deleteActivity}</AlertDialogTitle>
            <AlertDialogDescription>{t.activities.confirmDelete}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t.common.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
