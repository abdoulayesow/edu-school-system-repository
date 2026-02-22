# Google Cloud Console Setup Guide

This guide walks you through setting up Google OAuth authentication for the School Management System on **localhost:8000** for development testing.

## Prerequisites

- Google account (preferably one of the admin emails)
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Project environment file configured (`app/ui/.env`)

---

## Step 1: Access Google Cloud Console

1. Go to: **https://console.cloud.google.com/**
2. Sign in with your Google account

---

## Step 2: Create or Select a Project

### Option A: Create a New Project

1. Click the project dropdown in the top-left corner (next to "Google Cloud")
2. Click **"NEW PROJECT"**
3. Fill in project details:
   - **Project name:** `School Management System` (or your preferred name)
   - **Organization:** (optional, leave as "No organization" if not applicable)
4. Click **"CREATE"**
5. Wait for project creation to complete
6. Select the new project from the dropdown

### Option B: Use an Existing Project

1. Click the project dropdown in the top-left corner
2. Select your existing project from the list

---

## Step 3: Enable Google+ API

Google OAuth requires the Google+ API to fetch user profile information.

1. In the left sidebar, navigate to: **APIs & Services** > **Library**
2. In the search bar, type: `Google+ API`
3. Click on **"Google+ API"** from the search results
4. Click the **"ENABLE"** button
5. Wait for the API to be enabled

---

## Step 4: Configure OAuth Consent Screen

The OAuth consent screen is what users see when they sign in with Google.

### 4.1 Start Configuration

1. In the left sidebar, navigate to: **APIs & Services** > **OAuth consent screen**
2. Select **User Type:**
   - Choose **"External"** (allows testing with any Google account)
   - Click **"CREATE"**

### 4.2 Fill in App Information

**Tab 1: OAuth consent screen**

Fill in the following fields:

- **App name:** `School Management System`
- **User support email:** `abdoulaye.sow.1989@gmail.com` (select from dropdown)
- **App logo:** (optional, skip for development)
- **Application home page:** `http://localhost:8000`
- **Application privacy policy link:** (optional, can skip for dev)
- **Application terms of service link:** (optional, can skip for dev)
- **Authorized domains:** (leave empty for localhost testing)
- **Developer contact information:** `abdoulaye.sow.1989@gmail.com`

Click **"SAVE AND CONTINUE"**

### 4.3 Add Scopes

**Tab 2: Scopes**

1. Click **"ADD OR REMOVE SCOPES"**
2. In the modal, filter or scroll to find these scopes:
   - `userinfo.email` (View your email address)
   - `userinfo.profile` (See your personal info)
   - `openid` (should be automatically included)
3. Check the boxes next to these scopes
4. Click **"UPDATE"**
5. Verify the scopes are listed in the table
6. Click **"SAVE AND CONTINUE"**

### 4.4 Add Test Users

**Tab 3: Test users**

Since the app is in "External" mode and not published, you must add test users who are allowed to sign in during development.

1. Click **"+ ADD USERS"**
2. Enter the admin email addresses (one per line):
   ```
   abdoulaye.sow.1989@gmail.com
   abdoulaye.sow.co@gmail.com
   ```
3. Click **"ADD"**
4. Verify both emails appear in the test users list
5. Click **"SAVE AND CONTINUE"**

### 4.5 Review Summary

**Tab 4: Summary**

1. Review all the information you entered
2. Click **"BACK TO DASHBOARD"** if everything looks correct

---

## Step 5: Create OAuth 2.0 Credentials

Now you'll create the Client ID and Client Secret needed for authentication.

### 5.1 Navigate to Credentials

1. In the left sidebar, go to: **APIs & Services** > **Credentials**
2. Click the **"+ CREATE CREDENTIALS"** button at the top
3. Select **"OAuth client ID"** from the dropdown

### 5.2 Configure Web Application

1. **Application type:** Select **"Web application"**
2. **Name:** `School Management System - Dev` (or your preferred name)

### 5.3 Add Authorized JavaScript Origins

This tells Google which domains can initiate OAuth requests.

1. Under **"Authorized JavaScript origins"**, click **"+ ADD URI"**
2. Enter: `http://localhost:8000`
3. Click outside the input to confirm

### 5.4 Add Authorized Redirect URIs

This tells Google where to redirect users after successful authentication.

1. Under **"Authorized redirect URIs"**, click **"+ ADD URI"**
2. Enter: `http://localhost:8000/api/auth/callback/google`
   - ⚠️ **Important:** This must exactly match the NextAuth callback route
3. Click outside the input to confirm

### 5.5 Create Credentials

1. Click the **"CREATE"** button at the bottom
2. A modal will appear with your credentials

### 5.6 Copy Your Credentials

**IMPORTANT:** Copy these values immediately - you'll need them for your `.env` file.

- **Client ID:** (looks like `123456789-abc123.apps.googleusercontent.com`)
- **Client Secret:** (looks like `GOCSPX-abc123def456...`)

Click **"DOWNLOAD JSON"** to save a backup copy (optional but recommended)

Click **"OK"** to close the modal

---

## Step 6: Configure Environment Variables

Now you'll add the credentials to your project.

### 6.1 Open Your .env File

Navigate to your project:
```bash
cd c:\workspace\sources\edu-school-system-repository\app\ui
```

Open `.env` in your text editor.

### 6.2 Update Google OAuth Variables

Find these lines in `.env`:
```bash
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

Replace them with your actual credentials:
```bash
GOOGLE_CLIENT_ID="123456789-abc123.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123def456..."
```

**Replace the placeholder values with your actual Client ID and Client Secret from Step 5.6.**

### 6.3 Generate NEXTAUTH_SECRET

NextAuth requires a secret for signing JWT tokens. Generate one using either method:

**Method 1: Using OpenSSL (if installed)**
```bash
openssl rand -base64 32
```

**Method 2: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Method 3: Using PowerShell**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Copy the output and update `.env`:
```bash
NEXTAUTH_SECRET="YourGeneratedSecretHere123456789ABCDEF=="
```

### 6.4 Verify Environment File

Your `.env` should now have:

```bash
# Database credentials (already configured)
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."

# NextAuth configuration (newly configured)
GOOGLE_CLIENT_ID="123456789-abc123.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123def456..."
NEXTAUTH_SECRET="YourGeneratedSecretHere123456789ABCDEF=="

# Admin bootstrap (already configured)
ADMIN_EMAILS="abdoulaye.sow.1989@gmail.com,abdoulaye.sow.co@gmail.com"
```

**Save the file.**

---

## Step 7: Test the Configuration

### 7.1 Regenerate Prisma Client

```bash
npm --prefix app/ui run prisma:generate
```

**Expected output:** Success message with no errors.

### 7.2 Sync Database Schema

```bash
npx prisma db push --config=app/db/prisma.config.ts
```

**Expected output:** "The database is now in sync with your Prisma schema."

### 7.3 Start Development Server

```bash
npm --prefix app/ui run dev
```

**Expected output:**
```
▲ Next.js 16.0.10
- Local:        http://localhost:8000
✓ Ready in 2.3s
```

### 7.4 Test Admin Bootstrap Login

1. Open your browser and navigate to: **http://localhost:8000/login**
2. Click **"Sign in with Google"**
3. Select one of the admin emails:
   - `abdoulaye.sow.1989@gmail.com` OR
   - `abdoulaye.sow.co@gmail.com`
4. **Expected behavior:**
   - Google OAuth consent screen appears
   - You authorize the app
   - You're redirected to the dashboard (`/dashboard`)
   - User is created in the database with `role=director` and `status=active`

### 7.5 Verify User Creation

Check the database to confirm the user was created:

```bash
npx prisma studio --config=app/db/prisma.config.ts
```

- Navigate to the **Users** table
- Find your admin email
- Verify `role` is `director` and `status` is `active`

---

## Step 8: Test Invite-Only Enforcement

### 8.1 Test Unknown User Rejection

1. Sign out (if logged in)
2. Try to sign in with a Google account NOT in `ADMIN_EMAILS`
   - Example: Use a personal Gmail that's not one of the admin emails

**Expected behavior:**
- Google OAuth succeeds (authentication with Google)
- NextAuth rejects the login with error: `INVITE_REQUIRED`
- User is **NOT** created in the database
- User stays on login page or sees an error

### 8.2 Test User Invitation Flow

1. Log in as an admin (one of the bootstrap emails)
2. Navigate to: **http://localhost:8000/users**
3. Click **"Invite User"** button
4. Fill in the form:
   - **Email:** `test.teacher@example.com`
   - **Name:** `Test Teacher`
   - **Role:** `teacher`
   - **Password:** (leave empty for invite-only)
5. Click **"Submit"** or **"Invite"**

**Expected behavior:**
- User is created with `status=invited`
- User appears in the users list

6. Sign out and try to log in with `test.teacher@example.com` via Google OAuth

**Expected behavior:**
- Login succeeds (because user exists in DB)
- User is redirected to dashboard (or appropriate page for teacher role)

---

## Troubleshooting

### Issue: "Redirect URI mismatch" Error

**Cause:** The redirect URI in your Google Cloud credentials doesn't match NextAuth's callback URL.

**Solution:**
1. Go to Google Cloud Console > Credentials
2. Click your OAuth 2.0 Client ID
3. Verify **Authorized redirect URIs** includes: `http://localhost:8000/api/auth/callback/google`
4. Ensure there are no typos or extra slashes

---

### Issue: "Access blocked: This app's request is invalid"

**Cause:** OAuth consent screen is missing required information or scopes.

**Solution:**
1. Go to **OAuth consent screen** in Google Cloud Console
2. Verify **User support email** and **Developer contact** are filled in
3. Verify scopes include `userinfo.email` and `userinfo.profile`
4. Save changes and try again

---

### Issue: "Error: Missing required environment variable: GOOGLE_CLIENT_ID"

**Cause:** Environment variables are not loaded or have empty values.

**Solution:**
1. Check `app/ui/.env` file exists and has values for:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
2. Ensure there are no quotes or extra spaces
3. Restart the dev server after updating `.env`

---

### Issue: "This app is blocked" (Google verification warning)

**Cause:** Your app is in "External" mode but not verified by Google.

**Solution (Development):**
1. This is expected for development apps
2. Click **"Advanced"** on the warning screen
3. Click **"Go to [App Name] (unsafe)"**
4. This is safe for your own app during development

**Solution (Production):**
- Submit your app for Google verification
- Or switch to "Internal" mode (only for Google Workspace organizations)

---

### Issue: User not redirected after login

**Cause:** Middleware or NextAuth configuration issue.

**Solution:**
1. Check `app/ui/middleware.ts` allows access to `/api/auth/*`
2. Verify `NEXTAUTH_URL` in `.env` is `http://localhost:8000`
3. Check browser console for JavaScript errors

---

### Issue: "INVITE_REQUIRED" error for admin email

**Cause:** `ADMIN_EMAILS` environment variable is not set or formatted incorrectly.

**Solution:**
1. Verify `app/ui/.env` has:
   ```bash
   ADMIN_EMAILS="abdoulaye.sow.1989@gmail.com,abdoulaye.sow.co@gmail.com"
   ```
2. Ensure emails are comma-separated with no spaces
3. Ensure emails match exactly (case-insensitive, but consistent)
4. Restart the dev server after updating

---

## Security Notes for Production

When deploying to production (Vercel, etc.):

1. **Update Authorized Origins and Redirect URIs:**
   - Add production domain (e.g., `https://school.yourdomain.com`)
   - Add production callback URI (e.g., `https://school.yourdomain.com/api/auth/callback/google`)

2. **Update Environment Variables:**
   - Set `NEXTAUTH_URL` to your production URL
   - Generate a **new** `NEXTAUTH_SECRET` for production (never reuse dev secrets)
   - Keep `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (same credentials work for multiple environments if configured)

3. **Publish OAuth Consent Screen:**
   - Submit for Google verification if app is public
   - Or limit to internal users (Google Workspace only)

4. **Remove Test Users:**
   - Once published, test user restrictions are removed

5. **Enable HTTPS:**
   - OAuth requires HTTPS in production
   - Vercel automatically provides SSL certificates

---

## Next Steps

After successful configuration, you can:

1. **Test all authentication flows:**
   - Admin bootstrap login
   - Invite-only enforcement
   - User invitation and login
   - Role-based access control (RBAC)

2. **Implement additional features:**
   - Email invitation system (SendGrid, Resend)
   - User deactivation/reactivation UI
   - Password reset flow
   - Email verification

3. **Deploy to production:**
   - Follow security notes above
   - Update Google Cloud credentials for production domain
   - Test thoroughly before going live

---

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)

---

**Document Version:** 1.0
**Last Updated:** 2025-12-22
**Maintained By:** School Management System Team
