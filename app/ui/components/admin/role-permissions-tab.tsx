"use client"

import { useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/components/i18n-provider"
import { Shield, Users, Crown } from "lucide-react"
import { StaffRole } from "@prisma/client"
import { ROLE_PERMISSIONS, type Branch, type RoleScope } from "@/lib/permissions-v2"
import { typography } from "@/lib/design-tokens"

const STAFF_ROLES = Object.values(StaffRole)

const BRANCH_STYLES: Record<Branch, string> = {
  transversal: "bg-gspn-gold-100 text-gspn-gold-800 border-gspn-gold-300 dark:bg-gspn-gold-500/20 dark:text-gspn-gold-400 dark:border-gspn-gold-500/30",
  academic: "bg-gspn-maroon-50 text-gspn-maroon-700 border-gspn-maroon-200 dark:bg-gspn-maroon-500/20 dark:text-gspn-maroon-300 dark:border-gspn-maroon-500/30",
  financial: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
  none: "bg-muted text-muted-foreground border-border",
}

export function RolePermissionsTab() {
  const { t } = useI18n()

  const roleStats = useMemo(() => {
    return STAFF_ROLES.map((role) => {
      const config = ROLE_PERMISSIONS[role]
      const permissionCount = config.permissions === "*" ? null : config.permissions.length
      return { role, branch: config.branch, roleScope: config.roleScope, permissionCount }
    })
  }, [])

  const totalExplicitPermissions = useMemo(() => {
    return roleStats.reduce((sum, s) => sum + (s.permissionCount ?? 0), 0)
  }, [roleStats])

  const wildcardCount = useMemo(() => {
    return roleStats.filter((s) => s.permissionCount === null).length
  }, [roleStats])

  const rl = t.rolePermissions.roleList

  return (
    <div>
      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{rl.totalRoles}</p>
                <p className={`${typography.stat.md} text-foreground mt-1`}>
                  {STAFF_ROLES.length}
                </p>
              </div>
              <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                <Users className="h-6 w-6 text-gspn-maroon-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{rl.totalPermissions}</p>
                <p className={`${typography.stat.md} text-foreground mt-1`}>
                  {totalExplicitPermissions}
                </p>
              </div>
              <div className="p-2.5 bg-gspn-gold-500/10 rounded-xl">
                <Shield className="h-6 w-6 text-gspn-gold-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{rl.wildcardRoles}</p>
                <p className={`${typography.stat.md} text-foreground mt-1`}>
                  {wildcardCount}
                </p>
              </div>
              <div className="p-2.5 bg-gspn-gold-500/10 rounded-xl">
                <Crown className="h-6 w-6 text-gspn-gold-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roleStats.map((stats) => (
          <Card key={stats.role} className="border shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                    <CardTitle className="text-lg text-foreground">
                      {t.roleManagement.roles[stats.role]}
                    </CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">{stats.role}</p>
                </div>
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Branch */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{rl.branch}</span>
                  <Badge variant="outline" className={BRANCH_STYLES[stats.branch]}>
                    {rl.branches[stats.branch]}
                  </Badge>
                </div>

                {/* Permission count */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{rl.permissions}</span>
                  {stats.permissionCount === null ? (
                    <Badge className="bg-gspn-gold-500 text-black hover:bg-gspn-gold-600 border-0">
                      {rl.fullAccess}
                    </Badge>
                  ) : (
                    <Badge variant="outline">{stats.permissionCount}</Badge>
                  )}
                </div>

                {/* Scope */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">{rl.scope}</span>
                  <span className="text-sm font-medium text-foreground">
                    {rl.scopes[stats.roleScope]}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
