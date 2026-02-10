"use client"

import { Suspense, useState, useEffect, useMemo } from "react"
import { PageContainer } from "@/components/layout"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useI18n } from "@/components/i18n-provider"
import { School, Clock, Loader2 } from "lucide-react"
import { GradesTab } from "./_components/grades-tab"
import { TimePeriodsTab } from "./_components/time-periods-tab"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SchoolYear {
  id: string
  name: string
  status: "new" | "active" | "passed"
  isActive: boolean
}

// ---------------------------------------------------------------------------
// Content (wrapped in Suspense by the default export)
// ---------------------------------------------------------------------------

function GradesPageContent() {
  const { t } = useI18n()

  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [selectedYearId, setSelectedYearId] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"grades" | "time-periods">("grades")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    fetchSchoolYears()
  }, [])

  async function fetchSchoolYears() {
    try {
      const res = await fetch("/api/admin/school-years")
      if (res.ok) {
        const data = await res.json()
        setSchoolYears(data)
        const active = data.find((sy: SchoolYear) => sy.status === "active")
        if (active) setSelectedYearId(active.id)
        else if (data.length > 0) setSelectedYearId(data[0].id)
      }
    } catch (err) {
      console.error("Error fetching school years:", err)
    }
  }

  const selectedSchoolYear = useMemo(
    () => schoolYears.find((sy) => sy.id === selectedYearId),
    [schoolYears, selectedYearId]
  )
  const canEdit = selectedSchoolYear?.status !== "passed"

  if (!isMounted) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="full">
      {/* Header accent bar */}
      <div className="h-1 bg-gspn-maroon-500 -mx-6 mb-6" />

      {/* Header row: title + school year selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t.admin.gradesRoomsTitle}</h1>
          <p className="text-muted-foreground">{t.admin.gradesRoomsSubtitle}</p>
        </div>
        <Select value={selectedYearId} onValueChange={setSelectedYearId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t.admin.selectSchoolYear} />
          </SelectTrigger>
          <SelectContent>
            {schoolYears.map((sy) => (
              <SelectItem key={sy.id} value={sy.id}>
                {sy.name}
                {sy.status === "active" && ` (${t.admin.statusActive})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tab navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "grades" | "time-periods")}>
        <TabsList>
          <TabsTrigger value="grades" className="gap-1.5">
            <School className="h-4 w-4" />
            {t.admin.gradesAndRooms}
          </TabsTrigger>
          <TabsTrigger value="time-periods" className="gap-1.5">
            <Clock className="h-4 w-4" />
            {t.classes.timePeriods}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grades" className="mt-6">
          <GradesTab selectedYearId={selectedYearId} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="time-periods" className="mt-6">
          <TimePeriodsTab selectedYearId={selectedYearId} canEdit={canEdit} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

// ---------------------------------------------------------------------------
// Default export with Suspense boundary
// ---------------------------------------------------------------------------

export default function GradesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gspn-maroon-500" />
        </div>
      }
    >
      <GradesPageContent />
    </Suspense>
  )
}
