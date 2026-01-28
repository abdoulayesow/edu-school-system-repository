"use client"

import { useState, useEffect } from "react"
import { PageContainer } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCircle,
  ChevronRight,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Home,
  Loader2,
  Mail,
  Monitor,
  MoreHorizontal,
  Palette,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
  TrendingUp,
  User,
  Users,
  Wallet,
  XCircle,
} from "lucide-react"
import { componentClasses, shadows, gradients } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"

// Wrapper that shows component in both light and dark mode side by side
function DualModePreview({
  title,
  children,
  viewMode = "side-by-side",
}: {
  title: string
  children: React.ReactNode
  viewMode?: "side-by-side" | "light" | "dark"
}) {
  const showLight = viewMode === "side-by-side" || viewMode === "light"
  const showDark = viewMode === "side-by-side" || viewMode === "dark"

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">{title}</h3>
      <div className={cn(
        "grid gap-5",
        viewMode === "side-by-side" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
      )}>
        {/* Light Mode */}
        {showLight && (
          <div className="rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-800/10 px-4 py-2 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-sm" />
              <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">Light Mode</span>
            </div>
            <div className="p-5 bg-white text-gray-900 [&_.text-muted-foreground]:text-slate-500 [&_.text-foreground]:text-slate-900" data-theme="light">
              {children}
            </div>
          </div>
        )}
        {/* Dark Mode */}
        {showDark && (
          <div className="rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/10 px-4 py-2 border-b border-blue-200 dark:border-blue-800 flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-400 shadow-sm" />
              <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">Dark Mode</span>
            </div>
            <div className="dark p-5 bg-[#0a0a0a] text-gray-100">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BrandPage() {
  const [activeTab, setActiveTab] = useState("components")
  const [viewMode, setViewMode] = useState<"side-by-side" | "light" | "dark">("side-by-side")
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch with Radix Tabs auto-generated IDs
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <PageContainer maxWidth="full">
        <div className="relative mb-10 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          {/* Maroon accent bar */}
          <div className="h-1 bg-gspn-maroon-500" />
          <div className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                    <Palette className="h-6 w-6 text-gspn-maroon-500" />
                  </div>
                  <Badge variant="outline" className="font-mono text-xs border-gspn-gold-500 text-gspn-gold-600">
                    Live Preview
                  </Badge>
                </div>
                <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground">
                  Brand Showcase
                </h1>
                <p className="mt-2 text-muted-foreground font-medium max-w-lg">
                  Interactive component gallery with side-by-side light and dark mode comparison
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Loading skeleton for tabs */}
        <div className="space-y-4">
          <div className="flex gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-10 w-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-muted/50 rounded-lg animate-pulse" />
        </div>
      </PageContainer>
    )
  }

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
                  <Palette className="h-7 w-7 text-gspn-maroon-500" />
                </div>
                <Badge variant="outline" className="font-mono text-xs px-3 py-1 border-gspn-gold-500 text-gspn-gold-600 dark:text-gspn-gold-400">
                  Live Preview
                </Badge>
              </div>
              <h1 className="font-display text-5xl font-extrabold tracking-tight text-foreground mb-3">
                Brand Showcase
              </h1>
              <p className="text-muted-foreground font-medium max-w-2xl text-lg">
                Interactive component gallery with side-by-side light and dark mode comparison
              </p>
            </div>
            <a
              href="/style-guide"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gspn-maroon-500/10 hover:bg-gspn-maroon-500/20 rounded-xl text-sm font-semibold text-gspn-maroon-600 dark:text-gspn-maroon-400 transition-all"
            >
              Design Tokens
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-4 mt-8 pt-8 border-t border-border">
            <span className="text-sm font-semibold text-foreground">View Mode:</span>
            <div className="flex gap-1.5 bg-muted rounded-xl p-1.5 border border-border">
              <button
                onClick={() => setViewMode("side-by-side")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                  viewMode === "side-by-side"
                    ? "bg-gspn-gold-500 text-black shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                )}
              >
                <Monitor className="h-4 w-4" />
                Side by Side
              </button>
              <button
                onClick={() => setViewMode("light")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                  viewMode === "light"
                    ? "bg-gspn-gold-500 text-black shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                )}
              >
                Light Only
              </button>
              <button
                onClick={() => setViewMode("dark")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                  viewMode === "dark"
                    ? "bg-gspn-gold-500 text-black shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                )}
              >
                Dark Only
              </button>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-9 lg:w-auto lg:inline-flex h-auto p-1 bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="treasury">Treasury</TabsTrigger>
          <TabsTrigger value="loading">Loading</TabsTrigger>
        </TabsList>

        {/* HEADERS TAB */}
        <TabsContent value="headers" className="space-y-8">
          {/* Page Header Pattern */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Page Header Pattern
              </CardTitle>
              <CardDescription>
                Standard page header with maroon accent bar, icon next to title, and optional school year badge
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <DualModePreview title="Standard Page Header" viewMode={viewMode}>
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <div className="h-1 bg-gspn-maroon-500" />
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                            <FileText className="h-6 w-6 text-gspn-maroon-500" />
                          </div>
                          <h1 className="text-3xl font-bold text-foreground">
                            Enrollments
                          </h1>
                        </div>
                        <p className="text-muted-foreground mt-1">
                          Manage student enrollments and profiles
                        </p>
                      </div>
                      {/* School Year Badge */}
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gspn-maroon-50 dark:bg-gspn-maroon-950/30 border border-gspn-maroon-200 dark:border-gspn-maroon-800">
                        <span className="text-sm text-gspn-maroon-700 dark:text-gspn-maroon-400">
                          School Year:
                        </span>
                        <span className="text-sm font-semibold text-gspn-maroon-800 dark:text-gspn-maroon-300">
                          2025 - 2026
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </DualModePreview>

              <DualModePreview title="Page Header without Badge" viewMode={viewMode}>
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <div className="h-1 bg-gspn-maroon-500" />
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
                        <Users className="h-6 w-6 text-gspn-maroon-500" />
                      </div>
                      <h1 className="text-3xl font-bold text-foreground">
                        Students
                      </h1>
                    </div>
                    <p className="text-muted-foreground mt-1">
                      View and manage all students
                    </p>
                  </div>
                </div>
              </DualModePreview>

              <DualModePreview title="Compact Page Header" viewMode={viewMode}>
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <div className="h-1 bg-gspn-maroon-500" />
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gspn-maroon-500/10 rounded-lg">
                        <BookOpen className="h-5 w-5 text-gspn-maroon-500" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-foreground">
                          Clubs & Activities
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          Enroll students in extracurricular clubs
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Code Reference */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Code Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <pre className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm overflow-x-auto">
{`{/* Page Header with Brand Styling */}
<div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
  <div className="h-1 bg-gspn-maroon-500" />
  <div className="p-6">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-gspn-maroon-500/10 rounded-xl">
            <FileText className="h-6 w-6 text-gspn-maroon-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Page Title
          </h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Page description here
        </p>
      </div>
      {/* Optional: School Year Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gspn-maroon-50 dark:bg-gspn-maroon-950/30 border border-gspn-maroon-200 dark:border-gspn-maroon-800">
        <span className="text-sm text-gspn-maroon-700 dark:text-gspn-maroon-400">
          School Year:
        </span>
        <span className="text-sm font-semibold text-gspn-maroon-800 dark:text-gspn-maroon-300">
          2025 - 2026
        </span>
      </div>
    </div>
  </div>
</div>`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPONENTS TAB */}
        <TabsContent value="components" className="space-y-8">
          {/* Buttons */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Buttons
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <DualModePreview title="Gold Action Buttons (Primary CTA)" viewMode={viewMode}>
                <div className="flex flex-wrap gap-3">
                  <Button className={componentClasses.primaryActionButton}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Enrollment
                  </Button>
                  <Button className={cn(componentClasses.primaryActionButton, "gap-2")}>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </DualModePreview>

              <DualModePreview title="Sizes" viewMode={viewMode}>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm" className={componentClasses.primaryActionButton}>
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Small
                    </Button>
                    <Button size="default" className={componentClasses.primaryActionButton}>
                      <Plus className="h-4 w-4 mr-2" />
                      Default
                    </Button>
                    <Button size="lg" className={componentClasses.primaryActionButton}>
                      <Plus className="h-5 w-5 mr-2" />
                      Large
                    </Button>
                    <Button size="icon" className={componentClasses.primaryActionButton}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm" variant="outline">Small</Button>
                    <Button size="default" variant="outline">Default</Button>
                    <Button size="lg" variant="outline">Large</Button>
                    <Button size="icon" variant="outline"><Settings className="h-4 w-4" /></Button>
                  </div>
                </div>
              </DualModePreview>

              <DualModePreview title="States" viewMode={viewMode}>
                <div className="flex flex-wrap gap-3">
                  <Button className={componentClasses.primaryActionButton} disabled>Disabled</Button>
                  <Button className={componentClasses.primaryActionButton} disabled>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading
                  </Button>
                </div>
              </DualModePreview>

              <DualModePreview title="Destructive Actions" viewMode={viewMode}>
                <div className="flex flex-wrap gap-3">
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                  <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                    Cancel Enrollment
                  </Button>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Badges
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <DualModePreview title="Core Variants" viewMode={viewMode}>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-gspn-maroon-500 text-white hover:bg-gspn-maroon-600 dark:bg-gspn-maroon-600 dark:hover:bg-gspn-maroon-500">
                    Primary
                  </Badge>
                  <Badge className="bg-gspn-gold-500 text-black hover:bg-gspn-gold-600 dark:bg-gspn-gold-400 dark:hover:bg-gspn-gold-300">
                    Gold
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Secondary
                  </Badge>
                  <Badge variant="outline" className="border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400">
                    Outline
                  </Badge>
                </div>
              </DualModePreview>

              <DualModePreview title="Semantic Status" viewMode={viewMode}>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Success
                  </Badge>
                  <Badge className="bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Warning
                  </Badge>
                  <Badge className="bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30">
                    <XCircle className="h-3 w-3 mr-1" />
                    Error
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Info
                  </Badge>
                </div>
              </DualModePreview>

              <DualModePreview title="Subtle / Muted" viewMode={viewMode}>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-slate-50 text-slate-500 border border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700">
                    Draft
                  </Badge>
                  <Badge className="bg-slate-100 text-slate-400 border border-slate-200 line-through dark:bg-slate-800/50 dark:text-slate-500 dark:border-slate-700">
                    Cancelled
                  </Badge>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Avatars */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Avatars
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Avatar Sizes" viewMode={viewMode}>
                <div className="flex items-center gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/avatars/02.png" />
                    <AvatarFallback>AB</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/avatars/03.png" />
                    <AvatarFallback>CD</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">EF</AvatarFallback>
                  </Avatar>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Progress Indicators
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <DualModePreview title="Progress Bar (Mode-Specific)" viewMode={viewMode}>
                <div className="space-y-5">
                  {/* In Progress - Gold for light, Red/Maroon for dark */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Enrollment Progress</span>
                      <span className="text-muted-foreground font-mono">75%</span>
                    </div>
                    <Progress
                      value={75}
                      className="h-2.5 bg-slate-200 dark:bg-slate-700 [&>div]:bg-gspn-gold-500 dark:[&>div]:bg-gspn-maroon-500"
                    />
                  </div>
                  {/* Complete - Always Green */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Payment Complete</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">100%</span>
                    </div>
                    <Progress
                      value={100}
                      className="h-2.5 bg-slate-200 dark:bg-slate-700 [&>div]:bg-emerald-500 dark:[&>div]:bg-emerald-500"
                    />
                  </div>
                  {/* Low Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Getting Started</span>
                      <span className="text-muted-foreground font-mono">25%</span>
                    </div>
                    <Progress
                      value={25}
                      className="h-2.5 bg-slate-200 dark:bg-slate-700 [&>div]:bg-gspn-gold-500 dark:[&>div]:bg-gspn-maroon-500"
                    />
                  </div>
                </div>
              </DualModePreview>

              <DualModePreview title="Stepped Progress (Wizard Style)" viewMode={viewMode}>
                <div className="py-2">
                  <div className="flex items-center justify-between">
                    {[
                      { label: "Info", done: true },
                      { label: "Details", done: true },
                      { label: "Review", current: true },
                      { label: "Complete", done: false },
                    ].map((step, i, arr) => (
                      <div key={i} className="flex-1 relative flex flex-col items-center">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-all",
                          step.done && "bg-gspn-gold-500 border-gspn-gold-500 text-black dark:bg-gspn-gold-500 dark:border-gspn-gold-500",
                          step.current && "border-gspn-gold-500 bg-gspn-gold-50 text-gspn-gold-700 dark:border-gspn-gold-400 dark:bg-gspn-gold-500/20 dark:text-gspn-gold-300 ring-4 ring-gspn-gold-500/20",
                          !step.done && !step.current && "border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500"
                        )}>
                          {step.done ? <Check className="h-4 w-4" /> : <span className="text-xs font-semibold">{i + 1}</span>}
                        </div>
                        <span className={cn(
                          "mt-1.5 text-xs font-medium",
                          (step.done || step.current) ? "text-foreground" : "text-muted-foreground"
                        )}>{step.label}</span>
                        {i < arr.length - 1 && (
                          <div className={cn(
                            "absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2",
                            step.done ? "bg-gspn-gold-500 dark:bg-gspn-gold-500" : "bg-slate-200 dark:bg-slate-700"
                          )} style={{ left: "calc(50% + 16px)", width: "calc(100% - 32px)" }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </DualModePreview>

              <DualModePreview title="Circular Progress" viewMode={viewMode}>
                <div className="flex items-center gap-6">
                  {/* In Progress */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-16 h-16">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" className="stroke-slate-200 dark:stroke-slate-700" />
                        <circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray="176" strokeDashoffset="44" className="stroke-gspn-gold-500 dark:stroke-gspn-maroon-500 transition-all" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">75%</span>
                    </div>
                    <span className="text-xs text-muted-foreground">In Progress</span>
                  </div>
                  {/* Complete */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-16 h-16">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" className="stroke-slate-200 dark:stroke-slate-700" />
                        <circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray="176" strokeDashoffset="0" className="stroke-emerald-500 transition-all" />
                      </svg>
                      <Check className="absolute inset-0 m-auto h-6 w-6 text-emerald-500" />
                    </div>
                    <span className="text-xs text-muted-foreground">Complete</span>
                  </div>
                </div>
              </DualModePreview>

              <DualModePreview title="Segmented Progress" viewMode={viewMode}>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Payment Installments</span>
                    <span className="text-muted-foreground">3 of 4 paid</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[true, true, true, false].map((paid, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 h-3 rounded-full transition-colors",
                          paid
                            ? "bg-emerald-500"
                            : "bg-slate-200 dark:bg-slate-700"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CARDS TAB */}
        <TabsContent value="cards" className="space-y-8">
          {/* Basic Card */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Basic Card
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Standard Card" viewMode={viewMode}>
                <Card>
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card description with supporting text</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Card content goes here. This is a standard card used throughout the application.
                    </p>
                  </CardContent>
                </Card>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Stat Cards */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Stat Cards
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Statistics Display" viewMode={viewMode}>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">1,234</p>
                          <p className="text-xs text-muted-foreground">Total Students</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-success">+12%</p>
                          <p className="text-xs text-muted-foreground">Growth Rate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Student Card */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Student Card
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Student Profile" viewMode={viewMode}>
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4 p-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>MD</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold truncate">Mamadou Diallo</h4>
                          <Badge className="bg-success/15 text-success text-xs">Active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">CM2 - Primary</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Since 2023
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-warning" />
                            Top 10%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Card with Actions */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Card with Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Actionable Card" viewMode={viewMode}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base">Recent Payment</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold font-mono">750,000 GNF</p>
                        <p className="text-xs text-muted-foreground">Tuition - Term 2</p>
                      </div>
                      <Badge className="bg-success/15 text-success">Paid</Badge>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-3 w-3 mr-1" />
                        Receipt
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Details
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </DualModePreview>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TABLES TAB */}
        <TabsContent value="tables" className="space-y-8">
          {/* Data Table Pattern */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Data Table Pattern
              </CardTitle>
              <CardDescription>
                Standard table with gold header background and hover states
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <DualModePreview title="Students Table" viewMode={viewMode}>
                <Card className="border shadow-sm overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                      <div>
                        <CardTitle>All Students</CardTitle>
                        <CardDescription>3 students</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gspn-gold-50/50 dark:bg-gspn-gold-950/20">
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="cursor-pointer hover:bg-muted/50">
                            <TableCell>
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>MD</AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">Mamadou Diallo</TableCell>
                            <TableCell className="text-muted-foreground">STU-2024-001</TableCell>
                            <TableCell>CM2</TableCell>
                            <TableCell>
                              <Badge className="bg-success/15 text-success">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-4">
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </TableCell>
                          </TableRow>
                          <TableRow className="cursor-pointer hover:bg-muted/50">
                            <TableCell>
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>FB</AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">Fatou Barry</TableCell>
                            <TableCell className="text-muted-foreground">STU-2024-002</TableCell>
                            <TableCell>CE2</TableCell>
                            <TableCell>
                              <Badge className="bg-success/15 text-success">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-4">
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </TableCell>
                          </TableRow>
                          <TableRow className="cursor-pointer hover:bg-muted/50">
                            <TableCell>
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>AS</AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">Amadou Sow</TableCell>
                            <TableCell className="text-muted-foreground">STU-2024-003</TableCell>
                            <TableCell>6ème</TableCell>
                            <TableCell>
                              <Badge className="bg-warning/15 text-warning">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-4">
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Table Header Pattern */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Table Header Styling
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Gold Header Background" viewMode={viewMode}>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gspn-gold-50/50 dark:bg-gspn-gold-950/20">
                        <TableHead>Column 1</TableHead>
                        <TableHead>Column 2</TableHead>
                        <TableHead>Column 3</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-muted/50">
                        <TableCell>Value 1</TableCell>
                        <TableCell>Value 2</TableCell>
                        <TableCell>Value 3</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Code Reference */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Code Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <pre className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm overflow-x-auto">
{`{/* Table Card with Title Indicator */}
<Card className="border shadow-sm overflow-hidden">
  <CardHeader>
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
      <div>
        <CardTitle>All Students</CardTitle>
        <CardDescription>3 students</CardDescription>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {/* Gold tinted header row */}
          <TableRow className="bg-gspn-gold-50/50 dark:bg-gspn-gold-950/20">
            <TableHead>Column</TableHead>
            ...
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Clickable row with hover */}
          <TableRow className="cursor-pointer hover:bg-muted/50">
            <TableCell>...</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </CardContent>
</Card>`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FORMS TAB */}
        <TabsContent value="forms" className="space-y-8">
          {/* Form Inputs */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Form Inputs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Input Fields" viewMode={viewMode}>
                <div className="space-y-4 max-w-sm">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Enter student name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="email@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="search" className="pl-9" placeholder="Search students..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Disabled Input</Label>
                    <Input disabled value="Cannot edit this" />
                  </div>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Select */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Select Dropdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Dropdown Select" viewMode={viewMode}>
                <div className="space-y-4 max-w-sm">
                  <div className="space-y-2">
                    <Label>Grade Level</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cp1">CP1</SelectItem>
                        <SelectItem value="cp2">CP2</SelectItem>
                        <SelectItem value="ce1">CE1</SelectItem>
                        <SelectItem value="ce2">CE2</SelectItem>
                        <SelectItem value="cm1">CM1</SelectItem>
                        <SelectItem value="cm2">CM2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Form Card
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Registration Form" viewMode={viewMode}>
                <Card className="max-w-md">
                  <CardHeader>
                    <CardTitle>Quick Registration</CardTitle>
                    <CardDescription>Enter student details to begin enrollment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input placeholder="First name" />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input placeholder="Last name" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Grade</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cm1">CM1</SelectItem>
                          <SelectItem value="cm2">CM2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" className="flex-1">Cancel</Button>
                      <Button className={cn(componentClasses.primaryActionButton, "flex-1")}>
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </DualModePreview>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NAVIGATION TAB */}
        <TabsContent value="navigation" className="space-y-8">
          {/* Navigation Buttons */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Navigation Buttons
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Main Navigation" viewMode={viewMode}>
                <div className="flex flex-wrap gap-2 p-3 bg-sidebar rounded-lg">
                  <button className={cn(componentClasses.navMainButtonBase, componentClasses.navMainButtonActive)}>
                    <Home className="h-4 w-4" />
                    Dashboard
                  </button>
                  <button className={cn(componentClasses.navMainButtonBase, componentClasses.navMainButtonInactive)}>
                    <Users className="h-4 w-4" />
                    Students
                  </button>
                  <button className={cn(componentClasses.navMainButtonBase, componentClasses.navMainButtonInactive)}>
                    <GraduationCap className="h-4 w-4" />
                    Enrollments
                  </button>
                  <button className={cn(componentClasses.navMainButtonBase, componentClasses.navMainButtonInactive)}>
                    <Wallet className="h-4 w-4" />
                    Payments
                  </button>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Tab Navigation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Tabs" viewMode={viewMode}>
                <div>
                  <div className={componentClasses.tabListBase}>
                    <button className={cn(componentClasses.tabButtonBase, componentClasses.tabButtonActive)}>
                      <BookOpen className="h-4 w-4" />
                      Overview
                    </button>
                    <button className={cn(componentClasses.tabButtonBase, componentClasses.tabButtonInactive)}>
                      <CreditCard className="h-4 w-4" />
                      Payments
                    </button>
                    <button className={cn(componentClasses.tabButtonBase, componentClasses.tabButtonInactive)}>
                      <Calendar className="h-4 w-4" />
                      Schedule
                    </button>
                    <button className={cn(componentClasses.tabButtonBase, componentClasses.tabButtonInactive)}>
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                  </div>
                  <div className="p-4 border border-t-0 rounded-b-lg">
                    <p className="text-sm text-muted-foreground">Tab content area</p>
                  </div>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Toolbar Buttons */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Toolbar Icon Buttons
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Toolbar" viewMode={viewMode}>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <button className={componentClasses.toolbarIconButton}>
                    <Search className="h-5 w-5" />
                  </button>
                  <button className={componentClasses.toolbarIconButton}>
                    <Bell className="h-5 w-5" />
                  </button>
                  <button className={componentClasses.toolbarIconButton}>
                    <Settings className="h-5 w-5" />
                  </button>
                  <div className="h-6 w-px bg-border mx-1" />
                  <button className={componentClasses.toolbarIconButton}>
                    <User className="h-5 w-5" />
                  </button>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Breadcrumbs */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Breadcrumbs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Breadcrumb Navigation" viewMode={viewMode}>
                <nav className="flex items-center gap-2 text-sm">
                  <a href="#" className="text-muted-foreground hover:text-foreground">Home</a>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <a href="#" className="text-muted-foreground hover:text-foreground">Students</a>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Mamadou Diallo</span>
                </nav>
              </DualModePreview>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STATUS TAB */}
        <TabsContent value="status" className="space-y-8">
          {/* Enrollment Status Badges */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Enrollment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Status Badges" viewMode={viewMode}>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-muted text-muted-foreground">Draft</Badge>
                  <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400">Submitted</Badge>
                  <Badge className="bg-warning/15 text-warning">Needs Review</Badge>
                  <Badge className="bg-success/15 text-success">Completed</Badge>
                  <Badge className="bg-destructive/15 text-destructive">Rejected</Badge>
                  <Badge className="bg-muted text-muted-foreground">Cancelled</Badge>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Payment States" viewMode={viewMode}>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-muted text-muted-foreground">Pending</Badge>
                  <Badge className="bg-success/15 text-success">
                    <Check className="h-3 w-3 mr-1" />
                    Paid
                  </Badge>
                  <Badge className="bg-warning/15 text-warning">Partial</Badge>
                  <Badge className="bg-destructive/15 text-destructive">Overdue</Badge>
                  <Badge className="bg-muted text-muted-foreground line-through">Cancelled</Badge>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Attendance Status */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Attendance Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Attendance States" viewMode={viewMode}>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-success/15 text-success">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Present
                  </Badge>
                  <Badge className="bg-destructive/15 text-destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Absent
                  </Badge>
                  <Badge className="bg-warning/15 text-warning">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Late
                  </Badge>
                  <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    <Mail className="h-3 w-3 mr-1" />
                    Excused
                  </Badge>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Status Cards */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Status Alert Cards
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Alert Messages" viewMode={viewMode}>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-success">Success</p>
                      <p className="text-sm text-muted-foreground">Operation completed successfully.</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-warning">Warning</p>
                      <p className="text-sm text-muted-foreground">Please review before continuing.</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">Error</p>
                      <p className="text-sm text-muted-foreground">Something went wrong. Please try again.</p>
                    </div>
                  </div>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TREASURY TAB */}
        <TabsContent value="treasury" className="space-y-8">
          {/* Treasury Gradient Cards */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Treasury Fund Cards
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Fund Balance Cards" viewMode={viewMode}>
                <div className="grid grid-cols-2 gap-4">
                  {/* Registry */}
                  <Card className={cn(
                    "overflow-hidden border-2",
                    gradients.registry.light,
                    gradients.registry.dark,
                    gradients.registry.border
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn("p-1.5 rounded-lg bg-emerald-500/20", gradients.registry.text)}>
                          <Wallet className="h-4 w-4" />
                        </div>
                        <span className={cn("text-sm font-medium", gradients.registry.text)}>Registry</span>
                      </div>
                      <p className="text-2xl font-bold font-mono">12,500,000 GNF</p>
                      <p className="text-xs text-muted-foreground mt-1">Main operating fund</p>
                    </CardContent>
                  </Card>

                  {/* Safe */}
                  <Card className={cn(
                    "overflow-hidden border-2",
                    gradients.safe.light,
                    gradients.safe.dark,
                    gradients.safe.border
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn("p-1.5 rounded-lg bg-amber-500/20", gradients.safe.text)}>
                          <Wallet className="h-4 w-4" />
                        </div>
                        <span className={cn("text-sm font-medium", gradients.safe.text)}>Safe</span>
                      </div>
                      <p className="text-2xl font-bold font-mono">45,000,000 GNF</p>
                      <p className="text-xs text-muted-foreground mt-1">Cash reserve</p>
                    </CardContent>
                  </Card>

                  {/* Bank */}
                  <Card className={cn(
                    "overflow-hidden border-2",
                    gradients.bank.light,
                    gradients.bank.dark,
                    gradients.bank.border
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn("p-1.5 rounded-lg bg-blue-500/20", gradients.bank.text)}>
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <span className={cn("text-sm font-medium", gradients.bank.text)}>Bank</span>
                      </div>
                      <p className="text-2xl font-bold font-mono">78,250,000 GNF</p>
                      <p className="text-xs text-muted-foreground mt-1">Bank account balance</p>
                    </CardContent>
                  </Card>

                  {/* Mobile Money */}
                  <Card className={cn(
                    "overflow-hidden border-2",
                    gradients.mobileMoney.light,
                    gradients.mobileMoney.dark,
                    gradients.mobileMoney.border
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn("p-1.5 rounded-lg bg-orange-500/20", gradients.mobileMoney.text)}>
                          <Wallet className="h-4 w-4" />
                        </div>
                        <span className={cn("text-sm font-medium", gradients.mobileMoney.text)}>Mobile Money</span>
                      </div>
                      <p className="text-2xl font-bold font-mono">5,750,000 GNF</p>
                      <p className="text-xs text-muted-foreground mt-1">Orange Money + MTN</p>
                    </CardContent>
                  </Card>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Transaction Row */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Transaction List Items
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Transactions" viewMode={viewMode}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-success/10">
                        <TrendingUp className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="font-medium">Tuition Payment</p>
                        <p className="text-xs text-muted-foreground">Mamadou Diallo - CM2</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-success">+750,000 GNF</p>
                      <p className="text-xs text-muted-foreground">Today, 10:30 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-destructive/10">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium">Office Supplies</p>
                        <p className="text-xs text-muted-foreground">Expense - Administration</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-destructive">-125,000 GNF</p>
                      <p className="text-xs text-muted-foreground">Today, 9:15 AM</p>
                    </div>
                  </div>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Glow Effects */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Card Glow Effects
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Glow Shadows" viewMode={viewMode}>
                <div className="grid grid-cols-4 gap-4">
                  <Card className={cn("p-4 text-center", shadows.glowPrimary)}>
                    <p className="text-xs font-medium">Primary Glow</p>
                  </Card>
                  <Card className={cn("p-4 text-center", shadows.glowGold)}>
                    <p className="text-xs font-medium">Gold Glow</p>
                  </Card>
                  <Card className={cn("p-4 text-center", shadows.glowEmerald)}>
                    <p className="text-xs font-medium">Emerald Glow</p>
                  </Card>
                  <Card className={cn("p-4 text-center", shadows.glowBlue)}>
                    <p className="text-xs font-medium">Blue Glow</p>
                  </Card>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LOADING TAB */}
        <TabsContent value="loading" className="space-y-8">
          {/* Spinners */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Loading Spinners
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Spinner Variants" viewMode={viewMode}>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Primary</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Muted</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-gspn-gold-500" />
                    <span className="text-xs text-muted-foreground">Gold Large</span>
                  </div>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Skeleton Cards */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Skeleton Loading
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Loading Skeletons" viewMode={viewMode}>
                <div className="space-y-4">
                  {/* Card skeleton */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                          <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* List skeleton */}
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-muted rounded animate-pulse" style={{ width: `${80 - i * 10}%` }} />
                          <div className="h-2 bg-muted rounded animate-pulse w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Button Loading States */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Button Loading States
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Loading Buttons" viewMode={viewMode}>
                <div className="flex flex-wrap gap-3">
                  <Button disabled>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </Button>
                  <Button variant="outline" disabled>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Please wait
                  </Button>
                  <Button className={componentClasses.primaryActionButton} disabled>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </Button>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Progress Loading */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Progress Indicators
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Progress States" viewMode={viewMode}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading document...</span>
                      <span className="text-muted-foreground font-mono">45%</span>
                    </div>
                    <Progress value={45} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing payment...</span>
                      <span className="text-muted-foreground font-mono">78%</span>
                    </div>
                    <Progress value={78} className="[&>div]:bg-gspn-gold-500" />
                  </div>
                  {/* Indeterminate progress */}
                  <div className="space-y-2">
                    <span className="text-sm">Syncing data...</span>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-primary rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Full Page Loading */}
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gspn-maroon-500" />
                Page Loading Overlay
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Loading Overlay" viewMode={viewMode}>
                <div className="relative h-48 rounded-lg border bg-background overflow-hidden">
                  {/* Background content (blurred) */}
                  <div className="p-4 opacity-30">
                    <div className="h-4 bg-muted rounded w-1/2 mb-3" />
                    <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                  {/* Loading overlay */}
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full border-4 border-muted" />
                        <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      </div>
                      <p className="text-sm text-muted-foreground">Loading enrollment data...</p>
                    </div>
                  </div>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
