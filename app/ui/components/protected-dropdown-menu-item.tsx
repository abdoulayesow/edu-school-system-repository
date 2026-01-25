"use client"

/**
 * ProtectedDropdownMenuItem Component
 *
 * A dropdown menu item that integrates with the permission system.
 * Hides or disables the menu item based on user permissions.
 *
 * Usage:
 * ```tsx
 * <DropdownMenuContent>
 *   <ProtectedDropdownMenuItem
 *     resource="students"
 *     action="update"
 *     onClick={() => handleEdit()}
 *   >
 *     <Pencil className="size-4" />
 *     Edit Student
 *   </ProtectedDropdownMenuItem>
 *
 *   <ProtectedDropdownMenuItem
 *     resource="students"
 *     action="delete"
 *     variant="destructive"
 *     showDisabled
 *   >
 *     <Trash className="size-4" />
 *     Delete
 *   </ProtectedDropdownMenuItem>
 * </DropdownMenuContent>
 * ```
 */

import { ReactNode } from "react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { usePermission } from "@/components/permission-guard"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"

interface ProtectedDropdownMenuItemProps {
  /** Permission resource to check */
  resource: string
  /** Permission action to check */
  action: string
  /** If true, shows disabled state instead of hiding */
  showDisabled?: boolean
  /** Content of the menu item */
  children: ReactNode
  /** Click handler (only called if permission granted) */
  onClick?: () => void
  /** Additional class name */
  className?: string
  /** Destructive styling for delete actions */
  variant?: "default" | "destructive"
  /** Inset styling to align with items that have icons */
  inset?: boolean
}

export function ProtectedDropdownMenuItem({
  resource,
  action,
  showDisabled = false,
  children,
  onClick,
  className,
  variant = "default",
  inset,
}: ProtectedDropdownMenuItemProps) {
  const { t } = useI18n()
  const { granted, loading } = usePermission(resource, action)

  // While loading, show a disabled placeholder
  if (loading) {
    return (
      <DropdownMenuItem disabled className={cn("opacity-50", className)} inset={inset}>
        {children}
      </DropdownMenuItem>
    )
  }

  // If not granted and not showing disabled, hide completely
  if (!granted && !showDisabled) {
    return null
  }

  // If not granted but showDisabled is true, show with tooltip
  if (!granted && showDisabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <DropdownMenuItem
                disabled
                className={cn("cursor-not-allowed", className)}
                variant={variant}
                inset={inset}
              >
                {children}
              </DropdownMenuItem>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{t.permissions?.noAccess || "You don't have permission for this action"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Permission granted - render normally
  return (
    <DropdownMenuItem
      onClick={onClick}
      className={className}
      variant={variant}
      inset={inset}
    >
      {children}
    </DropdownMenuItem>
  )
}
