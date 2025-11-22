# Developer Security Onboarding Checklist

Welcome to the team! Security is our top priority. Before you start coding, complete this checklist to ensure you understand our security practices.

---

## Phase 1: Read & Understand (Day 1)

- [ ] Read **SECURITY_POLICY.md** in full
  - [ ] Understand the 8 critical security rules
  - [ ] Review code examples (correct vs. wrong)
  - [ ] Note the security checklist for code changes

- [ ] Read **SECURITY_TESTING_GUIDE.md**
  - [ ] Understand automated testing procedures
  - [ ] Review manual testing procedures
  - [ ] Note the incident response procedure

- [ ] Review security architecture documents:
  - [ ] RLS policies in database
  - [ ] Edge function security patterns
  - [ ] Client-side validation approach

---

## Phase 2: Environment Setup (Day 1-2)

- [ ] **Install security tools:**
  ```bash
  # Install git-secrets to prevent committing secrets
  brew install git-secrets  # macOS
  # or
  apt-get install git-secrets  # Linux
  
  # Set up pre-commit hooks
  git secrets --install
  git secrets --register-aws
  ```

- [ ] **Configure IDE security plugins:**
  - [ ] ESLint with security rules
  - [ ] SonarLint (catches security issues)
  - [ ] Git commit hooks for secret scanning

- [ ] **Set up local Supabase:**
  - [ ] Install Supabase CLI
  - [ ] Run local instance
  - [ ] Test RLS policies locally

---

## Phase 3: Hands-On Security Training (Day 2-3)

### Exercise 1: Input Validation

**Task:** Implement a new form field with proper validation

- [ ] Create a form field for "Company Name"
- [ ] Add validation using `clientInputValidation.ts`
- [ ] Test with XSS attempts: `<script>alert('xss')</script>`
- [ ] Test with SQL injection: `' OR '1'='1`
- [ ] Verify sanitization works correctly

**Review Criteria:**
- [ ] Field rejects malicious input
- [ ] Error messages are user-friendly (no technical details)
- [ ] Validation happens both client and server-side

### Exercise 2: Data Masking

**Task:** Add passport number display to a component

- [ ] Display passport number with role-based masking
- [ ] Use `MaskedPassportInput` component
- [ ] Test as admin (should see full number)
- [ ] Test as regular user (should see masked)
- [ ] Add unmask button for admins only

**Review Criteria:**
- [ ] Passport displayed correctly for each role
- [ ] No full passport number in console logs
- [ ] Component handles missing data gracefully

### Exercise 3: Secure API Call

**Task:** Create an edge function with security best practices

- [ ] Create edge function `test-security-function`
- [ ] Add JWT verification (`verify_jwt = true` in config)
- [ ] Implement input validation using `_shared/validation.ts`
- [ ] Add rate limiting (10 requests/minute)
- [ ] Use safe error handling (no stack traces to client)
- [ ] Add security event logging

**Review Criteria:**
- [ ] Function requires authentication
- [ ] All inputs are validated
- [ ] Rate limiting works (returns 429 after 10 requests)
- [ ] Errors are generic to users, detailed in logs
- [ ] No PII in console logs

### Exercise 4: RLS Policy

**Task:** Create a new table with proper RLS

- [ ] Design table schema for "client_notes"
- [ ] Add RLS policies (users see only their notes)
- [ ] Add admin policy (admins see all notes)
- [ ] Test isolation (user A can't see user B's notes)
- [ ] Test admin access (admin sees all)

**Review Criteria:**
- [ ] RLS enabled on table
- [ ] Policies prevent unauthorized access
- [ ] Admin role works correctly
- [ ] No data leakage between users

---

## Phase 4: Code Review Practice (Day 3-4)

Review these intentionally vulnerable code samples and identify security issues:

### Sample 1: Vulnerable Login Form

```typescript
// FIND THE SECURITY ISSUES
const handleLogin = async (email: string, password: string) => {
  console.log("Login attempt:", { email, password });
  
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.error) {
    alert(`Login failed: ${data.error.message}`);
  } else {
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '/dashboard';
  }
};
```

**Issues to Find:**
- [ ] Logging password in plain text
- [ ] No input validation
- [ ] Exposing detailed error messages
- [ ] No rate limiting check
- [ ] Not using secure session management

### Sample 2: Vulnerable Data Fetch

```typescript
// FIND THE SECURITY ISSUES
const fetchUserData = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId);
    
  console.log("User data:", data);
  return data;
};
```

**Issues to Find:**
- [ ] No authentication check
- [ ] Logging full user data (potential PII)
- [ ] No RLS policy mentioned
- [ ] Selecting all columns (including potentially sensitive ones)

### Sample 3: Vulnerable File Upload

```typescript
// FIND THE SECURITY ISSUES
const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};
```

**Issues to Find:**
- [ ] No file type validation
- [ ] No file size check
- [ ] No authentication
- [ ] No error handling
- [ ] No rate limiting

---

## Phase 5: Security Checklist Memorization (Day 4-5)

**Memorize this checklist** - use it before EVERY commit:

### Pre-Commit Security Checklist:

- [ ] **Authentication:** User verified?
- [ ] **Authorization:** User allowed?
- [ ] **Input Validation:** All inputs validated?
- [ ] **Rate Limiting:** Abuse protected?
- [ ] **Logging:** No PII in logs?
- [ ] **Error Handling:** Generic messages to users?
- [ ] **Secrets:** No hardcoded keys?
- [ ] **RLS:** Database policies correct?
- [ ] **File Uploads:** Type/size validated?
- [ ] **Testing:** Tested with malicious input?

**Practice:** Run through this checklist 5 times with different code samples until it becomes automatic.

---

## Phase 6: Security Tools Familiarity (Day 5)

### Learn These Utilities:

1. **Input Validation** (`src/utils/clientInputValidation.ts`)
   - [ ] Run example: `validateEmail("test@example.com")`
   - [ ] Run example: `validateName("John O'Brien")`
   - [ ] Run example: `sanitizeText("<script>alert('xss')</script>")`

2. **Data Masking** (`src/utils/dataMasking.ts`)
   - [ ] Run example: `maskPassportNumber("AB123456")`
   - [ ] Run example: `safeLog.info("User logged in", { userId: "123" })`

3. **Security Monitoring** (`src/utils/securityMonitoring.ts`)
   - [ ] Run example: `SecurityMonitor.logLoginSuccess(userId)`
   - [ ] Run example: `SecurityMonitor.logPermissionDenied("cases", "delete")`

4. **Edge Function Validation** (`supabase/functions/_shared/validation.ts`)
   - [ ] Review: `isValidUUID()`
   - [ ] Review: `checkRateLimit()`
   - [ ] Review: `validateFile()`

---

## Phase 7: First Code Contribution (Week 2)

### Your First Secure PR:

1. **Choose a simple task** (e.g., add a form field, create a new component)

2. **Before coding:**
   - [ ] Review SECURITY_POLICY.md again
   - [ ] Plan security measures for your change
   - [ ] Identify potential security risks

3. **During coding:**
   - [ ] Use validation utilities
   - [ ] Add proper error handling
   - [ ] Implement rate limiting if applicable
   - [ ] Add security event logging
   - [ ] Test with malicious input

4. **Before submitting PR:**
   - [ ] Run security checklist
   - [ ] Test manually with XSS/SQL injection attempts
   - [ ] Review logs for PII leakage
   - [ ] Ask for security review

5. **PR Description must include:**
   - [ ] Security measures implemented
   - [ ] Testing performed (including malicious input)
   - [ ] Any security concerns or questions

---

## Phase 8: Certification (End of Week 2)

### Final Security Quiz:

Answer these questions (passing score: 10/10):

1. **What are the 3 levels of security severity?**
   - [ ] Info, Warning, Critical

2. **When should you log full passport numbers?**
   - [ ] Never

3. **What's the maximum file upload size?**
   - [ ] 10MB

4. **What HTTP status code indicates rate limiting?**
   - [ ] 429

5. **Should edge functions expose detailed error messages to users?**
   - [ ] No - generic messages only

6. **What role can see full passport numbers?**
   - [ ] Admin and Assistant

7. **What function should you use for logging user data?**
   - [ ] `safeLog` from `dataMasking.ts`

8. **How often should security policies be reviewed?**
   - [ ] Quarterly

9. **What should happen if you find a security vulnerability?**
   - [ ] Immediately document and notify security team, disable if critical

10. **Should you store API keys in environment variables or code?**
    - [ ] Environment variables only (Supabase Secrets)

---

## Ongoing Security Responsibilities

After onboarding, you MUST:

- [ ] Review security updates when SECURITY_POLICY.md changes
- [ ] Participate in monthly security training
- [ ] Report any security concerns immediately
- [ ] Keep security tools and dependencies updated
- [ ] Follow the security checklist for EVERY commit
- [ ] Ask questions when unsure about security

---

## Resources

- **Internal:**
  - SECURITY_POLICY.md (project root)
  - SECURITY_TESTING_GUIDE.md (project root)
  - #security Slack channel

- **External:**
  - OWASP Top 10: https://owasp.org/www-project-top-ten/
  - Supabase Security: https://supabase.com/docs/guides/auth/row-level-security
  - Web Security Academy: https://portswigger.net/web-security

---

## Onboarding Sign-Off

After completing all phases:

**Developer Name:** ___________________  
**Completion Date:** ___________________  
**Security Lead Approval:** ___________________  
**Notes:** ___________________

**I acknowledge that I have:**
- Read and understood the security policies
- Completed all exercises
- Passed the security quiz
- Committed to following security best practices

**Signature:** ___________________  
**Date:** ___________________

---

**Welcome to the team! Remember: SECURITY FIRST. ALWAYS.**
