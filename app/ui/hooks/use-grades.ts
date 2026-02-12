import { useState, useEffect } from "react"

export interface Grade {
  id: string
  name: string
  level: string
  order: number
  stats: {
    studentCount: number
  }
}

export function useGrades() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGrades() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/grades")
        if (!response.ok) throw new Error("Failed to fetch grades")
        const data = await response.json()
        setGrades(data.grades || [])
      } catch (err) {
        console.error("Error fetching grades:", err)
        setError("Failed to load grades")
      } finally {
        setIsLoading(false)
      }
    }
    fetchGrades()
  }, [])

  return { grades, isLoading, error }
}
