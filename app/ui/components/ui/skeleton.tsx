import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const skeletonVariants = cva(
  'rounded-md bg-muted',
  {
    variants: {
      variant: {
        default: 'animate-pulse',
        shimmer: 'skeleton-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted',
        wave: 'animate-pulse bg-gradient-to-r from-muted via-muted/70 to-muted bg-[length:200%_100%]',
      },
      size: {
        default: '',
        sm: 'h-4',
        md: 'h-6',
        lg: 'h-8',
        xl: 'h-12',
        // Common shapes
        avatar: 'h-10 w-10 rounded-full',
        'avatar-sm': 'h-8 w-8 rounded-full',
        'avatar-lg': 'h-12 w-12 rounded-full',
        button: 'h-9 w-24',
        'button-lg': 'h-10 w-32',
        card: 'h-48 w-full',
        line: 'h-4 w-full',
        'line-short': 'h-4 w-3/4',
        'line-shorter': 'h-4 w-1/2',
      },
    },
    defaultVariants: {
      variant: 'shimmer',
      size: 'default',
    },
  }
)

function Skeleton({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof skeletonVariants>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

// Pre-composed skeleton components for common use cases
function SkeletonCard({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      <Skeleton size="card" />
      <div className="space-y-2">
        <Skeleton size="line" />
        <Skeleton size="line-short" />
      </div>
    </div>
  )
}

function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
  ...props
}: React.ComponentProps<'div'> & { rows?: number; columns?: number }) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-8 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

function SkeletonList({
  items = 3,
  className,
  ...props
}: React.ComponentProps<'div'> & { items?: number }) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton size="avatar" />
          <div className="flex-1 space-y-2">
            <Skeleton size="line-short" />
            <Skeleton size="line-shorter" />
          </div>
        </div>
      ))}
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonList, skeletonVariants }
