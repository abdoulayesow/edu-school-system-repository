"use client"

import { cn } from "@/lib/utils"
import { layouts, spacing } from "@/lib/design-tokens"

type ContainerSize = keyof typeof spacing.container

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: ContainerSize
  noPadding?: boolean
}

/**
 * Standard page wrapper with consistent padding and background.
 * Use this for all content pages that need consistent layout.
 *
 * @example
 * <PageContainer maxWidth="lg">
 *   <h1>Page Title</h1>
 *   <p>Page content...</p>
 * </PageContainer>
 */
export function PageContainer({
  children,
  className,
  maxWidth = "full",
  noPadding = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "pt-4 lg:pt-4 container mx-auto page-container",
        spacing.container[maxWidth],
        !noPadding && spacing.page.x,
        !noPadding && "py-4",
        className
      )}
    >
      {children}
    </div>
  )
}
