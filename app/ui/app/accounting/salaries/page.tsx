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
import { useToast } from "@/hooks/use-toast"
import { usePermissions } from "@/components/permission-guard"
import { Banknote, Clock, CreditCard, HandCoins, Loader2 } from "lucide-react"
import { HoursTab } from "./_components/hours-tab"
import { PaymentsTab } from "./_components/payments-tab"
import { AdvancesTab } from "./_components/advances-tab"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SchoolYear {
  id: string
  name: string
  status: "new" | "active" | "passed"
  isActive: boolean
}

type SalaryTab = "hours" | "payments" | "advances"

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

function SalariesContent() {
  const { t, locale } = useI18n()
  const { toast } = useToast()

  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [selectedYearId, setSelectedYearId] = useState("")
  const [activeTab, setActiveTab] = useState<SalaryTab>("hours")
  const [isMounted, setIsMounted] = useState(false)

  // Check permissions for all tabs at once
  const { can, loading: permsLoading } = usePermissions([
    { resource: "salary_hours", action: "view" },
    { resource: "salary_payments", action: "view" },
    { resource: "salary_advances", action: "view" },
  ])

  const canViewHours = can("salary_hours", "view")
  const canViewPayments = can("salary_payments", "view")
  const canViewAdvances = can("salary_advances", "view")

  useEffect(() => {
    setIsMounted(true)

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
        toast({
          title: t.common.error,
          description: t.common.errorOccurred,
          variant: "destructive",
        })
      }
    }

    fetchSchoolYears()
  }, [])

  // Set default tab once permissions load
  useEffect(() => {
    if (permsLoading) return
    if (canViewHours) setActiveTab("hours")
    else if (canViewPayments) setActiveTab("payments")
    else if (canViewAdvances) setActiveTab("advances")
  }, [permsLoading, canViewHours, canViewPayments, canViewAdvances])

  // Current month/year for default filters
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  const selectedSchoolYear = useMemo(
    () => schoolYears.find((sy) => sy.id === selectedYearId),
    [schoolYears, selectedYearId]
  )

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: new Date(2026, i).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
          month: "long",
        }),
      })),
    [locale]
  )

  if (!isMounted || permsLoading) {
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

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
            <Banknote className="h-6 w-6 text-gspn-maroon-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t.salaries.title}</h1>
            <p className="text-muted-foreground text-sm">
              {selectedSchoolYear && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gspn-maroon-50 border border-gspn-maroon-200 text-gspn-maroon-700 dark:bg-gspn-maroon-950/30 dark:border-gspn-maroon-800 dark:text-gspn-maroon-300">
                  {selectedSchoolYear.name}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Month picker */}
          <Select
            value={String(selectedMonth)}
            onValueChange={(v) => setSelectedMonth(parseInt(v))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year picker */}
          <Select
            value={String(selectedYear)}
            onValueChange={(v) => setSelectedYear(parseInt(v))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* School year */}
          <Select value={selectedYearId} onValueChange={setSelectedYearId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t.salaries.schoolYear} />
            </SelectTrigger>
            <SelectContent>
              {schoolYears.map((sy) => (
                <SelectItem key={sy.id} value={sy.id}>
                  {sy.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tab navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as SalaryTab)}
      >
        <TabsList>
          {canViewHours && (
            <TabsTrigger value="hours" className="gap-1.5">
              <Clock className="h-4 w-4" />
              {t.salaries.tabs.hours}
            </TabsTrigger>
          )}
          {canViewPayments && (
            <TabsTrigger value="payments" className="gap-1.5">
              <CreditCard className="h-4 w-4" />
              {t.salaries.tabs.payments}
            </TabsTrigger>
          )}
          {canViewAdvances && (
            <TabsTrigger value="advances" className="gap-1.5">
              <HandCoins className="h-4 w-4" />
              {t.salaries.tabs.advances}
            </TabsTrigger>
          )}
        </TabsList>

        {canViewHours && (
          <TabsContent value="hours" className="mt-6">
            <HoursTab
              schoolYearId={selectedYearId}
              month={selectedMonth}
              year={selectedYear}
            />
          </TabsContent>
        )}

        {canViewPayments && (
          <TabsContent value="payments" className="mt-6">
            <PaymentsTab
              schoolYearId={selectedYearId}
              month={selectedMonth}
              year={selectedYear}
            />
          </TabsContent>
        )}

        {canViewAdvances && (
          <TabsContent value="advances" className="mt-6">
            <AdvancesTab
              schoolYearId={selectedYearId}
              month={selectedMonth}
              year={selectedYear}
            />
          </TabsContent>
        )}
      </Tabs>
    </PageContainer>
  )
}

// ---------------------------------------------------------------------------
// Default export
// ---------------------------------------------------------------------------

export default function SalariesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gspn-maroon-500" />
        </div>
      }
    >
      <SalariesContent />
    </Suspense>
  )
}
