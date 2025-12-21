"use client"

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
import { useI18n } from "@/components/i18n-provider"

export default function HomePage() {
  const { t } = useI18n()

  const pages = [
    {
      name: t.nav.dashboard,
      href: "/dashboard",
      icon: LayoutDashboard,
      description: t.home.dashboardDesc,
      color: "primary",
    },
    {
      name: t.nav.enrollments,
      href: "/enrollments",
      icon: Users,
      description: t.home.enrollmentsDesc,
      color: "secondary",
    },
    {
      name: t.nav.activities,
      href: "/activities",
      icon: BookOpen,
      description: t.home.activitiesDesc,
      color: "accent",
    },
    {
      name: t.nav.accounting,
      href: "/accounting",
      icon: Receipt,
      description: t.home.accountingDesc,
      color: "success",
    },
    {
      name: t.nav.attendance,
      href: "/attendance",
      icon: ClipboardCheck,
      description: t.home.attendanceDesc,
      color: "primary",
    },
    {
      name: t.nav.reports,
      href: "/reports",
      icon: BarChart3,
      description: t.home.reportsDesc,
      color: "accent",
    },
  ]

  const features = [
    {
      icon: Wifi,
      title: t.home.offlineFirstTitle,
      description: t.home.offlineFirstDesc,
    },
    {
      icon: Shield,
      title: t.home.securityTitle,
      description: t.home.securityDesc,
    },
    {
      icon: CheckCircle2,
      title: t.home.roleBasedTitle,
      description: t.home.roleBasedDesc,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-secondary px-6 py-12 text-secondary-foreground">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-4 mb-6">
            <img src="/logo.png" alt="GSPN Logo" className="h-16 w-16 rounded-full" />
            <div>
              <h1 className="text-5xl font-bold text-balance">{t.home.schoolName}</h1>
              <p className="text-lg text-secondary-foreground/80 mt-2">{t.home.managementSystem}</p>
            </div>
          </div>
          <p className="text-xl text-secondary-foreground/90 max-w-3xl text-pretty leading-relaxed mt-4">
            {t.home.heroDescription}
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                {t.home.goToDashboard}
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
                {t.nav.login}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pages Overview */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-balance">{t.home.exploreSystem}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              {t.home.exploreDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => {
              const Icon = page.icon
              return (
                <Link key={page.href} href={page.href} className="group">
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
      <section className="px-6 py-10 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-balance">{t.home.builtForAfricanSchools}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              {t.home.featuresDescription}
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
      <section className="px-6 py-10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-3 text-balance">{t.home.readyToStart}</h2>
          <p className="text-lg text-muted-foreground mb-6 text-pretty leading-relaxed">
            {t.home.ctaDescription}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                {t.home.openDashboard}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/enrollments">
                <Users className="mr-2 h-5 w-5" />
                {t.home.manageEnrollments}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-secondary px-6 py-8 text-secondary-foreground">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="GSPN Logo" className="h-10 w-10 rounded-full" />
              <div>
                <p className="font-bold">{t.home.schoolName}</p>
                <p className="text-sm text-secondary-foreground/70">{t.home.excellenceInEducation}</p>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/dashboard" className="hover:text-primary transition-colors">
                {t.nav.dashboard}
              </Link>
              <Link href="/login" className="hover:text-primary transition-colors">
                {t.nav.login}
              </Link>
              <Link href="/users" className="hover:text-primary transition-colors">
                {t.nav.users}
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-secondary-foreground/10 text-center text-sm text-secondary-foreground/60">
            <p>{t.home.footerCopyright}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
