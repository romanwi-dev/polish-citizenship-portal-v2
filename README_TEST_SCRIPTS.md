# Test Scripts Reference

## E2E Testing with Playwright

### Installation
```bash
# Install Playwright and browsers
npm install -D @playwright/test
npx playwright install
```

### Running Tests

#### All Tests
```bash
# Run all E2E tests
npx playwright test

# Run with UI mode (interactive)
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug
```

#### Specific Test Files
```bash
# Run only auth tests
npx playwright test tests/e2e/auth.spec.ts

# Run only intake form tests
npx playwright test tests/e2e/intake-form.spec.ts

# Run only POA tests
npx playwright test tests/e2e/poa-form.spec.ts

# Run only citizenship form tests
npx playwright test tests/e2e/citizenship-form.spec.ts

# Run only family tree tests
npx playwright test tests/e2e/family-tree.spec.ts

# Run only full workflow tests
npx playwright test tests/e2e/full-workflow.spec.ts
```

#### Browser-Specific Tests
```bash
# Run on Chromium only
npx playwright test --project=chromium

# Run on Firefox only
npx playwright test --project=firefox

# Run on WebKit (Safari) only
npx playwright test --project=webkit

# Run on Mobile Chrome
npx playwright test --project="Mobile Chrome"

# Run on Mobile Safari
npx playwright test --project="Mobile Safari"
```

#### Advanced Options
```bash
# Run tests in parallel (default)
npx playwright test --workers=4

# Run tests in sequence
npx playwright test --workers=1

# Run only failed tests from last run
npx playwright test --last-failed

# Update snapshots
npx playwright test --update-snapshots

# Generate trace files
npx playwright test --trace=on
```

### Reports

```bash
# Generate and open HTML report
npx playwright show-report

# Generate JSON report
npx playwright test --reporter=json

# Generate JUnit XML report
npx playwright test --reporter=junit
```

### Debugging

```bash
# Open Playwright Inspector
npx playwright test --debug

# Run with verbose output
npx playwright test --verbose

# Show browser during test
npx playwright test --headed

# Slow down execution
npx playwright test --headed --slow-mo=1000
```

---

## Performance Testing with Lighthouse

### Using Chrome DevTools
1. Open DevTools (F12)
2. Navigate to Lighthouse tab
3. Select categories (Performance, Best Practices, etc.)
4. Choose device (Desktop/Mobile)
5. Click "Analyze page load"
6. Export report as JSON or HTML

### Using Lighthouse CLI

#### Installation
```bash
npm install -g lighthouse
```

#### Run Audits
```bash
# Desktop audit
lighthouse https://yoursite.com \
  --output=html \
  --output-path=./reports/lighthouse-desktop.html \
  --preset=desktop

# Mobile audit
lighthouse https://yoursite.com \
  --output=html \
  --output-path=./reports/lighthouse-mobile.html \
  --preset=mobile

# With 3G throttling
lighthouse https://yoursite.com \
  --output=json \
  --output-path=./reports/lighthouse-mobile-3g.json \
  --throttling.cpuSlowdownMultiplier=4

# Custom throttling
lighthouse https://yoursite.com \
  --throttling-method=devtools \
  --throttling.rttMs=150 \
  --throttling.throughputKbps=1600 \
  --throttling.cpuSlowdownMultiplier=4

# Multiple URLs
for url in "/" "/admin/dashboard" "/client-intake"; do
  lighthouse "https://yoursite.com$url" \
    --output=html \
    --output-path="./reports/lighthouse$(echo $url | tr '/' '-').html" \
    --preset=desktop
done
```

#### Budget File
Create `budget.json`:
```json
{
  "timings": [
    {
      "metric": "interactive",
      "budget": 3800
    },
    {
      "metric": "first-contentful-paint",
      "budget": 1800
    }
  ],
  "resourceSizes": [
    {
      "resourceType": "script",
      "budget": 300
    },
    {
      "resourceType": "total",
      "budget": 1000
    }
  ]
}
```

Run with budget:
```bash
lighthouse https://yoursite.com --budget-path=./budget.json
```

---

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/e2e-tests.yml`:
```yaml
name: E2E Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npx playwright test
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Quick Test Commands

Add these to `package.json` scripts:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",
    "test:e2e:chrome": "playwright test --project=chromium",
    "test:e2e:firefox": "playwright test --project=firefox",
    "test:e2e:webkit": "playwright test --project=webkit",
    "test:e2e:mobile": "playwright test --project='Mobile Chrome' --project='Mobile Safari'",
    "lighthouse:desktop": "lighthouse https://yoursite.com --preset=desktop --output=html --output-path=./reports/lighthouse-desktop.html",
    "lighthouse:mobile": "lighthouse https://yoursite.com --preset=mobile --output=html --output-path=./reports/lighthouse-mobile.html"
  }
}
```

Then run:
```bash
npm run test:e2e
npm run test:e2e:ui
npm run lighthouse:desktop
```

---

## Continuous Monitoring

### WebPageTest API
```bash
# Run test
curl "https://www.webpagetest.org/runtest.php?url=https://yoursite.com&k=YOUR_API_KEY&f=json"

# Get results
curl "https://www.webpagetest.org/jsonResult.php?test=TEST_ID"
```

### Automated Daily Tests
Create a cron job or scheduled task:
```bash
#!/bin/bash
# Run daily performance tests

DATE=$(date +%Y-%m-%d)
REPORT_DIR="./performance-reports/$DATE"

mkdir -p "$REPORT_DIR"

# Run Lighthouse audits
lighthouse https://yoursite.com \
  --output=html \
  --output-path="$REPORT_DIR/homepage.html" \
  --preset=mobile

lighthouse https://yoursite.com/admin/dashboard \
  --output=html \
  --output-path="$REPORT_DIR/dashboard.html" \
  --preset=mobile

# Run E2E tests
npx playwright test --reporter=html --output="$REPORT_DIR/e2e-report"

# Email results (optional)
# mail -s "Daily Test Results - $DATE" team@example.com < "$REPORT_DIR/summary.txt"
```

---

## Tips & Best Practices

### Playwright
- Use `test.describe()` to group related tests
- Use `test.beforeEach()` for setup (login, navigation)
- Use `test.afterEach()` for cleanup
- Use `expect()` for assertions
- Use `page.waitForTimeout()` sparingly (prefer `waitForSelector()`)
- Capture screenshots on failure: `screenshot: 'only-on-failure'`

### Lighthouse
- Run tests in incognito mode to avoid extensions
- Test both desktop and mobile
- Use 3G throttling to simulate real conditions
- Test at different times of day (server load varies)
- Track trends over time, not just absolute scores

### Performance
- Aim for Performance score ≥ 80
- Optimize images (WebP format)
- Minimize JavaScript bundle size
- Use code splitting and lazy loading
- Implement service workers for caching
- Monitor Core Web Vitals (LCP, FID, CLS)
