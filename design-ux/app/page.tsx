import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Receipt,
  ClipboardCheck,
  BarChart3,
  GraduationCap,
  CheckCircle2,
  Shield,
  Wifi,
} from "lucide-react"

export default function HomePage() {
  const pages = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      description: "Director's oversight view with KPIs, pending approvals, and action items",
      color: "primary",
    },
    {
      name: "Enrollments",
      href: "/enrollments",
      icon: Users,
      description: "Manage student enrollments, registration, and profile information",
      color: "secondary",
    },
    {
      name: "Activities",
      href: "/activities",
      icon: BookOpen,
      description: "Organize classes, clubs, and extracurricular activities",
      color: "accent",
    },
    {
      name: "Accounting",
      href: "/accounting",
      icon: Receipt,
      description: "Track payments, reconciliations, and financial control with full traceability",
      color: "success",
    },
    {
      name: "Attendance",
      href: "/attendance",
      icon: ClipboardCheck,
      description: "Mobile-first attendance tracking with quick tap-to-mark interface",
      color: "primary",
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
      description: "Academic oversight and participation analytics for data-driven decisions",
      color: "accent",
    },
  ]

  const features = [
    {
      icon: Wifi,
      title: "Offline-First Design",
      description: "Work seamlessly even with limited connectivity. All data syncs automatically when online.",
    },
    {
      icon: Shield,
      title: "Security & Traceability",
      description: "Every action is logged with transaction IDs and supporting documentation for full accountability.",
    },
    {
      icon: CheckCircle2,
      title: "Role-Based Access",
      description: "Tailored interfaces for directors, secretaries, accountants, teachers, and academic directors.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-secondary px-6 py-24 text-secondary-foreground">
        <div className="mx-auto max-w-6xl pt-12 lg:pt-0">
          <div className="flex items-center gap-4 mb-6">
            <img src="/logo.png" alt="GSPN Logo" className="h-16 w-16 rounded-full" />
            <div>
              <h1 className="text-5xl font-bold text-balance">Groupe Scolaire GSN N'Diolou</h1>
              <p className="text-lg text-secondary-foreground/80 mt-2">Management System</p>
            </div>
          </div>
          <p className="text-2xl text-secondary-foreground/90 max-w-3xl text-pretty leading-relaxed mt-8">
            A comprehensive school management platform built for excellence, security, and traceability in African
            education.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Go to Dashboard
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/10 bg-transparent"
            >
              <Link href="/login">
                <GraduationCap className="mr-2 h-5 w-5" />
                Login
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pages Overview */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-balance">Explore the System</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Navigate to different sections of the platform designed for specific roles and workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => {
              const Icon = page.icon
              return (
                <Link key={page.name} href={page.href} className="group">
                  <Card className="h-full hover:shadow-lg transition-all duration-200 hover:border-primary/50">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`p-3 rounded-lg ${
                            page.color === "primary"
                              ? "bg-primary/10"
                              : page.color === "secondary"
                                ? "bg-secondary/10"
                                : page.color === "accent"
                                  ? "bg-accent/10"
                                  : "bg-success/10"
                          }`}
                        >
                          <Icon
                            className={`h-6 w-6 ${
                              page.color === "primary"
                                ? "text-primary"
                                : page.color === "secondary"
                                  ? "text-secondary"
                                  : page.color === "accent"
                                    ? "text-accent"
                                    : "text-success"
                            }`}
                          />
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors">{page.name}</CardTitle>
                      </div>
                      <CardDescription className="leading-relaxed text-base">{page.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-balance">Built for African Schools</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Designed with the unique needs of West African educational institutions in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="border-2">
                  <CardHeader>
                    <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl mb-3">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6 text-balance">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-10 text-pretty leading-relaxed">
            Access the platform and start managing your school with confidence
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Open Dashboard
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/enrollments">
                <Users className="mr-2 h-5 w-5" />
                Manage Enrollments
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-secondary px-6 py-12 text-secondary-foreground">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="GSPN Logo" className="h-10 w-10 rounded-full" />
              <div>
                <p className="font-bold">Groupe Scolaire GSN N'Diolou</p>
                <p className="text-sm text-secondary-foreground/70">Excellence in Education</p>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/dashboard" className="hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/login" className="hover:text-primary transition-colors">
                Login
              </Link>
              <Link href="/users" className="hover:text-primary transition-colors">
                Users
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-secondary-foreground/10 text-center text-sm text-secondary-foreground/60">
            <p>© 2025 GSPN Management System. Built with excellence for African education.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
