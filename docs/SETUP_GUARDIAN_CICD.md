# 🚀 Mobile-First Guardian CI/CD Setup

## Automated Installation

Since `package.json` is managed by the system, add these scripts manually after exporting to GitHub:

### Step 1: Export to GitHub

1. Click **GitHub** button in top-right of Lovable
2. Click **Connect to GitHub**
3. Authorize and create repository

### Step 2: Add Scripts to package.json

After cloning your repo locally, add these to `package.json`:

```json
{
  "scripts": {
    "mobile-guardian-ci": "node scripts/mobile-guardian-ci.mjs",
    "pre-deploy": "bash scripts/pre-deploy-check.sh"
  }
}
```

### Step 3: Make Script Executable

```bash
chmod +x scripts/pre-deploy-check.sh
```

### Step 4: Add GitHub Secrets

1. Go to: **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://oogmuakyqadpynnrasnd.supabase.co`

4. Add:
   - Name: `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZ211YWt5cWFkcHlubnJhc25kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTE1NzIsImV4cCI6MjA3NTE2NzU3Mn0.r7ftd-s-PI5TJFTjhIrkeq32aqnq-BALz0eoJe5oRD0`

### Step 5: Test Locally

```bash
# Pull latest code
git pull

# Install dependencies
npm install

# Test Guardian scan
npm run mobile-guardian-ci
```

### Step 6: First Push

```bash
git add .
git commit -m "Add Mobile-First Guardian CI/CD"
git push
```

GitHub Actions will now run on every push!

---

## 📂 What Was Created

✅ `.github/workflows/mobile-first-guardian.yml` - GitHub Actions workflow
✅ `scripts/mobile-guardian-ci.mjs` - CI/CD scanner script  
✅ `scripts/pre-deploy-check.sh` - Pre-deployment hook
✅ `docs/MOBILE_GUARDIAN_CICD.md` - Full documentation

---

## 🧪 Testing

### Test in Lovable (No Export Needed)

Visit: [/mobile-guardian](/mobile-guardian) and click **Run Full Scan**

### Test Locally (After Export)

```bash
npm run mobile-guardian-ci
```

Expected output:
```
🛡️  Mobile-First Guardian CI/CD Scanner v1.0
📂 Scanning mobile-critical files...
Found 5 files to analyze
📄 Report saved to mobile-guardian-report.json

📱 MOBILE-FIRST GUARDIAN CI/CD REPORT
============================================================
OVERALL SCORE: XX/100
COMPLIANCE: ...
```

---

## ⚙️ How It Works

1. **On Push/PR** → GitHub Actions triggers
2. **Scan Files** → Guardian analyzes mobile-critical code
3. **Generate Report** → JSON report saved as artifact
4. **Check Score** → Compare to 80/100 threshold
5. **Block/Allow** → Exit 1 (block) or Exit 0 (allow)
6. **PR Comment** → Post results on pull requests

---

## 🎯 Next Steps

1. ✅ Export to GitHub (if not done)
2. ✅ Add scripts to package.json
3. ✅ Configure GitHub secrets
4. ✅ Test locally
5. ✅ Push and verify GitHub Actions run

---

## 📚 Full Documentation

See: [docs/MOBILE_GUARDIAN_CICD.md](../MOBILE_GUARDIAN_CICD.md)
