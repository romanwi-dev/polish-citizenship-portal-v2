# Admin Security Guide

## Quick Reference

### Daily Tasks
- [ ] Review OCR Processing Monitor for failures
- [ ] Check rate limit violations
- [ ] Verify no unusual access patterns

### Weekly Tasks
- [ ] Analyze security metrics trends
- [ ] Review user access logs
- [ ] Update security documentation if needed

### Monthly Tasks
- [ ] Audit all admin accounts
- [ ] Review and update rate limits
- [ ] Generate security compliance report

---

## 1. OCR Processing Monitor

### Accessing the Dashboard
Navigate to: **Admin → OCR Processing Monitor** (`/admin/ocr-processing-monitor`)

### What to Monitor

#### Active Operations
- **Normal**: 0-5 concurrent operations
- **High Load**: 6-15 concurrent operations
- **⚠️ Alert**: >15 concurrent operations (potential abuse or system issue)

#### Failure Rate
- **Acceptable**: <5% daily failure rate
- **⚠️ Warning**: 5-10% failure rate
- **🚨 Critical**: >10% failure rate

**Action Items for High Failure Rate:**
1. Check error messages in logs
2. Verify AI API key is valid
3. Review recent code changes
4. Contact development team if persistent

#### Processing Time
- **Good**: <30 seconds average
- **Acceptable**: 30-60 seconds average
- **⚠️ Slow**: >60 seconds average

**Action Items for Slow Processing:**
1. Check if specific document types are slow
2. Review image sizes being uploaded
3. Consider increasing timeout limits
4. Monitor system resources

#### Image Deletion Status
- **Required**: 100% of completed jobs should have `image_deleted_at` timestamp
- **⚠️ Issue**: Any job without deletion timestamp after 5 minutes

**Action Items for Missing Deletions:**
1. Review specific log entry details
2. Check for code errors in cleanup
3. Manually verify data is not stored
4. Report to development team

### Log Entry Details

Each log shows:
```
Status: [Processing | Completed | Failed]
Case ID: UUID (click to view case)
Document ID: UUID (click to view document)
Duration: XXXms
Image Size: X.XX MB
Confidence: XX%
Image Deleted: ✓ Yes | ✗ No
Error: [Error message if failed]
```

### Common Errors & Solutions

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Processing timeout exceeded" | Large/complex image | Acceptable - system working as designed |
| "Authentication required" | Missing/invalid token | Check client-side auth implementation |
| "Image file too large" | File exceeds limit | Instruct client to compress image |
| "Lovable AI request failed: 429" | Rate limit hit | Wait and retry, or upgrade AI plan |
| "Invalid JSON response from AI" | AI returned malformed data | Retry operation, report if persistent |

---

## 2. Rate Limiting Management

### Current Limits
```
OCR Processing:    10 requests/minute per user
PDF Generation:    20 requests/minute per user
AI Translation:    30 requests/minute per user
General API:       60 requests/minute per user
```

### Checking Rate Limit Violations

#### Database Query
```sql
-- Top rate limit violators (last hour)
SELECT 
  identifier,
  COUNT(*) as request_count,
  MAX(created_at) as last_request
FROM rate_limit_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY identifier
HAVING COUNT(*) > 50
ORDER BY request_count DESC
LIMIT 20;
```

#### Identifying Abuse Patterns
- **User**: `identifier` starts with `user:`
- **IP**: `identifier` starts with `ip:`

**Normal Behavior:**
- Users make 5-10 requests per minute during active use
- Occasional bursts are acceptable

**⚠️ Suspicious Behavior:**
- Consistent requests at exactly limit threshold
- Multiple IPs from same user
- Requests from unusual geographic locations

**Action Items:**
1. Investigate user account activity
2. Check if legitimate power user or automation
3. Contact user if suspicious
4. Temporarily block IP if confirmed abuse

### Adjusting Rate Limits

To modify limits, edit `supabase/functions/_shared/rateLimiting.ts`:

```typescript
export const RATE_LIMITS = {
  OCR_PROCESSING: {
    maxRequests: 10,  // Increase if needed
    windowMs: 60000   // 1 minute window
  },
  // ... other limits
};
```

**When to Increase Limits:**
- Legitimate power users need higher limits
- During high-volume periods (e.g., marketing campaigns)
- For internal testing/QA

**When to Decrease Limits:**
- Detecting abuse patterns
- Reducing server costs
- Protecting AI API quota

---

## 3. Security Incident Response

### Incident Classification

#### P1 - Critical (Response: Immediate)
- Data breach or unauthorized access
- System-wide failure
- Active attack in progress

#### P2 - High (Response: <4 hours)
- Individual account compromise
- Suspicious bulk access patterns
- Security feature failure

#### P3 - Medium (Response: <24 hours)
- Rate limit violations
- OCR processing anomalies
- Client-reported security concerns

#### P4 - Low (Response: <1 week)
- Security documentation updates
- Optimization recommendations
- Non-critical monitoring alerts

### Response Procedure

#### 1. Detection
- Automated alerts from monitoring
- User reports
- Log analysis

#### 2. Verification
- Confirm incident is real (not false positive)
- Assess scope and severity
- Document initial findings

#### 3. Containment
**Immediate Actions:**
```sql
-- Disable suspicious user account
UPDATE user_roles 
SET role = 'suspended' 
WHERE user_id = '[suspicious-user-id]';

-- Block IP address (contact infrastructure team)
-- Rate limiting will help but may need firewall rules

-- Revoke access tokens
-- (Requires Supabase dashboard access)
```

#### 4. Investigation
- Review all logs related to incident
- Identify attack vector
- Determine data affected
- Document timeline

#### 5. Eradication
- Fix vulnerability
- Deploy security patch
- Update security policies

#### 6. Recovery
- Restore normal operations
- Monitor for recurrence
- Notify affected users if needed

#### 7. Post-Incident
- Write incident report
- Update security procedures
- Conduct team debrief
- Implement preventive measures

### Emergency Contacts
```
Security Team Lead: [Name] - [Email] - [Phone]
CTO: [Name] - [Email] - [Phone]
Infrastructure: [Provider Support]
Legal Counsel: [Firm] - [Contact]
```

---

## 4. User Access Management

### Admin Roles
```sql
-- Check user's roles
SELECT u.email, ur.role 
FROM auth.users u
JOIN user_roles ur ON ur.user_id = u.id
WHERE u.id = '[user-id]';
```

### Role Hierarchy
1. **Admin**: Full system access
2. **Assistant**: Case management, document access
3. **Client**: Own case access only

### Granting Admin Access
```sql
-- Grant admin role
INSERT INTO user_roles (user_id, role)
VALUES ('[user-id]', 'admin');
```

### Revoking Access
```sql
-- Remove admin role
DELETE FROM user_roles 
WHERE user_id = '[user-id]' 
AND role = 'admin';
```

### Best Practices
- **Principle of Least Privilege**: Grant minimum necessary access
- **Regular Audits**: Review admin list quarterly
- **Strong Passwords**: Enforce for all admin accounts
- **Session Timeout**: Automatic logout after inactivity
- **Activity Logging**: Track all admin actions

---

## 5. Compliance & Reporting

### GDPR Data Subject Requests

#### Right to Access
Client requests their data:
```sql
-- Export all client data
SELECT * FROM cases WHERE id = '[case-id]';
SELECT * FROM intake_data WHERE case_id = '[case-id]';
SELECT * FROM documents WHERE case_id = '[case-id]';
SELECT * FROM master_table WHERE case_id = '[case-id]';
```

#### Right to Deletion
Client requests data removal:
```sql
-- Delete all case data
DELETE FROM documents WHERE case_id = '[case-id]';
DELETE FROM intake_data WHERE case_id = '[case-id]';
DELETE FROM master_table WHERE case_id = '[case-id]';
DELETE FROM cases WHERE id = '[case-id]';
```

**⚠️ Important**: Document legal basis before deletion if retention required.

#### Right to Portability
Provide data in machine-readable format (JSON):
```sql
-- Export to JSON (use Supabase dashboard or API)
```

### Monthly Security Report

Generate report with:
1. **OCR Processing Stats**
   - Total operations
   - Success rate
   - Average processing time
   - Top errors

2. **Rate Limiting Stats**
   - Total violations
   - Top violators
   - Adjusted limits

3. **Security Incidents**
   - Count by severity
   - Resolution time
   - Preventive actions taken

4. **User Access Changes**
   - New admins
   - Revoked access
   - Suspended accounts

5. **Compliance Activities**
   - GDPR requests handled
   - Security training completed
   - Policy updates

### Sample Report Template
```markdown
# Security Report - [Month Year]

## Summary
- Total OCR Operations: [count]
- Security Incidents: [count] (P1: X, P2: Y, P3: Z)
- Rate Limit Violations: [count]
- GDPR Requests: [count]

## Highlights
- [Notable achievement or concern]

## Action Items
- [ ] [Item 1]
- [ ] [Item 2]

## Recommendations
- [Improvement suggestion]
```

---

## 6. Security Monitoring Queries

### Daily Health Check
```sql
-- OCR operations last 24h
SELECT 
  status,
  COUNT(*) as count,
  AVG(processing_duration_ms)/1000 as avg_seconds,
  COUNT(*) FILTER (WHERE image_deleted_at IS NULL) as missing_deletions
FROM ocr_processing_logs
WHERE started_at > NOW() - INTERVAL '24 hours'
GROUP BY status;

-- Rate limit violations last 24h
SELECT COUNT(*) as violations
FROM rate_limit_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY identifier
HAVING COUNT(*) > 60;
```

### Weekly Trends
```sql
-- OCR performance by day
SELECT 
  DATE(started_at) as date,
  COUNT(*) as total,
  AVG(processing_duration_ms)/1000 as avg_seconds,
  COUNT(*) FILTER (WHERE status = 'failed') * 100.0 / COUNT(*) as failure_rate
FROM ocr_processing_logs
WHERE started_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(started_at)
ORDER BY date DESC;
```

### Monthly Analysis
```sql
-- Top error messages
SELECT 
  error_message,
  COUNT(*) as occurrences
FROM ocr_processing_logs
WHERE status = 'failed'
AND started_at > NOW() - INTERVAL '30 days'
AND error_message IS NOT NULL
GROUP BY error_message
ORDER BY occurrences DESC
LIMIT 10;
```

---

## 7. Security Checklist

### New Admin Onboarding
- [ ] Create user account
- [ ] Grant admin role
- [ ] Provide security training
- [ ] Share emergency contacts
- [ ] Add to security team channels
- [ ] Review this guide together

### Security Audit (Quarterly)
- [ ] Review all admin accounts
- [ ] Check for unused accounts (deactivate)
- [ ] Verify rate limits are appropriate
- [ ] Review security incident logs
- [ ] Update security documentation
- [ ] Test incident response procedures
- [ ] Verify backup procedures
- [ ] Check compliance requirements

### Before Deployment
- [ ] Review code changes for security issues
- [ ] Test authentication requirements
- [ ] Verify rate limiting is working
- [ ] Check all error messages (no data leaks)
- [ ] Update security documentation
- [ ] Notify team of changes

---

## Support & Questions

**Security Team**: security@polishcitizenshipportal.com  
**Emergency Hotline**: [Phone Number]  
**Documentation**: https://docs.polishcitizenshipportal.com/security  

---

**Last Updated**: January 2025  
**Next Review**: April 2025  
**Document Owner**: Security Team Lead
