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
            <div className="p-5 bg-white text-gray-900" data-theme="light">
              <div className="[&_*]:!text-inherit light-mode-preview">
                {children}
              </div>
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
        <div className="relative mb-10 overflow-hidden rounded-2xl p-8 shadow-2xl">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #f97316 100%)',
            }}
          />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                    <Palette className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 font-mono text-xs">
                    Live Preview
                  </Badge>
                </div>
                <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
                  Brand Showcase
                </h1>
                <p className="mt-2 text-white/90 font-medium max-w-lg">
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
      {/* Enhanced Branded Header with Gradient */}
      <div className="relative mb-10 overflow-hidden rounded-2xl p-8 shadow-2xl">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #f97316 100%)',
          }}
        />

        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(139,35,50,0.3) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>
        {/* Accent corners */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                  <Palette className="h-7 w-7 text-white" />
                </div>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 font-mono text-xs px-3 py-1">
                  Live Preview
                </Badge>
              </div>
              <h1 className="font-display text-5xl font-extrabold tracking-tight text-white mb-3">
                Brand Showcase
              </h1>
              <p className="text-white/90 font-medium max-w-2xl text-lg">
                Interactive component gallery with side-by-side light and dark mode comparison
              </p>
            </div>
            <a
              href="/style-guide"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:shadow-xl"
            >
              Design Tokens
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-4 mt-8 pt-8 border-t border-white/20">
            <span className="text-sm font-semibold text-white">View Mode:</span>
            <div className="flex gap-1.5 bg-white/10 backdrop-blur-sm rounded-xl p-1.5 border border-white/20">
              <button
                onClick={() => setViewMode("side-by-side")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                  viewMode === "side-by-side"
                    ? "bg-white text-amber-900 shadow-lg"
                    : "text-white hover:bg-white/10"
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
                    ? "bg-white text-amber-900 shadow-lg"
                    : "text-white hover:bg-white/10"
                )}
              >
                Light Only
              </button>
              <button
                onClick={() => setViewMode("dark")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                  viewMode === "dark"
                    ? "bg-white text-amber-900 shadow-lg"
                    : "text-white hover:bg-white/10"
                )}
              >
                Dark Only
              </button>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-flex h-auto p-1 bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="treasury">Treasury</TabsTrigger>
          <TabsTrigger value="loading">Loading</TabsTrigger>
        </TabsList>

        {/* COMPONENTS TAB */}
        <TabsContent value="components" className="space-y-8">
          {/* Buttons */}
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
            <CardHeader className="bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Buttons
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Button Variants" viewMode={viewMode}>
                <div className="flex flex-wrap gap-3">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon"><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <Button disabled>Disabled</Button>
                  <Button disabled><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading</Button>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Primary Action Button (Gold) */}
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
            <CardHeader className="bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Primary Action Button (Gold/Highlight)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Gold Action Buttons" viewMode={viewMode}>
                <div className="flex flex-wrap gap-3">
                  <Button className={componentClasses.primaryActionButton}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Enrollment
                  </Button>
                  <Button className={componentClasses.primaryActionButton}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                  <Button className={cn(componentClasses.primaryActionButton, "gap-2")}>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
            <CardHeader className="bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                Badges
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Badge Styles" viewMode={viewMode}>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className="bg-success/15 text-success border-success/20">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Success
                  </Badge>
                  <Badge className="bg-warning/15 text-warning border-warning/20">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Warning
                  </Badge>
                  <Badge className="bg-destructive/15 text-destructive border-destructive/20">
                    <XCircle className="h-3 w-3 mr-1" />
                    Error
                  </Badge>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>

          {/* Avatars */}
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader className="bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <CardHeader className="bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Progress Indicators
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DualModePreview title="Progress Bars" viewMode={viewMode}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Enrollment Progress</span>
                      <span className="text-muted-foreground">75%</span>
                    </div>
                    <Progress value={75} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Payment Complete</span>
                      <span className="text-muted-foreground">100%</span>
                    </div>
                    <Progress value={100} className="[&>div]:bg-success" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>At Risk</span>
                      <span className="text-muted-foreground">25%</span>
                    </div>
                    <Progress value={25} className="[&>div]:bg-destructive" />
                  </div>
                </div>
              </DualModePreview>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CARDS TAB */}
        <TabsContent value="cards" className="space-y-8">
          {/* Basic Card */}
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500" />
            <CardHeader className="bg-gradient-to-br from-cyan-50/50 to-transparent dark:from-cyan-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-500" />
            <CardHeader className="bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-rose-500 to-pink-500" />
            <CardHeader className="bg-gradient-to-br from-rose-50/50 to-transparent dark:from-rose-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500" />
            <CardHeader className="bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
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

        {/* FORMS TAB */}
        <TabsContent value="forms" className="space-y-8">
          {/* Form Inputs */}
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <CardHeader className="bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-500" />
            <CardHeader className="bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
            <CardHeader className="bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-slate-500 to-gray-500" />
            <CardHeader className="bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-blue-500" />
            <CardHeader className="bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-cyan-500 to-teal-500" />
            <CardHeader className="bg-gradient-to-br from-cyan-50/50 to-transparent dark:from-cyan-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-pink-500 to-rose-500" />
            <CardHeader className="bg-gradient-to-br from-pink-50/50 to-transparent dark:from-pink-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
            <CardHeader className="bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-500" />
            <CardHeader className="bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-500" />
            <CardHeader className="bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500" />
            <CardHeader className="bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
            <CardHeader className="bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
            <CardHeader className="bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />
            <CardHeader className="bg-gradient-to-br from-pink-50/50 to-transparent dark:from-pink-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <CardHeader className="bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-slate-500 to-gray-500" />
            <CardHeader className="bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-900/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
            <CardHeader className="bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader className="bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
          <Card className="border-2 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
            <CardHeader className="bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
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
