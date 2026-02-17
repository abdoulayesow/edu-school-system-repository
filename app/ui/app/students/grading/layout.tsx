"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useI18n } from "@/components/i18n-provider"
import { LayoutDashboard, PenLine, FileText, Trophy, ClipboardCheck } from "lucide-react"
import { componentClasses } from "@/lib/design-tokens"
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
