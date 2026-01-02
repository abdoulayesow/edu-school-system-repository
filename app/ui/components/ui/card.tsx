import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const cardVariants = cva(
  'flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground transition-shadow duration-200',
        enhanced:
          'bg-card text-card-foreground transition-all duration-200 hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/30',
        interactive:
          'bg-card text-card-foreground cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20 active:translate-y-0 active:shadow-md',
        elevated:
          'bg-card text-card-foreground shadow-lg border-transparent',
        gradient:
          'bg-gradient-to-br from-card to-card/80 text-card-foreground border-primary/10 dark:border-primary/20 transition-all duration-200',
        'gradient-gold':
          'bg-gradient-to-br from-card via-card to-amber-950/10 text-card-foreground border-amber-500/20 dark:from-gray-900 dark:via-gray-900 dark:to-amber-950/20 transition-all duration-200',
        'gradient-primary':
          'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-primary/20 transition-all duration-200',
        glass:
          'bg-card/80 backdrop-blur-md text-card-foreground border-white/10 dark:border-white/5 transition-all duration-200',
        'glass-dark':
          'bg-black/60 backdrop-blur-md text-white border-white/10 transition-all duration-200',
        stat:
          'bg-card text-card-foreground transition-all duration-200 hover:shadow-md group',
      },
      glow: {
        none: '',
        primary: 'hover:shadow-[0_0_20px_rgba(139,35,50,0.15)]',
        gold: 'hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]',
      },
      animate: {
        none: '',
        fadeIn: 'animate-fade-in',
        fadeInUp: 'animate-fade-in-up',
        scaleIn: 'animate-scale-in',
      },
    },
    defaultVariants: {
      variant: 'default',
      glow: 'none',
      animate: 'none',
    },
  }
)

function Card({
  className,
  variant,
  glow,
  animate,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, glow, animate }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
