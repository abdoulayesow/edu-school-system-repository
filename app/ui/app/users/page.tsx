"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, MoreVertical, Mail, Shield, UserX, Users, GraduationCap, Calculator, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n, interpolate } from "@/components/i18n-provider"

interface UserData {
  id: string
  name: string
  email: string
  role: "director" | "teacher" | "accountant" | "parent" | "student"
  status: "active" | "invited" | "inactive"
  lastActive?: string
}

export default function UsersPage() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<string>("")

  const users: UserData[] = [
    {
      id: "1",
      name: "Moussa Diallo",
      email: "moussa.diallo@ecole.gn",
      role: "director",
      status: "active",
      lastActive: "Il y a 2 heures",
    },
    {
      id: "2",
      name: "Amara Camara",
      email: "amara.camara@ecole.gn",
      role: "teacher",
      status: "active",
      lastActive: "Il y a 5 minutes",
    },
    {
      id: "3",
      name: "Aissatou Bah",
      email: "aissatou.bah@ecole.gn",
      role: "accountant",
      status: "active",
      lastActive: "Il y a 1 heure",
    },
    {
      id: "4",
      name: "Fatima Sow",
      email: "fatima.sow@email.gn",
      role: "parent",
      status: "active",
      lastActive: "Hier",
    },
    {
      id: "5",
      name: "Kofi Barry",
      email: "kofi.barry@email.gn",
      role: "student",
      status: "active",
      lastActive: "Il y a 10 minutes",
    },
    {
      id: "6",
      name: "Ibrahim Keita",
      email: "ibrahim.keita@ecole.gn",
      role: "teacher",
      status: "invited",
    },
    {
      id: "7",
      name: "Mariama Touré",
      email: "mariama.toure@email.gn",
      role: "parent",
      status: "inactive",
      lastActive: "Il y a 2 mois",
    },
  ]

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: UserData["role"]) => {
    const roleConfig = {
      director: {
        label: t.users.director,
        icon: Shield,
        className: "bg-primary/10 text-primary border-primary/30",
      },
      teacher: {
        label: t.users.teacher,
        icon: GraduationCap,
        className: "bg-accent/10 text-accent border-accent/30",
      },
      accountant: {
        label: t.users.accountant,
        icon: Calculator,
        className: "bg-success/10 text-success border-success/30",
      },
      parent: {
        label: t.users.parent,
        icon: User,
        className: "bg-secondary/50 text-secondary-foreground border-secondary",
      },
      student: {
        label: t.common.student,
        icon: Users,
        className: "bg-muted text-muted-foreground border-border",
      },
    }

    const config = roleConfig[role]
    const Icon = config.icon

    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="size-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getStatusBadge = (status: UserData["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="text-success border-success">
            {t.users.active}
          </Badge>
        )
      case "invited":
        return (
          <Badge variant="outline" className="text-warning border-warning">
            {t.users.invited}
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="text-muted-foreground border-muted-foreground">
            {t.users.inactive}
          </Badge>
        )
    }
  }

  const handleInviteUser = () => {
    // TODO: Implement invite logic
    console.log("[v0] Inviting user:", { email: inviteEmail, role: inviteRole })
    setIsInviteDialogOpen(false)
    setInviteEmail("")
    setInviteRole("")
  }

  const userCounts = {
    director: users.filter((u) => u.role === "director").length,
    teacher: users.filter((u) => u.role === "teacher").length,
    accountant: users.filter((u) => u.role === "accountant").length,
    parent: users.filter((u) => u.role === "parent").length,
    student: users.filter((u) => u.role === "student").length,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t.users.title}</h1>
              <p className="text-sm text-muted-foreground">{t.users.subtitle}</p>
            </div>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4 mr-2" />
                  {t.users.inviteUser}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.users.inviteUser}</DialogTitle>
                  <DialogDescription>
                    {t.users.inviteUserDescription}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">{t.login.email}</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder={t.users.userEmailPlaceholder}
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-role">{t.users.role}</Label>
                    <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as UserData['role'])}>
                      <SelectTrigger id="invite-role">
                        <SelectValue placeholder={t.users.selectRole} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="director">{t.users.director}</SelectItem>
                        <SelectItem value="teacher">{t.users.teacher}</SelectItem>
                        <SelectItem value="accountant">{t.users.accountant}</SelectItem>
                        <SelectItem value="parent">{t.users.parent}</SelectItem>
                        <SelectItem value="student">{t.common.student}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                    <p className="font-medium mb-1">{interpolate(t.users.permissionsForRole, { role: inviteRole || t.users.role.toLowerCase() })}:</p>
                    {inviteRole === "director" && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>{t.users.permissions.director.p1}</li>
                        <li>{t.users.permissions.director.p2}</li>
                        <li>{t.users.permissions.director.p3}</li>
                      </ul>
                    )}
                    {inviteRole === "teacher" && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>{t.users.permissions.teacher.p1}</li>
                        <li>{t.users.permissions.teacher.p2}</li>
                        <li>{t.users.permissions.teacher.p3}</li>
                      </ul>
                    )}
                    {inviteRole === "accountant" && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>{t.users.permissions.accountant.p1}</li>
                        <li>{t.users.permissions.accountant.p2}</li>
                        <li>{t.users.permissions.accountant.p3}</li>
                      </ul>
                    )}
                    {inviteRole === "parent" && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>{t.users.permissions.parent.p1}</li>
                        <li>{t.users.permissions.parent.p2}</li>
                        <li>{t.users.permissions.parent.p3}</li>
                      </ul>
                    )}
                    {inviteRole === "student" && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>{t.users.permissions.student.p1}</li>
                        <li>{t.users.permissions.student.p2}</li>
                        <li>{t.users.permissions.student.p3}</li>
                      </ul>
                    )}
                    {!inviteRole && <p>{t.users.selectRoleToSeePermissions}</p>}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                    {t.common.cancel}
                  </Button>
                  <Button onClick={handleInviteUser} disabled={!inviteEmail || !inviteRole}>
                    <Mail className="size-4 mr-2" />
                    {t.users.sendInvitation}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* User Count Cards */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Shield className="size-4 text-primary" />
                  {t.users.userCounts.directors}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{userCounts.director}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="size-4 text-accent" />
                  {t.users.userCounts.teachers}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{userCounts.teacher}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calculator className="size-4 text-success" />
                  {t.users.userCounts.accountants}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{userCounts.accountant}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="size-4" />
                  {t.users.userCounts.parents}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{userCounts.parent}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="size-4" />
                  {t.users.userCounts.students}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{userCounts.student}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters & Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder={t.users.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder={t.users.filterByRole} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.users.allRoles}</SelectItem>
                    <SelectItem value="director">{t.users.director}</SelectItem>
                    <SelectItem value="teacher">{t.users.teacher}</SelectItem>
                    <SelectItem value="accountant">{t.users.accountant}</SelectItem>
                    <SelectItem value="parent">{t.users.parent}</SelectItem>
                    <SelectItem value="student">{t.common.student}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t.users.userList}</CardTitle>
              <CardDescription>
                {interpolate(t.users.usersFound, { count: filteredUsers.length })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.users.name}</TableHead>
                    <TableHead>{t.login.email}</TableHead>
                    <TableHead>{t.users.role}</TableHead>
                    <TableHead>{t.common.status}</TableHead>
                    <TableHead>{t.users.lastActivity}</TableHead>
                    <TableHead className="text-right">{t.common.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.lastActive || t.users.neverConnected}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t.common.actions}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Mail className="size-4 mr-2" />
                              {t.users.sendEmail}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="size-4 mr-2" />
                              {t.users.editPermissions}
                            </DropdownMenuItem>
                            {user.status === "invited" && (
                              <DropdownMenuItem>
                                <Mail className="size-4 mr-2" />
                                {t.users.resendInvitation}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <UserX className="size-4 mr-2" />
                              {t.users.revokeAccess}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}