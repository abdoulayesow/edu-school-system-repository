"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { componentClasses } from "@/lib/design-tokens"

export interface SearchInputProps {
  /** Controlled value */
  value: string
  /** Change handler - receives string value directly */
  onChange: (value: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Additional input className */
  className?: string
  /** Additional wrapper className */
  wrapperClassName?: string
  /** Icon size variant */
  iconSize?: "sm" | "md"
  /** Input size variant (maps to Input component) */
  size?: "default" | "sm" | "lg"
  /** Disabled state */
  disabled?: boolean
  /** Auto focus */
  autoFocus?: boolean
  /** Debounce delay in ms. If set, onChange is called after this delay. */
  debounceMs?: number
  /** Show clear button when input has value */
  showClear?: boolean
  /** Aria label for accessibility */
  ariaLabel?: string
}

/**
 * SearchInput - GSPN branded search input with icon
 *
 * Features:
 * - Search icon positioned inside input
 * - Brand-compliant styling (bg-muted/50)
 * - Simplified onChange API (receives value, not event)
 * - Optional debouncing for API calls
 * - Optional clear button
 */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({
    className,
    wrapperClassName,
    value,
    onChange,
    iconSize = "sm",
    size,
    placeholder,
    disabled,
    autoFocus,
    debounceMs,
    showClear = false,
    ariaLabel,
  }, ref) => {
    const iconClasses = iconSize === "sm" ? "h-4 w-4" : "h-5 w-5"

    // Use local state when debouncing, otherwise use controlled value directly
    const [localValue, setLocalValue] = useState(value)
    const isDebounced = debounceMs !== undefined && debounceMs > 0

    // Sync external value changes to local state
    useEffect(() => {
      if (isDebounced) {
        setLocalValue(value)
      }
    }, [value, isDebounced])

    // Debounce onChange when debounceMs is set
    useEffect(() => {
      if (!isDebounced) return

      const timer = setTimeout(() => {
        if (localValue !== value) {
          onChange(localValue)
        }
      }, debounceMs)

      return () => clearTimeout(timer)
    }, [localValue, debounceMs, onChange, value, isDebounced])

    const handleChange = useCallback((newValue: string) => {
      if (isDebounced) {
        setLocalValue(newValue)
      } else {
        onChange(newValue)
      }
    }, [isDebounced, onChange])

    const handleClear = useCallback(() => {
      if (isDebounced) {
        setLocalValue("")
      }
      onChange("")
    }, [isDebounced, onChange])

    const displayValue = isDebounced ? localValue : value
    const hasValue = displayValue.length > 0

    return (
      <div className={cn(componentClasses.searchInputWrapper, "group", wrapperClassName)}>
        <Search
          className={cn(
            componentClasses.searchInputIcon,
            iconClasses
          )}
          aria-hidden="true"
        />
        <Input
          ref={ref}
          type="search"
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          size={size}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-label={ariaLabel || placeholder}
          className={cn(
            componentClasses.searchInput,
            showClear && hasValue && "pr-9",
            className
          )}
        />
        {showClear && hasValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-muted/80"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
