"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useI18n } from "@/components/i18n-provider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { School, PenLine, FileText, Trophy, MessageSquare, ClipboardCheck } from "lucide-react"

export default function GradesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { t } = useI18n()

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname === "/students/grades") return "overview"
    if (pathname.startsWith("/students/grades/entry")) return "entry"
    if (pathname.startsWith("/students/grades/bulletin")) return "bulletin"
    if (pathname.startsWith("/students/grades/ranking")) return "ranking"
    if (pathname.startsWith("/students/grades/remarks")) return "remarks"
    if (pathname.startsWith("/students/grades/conduct")) return "conduct"
    return "overview"
  }

  const activeTab = getActiveTab()

  const tabs = [
    {
      id: "overview",
      label: t.nav.gradesClasses,
      href: "/students/grades",
      icon: School,
    },
    {
      id: "entry",
      label: t.grading.gradeEntry,
      href: "/students/grades/entry",
      icon: PenLine,
    },
    {
      id: "bulletin",
      label: t.nav.bulletins,
      href: "/students/grades/bulletin",
      icon: FileText,
    },
    {
      id: "ranking",
      label: t.nav.classRankingNav,
      href: "/students/grades/ranking",
      icon: Trophy,
    },
    {
      id: "remarks",
      label: t.nav.teacherRemarks,
      href: "/students/grades/remarks",
      icon: MessageSquare,
    },
    {
      id: "conduct",
      label: t.nav.conductEntry,
      href: "/students/grades/conduct",
      icon: ClipboardCheck,
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <Tabs value={activeTab} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Link key={tab.id} href={tab.href} className="flex-shrink-0">
                    <TabsTrigger
                      value={tab.id}
                      className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="whitespace-nowrap">{tab.label}</span>
                    </TabsTrigger>
                  </Link>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
