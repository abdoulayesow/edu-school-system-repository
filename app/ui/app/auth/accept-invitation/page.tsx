"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/components/i18n-provider"
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Mail,
  User,
  Lock,
  Shield,
} from "lucide-react"

interface InvitationData {
  valid: boolean
  email?: string
  name?: string
  role?: string
  message?: string
}

function AcceptInvitationContent() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (token) {
      validateToken()
    } else {
      setIsLoading(false)
      setInvitationData({ valid: false, message: t.admin.acceptInvitation.noTokenProvided })
    }
  }, [token, t])

  async function validateToken() {
    try {
      const res = await fetch(`/api/auth/accept-invitation?token=${token}`)
      const data = await res.json()
      setInvitationData(data)
      if (data.name) {
        setFormData((prev) => ({ ...prev, name: data.name }))
      }
    } catch (err) {
      setInvitationData({ valid: false, message: t.admin.acceptInvitation.failedToValidate })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError(t.admin.acceptInvitation.passwordsDoNotMatch)
      return
    }

    if (formData.password.length < 8) {
      setError(t.admin.acceptInvitation.passwordMinLength)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/auth/accept-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: formData.name,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setIsSuccess(true)
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      } else {
        setError(data.message || t.admin.acceptInvitation.failedToCreateAccount)
      }
    } catch (err) {
      setError(t.admin.acceptInvitation.failedToCreateAccount)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Use role labels from i18n
  const roleLabels = t.admin.roles as Record<string, string>

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">{t.admin.acceptInvitation.validatingInvitation}</p>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t.admin.acceptInvitation.accountCreated}</h2>
            <p className="text-muted-foreground mb-4">
              {t.admin.acceptInvitation.accountCreatedDescription}
            </p>
            <Link href="/auth/login">
              <Button className="w-full">{t.admin.acceptInvitation.goToLogin}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitationData?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t.admin.acceptInvitation.invalidInvitation}</h2>
            <p className="text-muted-foreground mb-4">
              {invitationData?.message || t.admin.acceptInvitation.invalidInvitationDescription}
            </p>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">{t.admin.acceptInvitation.goToLogin}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">{t.admin.acceptInvitation.pageTitle}</CardTitle>
          <CardDescription>
            {t.admin.acceptInvitation.pageDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{invitationData.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Badge>{roleLabels[invitationData.role || ""] || invitationData.role}</Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                <User className="h-4 w-4 inline mr-2" />
                {t.admin.acceptInvitation.fullName}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                <Lock className="h-4 w-4 inline mr-2" />
                {t.admin.acceptInvitation.password}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                <Lock className="h-4 w-4 inline mr-2" />
                {t.admin.acceptInvitation.confirmPassword}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-3 rounded">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t.admin.acceptInvitation.createAccount}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            {t.admin.acceptInvitation.alreadyHaveAccount}{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              {t.admin.acceptInvitation.signIn}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  )
}
