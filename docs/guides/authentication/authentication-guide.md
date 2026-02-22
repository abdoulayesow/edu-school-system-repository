# Authentication Guide (Invite-Only)

This guide describes how authentication works in this repository **today** (as implemented in the code), how to configure it for local development and Vercel production, and how to test the invite-only flow.

## 1) What’s implemented

### Providers
- **Google OAuth** (recommended)
- **Credentials (email/password)** (supported, but only works for users that already have a password set in the database)

### Session strategy
- NextAuth uses **JWT sessions** (`strategy: "jwt"`) so middleware can enforce authentication/RBAC without database access.

### Invite-only policy (no self-registration)
The app is configured so that **users cannot self-register**.

- For **Google OAuth**, NextAuth normally auto-creates a user record on first sign-in.
- In this repo, auto-creation is **blocked** unless the email is listed in `ADMIN_EMAILS`.
- For all other users, they must be **invited first** (i.e., a user row exists in the DB).

The invite gate is enforced in:
- `app/ui/app/api/auth/[...nextauth]/route.ts` (adapter `createUser` override + `signIn` callback)

## 2) Roles and access

The app uses the `Role` enum in Prisma. The effective “administrator” role in the UI/RBAC rules is:
- `director`

Route protection is done in:
- `app/ui/middleware.ts` (authentication + RBAC redirect)
- `app/ui/lib/rbac.ts` (route-prefix allow rules)

## 3) Environment variables

### Required (local + production)
- `DATABASE_URL` – Postgres connection string (Neon pooled recommended)
- `NEXTAUTH_SECRET` – generate with `openssl rand -hex 32`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Required for invite-only bootstrap admins
- `ADMIN_EMAILS` – comma-separated list of emails allowed to bootstrap as admins via Google sign-in.

Example:
```
ADMIN_EMAILS=abdoulaye.sow.1989@gmail.com,abdoulaye.sow.co@gmail.com
```

### Recommended (production)
- `NEXTAUTH_URL` – your production URL (e.g. `https://yourdomain.com`)

## 4) Google Cloud Console configuration

Create an OAuth Client ID (Web application) and set:

### Authorized JavaScript origins
- Local: `http://localhost:8000`
- Production: `https://YOUR-VERCEL-DOMAIN.vercel.app` (or your custom domain)

### Authorized redirect URIs
- Local: `http://localhost:8000/api/auth/callback/google`
- Production: `https://YOUR-VERCEL-DOMAIN.vercel.app/api/auth/callback/google`

Copy the generated values into env vars:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## 5) Database user model notes

The Prisma `User` model includes:
- `role` (RBAC)
- `status` (`invited | active | inactive`)

Rules:
- `invited` and `active` users may sign in.
- `inactive` users are blocked.

Source of truth:
- `app/ui/prisma/schema.prisma`

## 6) How to log in (local)

1. Start the app and open: `http://localhost:8000/login`
2. Click **Sign in with Google**.

### Bootstrap admin login
If your Google account email matches one of the emails in `ADMIN_EMAILS`, your first Google sign-in will:
- create your DB user automatically
- set `role=director`
- set `status=active`

### Invited user login
If a user is not in `ADMIN_EMAILS`, they must be invited first (see next section).

## 7) Inviting users (admin)

### Admin API endpoint
- `POST /api/admin/users` (director-only)

Body:
```json
{ "email": "user@example.com", "role": "teacher", "status": "invited" }
```

### UI
- Go to `/users` as a director.
- Click **Invite User**.
- Enter email and select a role.

This currently **creates the invited user in the database**. (Email sending is not implemented yet.)

## 8) Credentials login (optional)

Credentials login works only if the user row has `passwordHash` set.

Admins can create a password-based user via the same endpoint:
```json
{ "email": "user@example.com", "role": "teacher", "password": "strong-password" }
```

## 9) Troubleshooting

### Common issues
- **Google sign-in redirects back with an error**: check Google redirect URI (must match exactly).
- **OAuth works but user is blocked**: ensure the user exists in DB (`invited` or `active`) or is in `ADMIN_EMAILS`.
- **Middleware keeps redirecting to /login**: ensure `NEXTAUTH_SECRET` is set.

## 10) Key code locations
- NextAuth config: `app/ui/app/api/auth/[...nextauth]/route.ts`
- RBAC rules: `app/ui/lib/rbac.ts`
- Route protection: `app/ui/middleware.ts`
- Admin create/invite users: `app/ui/app/api/admin/users/route.ts`
