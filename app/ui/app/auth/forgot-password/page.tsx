"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { CenteredFormPage } from "@/components/layout/CenteredFormPage"
import Link from "next/link"
import { useI18n } from "@/components/i18n-provider"

export default function ForgotPasswordPage() {
  const { t, locale } = useI18n()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast({
        title: t.forgotPassword?.emailRequired || "Email Required",
        description: t.forgotPassword?.enterEmail || "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          locale,
        }),
      })

      if (res.ok) {
        setIsSubmitted(true)
      } else {
        const data = await res.json()
        toast({
          title: t.common?.error || "Error",
          description: data.message || t.forgotPassword?.errorSending || "Failed to send reset email",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t.common?.error || "Network Error",
        description: t.forgotPassword?.networkError || "Please check your connection and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Success state
  if (isSubmitted) {
    return (
      <CenteredFormPage maxWidth="sm">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </div>
            <CardTitle>{t.forgotPassword?.emailSent || "Check Your Email"}</CardTitle>
            <CardDescription>
              {t.forgotPassword?.emailSentDescription ||
                "If an account with this email exists, we've sent a password reset link."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              {t.forgotPassword?.checkSpam ||
                "Don't see the email? Check your spam folder."}
            </p>
            <p className="text-sm text-center text-muted-foreground">
              {t.forgotPassword?.linkExpiry ||
                "The link will expire in 24 hours."}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.forgotPassword?.backToLogin || "Back to Login"}
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false)
                setEmail("")
              }}
              className="text-sm text-primary hover:underline"
            >
              {t.forgotPassword?.tryDifferentEmail || "Try a different email"}
            </button>
          </CardFooter>
        </Card>
      </CenteredFormPage>
    )
  }

  // Form state
  return (
    <CenteredFormPage maxWidth="sm">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">
              {t.forgotPassword?.title || "Forgot Password?"}
            </CardTitle>
            <CardDescription>
              {t.forgotPassword?.subtitle ||
                "Enter your email and we'll send you a link to reset your password."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.login?.email || "Email Address"}</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@ecole.gn"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.common?.loading || "Sending..."}
                </>
              ) : (
                t.forgotPassword?.sendResetLink || "Send Reset Link"
              )}
            </Button>
            <Link
              href="/login"
              className="text-sm text-center text-muted-foreground hover:underline flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.forgotPassword?.backToLogin || "Back to Login"}
            </Link>
          </CardFooter>
        </form>
      </Card>
    </CenteredFormPage>
  )
}
