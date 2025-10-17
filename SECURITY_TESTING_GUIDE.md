# Security Testing Guide

This guide provides automated security tests and manual testing procedures to ensure the application remains secure.

---

## Automated Security Tests

### 1. Input Validation Tests

**Test File:** `src/utils/__tests__/clientInputValidation.test.ts`

Run these tests regularly to ensure input validation is working:

```bash
npm test clientInputValidation
```

**Key Test Cases:**
- ✅ Email validation (valid/invalid formats, length limits)
- ✅ Name validation (special characters, length limits)
- ✅ Password strength (minimum requirements, character types)
- ✅ Date format validation (DD.MM.YYYY, valid ranges)
- ✅ Passport number validation (length, format)
- ✅ XSS detection (script tags, event handlers)
- ✅ SQL injection detection (SQL keywords, operators)
- ✅ File upload validation (types, sizes)

### 2. Data Masking Tests

**Test File:** `src/utils/__tests__/dataMasking.test.ts`

```bash
npm test dataMasking
```

**Key Test Cases:**
- ✅ Passport masking for different roles
- ✅ Email masking in logs
- ✅ Safe logging of objects
- ✅ Sanitization of sensitive fields

### 3. Edge Function Security Tests

Run security tests on each edge function:

```bash
# Test authentication requirements
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/ocr-passport \
  -H "Content-Type: application/json" \
  -d '{"imageBase64": "test"}'
# Expected: 401 Unauthorized

# Test input validation
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/ocr-passport \
  -H "Authorization: Bearer [VALID_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"imageBase64": "", "caseId": "invalid-uuid"}'
# Expected: 400 Bad Request with validation error

# Test rate limiting
for i in {1..15}; do
  curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/client-guide-agent \
    -H "Authorization: Bearer [VALID_TOKEN]" \
    -H "Content-Type: application/json" \
    -d '{"message": "test"}'
done
# Expected: 429 Too Many Requests after 10 requests
```

---

## Manual Security Testing Procedures

### 1. Authentication Security

**Test Procedure:**

1. **Unauthorized Access:**
   - Open incognito window
   - Try to access `/admin/cases` directly
   - ✅ **Expected:** Redirect to login page

2. **Session Persistence:**
   - Log in as user
   - Refresh page
   - ✅ **Expected:** Still logged in

3. **Session Expiry:**
   - Log in, wait 24 hours
   - Try to access protected route
   - ✅ **Expected:** Redirect to login, token refresh attempted

4. **Role-Based Access:**
   - Log in as regular user
   - Try to access admin-only routes
   - ✅ **Expected:** Permission denied

### 2. RLS Policy Testing

**Test Procedure:**

1. **Case Isolation:**
   - Create Case A as User 1
   - Log in as User 2
   - Try to access Case A via API
   - ✅ **Expected:** No data returned

2. **Staff Access:**
   - Log in as admin
   - Access all cases
   - ✅ **Expected:** All cases visible

3. **Client Portal:**
   - Log in as client with portal access
   - Access own case
   - ✅ **Expected:** Only own case visible
   - Try to modify `case_id` in request
   - ✅ **Expected:** Permission denied

### 3. Input Validation Testing

**Test Procedure:**

1. **XSS Attempts:**
   ```javascript
   // Test in name field
   <script>alert('XSS')</script>
   <img src=x onerror=alert('XSS')>
   javascript:alert('XSS')
   ```
   - ✅ **Expected:** Rejected or sanitized

2. **SQL Injection Attempts:**
   ```sql
   ' OR '1'='1
   admin'--
   1'; DROP TABLE users--
   ```
   - ✅ **Expected:** Rejected with validation error

3. **Path Traversal:**
   ```
   ../../etc/passwd
   ..\\..\\windows\\system32
   ```
   - ✅ **Expected:** Rejected

4. **File Upload:**
   - Upload .exe file
   - ✅ **Expected:** Rejected (not in allowed types)
   - Upload 15MB file
   - ✅ **Expected:** Rejected (exceeds 10MB limit)
   - Upload 0-byte file
   - ✅ **Expected:** Rejected (empty file)

### 4. Data Masking Testing

**Test Procedure:**

1. **Passport Display:**
   - Log in as regular user
   - View case with passport number
   - ✅ **Expected:** Only last 4 digits visible
   - Log in as admin
   - View same case
   - ✅ **Expected:** Full passport number visible with unmask button

2. **Console Logs:**
   - Open browser console
   - Perform OCR operation
   - ✅ **Expected:** No full passport numbers in logs
   - Check server logs
   - ✅ **Expected:** Only IDs and status codes, no PII

### 5. Rate Limiting Testing

**Test Procedure:**

1. **Client Guide Agent:**
   - Send 15 rapid requests
   - ✅ **Expected:** First 10 succeed, next 5 get 429
   - Wait 1 minute
   - ✅ **Expected:** Requests work again

2. **Partner API:**
   - Send 150 requests with valid API key
   - ✅ **Expected:** First 100 succeed, next 50 get 429

### 6. Error Handling Testing

**Test Procedure:**

1. **Invalid Input:**
   - Submit form with invalid data
   - ✅ **Expected:** User-friendly error message (no stack trace)

2. **Server Error:**
   - Trigger edge function error
   - ✅ **Expected:** Generic "processing failed" message to user
   - Check server logs
   - ✅ **Expected:** Detailed error with context (no PII)

3. **Network Error:**
   - Disable network
   - Try to submit form
   - ✅ **Expected:** Connection error message, form data preserved

---

## Penetration Testing Checklist

### Weekly Tests

- [ ] Test login with 10+ failed attempts (brute force detection)
- [ ] Verify all edge functions require JWT (except public ones)
- [ ] Test RLS policies with different user roles
- [ ] Check console logs for any PII leakage
- [ ] Verify file upload validation

### Monthly Tests

- [ ] Full XSS test suite on all input fields
- [ ] SQL injection attempt on all endpoints
- [ ] Session hijacking attempts
- [ ] CSRF token validation
- [ ] Check for exposed secrets in client-side code
- [ ] Review security audit logs for patterns
- [ ] Test rate limiting on all public endpoints

### Quarterly Tests

- [ ] Full security audit using automated tools (OWASP ZAP, Burp Suite)
- [ ] Review all RLS policies for gaps
- [ ] Check dependencies for known vulnerabilities (`npm audit`)
- [ ] Penetration testing by external security firm
- [ ] Review and update SECURITY_POLICY.md
- [ ] Security training for all developers

---

## Security Metrics to Monitor

Track these metrics weekly:

1. **Failed Login Attempts:** > 10 in 1 hour = investigate
2. **Permission Denied Events:** > 50 per user = investigate
3. **Rate Limit Hits:** > 100 per hour = investigate
4. **Suspicious Activity Alerts:** Any = immediate investigation
5. **Average Response Time:** > 2x normal = potential DoS

### Query Security Metrics:

```sql
-- Failed logins in last 24 hours
SELECT COUNT(*) as failed_logins
FROM security_audit_logs
WHERE event_type = 'auth_login_failed'
  AND created_at > NOW() - INTERVAL '24 hours';

-- Permission denied by user
SELECT user_id, COUNT(*) as denials
FROM security_audit_logs
WHERE event_type = 'permission_denied'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY user_id
HAVING COUNT(*) > 10
ORDER BY denials DESC;

-- Critical security events
SELECT *
FROM security_audit_logs
WHERE severity = 'critical'
  AND created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
```

---

## Incident Response Procedure

If a security vulnerability is found:

1. **Immediate:**
   - Document the vulnerability (don't share publicly)
   - Disable affected feature if critical
   - Notify security team lead

2. **Within 2 Hours:**
   - Assess scope of exposure
   - Check audit logs for exploitation
   - Implement temporary mitigation

3. **Within 24 Hours:**
   - Develop and test fix
   - Deploy patch
   - Monitor for exploitation attempts

4. **Within 1 Week:**
   - Post-mortem analysis
   - Update security policies
   - Security training on lessons learned

---

## Tools for Security Testing

### Recommended Tools:

1. **OWASP ZAP** - Automated vulnerability scanner
2. **Burp Suite** - Web security testing
3. **SQLMap** - SQL injection testing
4. **npm audit** - Dependency vulnerability check
5. **Lighthouse** - Security headers check

### Running Automated Scans:

```bash
# Check dependencies for vulnerabilities
npm audit

# Run linter with security rules
npm run lint

# Check for hardcoded secrets (use git-secrets or similar)
git secrets --scan
```

---

## Security Test Results Log

Keep a log of all security tests:

| Date | Test Type | Tester | Results | Issues Found | Fixed |
|------|-----------|--------|---------|--------------|-------|
| 2025-10-17 | Initial Setup | System | Pass | 0 | N/A |

Update this log after each testing session.
