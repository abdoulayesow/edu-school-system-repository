"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { navigationConfig } from "@/lib/nav-config"
import type { UserRole } from "@/lib/nav-links"
import { useI18n } from "@/components/i18n-provider"
import { useNavigation } from "./navigation-context"
import { useMediaQuery } from "@/hooks/use-media-query"

export function NavSidebar() {
  const pathname = usePathname()
  const { t } = useI18n()
  const { data: session } = useSession()
  const isLargeScreen = useMediaQuery("(min-width: 1024px)", true) // Default true to avoid backdrop flash
  const {
    activeMainNav,
    isSidebarOpen,
    isSidebarCollapsed,
    toggleSidebar,
    closeSidebar,
  } = useNavigation()

  // Get active nav config
  const activeNavConfig = useMemo(() => {
    return navigationConfig.find((item) => item.id === activeMainNav)
  }, [activeMainNav])

  // Filter sub-items by role
  const visibleSubItems = useMemo(() => {
    if (!activeNavConfig) return []
    const userRole = session?.user?.role as UserRole | undefined
    if (!userRole) return []
    return activeNavConfig.subItems.filter((item) =>
      item.roles.includes(userRole)
    )
  }, [activeNavConfig, session?.user?.role])

  // Don't render if sidebar is not open or no active nav
  if (!isSidebarOpen || !activeNavConfig || !session) {
    return null
  }

  return (
    <>
      {/* Backdrop for mobile only - use JS check for reliability */}
      {!isLargeScreen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-[76px] z-40 h-[calc(100vh-76px)] border-r border-gspn-gold-300 dark:border-gray-800/50",
          "bg-[#e79908] dark:bg-gspn-maroon-950 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div
            className={cn(
              "flex items-center justify-between border-b border-gspn-gold-300 dark:border-gray-800/50 p-4",
              isSidebarCollapsed && "justify-center px-2"
            )}
          >
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2">
                <activeNavConfig.icon className="h-5 w-5 text-black dark:text-gspn-gold-400" />
                <span className="font-semibold text-black dark:text-white">
                  {t.nav[activeNavConfig.translationKey as keyof typeof t.nav] ||
                    activeNavConfig.name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 text-black hover:bg-gspn-gold-300 dark:text-gray-300 dark:hover:bg-gspn-maroon-800 dark:hover:text-white"
                title={
                  isSidebarCollapsed
                    ? t.nav.expandMenu || "Expand"
                    : t.nav.collapseMenu || "Collapse"
                }
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-black dark:text-gray-300" />
                ) : (
                  <ChevronLeft className="h-4 w-4 text-black dark:text-gray-300" />
                )}
              </Button>
              {!isSidebarCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeSidebar}
                  className="h-8 w-8 text-gspn-maroon-900 hover:bg-gspn-maroon-100 dark:text-gray-300 dark:hover:bg-gspn-maroon-800 dark:hover:text-white lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar Content */}
          <ScrollArea className="flex-1 px-2 py-4">
            <TooltipProvider delayDuration={0}>
              <nav className="flex flex-col gap-1">
                {visibleSubItems.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/")

                  if (isSidebarCollapsed) {
                    return (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 mx-auto",
                              isActive
                                ? "bg-gspn-gold-50 text-black dark:bg-gspn-gold-500 dark:text-gspn-maroon-950 shadow-sm font-semibold"
                                : "text-black hover:bg-gspn-gold-300 dark:text-gray-300 dark:hover:bg-gspn-maroon-800 dark:hover:text-white"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-gspn-maroon-900 dark:bg-gspn-maroon-800 text-white border-gspn-maroon-700">
                          {t.nav[item.translationKey as keyof typeof t.nav] ||
                            item.name}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gspn-gold-50 text-black dark:bg-gspn-gold-500 dark:text-gspn-maroon-950 shadow-sm font-semibold"
                          : "text-black hover:bg-gspn-gold-300 dark:text-gray-300 dark:hover:bg-gspn-maroon-800 dark:hover:text-white"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>
                        {t.nav[item.translationKey as keyof typeof t.nav] ||
                          item.name}
                      </span>
                    </Link>
                  )
                })}
              </nav>
            </TooltipProvider>
          </ScrollArea>

          {/* Footer - Close button (expanded mode only) */}
          {!isSidebarCollapsed && (
            <div className="border-t border-gspn-gold-300 dark:border-gray-800/50 p-4 hidden lg:block">
              <Button
                variant="ghost"
                className="w-full justify-start text-black hover:bg-gspn-gold-300 dark:text-gray-300 dark:hover:bg-gspn-maroon-800 dark:hover:text-white"
                onClick={closeSidebar}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                {t.nav.closeMenu || "Close Menu"}
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
