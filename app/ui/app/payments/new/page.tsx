"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PaymentWizard } from "@/components/payment-wizard"
import { PageContainer } from "@/components/layout"
import { Loader2 } from "lucide-react"

function PaymentWizardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get optional studentId from URL
  const studentId = searchParams.get("studentId") || undefined

  // Handle wizard completion
  const handleComplete = () => {
    router.push("/accounting/payments")
  }

  // Handle cancel
  const handleCancel = () => {
    router.back()
  }

  return (
    <PageContainer maxWidth="lg">
      <PaymentWizard
        initialStudentId={studentId}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </PageContainer>
  )
}

export default function NewPaymentPage() {
  return (
    <Suspense fallback={
      <PageContainer maxWidth="lg">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    }>
      <PaymentWizardPage />
    </Suspense>
  )
}
