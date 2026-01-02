"use client"

import type React from "react"
import { Inter, Plus_Jakarta_Sans, DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SessionProvider } from "next-auth/react"
import "./globals.css"
import {
  TopNav,
  NavSidebar,
  MobileNav,
  NavigationProvider,
  useNavigation,
} from "@/components/navigation"
import { I18nProvider } from "@/components/i18n-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { QueryProvider } from "@/components/query-provider"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-accent",
  weight: ["400", "500", "600", "700"],
})

// Main content wrapper that adjusts for sidebar
function MainContent({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, isSidebarCollapsed } = useNavigation()

  return (
    <main
      className={cn(
        "min-h-screen pt-[91px] transition-all duration-300 bg-background",
        // Add left margin on desktop when sidebar is open
        isSidebarOpen && "lg:ml-64",
        isSidebarOpen && isSidebarCollapsed && "lg:ml-16"
      )}
    >
      {children}
    </main>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className="overflow-y-scroll">
      <head>
        <title>
          GSPN | Système de Gestion Scolaire | School Management System
        </title>
        <meta
          name="description"
          content="Plateforme complète de gestion scolaire pour les établissements éducatifs africains | Comprehensive school management platform for African educational institutions"
        />
        <meta name="generator" content="v0.app" />
        <link
          rel="icon"
          href="/icon-light-32x32.png"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/icon-dark-32x32.png"
          media="(prefers-color-scheme: dark)"
        />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GSPN" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <meta
          name="theme-color"
          content="#fcfcfc"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#2d2e3f"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      <body
        className={`${inter.variable} ${plusJakarta.variable} ${dmSans.variable} font-sans antialiased text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-900`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SessionProvider>
            <QueryProvider>
              <I18nProvider>
                <NavigationProvider>
                  <TopNav />
                  <NavSidebar />
                  <MobileNav />
                  <MainContent>{children}</MainContent>
                </NavigationProvider>
              </I18nProvider>
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
