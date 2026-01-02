import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const inputVariants = cva(
  'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px] focus-visible:shadow-sm dark:focus-visible:border-ring dark:focus-visible:ring-ring/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  {
    variants: {
      size: {
        default: 'h-9',
        sm: 'h-8 text-sm',
        lg: 'h-11 text-base',
      },
      glow: {
        none: '',
        primary: 'focus-visible:shadow-[0_0_10px_rgba(139,35,50,0.15)]',
        gold: 'focus-visible:shadow-[0_0_10px_rgba(212,175,55,0.15)]',
      },
    },
    defaultVariants: {
      size: 'default',
      glow: 'none',
    },
  }
)

function Input({
  className,
  type,
  size,
  glow,
  ...props
}: Omit<React.ComponentProps<'input'>, 'size'> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ size, glow }), className)}
      {...props}
    />
  )
}

// Input with icon wrapper
function InputWithIcon({
  className,
  icon,
  iconPosition = 'left',
  children,
  ...props
}: React.ComponentProps<'div'> & {
  icon: React.ReactNode
  iconPosition?: 'left' | 'right'
}) {
  return (
    <div className={cn('relative', className)} {...props}>
      <div
        className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground',
          iconPosition === 'left' ? 'left-3' : 'right-3'
        )}
      >
        {icon}
      </div>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<{ className?: string }>(child) && child.type === Input) {
          return React.cloneElement(child, {
            className: cn(
              child.props.className,
              iconPosition === 'left' ? 'pl-10' : 'pr-10'
            ),
          })
        }
        return child
      })}
    </div>
  )
}

export { Input, InputWithIcon, inputVariants }
