"use client"

import { useEffect, useState } from "react"
import { LockKeyhole, Unlock } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useI18n } from "@/components/i18n-provider"

interface RegistryStatusIndicatorProps {
  className?: string
}

/**
 * RegistryStatusIndicator - Shows when registry is closed (registryBalance === 0)
 *
 * Displays a sophisticated amber indicator with lock icon only when registry is closed.
 * Includes tooltip explanation and subtle entrance animation.
 */
export function RegistryStatusIndicator({ className }: RegistryStatusIndicatorProps) {
  const { t, locale } = useI18n()
  const [registryBalance, setRegistryBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    async function fetchRegistryBalance() {
      try {
        const res = await fetch('/api/treasury/balance')
        if (res.ok) {
          const data = await res.json()
          setRegistryBalance(data.registryBalance ?? 0)

          // Trigger entrance animation after data loads
          if (data.registryBalance === 0) {
            setTimeout(() => setIsVisible(true), 100)
          }
        }
      } catch (error) {
        console.error('Failed to fetch registry balance:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRegistryBalance()

    // Refresh every 60 seconds
    const interval = setInterval(fetchRegistryBalance, 60000)
    return () => clearInterval(interval)
  }, [])

  // Don't render anything if loading or registry is open
  if (isLoading || registryBalance === null || registryBalance > 0) {
    return null
  }

  const message = locale === "fr"
    ? "Caisse fermée - Ouvrir la caisse pour accepter les paiements en espèces"
    : "Registry Closed - Open registry to accept cash payments/expenses"

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "group relative overflow-hidden rounded-xl border-2 px-4 py-2.5 transition-all duration-500",
              "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100",
              "dark:from-amber-950/40 dark:via-orange-950/40 dark:to-amber-900/40",
              "border-amber-300/60 dark:border-amber-700/60",
              "shadow-md hover:shadow-lg hover:shadow-amber-500/25",
              "cursor-help",
              // Entrance animation
              isVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-2 scale-95",
              className
            )}
          >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent dark:via-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer" />

            {/* Subtle dot pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
              style={{
                backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                backgroundSize: '12px 12px'
              }}
            />

            {/* Content */}
            <div className="relative flex items-center gap-2.5">
              {/* Animated lock icon */}
              <div className="relative flex items-center justify-center">
                <LockKeyhole
                  className={cn(
                    "h-5 w-5 text-amber-700 dark:text-amber-400",
                    "transition-transform duration-300",
                    "group-hover:scale-110 group-hover:rotate-[-5deg]"
                  )}
                  strokeWidth={2.5}
                />
                {/* Pulse ring on hover */}
                <div className="absolute inset-0 rounded-full bg-amber-500/20 scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              </div>

              {/* Text content */}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-amber-900 dark:text-amber-200 tracking-tight leading-none">
                  {locale === "fr" ? "Caisse Fermée" : "Registry Closed"}
                </span>
                <span className="text-[10px] font-medium text-amber-700/80 dark:text-amber-400/80 leading-none tracking-wide uppercase">
                  {locale === "fr" ? "Paiements espèces bloqués" : "Cash payments blocked"}
                </span>
              </div>

              {/* Status indicator dot */}
              <div className="ml-auto flex items-center justify-center">
                <div className="relative">
                  <div className="h-2 w-2 rounded-full bg-amber-600 dark:bg-amber-500" />
                  <div className="absolute inset-0 h-2 w-2 rounded-full bg-amber-600 dark:bg-amber-500 animate-ping opacity-75" />
                </div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="max-w-xs bg-amber-950 dark:bg-amber-900 text-amber-50 border-amber-700"
        >
          <div className="flex items-start gap-2">
            <LockKeyhole className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">{message}</p>
              <p className="text-xs text-amber-200/80">
                {locale === "fr"
                  ? "Effectuez l'ouverture journalière dans Comptabilité > Trésorerie"
                  : "Perform daily opening in Accounting > Treasury"}
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Add shimmer animation to global CSS if not already present
// @keyframes shimmer {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// }
// .animate-shimmer {
//   animation: shimmer 3s infinite;
// }
