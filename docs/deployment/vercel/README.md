# Vercel Deployment Documentation

Complete guide for deploying the GSPN School Management System to Vercel.

## Quick Links

| Document | Description |
|----------|-------------|
| [01-initial-setup.md](01-initial-setup.md) | Create account, link repo, configure project |
| [02-environment-variables.md](02-environment-variables.md) | Required environment variables |
| [03-deployment-workflow.md](03-deployment-workflow.md) | Automatic and manual deployments |
| [04-domain-configuration.md](04-domain-configuration.md) | Custom domain and SSL setup |
| [05-troubleshooting.md](05-troubleshooting.md) | Common issues and solutions |

---

## Deployment Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   GitHub Repo   │────▶│     Vercel      │────▶│   Production    │
│   (main branch) │     │   (Build+Deploy)│     │   (gspn.app)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │
        │                        ├── Preview deployments (PRs)
        │                        └── Production deployment (main)
        │
        ▼
┌─────────────────┐
│  Neon Database  │
│  (PostgreSQL)   │
└─────────────────┘
```

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub repository with the codebase
- [ ] Neon PostgreSQL database created
- [ ] Google OAuth credentials configured
- [ ] Domain name (optional, for custom domain)

---

## Quick Start

### 1. Create Vercel Account
Sign up at [vercel.com](https://vercel.com) using your GitHub account.

### 2. Import Project
```
1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Set Root Directory to: app/ui
4. Framework: Next.js (auto-detected)
```

### 3. Configure Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:
```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-32-char-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
ADMIN_EMAILS=admin@example.com
```

### 4. Deploy
Push to `main` branch - Vercel automatically deploys.

---

## Architecture

| Component | Service | Purpose |
|-----------|---------|---------|
| Frontend | Vercel | Next.js hosting, CDN, edge functions |
| Database | Neon | Serverless PostgreSQL |
| Auth | NextAuth.js | OAuth + credentials authentication |
| Storage | Vercel Blob (future) | File uploads |

---

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Neon Documentation](https://neon.tech/docs)

---

**Last Updated:** 2025-12-25
**Status:** Ready for production deployment
