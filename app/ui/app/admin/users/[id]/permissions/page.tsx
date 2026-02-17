"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n-provider"
import { StaffRole, PermissionResource, PermissionAction, PermissionScope } from "@prisma/client"
import {
  Search,
  Shield,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Minus,
  ArrowLeft,
  User,
  Zap,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
import { PermissionGuard } from "@/components/permission-guard"
import { toast } from "sonner"

interface UserInfo {
  id: string
  name: string
  email: string
  staffRole: StaffRole
}

interface Permission {
  resource: string
  action: string
  scope: string
}

interface EffectivePermission extends Permission {
  source: "role" | "granted" | "denied"
  overrideId?: string
}

interface Override {
  id: string
  resource: string
  action: string
  scope: string
  granted: boolean
  reason: string | null
  grantor: {
    id: string
    name: string | null
    email: string | null
  }
  grantedAt: string
}

interface PermissionsData {
  user: UserInfo
  rolePermissions: Permission[]
  overrides: Override[]
  effectivePermissions: EffectivePermission[]
}

export default function UserPermissionsPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useI18n()
  const userId = params.id as string

  const [data, setData] = useState<PermissionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [resourceFilter, setResourceFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"effective" | "diff">("diff")

  // Dialog states
  const [showGrantDialog, setShowGrantDialog] = useState(false)
  const [showDenyDialog, setShowDenyDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const [selectedOverride, setSelectedOverride] = useState<Override | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchPermissions()
  }, [userId])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/users/${userId}/permissions`)
      if (!res.ok) throw new Error("Failed to fetch permissions")
      const permData = await res.json()
      setData(permData)
    } catch (error) {
      toast.error("Failed to fetch permissions")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleGrant = async () => {
    if (!selectedPermission) return

    try {
      setProcessing(true)
      const res = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource: selectedPermission.resource,
          action: selectedPermission.action,
          scope: selectedPermission.scope,
          effect: "grant",
        }),
      })

      if (!res.ok) throw new Error("Failed to add override")

      toast.success("Override added successfully")
      setShowGrantDialog(false)
      setSelectedPermission(null)
      await fetchPermissions()
    } catch (error) {
      toast.error("Failed to add override")
      console.error(error)
    } finally {
      setProcessing(false)
    }
  }

  const handleDeny = async () => {
    if (!selectedPermission) return

    try {
      setProcessing(true)
      const res = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource: selectedPermission.resource,
          action: selectedPermission.action,
          scope: selectedPermission.scope,
          effect: "deny",
        }),
      })

      if (!res.ok) throw new Error("Failed to add override")

      toast.success("Override added successfully")
      setShowDenyDialog(false)
      setSelectedPermission(null)
      await fetchPermissions()
    } catch (error) {
      toast.error("Failed to add override")
      console.error(error)
    } finally {
      setProcessing(false)
    }
  }

  const handleRemove = async () => {
    if (!selectedOverride) return

    try {
      setProcessing(true)
      const res = await fetch(`/api/admin/users/${userId}/permissions/${selectedOverride.id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to remove override")

      toast.success("Override removed successfully")
      setShowRemoveDialog(false)
      setSelectedOverride(null)
      await fetchPermissions()
    } catch (error) {
      toast.error("Failed to remove override")
      console.error(error)
    } finally {
      setProcessing(false)
    }
  }

  const openGrantDialog = (perm: Permission) => {
    setSelectedPermission(perm)
    setShowGrantDialog(true)
  }

  const openDenyDialog = (perm: Permission) => {
    setSelectedPermission(perm)
    setShowDenyDialog(true)
  }

  const openRemoveDialog = (override: Override) => {
    setSelectedOverride(override)
    setShowRemoveDialog(true)
  }

  // Get all unique resources
  const allResources = useMemo(() => {
    if (!data) return []
    const resources = new Set<string>()
    data.rolePermissions.forEach(p => resources.add(p.resource))
    data.effectivePermissions.forEach(p => resources.add(p.resource))
    return Array.from(resources).sort()
  }, [data])

  // Filter permissions
  const filteredRolePermissions = useMemo(() => {
    if (!data) return []
    return data.rolePermissions.filter(perm => {
      const matchesSearch =
        perm.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perm.action.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesResource = resourceFilter === "all" || perm.resource === resourceFilter
      return matchesSearch && matchesResource
    })
  }, [data, searchQuery, resourceFilter])

  const filteredEffectivePermissions = useMemo(() => {
    if (!data) return []
    return data.effectivePermissions.filter(perm => {
      const matchesSearch =
        perm.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perm.action.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesResource = resourceFilter === "all" || perm.resource === resourceFilter
      return matchesSearch && matchesResource
    })
  }, [data, searchQuery, resourceFilter])

  // Group permissions by resource
  const groupedRolePermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {}
    filteredRolePermissions.forEach(perm => {
      if (!groups[perm.resource]) groups[perm.resource] = []
      groups[perm.resource].push(perm)
    })
    return groups
  }, [filteredRolePermissions])

  const groupedEffectivePermissions = useMemo(() => {
    const groups: Record<string, EffectivePermission[]> = {}
    filteredEffectivePermissions.forEach(perm => {
      if (!groups[perm.resource]) groups[perm.resource] = []
      groups[perm.resource].push(perm)
    })
    return groups
  }, [filteredEffectivePermissions])

  // Stats
  const stats = useMemo(() => {
    if (!data) return { total: 0, role: 0, grants: 0, denials: 0 }
    return {
      total: data.effectivePermissions.length,
      role: data.rolePermissions.length,
      grants: data.overrides.filter(o => o.granted === true).length,
      denials: data.overrides.filter(o => o.granted === false).length,
    }
  }, [data])

  const getSourceBadge = (source: string, overrideId?: string) => {
    if (source === "role") {
      return (
        <Badge className="bg-slate-700/50 text-slate-300 border-slate-600">
          <Shield className="w-3 h-3 mr-1" />
          {t.permissionOverrides.fromRole}
        </Badge>
      )
    } else if (source === "granted") {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          <Plus className="w-3 h-3 mr-1" />
          {t.permissionOverrides.granted}
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          <Minus className="w-3 h-3 mr-1" />
          {t.permissionOverrides.denied}
        </Badge>
      )
    }
  }

  const isInRole = (perm: Permission): boolean => {
    if (!data) return false
    return data.rolePermissions.some(
      rp => rp.resource === perm.resource && rp.action === perm.action && rp.scope === perm.scope
    )
  }

  const isInEffective = (perm: Permission): boolean => {
    if (!data) return false
    return data.effectivePermissions.some(
      ep => ep.resource === perm.resource && ep.action === perm.action && ep.scope === perm.scope
    )
  }

  const getOverrideForPermission = (perm: Permission): Override | null => {
    if (!data) return null
    return data.overrides.find(
      o => o.resource === perm.resource && o.action === perm.action && o.scope === perm.scope
    ) || null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#8B2332] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <p className="text-xl">Failed to fetch permissions</p>
        </div>
      </div>
    )
  }

  return (
    <PermissionGuard resource="permission_overrides" action="view">
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Geometric background pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/users/roles")}
              className="mb-4 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight mb-3">
                  {t.permissionOverrides.title}
                </h1>
                <p className="text-slate-400 text-lg">
                  {t.permissionOverrides.description}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#8B2332] to-rose-900 shadow-2xl shadow-[#8B2332]/20">
                <Lock className="w-8 h-8 text-[#D4AF37]" />
              </div>
            </div>
          </motion.div>

          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8B2332] to-rose-900 flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                {data.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">{data.user.name}</h2>
                <p className="text-slate-400 mb-2">{data.user.email}</p>
                <Badge className="bg-gradient-to-r from-[#D4AF37] to-yellow-600 text-slate-900 font-semibold">
                  <User className="w-3 h-3 mr-1" />
                  {t.roleManagement.roles[data.user.staffRole]}
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                    {t.permissionOverrides.effectPermissionCount}
                  </p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <Zap className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900/60 to-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                    {t.permissionOverrides.rolePermissionCount}
                  </p>
                  <p className="text-3xl font-bold text-white">{stats.role}</p>
                </div>
                <Shield className="w-10 h-10 text-slate-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-900/10 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-400 text-xs font-medium uppercase tracking-wider mb-1">
                    {t.permissionOverrides.grantsCount}
                  </p>
                  <p className="text-3xl font-bold text-emerald-400">{stats.grants}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-emerald-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-900/20 to-red-900/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-400 text-xs font-medium uppercase tracking-wider mb-1">
                    {t.permissionOverrides.denialsCount}
                  </p>
                  <p className="text-3xl font-bold text-red-400">{stats.denials}</p>
                </div>
                <TrendingDown className="w-10 h-10 text-red-500" />
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6 flex flex-col md:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                placeholder={t.permissionOverrides.searchPermissions}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus:border-[#8B2332] focus:ring-[#8B2332]/20"
              />
            </div>
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-full md:w-72 h-12 bg-slate-900/50 border-slate-800 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                <SelectItem value="all" className="text-white focus:bg-slate-800 focus:text-white">
                  {t.permissionOverrides.allResources}
                </SelectItem>
                {allResources.map(resource => (
                  <SelectItem key={resource} value={resource} className="text-white focus:bg-slate-800 focus:text-white">
                    {(t.roleManagement.resources[resource as keyof typeof t.roleManagement.resources]) || resource}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Split View: Role Baseline vs Current State */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Role Baseline */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-slate-400" />
                  {t.permissionOverrides.roleBaseline}
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  {t.roleManagement.roleDescriptions[data.user.staffRole]}
                </p>
              </div>
              <div className="p-6 max-h-[600px] overflow-y-auto">
                {Object.entries(groupedRolePermissions).map(([resource, perms]) => (
                  <div key={resource} className="mb-6 last:mb-0">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-500" />
                      {(t.roleManagement.resources[resource as keyof typeof t.roleManagement.resources]) || resource}
                    </h4>
                    <div className="space-y-2">
                      {perms.map((perm, idx) => {
                        const override = getOverrideForPermission(perm)
                        const isGranted = isInEffective(perm)

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <Badge className="bg-slate-700/50 text-slate-300 border-slate-600">
                                {(t.roleManagement.actions[perm.action as keyof typeof t.roleManagement.actions]) || perm.action}
                                {perm.scope !== "all" && (
                                  <span className="ml-1 text-slate-400">
                                    ({(t.roleManagement.scopes[perm.scope as keyof typeof t.roleManagement.scopes]) || perm.scope})
                                  </span>
                                )}
                              </Badge>
                              {override && override.granted === false && (
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Denied
                                </Badge>
                              )}
                            </div>
                            <PermissionGuard resource="permission_overrides" action="create" fallback={null}>
                              {!override && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openDenyDialog(perm)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Minus className="w-4 h-4 mr-1" />
                                  Deny
                                </Button>
                              )}
                              {override && override.granted === false && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openRemoveDialog(override)}
                                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                                >
                                  <Unlock className="w-4 h-4 mr-1" />
                                  Remove
                                </Button>
                              )}
                            </PermissionGuard>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current State (Effective) */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#8B2332]/20 to-rose-900/20 border-b border-[#8B2332]/30 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#D4AF37]" />
                  {t.permissionOverrides.currentState}
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Role permissions + overrides ({stats.grants} grants, {stats.denials} denials)
                </p>
              </div>
              <div className="p-6 max-h-[600px] overflow-y-auto">
                {Object.entries(groupedEffectivePermissions).map(([resource, perms]) => (
                  <div key={resource} className="mb-6 last:mb-0">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                      {(t.roleManagement.resources[resource as keyof typeof t.roleManagement.resources]) || resource}
                    </h4>
                    <div className="space-y-2">
                      {perms.map((perm, idx) => {
                        const override = getOverrideForPermission(perm)

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <Badge className={
                                perm.source === "granted"
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : "bg-slate-700/50 text-slate-300 border-slate-600"
                              }>
                                {perm.source === "granted" && <Plus className="w-3 h-3 mr-1" />}
                                {perm.source === "role" && <Shield className="w-3 h-3 mr-1" />}
                                {(t.roleManagement.actions[perm.action as keyof typeof t.roleManagement.actions]) || perm.action}
                                {perm.scope !== "all" && (
                                  <span className="ml-1 opacity-70">
                                    ({(t.roleManagement.scopes[perm.scope as keyof typeof t.roleManagement.scopes]) || perm.scope})
                                  </span>
                                )}
                              </Badge>
                            </div>
                            <PermissionGuard resource="permission_overrides" action="delete" fallback={null}>
                              {override && override.granted === true && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openRemoveDialog(override)}
                                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                                >
                                  <Minus className="w-4 h-4 mr-1" />
                                  Remove
                                </Button>
                              )}
                            </PermissionGuard>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {/* Available Grants Section */}
                <PermissionGuard resource="permission_overrides" action="create" fallback={null}>
                  <div className="mt-8 pt-6 border-t border-slate-700">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-400" />
                      Available to Grant
                    </h4>
                    <div className="space-y-2">
                      {Object.values(PermissionResource).slice(0, 5).map((resource) => (
                        Object.values(PermissionAction).slice(0, 2).map((action) => {
                          const perm = { resource, action, scope: PermissionScope.all }
                          const inRole = isInRole(perm)
                          const inEffective = isInEffective(perm)

                          if (inRole || inEffective) return null

                          return (
                            <div
                              key={`${resource}:${action}`}
                              className="flex items-center justify-between p-3 rounded-lg bg-slate-800/20 border border-slate-700/30 hover:border-emerald-500/30 transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-slate-400 border-slate-600">
                                  {(t.roleManagement.resources[resource as keyof typeof t.roleManagement.resources])} - {(t.roleManagement.actions[action as keyof typeof t.roleManagement.actions])}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openGrantDialog(perm)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Grant
                              </Button>
                            </div>
                          )
                        })
                      ))}
                    </div>
                  </div>
                </PermissionGuard>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Grant Dialog */}
        <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-400">
                <Plus className="w-5 h-5" />
                {t.permissionOverrides.confirmGrant}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {t.permissionOverrides.grantMessage}
              </DialogDescription>
            </DialogHeader>
            {selectedPermission && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-white font-mono text-sm">
                  {selectedPermission.resource} : {selectedPermission.action} ({selectedPermission.scope})
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowGrantDialog(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                disabled={processing}
              >
                {t.permissionOverrides.cancel}
              </Button>
              <Button
                onClick={handleGrant}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t.permissionOverrides.grant}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Deny Dialog */}
        <Dialog open={showDenyDialog} onOpenChange={setShowDenyDialog}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-400">
                <XCircle className="w-5 h-5" />
                {t.permissionOverrides.confirmDeny}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {t.permissionOverrides.denyMessage}
              </DialogDescription>
            </DialogHeader>
            {selectedPermission && (
              <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                <p className="text-white font-mono text-sm">
                  {selectedPermission.resource} : {selectedPermission.action} ({selectedPermission.scope})
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDenyDialog(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                disabled={processing}
              >
                {t.permissionOverrides.cancel}
              </Button>
              <Button
                onClick={handleDeny}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    {t.permissionOverrides.deny}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove Dialog */}
        <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Unlock className="w-5 h-5 text-slate-400" />
                {t.permissionOverrides.confirmRemove}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {t.permissionOverrides.removeMessage}
              </DialogDescription>
            </DialogHeader>
            {selectedOverride && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-white font-mono text-sm mb-2">
                  {selectedOverride.resource} : {selectedOverride.action} ({selectedOverride.scope})
                </p>
                <p className="text-slate-400 text-xs">
                  {selectedOverride.granted ? "Grant" : "Denial"} by {selectedOverride.grantor.name}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRemoveDialog(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                disabled={processing}
              >
                {t.permissionOverrides.cancel}
              </Button>
              <Button
                onClick={handleRemove}
                className="bg-slate-700 hover:bg-slate-600 text-white"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t.permissionOverrides.remove}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  )
}
