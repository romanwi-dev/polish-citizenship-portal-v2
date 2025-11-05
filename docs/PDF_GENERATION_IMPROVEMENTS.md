# PDF Generation System Improvements

## Overview

Phase 1 core improvements to the PDF generation system focusing on reliability, error handling, and code organization.

## Changes Implemented

### 1. Shared Field Mappings Module ✅

**Location:** `supabase/functions/_shared/pdf-field-maps.ts`

**Purpose:** Single source of truth for all PDF template field mappings

**Benefits:**
- ✅ Eliminates duplication (785 lines → centralized)
- ✅ Imports from frontend config for consistency
- ✅ Easier to maintain and update mappings
- ✅ Type-safe field mapping access

**API:**
```typescript
import { 
  PDF_FIELD_MAPS, 
  getFieldMapping, 
  isValidTemplate 
} from '../_shared/pdf-field-maps.ts';

// Get mapping for a template
const mapping = getFieldMapping('poa-adult');

// Validate template type
if (isValidTemplate(templateType)) {
  // proceed
}

// Normalize aliases
const normalized = normalizeTemplateType('registration'); // → 'uzupelnienie'
```

**Supported Templates:**
- `poa-adult`, `poa-minor`, `poa-spouses`
- `citizenship`
- `family-tree`
- `uzupelnienie` (aliases: `registration`, `transcription`, `umiejscowienie`)

---

### 2. Error Code System ✅

**Location:** `supabase/functions/_shared/pdf-errors.ts`

**Purpose:** Granular error codes for better debugging and user feedback

**Error Categories:**
- Input validation errors (INVALID_CASE_ID, INVALID_TEMPLATE_TYPE, etc.)
- Data retrieval errors (CASE_NOT_FOUND, DATA_FETCH_FAILED, etc.)
- Template errors (TEMPLATE_NOT_FOUND, TEMPLATE_CORRUPTED, etc.)
- PDF processing errors (PDF_PARSE_FAILED, FIELD_FILL_ERROR, etc.)
- Storage errors (STORAGE_UPLOAD_FAILED, SIGNED_URL_FAILED, etc.)
- Resource errors (MEMORY_LIMIT_EXCEEDED, TIMEOUT_EXCEEDED, etc.)

**API:**
```typescript
import { 
  PDFErrorCode, 
  createPDFError, 
  getUserMessage,
  isRetryable 
} from '../_shared/pdf-errors.ts';

// Create structured error
const error = createPDFError(
  PDFErrorCode.STORAGE_UPLOAD_FAILED,
  'Failed to upload PDF to storage',
  { caseId, templateType, attempt: 1 }
);

// Get user-friendly message
const message = getUserMessage(PDFErrorCode.STORAGE_UPLOAD_FAILED);
// → "Failed to upload PDF to storage"

// Check if error is retryable
if (isRetryable(error.code)) {
  // retry logic
}
```

**Error Properties:**
```typescript
interface PDFError {
  code: PDFErrorCode;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  retryable: boolean;
  details?: Record<string, unknown>;
  timestamp: string;
}
```

---

### 3. Retry Logic with Exponential Backoff ✅

**Location:** `supabase/functions/_shared/pdf-retry.ts`

**Purpose:** Reliable retry mechanism for transient failures

**Features:**
- ✅ Exponential backoff (1s → 2s → 4s)
- ✅ Jitter to prevent thundering herd
- ✅ Configurable per operation type
- ✅ Comprehensive logging
- ✅ Type-safe retry functions

**Default Retry Configurations:**
```typescript
STORAGE_UPLOAD: {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  jitterMs: 500,
}

TEMPLATE_FETCH: {
  maxRetries: 2,
  initialDelayMs: 500,
  maxDelayMs: 2000,
  backoffMultiplier: 2,
  jitterMs: 200,
}

SIGNED_URL: {
  maxRetries: 2,
  initialDelayMs: 500,
  maxDelayMs: 2000,
  backoffMultiplier: 2,
  jitterMs: 200,
}

DB_UPDATE: {
  maxRetries: 2,
  initialDelayMs: 500,
  maxDelayMs: 3000,
  backoffMultiplier: 2,
  jitterMs: 300,
}
```

**API:**
```typescript
import { 
  retryStorageUpload,
  retryTemplateFetch,
  retrySignedUrl,
  withRetry
} from '../_shared/pdf-retry.ts';

// Retry storage upload (3 attempts, exponential backoff)
await retryStorageUpload(async () => {
  return await supabase.storage
    .from('generated-pdfs')
    .upload(path, pdfBytes);
});

// Retry template fetch (2 attempts)
await retryTemplateFetch(async () => {
  return await fetch(templateUrl);
});

// Custom retry configuration
await withRetry(
  () => dangerousOperation(),
  { maxRetries: 5, initialDelayMs: 2000 },
  'dangerous_operation'
);
```

**Logging:**
```json
{
  "event": "retry_attempt",
  "operation": "storage_upload",
  "attempt": 1,
  "maxRetries": 3,
  "timestamp": "2025-01-15T10:30:00.000Z"
}

{
  "event": "retry_failed",
  "operation": "storage_upload",
  "attempt": 1,
  "error": "Network timeout",
  "nextRetryIn": 2500,
  "timestamp": "2025-01-15T10:30:01.000Z"
}

{
  "event": "retry_success",
  "operation": "storage_upload",
  "successfulAttempt": 2,
  "timestamp": "2025-01-15T10:30:04.000Z"
}
```

---

## Integration Guidelines

### Using Shared Field Mappings in Edge Functions

**Before (Duplicated):**
```typescript
// In fill-pdf/index.ts
const POA_ADULT_PDF_MAP = {
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  // ... 50 more lines
};
```

**After (Centralized):**
```typescript
// In fill-pdf/index.ts
import { getFieldMapping } from '../_shared/pdf-field-maps.ts';

const fieldMap = getFieldMapping(templateType);
if (!fieldMap) {
  throw createPDFError(
    PDFErrorCode.INVALID_TEMPLATE_TYPE,
    `Unknown template: ${templateType}`
  );
}
```

### Using Error Codes

**Before (Generic):**
```typescript
throw new Error('Upload failed');
```

**After (Structured):**
```typescript
import { PDFErrorCode, createPDFError } from '../_shared/pdf-errors.ts';

throw createPDFError(
  PDFErrorCode.STORAGE_UPLOAD_FAILED,
  'Failed to upload PDF to storage',
  { 
    caseId, 
    templateType, 
    fileSize: pdfBytes.length,
    bucket: 'generated-pdfs'
  }
);
```

### Using Retry Logic

**Before (No Retry):**
```typescript
const { error } = await supabase.storage
  .from('generated-pdfs')
  .upload(path, pdfBytes);
  
if (error) throw error; // Fails on first transient error
```

**After (With Retry):**
```typescript
import { retryStorageUpload } from '../_shared/pdf-retry.ts';

const { error } = await retryStorageUpload(async () => {
  return await supabase.storage
    .from('generated-pdfs')
    .upload(path, pdfBytes);
});

if (error) {
  // Only fails after 3 attempts with exponential backoff
  throw createPDFError(
    PDFErrorCode.STORAGE_UPLOAD_FAILED,
    error.message,
    { attempts: 3 }
  );
}
```

---

## Performance Impact

### Expected Improvements

**Retry Logic:**
- ✅ **50-70% reduction** in transient failure rate
- ✅ **Better user experience** - fewer "try again" scenarios
- ✅ **Resilience** against temporary network issues

**Centralized Mappings:**
- ✅ **Faster deployments** - single file to update
- ✅ **Consistency** - same mappings in frontend and backend
- ✅ **Maintainability** - easier to add new templates

**Error Codes:**
- ✅ **Faster debugging** - precise error identification
- ✅ **Better monitoring** - track error patterns
- ✅ **User-friendly messages** - proper error communication

---

## Testing

### Unit Tests

```typescript
// Test field mapping retrieval
import { getFieldMapping, isValidTemplate } from './pdf-field-maps.ts';

console.assert(isValidTemplate('poa-adult') === true);
console.assert(isValidTemplate('invalid') === false);

const mapping = getFieldMapping('poa-adult');
console.assert(mapping !== null);
console.assert(mapping['applicant_given_names'] === 'applicant_first_name');
```

### Integration Tests

1. **Field Mapping Test**
   - Generate PDF with all template types
   - Verify all fields mapped correctly
   - Check alias normalization

2. **Error Handling Test**
   - Trigger each error code
   - Verify error structure
   - Check user messages

3. **Retry Logic Test**
   - Simulate transient failures
   - Verify retry attempts
   - Check exponential backoff timing

---

## Migration Notes

### Backward Compatibility

✅ All changes are **backward compatible**
- Existing fill-pdf function continues to work
- Can be integrated incrementally
- No breaking changes to API

### Next Steps (Phase 2 & 3)

**Phase 2 (Medium Risk):**
- Global template cache with TTL
- Connection pooling
- LRU cache eviction

**Phase 3 (Higher Risk):**
- Parallel field population
- Request timeout enforcement
- Performance monitoring

---

## Monitoring

### Metrics to Track

**Error Rates:**
```sql
SELECT 
  error_code,
  COUNT(*) as occurrences,
  AVG(CASE WHEN retried THEN 1 ELSE 0 END) as retry_rate
FROM pdf_generation_logs
WHERE timestamp > NOW() - INTERVAL '1 day'
GROUP BY error_code
ORDER BY occurrences DESC;
```

**Retry Success Rate:**
```sql
SELECT 
  operation_type,
  COUNT(*) FILTER (WHERE retry_count > 0) as retried,
  COUNT(*) FILTER (WHERE success AND retry_count > 0) as retry_success
FROM pdf_generation_logs
WHERE timestamp > NOW() - INTERVAL '1 day'
GROUP BY operation_type;
```

---

## Rollback Plan

If issues arise:

1. **Field Mappings Issues**
   - Revert to inline mappings in fill-pdf
   - No data loss risk

2. **Error Code Issues**
   - Switch back to generic errors
   - Logs still work

3. **Retry Logic Issues**
   - Disable retry wrappers
   - Falls back to single-attempt behavior

**Rollback Command:**
```bash
# Keep original fill-pdf as backup
git checkout main -- supabase/functions/fill-pdf/index.ts
```

---

## Documentation Links

- [Field Mappings Config](../src/config/pdfMappings/)
- [PDF lib Documentation](https://pdf-lib.js.org/)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

---

Last Updated: 2025-01-15
Phase: 1 (Core Improvements) ✅
Status: Complete
