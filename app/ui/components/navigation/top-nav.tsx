"use client"

import { useMemo, useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import {
  LogOut,
  User,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { sizing, componentClasses } from "@/lib/design-tokens"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getNavigationForRole } from "@/lib/nav-config"
import type { UserRole } from "@/lib/nav-config"
import { useI18n } from "@/components/i18n-provider"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useNavigation } from "./navigation-context"
import { useUserInitials } from "@/hooks/use-user-initials"
import { ThemeToggleButton } from "@/components/theme-toggle-button"

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useI18n()
  const { data: session } = useSession()
  const { activeMainNav, setActiveMainNav, isSidebarOpen } = useNavigation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Track scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownOpen])

  // Get visible navigation items for the current user's role
  const visibleNavItems = useMemo(() => {
    const userRole = session?.user?.role as UserRole | undefined
    return getNavigationForRole(userRole)
  }, [session?.user?.role])

  const handleNavClick = (itemId: string) => {
    // Set active nav and navigate to first sub-item
    setActiveMainNav(itemId)

    // Find the nav item and navigate to its first sub-item
    const navItem = visibleNavItems.find(item => item.id === itemId)
    if (navItem && navItem.subItems.length > 0) {
      const firstSubItem = navItem.subItems[0]
      router.push(firstSubItem.href)
    }
  }

  // Get user initials for avatar fallback
  const userInitials = useUserInitials()

  // Don't show full nav on login page
  if (pathname === "/login") {
    return null
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[60] h-[91px] border-b border-gspn-gold-300 dark:border-sidebar-border bg-nav-highlight/95 dark:bg-nav-dark-text/95 backdrop-blur-sm transition-shadow duration-300",
        isScrolled && "shadow-lg shadow-black/5 dark:shadow-black/20"
      )}
    >
      <div className="h-full px-4 lg:px-6">
        <div className="flex items-center justify-between h-full">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="GSPN"
                fill
                className="object-contain rounded-full"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-display font-bold text-black dark:text-white">
                GSPN
              </h1>
              <p className="text-xs text-black dark:text-gspn-gold-400">
                {t.nav.managementSystem}
              </p>
            </div>
          </Link>

          {/* Main Navigation */}
          {session && (
            <nav className="hidden lg:flex items-center gap-2">
              {visibleNavItems.map((item) => {
                const Icon = item.icon
                const isActive = activeMainNav === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      componentClasses.navMainButtonBase,
                      isActive
                        ? componentClasses.navMainButtonActive
                        : componentClasses.navMainButtonInactive
                    )}
                  >
                    <Icon className={sizing.toolbarIcon} />
                    <span>
                      {t.nav[item.translationKey as keyof typeof t.nav] ||
                        item.name}
                    </span>
                  </button>
                )
              })}
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggleButton variant="nav" />

            <LanguageSwitcher variant="nav" />

            {/* User Dropdown - Custom implementation (no animation) */}
            {session?.user && (
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-gspn-gold-300 hover:bg-gspn-gold-200 dark:bg-gspn-maroon-800 dark:hover:bg-gspn-maroon-700 rounded-lg transition-colors text-black dark:text-gray-200"
                >
                  <Avatar className={sizing.avatar.sm}>
                    <AvatarImage
                      src={session.user.image || undefined}
                      alt={session.user.name || "User"}
                    />
                    <AvatarFallback className="bg-gspn-gold-500 text-gspn-maroon-950 text-xs font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-bold text-black dark:text-gray-200 max-w-[120px] truncate">
                    {session.user.name || session.user.email}
                  </span>
                  <ChevronDown
                    className={cn(
                      sizing.icon.sm,
                      "text-black dark:text-gray-300 transition-transform",
                      dropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-popover dark:bg-popover rounded-lg shadow-lg border border-border py-1 z-50 animate-scale-in origin-top-right">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.user.email}
                      </p>
                    </div>

                    {/* Profile Link */}
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <User className={sizing.icon.sm} />
                      <span>{t.nav.profile}</span>
                    </Link>

                    {/* Logout */}
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        signOut({ callbackUrl: "/" })
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors border-t border-border"
                    >
                      <LogOut className={sizing.icon.sm} />
                      <span>{t.nav.signOut}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile user avatar (without dropdown trigger) */}
            {session?.user && (
              <Avatar className={cn(sizing.avatar.md, "md:hidden")}>
                <AvatarImage
                  src={session.user.image || undefined}
                  alt={session.user.name || "User"}
                />
                <AvatarFallback className="bg-gspn-gold-500 text-gspn-maroon-950 text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
