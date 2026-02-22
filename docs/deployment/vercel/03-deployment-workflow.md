# Deployment Workflow

How deployments work with Vercel and GitHub integration.

---

## Automatic Deployments

### Production Deployment

**Trigger:** Push to `main` branch

```
git push origin main
    ↓
Vercel detects push
    ↓
Builds app/ui
    ↓
Deploys to production URL
```

**URL:** `https://your-project.vercel.app`

---

### Preview Deployments

**Trigger:** Open Pull Request to `main`

```
Create PR → feature-branch → main
    ↓
Vercel creates preview deployment
    ↓
Unique URL generated
    ↓
PR comment with preview link
```

**URL:** `https://your-project-[branch]-[team].vercel.app`

**Features:**
- Every PR gets its own deployment
- Updated on each push to the PR
- Deleted when PR is closed/merged
- Great for reviewing changes before merge

---

## Manual Deployments

### From Vercel Dashboard

1. Go to Project → **Deployments**
2. Click **"Redeploy"** on any previous deployment
3. Or click **"Create Deployment"** for new deployment

### From CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from project root
cd app/ui
vercel

# Deploy to production
vercel --prod
```

---

## Deployment Configuration

### vercel.json (if needed)

Create `app/ui/vercel.json` for custom configuration:

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

---

## Build Process

### Steps

1. **Clone** - Repository cloned
2. **Install** - `npm install` runs
3. **Build** - `next build` runs
4. **Deploy** - Output deployed to CDN

### Build Time

Typical build: **2-3 minutes**

Factors affecting build time:
- Number of pages
- Dependencies
- TypeScript compilation
- Asset optimization

---

## Deployment Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Production | `main` | gspn.vercel.app | Live site |
| Preview | PR branches | Auto-generated | Review changes |
| Development | Local | localhost:8000 | Local development |

---

## Rollback

### Quick Rollback

1. Go to **Deployments** tab
2. Find a working deployment
3. Click **"..."** → **"Promote to Production"**

### Instant Rollback
Vercel keeps previous deployments active - rollback is instant.

---

## Deployment Hooks

### Webhook Notifications

Configure in Project Settings → Git → Deploy Hooks

```bash
# Trigger deployment via webhook
curl -X POST https://api.vercel.com/v1/integrations/deploy/[hook-id]
```

### GitHub Actions Integration

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./app/ui
```

---

## Monitoring Deployments

### Build Logs

View in real-time:
1. Project → Deployments
2. Click on deployment
3. View "Build Logs" tab

### Runtime Logs

1. Project → Logs
2. Filter by:
   - Function (API routes)
   - Edge (middleware)
   - Build (deployment)

---

## Best Practices

1. **Use Preview Deployments** - Test every PR before merge
2. **Monitor Build Times** - Optimize if exceeding 5 minutes
3. **Set Up Notifications** - Slack/email for failed deployments
4. **Keep Dependencies Updated** - Avoid security vulnerabilities
5. **Test Locally First** - Run `next build` before pushing

---

**Last Updated:** 2025-12-25
