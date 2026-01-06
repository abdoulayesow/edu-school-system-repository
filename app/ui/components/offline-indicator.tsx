"use client"

import { useEffect, useState } from "react"
import { Cloud, CloudOff, RefreshCw, AlertCircle, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useOfflineStore,
  selectIsOnline,
  selectSyncStatus,
  selectPendingCount,
  selectFailedCount,
} from "@/lib/stores/offline-store"
import { Badge } from "@/components/ui/badge"

// ============================================================================
// Types
// ============================================================================

type IndicatorVariant = "online" | "offline" | "syncing" | "error" | "pending"

interface OfflineIndicatorProps {
  className?: string
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
}

// ============================================================================
// Component
// ============================================================================

export function OfflineIndicator({
  className,
  showLabel = false,
  size = "md",
}: OfflineIndicatorProps) {
  const isOnline = useOfflineStore(selectIsOnline)
  const syncStatus = useOfflineStore(selectSyncStatus)
  const pendingCount = useOfflineStore(selectPendingCount)
  const failedCount = useOfflineStore(selectFailedCount)
  const triggerSync = useOfflineStore((state) => state.triggerSync)

  const [variant, setVariant] = useState<IndicatorVariant>("online")

  // Determine variant based on state
  useEffect(() => {
    if (!isOnline) {
      setVariant("offline")
    } else if (syncStatus === "syncing") {
      setVariant("syncing")
    } else if (syncStatus === "error" || failedCount > 0) {
      setVariant("error")
    } else if (pendingCount > 0) {
      setVariant("pending")
    } else {
      setVariant("online")
    }
  }, [isOnline, syncStatus, pendingCount, failedCount])

  // Size classes
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  // Variant config
  const variantConfig: Record<
    IndicatorVariant,
    {
      icon: typeof Cloud
      color: string
      bgColor: string
      label: string
      tooltip: string
    }
  > = {
    online: {
      icon: Cloud,
      color: "text-green-600",
      bgColor: "bg-green-100",
      label: "Online",
      tooltip: "Connected - All changes synced",
    },
    offline: {
      icon: CloudOff,
      color: "text-gray-500",
      bgColor: "bg-gray-100",
      label: "Offline",
      tooltip: "Working offline - Changes will sync when online",
    },
    syncing: {
      icon: RefreshCw,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      label: "Syncing",
      tooltip: "Syncing changes...",
    },
    error: {
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      label: "Sync Error",
      tooltip: `${failedCount} operation${failedCount !== 1 ? "s" : ""} failed to sync`,
    },
    pending: {
      icon: Check,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      label: "Pending",
      tooltip: `${pendingCount} change${pendingCount !== 1 ? "s" : ""} waiting to sync`,
    },
  }

  const config = variantConfig[variant]
  const Icon = config.icon

  const handleClick = () => {
    if (isOnline && (pendingCount > 0 || failedCount > 0)) {
      triggerSync()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!isOnline || variant === "syncing"}
      data-testid="offline-indicator"
      data-status={variant}
      aria-label={config.tooltip}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 h-9",
        "transition-colors duration-200",
        config.bgColor,
        isOnline && pendingCount > 0 && "cursor-pointer hover:opacity-80",
        !isOnline && "cursor-default",
        className
      )}
    >
      <Icon
        className={cn(
          sizeClasses[size],
          config.color,
          variant === "syncing" && "animate-spin"
        )}
      />
      {showLabel && (
        <span
          className={cn(
            "text-xs font-medium",
            config.color
          )}
        >
          {config.label}
        </span>
      )}
      {(pendingCount > 0 || failedCount > 0) && variant !== "syncing" && (
        <Badge
          variant={failedCount > 0 ? "destructive" : "secondary"}
          className="h-4 min-w-4 px-1 text-[10px]"
          data-testid="offline-indicator-badge"
        >
          {failedCount > 0 ? failedCount : pendingCount}
        </Badge>
      )}
    </button>
  )
}

// ============================================================================
// Compact variant for navigation
// ============================================================================

export function OfflineIndicatorCompact({ className }: { className?: string }) {
  const isOnline = useOfflineStore(selectIsOnline)
  const syncStatus = useOfflineStore(selectSyncStatus)
  const pendingCount = useOfflineStore(selectPendingCount)

  if (isOnline && syncStatus === "idle" && pendingCount === 0) {
    // Don't show anything when everything is normal
    return null
  }

  return <OfflineIndicator className={className} size="sm" />
}

// ============================================================================
// Status toast hook
// ============================================================================

export function useSyncToasts() {
  const syncStatus = useOfflineStore(selectSyncStatus)
  const isOnline = useOfflineStore(selectIsOnline)
  const pendingCount = useOfflineStore(selectPendingCount)

  // You can integrate this with your toast system
  // This is a simplified version that just returns the current message
  const getMessage = (): string | null => {
    if (!isOnline) {
      return "Working offline - changes will sync when connected"
    }
    if (syncStatus === "syncing") {
      return `Syncing ${pendingCount} change${pendingCount !== 1 ? "s" : ""}...`
    }
    if (syncStatus === "error") {
      return "Some changes failed to sync - will retry automatically"
    }
    return null
  }

  return { message: getMessage() }
}
