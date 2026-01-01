"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { usePathname } from "next/navigation"
import { getActiveMainNav } from "@/lib/nav-config"

interface NavigationContextType {
  /** Currently active main nav section (e.g., "dashboard", "students") */
  activeMainNav: string | null
  /** Set the active main nav section */
  setActiveMainNav: (id: string | null) => void
  /** Whether the sidebar is open (visible) */
  isSidebarOpen: boolean
  /** Set sidebar open state */
  setSidebarOpen: (open: boolean) => void
  /** Whether the sidebar is collapsed (icon-only mode) */
  isSidebarCollapsed: boolean
  /** Set sidebar collapsed state */
  setSidebarCollapsed: (collapsed: boolean) => void
  /** Toggle sidebar collapsed state */
  toggleSidebar: () => void
  /** Close the sidebar completely */
  closeSidebar: () => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
)

const SIDEBAR_STATE_KEY = "gspn-sidebar-state"
const ACTIVE_NAV_KEY = "gspn-active-nav"

interface NavigationProviderProps {
  children: ReactNode
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const pathname = usePathname()
  const [activeMainNav, setActiveMainNavState] = useState<string | null>(null)
  const [isSidebarOpen, setSidebarOpenState] = useState(false)
  const [isSidebarCollapsed, setSidebarCollapsedState] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Restore state from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const savedState = localStorage.getItem(SIDEBAR_STATE_KEY)
      if (savedState) {
        const { collapsed } = JSON.parse(savedState)
        setSidebarCollapsedState(collapsed)
      }

      // Determine active nav from current path
      const activeNav = getActiveMainNav(pathname)
      if (activeNav) {
        setActiveMainNavState(activeNav)
        setSidebarOpenState(true)
      }
    } catch (error) {
      console.error("Error restoring navigation state:", error)
    }

    setIsInitialized(true)
  }, [pathname])

  // Update active nav when pathname changes (URL navigation)
  // Note: We intentionally exclude activeMainNav from deps - this effect should only
  // run on URL changes, not when user clicks nav buttons (which also change activeMainNav)
  useEffect(() => {
    if (!isInitialized) return

    const activeNav = getActiveMainNav(pathname)
    if (activeNav) {
      setActiveMainNavState(activeNav)
      setSidebarOpenState(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isInitialized])

  const setActiveMainNav = useCallback((id: string | null) => {
    setActiveMainNavState(id)
    if (id) {
      setSidebarOpenState(true)
      try {
        localStorage.setItem(ACTIVE_NAV_KEY, id)
      } catch (error) {
        console.error("Error saving active nav:", error)
      }
    } else {
      try {
        localStorage.removeItem(ACTIVE_NAV_KEY)
      } catch (error) {
        console.error("Error removing active nav:", error)
      }
    }
  }, [])

  const setSidebarOpen = useCallback((open: boolean) => {
    setSidebarOpenState(open)
    if (!open) {
      // Don't clear activeMainNav when closing - keep it for path highlighting
    }
  }, [])

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsedState(collapsed)
    try {
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify({ collapsed }))
    } catch (error) {
      console.error("Error saving sidebar state:", error)
    }
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(!isSidebarCollapsed)
  }, [isSidebarCollapsed, setSidebarCollapsed])

  const closeSidebar = useCallback(() => {
    setSidebarOpenState(false)
  }, [])

  return (
    <NavigationContext.Provider
      value={{
        activeMainNav,
        setActiveMainNav,
        isSidebarOpen,
        setSidebarOpen,
        isSidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        closeSidebar,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider")
  }
  return context
}
