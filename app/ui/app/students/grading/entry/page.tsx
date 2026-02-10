"use client"

import { Suspense, useState, useEffect } from "react"
import { useUrlFilters, tabFilter } from "@/hooks/use-url-filters"
import { PageContainer } from "@/components/layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle } from "lucide-react"
import type { ActiveTrimester, Grade } from "@/lib/types/grading"
import { GradeEntryTab } from "./_components/grade-entry-tab"
import { ManageEvaluationsTab } from "./_components/manage-evaluations-tab"

const ENTRY_TABS = ["entry", "manage"] as const
type EntryTab = (typeof ENTRY_TABS)[number]

function GradeEntryPageContent() {
  const { t } = useI18n()
  const { toast } = useToast()

  const { filters, setFilter } = useUrlFilters({
    tab: tabFilter(ENTRY_TABS, "entry"),
  })
  const activeTab = filters.tab as EntryTab

  const [activeTrimester, setActiveTrimester] = useState<ActiveTrimester | null>(null)
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    fetchActiveTrimester()
    fetchGrades()
  }, [])

  async function fetchActiveTrimester() {
    try {
      const res = await fetch("/api/trimesters/active")
      if (res.ok) setActiveTrimester(await res.json())
    } catch (err) {
      console.error("Error fetching active trimester:", err)
      toast({ title: t.common.error, description: t.common.errorFetchingData, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchGrades() {
    try {
      const res = await fetch("/api/grades")
      if (res.ok) setGrades(await res.json())
    } catch (err) {
      console.error("Error fetching grades:", err)
      toast({ title: t.common.error, description: t.common.errorFetchingData, variant: "destructive" })
    }
  }

  if (!isMounted || isLoading) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gspn-maroon-500" />
        </div>
      </PageContainer>
    )
  }

  if (!activeTrimester) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <h2 className="text-xl font-semibold">{t.admin.noActiveTrimester}</h2>
            <p className="text-muted-foreground mt-2">{t.admin.configureTrimesters}</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="full">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setFilter("tab", v as EntryTab)}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="entry">{t.grading.enterGrades}</TabsTrigger>
          <TabsTrigger value="manage">{t.grading.manageEvaluations}</TabsTrigger>
        </TabsList>

        <TabsContent value="entry">
          <GradeEntryTab activeTrimester={activeTrimester} grades={grades} />
        </TabsContent>

        <TabsContent value="manage">
          <ManageEvaluationsTab activeTrimester={activeTrimester} grades={grades} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

export default function GradeEntryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gspn-maroon-500" />
        </div>
      }
    >
      <GradeEntryPageContent />
    </Suspense>
  )
}
