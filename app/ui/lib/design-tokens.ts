// ============================================================================
// DESIGN TOKENS - Centralized UI Constants
// ============================================================================

// ============================================================================
// SIZING TOKENS
// ============================================================================

export const sizing = {
  // Standardized icon sizes
  icon: {
    xs: 'h-3 w-3',   // 12px - chevrons in dropdowns
    sm: 'h-4 w-4',   // 16px - inline icons in text
    md: 'h-5 w-5',   // 20px - STANDARD for toolbar icons
    lg: 'h-6 w-6',   // 24px - feature icons
    xl: 'h-8 w-8',   // 32px - hero/loading icons
  },

  // Toolbar icon (standardized per user choice)
  toolbarIcon: 'h-5 w-5', // 20px

  // Avatar sizes
  avatar: {
    sm: 'h-7 w-7',   // 28px - compact contexts (nav dropdown trigger)
    md: 'h-8 w-8',   // 32px - navigation bar
    lg: 'h-10 w-10', // 40px - profile sections
    xl: 'h-12 w-12', // 48px - hero/feature
  },

  // Button sizes for toolbar
  toolbarButton: {
    height: 'h-9',      // 36px standard height
    padding: 'px-3',    // consistent padding
    iconOnly: 'w-9',    // square for icon-only buttons
  },

  // Navigation button sizing
  navButton: {
    height: 'h-10',     // 40px for main nav
    minWidth: 'min-w-[120px]', // consistent minimum width
    padding: 'px-4 py-2',
  },
} as const

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const spacing = {
  // Page padding
  page: {
    x: 'px-4 lg:px-6',
    y: 'py-4 lg:py-6',
  },
  // Container max widths
  container: {
    sm: 'max-w-md',     // 448px - forms
    md: 'max-w-2xl',    // 672px - cards
    lg: 'max-w-4xl',    // 896px - content pages
    xl: 'max-w-6xl',    // 1152px - wide content
    full: 'max-w-7xl',  // 1280px - dashboard
  },
  // Card padding
  card: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
  // Gap between elements
  gap: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  },
} as const

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typography = {
  heading: {
    page: 'text-3xl font-bold',
    section: 'text-2xl font-semibold',
    card: 'text-xl font-semibold',
    label: 'text-lg font-medium',
  },
  body: {
    lg: 'text-lg',
    md: 'text-base',
    sm: 'text-sm',
    xs: 'text-xs',
  },
} as const

// ============================================================================
// LAYOUT PRESETS
// ============================================================================

export const layouts = {
  // Full-screen centered (for login, reset-password, etc.)
  centeredPage: 'min-h-screen flex items-center justify-center bg-background',

  // Standard content page
  contentPage: 'min-h-screen bg-background',

  // Form container (centered with max-width)
  formContainer: 'container mx-auto px-4 py-8 max-w-4xl',

  // Dashboard container
  dashboardContainer: 'container mx-auto px-4 py-4',
} as const

// ============================================================================
// COMPONENT CLASS HELPERS
// ============================================================================

export const componentClasses = {
  // Toolbar button (icon only)
  toolbarIconButton: [
    sizing.toolbarButton.height,
    sizing.toolbarButton.iconOnly,
    'rounded-lg',
    'bg-gspn-gold-300 hover:bg-gspn-gold-200',
    'dark:bg-gspn-maroon-800 dark:hover:bg-gspn-maroon-700',
    'flex items-center justify-center',
    'transition-colors',
  ].join(' '),

  // Navigation main button (base classes)
  navMainButtonBase: [
    'flex items-center gap-2 rounded-lg',
    sizing.navButton.padding,
    sizing.navButton.minWidth,
    sizing.navButton.height,
    'text-sm font-semibold',
    'cursor-pointer transition-colors duration-200',
  ].join(' '),

  // Navigation button active state
  navMainButtonActive: 'bg-gspn-gold-50 text-black dark:bg-gspn-gold-500 dark:text-nav-dark-text shadow-md',

  // Navigation button inactive state
  navMainButtonInactive: 'text-black hover:bg-gspn-gold-300 dark:text-sidebar-foreground dark:hover:bg-nav-dark-hover dark:hover:text-white',

  // Tab list container (base classes) - multi-tab style with horizontal line (full width)
  tabListBase: [
    'flex h-10 w-full items-center justify-start gap-1',
    'border-b border-border',
  ].join(' '),

  // Tab button (base classes) - multi-tab style
  tabButtonBase: [
    'inline-flex items-center justify-center',
    'gap-1.5 rounded-t-lg border border-transparent border-b-transparent',
    'px-4 py-2 text-sm font-medium whitespace-nowrap',
    'transition-all duration-200',
    'focus-visible:ring-[3px] focus-visible:outline-1 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
    'relative',
  ].join(' '),

  // Tab button active state - same color as top panel
  tabButtonActive: [
    'text-black dark:text-nav-dark-text',
    'bg-nav-highlight dark:bg-gspn-gold-500',
    'border-b-2 border-b-primary border-t border-l border-r border-border',
    'rounded-t-lg rounded-b-none',
    'shadow-sm',
  ].join(' '),

  // Tab button inactive state - very light yellow with hover effect
  tabButtonInactive: [
    'text-muted-foreground hover:text-foreground',
    'bg-gspn-gold-50 dark:bg-gspn-maroon-900',
    'hover:bg-gspn-gold-100 dark:hover:bg-gspn-maroon-800',
    'border-b-2 border-b-transparent',
    'cursor-pointer',
  ].join(' '),

  // Primary action button (yellow) - consistent across light/dark mode
  primaryActionButton: [
    'bg-nav-highlight hover:bg-nav-highlight/90 text-black',
    'dark:bg-gspn-gold-500 dark:hover:bg-gspn-gold-400 dark:text-nav-dark-text',
  ].join(' '),
} as const

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type IconSize = keyof typeof sizing.icon
export type AvatarSize = keyof typeof sizing.avatar
export type ContainerSize = keyof typeof spacing.container
export type CardPadding = keyof typeof spacing.card
