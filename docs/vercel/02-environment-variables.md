# Environment Variables for Vercel

Complete reference for all environment variables required in production.

---

## Required Variables

### Database

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL pooled connection string |

**Format:**
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

**Example:**
```
DATABASE_URL=postgresql://neondb_owner:abc123@ep-quiet-morning-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
```

> **Important:** Use the **pooled** connection string (not unpooled) for serverless environments.

---

### Authentication

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_URL` | Yes | Full URL of production site |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT signing (32+ chars) |

**Examples:**
```
NEXTAUTH_URL=https://gspn.vercel.app
NEXTAUTH_SECRET=your-very-long-secret-key-at-least-32-characters
```

**Generate Secret:**
```bash
openssl rand -base64 32
```

---

### Google OAuth

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | Yes | OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | OAuth 2.0 Client Secret |

**Setup Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-domain/api/auth/callback/google`
4. Copy Client ID and Secret

**Examples:**
```
GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
```

---

### Admin Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_EMAILS` | Yes | Comma-separated list of admin emails |

**Example:**
```
ADMIN_EMAILS=admin@school.edu,director@school.edu
```

> Users with these emails are auto-granted admin access on first login.

---

## Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | NEXTAUTH_URL | Public-facing app URL |
| `NEXT_PUBLIC_ENVIRONMENT` | production | Environment name |

---

## Environment-Specific Configuration

### Production
All variables are required. Use production database and OAuth credentials.

### Preview (PR Deployments)
Same variables as production, but can use staging database if available.

### Development
Use local `.env` file with development credentials.

---

## Security Best Practices

1. **Never commit secrets** - Use Vercel environment variables
2. **Rotate secrets regularly** - Update NEXTAUTH_SECRET periodically
3. **Use different credentials** per environment
4. **Restrict Google OAuth** - Only allow your domain's redirect URIs
5. **Monitor access** - Review admin email list regularly

---

## Vercel Dashboard Location

```
Project Settings → Environment Variables
```

Add each variable with:
- Production: ✅
- Preview: ✅
- Development: Optional

---

## Verification

After setting variables, verify by:

1. Triggering a new deployment
2. Checking build logs for missing variable errors
3. Testing OAuth login flow
4. Confirming database queries work

---

**Last Updated:** 2025-12-25
