# SECURITY FIRST - Core Project Policy

**Adopted:** 2025-10-17  
**Status:** MANDATORY for all development  
**Review:** Quarterly

---

## Core Principle

**SECURITY IS NOT OPTIONAL. SECURITY IS NOT AN AFTERTHOUGHT. SECURITY COMES FIRST.**

Every feature, every line of code, every decision must pass the security test before it passes any other test. If something compromises security, it doesn't ship—no matter how good it looks or how fast it performs.

---

## Critical Security Rules

### 1. Data Protection (PII/Sensitive Data)

**RULE:** Passport numbers, personal names, dates of birth, addresses, and all PII must be protected at every layer.

**Implementation:**
- ✅ **Backend:** RLS policies restrict access to case owners and staff only
- ✅ **Edge Functions:** Input validation, sanitization, no PII logging
- ✅ **Client-Side:** Masked display for non-privileged users
- ✅ **Logs:** NEVER log full passport numbers, emails, or personal data
- ✅ **Errors:** Generic error messages to users, detailed logs only server-side

**Example - CORRECT:**
```typescript
// Backend
console.log("OCR completed", { documentId, confidence: 0.95 });

// Client
{userRole === 'admin' ? passportNumber : maskPassportNumber(passportNumber)}
```

**Example - WRONG:**
```typescript
// ❌ NEVER DO THIS
console.log("Passport data:", { name: "John Smith", passport: "AB123456" });
```

---

### 2. Authentication & Authorization

**RULE:** Every endpoint must verify who the user is and what they're allowed to do.

**Implementation:**
- ✅ Edge functions require JWT (except public endpoints with API key validation)
- ✅ RLS policies on all tables
- ✅ Role-based access control (admin, assistant, user)
- ✅ Security definer functions to prevent infinite recursion
- ✅ Session management with proper token refresh

**Required Checks:**
```typescript
// 1. Authentication (who are you?)
const user = await supabase.auth.getUser();
if (!user) return { error: "Unauthorized" };

// 2. Authorization (what can you do?)
const { data: role } = await supabase.from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .single();

if (role !== 'admin') return { error: "Forbidden" };
```

---

### 3. Input Validation

**RULE:** NEVER trust user input. Validate, sanitize, and verify everything.

**Implementation:**
- ✅ **All edge functions:** Use validation utilities from `_shared/validation.ts`
- ✅ **Client forms:** Zod schemas for type-safe validation
- ✅ **File uploads:** Type, size, and content validation
- ✅ **UUIDs:** Regex validation before database queries
- ✅ **Text fields:** Length limits, sanitization, encoding

**Required Validations:**
```typescript
// Import shared validation
import { isValidUUID, sanitizeText, validateFile } from '../_shared/validation.ts';

// Validate ALL inputs
if (!isValidUUID(caseId)) {
  return new Response(
    JSON.stringify({ error: 'Invalid case ID format' }),
    { status: 400 }
  );
}

const sanitizedText = sanitizeText(userInput, MAX_LENGTH);
```

---

### 4. Rate Limiting

**RULE:** Prevent abuse by limiting request frequency.

**Implementation:**
- ✅ Public endpoints: 10-30 requests/minute
- ✅ AI endpoints: 10 requests/minute
- ✅ Partner API: 100 requests/minute with API key
- ✅ Return proper 429 responses with `retryAfter`

**Example:**
```typescript
const { checkRateLimit } = await import('../_shared/validation.ts');

const rateLimit = checkRateLimit(clientIp, 10, 60000);
if (!rateLimit.allowed) {
  return new Response(
    JSON.stringify({ error: 'Too many requests', retryAfter: rateLimit.retryAfter }),
    { status: 429 }
  );
}
```

---

### 5. Secure Logging

**RULE:** Logs are for debugging, not data leaks.

**Implementation:**
- ✅ **Use:** `safeLog` utility from `dataMasking.ts`
- ✅ **Log:** IDs, status codes, operation types, timestamps
- ✅ **NEVER log:** Passwords, passport numbers, full names, emails, tokens

**Example - CORRECT:**
```typescript
import { safeLog } from '@/utils/dataMasking';

safeLog.info("Case updated", { 
  caseId, 
  operation: 'update_status',
  newStatus: 'approved'
});
```

**Example - WRONG:**
```typescript
// ❌ NEVER DO THIS
console.log("User data:", { 
  name: user.name, 
  email: user.email, 
  passport: user.passport 
});
```

---

### 6. Error Handling

**RULE:** Never expose internal system details to users.

**Implementation:**
- ✅ **User-facing:** Generic messages ("Processing failed")
- ✅ **Server logs:** Detailed error with context
- ✅ **No stack traces** in production responses
- ✅ **Handle ALL errors** - no unhandled promise rejections

**Example:**
```typescript
try {
  // Operation
} catch (error) {
  console.error("Operation failed", { operationId, userId });
  // DO NOT: console.error(error.stack)
  
  return new Response(
    JSON.stringify({ error: "Operation failed" }),
    { status: 500 }
  );
}
```

---

### 7. Secrets Management

**RULE:** API keys and secrets NEVER appear in code or client-side.

**Implementation:**
- ✅ All secrets in Supabase Secrets Manager
- ✅ Access via `Deno.env.get()` in edge functions only
- ✅ NEVER commit secrets to git
- ✅ NEVER send secrets to client
- ✅ NEVER log secrets

**Required Pattern:**
```typescript
// Backend only
const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');
if (!OPENAI_KEY) throw new Error('API key not configured');

// Client NEVER sees this
```

---

### 8. CORS & Headers

**RULE:** Proper CORS prevents unauthorized access.

**Implementation:**
- ✅ All edge functions include CORS headers
- ✅ Handle OPTIONS preflight requests
- ✅ Set proper Content-Type headers
- ✅ Security headers for XSS/clickjacking protection

**Required Headers:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

---

## Security Checklist for All Code Changes

Before ANY code is committed:

- [ ] **Authentication:** Is the user verified?
- [ ] **Authorization:** Is the user allowed to do this?
- [ ] **Input Validation:** Are all inputs validated and sanitized?
- [ ] **Rate Limiting:** Are abuse vectors protected?
- [ ] **Logging:** No PII in logs?
- [ ] **Error Handling:** Generic messages to users?
- [ ] **Secrets:** No hardcoded keys or tokens?
- [ ] **RLS:** Are database policies correct?
- [ ] **File Uploads:** Type, size, content validated?
- [ ] **Testing:** Tested with malicious input?

---

## Incident Response

If a security vulnerability is discovered:

1. **Immediate:** Disable affected feature/endpoint
2. **Assess:** Determine scope of exposure
3. **Fix:** Implement patch following security rules
4. **Test:** Verify fix with penetration testing
5. **Deploy:** Emergency deployment with monitoring
6. **Review:** Post-mortem and update this policy

---

## Security Tools & Utilities

### Validation Library
`supabase/functions/_shared/validation.ts`
- `isValidUUID()`, `isValidEmail()`, `sanitizeText()`, `sanitizeName()`
- `validateFile()`, `validateCaseData()`, `checkRateLimit()`

### Data Masking
`src/utils/dataMasking.ts`
- `maskPassportNumber()`, `maskPassportByRole()`, `canSeeFullPassport()`
- `maskPassportFields()`, `sanitizeForLogging()`, `safeLog`

### Secure Components
`src/components/forms/MaskedPassportInput.tsx`
- Role-based display with unmask button for admins

---

## Developer Responsibilities

Every developer working on this project MUST:

1. **Read this policy** before writing any code
2. **Review security checklist** before every commit
3. **Test with malicious input** (SQL injection attempts, XSS, etc.)
4. **Use provided utilities** - don't reinvent security functions
5. **Ask if unsure** - security questions are ALWAYS welcome
6. **Report vulnerabilities** immediately

---

## Training & Resources

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **Supabase RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security
- **Input Validation:** https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
- **Secure Coding:** https://www.securecoding.cert.org/

---

## Policy Updates

This policy is reviewed quarterly and updated as needed. All team members will be notified of changes and must acknowledge reading updates.

**Last Updated:** 2025-10-17  
**Next Review:** 2026-01-17  
**Policy Owner:** Security Team

---

**Remember: If you're asking "Is this secure?" - the answer is probably "Make it more secure."**

**SECURITY FIRST. ALWAYS.**
