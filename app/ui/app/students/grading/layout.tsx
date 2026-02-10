"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useI18n } from "@/components/i18n-provider"
import { LayoutDashboard, PenLine, FileText, Trophy, ClipboardCheck, GraduationCap } from "lucide-react"
import { componentClasses } from "@/lib/design-tokens"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CalculationStatusBanner } from "@/components/grading/calculation-status-banner"

export default function GradingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { t } = useI18n()

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname === "/students/grading" || pathname.startsWith("/students/grading/overview")) return "overview"
    if (pathname.startsWith("/students/grading/entry")) return "entry"
    if (pathname.startsWith("/students/grading/bulletin")) return "bulletin"
    if (pathname.startsWith("/students/grading/ranking")) return "ranking"
    if (pathname.startsWith("/students/grading/conduct")) return "conduct"
    return "overview"
  }

  const activeTab = getActiveTab()

  const tabs = [
    {
      id: "overview",
      label: t.nav.overview,
      href: "/students/grading",
      icon: LayoutDashboard,
    },
    {
      id: "entry",
      label: t.grading.gradeEntry,
      href: "/students/grading/entry",
      icon: PenLine,
    },
    {
      id: "bulletin",
      label: t.nav.bulletins,
      href: "/students/grading/bulletin",
      icon: FileText,
    },
    {
      id: "ranking",
      label: t.nav.classRankingNav,
      href: "/students/grading/ranking",
      icon: Trophy,
    },
    {
      id: "conduct",
      label: t.nav.conductEntry,
      href: "/students/grading/conduct",
      icon: ClipboardCheck,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Maroon accent bar */}
      <div className="h-1 bg-gspn-maroon-500" />

      {/* Calculation Status Banner */}
      <CalculationStatusBanner />

      <div className="bg-background pt-4">
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                <GraduationCap className="h-6 w-6 text-gspn-maroon-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{t.nav.gradingSection}</h1>
                <p className="text-muted-foreground">{t.grading.gradingSectionSubtitle}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm py-1.5 px-3 border-gspn-maroon-500/30 text-gspn-maroon-700 dark:text-gspn-maroon-300">
              <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
              {t.nav.gradingSection}
            </Badge>
          </div>

          {/* Tab Navigation */}
          <div className={componentClasses.tabListBase}>
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={cn(
                    componentClasses.tabButtonBase,
                    isActive
                      ? componentClasses.tabButtonActive
                      : componentClasses.tabButtonInactive
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content - child pages handle their own PageContainer */}
      {children}
    </div>
  )
}
