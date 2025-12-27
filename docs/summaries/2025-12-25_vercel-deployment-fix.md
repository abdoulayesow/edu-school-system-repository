# Vercel Deployment Fix - December 25, 2025

## Problem Statement
Vercel deployments were failing with the error:
```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json
```

**Root Cause**: 23 dependencies were added to `package.json` using `npm`, but the project had a `pnpm-lock.yaml` file, causing a lockfile mismatch.

---

## Solution Implemented

### 1. **Removed pnpm-lock.yaml**
- Deleted `app/ui/pnpm-lock.yaml` 
- Project now uses `npm` exclusively (matching the existing `package-lock.json`)

### 2. **Fixed Workspace Root Warning**
- Added `outputFileTracingRoot: path.join(process.cwd(), "../../")` to `app/ui/next.config.mjs`
- This tells Next.js where the monorepo root is located
- Eliminates the "multiple lockfiles detected" warning

### 3. **Added npm Configuration**
- Created `.npmrc` at repository root
- Ensures consistent npm behavior

### 4. **Created Deployment Documentation**
- Added `docs/vercel/DEPLOYMENT_CHECKLIST.md` with:
  - Complete Vercel dashboard settings verification
  - Environment variables checklist
  - Deployment steps
  - Troubleshooting guide

---

## Changes Made

### Files Modified:
```
✓ app/ui/next.config.mjs          - Added outputFileTracingRoot
✓ app/ui/pnpm-lock.yaml           - DELETED
✓ .npmrc                          - CREATED
✓ docs/vercel/DEPLOYMENT_CHECKLIST.md - CREATED
✓ app/ui/.gitignore               - Auto-updated by vercel link
```

### Commit:
```bash
commit c0e4b7b
fix: configure project for npm-based Vercel deployments

- Remove pnpm-lock.yaml to fix frozen-lockfile error
- Add outputFileTracingRoot to next.config.mjs for monorepo support
- Add .npmrc for npm configuration
- Add deployment checklist documentation
```

### Branch:
- **Current**: `feature/ux-ui-improvements`
- **Pushed to**: GitHub origin

---

## Vercel Project Configuration

### Project Details:
- **Project Name**: edu-school-gspn (linked to "ui" in dashboard)
- **Project ID**: `prj_c6Hy8QPjOxmtifviN34h6E35h5VX`
- **Organization**: abdoulaye-s-projects-0014e1a2
- **URL**: https://vercel.com/abdoulaye-s-projects-0014e1a2/edu-school-gspn

### Required Settings (Verify in Dashboard):

**Root Directory:**
```
app/ui
```

**Build Command:**
```
next build
```

**Install Command:**
```
npm install
```

**Environment Variables Required:**
- `DATABASE_URL` - Neon PostgreSQL (pooled connection)
- `NEXTAUTH_URL` - Production URL
- `NEXTAUTH_SECRET` - 32+ character secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `ADMIN_EMAILS` - Comma-separated admin emails

---

## Next Steps

### Immediate Actions:
1. ✅ **Monitor Deployment** 
   - Go to: https://vercel.com/abdoulaye-s-projects-0014e1a2/edu-school-gspn
   - Check "Deployments" tab
   - Watch build logs for the new deployment

2. ⏳ **Verify Vercel Settings**
   - Open deployment checklist: `docs/vercel/DEPLOYMENT_CHECKLIST.md`
   - Follow the verification steps
   - Ensure all environment variables are set

3. ⏳ **Test Deployment**
   - Once deployed, verify:
     - Homepage loads
     - Login page works
     - Google OAuth functions
     - Database queries succeed
     - API health check responds

### If Deployment Succeeds:
- ✅ Merge `feature/ux-ui-improvements` to `main`
- ✅ Test production deployment from `main` branch
- ✅ Update Google OAuth redirect URIs with production domain
- ✅ Run full acceptance testing

### If Deployment Still Fails:
- Check build logs in Vercel dashboard
- Review error messages
- Consult: `docs/vercel/05-troubleshooting.md`
- Verify environment variables are set correctly
- Check that Root Directory is set to `app/ui`

---

## Technical Details

### Why This Fix Works:

1. **Lockfile Consistency**: By removing `pnpm-lock.yaml` and using only `package-lock.json`, Vercel will use `npm` consistently.

2. **Monorepo Support**: The `outputFileTracingRoot` configuration tells Next.js to include files from outside the `app/ui` directory (specifically `app/db` and `app/api` packages).

3. **Build Process**: Vercel will now:
   - Detect `package-lock.json` → Use npm
   - Run `npm install` → Install dependencies
   - Run `next build` → Build the application
   - Trace dependencies from monorepo root
   - Deploy successfully

### Previous Error Explained:
```
Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date
```
- Vercel detected `pnpm-lock.yaml` and tried to use `pnpm`
- In CI environments, `pnpm` uses `--frozen-lockfile` by default
- 23 dependencies in `package.json` weren't in `pnpm-lock.yaml`
- Installation failed

---

## Lessons Learned

1. **Consistency Matters**: Use ONE package manager (npm, pnpm, or yarn) throughout the project
2. **Lockfile Sync**: Always commit updated lockfiles when adding dependencies
3. **Monorepo Configuration**: Workspace projects need special Next.js configuration
4. **Documentation**: Keep deployment checklists updated for troubleshooting

---

## Related Documentation

- [Vercel Deployment Checklist](../vercel/DEPLOYMENT_CHECKLIST.md)
- [Vercel Initial Setup](../vercel/01-initial-setup.md)
- [Environment Variables](../vercel/02-environment-variables.md)
- [Troubleshooting](../vercel/05-troubleshooting.md)
- [Next.js Output Configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)

---

## Status

✅ **Code Changes**: Complete  
✅ **Committed**: Yes (c0e4b7b)  
✅ **Pushed**: Yes (feature/ux-ui-improvements)  
⏳ **Deployment**: Monitoring  
⏳ **Verification**: Pending  

---

**Session Date**: December 25, 2025  
**Developer**: Rovo Dev  
**Client**: Abdoulaye Sow  
**Project**: GSPN School Management System
