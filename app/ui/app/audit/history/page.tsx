"use client"

import { History, Users, GraduationCap, FileText, Filter, ArrowUpDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout/PageContainer"
import { PermissionGuard, NoPermission } from "@/components/permission-guard"

export default function DataHistoryPage() {
  const { t } = useI18n()

  return (
    <PermissionGuard
      resource="audit_logs"
      action="view"
      fallback={
        <PageContainer maxWidth="full">
          <NoPermission
            title={t.permissions?.accessDenied || "Access Denied"}
            description={t.permissions?.noAuditPermission || "You don't have permission to view audit logs."}
          />
        </PageContainer>
      }
    >
    <PageContainer maxWidth="full">
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
            {t.nav.dataHistory}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track student and enrollment record modifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Sort
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 py-5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Student Updates
            </CardTitle>
            <Users className="h-4 w-4 text-gspn-maroon-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 py-5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Enrollment Changes
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-gspn-gold-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 py-5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Document Updates
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by student name, ID, or modification type..."
          className="max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
        />
      </div>

      {/* Data History Table Placeholder */}
      <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Change History</CardTitle>
          <CardDescription>
            Complete history of data modifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No change records yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              Data change history will appear here once there are student profile updates,
              enrollment modifications, or document changes.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </PageContainer>
    </PermissionGuard>
  )
}
