import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { spacing, type CardPadding } from "@/lib/design-tokens"

interface ContentCardProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
  headerAction?: React.ReactNode
  padding?: CardPadding
  headerClassName?: string
  contentClassName?: string
}

/**
 * Standardized card wrapper with consistent styling.
 * Use for content sections that need a card container.
 */
export function ContentCard({
  children,
  title,
  description,
  className,
  headerAction,
  padding = "md",
  headerClassName,
  contentClassName,
}: ContentCardProps) {
  const hasHeader = title || description || headerAction

  return (
    <Card className={cn("bg-card dark:bg-card", className)}>
      {hasHeader && (
        <CardHeader
          className={cn(
            "flex flex-row items-center justify-between space-y-0 pb-4",
            headerClassName
          )}
        >
          <div className="space-y-1">
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </CardHeader>
      )}
      <CardContent className={cn(spacing.card[padding], contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}