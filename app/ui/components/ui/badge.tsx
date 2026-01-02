import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        success:
          'border-transparent bg-success/15 text-success dark:bg-success/20 dark:text-success',
        warning:
          'border-transparent bg-warning/15 text-warning dark:bg-warning/20 dark:text-warning',
        error:
          'border-transparent bg-destructive/15 text-destructive dark:bg-destructive/20 dark:text-destructive',
        info:
          'border-transparent bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary',
        gold:
          'border-accent/30 bg-accent/10 text-accent-foreground dark:bg-accent/20 dark:text-accent',
      },
      size: {
        default: 'px-2 py-0.5 text-xs',
        sm: 'px-1.5 py-0 text-[10px]',
        lg: 'px-2.5 py-1 text-sm',
      },
      animate: {
        none: '',
        pulse: 'animate-pulse-subtle',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animate: 'none',
    },
  },
)

// Dot indicator component for status
function BadgeDot({
  className,
  variant = 'default',
  pulse = false,
}: {
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gold'
  pulse?: boolean
}) {
  const colors = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-destructive',
    info: 'bg-primary',
    gold: 'bg-accent',
  }

  return (
    <span
      className={cn(
        'inline-block size-2 rounded-full',
        colors[variant],
        pulse && 'animate-pulse-subtle',
        className
      )}
    />
  )
}

function Badge({
  className,
  variant,
  size,
  animate,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, animate }), className)}
      {...props}
    />
  )
}

export { Badge, BadgeDot, badgeVariants }
