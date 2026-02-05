"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n-provider"
import { StaffRole, PermissionResource, PermissionAction, PermissionScope } from "@prisma/client"
import {
  Search,
  Shield,
  ArrowLeft,
  Users,
  Loader2,
  Plus,
  Trash2,
  Edit3,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PermissionGuard } from "@/components/permission-guard"
import { PageContainer } from "@/components/layout"
import { toast } from "sonner"

interface RolePermission {
  id: string
  resource: PermissionResource
  action: PermissionAction
  scope: PermissionScope
  source: "seeded" | "manual"
  createdAt: string
  updatedAt: string
  creator?: {
    id: string
    name: string
    email: string
  }
  updater?: {
    id: string
    name: string
    email: string
  }
}

interface RolePermissionsData {
  role: StaffRole
  permissions: RolePermission[]
  stats: {
    total: number
    seeded: number
    manual: number
    byResource: Record<string, number>
  }
  affectedUsers: number
}

interface BulkCopyResults {
  added: number
  skipped: number
  errors: number
  details?: {
    added: RolePermission[]
    skipped: string[]
    errors: string[]
  }
}

const STAFF_ROLES: StaffRole[] = [
  "proprietaire",
  "admin_systeme",
  "proviseur",
  "censeur",
  "surveillant_general",
  "directeur",
  "secretariat",
  "comptable",
  "agent_recouvrement",
  "coordinateur",
  "enseignant",
  "professeur_principal",
  "gardien",
]

const PERMISSION_RESOURCES = Object.values(PermissionResource)
const PERMISSION_ACTIONS = Object.values(PermissionAction)
const PERMISSION_SCOPES = Object.values(PermissionScope)

export default function RolePermissionsPage() {
  const params = useParams()
  const router = useRouter()
  const { t, locale } = useI18n()
  const role = params.role as StaffRole

  const [data, setData] = useState<RolePermissionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [resourceFilter, setResourceFilter] = useState<string>("all")

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [showCopyResults, setShowCopyResults] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<RolePermission | null>(null)
  const [processing, setProcessing] = useState(false)

  // Form states
  const [newPermission, setNewPermission] = useState<{
    resource: PermissionResource | ""
    action: PermissionAction | ""
    scope: PermissionScope
  }>({
    resource: "",
    action: "",
    scope: "all",
  })
  const [updateScope, setUpdateScope] = useState<PermissionScope>("all")
  const [copySourceRole, setCopySourceRole] = useState<StaffRole | "">("")
  const [copyResults, setCopyResults] = useState<BulkCopyResults | null>(null)

  useEffect(() => {
    if (role) {
      fetchPermissions()
    }
  }, [role])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/roles/${role}/permissions`)
      if (!res.ok) throw new Error("Failed to fetch permissions")
      const permData = await res.json()
      setData(permData)
    } catch (error) {
      toast.error(t.rolePermissions.errors.fetchFailed)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPermission = async () => {
    if (!newPermission.resource || !newPermission.action) {
      toast.error("Please select resource and action")
      return
    }

    try {
      setProcessing(true)
      const res = await fetch(`/api/admin/roles/${role}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource: newPermission.resource,
          action: newPermission.action,
          scope: newPermission.scope,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to add permission")
      }

      toast.success(t.rolePermissions.roleEditor.permissionAdded)
      setShowAddDialog(false)
      setNewPermission({ resource: "", action: "", scope: "all" })
      await fetchPermissions()
    } catch (error: any) {
      toast.error(error.message || t.rolePermissions.errors.createFailed)
      console.error(error)
    } finally {
      setProcessing(false)
    }
  }

  const handleDeletePermission = async () => {
    if (!selectedPermission) return

    try {
      setProcessing(true)
      const res = await fetch(`/api/admin/roles/${role}/permissions/${selectedPermission.id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete permission")

      toast.success(t.rolePermissions.roleEditor.permissionDeleted)
      setShowDeleteDialog(false)
      setSelectedPermission(null)
      await fetchPermissions()
    } catch (error) {
      toast.error(t.rolePermissions.errors.deleteFailed)
      console.error(error)
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdateScope = async () => {
    if (!selectedPermission) return

    try {
      setProcessing(true)
      const res = await fetch(`/api/admin/roles/${role}/permissions/${selectedPermission.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: updateScope }),
      })

      if (!res.ok) throw new Error("Failed to update scope")

      toast.success(t.rolePermissions.roleEditor.scopeUpdated)
      setShowUpdateDialog(false)
      setSelectedPermission(null)
      await fetchPermissions()
    } catch (error) {
      toast.error(t.rolePermissions.errors.updateFailed)
      console.error(error)
    } finally {
      setProcessing(false)
    }
  }

  const handleCopyPermissions = async () => {
    if (!copySourceRole) {
      toast.error("Please select a source role")
      return
    }

    try {
      setProcessing(true)

      // Fetch permissions from source role
      const sourceRes = await fetch(`/api/admin/roles/${copySourceRole}/permissions`)
      if (!sourceRes.ok) throw new Error("Failed to fetch source permissions")
      const sourceData = await sourceRes.json()

      // Prepare bulk add
      const permissionsToAdd = sourceData.permissions.map((p: RolePermission) => ({
        resource: p.resource,
        action: p.action,
        scope: p.scope,
      }))

      // Bulk add
      const bulkRes = await fetch(`/api/admin/roles/${role}/permissions/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ add: permissionsToAdd }),
      })

      if (!bulkRes.ok) throw new Error("Failed to copy permissions")
      const results = await bulkRes.json()

      setCopyResults({
        added: results.summary.added,
        skipped: results.summary.skipped,
        errors: results.summary.errors,
        details: results.results,
      })

      toast.success(t.rolePermissions.roleEditor.permissionsCopied)
      setShowCopyDialog(false)
      setShowCopyResults(true)
      setCopySourceRole("")
      await fetchPermissions()
    } catch (error) {
      toast.error(t.rolePermissions.errors.copyFailed)
      console.error(error)
    } finally {
      setProcessing(false)
    }
  }

  const openDeleteDialog = (perm: RolePermission) => {
    setSelectedPermission(perm)
    setShowDeleteDialog(true)
  }

  const openUpdateDialog = (perm: RolePermission) => {
    setSelectedPermission(perm)
    setUpdateScope(perm.scope)
    setShowUpdateDialog(true)
  }

  // Get all unique resources
  const allResources = useMemo(() => {
    if (!data) return []
    return Object.keys(data.stats.byResource).sort()
  }, [data])

  // Filter permissions
  const filteredPermissions = useMemo(() => {
    if (!data) return []
    return data.permissions.filter((perm) => {
      const matchesSearch =
        perm.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perm.action.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesResource = resourceFilter === "all" || perm.resource === resourceFilter
      return matchesSearch && matchesResource
    })
  }, [data, searchQuery, resourceFilter])

  // Group permissions by resource
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, RolePermission[]> = {}
    filteredPermissions.forEach((perm) => {
      if (!groups[perm.resource]) groups[perm.resource] = []
      groups[perm.resource].push(perm)
    })
    return groups
  }, [filteredPermissions])

  // Get role display name
  const getRoleName = () => {
    if (!role) return ""
    return t.rolePermissions.roles[role] || role
  }

  const getSourceBadge = (source: "seeded" | "manual") => {
    if (source === "seeded") {
      return (
        <Badge className="bg-gspn-maroon-500/20 text-gspn-maroon-400 border-gspn-maroon-500/30">
          {t.rolePermissions.roleEditor.seeded}
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-gspn-gold-500/20 text-gspn-gold-600 border-gspn-gold-500/30">
          {t.rolePermissions.roleEditor.manual}
        </Badge>
      )
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-gspn-maroon-500 animate-spin" />
        </div>
      </PageContainer>
    )
  }

  if (!data) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-xl text-gray-400">{t.rolePermissions.errors.fetchFailed}</p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PermissionGuard resource="role_assignment" action="view">
      <PageContainer>
        {/* Header accent */}
        <div className="h-1 bg-gspn-maroon-500 -mx-8 -mt-8 mb-8" />

        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/roles")}
          className="mb-6 text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.rolePermissions.roleEditor.backToRoles}
        </Button>

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gspn-maroon-500/10 rounded-xl">
              <Shield className="w-8 h-8 text-gspn-maroon-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{getRoleName()}</h1>
              <p className="text-gray-400 mt-1">{t.rolePermissions.roleEditor.description}</p>
            </div>
          </div>
        </div>

        {/* Role info card */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">{t.rolePermissions.roleEditor.roleInfo}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gspn-maroon-500/10 rounded-xl">
                <Shield className="w-12 h-12 text-gspn-maroon-500" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-white mb-1">{getRoleName()}</p>
                <p className="text-gray-400 text-sm font-mono">{role}</p>
              </div>
              <Badge className="bg-gspn-gold-500 text-black text-lg px-4 py-2">
                <Users className="w-4 h-4 mr-2" />
                {data.affectedUsers} {t.rolePermissions.roleList.users}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    {t.rolePermissions.roleEditor.totalPermissions}
                  </p>
                  <p className="text-3xl font-bold text-white mt-1">{data.stats.total}</p>
                </div>
                <Shield className="w-10 h-10 text-gspn-maroon-500/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    {t.rolePermissions.roleEditor.seededPermissions}
                  </p>
                  <p className="text-3xl font-bold text-white mt-1">{data.stats.seeded}</p>
                </div>
                <Shield className="w-10 h-10 text-gspn-maroon-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    {t.rolePermissions.roleEditor.customPermissions}
                  </p>
                  <p className="text-3xl font-bold text-white mt-1">{data.stats.manual}</p>
                </div>
                <Shield className="w-10 h-10 text-gspn-gold-500/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-gspn-gold-500 hover:bg-gspn-gold-600 text-black font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.rolePermissions.roleEditor.addPermission}
          </Button>
          <Button
            onClick={() => setShowCopyDialog(true)}
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <Copy className="w-4 h-4 mr-2" />
            {t.rolePermissions.roleEditor.copyFrom}
          </Button>
        </div>

        {/* Search and filter controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              placeholder={t.rolePermissions.roleEditor.searchPermissions}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 focus:border-gspn-maroon-500"
            />
          </div>
          <Select value={resourceFilter} onValueChange={setResourceFilter}>
            <SelectTrigger className="w-full md:w-72 bg-gray-900 border-gray-800 text-white focus:border-gspn-maroon-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all" className="text-white focus:bg-gray-800 focus:text-white">
                {t.rolePermissions.roleEditor.allResources}
              </SelectItem>
              {allResources.map((resource) => (
                <SelectItem
                  key={resource}
                  value={resource}
                  className="text-white focus:bg-gray-800 focus:text-white"
                >
                  {t.roleManagement.resources[resource as PermissionResource] || resource}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Permissions grid */}
        {Object.keys(groupedPermissions).length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-12 text-center">
              <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">{t.rolePermissions.roleEditor.noPermissions}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([resource, perms]) => (
              <Card key={resource} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                    <CardTitle className="text-lg text-white">
                      {t.roleManagement.resources[resource as PermissionResource] || resource}
                    </CardTitle>
                    <Badge variant="outline" className="ml-auto bg-gray-800 text-white border-gray-700">
                      {perms.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {perms.map((perm) => (
                      <div
                        key={perm.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-1">
                            <p className="text-white font-medium">
                              {t.roleManagement.actions[perm.action] || perm.action}
                            </p>
                            <p className="text-sm text-gray-400 mt-0.5">
                              {t.rolePermissions.roleEditor.scope}:{" "}
                              {t.roleManagement.scopes[perm.scope] || perm.scope}
                            </p>
                          </div>
                          {getSourceBadge(perm.source)}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openUpdateDialog(perm)}
                            className="text-gray-400 hover:text-white hover:bg-gray-700"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDeleteDialog(perm)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Permission Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>{t.rolePermissions.roleEditor.addPermission}</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add a new permission to the {getRoleName()} role
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  {t.rolePermissions.roleEditor.resource}
                </label>
                <Select
                  value={newPermission.resource}
                  onValueChange={(value) =>
                    setNewPermission({ ...newPermission, resource: value as PermissionResource })
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder={t.rolePermissions.roleEditor.selectResource} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800">
                    {PERMISSION_RESOURCES.map((res) => (
                      <SelectItem
                        key={res}
                        value={res}
                        className="text-white focus:bg-gray-800 focus:text-white"
                      >
                        {t.roleManagement.resources[res] || res}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  {t.rolePermissions.roleEditor.action}
                </label>
                <Select
                  value={newPermission.action}
                  onValueChange={(value) =>
                    setNewPermission({ ...newPermission, action: value as PermissionAction })
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder={t.rolePermissions.roleEditor.selectAction} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800">
                    {PERMISSION_ACTIONS.map((act) => (
                      <SelectItem
                        key={act}
                        value={act}
                        className="text-white focus:bg-gray-800 focus:text-white"
                      >
                        {t.roleManagement.actions[act] || act}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  {t.rolePermissions.roleEditor.scope}
                </label>
                <Select
                  value={newPermission.scope}
                  onValueChange={(value) =>
                    setNewPermission({ ...newPermission, scope: value as PermissionScope })
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800">
                    {PERMISSION_SCOPES.map((scope) => (
                      <SelectItem
                        key={scope}
                        value={scope}
                        className="text-white focus:bg-gray-800 focus:text-white"
                      >
                        {t.roleManagement.scopes[scope] || scope}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                {t.rolePermissions.roleEditor.cancel}
              </Button>
              <Button
                onClick={handleAddPermission}
                disabled={processing || !newPermission.resource || !newPermission.action}
                className="bg-gspn-gold-500 hover:bg-gspn-gold-600 text-black font-semibold"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t.rolePermissions.roleEditor.addPermission
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Permission Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>{t.rolePermissions.roleEditor.deletePermission}</DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to delete this permission? This will affect {data.affectedUsers} users.
              </DialogDescription>
            </DialogHeader>
            {selectedPermission && (
              <div className="py-4">
                <div className="p-4 bg-gray-800 rounded-lg space-y-2">
                  <p className="text-white">
                    <span className="text-gray-400">Resource:</span>{" "}
                    {t.roleManagement.resources[selectedPermission.resource] || selectedPermission.resource}
                  </p>
                  <p className="text-white">
                    <span className="text-gray-400">Action:</span>{" "}
                    {t.roleManagement.actions[selectedPermission.action] || selectedPermission.action}
                  </p>
                  <p className="text-white">
                    <span className="text-gray-400">Scope:</span>{" "}
                    {t.roleManagement.scopes[selectedPermission.scope] || selectedPermission.scope}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                {t.rolePermissions.roleEditor.cancel}
              </Button>
              <Button
                onClick={handleDeletePermission}
                disabled={processing}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t.rolePermissions.roleEditor.deletePermission
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Scope Dialog */}
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>{t.rolePermissions.roleEditor.updateScope}</DialogTitle>
              <DialogDescription className="text-gray-400">
                Change the scope for this permission
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm text-gray-400 mb-2 block">
                {t.rolePermissions.roleEditor.scope}
              </label>
              <Select value={updateScope} onValueChange={(value) => setUpdateScope(value as PermissionScope)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  {PERMISSION_SCOPES.map((scope) => (
                    <SelectItem
                      key={scope}
                      value={scope}
                      className="text-white focus:bg-gray-800 focus:text-white"
                    >
                      {t.roleManagement.scopes[scope] || scope}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUpdateDialog(false)}
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                {t.rolePermissions.roleEditor.cancel}
              </Button>
              <Button
                onClick={handleUpdateScope}
                disabled={processing}
                className="bg-gspn-gold-500 hover:bg-gspn-gold-600 text-black font-semibold"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t.rolePermissions.roleEditor.updateScope
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Copy From Role Dialog */}
        <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>{t.rolePermissions.roleEditor.copyFrom}</DialogTitle>
              <DialogDescription className="text-gray-400">
                {t.rolePermissions.roleEditor.copyMessage}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm text-gray-400 mb-2 block">
                {t.rolePermissions.roleEditor.selectSourceRole}
              </label>
              <Select value={copySourceRole} onValueChange={(value) => setCopySourceRole(value as StaffRole)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder={t.rolePermissions.roleEditor.selectSourceRole} />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  {STAFF_ROLES.filter((r) => r !== role).map((r) => (
                    <SelectItem key={r} value={r} className="text-white focus:bg-gray-800 focus:text-white">
                      {t.rolePermissions.roles[r] || r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCopyDialog(false)}
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                {t.rolePermissions.roleEditor.cancel}
              </Button>
              <Button
                onClick={handleCopyPermissions}
                disabled={processing || !copySourceRole}
                className="bg-gspn-gold-500 hover:bg-gspn-gold-600 text-black font-semibold"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t.rolePermissions.roleEditor.copy
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Copy Results Dialog */}
        <Dialog open={showCopyResults} onOpenChange={setShowCopyResults}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>{t.rolePermissions.roleEditor.copyPermissions}</DialogTitle>
              <DialogDescription className="text-gray-400">Copy operation completed</DialogDescription>
            </DialogHeader>
            {copyResults && (
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-sm text-emerald-400 mb-1">
                      {t.rolePermissions.roleEditor.copyResults.added}
                    </p>
                    <p className="text-2xl font-bold text-white">{copyResults.added}</p>
                  </div>
                  <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">
                      {t.rolePermissions.roleEditor.copyResults.skipped}
                    </p>
                    <p className="text-2xl font-bold text-white">{copyResults.skipped}</p>
                  </div>
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400 mb-1">
                      {t.rolePermissions.roleEditor.copyResults.errors}
                    </p>
                    <p className="text-2xl font-bold text-white">{copyResults.errors}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => {
                  setShowCopyResults(false)
                  setCopyResults(null)
                }}
                className="bg-gspn-gold-500 hover:bg-gspn-gold-600 text-black font-semibold"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </PermissionGuard>
  )
}
