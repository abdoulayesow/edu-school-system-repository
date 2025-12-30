"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { CenteredFormPage } from "@/components/layout/CenteredFormPage"
import Link from "next/link"

function SetPasswordInner() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const router = useRouter()
  const { toast } = useToast()

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      setValidationError("No token provided")
      return
    }

    // Validate token with API
    fetch(`/api/auth/validate-token?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setTokenValid(true)
        } else {
          setTokenValid(false)
          setValidationError(data.error || "Invalid or expired token")
        }
      })
      .catch(() => {
        setTokenValid(false)
        setValidationError("Error validating token")
      })
  }, [token])

  const validatePassword = (pwd: string): { valid: boolean; error?: string } => {
    if (pwd.length < 8) {
      return { valid: false, error: "Password must be at least 8 characters" }
    }
    if (!/[a-z]/.test(pwd)) {
      return { valid: false, error: "Password must contain a lowercase letter" }
    }
    if (!/[A-Z]/.test(pwd)) {
      return { valid: false, error: "Password must contain an uppercase letter" }
    }
    if (!/[0-9]/.test(pwd)) {
      return { valid: false, error: "Password must contain a number" }
    }
    return { valid: true }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate password strength
    const validation = validatePassword(password)
    if (!validation.valid) {
      toast({
        title: "Invalid Password",
        description: validation.error,
        variant: "destructive",
      })
      return
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are the same",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: "Password Set Successfully!",
          description: "You can now log in with your new password",
        })
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        toast({
          title: "Error setting password",
          description: data.message || "Something went wrong",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Please check your connection and try again",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Loading state while validating token
  if (tokenValid === null) {
    return (
      <CenteredFormPage maxWidth="sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Validating Token...</CardTitle>
            <CardDescription>Please wait while we verify your invitation link</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </CenteredFormPage>
    )
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <CenteredFormPage maxWidth="sm">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle>Invalid or Expired Link</CardTitle>
            <CardDescription>{validationError}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href="/login">
              <Button variant="outline">Go to Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </CenteredFormPage>
    )
  }

  // Valid token - show password form
  return (
    <CenteredFormPage maxWidth="sm">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Set Your Password</CardTitle>
            <CardDescription>
              Create a strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                At least 8 characters with uppercase, lowercase, and number
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                minLength={8}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Setting Password..." : "Set Password"}
            </Button>
            <Link href="/login" className="text-sm text-center text-muted-foreground hover:underline">
              Back to Login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </CenteredFormPage>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <SetPasswordInner />
    </Suspense>
  )
}
