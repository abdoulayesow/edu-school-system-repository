"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageContainer } from "@/components/layout"
import { Loader2 } from "lucide-react"

export default function RolesRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/admin/users?tab=roles")
  }, [router])

  return (
    <PageContainer>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </PageContainer>
  )
}
