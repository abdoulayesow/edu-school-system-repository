"use client"

import { useState, useEffect, useCallback } from "react"
import { useOfflineStore } from "@/lib/stores/offline-store"

// ============================================================================
// useOnlineStatus Hook
// ============================================================================

export function useOnlineStatus() {
  const isOnline = useOfflineStore((state) => state.isOnline)
  const [isReallyOnline, setIsReallyOnline] = useState(isOnline)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  /**
   * Perform a health check to verify actual connectivity
   */
  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)

      const response = await fetch("/api/health", {
        method: "HEAD",
        signal: controller.signal,
        cache: "no-store",
      })

      clearTimeout(timeoutId)
      setLastCheck(new Date())
      const online = response.ok
      setIsReallyOnline(online)
      return online
    } catch {
      setIsReallyOnline(false)
      return false
    }
  }, [])

  // Sync with store
  useEffect(() => {
    setIsReallyOnline(isOnline)
  }, [isOnline])

  // Verify connectivity when browser reports online
  useEffect(() => {
    const handleOnline = () => {
      checkConnectivity()
    }

    const handleOffline = () => {
      setIsReallyOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [checkConnectivity])

  return {
    isOnline: isReallyOnline,
    lastCheck,
    checkConnectivity,
  }
}

// ============================================================================
// useNetworkInfo Hook (for connection quality)
// ============================================================================

interface NetworkInfo {
  type?: string
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

export function useNetworkInfo(): NetworkInfo {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({})

  useEffect(() => {
    const connection = (navigator as any).connection

    if (!connection) return

    const updateNetworkInfo = () => {
      setNetworkInfo({
        type: connection.type,
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      })
    }

    updateNetworkInfo()
    connection.addEventListener("change", updateNetworkInfo)

    return () => {
      connection.removeEventListener("change", updateNetworkInfo)
    }
  }, [])

  return networkInfo
}

// ============================================================================
// useConnectionQuality Hook
// ============================================================================

export type ConnectionQuality = "excellent" | "good" | "poor" | "offline"

export function useConnectionQuality(): ConnectionQuality {
  const { isOnline } = useOnlineStatus()
  const networkInfo = useNetworkInfo()

  if (!isOnline) return "offline"

  // Use effective type if available
  if (networkInfo.effectiveType) {
    switch (networkInfo.effectiveType) {
      case "4g":
        return "excellent"
      case "3g":
        return "good"
      case "2g":
      case "slow-2g":
        return "poor"
      default:
        return "good"
    }
  }

  // Fall back to RTT if available
  if (networkInfo.rtt !== undefined) {
    if (networkInfo.rtt < 100) return "excellent"
    if (networkInfo.rtt < 300) return "good"
    return "poor"
  }

  // Default to good if online
  return "good"
}
