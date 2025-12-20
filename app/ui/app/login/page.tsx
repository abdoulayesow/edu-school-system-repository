"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { WifiOff, Wifi } from "lucide-react"

export default function LoginPage() {
  const [isOnline, setIsOnline] = useState(true)
  const [language, setLanguage] = useState<"fr" | "en">("fr")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement authentication logic
    console.log("[v0] Login attempt:", { email, isOnline })
  }

  const text = {
    fr: {
      title: "Système de Gestion Scolaire",
      subtitle: "Connectez-vous à votre compte",
      email: "Adresse e-mail",
      emailPlaceholder: "votre.email@ecole.gn",
      password: "Mot de passe",
      passwordPlaceholder: "Entrez votre mot de passe",
      rememberMe: "Se souvenir de moi",
      login: "Se connecter",
      online: "Connecté",
      offline: "Mode hors ligne",
      footer: "Pour les écoles africaines, par les africains",
    },
    en: {
      title: "School Management System",
      subtitle: "Sign in to your account",
      email: "Email address",
      emailPlaceholder: "your.email@school.gn",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      rememberMe: "Remember me",
      login: "Sign in",
      online: "Connected",
      offline: "Working offline",
      footer: "For African schools, by Africans",
    },
  }

  const t = text[language]

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
            <span>{t.online}</span>
          </>
        ) : (
          <>
            <WifiOff className="size-4" />
            <span>{t.offline}</span>
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
            <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>

          {/* Login Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t.login}</CardTitle>
              <CardDescription>
                {/* Language Selector */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setLanguage("fr")}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      language === "fr"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Français
                  </button>
                  <button
                    onClick={() => setLanguage("en")}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      language === "en"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    English
                  </button>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">{t.password}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t.passwordPlaceholder}
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
                    {t.rememberMe}
                  </Label>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full h-10" size="lg">
                  {t.login}
                </Button>
              </form>

              {/* Offline Mode Toggle (Demo) */}
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isOnline ? "Simuler mode hors ligne" : "Simuler mode en ligne"}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground italic">{t.footer}</p>
        </div>
      </div>
    </div>
  )
}
