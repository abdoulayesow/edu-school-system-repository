"use client"

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ThemeToggleButtonProps {
  variant?: 'nav' | 'default'
  className?: string
  size?: 'icon' | 'default' | 'sm' | 'lg'
}

/**
 * Reusable theme toggle button component
 * Handles hydration mismatch by showing consistent icon until mounted
 */
export function ThemeToggleButton({
  variant = 'default',
  className,
  size = 'icon',
}: ThemeToggleButtonProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering theme-dependent UI after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const baseClasses =
    variant === 'nav'
      ? 'rounded-lg bg-gspn-gold-300 hover:bg-gspn-gold-200 dark:bg-gspn-maroon-800 dark:hover:bg-gspn-maroon-700'
      : ''

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(baseClasses, className)}
      aria-label="Toggle theme"
    >
      {/* Show consistent icon on server, then switch after hydration */}
      {!mounted ? (
        <Sun className="h-5 w-5 text-gspn-maroon-900 dark:text-gspn-gold-400" />
      ) : theme === 'dark' ? (
        <Sun className="h-5 w-5 text-gspn-maroon-900 dark:text-gspn-gold-400" />
      ) : (
        <Moon className="h-5 w-5 text-gspn-maroon-900 dark:text-gspn-gold-400" />
      )}
    </Button>
  )
}
