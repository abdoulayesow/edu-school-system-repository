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
  Sun,
  Moon,
  Palette,
  Type,
  Box,
  Layers,
  Sparkles,
  Grid3X3,
  Search,
  BookOpen,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Color swatch component
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
      className="group flex flex-col items-start gap-1 text-left"
    >
      <div
        className={cn(
          "h-16 w-full rounded-lg border transition-all",
          "group-hover:scale-105 group-hover:shadow-md",
          className
        )}
      />
      <span className={cn("text-xs font-medium", textClass)}>{name}</span>
      <span className="text-xs text-muted-foreground font-mono">
        {copied ? (
          <span className="text-success flex items-center gap-1">
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
    <div className="flex items-center justify-between gap-4 py-3 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <p className={cn(className, "truncate")}>{sample}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
          {name}
        </code>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-7 w-7 p-0"
        >
          {copied ? (
            <Check className="h-3 w-3 text-success" />
          ) : (
            <Copy className="h-3 w-3" />
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
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "bg-primary rounded flex items-center justify-center text-primary-foreground text-xs font-mono",
          className
        )}
      >
        {label}
      </div>
      <code className="text-xs text-muted-foreground">{name}</code>
    </div>
  )
}

export default function StyleGuidePage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <PageContainer maxWidth="full">
      {/* Enhanced Branded Header */}
      <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-gspn-maroon-600 via-gspn-maroon-700 to-gspn-maroon-900 p-8 shadow-xl">
        {/* Decorative grid overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        {/* Gold accent corner */}
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gspn-gold-500/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-gspn-gold-500/10 blur-2xl" />

        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gspn-gold-500/20 rounded-lg">
                  <BookOpen className="h-6 w-6 text-gspn-gold-300" />
                </div>
                <Badge className="bg-gspn-gold-500/30 text-gspn-gold-200 border-gspn-gold-400/30 font-mono text-xs">
                  v1.0
                </Badge>
              </div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">Design System</h1>
              <p className="mt-2 text-gspn-gold-100 font-medium max-w-lg">
                GSPN N'Diolou visual language — tokens, typography, and component patterns
              </p>
            </div>
            <a
              href="/brand"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium text-white transition-colors"
            >
              Brand Showcase
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-6 mt-6 pt-6 border-t border-white/20">
            <div>
              <p className="font-mono text-2xl font-bold text-gspn-gold-200">4</p>
              <p className="text-xs text-white/80">Font Families</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-gspn-gold-200">21</p>
              <p className="text-xs text-white/80">Color Tokens</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-gspn-gold-200">12</p>
              <p className="text-xs text-white/80">Shadow Levels</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-gspn-gold-200">5</p>
              <p className="text-xs text-white/80">Animations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tokens... (e.g., 'gold', 'heading', 'shadow')"
          className="pl-10 max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
          <TabsTrigger value="colors" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Colors</span>
          </TabsTrigger>
          <TabsTrigger value="typography" className="gap-2">
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Typography</span>
          </TabsTrigger>
          <TabsTrigger value="sizing" className="gap-2">
            <Box className="h-4 w-4" />
            <span className="hidden sm:inline">Sizing</span>
          </TabsTrigger>
          <TabsTrigger value="spacing" className="gap-2">
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden sm:inline">Spacing</span>
          </TabsTrigger>
          <TabsTrigger value="shadows" className="gap-2">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Shadows</span>
          </TabsTrigger>
          <TabsTrigger value="animations" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Animation</span>
          </TabsTrigger>
        </TabsList>

        {/* COLORS TAB */}
        <TabsContent value="colors" className="space-y-6">
          {/* Brand Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <ColorSwatch
                  name="Maroon (Primary)"
                  cssVar="--primary"
                  className="bg-primary"
                />
                <ColorSwatch
                  name="Gold (Accent)"
                  cssVar="--accent"
                  className="bg-accent"
                />
                <ColorSwatch
                  name="Black (Secondary)"
                  cssVar="--secondary"
                  className="bg-secondary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Semantic Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Semantic Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch
                  name="Background"
                  cssVar="bg-background"
                  className="bg-background border-2"
                />
                <ColorSwatch
                  name="Foreground"
                  cssVar="bg-foreground"
                  className="bg-foreground"
                  textClass="text-foreground"
                />
                <ColorSwatch
                  name="Card"
                  cssVar="bg-card"
                  className="bg-card border-2"
                />
                <ColorSwatch
                  name="Muted"
                  cssVar="bg-muted"
                  className="bg-muted"
                />
                <ColorSwatch
                  name="Success"
                  cssVar="bg-success"
                  className="bg-success"
                />
                <ColorSwatch
                  name="Warning"
                  cssVar="bg-warning"
                  className="bg-warning"
                />
                <ColorSwatch
                  name="Destructive"
                  cssVar="bg-destructive"
                  className="bg-destructive"
                />
                <ColorSwatch
                  name="Border"
                  cssVar="border-border"
                  className="bg-border"
                />
              </div>
            </CardContent>
          </Card>

          {/* Maroon Scale */}
          <Card>
            <CardHeader>
              <CardTitle>Maroon Scale (gspn-maroon)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 md:grid-cols-11 gap-2">
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
          <Card>
            <CardHeader>
              <CardTitle>Gold Scale (gspn-gold)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
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
          <Card>
            <CardHeader>
              <CardTitle>Navigation Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch
                  name="Nav Highlight"
                  cssVar="bg-nav-highlight"
                  className="bg-nav-highlight"
                />
                <ColorSwatch
                  name="Nav Dark Hover"
                  cssVar="bg-nav-dark-hover"
                  className="bg-nav-dark-hover"
                />
                <ColorSwatch
                  name="Sidebar"
                  cssVar="bg-sidebar"
                  className="bg-sidebar"
                />
                <ColorSwatch
                  name="Sidebar Accent"
                  cssVar="bg-sidebar-accent"
                  className="bg-sidebar-accent"
                />
              </div>
            </CardContent>
          </Card>

          {/* Chart Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Chart Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <div key={num} className="text-center">
                    <div
                      className="h-12 w-full rounded-lg mb-1"
                      style={{ backgroundColor: `hsl(var(--chart-${num}))` }}
                    />
                    <span className="text-xs text-muted-foreground">
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
          <Card>
            <CardHeader>
              <CardTitle>Font Families</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="font-sans text-2xl">
                    Inter - Body Text (font-sans)
                  </p>
                  <p className="font-sans text-base text-muted-foreground mt-2">
                    The quick brown fox jumps over the lazy dog. ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Used for all body text and general content
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-display text-2xl">
                    Plus Jakarta Sans - Headings (font-display)
                  </p>
                  <p className="font-display text-xl text-muted-foreground mt-2 font-semibold">
                    Dashboard Overview • Student Enrollment • Payment History
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Used for all headings and titles
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-mono text-2xl">
                    Geist Mono - Numbers (font-mono)
                  </p>
                  <p className="font-mono text-xl text-muted-foreground mt-2 tabular-nums">
                    0123456789 • 1,234,567 GNF • $99.99
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Used for statistics, currency, and code
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-accent text-2xl">
                    DM Sans - Accent (font-accent)
                  </p>
                  <p className="font-accent text-lg text-muted-foreground mt-2">
                    Premium Features • Special Offers • Highlights
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Used for special accent text
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Headings */}
          <Card>
            <CardHeader>
              <CardTitle>Heading Styles</CardTitle>
            </CardHeader>
            <CardContent>
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
          <Card>
            <CardHeader>
              <CardTitle>Body Text Sizes</CardTitle>
            </CardHeader>
            <CardContent>
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
          <Card>
            <CardHeader>
              <CardTitle>Stat Numbers</CardTitle>
            </CardHeader>
            <CardContent>
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
          <Card>
            <CardHeader>
              <CardTitle>Currency Formatting</CardTitle>
            </CardHeader>
            <CardContent>
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
          <Card>
            <CardHeader>
              <CardTitle>Icon Sizes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SizeDemo name="sizing.icon.xs" className={sizing.icon.xs} label="xs" />
              <SizeDemo name="sizing.icon.sm" className={sizing.icon.sm} label="sm" />
              <SizeDemo name="sizing.icon.md" className={sizing.icon.md} label="md" />
              <SizeDemo name="sizing.icon.lg" className={sizing.icon.lg} label="lg" />
              <SizeDemo name="sizing.icon.xl" className={sizing.icon.xl} label="xl" />
            </CardContent>
          </Card>

          {/* Avatar Sizes */}
          <Card>
            <CardHeader>
              <CardTitle>Avatar Sizes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
          <Card>
            <CardHeader>
              <CardTitle>Button/Toolbar Sizes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "bg-muted rounded-lg flex items-center justify-center text-xs",
                    sizing.toolbarButton.height,
                    sizing.toolbarButton.iconOnly
                  )}
                >
                  Icon
                </div>
                <code className="text-xs text-muted-foreground">
                  toolbarButton (h-9 w-9)
                </code>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "bg-muted rounded-lg flex items-center justify-center text-xs",
                    sizing.navButton.height,
                    sizing.navButton.minWidth,
                    sizing.navButton.padding
                  )}
                >
                  Nav Button
                </div>
                <code className="text-xs text-muted-foreground">
                  navButton (h-10 min-w-[120px])
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SPACING TAB */}
        <TabsContent value="spacing" className="space-y-6">
          {/* Container Widths */}
          <Card>
            <CardHeader>
              <CardTitle>Container Max Widths</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(["sm", "md", "lg", "xl", "full"] as const).map((size) => (
                <div key={size} className="space-y-1">
                  <div
                    className={cn(
                      "h-8 bg-primary/20 rounded border border-primary/40",
                      spacing.container[size]
                    )}
                  />
                  <div className="flex justify-between text-xs">
                    <code className="text-muted-foreground">
                      spacing.container.{size}
                    </code>
                    <span className="text-muted-foreground">
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
          <Card>
            <CardHeader>
              <CardTitle>Card Padding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {(["sm", "md", "lg"] as const).map((size) => (
                  <div key={size} className="border rounded-lg">
                    <div className={cn("bg-primary/10", spacing.card[size])}>
                      <div className="bg-card border-2 border-dashed border-primary/40 rounded h-16 flex items-center justify-center">
                        <code className="text-xs">{size}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gap Sizes */}
          <Card>
            <CardHeader>
              <CardTitle>Gap Sizes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
                <div key={size} className="flex items-center">
                  <div className={cn("flex", spacing.gap[size])}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-8 w-8 bg-primary rounded"
                      />
                    ))}
                  </div>
                  <code className="text-xs text-muted-foreground ml-4">
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
          <Card>
            <CardHeader>
              <CardTitle>Shadow Elevation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                {(["xs", "sm", "md", "lg", "xl", "2xl"] as const).map(
                  (level) => (
                    <div key={level} className="text-center">
                      <div
                        className={cn(
                          "h-20 w-full bg-card rounded-lg border",
                          shadows[level]
                        )}
                      />
                      <code className="text-xs text-muted-foreground mt-2 block">
                        {level}
                      </code>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Special Effects */}
          <Card>
            <CardHeader>
              <CardTitle>Glow Effects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div
                    className={cn(
                      "h-20 w-full bg-card rounded-lg border",
                      shadows.glowPrimary
                    )}
                  />
                  <code className="text-xs text-muted-foreground mt-2 block">
                    glowPrimary
                  </code>
                </div>
                <div className="text-center">
                  <div
                    className={cn(
                      "h-20 w-full bg-card rounded-lg border",
                      shadows.glowGold
                    )}
                  />
                  <code className="text-xs text-muted-foreground mt-2 block">
                    glowGold
                  </code>
                </div>
                <div className="text-center">
                  <div
                    className={cn(
                      "h-20 w-full bg-card rounded-lg border",
                      shadows.glowEmerald
                    )}
                  />
                  <code className="text-xs text-muted-foreground mt-2 block">
                    glowEmerald
                  </code>
                </div>
                <div className="text-center">
                  <div
                    className={cn(
                      "h-20 w-full bg-card rounded-lg border",
                      shadows.glowBlue
                    )}
                  />
                  <code className="text-xs text-muted-foreground mt-2 block">
                    glowBlue
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lift Effect */}
          <Card>
            <CardHeader>
              <CardTitle>Lift Effect (Hover)</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "h-24 w-48 bg-card rounded-lg border cursor-pointer transition-all hover:-translate-y-1",
                  shadows.lift
                )}
              >
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Hover me
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANIMATIONS TAB */}
        <TabsContent value="animations" className="space-y-6">
          {/* Timing Functions */}
          <Card>
            <CardHeader>
              <CardTitle>Timing Functions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <code className="w-32 text-sm">spring</code>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full w-1/2 bg-primary rounded-full animate-pulse"
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
                  <code className="w-32 text-sm">smooth</code>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full w-1/2 bg-primary rounded-full"
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
                  <code className="w-32 text-sm">outExpo</code>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full w-1/2 bg-primary rounded-full"
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
          <Card>
            <CardHeader>
              <CardTitle>Duration Scale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {(["fast", "normal", "slow", "slower"] as const).map((dur) => (
                  <div key={dur} className="text-center">
                    <div className="text-2xl font-mono mb-1">
                      {animation.duration[dur]}
                    </div>
                    <code className="text-xs text-muted-foreground">{dur}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Animation Classes */}
          <Card>
            <CardHeader>
              <CardTitle>Animation Classes (Click to replay)</CardTitle>
            </CardHeader>
            <CardContent>
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
      className="p-4 border rounded-lg text-center hover:bg-muted/50 transition-colors"
    >
      <div key={key} className={cn("h-12 w-12 mx-auto bg-primary rounded-lg", className)} />
      <code className="text-xs text-muted-foreground mt-2 block">{name}</code>
    </button>
  )
}
