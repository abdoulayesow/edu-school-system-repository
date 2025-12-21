"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { WifiOff, Wifi } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function LoginPage() {
  const { t } = useI18n()
  const [isOnline, setIsOnline] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement authentication logic
    console.log("[v0] Login attempt:", { email, isOnline })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted">
      {/* Offline Indicator */}
      <div
        className={`w-full py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
          isOnline ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="size-4" />
            <span>{t.login.connected}</span>
          </>
        ) : (
          <>
            <WifiOff className="size-4" />
            <span>{t.login.workingOffline}</span>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo & Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center size-16 rounded-xl bg-primary/10 mb-4">
              <svg className="size-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground">{t.login.title}</h1>
            <p className="text-muted-foreground">{t.login.subtitle}</p>
          </div>

          {/* Login Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t.login.signIn}</CardTitle>
              <CardDescription>
                {/* Language Selector */}
                <div className="flex gap-2 mt-2">
                  <LanguageSwitcher />
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">{t.login.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.login.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">{t.login.password}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t.login.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                    {t.login.rememberMe}
                  </Label>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full h-10" size="lg">
                  {t.login.signIn}
                </Button>
              </form>

              {/* Offline Mode Toggle (Demo) */}
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isOnline ? t.login.simulateOffline : t.login.simulateOnline}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground italic">{t.login.tagline}</p>
        </div>
      </div>
    </div>
  )
}
