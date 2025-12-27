"use client"

import type React from "react"
import { Inter, Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SessionProvider } from "next-auth/react"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { I18nProvider } from "@/components/i18n-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
})

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
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
      >
        <SessionProvider>
          <I18nProvider>
            <Navigation />
            <main className="lg:pt-16">
              {children}
            </main>
          </I18nProvider>
        </SessionProvider>
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
