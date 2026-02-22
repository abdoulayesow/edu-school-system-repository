# Vercel Initial Setup

Step-by-step guide to set up GSPN School Management System on Vercel.

---

## Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

---

## Step 2: Import GitHub Repository

1. From Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Select your GitHub repository: `edu-school-system-repository`
3. Click **"Import"**

---

## Step 3: Configure Project Settings

### Root Directory
```
Root Directory: app/ui
```
> Important: The Next.js app is in `app/ui`, not the repository root.

### Framework Preset
```
Framework: Next.js (auto-detected)
```

### Build & Output Settings
Leave as defaults:
```
Build Command: next build
Output Directory: .next
Install Command: npm install
```

### Node.js Version
```
Node.js Version: 20.x
```

---

## Step 4: Add Environment Variables

Before deploying, add these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon pooled connection string | `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_URL` | Full production URL | `https://gspn.vercel.app` |
| `NEXTAUTH_SECRET` | Random 32+ char string | `your-super-secret-key-at-least-32-chars` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | `GOCSPX-xxxxx` |
| `ADMIN_EMAILS` | Comma-separated admin emails | `admin@example.com,director@school.edu` |

### Adding Variables

1. In Project Settings → **Environment Variables**
2. Add each variable with:
   - **Name**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Variable value
   - **Environment**: Select all (Production, Preview, Development)
3. Click **"Save"**

---

## Step 5: Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (~2-3 minutes)
3. Access your app at: `https://your-project.vercel.app`

---

## Step 6: Verify Deployment

### Check List
- [ ] App loads without errors
- [ ] Login page displays correctly
- [ ] Google OAuth redirects work
- [ ] API routes respond (check `/api/health`)
- [ ] Database connection works (grades load)

### Test URLs
```
https://your-project.vercel.app/
https://your-project.vercel.app/login
https://your-project.vercel.app/api/health
```

---

## Common Issues

### Build Fails: "Cannot find module"
**Cause**: Root directory not set correctly
**Fix**: Set Root Directory to `app/ui`

### Build Fails: "Environment variable not found"
**Cause**: Missing required variables
**Fix**: Add all variables listed in Step 4

### Runtime Error: "Invalid DATABASE_URL"
**Cause**: Using unpooled connection string
**Fix**: Use the pooled connection URL from Neon

---

## Next Steps

1. [Configure Environment Variables](02-environment-variables.md)
2. [Set Up Deployment Workflow](03-deployment-workflow.md)
3. [Configure Custom Domain](04-domain-configuration.md)

---

**Last Updated:** 2025-12-25
