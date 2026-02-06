"use client"

import { useState, useEffect, Suspense } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/components/i18n-provider"
import { PermissionGuard } from "@/components/permission-guard"
import { RolePermissionsTab } from "@/components/admin/role-permissions-tab"
import { StatsCard } from "@/components/admin/stats-card"
import { useTabUrlSync } from "@/lib/hooks/use-tab-url-sync"
import { formatDateLong } from "@/lib/utils"
import {
  UserPlus,
  Users,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Copy,
  Shield,
  UserCog,
} from "lucide-react"
import { componentClasses } from "@/lib/design-tokens"

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
  status: string
}

interface Invitation {
  id: string
  email: string
  name: string | null
  role: string
  token: string
  status: "pending" | "accepted" | "expired"
  expiresAt: string
  createdAt: string
  inviter: {
    id: string
    name: string | null
  }
}

const ROLE_KEYS = ["director", "academic_director", "secretary", "accountant", "teacher"] as const

function AdminUsersPageContent() {
  const { t, locale } = useI18n()

  const [users, setUsers] = useState<User[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Main tab state (users/roles) - synced with URL query param
  const [mainTab, setMainTab] = useTabUrlSync("tab", "users")
  // Sub tab state for users section (invitations/users)
  const [subTab, setSubTab] = useState("invitations")

  // Dialog states
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [inviteForm, setInviteForm] = useState({
    email: "",
    name: "",
    role: "teacher",
  })

  useEffect(() => {
    fetchInvitations()
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (err) {
      console.error("Error fetching users:", err)
    }
  }

  async function fetchInvitations() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/users/invite")
      if (res.ok) {
        const data = await res.json()
        setInvitations(data)
      }
    } catch (err) {
      console.error("Error fetching invitations:", err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleInvite() {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      })
      if (res.ok) {
        setIsInviteDialogOpen(false)
        setInviteForm({ email: "", name: "", role: "teacher" })
        fetchInvitations()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to send invitation")
      }
    } catch (err) {
      console.error("Error sending invitation:", err)
      alert("Failed to send invitation")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResendInvitation(id: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}/resend-invite`, {
        method: "POST",
      })
      if (res.ok) {
        alert("Invitation resent successfully")
        fetchInvitations()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to resend invitation")
      }
    } catch (err) {
      console.error("Error resending invitation:", err)
      alert("Failed to resend invitation")
    }
  }

  function copyInvitationLink(token: string) {
    const url = `${window.location.origin}/auth/accept-invitation?token=${token}`
    navigator.clipboard.writeText(url)
    alert("Invitation link copied to clipboard")
  }

  function getStatusBadge(status: Invitation["status"]) {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t.admin.invitationAccepted}
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            {t.admin.invitationExpired}
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            {t.admin.invitationPending}
          </Badge>
        )
    }
  }

  const roleLabels = t.admin.roles as Record<string, string>

  function getRoleBadge(role: string) {
    const roleColors: Record<string, string> = {
      director: "bg-gspn-maroon-500 text-white",
      academic_director: "bg-nav-highlight text-white dark:bg-gspn-gold-500 dark:text-gspn-gold-950",
      secretary: "bg-success text-success-foreground",
      accountant: "bg-gspn-gold-500 text-gspn-gold-950",
      teacher: "bg-primary text-primary-foreground",
    }
    return (
      <Badge className={roleColors[role] || "bg-muted text-muted-foreground"}>
        {roleLabels[role] || role}
      </Badge>
    )
  }

  function formatDisplayDate(dateStr: string) {
    return formatDateLong(dateStr, locale)
  }

  return (
    <PageContainer maxWidth="full">
      {/* GSPN Header Accent */}
      <div className="h-1 bg-gspn-maroon-500 -mx-8 -mt-8 mb-8" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gspn-maroon-500/10 rounded-xl">
            <UserCog className="w-8 h-8 text-gspn-maroon-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t.admin.usersAndPermissions}</h1>
            <p className="text-muted-foreground mt-1">{t.admin.usersPageSubtitle}</p>
          </div>
        </div>
        {mainTab === 'users' && (
          <PermissionGuard resource="user_accounts" action="create" inline>
            <Button
              onClick={() => setIsInviteDialogOpen(true)}
              className={componentClasses.primaryActionButton}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t.admin.inviteUser}
            </Button>
          </PermissionGuard>
        )}
      </div>

      {/* Main Tabs - Outer level (Users | Role Permissions) */}
      <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
        <TabsList className="mb-2">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            {t.admin.usersMainTab}
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" />
            {t.admin.rolePermissionsMainTab}
          </TabsTrigger>
        </TabsList>

        {/* Users Tab Content */}
        <TabsContent value="users" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatsCard
              label={t.admin.totalUsers}
              value={users.length}
              icon={Users}
              iconColor="text-gspn-maroon-500/30"
            />
            <StatsCard
              label={t.admin.pendingInvitations}
              value={invitations.filter((i) => i.status === "pending").length}
              icon={Clock}
              iconColor="text-gspn-gold-500/30"
              delay={75}
            />
            <StatsCard
              label={t.admin.acceptedInvitations}
              value={invitations.filter((i) => i.status === "accepted").length}
              icon={CheckCircle2}
              iconColor="text-emerald-500/30"
              delay={150}
            />
            <StatsCard
              label={t.admin.expiredInvitations}
              value={invitations.filter((i) => i.status === "expired").length}
              icon={XCircle}
              iconColor="text-red-500/30"
              delay={200}
            />
          </div>

          {/* Inner Tabs - Invitations | Users */}
          <Tabs value={subTab} onValueChange={setSubTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="invitations" className="gap-2">
                <Mail className="h-4 w-4" />
                {t.admin.invitationsTab}
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                {t.admin.usersTab}
              </TabsTrigger>
            </TabsList>

            {/* Invitations Tab */}
            <TabsContent value="invitations">
              <Card className="border shadow-sm overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                    <CardTitle>{t.admin.invitationsTab}</CardTitle>
                  </div>
                  <CardDescription className="mt-2">
                    {t.admin.manageInvitations}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : invitations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t.admin.noPendingInvitations}</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gspn-gold-50/50 dark:bg-gspn-gold-950/20">
                          <TableHead>{t.admin.emailColumn}</TableHead>
                          <TableHead>{t.admin.nameColumn}</TableHead>
                          <TableHead>{t.admin.roleColumn}</TableHead>
                          <TableHead>{t.admin.statusColumn}</TableHead>
                          <TableHead>{t.admin.expiresColumn}</TableHead>
                          <TableHead>{t.admin.invitedByColumn}</TableHead>
                          <TableHead className="text-right">{t.admin.actionsColumn}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invitations.map((invitation) => (
                          <TableRow key={invitation.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">{invitation.email}</TableCell>
                            <TableCell>{invitation.name || "-"}</TableCell>
                            <TableCell>{getRoleBadge(invitation.role)}</TableCell>
                            <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                            <TableCell>{formatDisplayDate(invitation.expiresAt)}</TableCell>
                            <TableCell>{invitation.inviter.name || t.admin.unknown}</TableCell>
                            <TableCell className="text-right">
                              {invitation.status === "pending" && (
                                <div className="flex justify-end gap-2">
                                  <PermissionGuard resource="user_accounts" action="create" inline>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleResendInvitation(invitation.id)}
                                      title={t.admin.resendInvitation}
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                    </Button>
                                  </PermissionGuard>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyInvitationLink(invitation.token)}
                                    title={t.admin.copyInvitationLink}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              {invitation.status === "expired" && (
                                <PermissionGuard resource="user_accounts" action="create" inline>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleResendInvitation(invitation.id)}
                                    title={t.admin.resendInvitation}
                                  >
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    {t.admin.resend}
                                  </Button>
                                </PermissionGuard>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card className="border shadow-sm overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                    <CardTitle>{t.admin.allUsers}</CardTitle>
                  </div>
                  <CardDescription className="mt-2">
                    {t.admin.viewAllUsers}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t.admin.noUsersFound}</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gspn-gold-50/50 dark:bg-gspn-gold-950/20">
                          <TableHead>{t.admin.nameColumn}</TableHead>
                          <TableHead>{t.admin.emailColumn}</TableHead>
                          <TableHead>{t.admin.roleColumn}</TableHead>
                          <TableHead>{t.admin.statusColumn}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">{user.name || "-"}</TableCell>
                            <TableCell>{user.email || "-"}</TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>
                              <Badge variant={user.status === "active" ? "default" : "secondary"}>
                                {user.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Role Permissions Tab Content */}
        <TabsContent value="roles">
          <RolePermissionsTab />
        </TabsContent>
      </Tabs>

      {/* Invite User Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.inviteUser}</DialogTitle>
            <DialogDescription>
              {t.admin.inviteUserDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">
                {t.admin.inviteeEmail}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t.admin.emailPlaceholder}
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">
                {t.admin.inviteeName}
              </Label>
              <Input
                id="name"
                placeholder={t.admin.namePlaceholder}
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">
                {t.admin.selectRole}
              </Label>
              <Select
                value={inviteForm.role}
                onValueChange={(v) => setInviteForm({ ...inviteForm, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_KEYS.map((role) => (
                    <SelectItem
                      key={role}
                      value={role}
                    >
                      {roleLabels[role] || role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              {t.admin.invitationExpiresIn}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
            >
              {t.common.cancel}
            </Button>
            <Button
              onClick={handleInvite}
              disabled={isSubmitting || !inviteForm.email}
              className={componentClasses.primaryActionButton}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.admin.sendInvitation}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

export default function AdminUsersPage() {
  return (
    <PermissionGuard resource="user_management" action="view">
      <Suspense fallback={
        <PageContainer maxWidth="full">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </PageContainer>
      }>
        <AdminUsersPageContent />
      </Suspense>
    </PermissionGuard>
  )
}
