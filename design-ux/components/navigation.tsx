"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  LogIn,
  Menu,
  X,
  Wifi,
  WifiOff,
  BookOpen,
  Receipt,
  ClipboardCheck,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const mainNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Enrollments", href: "/enrollments", icon: Users },
  { name: "Activities", href: "/activities", icon: BookOpen },
  { name: "Accounting", href: "/accounting", icon: Receipt },
  { name: "Attendance", href: "/attendance", icon: ClipboardCheck },
  { name: "Reports", href: "/reports", icon: BarChart3 },
]

const bottomNavigation = [
  { name: "Users", href: "/users", icon: Users },
  { name: "Login", href: "/login", icon: LogIn },
]

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
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-40 bg-primary border-b border-primary-foreground/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="GSPN" className="h-10 w-10 rounded-full" />
              <div>
                <h2 className="font-bold text-base text-primary-foreground">GSPN</h2>
                <p className="text-xs text-primary-foreground/70">Management System</p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {mainNavigation.map((item) => {
                const isActive = pathname === item.href
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

            <div className="flex items-center gap-3">
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

              {bottomNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
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
          <div className="border-b border-secondary-foreground/10 p-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="GSPN" className="h-10 w-10 rounded-full" />
              <div>
                <h2 className="font-bold text-lg">GSPN</h2>
                <p className="text-xs text-secondary-foreground/70">Management System</p>
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
            <ul className="space-y-2">
              {mainNavigation.map((item) => {
                const isActive = pathname === item.href
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

            <div className="mt-8 pt-8 border-t border-secondary-foreground/10">
              <ul className="space-y-2">
                {bottomNavigation.map((item) => {
                  const isActive = pathname === item.href
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
            <p className="text-xs text-secondary-foreground/60 text-center">Excellence in Education</p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
