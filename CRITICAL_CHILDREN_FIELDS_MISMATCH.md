# 🚨 CRITICAL SCHEMA MISMATCH DETECTED

## ❌ ISSUE: Inconsistent Children Field Names

### Problem:
Different forms use DIFFERENT field names for children data:

**IntakeForm uses:**
- `children_count` ✅ (exists in schema)
- `has_children` ❌ (NOT in schema - UI only)
- `minor_children_count` ❌ (NOT in schema - UI only)
- `has_minor_children` ❌ (NOT in schema - UI only)

**FamilyTreeForm & MasterDataTable use:**
- `applicant_children_count` ❌ (NOT in schema)
- `applicant_has_children` ❌ (NOT in schema)
- `applicant_minor_children_count` ❌ (NOT in schema)
- `applicant_has_minor_children` ❌ (NOT in schema)

**ACTUAL SCHEMA (master_table) has:**
- `children_count` ✅ (INTEGER)

### Impact:
- FamilyTreeForm and MasterDataTable are saving to NON-EXISTENT columns
- Data loss/corruption risk
- Schema error on save

### Required Fix:
1. Update sanitizer to remove all UI-only children fields:
   - `has_children`
   - `minor_children_count`
   - `has_minor_children`
   - `applicant_children_count`
   - `applicant_has_children`
   - `applicant_minor_children_count`
   - `applicant_has_minor_children`

2. Map all forms to use ONLY `children_count` for DB storage

3. Keep UI-only flags in component state but prevent DB save
