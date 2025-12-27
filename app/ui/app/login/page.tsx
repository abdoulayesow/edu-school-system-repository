"use client"

import { signIn, useSession } from "next-auth/react"
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
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import {
  WifiOff,
  Users,
  Calculator,
  CalendarCheck,
  Shield,
  GraduationCap,
  Loader2,
} from "lucide-react"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white text-sm">{title}</h3>
        <p className="text-white/70 text-xs mt-1">{description}</p>
      </div>
    </div>
  )
}

function LoginInner() {
  const { t } = useI18n()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const { status } = useSession()
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl)
    }
  }, [status, router, callbackUrl])

  // Show loading spinner while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        setError(t.login?.invalidCredentials || "Invalid email or password")
      } else if (result?.ok) {
        router.push(callbackUrl)
      }
    } catch (err) {
      setError(t.login?.loginError || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl })
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding & Features (hidden on mobile, shown on lg+) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 lg:p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo & School Name */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {t.login?.schoolName || "Groupe Scolaire Prive de Nongo"}
              </h1>
              <p className="text-white/80 text-sm">
                {t.login?.schoolTagline || "Excellence in Education"}
              </p>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="mb-12">
            <h2 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
              {t.login?.welcomeTitle || "Welcome to the School Management System"}
            </h2>
            <p className="text-white/80 text-lg max-w-lg">
              {t.login?.welcomeSubtitle || "A comprehensive platform for managing enrollments, attendance, accounting, and more."}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-w-2xl">
            <FeatureCard
              icon={<WifiOff className="w-5 h-5" />}
              title={t.login?.featureOffline || "Offline Mode"}
              description={t.login?.featureOfflineDesc || "Work without internet. Data syncs automatically when online."}
            />
            <FeatureCard
              icon={<Users className="w-5 h-5" />}
              title={t.login?.featureEnrollment || "Student Enrollment"}
              description={t.login?.featureEnrollmentDesc || "Easy 6-step enrollment wizard with payment tracking."}
            />
            <FeatureCard
              icon={<Calculator className="w-5 h-5" />}
              title={t.login?.featureAccounting || "Financial Control"}
              description={t.login?.featureAccountingDesc || "Full payment tracking with receipts and reconciliation."}
            />
            <FeatureCard
              icon={<CalendarCheck className="w-5 h-5" />}
              title={t.login?.featureAttendance || "Attendance"}
              description={t.login?.featureAttendanceDesc || "Mobile-first attendance tracking with reports."}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-2 text-white/60 text-sm mt-8">
          <Shield className="w-4 h-4" />
          <span>{t.login?.securityNote || "Secure and trusted by schools across Guinea"}</span>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Header (shown only on mobile) */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              {t.login?.schoolName || "Groupe Scolaire Prive de Nongo"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t.login?.schoolTagline || "Excellence in Education"}
            </p>
          </div>

          <Card className="border-0 shadow-xl lg:shadow-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">
                {t.login?.signInTitle || "Sign In"}
              </CardTitle>
              <CardDescription>
                {t.login?.signInSubtitle || "Access the School Management System"}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleCredentialsLogin}>
              <CardContent className="space-y-4">
                {/* Error Alert */}
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">{t.login?.email || "Email"}</Label>
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t.login?.password || "Password"}</Label>
                    <a
                      href="/auth/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      {t.login?.forgotPassword || "Forgot password?"}
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t.common?.loading || "Loading..."}
                    </>
                  ) : (
                    t.login?.signInButton || "Sign In"
                  )}
                </Button>

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      {t.login?.orContinueWith || "Or continue with"}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {t.login?.signInWithGoogle || "Sign in with Google"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Mobile Feature Highlights */}
          <div className="lg:hidden mt-8 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <WifiOff className="w-4 h-4 text-primary" />
              <span>{t.login?.featureOfflineShort || "Works Offline"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 text-primary" />
              <span>{t.login?.featureEnrollmentShort || "Easy Enrollment"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calculator className="w-4 h-4 text-primary" />
              <span>{t.login?.featureAccountingShort || "Payment Tracking"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarCheck className="w-4 h-4 text-primary" />
              <span>{t.login?.featureAttendanceShort || "Attendance"}</span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            {t.login?.footerText || "© 2025 GSPN. All rights reserved."}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <LoginInner />
    </Suspense>
  )
}
