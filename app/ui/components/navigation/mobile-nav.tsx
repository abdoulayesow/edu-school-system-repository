"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import {
  Menu,
  X,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getNavigationForRole } from "@/lib/nav-config"
import type { UserRole } from "@/lib/nav-links"
import { useI18n } from "@/components/i18n-provider"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useUserInitials } from "@/hooks/use-user-initials"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ThemeToggleButton } from "@/components/theme-toggle-button"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const isLargeScreen = useMediaQuery("(min-width: 1024px)", false)
  const pathname = usePathname()
  const { t } = useI18n()
  const { data: session } = useSession()

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (isLargeScreen) {
      setIsOpen(false)
    }
  }, [isLargeScreen])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Get visible navigation items for the current user's role
  const visibleNavItems = useMemo(() => {
    const userRole = session?.user?.role as UserRole | undefined
    return getNavigationForRole(userRole)
  }, [session?.user?.role])

  // Get user initials for avatar fallback
  const userInitials = useUserInitials()

  // Don't render on login page
  if (pathname === "/login") {
    return null
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          size="icon"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#e79908] dark:bg-[#2d0707] shadow-lg border-gspn-gold-300 dark:border-gray-800/50 text-black dark:text-white hover:bg-gspn-gold-300 dark:hover:bg-gspn-maroon-900"
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Sheet - only render on mobile to prevent z-index conflicts with TopNav */}
      {!isLargeScreen && (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent
            side="left"
            className="w-80 p-0 bg-[#e79908] dark:bg-[#2d0707] border-gspn-gold-300 dark:border-gray-800/50"
          >
          <SheetHeader className="border-b border-gspn-gold-300 dark:border-gray-800/50 p-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.png"
                  alt="GSPN"
                  fill
                  className="object-contain rounded-full"
                />
              </div>
              <div>
                <SheetTitle className="text-left text-black dark:text-white">
                  GSPN
                </SheetTitle>
                <p className="text-xs text-black dark:text-gspn-gold-400">
                  {t.nav.managementSystem}
                </p>
              </div>
            </div>
          </SheetHeader>

          {/* User Info */}
          {session?.user && (
            <div className="border-b border-gspn-gold-300 dark:border-gray-800/50 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={session.user.image || undefined}
                    alt={session.user.name || "User"}
                  />
                  <AvatarFallback className="bg-gspn-gold-500 text-gspn-maroon-950 font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-black dark:text-white truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gspn-maroon-700 dark:text-gray-400 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <ScrollArea className="flex-1 p-4" style={{ height: "calc(100vh - 280px)" }}>
            <nav className="flex flex-col gap-2">
              {visibleNavItems.map((item) => {
                const Icon = item.icon
                const isExpanded = expandedItems.includes(item.id)

                return (
                  <Collapsible
                    key={item.id}
                    open={isExpanded}
                    onOpenChange={() => toggleExpanded(item.id)}
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-black hover:bg-gspn-gold-300 dark:text-gray-200 dark:hover:bg-[#4a0c0c] transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span>
                          {t.nav[item.translationKey as keyof typeof t.nav] ||
                            item.name}
                        </span>
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 text-black dark:text-gray-200 transition-transform duration-200",
                          isExpanded && "rotate-90"
                        )}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-gspn-maroon-300 dark:border-gspn-maroon-700 pl-4">
                        {item.subItems.map((subItem) => {
                          const SubIcon = subItem.icon
                          const isActive = pathname === subItem.href
                          return (
                            <Link
                              key={subItem.id}
                              href={subItem.href}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                isActive
                                  ? "bg-gspn-gold-50 text-black dark:bg-gspn-gold-500 dark:text-[#2d0707] font-semibold"
                                  : "text-black hover:bg-gspn-gold-300 dark:text-gray-300 dark:hover:bg-[#4a0c0c] dark:hover:text-white"
                              )}
                            >
                              <SubIcon className="h-4 w-4" />
                              <span>
                                {t.nav[subItem.translationKey as keyof typeof t.nav] ||
                                  subItem.name}
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </nav>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="border-t border-gspn-gold-300 dark:border-gray-800/50 p-4 space-y-3">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-black dark:text-gray-300">
                Theme
              </span>
              <ThemeToggleButton variant="nav" />
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher variant="default" />

            {/* Profile & Sign Out */}
            {session?.user && (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-black hover:bg-gspn-gold-300 dark:text-gray-300 dark:hover:bg-[#4a0c0c] dark:hover:text-white transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{t.nav.profile}</span>
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    signOut({ callbackUrl: "/" })
                  }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors w-full"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t.nav.signOut}</span>
                </button>
              </div>
            )}
          </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
