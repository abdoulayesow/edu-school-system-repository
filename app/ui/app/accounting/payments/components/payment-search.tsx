"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/i18n-provider"

interface PaymentSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function PaymentSearch({ value, onChange, placeholder, className }: PaymentSearchProps) {
  const { t } = useI18n()
  const [localValue, setLocalValue] = useState(value)
  const [isFocused, setIsFocused] = useState(false)

  // Debounce the search - update parent after 300ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [localValue, onChange])

  // Sync with external changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleClear = useCallback(() => {
    setLocalValue("")
    onChange("")
  }, [onChange])

  return (
    <div className={cn("relative group", className)}>
      {/* Search Icon */}
      <Search
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 size-4 transition-colors duration-200",
          isFocused
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground"
        )}
        aria-hidden="true"
      />

      {/* Search Input */}
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder || t.accounting.searchPlaceholder}
        className={cn(
          "pl-10 pr-10 h-10",
          "transition-all duration-200",
          "border-border hover:border-primary/50 focus:border-primary",
          "bg-background/50 hover:bg-background focus:bg-background",
          "shadow-sm hover:shadow-md focus:shadow-md",
          isFocused && "ring-2 ring-primary/20"
        )}
        aria-label={t.accounting.searchPlaceholder}
      />

      {/* Clear Button */}
      {localValue && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className={cn(
            "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0",
            "opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200",
            "hover:bg-muted/80"
          )}
          aria-label={t.accounting.clearSearch}
        >
          <X className="size-3.5" />
        </Button>
      )}

      {/* Subtle focus indicator line at bottom */}
      <div
        className={cn(
          "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent transition-all duration-300",
          isFocused ? "w-full opacity-100" : "w-0 opacity-0"
        )}
        aria-hidden="true"
      />
    </div>
  )
}
