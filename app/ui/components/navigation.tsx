"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Menu, X, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mainNavigation, bottomNavigation } from "@/lib/nav-links"
import { sampleUsers } from "@/db/sample-data"

// Simulate a logged-in user. We will replace this with a real auth hook later.
const currentUser = sampleUsers[0] // Ousmane Diop, Director

const visibleMainNavigation = mainNavigation.filter((item) =>
  item.roles.includes(currentUser.role),
)
const visibleBottomNavigation = bottomNavigation.filter((item) =>
  item.roles.includes(currentUser.role),
)

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button size="icon" variant="outline" onClick={() => setIsOpen(!isOpen)} className="bg-background shadow-lg">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Horizontal Navigation Bar - Desktop Only */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-40 bg-primary border-b border-primary-foreground/10 h-16 items-center">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="GSPN" className="h-10 w-10 rounded-full" />
            <div>
              <h2 className="font-bold text-base text-primary-foreground">GSPN</h2>
              <p className="text-xs text-primary-foreground/70">Management System</p>
            </div>
          </Link>

          {/* Main Links */}
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
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                isOnline
                  ? "bg-success/90 text-success-foreground hover:bg-success"
                  : "bg-warning/90 text-warning-foreground hover:bg-warning",
              )}
            >
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span>{isOnline ? "Online" : "Offline"}</span>
            </button>
            
            {/* User Profile */}
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={currentUser.avatar_url} alt={`${currentUser.first_name} ${currentUser.last_name}`} />
                <AvatarFallback>{currentUser.first_name[0]}{currentUser.last_name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-semibold text-primary-foreground">{currentUser.first_name} {currentUser.last_name}</p>
                <p className="text-primary-foreground/70 capitalize">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Navigation */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-secondary text-secondary-foreground transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-secondary-foreground/10 p-4">
            <div className="flex items-center gap-3">
               <Avatar className="h-10 w-10">
                <AvatarImage src={currentUser.avatar_url} alt={`${currentUser.first_name} ${currentUser.last_name}`} />
                <AvatarFallback>{currentUser.first_name[0]}{currentUser.last_name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-bold text-md">{currentUser.first_name} {currentUser.last_name}</h2>
                <p className="text-xs text-secondary-foreground/70 capitalize">{currentUser.role}</p>
              </div>
            </div>
          </div>

          {/* Online/Offline Status */}
          <div className="px-4 py-3 border-b border-secondary-foreground/10">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isOnline
                  ? "bg-success/10 text-success hover:bg-success/20"
                  : "bg-destructive/10 text-destructive hover:bg-destructive/20",
              )}
            >
              {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span>{isOnline ? "Online - Synced" : "Offline Mode"}</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <p className="text-xs font-semibold uppercase text-secondary-foreground/50 tracking-wider mb-2">Menu</p>
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
                      <span>{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            <div className="mt-6 pt-6 border-t border-secondary-foreground/10">
              <p className="text-xs font-semibold uppercase text-secondary-foreground/50 tracking-wider mb-2">Settings</p>
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
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-secondary-foreground/10 p-4">
              <Link
                href="/login"
                className="flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-secondary-foreground/80 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
              >
                <span>Logout</span>
              </Link>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
