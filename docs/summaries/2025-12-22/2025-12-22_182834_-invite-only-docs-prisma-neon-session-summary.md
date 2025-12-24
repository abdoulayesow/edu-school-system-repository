# Session Summary — 2025-12-22 (Auth invite-only + docs refresh + Neon/Prisma fixes)

This summary captures the work completed in this chat after the conversation reset (“clear”). The focus was to ensure authentication works, enforce **invite-only access** (no public registration), bootstrap two admin accounts, update documentation, and get the project runnable against **Neon Postgres** with **Prisma v7**.

## Goals requested

1. Validate authentication and explain how to log in.
2. Ensure `abdoulaye.sow.1989@gmail.com` and `abdoulaye.sow.co@gmail.com` are administrators with full access.
3. Disable self-registration; users can only be invited by an admin.
4. Clarify configuration needed in Vercel/GitHub/Google Cloud Console.
5. Create an authentication guide under `docs/authentication/`, review/update docs under `docs/database/` and `docs/authentication/`.
6. Run the project so testing can begin.

## Key changes delivered

### A) Invite-only authentication (Google OAuth gated)

**What changed**
- Enforced “invite-only” behavior for Google OAuth so unknown emails cannot auto-create accounts.
- Added bootstrap support for initial admin creation via `ADMIN_EMAILS`.

**Implementation details**
- File: `app/ui/app/api/auth/[...nextauth]/route.ts`
  - Wrapped the Prisma adapter and overrode `createUser`:
    - If email is in `ADMIN_EMAILS`, allow creation as an admin (`role=director`, `status=active`).
    - Otherwise throw `INVITE_REQUIRED` so OAuth can’t auto-register users.
  - Added a `signIn` callback gate:
    - Allows sign-in only if user exists in DB and `status != inactive`.

**Result**
- Users cannot self-register through Google OAuth.
- Admins listed in `ADMIN_EMAILS` can bootstrap themselves by logging in once.

### B) User lifecycle: `UserStatus` added

**What changed**
- Added a `UserStatus` enum and `User.status` field.

**Values**
- `invited` — user created/invited but not yet active (still allowed to sign in)
- `active` — normal active user (allowed to sign in)
- `inactive` — blocked from signing in

**Files**
- `app/ui/prisma/schema.prisma`
- `app/db/prisma/schema.prisma`

### C) Invite endpoint + UI wiring

**Admin-only endpoint**
- `POST /api/admin/users` (`app/ui/app/api/admin/users/route.ts`)
  - Uses service `app/api/users/createUser.ts`
  - Accepts `status` in request body.
  - When no password is supplied, `createUser` defaults to `status=invited`.

**Users page UI**
- File: `app/ui/app/users/page.tsx`
  - Implemented `handleInviteUser` to call `/api/admin/users`.
  - Fixed the page to use React state for `users` (so invites can be appended).

### D) Documentation updates

**New guide created**
- `docs/authentication/authentication-guide.md`
  - Practical, code-accurate guide:
    - Invite-only behavior
    - `ADMIN_EMAILS` bootstrap
    - How to invite users
    - Google Cloud Console + Vercel env vars
    - Troubleshooting

**Updated existing docs**
- `docs/authentication/authentication-setup.md`
  - Updated localhost origin/redirect to port **8000**
  - Removed obsolete `/api/register` references and replaced with `/api/admin/users`
  - Added `ADMIN_EMAILS` + production notes
  - Updated Prisma CLI instructions for Prisma v7 config usage

- `docs/authentication/authentication-strategy.md`
  - Updated to reflect current session strategy: **JWT** (not DB sessions)

- `docs/database/database-schema.md`
  - Updated headline/notes to reflect current runtime: **Prisma + Postgres (Neon)**
  - Flagged older Drizzle/Turso/offline-first parts as historical/possibly obsolete

### E) Prisma v7 + Neon connectivity fixes

**Problem encountered**
- `prisma db push` initially failed due to connection issues and Prisma CLI not loading env vars.

**Fixes applied**
- Prisma v7 uses `app/db/prisma.config.ts` for CLI config.
- Updated `app/db/prisma.config.ts` to:
  - load env vars from `app/ui/.env` via `dotenv` (so Prisma CLI sees DB variables)
  - fix schema path resolution
  - prefer `DATABASE_URL_UNPOOLED` for schema operations (Neon best practice)

**Outcome**
- `npx prisma db push --config=app/db/prisma.config.ts` succeeded.

## How to test (current state)

### Required env vars
In `app/ui/.env` ensure these are set:
- `DATABASE_URL` (Neon pooled)
- `DATABASE_URL_UNPOOLED` (Neon direct/unpooled)
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ADMIN_EMAILS=abdoulaye.sow.1989@gmail.com,abdoulaye.sow.co@gmail.com`

### Run commands
- Prisma schema sync:
  - `npx prisma db push --config=app/db/prisma.config.ts`
- Prisma client generation:
  - `npm --prefix app/ui run prisma:generate`
- Start UI:
  - `npm --prefix app/ui run dev` (serves on `http://localhost:8000`)

### Login flow
1. Open `http://localhost:8000/login`.
2. Sign in with Google using one of the admin emails above.
   - First login bootstraps the user as `director` and `active`.
3. Navigate to `/users` and invite another email.
4. That invited email can now sign in with Google.

## Notes / follow-ups

- “Invite” currently means “create a DB record with status=invited” — there is no email sending yet.
- If you want password-based users, admins can create a user with `password`, which will set `status=active`.
- Consider adding:
  - an email invite system (SendGrid/Resend)
  - UI actions to deactivate/reactivate users (`status` updates)

---

## Resume Prompt (for Claude)

```text
You are Claude, an expert Next.js (App Router) + NextAuth + Prisma v7 engineer.

Context:
- Repo is a school management system.
- Next.js UI app is in `app/ui` and runs on port 8000.
- Authentication uses NextAuth at `app/ui/app/api/auth/[...nextauth]/route.ts`.
- Session strategy is JWT.
- RBAC is enforced by middleware `app/ui/middleware.ts` and route rules in `app/ui/lib/rbac.ts`.

Invite-only auth requirement:
- Users must NOT be able to self-register.
- Google OAuth sign-in is allowed only if the user exists in the database OR their email is in `ADMIN_EMAILS`.
- The PrismaAdapter is wrapped and `createUser` is overridden to prevent OAuth auto-creation unless email is in `ADMIN_EMAILS`.
- `ADMIN_EMAILS` is a comma-separated env var. Initial admins:
  - abdoulaye.sow.1989@gmail.com
  - abdoulaye.sow.co@gmail.com
- Admin bootstrap: when an admin email signs in for the first time, create a user with `role=director` and `status=active`.

User lifecycle:
- Prisma enum `UserStatus` added: `invited | active | inactive`.
- `User.status` defaults to `active`.
- `signIn` callback blocks users whose status is `inactive`.

Inviting users:
- Admin-only endpoint: `POST /api/admin/users` (director-only) at `app/ui/app/api/admin/users/route.ts`.
- Endpoint uses service `app/api/users/createUser.ts`.
- If password omitted, create user with `status=invited`.
- `/users` page UI (`app/ui/app/users/page.tsx`) calls this endpoint in `handleInviteUser`.

Documentation:
- New guide: `docs/authentication/authentication-guide.md`.
- Updated docs: `docs/authentication/authentication-setup.md`, `docs/authentication/authentication-strategy.md`, `docs/database/database-schema.md`.

Prisma v7 + Neon:
- Prisma CLI uses `app/db/prisma.config.ts`.
- Config loads env vars from `app/ui/.env` using dotenv.
- Config prefers `DATABASE_URL_UNPOOLED` for schema operations.
- `npx prisma db push --config=app/db/prisma.config.ts` succeeds.

What I want you to do next:
1) Review the new/updated docs for accuracy and completeness.
2) Verify the invite-only auth is robust (especially around NextAuth adapter behavior and callback order).
3) Propose and implement the next incremental improvements:
   - optional: add "deactivate user" functionality and block login
   - optional: add email invitation sending and an accept-invite flow
   - optional: add tests for invite-only behavior

Please inspect the repo first, then propose the safest next steps, and implement them.
```
