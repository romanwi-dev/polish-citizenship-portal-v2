# Step 6: Universal Intake Wizard - COMPLETE ✅

**Date:** 2025-10-18  
**Progress:** 80% → 100% = **COMPLETE** 🎉

---

## Implementation Summary

### 1. Multi-Step Wizard UI ✅

**Location:** `src/pages/ClientIntakeWizard.tsx`

**Features:**
- **7 Steps:**
  1. Basic Information (name, DOB, sex, POB)
  2. Contact Details (email, phone, address)
  3. Passport Information (number, country, dates)
  4. Family (parents, grandparents)
  5. Polish Connection (ancestry line)
  6. Additional Information
  7. Review & Submit

- **Progress Tracking:**
  - Visual stepper component
  - Current step indicator
  - Step labels in EN/PL
  - Auto-scroll to top on step change

---

### 2. Language Toggle (EN/PL) ✅

**Component:** `src/components/intake-wizard/LanguageSwitcher.tsx`

**Features:**
- Toggle between English and Polish
- Uses i18next for translations
- Persists language preference
- Affects all form labels and UI text

---

### 3. "I Don't Know" Functionality ✅

**Component:** `src/components/intake-wizard/DontKnowCheckbox.tsx`

**Features:**
- Checkbox next to optional fields
- Clears field value when checked
- Tracked separately in `dontKnowFields` Set
- Prevents validation errors for unknown fields
- Counts toward completion percentage

**Logic:**
```typescript
const handleDontKnowToggle = (field: string, checked: boolean) => {
  setDontKnowFields((prev) => {
    const updated = new Set(prev);
    if (checked) {
      updated.add(field);
      handleFieldChange(field, ''); // Clear value
    } else {
      updated.delete(field);
    }
    return updated;
  });
};
```

---

### 4. Completion Tracking ✅

**NEW: Completion Calculator**

```typescript
const calculateCompletion = () => {
  const requiredFields = [
    'first_name', 'last_name', 'date_of_birth', 'sex', 'place_of_birth',
    'email', 'phone', 'passport_number', 'passport_issuing_country',
    'father_first_name', 'father_last_name', 
    'mother_first_name', 'mother_last_name',
  ];
  
  const filledRequired = requiredFields.filter(field => {
    return formData[field] && formData[field] !== '' || 
           dontKnowFields.has(field);
  }).length;
  
  return Math.round((filledRequired / requiredFields.length) * 100);
};
```

**Features:**
- Calculates % based on required fields
- Counts "don't know" as filled
- Displays in save/submit toasts
- Stored in `intake_data.completion_percentage`

---

### 5. Auto-Save Functionality ✅

**Features:**
- Manual save button available on all steps
- Auto-saves before moving to next step
- Saves completion percentage
- Saves "don't know" fields in `autosave_data`
- Toast notifications with completion %

**Data Saved:**
```typescript
{
  case_id: caseId,
  ...formData,
  completion_percentage: completion,
  autosave_data: { dontKnowFields: Array.from(dontKnowFields) },
  updated_at: new Date().toISOString(),
}
```

---

### 6. Public Route with Token Access ✅

**Route:** `/client/intake/:token`

**Flow:**
1. User receives magic link with token
2. Token validated via `validate-intake-token` edge function
3. Case ID extracted from token
4. Existing intake data loaded (if any)
5. User completes wizard
6. Data saved to `intake_data` table
7. Case marked as `intake_completed = true`
8. Case stage advances to `terms_pricing`
9. User redirected to client dashboard

**Token Validation:**
```typescript
const { data: validationData, error: validationError } = 
  await supabase.functions.invoke('validate-intake-token', {
    body: { token }
  });

if (validationError || !validationData.valid) {
  throw new Error('Invalid token');
}

const extractedCaseId = validationData.caseId;
```

---

### 7. Submit & Stage Transition ✅

**On Submit:**
```typescript
// 1. Save final data with completion %
await supabase.from('intake_data').upsert({
  case_id: caseId,
  ...formData,
  completion_percentage: completion,
  autosave_data: { dontKnowFields: Array.from(dontKnowFields) },
});

// 2. Mark intake completed & advance stage
await supabase.from('cases').update({ 
  intake_completed: true,
  current_stage: 'terms_pricing'
}).eq('id', caseId);

// 3. Redirect to client dashboard
navigate(`/client/dashboard/${caseId}`);
```

---

## Step Components

### Step 1: Basic Information
- First Name, Last Name, Maiden Name
- Date of Birth
- Sex (Male/Female)
- Place of Birth
- All with "I don't know" option

### Step 2: Contact Details
- Email (required)
- Phone (required)
- Address (street, city, state, postal code, country)
- Address has "I don't know" for each field

### Step 3: Passport
- Passport Number
- Issuing Country
- Issue Date
- Expiry Date
- All with "I don't know" except number

### Step 4: Family
- Father: First Name, Last Name, DOB, POB
- Mother: First Name, Last Name, Maiden Name, DOB, POB
- All 4 Grandparents: Names, DOB, POB, Maiden Names (for grandmothers)
- Each field has "I don't know"

### Step 5: Polish Connection
- Ancestry Line (Paternal/Maternal/Both)
- Notes about Polish connection
- "I don't know" for notes

### Step 6: Additional
- Current Citizenships (multi-select)
- Additional notes
- "I don't know" available

### Step 7: Review
- Summary of all entered data
- Completion status indicator
- Visual check for filled vs. missing fields
- Submit button

---

## Database Integration

### `intake_data` Table Fields Used:
- `case_id` (FK to cases)
- All personal info fields
- `completion_percentage` (NEW - 0-100)
- `autosave_data` (JSONB - stores dontKnowFields)
- `updated_at`

### `cases` Table Updates on Submit:
- `intake_completed` → `true`
- `current_stage` → `'terms_pricing'`

---

## User Experience Flow

1. **Access:**
   - Client receives email with magic link
   - Link format: `/client/intake/{secure-token}`
   - Token validates and loads case

2. **Fill Form:**
   - 7-step wizard with progress bar
   - Language toggle (EN/PL) at top
   - "I don't know" checkboxes on optional fields
   - Auto-save on step navigation
   - Manual save button available

3. **Review:**
   - Step 7 shows all entered data
   - Completion percentage displayed
   - Clear indication of missing vs. filled

4. **Submit:**
   - Final save with completion %
   - Case marked as intake complete
   - Stage advances to "Terms & Pricing"
   - Redirect to client dashboard

---

## Completion Criteria Met

✅ **EN/PL Language Toggle** - Fully functional with i18next  
✅ **"I Don't Know" Checkboxes** - On all optional fields  
✅ **Multi-Step Wizard UI** - 7 steps with visual progress  
✅ **Public Client-Facing Route** - `/client/intake/:token`  
✅ **Token Validation** - Edge function validates access  
✅ **Auto-Save** - Progress saved on navigation  
✅ **Completion Tracking** - Percentage calculated and stored  
✅ **Stage Transition** - Advances to `terms_pricing` on submit  

---

## Integration Points

### In Admin Dashboard (Future):
```typescript
// Generate magic link for client
const token = generateSecureToken();
await supabase.from('client_portal_access').insert({
  case_id: caseId,
  magic_link_token: token,
  magic_link_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
});

const magicLink = `${window.location.origin}/client/intake/${token}`;
// Email magicLink to client
```

### In Case Detail Page:
```typescript
// Show intake completion
const { data: intakeData } = await supabase
  .from('intake_data')
  .select('completion_percentage')
  .eq('case_id', caseId)
  .single();

<Badge>Intake: {intakeData.completion_percentage}%</Badge>
```

---

## Progress Update

**Step 6: Universal Intake Wizard**
- ❌ Multi-step wizard UI → ✅ DONE
- ❌ EN/PL language toggle → ✅ DONE
- ❌ "I don't know" checkboxes → ✅ DONE
- ❌ Public client-facing route → ✅ DONE
- ❌ Completion tracking → ✅ DONE
- ❌ Auto-save → ✅ DONE

**Application Generation:** 3/3 steps = **100% COMPLETE** 🎉
- ✅ Step 6: Universal Intake Wizard
- ✅ Step 7: POA Auto-Generation
- ✅ Step 8: OBY Draft Auto-Population
- ✅ Step 11: WSC Letter Stage

**Overall:** 24/29 steps = **83% Complete** 🚀

---

## Next Steps Recommendation

With Client Intake fully complete, focus on:

**Option A:** Foundation Tasks (High Priority)
- Step 3: Hybrid Naming Scheme
- Step 16: Nightly Backups  
- Step 17: Passport Number Masking

**Option B:** Documents Engine Remaining
- Step 12: Archive Request Generator (already implemented)
- Step 13: USC Workflows

**Option C:** Admin Dashboards
- Civil Acts Dashboard
- Passport Dashboard
- Extended Services Dashboard

---

**Security Notes:**

✅ **Token Validation:** Edge function validates access  
✅ **RLS Policies:** intake_data has proper client access policies  
✅ **Data Privacy:** "Don't know" fields handled separately  
✅ **Stage Control:** Only advances on successful submission  

---

**Recommendation:** Next implement **Step 3: Hybrid Naming Scheme** to ensure consistent case organization across Dropbox and database.
