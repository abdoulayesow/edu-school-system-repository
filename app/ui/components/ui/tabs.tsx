'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'
import { componentClasses } from '@/lib/design-tokens'

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col', className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(componentClasses.tabListBase, className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        componentClasses.tabButtonBase,
        // Inactive state - very light yellow with hover effect
        componentClasses.tabButtonInactive,
        // Active state - same color as top panel (#e79908)
        'data-[state=active]:bg-[#e79908] dark:data-[state=active]:bg-gspn-gold-500',
        'data-[state=active]:text-black dark:data-[state=active]:text-[#2d0707]',
        'data-[state=active]:border-b-2 data-[state=active]:border-b-primary',
        'data-[state=active]:border-t data-[state=active]:border-l data-[state=active]:border-r data-[state=active]:border-border',
        'data-[state=active]:rounded-t-lg data-[state=active]:rounded-b-none',
        'data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
