# Automated Verification Setup Guide

## Overview

The Polish Citizenship Portal now features **automatic triple-consensus verification** that runs after every code change and on a schedule. This ensures continuous quality monitoring using OpenAI GPT-5, Google Gemini 2.5 Pro, and Claude Sonnet 4.5.

---

## Architecture

```
Code Changes
    ↓
GitHub Push Event
    ↓
GitHub Webhook → github-webhook-verify
    ↓
Creates verification_run record
    ↓
Triggers → auto-verify-portal (async)
    ↓
Calls → verify-workflow-multi-model
    ↓
Parallel AI Analysis (3 models)
    ↓
Stores results in verification_runs
    ↓
Creates alerts if issues detected
    ↓
Updates verification_trends
```

---

## Components

### 1. Database Tables

**`verification_runs`**
- Tracks every verification run
- Stores results from all 3 AI models
- Records consensus level and scores
- Links to git commits and branches

**`verification_alerts`**
- Critical issues requiring attention
- Score drops below thresholds
- New production blockers
- Low model consensus

**`verification_trends`**
- Historical metric tracking
- Improvement/decline detection
- Scope-based analytics

### 2. Edge Functions

**`github-webhook-verify`**
- Receives GitHub push webhooks
- Determines verification scope from changed files
- Creates verification run record
- Triggers async verification

**`auto-verify-portal`**
- Orchestrates the verification process
- Calls the multi-model verification
- Stores results in database
- Creates alerts for issues
- Updates trends

**`scheduled-verification`**
- Runs every 6 hours via cron
- Full portal verification
- Prevents duplicate runs

**`verify-workflow-multi-model`**
- Executes triple-consensus analysis
- Runs GPT-5, Gemini, and Claude in parallel
- Returns aggregated results

### 3. UI Components

**`VerificationHistoryDashboard`**
- View all verification runs
- Filter by scope (workflow, security, forms, full portal)
- See active alerts
- Trigger manual verifications
- Real-time updates via Supabase Realtime

---

## Setup Instructions

### Step 1: GitHub Webhook Configuration

1. Go to your GitHub repository settings
2. Navigate to Webhooks
3. Add new webhook:
   - **Payload URL**: `https://oogmuakyqadpynnrasnd.supabase.co/functions/v1/github-webhook-verify`
   - **Content type**: `application/json`
   - **Events**: Select "Just the push event"
   - **Active**: ✅ Enabled

### Step 2: Configure Scheduled Verification

Run this SQL to set up a cron job for scheduled verifications:

```sql
-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule verification to run every 6 hours
SELECT cron.schedule(
  'auto-verify-portal-6h',
  '0 */6 * * *', -- Every 6 hours
  $$
  SELECT net.http_post(
    url := 'https://oogmuakyqadpynnrasnd.supabase.co/functions/v1/scheduled-verification',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZ211YWt5cWFkcHlubnJhc25kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTE1NzIsImV4cCI6MjA3NTE2NzU3Mn0.r7ftd-s-PI5TJFTjhIrkeq32aqnq-BALz0eoJe5oRD0"}'::jsonb,
    body := '{"timestamp": "' || now() || '"}'::jsonb
  ) AS request_id;
  $$
);
```

### Step 3: Enable Realtime (Optional)

To get live updates in the dashboard:

```sql
-- Enable realtime for verification tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.verification_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.verification_alerts;
```

---

## Verification Scopes

### Automatic Scope Detection

The system automatically determines the verification scope based on changed files:

| Changed Files | Scope | Files Analyzed |
|--------------|-------|----------------|
| `*workflow*`, `AIDocumentWorkflow*` | `workflow` | Workflow components only |
| `*Form.tsx`, `form/*` | `forms` | Form components |
| `*security*`, `*auth*`, `*PII*` | `security` | Security utilities |
| 10+ files changed | `full_portal` | All critical files |
| Other changes | `custom` | Best guess based on files |

### Manual Scope Selection

You can trigger manual verifications with specific scopes:

```typescript
const { data, error } = await supabase.functions.invoke('auto-verify-portal', {
  body: {
    verification_run_id: null,
    verification_scope: 'workflow', // or 'security', 'forms', 'full_portal'
    changed_files: []
  }
});
```

---

## Alert Types

### 1. Score Drop
- **Trigger**: Average score < 70
- **Severity**: High
- **Action**: Review recent changes, check logs

### 2. New Blocker
- **Trigger**: Critical findings detected
- **Severity**: Critical
- **Action**: Fix before deployment

### 3. Consensus Low
- **Trigger**: Models disagree significantly
- **Severity**: Medium
- **Action**: Manual expert review needed

### 4. Verification Failed
- **Trigger**: Verification process error
- **Severity**: High
- **Action**: Check edge function logs

---

## Monitoring Dashboard

Access the verification history dashboard:

```typescript
import { VerificationHistoryDashboard } from '@/components/verification/VerificationHistoryDashboard';

// In your route
<VerificationHistoryDashboard />
```

**Features**:
- ✅ View all verification runs
- ✅ Filter by scope
- ✅ See active alerts
- ✅ Trigger manual verifications
- ✅ Real-time updates
- ✅ Score trends
- ✅ Model-by-model breakdown

---

## Workflow Example

### Scenario: Push to GitHub

1. **Developer pushes code** with workflow file changes
2. **GitHub sends webhook** to `github-webhook-verify`
3. **System detects** `workflow` scope from changed files
4. **Creates** verification run record with status `pending`
5. **Triggers** `auto-verify-portal` asynchronously
6. **Analyzes** code with GPT-5, Gemini, and Claude in parallel
7. **Stores** results: average score 87/100, HIGH consensus
8. **Creates alert** if score < 70 or blockers found
9. **Updates** trends table showing improvement
10. **Dashboard** shows new run in real-time

---

## Troubleshooting

### Webhook Not Triggering

1. Check GitHub webhook delivery logs
2. Verify webhook URL is correct
3. Ensure edge function is deployed
4. Check for CORS issues

### Verification Stuck in "Pending"

1. Check `auto-verify-portal` edge function logs
2. Verify `ANTHROPIC_API_KEY` is set
3. Check for rate limits on AI models
4. Verify network connectivity

### No Alerts Created

1. Check alert creation thresholds
2. Verify database permissions
3. Check RLS policies
4. Review edge function logs

### Scheduled Job Not Running

1. Verify `pg_cron` extension is enabled
2. Check cron schedule syntax
3. Review cron job logs:
   ```sql
   SELECT * FROM cron.job_run_details
   ORDER BY start_time DESC
   LIMIT 10;
   ```

---

## Best Practices

### 1. Review Alerts Daily
- Check dashboard for new critical alerts
- Acknowledge alerts as they're addressed
- Mark as resolved when fixed

### 2. Monitor Trends
- Track average scores over time
- Watch for declining trends
- Celebrate improvements!

### 3. Act on Blockers
- Never deploy with unresolved blockers
- Fix critical findings immediately
- Document workarounds if needed

### 4. Validate Consensus
- Low consensus = manual review needed
- High consensus = high confidence
- Use disagreements to improve code

---

## Future Enhancements

- [ ] Email notifications for critical alerts
- [ ] Slack integration for team notifications
- [ ] Score visualization charts
- [ ] Comparison between runs
- [ ] Export verification reports
- [ ] Custom verification rules
- [ ] Integration with CI/CD pipelines

---

**System Status**: ✅ Fully Operational  
**Last Updated**: November 5, 2025  
**Version**: 1.0
