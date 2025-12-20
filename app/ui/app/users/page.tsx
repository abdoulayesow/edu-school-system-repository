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

interface UserData {
  id: string
  name: string
  email: string
  role: "director" | "teacher" | "accountant" | "parent" | "student"
  status: "active" | "invited" | "inactive"
  lastActive?: string
}

export default function UsersPage() {
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
        label: "Directeur",
        icon: Shield,
        className: "bg-primary/10 text-primary border-primary/30",
      },
      teacher: {
        label: "Enseignant",
        icon: GraduationCap,
        className: "bg-accent/10 text-accent border-accent/30",
      },
      accountant: {
        label: "Comptable",
        icon: Calculator,
        className: "bg-success/10 text-success border-success/30",
      },
      parent: {
        label: "Parent",
        icon: User,
        className: "bg-secondary/50 text-secondary-foreground border-secondary",
      },
      student: {
        label: "Étudiant",
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
            Actif
          </Badge>
        )
      case "invited":
        return (
          <Badge variant="outline" className="text-warning border-warning">
            Invité
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="text-muted-foreground border-muted-foreground">
            Inactif
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
              <h1 className="text-2xl font-bold text-foreground">Gestion des Utilisateurs</h1>
              <p className="text-sm text-muted-foreground">Inviter et gérer les utilisateurs du système</p>
            </div>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4 mr-2" />
                  Inviter un Utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Inviter un Utilisateur</DialogTitle>
                  <DialogDescription>
                    Envoyez une invitation par e-mail pour ajouter un nouvel utilisateur au système.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Adresse e-mail</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="utilisateur@email.gn"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-role">Rôle</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger id="invite-role">
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="director">Directeur</SelectItem>
                        <SelectItem value="teacher">Enseignant</SelectItem>
                        <SelectItem value="accountant">Comptable</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="student">Étudiant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Permissions pour {inviteRole || "ce rôle"}:</p>
                    {inviteRole === "director" && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Accès complet au système</li>
                        <li>Gestion des utilisateurs</li>
                        <li>Rapports et statistiques</li>
                      </ul>
                    )}
                    {inviteRole === "teacher" && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Saisie des notes</li>
                        <li>Gestion des présences</li>
                        <li>Voir les classes assignées</li>
                      </ul>
                    )}
                    {inviteRole === "accountant" && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Création de factures</li>
                        <li>Suivi des paiements</li>
                        <li>Rapports financiers</li>
                      </ul>
                    )}
                    {inviteRole === "parent" && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Voir les notes des enfants</li>
                        <li>Payer les factures</li>
                        <li>Recevoir les notifications</li>
                      </ul>
                    )}
                    {inviteRole === "student" && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Voir ses propres notes</li>
                        <li>Consulter l'emploi du temps</li>
                        <li>Recevoir les notifications</li>
                      </ul>
                    )}
                    {!inviteRole && <p>Sélectionnez un rôle pour voir les permissions</p>}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleInviteUser} disabled={!inviteEmail || !inviteRole}>
                    <Mail className="size-4 mr-2" />
                    Envoyer l'Invitation
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
                  Directeurs
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
                  Enseignants
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
                  Comptables
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
                  Parents
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
                  Étudiants
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
                    placeholder="Rechercher par nom ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filtrer par rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="director">Directeur</SelectItem>
                    <SelectItem value="teacher">Enseignant</SelectItem>
                    <SelectItem value="accountant">Comptable</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="student">Étudiant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des Utilisateurs</CardTitle>
              <CardDescription>
                {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? "s" : ""} trouvé
                {filteredUsers.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernière Activité</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                        {user.lastActive || "Jamais connecté"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Mail className="size-4 mr-2" />
                              Envoyer un Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="size-4 mr-2" />
                              Modifier les Permissions
                            </DropdownMenuItem>
                            {user.status === "invited" && (
                              <DropdownMenuItem>
                                <Mail className="size-4 mr-2" />
                                Renvoyer l'Invitation
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <UserX className="size-4 mr-2" />
                              Révoquer l'Accès
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
