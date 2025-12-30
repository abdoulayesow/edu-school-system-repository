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
        // Inactive state (default)
        componentClasses.tabButtonInactive,
        // Active state with light yellow background and bottom border indicator
        'data-[state=active]:text-foreground',
        'data-[state=active]:bg-gspn-gold-50 dark:data-[state=active]:bg-input/30',
        'data-[state=active]:border-b-2 data-[state=active]:border-b-primary',
        'data-[state=active]:border-t data-[state=active]:border-l data-[state=active]:border-r data-[state=active]:border-border',
        'data-[state=active]:rounded-t-lg data-[state=active]:rounded-b-none',
        'data-[state=active]:shadow-sm',
        'dark:data-[state=active]:border-b-primary',
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
