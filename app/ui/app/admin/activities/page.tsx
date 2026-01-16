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
import { DataPagination } from "@/components/data-pagination"
import { Plus, Pencil, Trash2, Users, Calendar, Banknote } from "lucide-react"
import type { ActivityType, ActivityStatus } from "@prisma/client"
import {
  useAdminActivities,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
  type AdminActivity,
} from "@/lib/hooks/use-api"

type Activity = AdminActivity

interface SchoolYear {
  id: string
  name: string
  status: string
  isActive: boolean
}

const ACTIVITY_TYPES: ActivityType[] = ["club", "sport", "arts", "academic", "other"]
const ACTIVITY_STATUSES: ActivityStatus[] = ["draft", "active", "closed", "completed", "cancelled"]

const ITEMS_PER_PAGE = 50

export default function AdminActivitiesPage() {
  const { t, locale } = useI18n()
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<string>("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [offset, setOffset] = useState(0)

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

  // React Query hooks
  const { data: activitiesData, isLoading: loading } = useAdminActivities({
    schoolYearId: selectedSchoolYearId,
    type: selectedType !== "all" ? selectedType : undefined,
    limit: ITEMS_PER_PAGE,
    offset,
  })

  const createMutation = useCreateActivity()
  const updateMutation = useUpdateActivity()
  const deleteMutation = useDeleteActivity()

  const activities = activitiesData?.activities ?? []
  const pagination = activitiesData?.pagination ?? null

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

  // Reset offset when type filter changes
  useEffect(() => {
    setOffset(0)
  }, [selectedType])

  // Type filtering is now done server-side
  const filteredActivities = activities

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
      await createMutation.mutateAsync({
        ...form,
        schoolYearId: selectedSchoolYearId,
      })
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (err) {
      console.error("Error creating activity:", err)
    }
  }

  const handleEdit = async () => {
    if (!selectedActivity) return
    try {
      await updateMutation.mutateAsync({
        id: selectedActivity.id,
        ...form,
      })
      setIsEditDialogOpen(false)
      setSelectedActivity(null)
      resetForm()
    } catch (err) {
      console.error("Error updating activity:", err)
    }
  }

  const handleDelete = async () => {
    if (!selectedActivity) return
    try {
      await deleteMutation.mutateAsync(selectedActivity.id)
      setIsDeleteDialogOpen(false)
      setSelectedActivity(null)
    } catch (err) {
      console.error("Error deleting activity:", err)
    }
  }

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination?.hasMore) {
      setOffset(pagination.offset + pagination.limit)
    }
  }

  const handlePrevPage = () => {
    if (pagination && pagination.offset > 0) {
      setOffset(Math.max(0, pagination.offset - pagination.limit))
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
      draft: "bg-muted text-muted-foreground",
      active: "bg-success/20 text-success dark:bg-success/10",
      closed: "bg-warning/20 text-warning dark:bg-warning/10",
      completed: "bg-nav-highlight/20 text-nav-highlight dark:bg-gspn-gold-900/30 dark:text-gspn-gold-200",
      cancelled: "bg-destructive/20 text-destructive dark:bg-destructive/10",
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
            <PermissionGuard resource="academic_year" action="create" inline>
              <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true) }}>
                <Plus className="h-4 w-4 mr-2" />
                {t.activities.addActivity}
              </Button>
            </PermissionGuard>
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
          <>
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
                        <PermissionGuard resource="academic_year" action="update" inline>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(activity)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard resource="academic_year" action="delete" inline>
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
                        </PermissionGuard>
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
            {pagination && (
              <DataPagination
                pagination={pagination}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
              />
            )}
          </>
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
