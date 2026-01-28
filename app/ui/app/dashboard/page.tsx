"use client"

import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout"
import { sizing } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"
import {
  DirectorDashboard,
  AccountantDashboard,
  SecretaryDashboard,
  TeacherDashboard,
  DefaultDashboard,
} from "@/components/dashboards"

/**
 * Role-Based Dashboard Router
 *
 * Renders the appropriate dashboard based on user role:
 * - director / academic_director → DirectorDashboard (full overview)
 * - accountant → AccountantDashboard (financial focus)
 * - secretary → SecretaryDashboard (enrollment focus)
 * - teacher → TeacherDashboard (class management)
 * - others → DefaultDashboard (basic navigation)
 */
export default function DashboardPage() {
  const { locale } = useI18n()
  const { data: session, status } = useSession()

  // Show loading while session is being fetched
  if (status === "loading") {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className={cn(sizing.icon.xl, "animate-spin text-gspn-maroon-500 mx-auto")} />
            <p className="text-muted-foreground">
              {locale === "fr" ? "Chargement..." : "Loading..."}
            </p>
          </div>
        </div>
      </PageContainer>
    )
  }

  // Get user info
  const userName = session?.user?.name || undefined
  const userRole = (session?.user?.role as string)?.toLowerCase() || "user"

  // Render appropriate dashboard based on role
  const renderDashboard = () => {
    switch (userRole) {
      case "director":
      case "academic_director":
        return <DirectorDashboard userName={userName} />

      case "accountant":
        return <AccountantDashboard userName={userName} />

      case "secretary":
        return <SecretaryDashboard userName={userName} />

      case "teacher":
        return <TeacherDashboard userName={userName} />

      default:
        return <DefaultDashboard userName={userName} userRole={userRole} />
    }
  }

  return (
    <PageContainer>
      {renderDashboard()}
    </PageContainer>
  )
}
