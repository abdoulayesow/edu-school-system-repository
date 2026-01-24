"use client"

import { useRouter } from "next/navigation"
import { ExpenseWizard } from "@/components/expense-wizard"
import { PageContainer } from "@/components/layout"

export default function NewExpensePage() {
  const router = useRouter()

  // Handle wizard completion
  const handleComplete = () => {
    router.push("/expenses")
  }

  // Handle cancel
  const handleCancel = () => {
    router.back()
  }

  return (
    <PageContainer maxWidth="full">
      <ExpenseWizard
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </PageContainer>
  )
}
