"use client"

import type React from "react"
import { Inter, Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"
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

// Metadata and viewport can remain in a server component part of the file if needed,
// but for simplicity with client-side hooks, we assume this is all client-rendered.
// For a production app, you might split this into a client and server component.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <title>
          GSN | Système de Gestion Scolaire | School Management System
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
            <AnimatePresence mode="wait">
              <motion.main
                key={pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="lg:pt-16"
              >
                {children}
              </motion.main>
            </AnimatePresence>
          </I18nProvider>
        </SessionProvider>
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
