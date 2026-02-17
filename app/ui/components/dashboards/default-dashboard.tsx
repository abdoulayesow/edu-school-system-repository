"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Home,
  Users,
  BookOpen,
  Calendar,
  CreditCard,
  Settings,
  ArrowRight,
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { typography, componentClasses } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"

interface DefaultDashboardProps {
  userName?: string
  userRole?: string
}

export function DefaultDashboard({ userName, userRole }: DefaultDashboardProps) {
  const { t, locale } = useI18n()

  const quickLinks = [
    {
      icon: Users,
      label: locale === "fr" ? "Élèves" : "Students",
      href: "/students",
      color: "bg-gspn-maroon-500/10 text-gspn-maroon-600 dark:text-gspn-maroon-400",
    },
    {
      icon: BookOpen,
      label: locale === "fr" ? "Notes" : "Grades",
      href: "/students/grades",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      icon: Calendar,
      label: locale === "fr" ? "Présence" : "Attendance",
      href: "/students/attendance",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: CreditCard,
      label: locale === "fr" ? "Paiements" : "Payments",
      href: "/accounting/payments",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="h-1 bg-gspn-maroon-500" />
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gspn-maroon-500/10 rounded-xl">
              <Home className="size-8 text-gspn-maroon-600 dark:text-gspn-maroon-400" />
            </div>
            <div>
              <h1 className={cn(typography.heading.page, "text-foreground")}>
                {locale === "fr" ? "Bienvenue" : "Welcome"}
                {userName && `, ${userName}`}
              </h1>
              <p className="text-muted-foreground mt-1">
                {locale === "fr"
                  ? "Accédez à vos fonctionnalités principales"
                  : "Access your main features"
                }
              </p>
              {userRole && (
                <p className="text-xs text-muted-foreground mt-1 capitalize">
                  {locale === "fr" ? "Rôle" : "Role"}: {userRole.replace("_", " ")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full">
              <div className="h-1 bg-gspn-maroon-500" />
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={cn("p-2.5 rounded-xl", link.color)}>
                    <link.icon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{link.label}</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Help Section */}
      <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/30 dark:to-transparent shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Settings className="size-4" />
            {locale === "fr" ? "Besoin d'aide ?" : "Need Help?"}
          </h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            {locale === "fr"
              ? "Si vous avez besoin d'accéder à des fonctionnalités supplémentaires, veuillez contacter l'administrateur du système."
              : "If you need access to additional features, please contact the system administrator."
            }
          </p>
          <Button variant="outline" asChild>
            <Link href="/profile">
              {locale === "fr" ? "Mon profil" : "My Profile"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
