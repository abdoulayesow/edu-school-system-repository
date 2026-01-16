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
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className={cn(
        "grid gap-4",
        viewMode === "side-by-side" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
      )}>
        {/* Light Mode */}
        {showLight && (
          <div className="rounded-xl border overflow-hidden">
            <div className="bg-muted/50 px-3 py-1.5 border-b flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gspn-gold-400" />
              <span className="text-xs font-medium text-muted-foreground">Light Mode</span>
            </div>
            <div className="p-4 bg-white text-gray-900" data-theme="light">
              <div className="[&_*]:!text-inherit light-mode-preview">
                {children}
              </div>
            </div>
          </div>
        )}
        {/* Dark Mode */}
        {showDark && (
          <div className="rounded-xl border overflow-hidden">
            <div className="bg-muted/50 px-3 py-1.5 border-b flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-400" />
              <span className="text-xs font-medium text-muted-foreground">Dark Mode</span>
            </div>
            <div className="dark p-4 bg-[#0a0a0a] text-gray-100">
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
        <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-gspn-gold-400 via-gspn-gold-500 to-gspn-gold-600 p-8 shadow-xl">
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gspn-maroon-500/20 rounded-lg">
                    <Palette className="h-6 w-6 text-gspn-maroon-700" />
                  </div>
                  <Badge className="bg-gspn-maroon-500/20 text-gspn-maroon-800 border-gspn-maroon-400/30 font-mono text-xs">
                    Live Preview
                  </Badge>
                </div>
                <h1 className="font-display text-4xl font-extrabold tracking-tight text-gspn-maroon-900">
                  Brand Showcase
                </h1>
                <p className="mt-2 text-gspn-maroon-800/80 font-medium max-w-lg">
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
      {/* Enhanced Branded Header */}
      <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-gspn-gold-400 via-gspn-gold-500 to-gspn-gold-600 p-8 shadow-xl">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(139,35,50,0.3) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>
        {/* Maroon accent corners */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gspn-maroon-500/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-gspn-maroon-600/20 blur-2xl" />

        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gspn-maroon-500/20 rounded-lg">
                  <Palette className="h-6 w-6 text-gspn-maroon-700" />
                </div>
                <Badge className="bg-gspn-maroon-500/20 text-gspn-maroon-800 border-gspn-maroon-400/30 font-mono text-xs">
                  Live Preview
                </Badge>
              </div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-gspn-maroon-900">
                Brand Showcase
              </h1>
              <p className="mt-2 text-gspn-maroon-800/80 font-medium max-w-lg">
                Interactive component gallery with side-by-side light and dark mode comparison
              </p>
            </div>
            <a
              href="/style-guide"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gspn-maroon-500/20 hover:bg-gspn-maroon-500/30 rounded-lg text-sm font-medium text-gspn-maroon-800 transition-colors"
            >
              Design Tokens
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gspn-maroon-500/20">
            <span className="text-sm font-medium text-gspn-maroon-800">View:</span>
            <div className="flex gap-1 bg-gspn-maroon-500/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode("side-by-side")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  viewMode === "side-by-side"
                    ? "bg-white text-gspn-maroon-800 shadow-sm"
                    : "text-gspn-maroon-700 hover:bg-white/50"
                )}
              >
                <Monitor className="h-3.5 w-3.5" />
                Side by Side
              </button>
              <button
                onClick={() => setViewMode("light")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  viewMode === "light"
                    ? "bg-white text-gspn-maroon-800 shadow-sm"
                    : "text-gspn-maroon-700 hover:bg-white/50"
                )}
              >
                Light Only
              </button>
              <button
                onClick={() => setViewMode("dark")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  viewMode === "dark"
                    ? "bg-white text-gspn-maroon-800 shadow-sm"
                    : "text-gspn-maroon-700 hover:bg-white/50"
                )}
              >
                Dark Only
              </button>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList>
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
          <DualModePreview title="Buttons" viewMode={viewMode}>
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

          {/* Primary Action Button (Gold) */}
          <DualModePreview title="Primary Action Button (Gold/Highlight)" viewMode={viewMode}>
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

          {/* Badges */}
          <DualModePreview title="Badges" viewMode={viewMode}>
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

          {/* Avatars */}
          <DualModePreview title="Avatars" viewMode={viewMode}>
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

          {/* Progress */}
          <DualModePreview title="Progress Indicators" viewMode={viewMode}>
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
        </TabsContent>

        {/* CARDS TAB */}
        <TabsContent value="cards" className="space-y-8">
          {/* Basic Card */}
          <DualModePreview title="Basic Card" viewMode={viewMode}>
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

          {/* Stat Cards */}
          <DualModePreview title="Stat Cards" viewMode={viewMode}>
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

          {/* Student Card */}
          <DualModePreview title="Student Card" viewMode={viewMode}>
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

          {/* Card with Actions */}
          <DualModePreview title="Card with Actions" viewMode={viewMode}>
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
        </TabsContent>

        {/* FORMS TAB */}
        <TabsContent value="forms" className="space-y-8">
          {/* Form Inputs */}
          <DualModePreview title="Form Inputs" viewMode={viewMode}>
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

          {/* Select */}
          <DualModePreview title="Select Dropdown" viewMode={viewMode}>
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

          {/* Form Card */}
          <DualModePreview title="Form Card" viewMode={viewMode}>
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
        </TabsContent>

        {/* NAVIGATION TAB */}
        <TabsContent value="navigation" className="space-y-8">
          {/* Navigation Buttons */}
          <DualModePreview title="Navigation Buttons" viewMode={viewMode}>
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

          {/* Tabs */}
          <DualModePreview title="Tab Navigation" viewMode={viewMode}>
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

          {/* Toolbar Buttons */}
          <DualModePreview title="Toolbar Icon Buttons" viewMode={viewMode}>
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

          {/* Breadcrumbs */}
          <DualModePreview title="Breadcrumbs" viewMode={viewMode}>
            <nav className="flex items-center gap-2 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground">Home</a>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <a href="#" className="text-muted-foreground hover:text-foreground">Students</a>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Mamadou Diallo</span>
            </nav>
          </DualModePreview>
        </TabsContent>

        {/* STATUS TAB */}
        <TabsContent value="status" className="space-y-8">
          {/* Enrollment Status Badges */}
          <DualModePreview title="Enrollment Status" viewMode={viewMode}>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-muted text-muted-foreground">Draft</Badge>
              <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400">Submitted</Badge>
              <Badge className="bg-warning/15 text-warning">Needs Review</Badge>
              <Badge className="bg-success/15 text-success">Completed</Badge>
              <Badge className="bg-destructive/15 text-destructive">Rejected</Badge>
              <Badge className="bg-muted text-muted-foreground">Cancelled</Badge>
            </div>
          </DualModePreview>

          {/* Payment Status */}
          <DualModePreview title="Payment Status" viewMode={viewMode}>
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

          {/* Attendance Status */}
          <DualModePreview title="Attendance Status" viewMode={viewMode}>
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

          {/* Status Cards */}
          <DualModePreview title="Status Alert Cards" viewMode={viewMode}>
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
        </TabsContent>

        {/* TREASURY TAB */}
        <TabsContent value="treasury" className="space-y-8">
          {/* Treasury Gradient Cards */}
          <DualModePreview title="Treasury Fund Cards" viewMode={viewMode}>
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

          {/* Transaction Row */}
          <DualModePreview title="Transaction List Items" viewMode={viewMode}>
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

          {/* Glow Effects */}
          <DualModePreview title="Card Glow Effects" viewMode={viewMode}>
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
        </TabsContent>

        {/* LOADING TAB */}
        <TabsContent value="loading" className="space-y-8">
          {/* Spinners */}
          <DualModePreview title="Loading Spinners" viewMode={viewMode}>
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

          {/* Skeleton Cards */}
          <DualModePreview title="Skeleton Loading" viewMode={viewMode}>
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

          {/* Button Loading States */}
          <DualModePreview title="Button Loading States" viewMode={viewMode}>
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

          {/* Progress Loading */}
          <DualModePreview title="Progress Indicators" viewMode={viewMode}>
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

          {/* Full Page Loading */}
          <DualModePreview title="Page Loading Overlay" viewMode={viewMode}>
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
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
