# Vercel Troubleshooting Guide

Common issues and solutions for GSPN deployment.

---

## Build Errors

### Error: "Cannot find module 'xyz'"

**Cause:** Missing dependency or wrong import path

**Solutions:**
1. Check `package.json` includes the dependency
2. Verify import paths are correct
3. Run `npm install` locally to test
4. Clear Vercel cache: Deployments → Redeploy → "Redeploy with existing Build Cache" unchecked

---

### Error: "Root directory not found"

**Cause:** Root directory not set correctly

**Solution:**
1. Project Settings → General
2. Set Root Directory: `app/ui`
3. Redeploy

---

### Error: "next build failed"

**Cause:** TypeScript or build errors

**Solutions:**
1. Run `npm run build` locally to see errors
2. Fix TypeScript errors
3. Check for missing environment variables
4. Review build logs in Vercel

---

### Error: "NEXT_PUBLIC_* not defined"

**Cause:** Environment variables not set

**Solution:**
1. Add missing variables in Project Settings → Environment Variables
2. Ensure variable names match exactly
3. Redeploy after adding variables

---

## Runtime Errors

### Error: "Invalid DATABASE_URL"

**Cause:** Connection string format incorrect or using unpooled URL

**Solutions:**
1. Use **pooled** connection string from Neon
2. Format: `postgresql://user:pass@host/db?sslmode=require`
3. Verify in Vercel Environment Variables
4. Redeploy

**Neon Connection Strings:**
```
Pooled:   postgresql://...@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
Unpooled: postgresql://...@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true

✅ Use Pooled for Vercel
```

---

### Error: "NEXTAUTH_URL mismatch"

**Cause:** OAuth redirect doesn't match configured URL

**Solutions:**
1. Set `NEXTAUTH_URL` to exact production URL
2. Include protocol: `https://your-domain.vercel.app`
3. No trailing slash
4. Update Google OAuth redirect URIs to match

---

### Error: "OAuth callback error"

**Cause:** Google OAuth misconfigured

**Solutions:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Check authorized redirect URIs include:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```
3. Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
4. Check OAuth consent screen is configured

---

### Error: "Database connection timeout"

**Cause:** Neon database hibernating or connection issues

**Solutions:**
1. Wake up database by accessing Neon dashboard
2. Use pooled connection (handles hibernation better)
3. Check Neon status page for outages
4. Verify DATABASE_URL is correct

---

## Deployment Issues

### Deployment Stuck

**Cause:** Build hanging or resource limits

**Solutions:**
1. Cancel deployment
2. Check for infinite loops in build scripts
3. Reduce build complexity
4. Contact Vercel support if persistent

---

### Preview Deployment Not Working

**Cause:** Git integration issues

**Solutions:**
1. Check GitHub app permissions
2. Verify branch is not protected
3. Re-authorize Vercel GitHub app
4. Check for deployment skips in vercel.json

---

### Slow Deployments

**Cause:** Large dependencies or assets

**Solutions:**
1. Review bundle size: `npm run build` → check output
2. Remove unused dependencies
3. Optimize images
4. Use dynamic imports for large components

---

## Performance Issues

### Slow API Routes

**Cause:** Cold starts or database latency

**Solutions:**
1. Use edge runtime for latency-sensitive routes
2. Implement caching
3. Optimize database queries
4. Consider connection pooling

---

### High Bandwidth Usage

**Cause:** Large assets or no caching

**Solutions:**
1. Enable image optimization
2. Use CDN for static assets
3. Implement proper cache headers
4. Compress responses

---

## Debugging

### View Logs

```
Project → Logs → Filter by function/edge/build
```

### Local Build Test

```bash
cd app/ui
npm run build
npm start
```

### Check Environment Variables

```bash
# In Vercel CLI
vercel env ls
```

### DNS Check

```bash
# Check CNAME record
dig your-domain.com CNAME

# Check A record
dig your-domain.com A
```

---

## Quick Fixes Checklist

- [ ] Root directory set to `app/ui`
- [ ] All environment variables added
- [ ] DATABASE_URL uses pooled connection
- [ ] NEXTAUTH_URL matches deployment URL (no trailing slash)
- [ ] Google OAuth redirect URIs updated
- [ ] Build passes locally (`npm run build`)
- [ ] Node version set to 20.x

---

## Getting Help

### Vercel Support
- [Vercel Status](https://vercel-status.com)
- [Vercel Support](https://vercel.com/support)

### Neon Support
- [Neon Status](https://neonstatus.com)
- [Neon Community](https://community.neon.tech)

### Next.js
- [Next.js Docs](https://nextjs.org/docs)
- [Next.js Discord](https://discord.gg/nextjs)

---

**Last Updated:** 2025-12-25
