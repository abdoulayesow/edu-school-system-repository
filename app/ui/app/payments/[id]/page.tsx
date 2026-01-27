"use client"

import { useParams, redirect } from "next/navigation"
import { useEffect } from "react"

// Redirect to new hierarchical route structure
export default function LegacyPaymentDetailPage() {
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    if (id) {
      window.location.href = `/accounting/payments/${id}`
    }
  }, [id])

  // Show nothing while redirecting
  return null
}
