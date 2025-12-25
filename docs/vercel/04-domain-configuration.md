# Domain Configuration

Set up a custom domain for your GSPN deployment.

---

## Adding a Custom Domain

### Step 1: Access Domain Settings

1. Go to your Vercel project
2. Navigate to **Settings** → **Domains**
3. Click **"Add"**

### Step 2: Enter Domain

```
Enter your domain: gspn.yourschool.edu
```

Options:
- `gspn.yourschool.edu` (subdomain)
- `yourschool.edu` (apex/root domain)
- `www.yourschool.edu` (www subdomain)

### Step 3: Configure DNS

Vercel will provide DNS records to add:

#### For Subdomain (Recommended)

Add a **CNAME** record:

| Type | Name | Value |
|------|------|-------|
| CNAME | gspn | cname.vercel-dns.com |

#### For Apex Domain

Add an **A** record:

| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |

---

## SSL Certificate

### Automatic SSL

Vercel automatically provisions SSL certificates:
- Free via Let's Encrypt
- Auto-renewed
- Supports wildcard domains

### Verification

After DNS propagation (5-60 minutes):
1. Visit `https://your-domain.com`
2. Check for padlock icon
3. Certificate shows "Let's Encrypt"

---

## DNS Configuration Examples

### Cloudflare

```
Type:  CNAME
Name:  gspn
Target: cname.vercel-dns.com
Proxy:  DNS only (gray cloud)
```

> **Important:** Disable Cloudflare proxy (orange cloud) for Vercel domains.

### Namecheap

1. Go to Domain List → Manage → Advanced DNS
2. Add new record:
   - Type: CNAME
   - Host: gspn
   - Value: cname.vercel-dns.com
   - TTL: Automatic

### Google Domains

1. Go to DNS settings
2. Add custom record:
   - Name: gspn
   - Type: CNAME
   - Data: cname.vercel-dns.com

---

## Multiple Domains

You can add multiple domains to one project:

| Domain | Purpose |
|--------|---------|
| gspn.vercel.app | Default Vercel domain |
| gspn.yourschool.edu | Primary custom domain |
| www.gspn.yourschool.edu | Redirect to primary |

### Set Primary Domain

1. In Domains settings
2. Click **"..."** next to domain
3. Select **"Set as Primary"**

---

## Update OAuth Redirect URIs

After adding a custom domain, update Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URI:

```
https://gspn.yourschool.edu/api/auth/callback/google
```

5. Update `NEXTAUTH_URL` environment variable:

```
NEXTAUTH_URL=https://gspn.yourschool.edu
```

6. Redeploy the application

---

## Troubleshooting

### DNS Not Propagating

- Wait up to 48 hours for full propagation
- Check with: `dig gspn.yourschool.edu CNAME`
- Use [DNS Checker](https://dnschecker.org)

### SSL Certificate Error

**Error:** "Invalid certificate"

**Solutions:**
1. Wait 5-10 minutes for auto-provisioning
2. Check DNS is pointing to Vercel
3. Disable any CDN proxy (Cloudflare)
4. Click "Refresh" in Vercel domains

### Domain Shows Different Site

**Cause:** DNS pointing to old hosting

**Fix:**
1. Update DNS records to Vercel
2. Remove old hosting DNS entries
3. Wait for propagation

---

## Best Practices

1. **Use HTTPS Always** - Vercel enforces this automatically
2. **Set Up WWW Redirect** - Redirect www to non-www (or vice versa)
3. **Keep Vercel Domain Active** - Good for testing/rollback
4. **Document DNS Changes** - Record who made changes and when
5. **Test After Changes** - Verify OAuth still works

---

## Checklist

- [ ] Domain added in Vercel
- [ ] DNS records configured
- [ ] SSL certificate active
- [ ] OAuth redirect URIs updated
- [ ] NEXTAUTH_URL updated
- [ ] Application redeployed
- [ ] Login flow tested

---

**Last Updated:** 2025-12-25
