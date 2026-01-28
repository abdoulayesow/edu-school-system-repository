"use client"

import { useState } from "react"
import { PageContainer } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  sizing,
  spacing,
  typography,
  animation,
  shadows,
  gradients,
  componentClasses,
} from "@/lib/design-tokens"
import {
  Copy,
  Check,
  Palette,
  Type,
  Box,
  Layers,
  Sparkles,
  Grid3X3,
  Search,
  BookOpen,
  ExternalLink,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Color swatch component with enhanced styling
function ColorSwatch({
  name,
  cssVar,
  className,
  textClass = "text-foreground",
}: {
  name: string
  cssVar: string
  className: string
  textClass?: string
}) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(className)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copyToClipboard}
      className="group flex flex-col items-start gap-1.5 text-left"
    >
      <div
        className={cn(
          "h-20 w-full rounded-xl border-2 transition-all shadow-sm",
          "group-hover:scale-105 group-hover:shadow-lg",
          className
        )}
      />
      <span className={cn("text-xs font-semibold", textClass)}>{name}</span>
      <span className="text-[11px] text-muted-foreground font-mono">
        {copied ? (
          <span className="text-success flex items-center gap-1 font-medium">
            <Check className="h-3 w-3" /> Copied
          </span>
        ) : (
          cssVar
        )}
      </span>
    </button>
  )
}

// Typography sample component
function TypographySample({
  name,
  className,
  sample = "The quick brown fox",
}: {
  name: string
  className: string
  sample?: string
}) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(className)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b last:border-0 group hover:bg-muted/30 px-3 -mx-3 rounded-lg transition-colors">
      <div className="flex-1 min-w-0">
        <p className={cn(className, "truncate")}>{sample}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-md font-mono border border-slate-200 dark:border-slate-700">
          {name}
        </code>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  )
}

// Size demo box
function SizeDemo({
  name,
  className,
  label,
}: {
  name: string
  className: string
  label: string
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/50 hover:shadow-md transition-shadow">
      <div
        className={cn(
          "bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg",
          className
        )}
      >
        {label}
      </div>
      <code className="text-sm text-slate-600 dark:text-slate-400 font-mono">{name}</code>
    </div>
  )
}

// Helper to check if content matches search
function matchesSearch(query: string, ...terms: string[]): boolean {
  if (!query.trim()) return true
  const lowerQuery = query.toLowerCase()
  return terms.some(term => term.toLowerCase().includes(lowerQuery))
}

export default function StyleGuidePage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter visibility based on search
  const showColors = matchesSearch(searchQuery, "color", "brand", "maroon", "gold", "semantic", "chart", "navigation", "nav", "primary", "accent", "success", "warning", "destructive")
  const showTypography = matchesSearch(searchQuery, "typography", "font", "heading", "body", "stat", "currency", "text", "display", "mono", "sans")
  const showSizing = matchesSearch(searchQuery, "sizing", "size", "icon", "avatar", "button", "toolbar")
  const showSpacing = matchesSearch(searchQuery, "spacing", "container", "padding", "gap", "card", "width")
  const showShadows = matchesSearch(searchQuery, "shadow", "elevation", "glow", "lift", "effect")
  const showAnimations = matchesSearch(searchQuery, "animation", "timing", "duration", "ease", "spring", "fade", "slide", "scale")
  const showComponents = matchesSearch(searchQuery, "component", "class", "button", "nav", "tab", "toolbar", "primary", "action")

  // No results state
  const hasResults = showColors || showTypography || showSizing || showSpacing || showShadows || showAnimations || showComponents

  return (
    <PageContainer maxWidth="full">
      {/* Clean Professional Header with Maroon Accent */}
      <div className="relative mb-10 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        {/* Maroon accent bar */}
        <div className="h-1 bg-gspn-maroon-500" />

        <div className="p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                  <BookOpen className="h-7 w-7 text-gspn-maroon-500" />
                </div>
                <Badge variant="outline" className="font-mono text-xs px-3 py-1 border-gspn-gold-500 text-gspn-gold-600 dark:text-gspn-gold-400">
                  Design System v1.0
                </Badge>
              </div>
              <h1 className="font-display text-5xl font-extrabold tracking-tight text-foreground mb-3">
                Design Tokens
              </h1>
              <p className="text-muted-foreground font-medium max-w-2xl text-lg">
                Visual language reference — colors, typography, spacing, and component patterns for consistent, beautiful interfaces
              </p>
            </div>
            <a
              href="/brand"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gspn-maroon-500/10 hover:bg-gspn-maroon-500/20 rounded-xl text-sm font-semibold text-gspn-maroon-600 dark:text-gspn-maroon-400 transition-all"
            >
              Component Showcase
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Quick Stats with clean cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-8 border-t border-border">
            <div className="bg-muted/50 rounded-xl p-4 border border-border">
              <p className="font-mono text-3xl font-bold text-gspn-maroon-600 dark:text-gspn-maroon-400">4</p>
              <p className="text-sm text-muted-foreground mt-1">Font Families</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 border border-border">
              <p className="font-mono text-3xl font-bold text-gspn-maroon-600 dark:text-gspn-maroon-400">21</p>
              <p className="text-sm text-muted-foreground mt-1">Color Tokens</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 border border-border">
              <p className="font-mono text-3xl font-bold text-gspn-maroon-600 dark:text-gspn-maroon-400">12</p>
              <p className="text-sm text-muted-foreground mt-1">Shadow Levels</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 border border-border">
              <p className="font-mono text-3xl font-bold text-gspn-maroon-600 dark:text-gspn-maroon-400">5</p>
              <p className="text-sm text-muted-foreground mt-1">Animations</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 border border-border">
              <p className="font-mono text-3xl font-bold text-gspn-maroon-600 dark:text-gspn-maroon-400">7</p>
              <p className="text-sm text-muted-foreground mt-1">Component Classes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search tokens... (e.g., 'gold', 'heading', 'shadow')"
          className="pl-12 h-12 text-base max-w-2xl border-2 focus-visible:ring-2 focus-visible:ring-gspn-gold-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-muted"
          >
            Clear
          </button>
        )}
      </div>

      {/* No Results Message */}
      {!hasResults && searchQuery && (
        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/30">
          <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No tokens found for "{searchQuery}"</p>
          <p className="text-sm text-muted-foreground mt-1">Try searching for "gold", "heading", "shadow", or "animation"</p>
        </div>
      )}

      <Tabs defaultValue="colors" className={cn("space-y-8", !hasResults && "hidden")}>
        <TabsList className="flex flex-wrap w-full lg:w-auto lg:inline-flex h-auto p-1 bg-slate-100 dark:bg-slate-800 gap-1">
          {showColors && (
            <TabsTrigger value="colors" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Colors</span>
            </TabsTrigger>
          )}
          {showTypography && (
            <TabsTrigger value="typography" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <Type className="h-4 w-4" />
              <span className="hidden sm:inline">Typography</span>
            </TabsTrigger>
          )}
          {showSizing && (
            <TabsTrigger value="sizing" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <Box className="h-4 w-4" />
              <span className="hidden sm:inline">Sizing</span>
            </TabsTrigger>
          )}
          {showSpacing && (
            <TabsTrigger value="spacing" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Spacing</span>
            </TabsTrigger>
          )}
          {showShadows && (
            <TabsTrigger value="shadows" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Shadows</span>
            </TabsTrigger>
          )}
          {showAnimations && (
            <TabsTrigger value="animations" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Animation</span>
            </TabsTrigger>
          )}
          {showComponents && (
            <TabsTrigger value="components" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Components</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* COLORS TAB */}
        <TabsContent value="colors" className="space-y-6">
          {/* Brand Colors */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Brand Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-6">
                <ColorSwatch
                  name="Maroon (Primary)"
                  cssVar="--primary"
                  className="bg-primary ring-2 ring-primary/20 ring-offset-2"
                />
                <ColorSwatch
                  name="Gold (Accent)"
                  cssVar="--accent"
                  className="bg-accent ring-2 ring-accent/20 ring-offset-2"
                />
                <ColorSwatch
                  name="Black (Secondary)"
                  cssVar="--secondary"
                  className="bg-secondary ring-2 ring-secondary/20 ring-offset-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Semantic Colors */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Semantic Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <ColorSwatch
                  name="Background"
                  cssVar="bg-background"
                  className="bg-background border-2 ring-2 ring-slate-200 dark:ring-slate-700 ring-offset-2"
                />
                <ColorSwatch
                  name="Foreground"
                  cssVar="bg-foreground"
                  className="bg-foreground ring-2 ring-slate-300 dark:ring-slate-600 ring-offset-2"
                  textClass="text-foreground"
                />
                <ColorSwatch
                  name="Card"
                  cssVar="bg-card"
                  className="bg-card border-2 ring-2 ring-slate-200 dark:ring-slate-700 ring-offset-2"
                />
                <ColorSwatch
                  name="Muted"
                  cssVar="bg-muted"
                  className="bg-muted ring-2 ring-slate-200 dark:ring-slate-700 ring-offset-2"
                />
                <ColorSwatch
                  name="Success"
                  cssVar="bg-success"
                  className="bg-success ring-2 ring-success/20 ring-offset-2"
                />
                <ColorSwatch
                  name="Warning"
                  cssVar="bg-warning"
                  className="bg-warning ring-2 ring-warning/20 ring-offset-2"
                />
                <ColorSwatch
                  name="Destructive"
                  cssVar="bg-destructive"
                  className="bg-destructive ring-2 ring-destructive/20 ring-offset-2"
                />
                <ColorSwatch
                  name="Border"
                  cssVar="border-border"
                  className="bg-border ring-2 ring-slate-300 dark:ring-slate-600 ring-offset-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Maroon Scale */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Maroon Scale (gspn-maroon)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-5 md:grid-cols-11 gap-3">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(
                  (shade) => (
                    <ColorSwatch
                      key={shade}
                      name={`${shade}`}
                      cssVar={`bg-gspn-maroon-${shade}`}
                      className={`bg-gspn-maroon-${shade}`}
                    />
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gold Scale */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Gold Scale (gspn-gold)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(
                  (shade) => (
                    <ColorSwatch
                      key={shade}
                      name={`${shade}`}
                      cssVar={`bg-gspn-gold-${shade}`}
                      className={`bg-gspn-gold-${shade}`}
                    />
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Colors */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Navigation Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <ColorSwatch
                  name="Nav Highlight"
                  cssVar="bg-nav-highlight"
                  className="bg-nav-highlight ring-2 ring-nav-highlight/20 ring-offset-2"
                />
                <ColorSwatch
                  name="Nav Dark Hover"
                  cssVar="bg-nav-dark-hover"
                  className="bg-nav-dark-hover ring-2 ring-nav-dark-hover/20 ring-offset-2"
                />
                <ColorSwatch
                  name="Sidebar"
                  cssVar="bg-sidebar"
                  className="bg-sidebar ring-2 ring-sidebar/20 ring-offset-2"
                />
                <ColorSwatch
                  name="Sidebar Accent"
                  cssVar="bg-sidebar-accent"
                  className="bg-sidebar-accent ring-2 ring-sidebar-accent/20 ring-offset-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Chart Colors */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Chart Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <div key={num} className="text-center">
                    <div
                      className="h-16 w-full rounded-xl mb-2 ring-2 ring-offset-2 transition-all hover:scale-105 hover:shadow-lg"
                      style={{
                        backgroundColor: `hsl(var(--chart-${num}))`,
                      }}
                    />
                    <span className="text-xs text-muted-foreground font-mono font-medium">
                      chart-{num}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TYPOGRAPHY TAB */}
        <TabsContent value="typography" className="space-y-6">
          {/* Font Families */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Font Families
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4">
                <div className="p-5 border-2 rounded-xl bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/50 hover:shadow-lg transition-shadow">
                  <p className="font-sans text-2xl font-semibold mb-2">
                    Inter - Body Text (font-sans)
                  </p>
                  <p className="font-sans text-base text-muted-foreground mt-2">
                    The quick brown fox jumps over the lazy dog. ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  </p>
                  <p className="text-sm text-muted-foreground mt-3 italic">
                    Used for all body text and general content
                  </p>
                </div>
                <div className="p-5 border-2 rounded-xl bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-900/20 hover:shadow-lg transition-shadow">
                  <p className="font-display text-2xl font-bold mb-2">
                    Plus Jakarta Sans - Headings (font-display)
                  </p>
                  <p className="font-display text-xl text-muted-foreground mt-2 font-semibold">
                    Dashboard Overview • Student Enrollment • Payment History
                  </p>
                  <p className="text-sm text-muted-foreground mt-3 italic">
                    Used for all headings and titles
                  </p>
                </div>
                <div className="p-5 border-2 rounded-xl bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/20 hover:shadow-lg transition-shadow">
                  <p className="font-mono text-2xl font-bold mb-2">
                    Geist Mono - Numbers (font-mono)
                  </p>
                  <p className="font-mono text-xl text-muted-foreground mt-2 tabular-nums">
                    0123456789 • 1,234,567 GNF • $99.99
                  </p>
                  <p className="text-sm text-muted-foreground mt-3 italic">
                    Used for statistics, currency, and code
                  </p>
                </div>
                <div className="p-5 border-2 rounded-xl bg-gradient-to-br from-pink-50/50 to-transparent dark:from-pink-900/20 hover:shadow-lg transition-shadow">
                  <p className="font-accent text-2xl font-semibold mb-2">
                    DM Sans - Accent (font-accent)
                  </p>
                  <p className="font-accent text-lg text-muted-foreground mt-2">
                    Premium Features • Special Offers • Highlights
                  </p>
                  <p className="text-sm text-muted-foreground mt-3 italic">
                    Used for special accent text
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Headings */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Heading Styles
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <TypographySample
                name="typography.heading.page"
                className={typography.heading.page}
                sample="Page Title"
              />
              <TypographySample
                name="typography.heading.section"
                className={typography.heading.section}
                sample="Section Header"
              />
              <TypographySample
                name="typography.heading.card"
                className={typography.heading.card}
                sample="Card Title"
              />
              <TypographySample
                name="typography.heading.label"
                className={typography.heading.label}
                sample="Form Label"
              />
            </CardContent>
          </Card>

          {/* Body Text */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Body Text Sizes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <TypographySample
                name="typography.body.lg"
                className={typography.body.lg}
                sample="Large body text for emphasis"
              />
              <TypographySample
                name="typography.body.md"
                className={typography.body.md}
                sample="Default body text for content"
              />
              <TypographySample
                name="typography.body.sm"
                className={typography.body.sm}
                sample="Small text for secondary content"
              />
              <TypographySample
                name="typography.body.xs"
                className={typography.body.xs}
                sample="Extra small for fine print"
              />
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Stat Numbers
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <TypographySample
                name="typography.stat.hero"
                className={typography.stat.hero}
                sample="1,234"
              />
              <TypographySample
                name="typography.stat.lg"
                className={typography.stat.lg}
                sample="5,678"
              />
              <TypographySample
                name="typography.stat.md"
                className={typography.stat.md}
                sample="9,012"
              />
              <TypographySample
                name="typography.stat.sm"
                className={typography.stat.sm}
                sample="3,456"
              />
              <TypographySample
                name="typography.stat.xs"
                className={typography.stat.xs}
                sample="7,890"
              />
            </CardContent>
          </Card>

          {/* Currency */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Currency Formatting
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <TypographySample
                name="typography.currency.hero"
                className={typography.currency.hero}
                sample="1,500,000 GNF"
              />
              <TypographySample
                name="typography.currency.lg"
                className={typography.currency.lg}
                sample="750,000 GNF"
              />
              <TypographySample
                name="typography.currency.md"
                className={typography.currency.md}
                sample="250,000 GNF"
              />
              <TypographySample
                name="typography.currency.sm"
                className={typography.currency.sm}
                sample="50,000 GNF"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* SIZING TAB */}
        <TabsContent value="sizing" className="space-y-6">
          {/* Icon Sizes */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Icon Sizes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <SizeDemo name="sizing.icon.xs" className={sizing.icon.xs} label="xs" />
              <SizeDemo name="sizing.icon.sm" className={sizing.icon.sm} label="sm" />
              <SizeDemo name="sizing.icon.md" className={sizing.icon.md} label="md" />
              <SizeDemo name="sizing.icon.lg" className={sizing.icon.lg} label="lg" />
              <SizeDemo name="sizing.icon.xl" className={sizing.icon.xl} label="xl" />
            </CardContent>
          </Card>

          {/* Avatar Sizes */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Avatar Sizes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <SizeDemo
                name="sizing.avatar.sm"
                className={cn(sizing.avatar.sm, "rounded-full")}
                label="sm"
              />
              <SizeDemo
                name="sizing.avatar.md"
                className={cn(sizing.avatar.md, "rounded-full")}
                label="md"
              />
              <SizeDemo
                name="sizing.avatar.lg"
                className={cn(sizing.avatar.lg, "rounded-full")}
                label="lg"
              />
              <SizeDemo
                name="sizing.avatar.xl"
                className={cn(sizing.avatar.xl, "rounded-full")}
                label="xl"
              />
            </CardContent>
          </Card>

          {/* Button Sizes */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Button/Toolbar Sizes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center gap-4 p-3 rounded-lg border bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/50">
                <div
                  className={cn(
                    "bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-xs text-white font-bold shadow-lg",
                    sizing.toolbarButton.height,
                    sizing.toolbarButton.iconOnly
                  )}
                >
                  Icon
                </div>
                <code className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                  toolbarButton (h-9 w-9)
                </code>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg border bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/50">
                <div
                  className={cn(
                    "bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-xs text-white font-bold shadow-lg",
                    sizing.navButton.height,
                    sizing.navButton.minWidth,
                    sizing.navButton.padding
                  )}
                >
                  Nav Button
                </div>
                <code className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                  navButton (h-10 min-w-[120px])
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SPACING TAB */}
        <TabsContent value="spacing" className="space-y-6">
          {/* Container Widths */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Container Max Widths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {(["sm", "md", "lg", "xl", "full"] as const).map((size) => (
                <div key={size} className="space-y-2">
                  <div
                    className={cn(
                      "h-10 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl border-2 border-violet-300 dark:border-violet-700 shadow-md transition-all hover:shadow-lg",
                      spacing.container[size]
                    )}
                  />
                  <div className="flex justify-between text-sm px-1">
                    <code className="text-muted-foreground font-mono font-semibold">
                      spacing.container.{size}
                    </code>
                    <span className="text-muted-foreground font-mono">
                      {size === "sm" && "448px"}
                      {size === "md" && "672px"}
                      {size === "lg" && "896px"}
                      {size === "xl" && "1152px"}
                      {size === "full" && "1280px"}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Card Padding */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Card Padding
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                {(["sm", "md", "lg"] as const).map((size) => (
                  <div key={size} className="border-2 rounded-xl overflow-hidden shadow-md">
                    <div className={cn("bg-gradient-to-br from-blue-500/10 to-cyan-500/10", spacing.card[size])}>
                      <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-lg h-20 flex items-center justify-center shadow-inner">
                        <code className="text-sm font-bold text-blue-600 dark:text-blue-400">{size}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gap Sizes */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Gap Sizes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
                <div key={size} className="flex items-center p-3 rounded-lg border bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/20">
                  <div className={cn("flex", spacing.gap[size])}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg"
                      />
                    ))}
                  </div>
                  <code className="text-sm text-muted-foreground ml-6 font-mono font-semibold">
                    spacing.gap.{size}
                  </code>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SHADOWS TAB */}
        <TabsContent value="shadows" className="space-y-6">
          {/* Elevation */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Shadow Elevation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                {(["xs", "sm", "md", "lg", "xl", "2xl"] as const).map(
                  (level) => (
                    <div key={level} className="text-center">
                      <div
                        className={cn(
                          "h-24 w-full bg-white dark:bg-slate-800 rounded-xl border-2 transition-all hover:scale-105",
                          shadows[level]
                        )}
                      />
                      <code className="text-xs text-muted-foreground mt-3 block font-mono font-semibold">
                        {level}
                      </code>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Special Effects */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Glow Effects
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div
                    className={cn(
                      "h-24 w-full bg-white dark:bg-slate-800 rounded-xl border-2 transition-all hover:scale-105",
                      shadows.glowPrimary
                    )}
                  />
                  <code className="text-xs text-muted-foreground mt-3 block font-mono font-semibold">
                    glowPrimary
                  </code>
                </div>
                <div className="text-center">
                  <div
                    className={cn(
                      "h-24 w-full bg-white dark:bg-slate-800 rounded-xl border-2 transition-all hover:scale-105",
                      shadows.glowGold
                    )}
                  />
                  <code className="text-xs text-muted-foreground mt-3 block font-mono font-semibold">
                    glowGold
                  </code>
                </div>
                <div className="text-center">
                  <div
                    className={cn(
                      "h-24 w-full bg-white dark:bg-slate-800 rounded-xl border-2 transition-all hover:scale-105",
                      shadows.glowEmerald
                    )}
                  />
                  <code className="text-xs text-muted-foreground mt-3 block font-mono font-semibold">
                    glowEmerald
                  </code>
                </div>
                <div className="text-center">
                  <div
                    className={cn(
                      "h-24 w-full bg-white dark:bg-slate-800 rounded-xl border-2 transition-all hover:scale-105",
                      shadows.glowBlue
                    )}
                  />
                  <code className="text-xs text-muted-foreground mt-3 block font-mono font-semibold">
                    glowBlue
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lift Effect */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Lift Effect (Hover)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div
                className={cn(
                  "h-32 w-64 mx-auto bg-white dark:bg-slate-800 rounded-xl border-2 cursor-pointer transition-all hover:-translate-y-2",
                  shadows.lift
                )}
              >
                <div className="h-full flex items-center justify-center text-muted-foreground font-semibold">
                  Hover me
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANIMATIONS TAB */}
        <TabsContent value="animations" className="space-y-6">
          {/* Timing Functions */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Timing Functions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <code className="w-32 text-sm font-mono font-semibold">spring</code>
                  <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full w-1/2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
                      style={{
                        animation: `slide 2s ${animation.ease.spring} infinite`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-48">
                    Bouncy, playful
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <code className="w-32 text-sm font-mono font-semibold">smooth</code>
                  <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{
                        animation: `slide 2s ${animation.ease.smooth} infinite`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-48">
                    Standard, professional
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <code className="w-32 text-sm font-mono font-semibold">outExpo</code>
                  <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full w-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      style={{
                        animation: `slide 2s ${animation.ease.outExpo} infinite`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-48">
                    Fast start, gentle end
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Durations */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Duration Scale
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {(["fast", "normal", "slow", "slower"] as const).map((dur) => (
                  <div key={dur} className="text-center p-5 rounded-xl border-2 bg-gradient-to-br from-cyan-50/50 to-transparent dark:from-cyan-900/20 hover:shadow-lg transition-shadow">
                    <div className="text-3xl font-mono font-bold mb-2 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      {animation.duration[dur]}
                    </div>
                    <code className="text-sm text-muted-foreground font-semibold">{dur}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Animation Classes */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Animation Classes (Click to replay)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(
                  Object.keys(animation.classes) as Array<
                    keyof typeof animation.classes
                  >
                ).map((key) => (
                  <AnimationDemo
                    key={key}
                    name={key}
                    className={animation.classes[key]}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPONENTS TAB */}
        <TabsContent value="components" className="space-y-6">
          {/* Component Classes Overview */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Component Classes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-6">
                Pre-composed Tailwind class combinations for consistent UI patterns. Import from <code className="bg-muted px-2 py-0.5 rounded text-sm">@/lib/design-tokens</code>
              </p>
              <div className="space-y-6">
                {/* Primary Action Button */}
                <div className="p-5 border-2 rounded-xl bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-900/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">primaryActionButton</h4>
                    <Badge className="bg-gspn-gold-500 text-black text-xs">Most Used</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Gold CTA button - the primary call-to-action style used throughout the app</p>
                  <div className="flex items-center gap-4 mb-4">
                    <Button className={componentClasses.primaryActionButton}>
                      Example Button
                    </Button>
                  </div>
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-lg block overflow-x-auto">
                    componentClasses.primaryActionButton
                  </code>
                </div>

                {/* Toolbar Icon Button */}
                <div className="p-5 border-2 rounded-xl bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/20">
                  <h4 className="font-semibold mb-2">toolbarIconButton</h4>
                  <p className="text-sm text-muted-foreground mb-4">Icon-only toolbar buttons with gold/maroon theming</p>
                  <div className="flex items-center gap-2 mb-4">
                    <button className={componentClasses.toolbarIconButton}>
                      <Search className="h-5 w-5" />
                    </button>
                    <button className={componentClasses.toolbarIconButton}>
                      <Settings className="h-5 w-5" />
                    </button>
                  </div>
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-lg block overflow-x-auto">
                    componentClasses.toolbarIconButton
                  </code>
                </div>

                {/* Navigation Buttons */}
                <div className="p-5 border-2 rounded-xl bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-900/20">
                  <h4 className="font-semibold mb-2">Navigation Buttons</h4>
                  <p className="text-sm text-muted-foreground mb-4">Sidebar navigation button patterns (base + active/inactive states)</p>
                  <div className="flex items-center gap-2 mb-4 p-3 bg-sidebar rounded-lg">
                    <button className={cn(componentClasses.navMainButtonBase, componentClasses.navMainButtonActive)}>
                      Active
                    </button>
                    <button className={cn(componentClasses.navMainButtonBase, componentClasses.navMainButtonInactive)}>
                      Inactive
                    </button>
                  </div>
                  <div className="space-y-2">
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">navMainButtonBase + navMainButtonActive</code>
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">navMainButtonBase + navMainButtonInactive</code>
                  </div>
                </div>

                {/* Tab Buttons */}
                <div className="p-5 border-2 rounded-xl bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/20">
                  <h4 className="font-semibold mb-2">Tab Buttons</h4>
                  <p className="text-sm text-muted-foreground mb-4">Custom tab navigation with underline style</p>
                  <div className="mb-4">
                    <div className={componentClasses.tabListBase}>
                      <button className={cn(componentClasses.tabButtonBase, componentClasses.tabButtonActive)}>Active</button>
                      <button className={cn(componentClasses.tabButtonBase, componentClasses.tabButtonInactive)}>Inactive</button>
                      <button className={cn(componentClasses.tabButtonBase, componentClasses.tabButtonInactive)}>Another</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">tabListBase (container)</code>
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">tabButtonBase + tabButtonActive</code>
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded block">tabButtonBase + tabButtonInactive</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Example */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Usage Example
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <pre className="text-sm bg-slate-100 dark:bg-slate-800 p-4 rounded-xl overflow-x-auto border">
{`import { componentClasses } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"

// Primary action button
<Button className={componentClasses.primaryActionButton}>
  Save Changes
</Button>

// Navigation with state
<button className={cn(
  componentClasses.navMainButtonBase,
  isActive
    ? componentClasses.navMainButtonActive
    : componentClasses.navMainButtonInactive
)}>
  Dashboard
</button>`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

// Animation demo with replay
function AnimationDemo({
  name,
  className,
}: {
  name: string
  className: string
}) {
  const [key, setKey] = useState(0)

  return (
    <button
      onClick={() => setKey((k) => k + 1)}
      className="p-5 border-2 rounded-xl text-center hover:bg-muted/50 transition-all hover:shadow-lg group"
    >
      <div
        key={key}
        className={cn(
          "h-14 w-14 mx-auto bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl shadow-lg",
          className
        )}
      />
      <code className="text-xs text-muted-foreground mt-3 block font-mono group-hover:text-foreground transition-colors">
        {name}
      </code>
    </button>
  )
}
