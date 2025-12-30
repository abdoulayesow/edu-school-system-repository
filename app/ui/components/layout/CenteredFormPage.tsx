"use client"

import { cn } from "@/lib/utils"
import { layouts, spacing } from "@/lib/design-tokens"

type FormMaxWidth = "sm" | "md" | "lg"

interface CenteredFormPageProps {
  children: React.ReactNode
  className?: string
  maxWidth?: FormMaxWidth
}

/**
 * Full-screen centered layout for authentication and form pages.
 * Centers content both horizontally and vertically.
 *
 * @example
 * <CenteredFormPage maxWidth="sm">
 *   <Card>
 *     <CardHeader>Login</CardHeader>
 *     <CardContent>...</CardContent>
 *   </Card>
 * </CenteredFormPage>
 */
export function CenteredFormPage({
  children,
  className,
  maxWidth = "md",
}: CenteredFormPageProps) {
  return (
    <div className={cn(layouts.centeredPage, className)}>
      <div className={cn("w-full", spacing.container[maxWidth], "px-4")}>
        {children}
      </div>
    </div>
  )
}
