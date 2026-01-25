"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useI18n } from "@/components/i18n-provider"
import { PenLine, FileText, Trophy, MessageSquare, ClipboardCheck } from "lucide-react"
import { componentClasses } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"

export default function GradingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { t } = useI18n()

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname.startsWith("/students/grading/entry")) return "entry"
    if (pathname.startsWith("/students/grading/bulletin")) return "bulletin"
    if (pathname.startsWith("/students/grading/ranking")) return "ranking"
    if (pathname.startsWith("/students/grading/remarks")) return "remarks"
    if (pathname.startsWith("/students/grading/conduct")) return "conduct"
    return "entry"
  }

  const activeTab = getActiveTab()

  const tabs = [
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
      id: "remarks",
      label: t.nav.teacherRemarks,
      href: "/students/grading/remarks",
      icon: MessageSquare,
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
      <div className="bg-background pt-4">
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t.nav.gradingSection}</h1>
            <p className="text-muted-foreground">{t.grading.gradingSectionSubtitle}</p>
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
