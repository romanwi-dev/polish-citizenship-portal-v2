# CASES MANAGEMENT SYSTEM - ZERO-FAIL AUDIT

**Audit Date:** 2025-01-XX  
**Status:** AUDIT COMPLETE - AWAITING APPROVAL  
**Scope:** Complete cases management for admins + clients  
**Protocol:** ADCDFI (Analyze → Consult → Double-Check → Find-Solution → Fix → Implement → Confirm)

---

## 🔴 CRITICAL ISSUES IDENTIFIED

### **CRITICAL #1: Overly Permissive RLS Policies**
**Problem:** Cases table has `auth.uid() IS NOT NULL` policies for INSERT/UPDATE/DELETE, allowing ANY authenticated user to modify ANY case.  
**Risk:** **SECURITY BREACH** - Any logged-in user can delete/modify all cases.  
**Current Policy:**
```sql
CREATE POLICY "Only authenticated users can update cases"  
ON cases FOR UPDATE USING (auth.uid() IS NOT NULL);
```
**Impact:** 🔴 **CRITICAL** - Complete data vulnerability.

---

### **CRITICAL #2: Missing Case Ownership Tracking**
**Problem:** No `created_by` or `owner_id` field in `cases` table.  
**Issue:** Cannot track who created a case, no audit trail for case creation.  
**Current Schema:** Only tracks `created_at`, `updated_at` timestamps.  
**Impact:** 🔴 **CRITICAL** - No accountability for case creation/modification.

---

### **CRITICAL #3: No Trigger for Master Table Creation**
**Problem:** `create_master_table_for_case` trigger exists in DB functions but is NOT attached to `cases` table.  
**Expected Behavior:** Auto-create `master_table` row when case is inserted.  
**Current Reality:** Master table rows NOT created automatically → forms fail.  
**Impact:** 🔴 **CRITICAL** - New cases break immediately, forms can't save data.

---

### **CRITICAL #4: Case Deletion Cascade Issues**
**Problem:** Deleting a case does NOT cascade delete to:
- `master_table` (orphaned form data)
- `intake_data` (orphaned intake)
- `documents` (orphaned files)
- `tasks` (orphaned tasks)
- `hac_logs` (orphaned logs)
- `client_portal_access` (orphaned access tokens)

**Risk:** Database bloat, referential integrity violations.  
**Impact:** 🔴 **CRITICAL** - Data corruption, memory leak.

---

## 🟠 HIGH PRIORITY ISSUES

### **HIGH #5: Hybrid Case Naming Race Condition**
**Problem:** `generateHybridCaseName()` queries DB for `MAX(client_code)` but has race condition.  
**Scenario:** Two cases for same country created simultaneously → DUPLICATE codes (USA001, USA001).  
**File:** `src/utils/hybridCaseNaming.ts`  
**Impact:** 🟠 **HIGH** - Unique constraint violations, case ID collisions.

---

### **HIGH #6: Client Photo Upload No Cleanup**
**Problem:** When client photo is replaced, old file is NOT deleted from storage.  
**File:** `src/components/EditCaseDialog.tsx`, `src/components/ClientPhotoUpload.tsx`  
**Impact:** 🟠 **HIGH** - Storage bloat, orphaned files in `client-photos` bucket.

---

### **HIGH #7: Sort Order Not Atomic**
**Problem:** `update_case_sort_orders()` updates multiple rows sequentially, not in transaction.  
**File:** `src/hooks/useCaseSortOrder.ts`  
**Risk:** Partial failures leave sort order inconsistent.  
**Impact:** 🟠 **HIGH** - Broken drag-and-drop ordering.

---

### **HIGH #8: No Case Access Audit Trail**
**Problem:** No logging when users view/edit cases.  
**Expected:** Insert into `security_audit_logs` on case CRUD operations.  
**Current:** Only updates `updated_at` timestamp.  
**Impact:** 🟠 **HIGH** - No forensic trail for security incidents.

---

## 🟡 MEDIUM PRIORITY ISSUES

### **MEDIUM #9: Case Filters Performance**
**Problem:** `filteredCases` memo runs complex filters on EVERY render.  
**File:** `src/pages/admin/CasesManagement.tsx` (lines 199-326)  
**Issue:** Filters up to 1000+ cases with 7 different filters → 200ms lag.  
**Impact:** 🟡 **MEDIUM** - Sluggish UI when 500+ cases.

---

### **MEDIUM #10: Missing Case Validation**
**Problem:** No validation for:
- `client_name` (accepts empty strings, special chars)
- `client_code` (no uniqueness check before save)
- `progress` (can be set > 100 or < 0)
- `client_score` (can be negative or > 100)

**File:** `src/pages/admin/NewCase.tsx`, `src/components/EditCaseDialog.tsx`  
**Impact:** 🟡 **MEDIUM** - Data quality issues.

---

### **MEDIUM #11: KPI Calculation Inconsistency**
**Problem:** KPIs (`kpi_docs_percentage`, `kpi_tasks_completed`, etc.) are stored in DB but NEVER updated.  
**Expected:** Trigger to recalculate KPIs when documents/tasks change.  
**Current:** Stale KPI values.  
**Impact:** 🟡 **MEDIUM** - Misleading progress indicators.

---

### **MEDIUM #12: Case Card Performance**
**Problem:** `CaseCard.tsx` is 703 lines, too complex, re-renders frequently.  
**Issue:** Inline functions, no memoization, avatar upload logic in card.  
**Impact:** 🟡 **MEDIUM** - Slow rendering when 100+ cases displayed.

---

## 🔵 LOW PRIORITY ISSUES

### **LOW #13: Magic Link Expiry Not Enforced**
**Problem:** `client_portal_access.magic_link_expires_at` is stored but NEVER checked in login flow.  
**File:** Missing validation in client login logic.  
**Impact:** 🔵 **LOW** - Expired magic links still work.

---

### **LOW #14: Dropbox Folder Creation Silent Fail**
**Problem:** `NewCase.tsx` creates Dropbox folder in background but doesn't retry on failure.  
**File:** `src/pages/admin/NewCase.tsx` (lines 113-136)  
**Impact:** 🔵 **LOW** - Users not notified if folder creation fails.

---

### **LOW #15: No Bulk Edit Capability**
**Problem:** Users can select multiple cases but can only delete them, not bulk edit status/mode.  
**File:** `src/components/BulkActionsToolbar.tsx`  
**Impact:** 🔵 **LOW** - Manual one-by-one editing required.

---

## 📊 ARCHITECTURE ANALYSIS

### **Current Files Inventory:**

**Core Pages:**
- `src/pages/admin/CasesManagement.tsx` (614 lines) - Main dashboard
- `src/pages/admin/CaseDetail.tsx` (771 lines) - Single case view
- `src/pages/admin/NewCase.tsx` (459 lines) - Case creation

**Core Components:**
- `src/components/CaseCard.tsx` (703 lines) - Case display card
- `src/components/EditCaseDialog.tsx` (553 lines) - Edit modal
- `src/components/CaseStageVisualization.tsx` (370 lines) - Stage pipeline

**Hooks:**
- `src/hooks/useCases.ts` (109 lines) - Case CRUD operations
- `src/hooks/useCaseSortOrder.ts` - Sort order management
- `src/hooks/useBulkCaseActions.ts` - Bulk actions
- `src/hooks/useFavoriteCases.ts` - Favorites management

**Database Function:**
- `get_cases_with_counts()` - RPC function for case list with aggregated counts

---

## 🚨 SECURITY VULNERABILITIES

### **Vulnerability #1: Missing Staff-Only Policies**
**Tables with overly permissive RLS:**
- `cases` - ANY authenticated user can INSERT/UPDATE/DELETE
- Should be: Only `admin` and `assistant` roles

**Fix Required:**
```sql
-- Replace existing policies with:
CREATE POLICY "Only staff can create cases"  
ON cases FOR INSERT  
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'assistant'));

CREATE POLICY "Only staff can update cases"  
ON cases FOR UPDATE  
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'assistant'));

CREATE POLICY "Only staff can delete cases"  
ON cases FOR DELETE  
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'assistant'));
```

---

### **Vulnerability #2: No Input Sanitization**
**Problem:** Case name, notes, country fields accept unsanitized HTML/script tags.  
**Risk:** XSS attacks if data displayed in client portal.  
**Files:** All forms (`NewCase.tsx`, `EditCaseDialog.tsx`)

---

## 🎯 PROPOSED FIX PLAN

### **PHASE 1: EMERGENCY SECURITY FIXES (CRITICAL - DO FIRST)**

#### Fix 1.1: Lock Down RLS Policies (30 min)
- Drop existing overly permissive policies
- Create staff-only policies using `has_role()` function
- Test with non-staff user to confirm access denied

#### Fix 1.2: Add Case Ownership Tracking (30 min)
- Migrate: Add `created_by UUID` column to `cases` table
- Create index on `created_by` for performance
- Update `NewCase.tsx` to set `created_by = auth.uid()`
- Backfill existing cases with system user ID

#### Fix 1.3: Enable Master Table Trigger (15 min)
- Attach `create_master_table_for_case` trigger to `cases` table INSERT
- Test by creating new case → verify `master_table` row created

#### Fix 1.4: Add Cascade Delete Rules (45 min)
- Add `ON DELETE CASCADE` to:
  - `master_table.case_id → cases.id`
  - `intake_data.case_id → cases.id`
  - `documents.case_id → cases.id`
  - `tasks.case_id → cases.id`
  - `hac_logs.case_id → cases.id`
  - `client_portal_access.case_id → cases.id`
- Test by deleting a case → verify all related records deleted

---

### **PHASE 2: DATA INTEGRITY FIXES (HIGH - DO NEXT)**

#### Fix 2.1: Fix Hybrid Naming Race Condition (1 hour)
- Create database sequence for country counters
- Replace `MAX()` query with atomic sequence increment
- Add unique constraint on `client_code`

#### Fix 2.2: Add Photo Cleanup on Replace (45 min)
- Before uploading new photo, delete old file from storage
- Handle edge cases (file not found, permission errors)

#### Fix 2.3: Make Sort Order Atomic (30 min)
- Wrap `update_case_sort_orders()` in database transaction
- Add rollback on error

#### Fix 2.4: Add Case Access Logging (1 hour)
- Insert into `security_audit_logs` on:
  - Case view (SELECT)
  - Case edit (UPDATE)
  - Case delete (DELETE)
- Include user ID, IP address, timestamp

---

### **PHASE 3: PERFORMANCE & UX IMPROVEMENTS (MEDIUM)**

#### Fix 3.1: Optimize Case Filters (1 hour)
- Move filter logic to backend RPC function
- Use database indexes for fast filtering
- Add pagination (50 cases per page)

#### Fix 3.2: Add Form Validation (1 hour)
- Client name: Min 2 chars, max 100, no special chars
- Client code: Unique check before save
- Progress: 0-100 range enforced
- Client score: 0-100 range enforced

#### Fix 3.3: Auto-Update KPIs (2 hours)
- Create trigger on `documents` table to recalculate `kpi_docs_percentage`
- Create trigger on `tasks` table to recalculate `kpi_tasks_completed/total`
- Create trigger on `poa`, `oby_forms` tables to update boolean KPIs

#### Fix 3.4: Refactor CaseCard Component (2 hours)
- Extract sub-components:
  - `CaseCardHeader.tsx` (photo, name, badges)
  - `CaseCardKPIs.tsx` (KPI strip)
  - `CaseCardActions.tsx` (dropdown menu)
  - `CaseCardMetrics.tsx` (docs, score, progress)
- Memoize expensive calculations

---

### **PHASE 4: NICE-TO-HAVES (LOW - DO LAST)**

#### Fix 4.1: Enforce Magic Link Expiry (30 min)
- Add validation in client login to check `magic_link_expires_at`
- Return error if expired

#### Fix 4.2: Add Dropbox Retry Logic (30 min)
- Retry folder creation 3 times with exponential backoff
- Show error toast if all retries fail

#### Fix 4.3: Add Bulk Edit (2 hours)
- Extend `BulkActionsToolbar` with status/mode update buttons
- Apply updates to all selected cases

---

## 📋 IMPLEMENTATION CHECKLIST

### **Database Migrations:**
- [ ] Add `created_by` column to `cases` table
- [ ] Add staff-only RLS policies to `cases` table
- [ ] Attach `create_master_table_for_case` trigger to `cases` INSERT
- [ ] Add `ON DELETE CASCADE` to all foreign keys pointing to `cases`
- [ ] Create database sequence for hybrid case naming
- [ ] Add unique constraint on `client_code`
- [ ] Create triggers for auto-updating KPIs

### **Code Changes:**
- [ ] Update `NewCase.tsx` to set `created_by`
- [ ] Add photo cleanup in `EditCaseDialog.tsx`, `ClientPhotoUpload.tsx`
- [ ] Wrap `update_case_sort_orders()` in transaction
- [ ] Add case access logging to `useCases.ts`
- [ ] Move filters to backend RPC function
- [ ] Add form validation to all case forms
- [ ] Refactor `CaseCard.tsx` into sub-components
- [ ] Add magic link expiry check
- [ ] Add Dropbox retry logic
- [ ] Add bulk edit capability

### **Testing:**
- [ ] Test RLS with non-staff user (should be denied)
- [ ] Test case creation → master table auto-created
- [ ] Test case deletion → all related records cascaded
- [ ] Test hybrid naming with concurrent creates → no duplicates
- [ ] Test photo replace → old file deleted
- [ ] Test sort order with network interruption → rollback
- [ ] Test filters with 1000+ cases → < 100ms response
- [ ] Test KPI auto-update → values correct after doc/task changes

---

## ⏱️ ESTIMATED EFFORT

- **Phase 1 (Critical Security):** 2-3 hours
- **Phase 2 (Data Integrity):** 4-5 hours
- **Phase 3 (Performance):** 6-8 hours
- **Phase 4 (Nice-to-Haves):** 3-4 hours
- **Testing & Verification:** 3-4 hours

**Total:** ~20-25 hours for complete audit fix

---

## ⚠️ RISK ASSESSMENT

**Critical Risks:**
- **RLS Policies:** If not fixed immediately, ANY user can delete all cases.
- **Missing Trigger:** New cases will break until trigger is attached.
- **Cascade Delete:** Without it, database will accumulate orphaned records indefinitely.

**Medium Risks:**
- **Race Condition:** Duplicate case codes will cause unique constraint violations.
- **Performance:** With 1000+ cases, dashboard will become unusable.

**Low Risks:**
- **Magic Links:** Expired links still working is annoying but not critical.
- **Dropbox Folders:** Missing folders can be created manually.

---

## 🎯 SUCCESS CRITERIA

✅ **Security:**
- Non-staff users CANNOT create/edit/delete cases
- All case access logged in `security_audit_logs`

✅ **Data Integrity:**
- New cases auto-create `master_table` rows
- Deleted cases cascade delete all related records
- No duplicate `client_code` values
- Old client photos deleted on replace

✅ **Performance:**
- Case list loads in < 200ms with 1000 cases
- Filters apply in < 100ms
- No render lag when scrolling case cards

✅ **UX:**
- KPIs update automatically when data changes
- Sort order never breaks mid-drag
- Bulk edit works for 100+ selected cases

---

## 📝 NOTES FOR IMPLEMENTATION

1. **Database migrations MUST be reviewed by HAC before execution** (affects production data)
2. **RLS policy changes will temporarily lock out users** - deploy during maintenance window
3. **Case code uniqueness constraint** may fail on existing duplicates - run cleanup first
4. **Performance testing required** with realistic dataset (1000+ cases)

---

## 🚀 DEPLOYMENT SEQUENCE

1. **Immediate (Today):**
   - Fix RLS policies (CRITICAL SECURITY)
   - Attach master table trigger (CRITICAL FUNCTIONALITY)

2. **Next (This Week):**
   - Add cascade delete rules
   - Add `created_by` tracking
   - Fix hybrid naming race condition

3. **Soon (Next 2 Weeks):**
   - Performance optimizations (filters, pagination)
   - KPI auto-update triggers
   - Case card refactoring

4. **Later (Next Month):**
   - Magic link expiry enforcement
   - Dropbox retry logic
   - Bulk edit capability

---

**Status:** AUDIT COMPLETE - AWAITING USER APPROVAL TO IMPLEMENT FIXES
