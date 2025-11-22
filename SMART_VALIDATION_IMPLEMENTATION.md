# Smart Document Validation - Implementation Summary

## Implemented Features ✅

### 1. Person Type Selection
- **New Component**: `PersonTypeSelector.tsx`
  - Allows selecting Applicant, Spouse, or Children (1-10)
  - Shows appropriate document type options based on person type
  - Visual warnings for adult passport requirements

### 2. Document Type Validation
- **Shared Rules**: `supabase/functions/_shared/validationRules.ts`
  - **Adults (Applicant/Spouse)**: MUST use valid passports only
  - **Children**: Can use either passport OR birth certificate
  - Clear error messages for invalid combinations

### 3. Passport Expiry Validation
- **Date Utils**: `supabase/functions/_shared/dateUtils.ts`
  - Parses DD.MM.YYYY format (Polish standard)
  - Validates passport expiry dates
  - Calculates days until expiry

- **Backend Validation**:
  - `ocr-passport/index.ts`: Image-based passport OCR with expiry check
  - `parse-document-ocr/index.ts`: PDF/Office document OCR with expiry check
  - Returns errors for expired adult passports
  - Returns warnings for passports expiring within 6 months

### 4. Frontend Integration
- **POAOCRScanner.tsx**: Updated workflow
  - Step 1: Select person type and document type
  - Step 2: Upload document
  - Step 3: Process with validation
  - Shows toast warnings/errors for validation failures

## How It Works

### For Applicant/Spouse:
1. User selects "Applicant" or "Spouse"
2. System shows warning: "Must provide VALID passport"
3. User uploads passport
4. Backend validates expiry date
5. If expired → **Error**: "Passport expired on DD.MM.YYYY"
6. If expiring soon (< 6 months) → **Warning**: "Expires in X days"
7. If valid → ✅ Proceed

### For Children:
1. User selects "Child 1", "Child 2", etc.
2. System shows two options: "Passport" or "Birth Certificate"
3. User uploads either document type
4. Backend extracts data (no expiry validation for children)
5. ✅ Proceed

## Validation Rules

| Person Type | Allowed Documents | Expiry Validation |
|------------|------------------|------------------|
| Applicant | Passport ONLY | ✅ Required |
| Spouse | Passport ONLY | ✅ Required |
| Children | Passport OR Birth Cert | ❌ Not required |

## Error Messages

1. **Expired Passport** (for adults):
   ```
   "Applicant passport expired on 15.03.2024. Please provide a valid passport."
   ```

2. **Birth Certificate for Adult**:
   ```
   "Birth certificates are not accepted for Applicant. Please upload a valid passport."
   ```

3. **Expiring Soon Warning**:
   ```
   "Warning: Passport expires soon on 20.09.2025 (145 days remaining). Consider renewing before applying."
   ```

## Files Modified/Created

### Created:
- `supabase/functions/_shared/dateUtils.ts`
- `supabase/functions/_shared/validationRules.ts`
- `src/components/poa/PersonTypeSelector.tsx`

### Modified:
- `supabase/functions/ocr-passport/index.ts`
- `supabase/functions/parse-document-ocr/index.ts`
- `src/components/poa/POAOCRScanner.tsx`

## Next Steps (Not Implemented)

1. **Multi-Person Wizard Flow**: Sequential scanning of applicant → spouse → children
2. **Validation Summary**: Before PDF generation, show all scanned documents
3. **Document History**: Track which person each document belongs to
4. **Batch Processing**: Upload multiple children's documents at once

## Testing Checklist

- [ ] Applicant with valid passport → Success
- [ ] Applicant with expired passport → Error
- [ ] Applicant with soon-to-expire passport → Warning + Success
- [ ] Applicant tries birth certificate → Error
- [ ] Spouse with valid passport → Success
- [ ] Child with passport → Success (even if expired)
- [ ] Child with birth certificate → Success
- [ ] Multiple children with different document types → Success
