"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n-provider"
import { StaffRole } from "@prisma/client"
import { Search, Crown, Shield, Eye, UserCog, AlertCircle, CheckCircle2, Clock, Lock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ROLE_PERMISSIONS, type RolePermissionEntry } from "@/lib/permissions-v2"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  staffRole: StaffRole
  schoolLevel: string | null
  status: string
  createdAt: string
  lastLoginAt: string | null
}

export default function UserRolesPage() {
  const { t } = useI18n()
  const router = useRouter()
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<StaffRole | null>(null)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/users/roles")
      if (!res.ok) throw new Error("Failed to fetch users")
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      toast.error("Failed to fetch users")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Read permissions from code-based mapping (no API call needed)
  const isWildcardRole = selectedRole ? ROLE_PERMISSIONS[selectedRole].permissions === "*" : false

  const rolePermissions = useMemo<RolePermissionEntry[]>(() => {
    if (!selectedRole) return []
    const config = ROLE_PERMISSIONS[selectedRole]
    if (config.permissions === "*") return []
    return config.permissions
  }, [selectedRole])

  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRole) return

    try {
      setUpdating(true)
      const res = await fetch(`/api/admin/users/${selectedUser.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffRole: selectedRole }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to update role")
      }

      const updatedUser = await res.json()
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u))
      toast.success("Role updated successfully")
      setShowRoleDialog(false)
      setSelectedUser(null)
      setSelectedRole(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to update role")
      console.error(error)
    } finally {
      setUpdating(false)
    }
  }

  const openRoleDialog = (user: User) => {
    setSelectedUser(user)
    setSelectedRole(user.staffRole)
    setShowRoleDialog(true)
  }

  const openPermissionsDialog = useCallback((role: StaffRole) => {
    setSelectedRole(role)
    setShowPermissionsDialog(true)
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === "all" || user.staffRole === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, searchQuery, roleFilter])

  const allRoles = Object.values(StaffRole)

  const getRoleBadgeColor = (role: StaffRole) => {
    if (role === StaffRole.proprietaire) return "bg-gradient-to-r from-amber-500 to-yellow-600 text-white"
    if (role === StaffRole.admin_systeme) return "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
    if (role === StaffRole.proviseur || role === StaffRole.directeur) return "bg-gradient-to-r from-rose-600 to-red-700 text-white"
    return "bg-slate-700 text-slate-100"
  }

  const getStatusBadge = (status: string) => {
    if (status === "active") return (
      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        {t.roleManagement.active}
      </Badge>
    )
    return (
      <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">
        <Clock className="w-3 h-3 mr-1" />
        {t.roleManagement.inactive}
      </Badge>
    )
  }

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, RolePermissionEntry[]> = {}
    rolePermissions.forEach(perm => {
      if (!groups[perm.resource]) {
        groups[perm.resource] = []
      }
      groups[perm.resource].push(perm)
    })
    return groups
  }, [rolePermissions])

  return (
    <PermissionGuard resource="role_assignment" action="view">
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-[#8B2332] rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 -right-4 w-96 h-96 bg-[#D4AF37] rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#8B2332] to-rose-900 shadow-2xl shadow-[#8B2332]/20">
                <Crown className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">
                  {t.roleManagement.title}
                </h1>
                <p className="text-slate-400 text-lg mt-2 font-light">
                  {t.roleManagement.subtitle}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 flex flex-col md:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                placeholder={t.roleManagement.searchUsers}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus:border-[#8B2332] focus:ring-[#8B2332]/20 transition-all"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-64 h-12 bg-slate-900/50 border-slate-800 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                <SelectItem value="all" className="text-white focus:bg-slate-800 focus:text-white">
                  {t.roleManagement.allRoles}
                </SelectItem>
                {allRoles.map(role => (
                  <SelectItem key={role} value={role} className="text-white focus:bg-slate-800 focus:text-white">
                    {t.roleManagement.roles[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">{t.roleManagement.totalUsers}</p>
                  <p className="text-4xl font-bold text-white mt-2">{filteredUsers.length}</p>
                </div>
                <UserCog className="w-12 h-12 text-[#8B2332]" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Active Users</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {filteredUsers.filter(u => u.status === "active").length}
                  </p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Unique Roles</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {new Set(filteredUsers.map(u => u.staffRole)).size}
                  </p>
                </div>
                <Shield className="w-12 h-12 text-[#D4AF37]" />
              </div>
            </div>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-12 h-12 border-4 border-[#8B2332] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                <AlertCircle className="w-16 h-16 mb-4" />
                <p className="text-lg">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left px-6 py-4 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                        User
                      </th>
                      <th className="text-left px-6 py-4 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                        Role
                      </th>
                      <th className="text-left px-6 py-4 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                        Last Active
                      </th>
                      <th className="text-right px-6 py-4 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {filteredUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B2332] to-rose-900 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white font-medium">{user.name}</p>
                                <p className="text-slate-500 text-sm">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => openPermissionsDialog(user.staffRole)}
                              className="group/role"
                            >
                              <Badge className={`${getRoleBadgeColor(user.staffRole)} transition-all cursor-pointer hover:scale-105 hover:shadow-lg`}>
                                {user.staffRole === StaffRole.proprietaire && <Crown className="w-3 h-3 mr-1" />}
                                {user.staffRole === StaffRole.admin_systeme && <Shield className="w-3 h-3 mr-1" />}
                                {t.roleManagement.roles[user.staffRole]}
                              </Badge>
                              <Eye className="inline-block w-3 h-3 ml-1 opacity-0 group-hover/role:opacity-100 transition-opacity text-slate-400" />
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(user.status)}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-slate-400 text-sm">
                              {user.lastLoginAt
                                ? new Date(user.lastLoginAt).toLocaleDateString()
                                : t.roleManagement.neverLoggedIn
                              }
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <PermissionGuard resource="permission_overrides" action="view" fallback={null}>
                                <Button
                                  onClick={() => router.push(`/admin/users/${user.id}/permissions`)}
                                  variant="ghost"
                                  size="sm"
                                  className="border border-slate-700 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all"
                                  title="Manage permission overrides"
                                >
                                  <Lock className="w-4 h-4" />
                                </Button>
                              </PermissionGuard>
                              <PermissionGuard resource="role_assignment" action="update" fallback={null}>
                                <Button
                                  onClick={() => openRoleDialog(user)}
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-700 text-slate-300 hover:bg-[#8B2332] hover:text-white hover:border-[#8B2332] transition-all"
                                  disabled={user.id === session?.user?.id && user.staffRole === StaffRole.proprietaire}
                                >
                                  <UserCog className="w-4 h-4 mr-2" />
                                  {t.roleManagement.changeRole}
                                </Button>
                              </PermissionGuard>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        {/* Change Role Dialog */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Change User Role
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Update the role for this user and apply system-wide permission changes
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm mb-1">Selected User</p>
                  <p className="text-white font-semibold text-lg">{selectedUser.name}</p>
                  <p className="text-slate-500 text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">
                    Select New Role
                  </label>
                  <Select value={selectedRole || undefined} onValueChange={(value) => setSelectedRole(value as StaffRole)}>
                    <SelectTrigger className="w-full h-12 bg-slate-800 border-slate-700 text-white focus:border-[#D4AF37] focus:ring-[#D4AF37]/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      {allRoles.map(role => (
                        <SelectItem key={role} value={role} className="text-white focus:bg-slate-800 focus:text-white">
                          <div className="flex items-center gap-2">
                            {role === StaffRole.proprietaire && <Crown className="w-4 h-4 text-[#D4AF37]" />}
                            {role === StaffRole.admin_systeme && <Shield className="w-4 h-4 text-purple-500" />}
                            <span>{t.roleManagement.roles[role]}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedRole && selectedRole !== selectedUser.staffRole && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4"
                  >
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-500 font-semibold text-sm">
                          Important Change
                        </p>
                        <p className="text-amber-500/80 text-sm mt-1">
                          This will change the user's permissions system-wide
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowRoleDialog(false)}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    disabled={updating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRoleChange}
                    className="bg-gradient-to-r from-[#8B2332] to-rose-900 hover:from-[#6d1b28] hover:to-rose-800 text-white shadow-lg shadow-[#8B2332]/20"
                    disabled={updating || !selectedRole || selectedRole === selectedUser.staffRole}
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      "Confirm Change"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* View Permissions Dialog */}
        <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <Shield className="w-6 h-6 text-[#D4AF37]" />
                {selectedRole && t.roleManagement.roles[selectedRole]}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {selectedRole && t.roleManagement.roleDescriptions[selectedRole]}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              {isWildcardRole ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-amber-500/10 mb-4">
                    <Crown className="w-12 h-12 text-[#D4AF37]" />
                  </div>
                  <p className="text-white font-semibold text-lg mb-1">
                    {t.rolePermissions.roleList.fullAccess}
                  </p>
                  <p className="text-slate-400 text-sm text-center max-w-sm">
                    {t.rolePermissions.roleList.fullAccessDescription}
                  </p>
                </div>
              ) : Object.keys(groupedPermissions).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <AlertCircle className="w-12 h-12 mb-3" />
                  <p>{t.roleManagement.noPermissions}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([resource, perms]) => (
                    <motion.div
                      key={resource}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                    >
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                        {(t.roleManagement.resources[resource as keyof typeof t.roleManagement.resources]) || resource}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {perms.map((perm, idx) => (
                          <Badge
                            key={idx}
                            className="bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-600 transition-colors"
                          >
                            {(t.roleManagement.actions[perm.action as keyof typeof t.roleManagement.actions]) || perm.action}
                            {perm.scope !== "all" && (
                              <span className="ml-1 text-slate-400">
                                ({(t.roleManagement.scopes[perm.scope as keyof typeof t.roleManagement.scopes]) || perm.scope})
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <Button
                onClick={() => setShowPermissionsDialog(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <style jsx global>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    </PermissionGuard>
  )
}
