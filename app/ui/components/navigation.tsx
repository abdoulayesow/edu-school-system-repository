"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { mainNavigation, bottomNavigation } from "@/lib/nav-links"
import { useI18n } from "@/components/i18n-provider"
import { LanguageSwitcher } from "@/components/language-switcher"
import { signIn, signOut, useSession } from "next-auth/react"
import { OfflineIndicator } from "@/components/offline-indicator"

const visibleMainNavigation = mainNavigation
const visibleBottomNavigation = bottomNavigation

// Map nav link names to translation keys
const navTranslationKeys: Record<string, keyof typeof import('@/lib/i18n').fr.nav> = {
  'Dashboard': 'dashboard',
  'Enrollments': 'enrollments',
  'Activities': 'activities',
  'Accounting': 'accounting',
  'Attendance': 'attendance',
  'Reports': 'reports',
  'Users': 'users',
  'Login': 'login',
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useI18n()
  const { data: session } = useSession()

  // Show minimal navigation on login page (logo + language switcher only)
  if (pathname === '/login') {
    return (
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-40 bg-primary border-b border-primary-foreground/10 h-16 items-center">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="GSPN" className="h-10 w-10 rounded-full" />
            <div>
              <h2 className="font-bold text-base text-primary-foreground">GSPN</h2>
              <p className="text-xs text-primary-foreground/70">{t.nav.managementSystem}</p>
            </div>
          </Link>

          {/* Language Switcher Only */}
          <LanguageSwitcher variant="nav" />
        </div>
      </nav>
    )
  }

  // Helper to get translated nav name
  const getNavName = (name: string) => {
    const key = navTranslationKeys[name]
    return key ? t.nav[key] : name
  }

  return (
    <>
      {/* Mobile Sidebar Navigation - Only show when logged in */}
      {session && (
        <div className="fixed top-4 left-4 z-50 lg:hidden">
          <Button size="icon" variant="outline" onClick={() => setIsOpen(!isOpen)} className="bg-background shadow-lg">
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      )}

      {/* Horizontal Navigation Bar - Desktop Only */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-40 bg-primary border-b border-primary-foreground/10 h-16 items-center">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="GSPN" className="h-10 w-10 rounded-full" />
            <div>
              <h2 className="font-bold text-base text-primary-foreground">GSPN</h2>
              <p className="text-xs text-primary-foreground/70">{t.nav.managementSystem}</p>
            </div>
          </Link>

          {/* Main Links - Only show when logged in */}
          {session && (
            <div className="flex items-center gap-2">
              {visibleMainNavigation.map((item) => {
                const isActive = pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary-foreground text-primary shadow-sm"
                        : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{getNavName(item.name)}</span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Language Switcher - Always visible */}
            <LanguageSwitcher variant="nav" />

            {/* Offline/Sync Indicator - Only show when logged in */}
            {session && <OfflineIndicator showLabel size="sm" />}

            {/* User Profile Dropdown - Only show when logged in */}
            {session && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="group">
                  <button
                    data-testid="user-dropdown-trigger"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-all duration-200 hover:bg-primary-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 focus:ring-offset-2 focus:ring-offset-primary border border-transparent hover:border-primary-foreground/20"
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-primary-foreground/20">
                      <AvatarImage src={session?.user?.image ?? ""} alt={session?.user?.name ?? ""} />
                      <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground">
                        {(session?.user?.name?.[0] ?? "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm text-left">
                      <p className="font-semibold text-primary-foreground">
                        {session?.user?.name ?? "Guest"}
                      </p>
                      <p className="text-primary-foreground/70 capitalize text-xs">
                        {session?.user?.role ?? ""}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-primary-foreground/70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 shadow-lg border border-border/50" sideOffset={12}>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session?.user?.name ?? "Guest"}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {session?.user?.role ?? ""}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t.nav.profile}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t.nav.signOut}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Sign In Button - Show when logged out */}
            {!session && (
              <button
                onClick={() => signIn()}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <span>{t.nav.login}</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {session && (
        <aside
          className={cn(
            "fixed left-0 top-0 z-40 h-screen w-64 bg-secondary/80 text-secondary-foreground transition-transform duration-300 ease-in-out lg:hidden glassmorphism",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-secondary-foreground/10 p-4">
            <div className="flex items-center gap-3">
               <Avatar className="h-10 w-10">
                <AvatarImage src={session?.user?.image ?? ""} alt={session?.user?.name ?? ""} />
                <AvatarFallback>
                  {(session?.user?.name?.[0] ?? "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-bold text-md">{session?.user?.name ?? "Guest"}</h2>
                <p className="text-xs text-secondary-foreground/70 capitalize">
                  {session?.user?.role ?? ""}
                </p>
              </div>
            </div>
          </div>

          {/* Online/Offline Status */}
          <div className="px-4 py-3 border-b border-secondary-foreground/10">
            <OfflineIndicator showLabel size="sm" />
          </div>

          {/* Language Switcher - Mobile */}
          <div className="px-4 py-3 border-b border-secondary-foreground/10">
            <LanguageSwitcher variant="default" />
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <p className="text-xs font-semibold uppercase text-secondary-foreground/50 tracking-wider mb-2">{t.common.menu}</p>
            <ul className="space-y-1">
              {visibleMainNavigation.map((item) => {
                const isActive = pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-secondary-foreground/80 hover:bg-secondary-foreground/10 hover:text-secondary-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{getNavName(item.name)}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            <div className="mt-6 pt-6 border-t border-secondary-foreground/10">
              <ul className="space-y-1">
                {visibleBottomNavigation.map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  const Icon = item.icon
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-secondary-foreground/80 hover:bg-secondary-foreground/10 hover:text-secondary-foreground",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{getNavName(item.name)}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-secondary-foreground/10 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-secondary-foreground/80 hover:bg-secondary-foreground/10 hover:text-secondary-foreground">
                  <User className="h-4 w-4" />
                  <span>{t.nav.myAccount}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56" sideOffset={8}>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer" onClick={() => setIsOpen(false)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>{t.nav.profile}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    setIsOpen(false)
                    signOut({ callbackUrl: "/login" })
                  }}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t.nav.signOut}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        </aside>
      )}

      {/* Overlay for mobile */}
      {session && isOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
