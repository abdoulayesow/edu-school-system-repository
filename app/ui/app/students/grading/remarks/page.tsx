"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TeacherRemarksPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/students/grading/entry")
  }, [router])

  return null
}
