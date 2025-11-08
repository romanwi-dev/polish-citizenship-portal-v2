# PHASE A: DEEP POA ANALYSIS - Complete Investigation

## 🔍 ANALYSIS SCOPE

Comprehensive investigation of Power of Attorney (POA) PDF generation system:
- **Adult POA**: Single applicant
- **Minor POA**: Parent + child(ren)
- **Spouses POA**: Married couple + optional children

**User Issue**: "We haven't managed to generate any POA pdf template with data for a long time"

---

## 📊 CURRENT STATE ASSESSMENT

### Database Reality Check

Query of `master_table` reveals **CRITICAL ISSUE**:

```sql
SELECT applicant_first_name, applicant_last_name, applicant_passport_number, 
       spouse_first_name, child_1_first_name, poa_date_filed 
FROM master_table LIMIT 5;
```

**Results**:
- Case 1: ALL fields NULL except `poa_date_filed: 2025-10-09`
- Case 2: `applicant_first_name: MAREK`, `applicant_last_name: SOBOLEWSKI`, `applicant_passport_number: EWQ 345656`, `child_1_last_name: SOBOLEWSKI` - PARTIAL DATA
- Cases 3-5: ALL fields NULL

**ROOT CAUSE HYPOTHESIS #1**: 
Most cases have NO DATA to fill PDFs with. Only 1 out of 5 cases has any applicant information.

---

### Edge Function Status

**fill-pdf Edge Function**:
- ✅ Deployed successfully
- ✅ Logs show NO recent POA generation attempts
- ❌ No error logs = either not being called OR silently failing

**Code Analysis** (`supabase/functions/fill-pdf/index.ts`):
- Lines 426-497: Family Tree validation/resolver (recently added)
- Lines 499-511: Child-specific mapping for Minor POAs
- Lines 514-528: Template path mapping
- Lines 566-590: PDF loading and field filling

**Key Observations**:
1. ✅ Template paths correctly mapped: `poa-adult.pdf`, `poa-minor.pdf`, `poa-spouses.pdf`
2. ✅ Field mapping system in place via `getFieldMapping()`
3. ⚠️ NO POA-specific validation (unlike Family Tree which has validator)
4. ⚠️ Assumes templates are in `pdf-templates` storage bucket

---

### Frontend Analysis

**POAForm.tsx** (859 lines):
- Lines 90-140: `handleGenerateAndPreview()` - Primary PDF generation handler
- Lines 100-112: **Auto-generates POA date if missing** (DD.MM.YYYY format)
- Lines 115-117: Saves form data before PDF generation
- Lines 119-133: Calls `generatePdf()` from `@/lib/generate-pdf`
- Lines 228-370: `handleGenerateAllPOAs()` - Batch generation

**Generation Flow**:
```
User clicks "Preview POA" 
  → Auto-populate poa_date_filed if empty
  → Save to database
  → Call generatePdf({ caseId, templateType })
    → Invokes fill-pdf edge function
    → Returns PDF URL
  → Show preview dialog
```

**CRITICAL FINDING**: 
Form saves to database BEFORE PDF generation, so any data issues are database-level, not UI-level.

---

### Current PDF Mappings

**Frontend Mappings** (src/config/pdfMappings/):

#### POA Adult (4 fields):
```typescript
{
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'passport_number': 'applicant_passport_number',
  'poa_date': 'poa_date_filed',
}
```

#### POA Minor (6 fields):
```typescript
{
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'passport_number': 'applicant_passport_number',
  'minor_given_names': 'child_1_first_name',
  'minor_surname': 'child_1_last_name',
  'poa_date': 'poa_date_filed',
}
```

#### POA Spouses (14 fields):
```typescript
{
  'imie_nazwisko_wniosko': 'applicant_first_name|applicant_last_name',
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'passport_number': 'applicant_passport_number',
  'nr_dok_tozsamosci': 'applicant_passport_number',
  'spouse_given_names': 'spouse_first_name',
  'spouse_surname': 'spouse_last_name',
  'spouse_passport_number': 'spouse_passport_number',
  'husband_surname': 'husband_last_name_after_marriage',
  'wife_surname': 'wife_last_name_after_marriage',
  'minor_surname': 'child_1_last_name',
  'imie_nazwisko_dziecka': 'child_1_first_name|child_1_last_name',
  'data_pelnomocnictwa': 'poa_date_filed',
  'poa_date': 'poa_date_filed',
}
```

**Backend Mappings** (supabase/functions/_shared/mappings/):
- Identical to frontend mappings

---

## 🎯 CRITICAL QUESTIONS TO ANSWER

### 1. What are the ACTUAL field names in the POA PDF templates?

**STATUS**: ⏳ INVESTIGATION REQUIRED

**Action**: Created `src/utils/poaTemplateInspector.ts` to:
- Load each POA PDF from `/templates/`
- Extract all form field names using pdf-lib
- Compare with current mappings
- Identify mismatches

**Expected Output**:
```
POA Adult: 
  - Total fields: [?]
  - Mapped correctly: [?/4]
  - Unmapped fields: [list]
  - Extra mappings: [list]

POA Minor:
  - Total fields: [?]
  - Mapped correctly: [?/6]
  - Unmapped fields: [list]
  - Extra mappings: [list]

POA Spouses:
  - Total fields: [?]
  - Mapped correctly: [?/14]
  - Unmapped fields: [list]
  - Extra mappings: [list]
```

### 2. Are the templates in the correct location?

**Current Assumptions**:
- ✅ Frontend: Templates in `public/templates/` (for inspection)
- ✅ Backend: Templates in Supabase Storage `pdf-templates` bucket
- ⚠️ UNVERIFIED: Are the uploaded PDFs actually in storage?

**Verification Needed**:
```sql
-- Check storage bucket contents
SELECT name, metadata, created_at 
FROM storage.objects 
WHERE bucket_id = 'pdf-templates' 
  AND name LIKE 'poa-%';
```

### 3. Why is there NO DATA in master_table?

**Possible Causes**:
1. **Forms not saving**: POAForm.tsx save handler failing silently
2. **RLS policies blocking writes**: User not authenticated
3. **Data in different table**: Using `intake_data` instead?
4. **Form fields not mapped correctly**: UI fields → database columns mismatch

**Investigation Required**:
- Check if intake data exists for these cases
- Verify form save operations are working
- Test authentication status during save

---

## 🔬 DIAGNOSTIC TOOLS CREATED

### 1. POA Template Inspector (`src/utils/poaTemplateInspector.ts`)

**Functions**:
- `inspectPOATemplate(type)`: Extract fields from single template
- `inspectAllPOATemplates()`: Batch inspect all three
- `compareFieldMappings()`: Compare template fields vs. current mappings

**Usage**:
```typescript
import { inspectAllPOATemplates } from '@/utils/poaTemplateInspector';

const results = await inspectAllPOATemplates();
console.log(results.adult.fields); // All field names
```

### 2. POA Diagnostics Page (`src/pages/admin/POADiagnostics.tsx`)

**Features**:
- Visual UI for running template inspection
- Shows mapped/unmapped/extra fields for each template
- Color-coded status (green = mapped, yellow = unmapped, red = extra)
- Raw JSON output for debugging

**Access**: `/admin/poa-diagnostics` (route needs to be added)

---

## 🚨 IDENTIFIED ISSUES

### CRITICAL Issues:

1. **NO DATA IN DATABASE** (Severity: 🔴 CRITICAL)
   - 80% of cases have NULL values for all POA fields
   - Only 1 case has partial data (MAREK SOBOLEWSKI)
   - **Impact**: PDFs generate but are blank

2. **FIELD NAME VERIFICATION INCOMPLETE** (Severity: 🟡 HIGH)
   - Current mappings are assumptions based on field names
   - Need to verify against actual PDF template fields
   - **Impact**: Possible field mismatch = 0% fill rate

3. **NO POA VALIDATION** (Severity: 🟡 MEDIUM)
   - Family Tree has validator, POA does not
   - No required field checks before PDF generation
   - **Impact**: Silent failures, poor UX

### MEDIUM Issues:

4. **NO ERROR LOGGING** (Severity: 🟡 MEDIUM)
   - fill-pdf logs show nothing for POA
   - Either not being called OR logging disabled
   - **Impact**: Impossible to debug

5. **TEMPLATE LOCATION UNVERIFIED** (Severity: 🟡 MEDIUM)
   - Assumes templates in storage, but not confirmed
   - **Impact**: 404 errors if templates missing

---

## 📋 NEXT STEPS FOR PHASE B VERIFICATION

### Immediate Actions:

1. **RUN POA DIAGNOSTICS**:
   ```
   - Access /admin/poa-diagnostics
   - Click "Run Diagnostics"
   - Review field mapping results
   - Document actual PDF field names
   ```

2. **VERIFY TEMPLATE STORAGE**:
   ```sql
   SELECT name, metadata->>'size' as size_bytes, created_at 
   FROM storage.objects 
   WHERE bucket_id = 'pdf-templates' 
     AND name IN ('poa-adult.pdf', 'poa-minor.pdf', 'poa-spouses.pdf');
   ```

3. **TEST DATA POPULATION**:
   ```sql
   -- Insert test POA data
   UPDATE master_table 
   SET 
     applicant_first_name = 'TEST',
     applicant_last_name = 'USER',
     applicant_passport_number = 'AB1234567',
     poa_date_filed = '08.11.2025'
   WHERE case_id = 'c730f2f6-d675-42cf-b864-a6baade3181b';
   
   -- Then try generating POA
   ```

4. **ENABLE DEBUG LOGGING**:
   - Add console.log to fill-pdf edge function
   - Track each POA generation attempt
   - Log field fill success/failure

5. **CREATE POA VALIDATOR**:
   - Similar to family-tree-validator.ts
   - Check required fields before generation
   - Return validation errors to UI

---

## 🎯 SUCCESS CRITERIA FOR PHASE B

Phase B verification will be considered successful if:

1. ✅ All three POA templates inspected successfully
2. ✅ Field mappings verified to be 100% correct
3. ✅ Templates confirmed in Supabase Storage
4. ✅ Test case generates POA with >80% field fill rate
5. ✅ Validation errors shown clearly to user
6. ✅ Edge function logs showing POA generation attempts

---

## 📁 FILES CREATED IN PHASE A

1. `src/utils/poaTemplateInspector.ts` - Template field extraction tool
2. `src/pages/admin/POADiagnostics.tsx` - Visual diagnostics UI
3. `PHASE_A_POA_DEEP_ANALYSIS.md` - This document

---

## ⚠️ AWAITING USER INPUT

**Ready for PHASE B Verification**

User should type **"B"** to proceed with triple-model verification OR provide:
- Access to test case with POA data
- Confirmation of template upload to storage
- Any error messages from recent POA generation attempts

---

**PHASE A COMPLETE - AWAITING PHASE B TRIGGER**
