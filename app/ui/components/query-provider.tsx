"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"

/**
 * React Query provider with optimized default settings
 *
 * Default cache behavior:
 * - staleTime: 30 seconds - data is fresh for 30s, then background refetch
 * - gcTime: 5 minutes - unused data is garbage collected after 5 min
 * - refetchOnWindowFocus: true - refetch when user returns to tab
 * - refetchOnReconnect: true - refetch when network reconnects
 * - retry: 1 - retry failed requests once
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 30 seconds
            staleTime: 30 * 1000,
            // Garbage collect unused cache after 5 minutes
            gcTime: 5 * 60 * 1000,
            // Refetch when window regains focus
            refetchOnWindowFocus: true,
            // Refetch when network reconnects
            refetchOnReconnect: true,
            // Retry failed requests once
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
