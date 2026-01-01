"use client"

import { EnrollmentWizard } from "@/components/enrollment/enrollment-wizard"
import { useI18n } from "@/components/i18n-provider"
import { PageContainer } from "@/components/layout/PageContainer"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NewEnrollmentPage() {
  const { t } = useI18n()

  return (
    <PageContainer maxWidth="full">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/enrollments" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t.common.back}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-foreground">
          {t.enrollmentWizard.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t.enrollmentWizard.subtitle}
        </p>
      </div>

      {/* Wizard */}
      <EnrollmentWizard />
    </PageContainer>
  )
}
