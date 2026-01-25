import NextAuth, { type NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import type { AdapterUser } from "next-auth/adapters"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import { normalizeRole } from "@/lib/rbac"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

// Skip validation during CI builds to allow Next.js to compile
const isCIBuild = process.env.NEXT_PUBLIC_ENVIRONMENT === 'ci' || process.env.CI === 'true'

if (!isCIBuild) {
  // Validate required environment variables at startup
  const requiredEnvVars = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  } as const

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value.trim() === "") {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }
}

// Warn if no admin emails configured
if (ADMIN_EMAILS.length === 0) {
  console.warn("⚠️  No ADMIN_EMAILS configured - bootstrap will not work")
}

const baseAdapter = PrismaAdapter(prisma)

export const authOptions: NextAuthOptions = {
  adapter: {
    ...baseAdapter,
    async createUser(data: Omit<AdapterUser, "id">): Promise<AdapterUser> {
      const email = (data.email ?? "").trim().toLowerCase()
      console.log("🔍 createUser called with email:", email)
      console.log("🔍 ADMIN_EMAILS:", ADMIN_EMAILS)

      // Enforce invite-only by default: OAuth logins should not auto-create users.
      // Exception: allow bootstrap for explicitly allowed admin emails.
      if (!email) {
        console.error("❌ No email provided")
        throw new Error("EMAIL_REQUIRED")
      }

      // If this user already exists, NextAuth should not be calling createUser.
      // But in case of race conditions, re-check and return existing.
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        console.log("✅ User already exists, returning:", existing.email)
        return { ...existing, email: existing.email ?? email } as AdapterUser
      }

      // Allow bootstrapping initial admins via env.
      if (ADMIN_EMAILS.includes(email)) {
        console.log("✅ Email is in ADMIN_EMAILS, creating admin user")
        const newUser = await prisma.user.create({
          data: {
            email,
            name: data.name,
            image: data.image,
            role: "director",
            status: "active",
            emailVerified: data.emailVerified,
          },
        })
        console.log("✅ Admin user created:", newUser.email, "role:", newUser.role, "status:", newUser.status)
        return { ...newUser, email } as AdapterUser
      }

      // Everyone else must be invited first (pre-created in DB).
      console.error("❌ Email not in ADMIN_EMAILS, invite required")
      throw new Error("INVITE_REQUIRED")
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email
        const password = credentials?.password

        if (!email || !password) return null

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.passwordHash || user.status === "inactive") return null

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash)
        if (!passwordsMatch) return null

        // Return a NextAuth User-shaped object (avoid leaking passwordHash)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: normalizeRole(String(user.role)),
        }
      },
    }),
  ],
  session: {
    // JWT sessions allow NextAuth middleware to enforce auth/RBAC without DB access.
    strategy: "jwt",
    // Extended expiry for offline-first support (7 days)
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    // Extended JWT expiry for offline access
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Block sign-in if the user is not present in DB (invite-only).
      // Note: for OAuth, NextAuth may call adapter.createUser before callbacks.
      // We handle that in createUser (above) for hard enforcement.
      const email = (user.email ?? "").trim().toLowerCase()
      console.log("🔍 signIn callback called with email:", email)

      if (!email) {
        console.error("❌ signIn: No email provided")
        return false
      }

      const dbUser = await prisma.user.findUnique({ where: { email } })
      console.log("🔍 signIn: dbUser found:", dbUser ? `${dbUser.email} (status: ${dbUser.status})` : "null")

      if (!dbUser) {
        // Allow admin emails to proceed (createUser will handle creation)
        if (ADMIN_EMAILS.includes(email)) {
          console.log("✅ signIn: Admin email not in DB, allowing createUser to run")
          return true
        }
        console.error("❌ signIn: User not found in database and not an admin email")
        return false
      }

      // Sync Google profile data to existing user (name and image)
      if (account?.provider === "google" && profile) {
        const googleProfile = profile as { name?: string; picture?: string }
        const updates: { name?: string; image?: string } = {}

        // Always sync name from Google if available
        if (googleProfile.name && googleProfile.name !== dbUser.name) {
          updates.name = googleProfile.name
        }

        // Always sync image from Google if available
        if (googleProfile.picture && googleProfile.picture !== dbUser.image) {
          updates.image = googleProfile.picture
        }

        if (Object.keys(updates).length > 0) {
          console.log("🔄 signIn: Syncing Google profile data:", updates)
          await prisma.user.update({
            where: { id: dbUser.id },
            data: updates,
          })
        }
      }

      // Allow invited or active users; block inactive.
      const allowed = dbUser.status !== "inactive"
      console.log(allowed ? "✅ signIn: Access allowed" : "❌ signIn: Access denied (inactive user)")
      return allowed
    },

    async jwt({ token, user }) {
      // On sign-in, persist DB id/role into the token.
      if (user) {
        token.id = user.id

        // Fetch fresh user data from DB to get any synced Google profile updates
        // (signIn callback may have updated name/image before this runs)
        const freshUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { name: true, role: true, image: true, staffRole: true, schoolLevel: true, staffProfileId: true },
        })

        if (freshUser) {
          token.name = freshUser.name
          token.picture = freshUser.image
          token.role = normalizeRole(freshUser.role ?? null)
          // Permission system fields
          token.staffRole = freshUser.staffRole
          token.schoolLevel = freshUser.schoolLevel
          token.staffProfileId = freshUser.staffProfileId
        } else {
          // Fallback to user object if DB fetch fails
          const role = (user as { role?: string | null }).role
          token.role = normalizeRole(role ?? null)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role ?? "user"
        // Pass synced name and image from token (fetched from DB in jwt callback)
        if (token.name) {
          session.user.name = token.name as string
        }
        if (token.picture) {
          session.user.image = token.picture as string
        }
        // Permission system fields
        session.user.staffRole = token.staffRole
        session.user.schoolLevel = token.schoolLevel
        session.user.staffProfileId = token.staffProfileId
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

