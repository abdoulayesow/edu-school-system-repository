"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/components/i18n-provider"
import { Shield, Users, Loader2 } from "lucide-react"
import { StaffRole } from "@prisma/client"

interface RoleStats {
  role: StaffRole
  permissionCount: number
  userCount: number
  seededCount: number
  manualCount: number
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

// Role name translations
const getRoleName = (role: StaffRole, locale: string) => {
  const names: Record<StaffRole, { en: string; fr: string }> = {
    proprietaire: { en: "Owner", fr: "Proprietaire" },
    admin_systeme: { en: "System Admin", fr: "Admin Systeme" },
    proviseur: { en: "Principal", fr: "Proviseur" },
    censeur: { en: "Vice Principal", fr: "Censeur" },
    surveillant_general: { en: "General Supervisor", fr: "Surveillant General" },
    directeur: { en: "Director", fr: "Directeur" },
    secretariat: { en: "Secretary", fr: "Secretariat" },
    comptable: { en: "Accountant", fr: "Comptable" },
    agent_recouvrement: { en: "Collection Agent", fr: "Agent de Recouvrement" },
    coordinateur: { en: "Coordinator", fr: "Coordinateur" },
    enseignant: { en: "Teacher", fr: "Enseignant" },
    professeur_principal: { en: "Head Teacher", fr: "Professeur Principal" },
    gardien: { en: "Security Guard", fr: "Gardien" },
  }
  return locale === "fr" ? names[role].fr : names[role].en
}

export function RolePermissionsTab() {
  const { locale } = useI18n()
  const [roleStats, setRoleStats] = useState<RoleStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRoleStats()
  }, [])

  async function fetchRoleStats() {
    setIsLoading(true)
    try {
      // Fetch stats for all roles in parallel
      const statsPromises = STAFF_ROLES.map(async (role) => {
        const res = await fetch(`/api/admin/roles/${role}/permissions`)
        if (res.ok) {
          const data = await res.json()
          return {
            role,
            permissionCount: data.stats.total,
            userCount: data.affectedUsers,
            seededCount: data.stats.seeded,
            manualCount: data.stats.manual,
          }
        }
        return {
          role,
          permissionCount: 0,
          userCount: 0,
          seededCount: 0,
          manualCount: 0,
        }
      })

      const stats = await Promise.all(statsPromises)
      setRoleStats(stats)
    } catch (err) {
      console.error("Error fetching role stats:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {locale === "fr" ? "Total des Roles" : "Total Roles"}
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">{STAFF_ROLES.length}</p>
              </div>
              <Users className="w-10 h-10 text-gspn-maroon-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {locale === "fr" ? "Total des Permissions" : "Total Permissions"}
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {roleStats.reduce((sum, r) => sum + r.permissionCount, 0)}
                </p>
              </div>
              <Shield className="w-10 h-10 text-gspn-gold-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {locale === "fr" ? "Permissions Personnalisees" : "Custom Permissions"}
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {roleStats.reduce((sum, r) => sum + r.manualCount, 0)}
                </p>
              </div>
              <Shield className="w-10 h-10 text-gspn-gold-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-gspn-maroon-500 animate-spin" />
        </div>
      ) : (
        /* Role cards grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleStats.map((stats) => (
            <Card
              key={stats.role}
              className="border shadow-sm"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                      <CardTitle className="text-lg text-foreground">
                        {getRoleName(stats.role, locale)}
                      </CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">{stats.role}</p>
                  </div>
                  <Shield className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Permission count */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {locale === "fr" ? "Permissions" : "Permissions"}
                    </span>
                    <Badge variant="outline">
                      {stats.permissionCount}
                    </Badge>
                  </div>

                  {/* User count */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {locale === "fr" ? "Utilisateurs" : "Users"}
                    </span>
                    <Badge variant="outline">
                      {stats.userCount}
                    </Badge>
                  </div>

                  {/* Custom permissions */}
                  {stats.manualCount > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-sm text-muted-foreground">
                        {locale === "fr" ? "Personnalisees" : "Custom"}
                      </span>
                      <Badge className="bg-gspn-gold-500 text-black hover:bg-gspn-gold-600 border-0">
                        {stats.manualCount}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
