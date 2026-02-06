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
    page: 'font-display text-3xl font-extrabold tracking-tight',
    section: 'font-display text-2xl font-bold tracking-tight',
    card: 'font-display text-xl font-semibold',
    label: 'font-display text-lg font-semibold',
  },
  body: {
    lg: 'text-lg',
    md: 'text-base',
    sm: 'text-sm',
    xs: 'text-xs',
  },
  // Accent font for stats and numbers
  stat: {
    hero: 'font-mono text-5xl md:text-6xl lg:text-7xl font-bold tabular-nums tracking-tight',
    lg: 'font-mono text-4xl font-bold tabular-nums tracking-tight',
    md: 'font-mono text-2xl font-bold tabular-nums',
    sm: 'font-mono text-xl font-semibold tabular-nums',
    xs: 'font-mono text-lg font-medium tabular-nums',
  },
  // Financial numbers with currency styling
  currency: {
    hero: 'font-mono text-5xl md:text-6xl font-extrabold tabular-nums tracking-tighter',
    lg: 'font-mono text-3xl font-bold tabular-nums',
    md: 'font-mono text-xl font-semibold tabular-nums',
    sm: 'font-mono text-base font-medium tabular-nums',
  },
} as const

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

export const animation = {
  // Timing functions
  ease: {
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    outExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  // Durations
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
    slower: '600ms',
  },
  // Pre-built animation classes
  classes: {
    fadeIn: 'animate-fade-in',
    fadeInUp: 'animate-fade-in-up',
    scaleIn: 'animate-scale-in',
    slideInRight: 'animate-slide-in-right',
    pulseSubtle: 'animate-pulse-subtle',
  },
  // Stagger delays for list items
  stagger: {
    1: 'stagger-1',
    2: 'stagger-2',
    3: 'stagger-3',
    4: 'stagger-4',
    5: 'stagger-5',
    6: 'stagger-6',
  },
} as const

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const shadows = {
  // Elevation levels
  xs: 'shadow-[0_1px_2px_0_rgb(0_0_0/0.05)]',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  // Special effects
  lift: 'shadow-[0_10px_40px_-10px_rgb(0_0_0/0.2)]',
  glowPrimary: 'shadow-[0_0_20px_rgba(139,35,50,0.3)]',
  glowGold: 'shadow-[0_0_20px_rgba(212,175,55,0.3)]',
  glowEmerald: 'shadow-[0_0_30px_rgba(16,185,129,0.25)]',
  glowAmber: 'shadow-[0_0_30px_rgba(245,158,11,0.25)]',
  glowBlue: 'shadow-[0_0_30px_rgba(59,130,246,0.25)]',
  glowOrange: 'shadow-[0_0_30px_rgba(249,115,22,0.25)]',
} as const

// ============================================================================
// INTERACTIVE TOKENS
// ============================================================================

export const interactive = {
  // Hover lift effect
  lift: 'interactive-lift',
  // Scale on hover/active
  scale: 'interactive-scale',
  // Card with hover effects
  card: 'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
  // Enhanced card with subtle lift
  cardEnhanced: 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01]',
  // Button press effect
  button: 'active:scale-[0.98] transition-transform duration-100',
  // Smooth glow on hover
  glow: 'transition-all duration-300 hover:shadow-2xl',
} as const

// ============================================================================
// GRADIENT TOKENS (for financial cards)
// ============================================================================

export const gradients = {
  registry: {
    light: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50',
    dark: 'dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-green-950/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-600 dark:text-emerald-400',
    glow: 'hover:shadow-emerald-500/20',
  },
  safe: {
    light: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50',
    dark: 'dark:from-amber-950/20 dark:via-yellow-950/20 dark:to-orange-950/20',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-600 dark:text-amber-400',
    glow: 'hover:shadow-amber-500/20',
  },
  bank: {
    light: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50',
    dark: 'dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-cyan-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-600 dark:text-blue-400',
    glow: 'hover:shadow-blue-500/20',
  },
  mobileMoney: {
    light: 'bg-gradient-to-br from-orange-50 via-amber-50 to-red-50',
    dark: 'dark:from-orange-950/20 dark:via-amber-950/20 dark:to-red-950/20',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-600 dark:text-orange-400',
    glow: 'hover:shadow-orange-500/20',
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

  // Table header row with gold accent - GSPN brand
  tableHeaderRow: 'bg-gspn-gold-50/50 dark:bg-gspn-gold-950/20',

  // Table row hover state
  tableRowHover: 'hover:bg-muted/50 transition-colors',

  // Search input wrapper
  searchInputWrapper: 'relative',
  searchInputIcon: 'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
  searchInput: 'pl-9 bg-muted/50',
} as const

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type IconSize = keyof typeof sizing.icon
export type AvatarSize = keyof typeof sizing.avatar
export type ContainerSize = keyof typeof spacing.container
export type CardPadding = keyof typeof spacing.card
export type AnimationClass = keyof typeof animation.classes
export type StaggerDelay = keyof typeof animation.stagger
export type ShadowLevel = keyof typeof shadows
export type StatSize = keyof typeof typography.stat
export type CurrencySize = keyof typeof typography.currency
export type GradientType = keyof typeof gradients
