"use client"

import { useParams } from "next/navigation"
import { useEffect } from "react"

// Redirect to new hierarchical route structure
export default function LegacyEnrollmentDetailPage() {
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    if (id) {
      window.location.href = `/students/enrollments/${id}`
    }
  }, [id])

  // Show nothing while redirecting
  return null
}
