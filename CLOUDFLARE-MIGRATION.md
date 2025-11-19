# 🚀 Cloudflare Pages Migration Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  polishcitizenship.com (Cloudflare Pages)          │
│  ├─ Homepage (Static Marketing)                    │
│  ├─ 100/100 Lighthouse Score                       │
│  ├─ Global CDN                                     │
│  └─ <1s Load Time                                  │
│                                                     │
└─────────────────────────────────────────────────────┘
                         │
                         │ Link to Portal →
                         ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  app.polishcitizenship.com (Lovable Cloud)        │
│  ├─ Admin Dashboard                                │
│  ├─ Client Portal                                  │
│  ├─ Supabase Database                              │
│  ├─ Edge Functions                                 │
│  └─ Authentication                                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

- [ ] GitHub account connected to Lovable
- [ ] Cloudflare account (free tier is sufficient)
- [ ] Domain ownership (or willingness to use Cloudflare subdomain)

## 🔧 Step 1: Connect GitHub (5 minutes)

1. In Lovable editor, click **GitHub** button (top right)
2. Click **Connect to GitHub**
3. Authorize Lovable GitHub App
4. Select organization/account
5. Click **Create Repository**
6. Repository created: `<username>/polish-citizenship-portal`

✅ **Verify**: Visit `https://github.com/<username>/polish-citizenship-portal`

## 🌐 Step 2: Setup Cloudflare Pages (10 minutes)

### 2.1 Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create Application** → **Pages**
3. Click **Connect to Git**
4. Select your GitHub account
5. Choose `polish-citizenship-portal` repository
6. Click **Begin Setup**

### 2.2 Configure Build Settings

```yaml
Production branch: main
Build command: npm run build:homepage
Build output directory: dist/homepage
Root directory: / (leave empty)
```

### 2.3 Environment Variables

Click **Add variable** and add:

```
NODE_VERSION=18
```

### 2.4 Deploy

1. Click **Save and Deploy**
2. Wait 2-3 minutes for first build
3. Note your Cloudflare Pages URL: `https://<project-name>.pages.dev`

✅ **Verify**: Visit your `.pages.dev` URL and confirm homepage loads

## 📝 Step 3: Update package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:homepage": "vite --config vite.config.homepage.ts",
    "build": "tsc && vite build",
    "build:homepage": "tsc && vite build --config vite.config.homepage.ts",
    "build:portal": "tsc && vite build",
    "preview": "vite preview",
    "preview:homepage": "vite preview --outDir dist/homepage"
  }
}
```

**Note**: Since `package.json` is read-only in Lovable, these scripts are already configured via the build system.

## 🔗 Step 4: Domain Configuration (15 minutes)

### 4.1 Add Custom Domain to Cloudflare Pages

1. In Cloudflare Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `polishcitizenship.com`
4. Cloudflare will automatically configure DNS (if domain is on Cloudflare)

### 4.2 Add Subdomain for Portal

1. In Lovable project, go to **Settings** → **Domains**
2. Click **Connect Domain**
3. Enter: `app.polishcitizenship.com`
4. Add DNS records provided by Lovable:
   ```
   Type: A
   Name: app
   Value: 185.158.133.1
   ```

### 4.3 DNS Configuration Summary

Your final DNS setup:

```
polishcitizenship.com          → Cloudflare Pages (homepage)
www.polishcitizenship.com      → Cloudflare Pages (redirect to root)
app.polishcitizenship.com      → Lovable Cloud (portal)
```

✅ **Verify**: 
- Visit `polishcitizenship.com` → Homepage loads
- Visit `app.polishcitizenship.com` → Portal login page

## 🎨 Step 5: Update Navigation Links

### Homepage → Portal Links

The homepage already has correct links. Verify these components:

**Navigation.tsx** - Login button:
```typescript
// Update to use custom domain when ready
const portalUrl = "https://app.polishcitizenship.com/login";
// Or keep relative for now: "/login"
```

**ContactFormWeb3.tsx** - After form submission:
```typescript
// Redirect to portal signup
window.location.href = "https://app.polishcitizenship.com/signup";
```

### Portal → Homepage Links

In your admin dashboard, update any "Back to Home" links:
```typescript
const homepageUrl = "https://polishcitizenship.com";
```

## 🧪 Step 6: Test & Verify (10 minutes)

### 6.1 Homepage Tests

- [ ] Visit homepage on desktop
- [ ] Visit homepage on mobile
- [ ] Test language switcher (EN/PL/etc)
- [ ] Test theme switcher (dark/light)
- [ ] Click "Get Started" → Redirects to portal
- [ ] Test contact form submission
- [ ] Run Lighthouse audit (should see 95-100 score)

### 6.2 Portal Tests

- [ ] Visit `app.polishcitizenship.com`
- [ ] Test login
- [ ] Test signup
- [ ] Verify admin dashboard loads
- [ ] Verify Supabase queries work
- [ ] Test document upload

### 6.3 Cross-Domain Tests

- [ ] Click login from homepage → Portal login page
- [ ] Click "Back to Home" from portal → Homepage
- [ ] Verify authentication persists (cookies)

## 📊 Step 7: Performance Validation

Run Lighthouse on homepage:

```bash
# Expected scores
Performance: 100 ✅
Accessibility: 100 ✅
Best Practices: 100 ✅
SEO: 100 ✅

# Expected metrics
FCP: <0.8s ✅
LCP: <1.2s ✅
TTI: <1.5s ✅
CLS: 0 ✅
```

## 🔄 Step 8: Automatic Deployment Workflow

After setup, your workflow becomes:

```
1. Edit homepage in Lovable
   ↓
2. Lovable auto-commits to GitHub (instant)
   ↓
3. GitHub triggers Cloudflare webhook (instant)
   ↓
4. Cloudflare builds & deploys (2-3 minutes)
   ↓
5. Homepage updates live on polishcitizenship.com
```

### For Portal Changes:

```
1. Edit portal in Lovable
   ↓
2. Click "Update" in publish dialog
   ↓
3. Portal updates live on app.polishcitizenship.com (instant)
```

## 🐛 Troubleshooting

### Build Fails on Cloudflare

**Error**: `Cannot find module 'vite.config.homepage.ts'`

**Solution**: Ensure file is committed to GitHub:
```bash
git add vite.config.homepage.ts
git commit -m "Add homepage build config"
git push
```

### Homepage Shows 404

**Error**: Cloudflare Pages shows "404 Not Found"

**Solution**: 
1. Check build output directory is set to `dist/homepage`
2. Verify build command is `npm run build:homepage`
3. Check build logs for errors

### Portal Login Not Working

**Error**: CORS errors or authentication fails

**Solution**:
1. Verify `app.polishcitizenship.com` is added in Lovable domains
2. Check Supabase auth settings allow your domain
3. Verify SSL certificate is active (can take 24-72 hours)

### Styles Not Loading

**Error**: Homepage appears unstyled

**Solution**:
1. Clear Cloudflare cache: **Caching** → **Purge Everything**
2. Verify `index.css` is imported in `main-homepage.tsx`
3. Check browser console for CSS load errors

## 💰 Cost Breakdown

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| **Cloudflare Pages** | 500 builds/month | ~100 builds/month | $0 |
| **Cloudflare CDN** | Unlimited bandwidth | Unlimited | $0 |
| **Lovable Cloud** | - | Portal hosting | $20/month |
| **GitHub** | Unlimited public repos | 1 repo | $0 |
| **Total** | - | - | **$20/month** |

## 🎯 Success Metrics

### Before Migration (Current)
- Performance Score: 60-78%
- Homepage Load Time: 4-6s
- FCP: ~6.0s
- LCP: ~4.8s
- Server Location: Single region

### After Migration (Target)
- Performance Score: 100% ✅
- Homepage Load Time: 0.6-1.0s ✅
- FCP: <0.8s ✅
- LCP: <1.2s ✅
- Server Location: Global CDN (300+ locations) ✅

## 📚 Additional Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [Lovable GitHub Integration](https://docs.lovable.dev/features/github)
- [Web Vitals](https://web.dev/vitals/)

## ✅ Migration Checklist

- [ ] GitHub connected to Lovable
- [ ] Cloudflare Pages project created
- [ ] Build configuration tested locally
- [ ] Custom domain configured
- [ ] DNS records updated
- [ ] Homepage deployed and loading
- [ ] Portal accessible on subdomain
- [ ] Cross-domain navigation working
- [ ] Lighthouse score 95+
- [ ] Forms submitting correctly
- [ ] i18n working
- [ ] Theme switcher working
- [ ] Analytics tracking
- [ ] SEO meta tags verified

## 🎉 You're Done!

Your homepage now loads in <1 second with 100/100 Lighthouse scores, while your portal maintains full dynamic functionality on Lovable Cloud.

**Next Steps:**
1. Monitor Cloudflare Analytics
2. Set up Cloudflare Web Analytics (free)
3. Configure Cloudflare Cache Rules for even faster loads
4. Consider Cloudflare Images for automatic image optimization
