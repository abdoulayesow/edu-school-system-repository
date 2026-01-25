"use client"

import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string
  label: string
}

export interface HydratedSelectProps {
  /** Current selected value */
  value: string
  /** Callback when value changes */
  onValueChange: (value: string) => void
  /** Placeholder text shown when no value selected */
  placeholder: string
  /** Available options */
  options: SelectOption[]
  /** Width class (e.g., "w-[200px]") */
  width?: string
  /** Optional className for the trigger */
  className?: string
  /** Whether the select is disabled */
  disabled?: boolean
}

/**
 * SSR-safe Select component that prevents hydration mismatches.
 * Shows a static placeholder during SSR, then hydrates to full Select on client.
 *
 * @example
 * <HydratedSelect
 *   value={filter}
 *   onValueChange={setFilter}
 *   placeholder="All Categories"
 *   options={[
 *     { value: "all", label: "All Categories" },
 *     { value: "sports", label: "Sports" },
 *   ]}
 *   width="w-[200px]"
 * />
 */
export function HydratedSelect({
  value,
  onValueChange,
  placeholder,
  options,
  width = "w-full sm:w-[180px]",
  className,
  disabled = false,
}: HydratedSelectProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div
        className={cn(
          "h-9 rounded-md border bg-transparent px-3 py-2 flex items-center text-sm text-muted-foreground",
          width,
          className
        )}
      >
        {placeholder}
      </div>
    )
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={cn(width, className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
