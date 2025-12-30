import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { Moon, Sun, LayoutDashboard, Users, BookOpen, DollarSign, Calendar, UserCircle } from "lucide-react"
import { sizing, componentClasses } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

type Page = 'dashboard' | 'students' | 'teachers' | 'accounting' | 'attendance' | 'profile'

interface NavigationProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { theme, setTheme } = useTheme()

  const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className={sizing.toolbarIcon} /> },
    { id: 'students', label: 'Students', icon: <Users className={sizing.toolbarIcon} /> },
    { id: 'teachers', label: 'Teachers', icon: <BookOpen className={sizing.toolbarIcon} /> },
    { id: 'accounting', label: 'Accounting', icon: <DollarSign className={sizing.toolbarIcon} /> },
    { id: 'attendance', label: 'Attendance', icon: <Calendar className={sizing.toolbarIcon} /> },
  ]

  return (
    <nav className="bg-[#e79908] dark:bg-[#2d0707] border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold text-black dark:text-white">
              GSPN Edu
            </div>
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    componentClasses.navMainButtonBase,
                    isActive
                      ? componentClasses.navMainButtonActive
                      : componentClasses.navMainButtonInactive
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-black dark:text-white hover:bg-[#f0c74a] dark:hover:bg-[#4a0c0c]"
            >
              <Sun className={cn(sizing.toolbarIcon, "rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0")} />
              <Moon className={cn(sizing.toolbarIcon, "absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100")} />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className={sizing.avatar.sm}>
                    <AvatarFallback className="bg-white dark:bg-gray-700">
                      <UserCircle className={sizing.icon.sm} />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate('profile')}>
                  <UserCircle className={cn(sizing.icon.sm, "mr-2")} />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-[#fff5d8] text-black dark:bg-[#e79908] dark:text-[#2d0707] shadow-md"
                    : "text-black hover:bg-[#f0c74a] dark:text-gray-200 dark:hover:bg-[#4a0c0c]"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}