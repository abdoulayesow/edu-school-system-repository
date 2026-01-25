"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"

/**
 * React Query provider with optimized default settings
 *
 * Default cache behavior:
 * - staleTime: 60 seconds - data is fresh for 60s, then background refetch
 * - gcTime: 10 minutes - unused data is garbage collected after 10 min
 * - refetchOnWindowFocus: false - don't refetch on focus (reduces server load)
 * - refetchOnReconnect: true - refetch when network reconnects
 * - retry: 1 - retry failed requests once
 *
 * OPTIMIZED: Increased cache times to reduce API calls and improve performance
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 60 seconds (increased from 30s)
            staleTime: 60 * 1000,
            // Garbage collect unused cache after 10 minutes (increased from 5min)
            gcTime: 10 * 60 * 1000,
            // Don't refetch on window focus to reduce server load
            refetchOnWindowFocus: false,
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
