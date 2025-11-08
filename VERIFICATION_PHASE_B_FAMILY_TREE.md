# PHASE B: TRIPLE-MODEL VERIFICATION REQUEST
## Family Tree PDF Generation System - Complete Architecture

---

## 📋 VERIFICATION REQUEST SUMMARY

**Task**: Verify the complete architecture and implementation plan for Family Tree PDF generation system

**Scope**: 
- PDF field mapping accuracy
- Dynamic bloodline resolution logic
- Database schema requirements
- Data validation workflow
- Integration with existing fill-pdf system

**Critical Decision Points**:
1. Should we add missing marriage date fields to database?
2. Is the dynamic bloodline resolver architecture correct?
3. Are there edge cases we're missing in Polish bloodline logic?
4. Is the validation workflow comprehensive enough?

---

## 🔍 CURRENT STATE ANALYSIS

### 1. PDF Template (family-tree.pdf)
**Status**: ✅ Uploaded and inspected
**Total Fields**: 38 fields (all text fields, type "t")

**Field Categories**:
- Applicant: 5 fields (name, DOB, POB, marriage date/place)
- Spouse: 1 field (full name with maiden name)
- Polish Parent: 7 fields (name, spouse, DOB, POB, marriage, emigration, naturalization)
- Polish Grandparent: 7 fields (name, spouse, DOB, POB, marriage, emigration, naturalization)
- Great-Grandparents: 8 fields (both names, DOB, POB, marriage, emigration, naturalization)
- Minor Children: 10 fields (3 children × name/DOB/POB, but only child_3 missing POB)

**PDF Field List** (from actual inspection):
```
applicant_full_name
applicant_date_of_birth
applicant_place_of_birth
applicant_date_of_marriage
applicant_place_of_marriage
applicant_spouse_full_name_and_maiden_name
polish_parent_full_name
polish_parent_spouse_full_name
polish_parent_date_of_birth
polish_parent_place_of_birth
polish_parent_date_of_marriage
polish_parent_place_of_marriage
polish_parent_date_of_emigration
polish_parent_date_of_naturalization
polish_grandparent_full_name
polish_grandparent_spouse_full_name
polish_grandparent_date_of_birth
polish_grandparent_place_of_birth
polish_grandparent_date_of_mariage [sic - typo in PDF]
polish_grandparent_place_of_mariage [sic - typo in PDF]
polish_grandparent_date_of_emigration
polish_grandparent_date_of_naturalization
great_grandfather_full_name
great_grandmother_full_name
great_grandfather_date_of_birth
great_grandfather_place_of_birth
great_grandfather_date_of_marriage
great_grandfather_place_of_marriage
great_grandfather_date_of_emigartion [sic - typo in PDF]
great_grandfather_date_of_naturalization
minor_1_full_name
minor_1_date_of_birth
minor_1_place_of_birth
minor_2_full_name
minor_2_date_of_birth
minor_2_place_of_birth
minor_3_full_name
minor_3_date_of_birth
```

### 2. Current Field Mappings
**File**: `supabase/functions/_shared/mappings/family-tree.ts`

**Current Mapping Strategy**: STATIC (always maps to father/PGF/PGGF)

```typescript
export const FAMILY_TREE_PDF_MAP: Record<string, string> = {
  'polish_parent_full_name': 'father_first_name|father_last_name',
  'polish_grandparent_full_name': 'pgf_first_name|pgf_last_name',
  'great_grandfather_full_name': 'pggf_first_name|pggf_last_name',
  // ... etc
};
```

**Problem**: This doesn't account for cases where:
- Mother is the Polish parent (should map to mother/MGF/MGGF)
- Both parents are Polish (unclear which to show)
- Neither parent is Polish (should show error)

### 3. Database Schema (master_table)
**Existing Fields** (relevant to Family Tree):
```typescript
// Applicant
applicant_first_name, applicant_last_name, applicant_dob, applicant_pob
applicant_sex, date_of_marriage, place_of_marriage

// Spouse
spouse_first_name, spouse_last_name

// Father
father_first_name, father_last_name, father_dob, father_pob
father_is_polish, father_date_of_emigration, father_date_of_naturalization

// Mother
mother_first_name, mother_maiden_name, mother_dob, mother_pob
mother_is_polish, mother_date_of_emigration, mother_date_of_naturalization

// Paternal Grandparents (PGF/PGM)
pgf_first_name, pgf_last_name, pgf_dob, pgf_pob
pgf_is_polish, pgf_date_of_emigration, pgf_date_of_naturalization
pgm_first_name, pgm_maiden_name, pgm_dob, pgm_pob

// Maternal Grandparents (MGF/MGM)
mgf_first_name, mgf_last_name, mgf_dob, mgf_pob
mgf_is_polish, mgf_date_of_emigration, mgf_date_of_naturalization
mgm_first_name, mgm_maiden_name, mgm_dob, mgm_pob

// Paternal Great-Grandparents (PGGF/PGGM)
pggf_first_name, pggf_last_name, pggf_dob, pggf_pob
pggf_is_polish, pggf_date_of_emigration, pggf_date_of_naturalization
pggm_first_name, pggm_maiden_name, pggm_dob, pggm_pob

// Maternal Great-Grandparents (MGGF/MGGM)
mggf_first_name, mggf_last_name, mggf_dob, mggf_pob
mggf_is_polish, mggf_date_of_emigration, mggf_date_of_naturalization
mggm_first_name, mggm_maiden_name, mggm_dob, mggm_pob

// Children (1-10)
child_1_first_name, child_1_last_name, child_1_dob, child_1_pob
// ... through child_10
minor_children_count, children_count
```

**MISSING FIELDS** (Required by PDF but not in database):
```typescript
// Parent marriage date
father_mother_marriage_date
father_mother_marriage_place

// Grandparent marriage dates
pgf_pgm_marriage_date
pgf_pgm_marriage_place
mgf_mgm_marriage_date
mgf_mgm_marriage_place

// Great-grandparent marriage dates
pggf_pggm_marriage_date
pggf_pggm_marriage_place
mggf_mggm_marriage_date
mggf_mggm_marriage_place
```

### 4. Form Logic (FamilyTreeForm.tsx)
**Conditional Rendering Logic**:
```typescript
// Parents always shown
// Grandparents shown based on Polish parent
if (father_is_polish) → show PGF & PGM
if (mother_is_polish) → show MGF & MGM
if (neither) → show all 4 (fallback)

// Great-grandparents shown based on Polish grandparent
if (pgf_is_polish) → show PGGF & PGGM
if (mgf_is_polish) → show MGGF & MGGM
if (neither) → hide great-grandparents tab

// Children shown based on minor_children_count
Render exactly minor_children_count forms (1-10)
```

---

## 🎯 PROPOSED SOLUTION ARCHITECTURE

### Solution 1: Dynamic Bloodline Resolver

**Location**: `supabase/functions/_shared/family-tree-resolver.ts` (NEW FILE)

**Purpose**: Intelligently map database fields to PDF fields based on Polish bloodline

**Core Logic**:
```typescript
interface BloodlineContext {
  fatherPolish: boolean;
  motherPolish: boolean;
  pgfPolish: boolean;
  pgmPolish: boolean;
  mgfPolish: boolean;
  mgmPolish: boolean;
  pggfPolish: boolean;
  mggfPolish: boolean;
}

export function resolveFamilyTreeData(
  masterData: Record<string, any>
): Record<string, any> {
  const context: BloodlineContext = {
    fatherPolish: masterData.father_is_polish === true,
    motherPolish: masterData.mother_is_polish === true,
    pgfPolish: masterData.pgf_is_polish === true,
    pgmPolish: masterData.pgm_is_polish === false, // PGM cannot be Polish
    mgfPolish: masterData.mgf_is_polish === true,
    mgmPolish: masterData.mgm_is_polish === false, // MGM cannot be Polish
    pggfPolish: masterData.pggf_is_polish === true,
    mggfPolish: masterData.mggf_is_polish === true,
  };

  const resolved: Record<string, any> = {};

  // === STEP 1: Determine Polish Parent ===
  if (context.fatherPolish && !context.motherPolish) {
    // Father is Polish parent
    resolved.polish_parent_full_name = 
      `${masterData.father_first_name || ''} ${masterData.father_last_name || ''}`.trim();
    resolved.polish_parent_spouse_full_name = 
      `${masterData.mother_first_name || ''} ${masterData.mother_maiden_name || ''}`.trim();
    resolved.polish_parent_date_of_birth = masterData.father_dob;
    resolved.polish_parent_place_of_birth = masterData.father_pob;
    resolved.polish_parent_date_of_marriage = masterData.father_mother_marriage_date;
    resolved.polish_parent_place_of_marriage = masterData.father_mother_marriage_place;
    resolved.polish_parent_date_of_emigration = masterData.father_date_of_emigration;
    resolved.polish_parent_date_of_naturalization = masterData.father_date_of_naturalization;

    // === STEP 2: Determine Polish Grandparent (paternal side) ===
    if (context.pgfPolish) {
      resolved.polish_grandparent_full_name = 
        `${masterData.pgf_first_name || ''} ${masterData.pgf_last_name || ''}`.trim();
      resolved.polish_grandparent_spouse_full_name = 
        `${masterData.pgm_first_name || ''} ${masterData.pgm_maiden_name || ''}`.trim();
      resolved.polish_grandparent_date_of_birth = masterData.pgf_dob;
      resolved.polish_grandparent_place_of_birth = masterData.pgf_pob;
      resolved.polish_grandparent_date_of_mariage = masterData.pgf_pgm_marriage_date;
      resolved.polish_grandparent_place_of_mariage = masterData.pgf_pgm_marriage_place;
      resolved.polish_grandparent_date_of_emigration = masterData.pgf_date_of_emigration;
      resolved.polish_grandparent_date_of_naturalization = masterData.pgf_date_of_naturalization;

      // === STEP 3: Great-Grandparents (PGGF/PGGM) ===
      if (context.pggfPolish) {
        resolved.great_grandfather_full_name = 
          `${masterData.pggf_first_name || ''} ${masterData.pggf_last_name || ''}`.trim();
        resolved.great_grandmother_full_name = 
          `${masterData.pggm_first_name || ''} ${masterData.pggm_maiden_name || ''}`.trim();
        resolved.great_grandfather_date_of_birth = masterData.pggf_dob;
        resolved.great_grandfather_place_of_birth = masterData.pggf_pob;
        resolved.great_grandfather_date_of_marriage = masterData.pggf_pggm_marriage_date;
        resolved.great_grandfather_place_of_marriage = masterData.pggf_pggm_marriage_place;
        resolved.great_grandfather_date_of_emigartion = masterData.pggf_date_of_emigration;
        resolved.great_grandfather_date_of_naturalization = masterData.pggf_date_of_naturalization;
      }
    }
    
  } else if (context.motherPolish && !context.fatherPolish) {
    // Mother is Polish parent
    resolved.polish_parent_full_name = 
      `${masterData.mother_first_name || ''} ${masterData.mother_maiden_name || ''}`.trim();
    resolved.polish_parent_spouse_full_name = 
      `${masterData.father_first_name || ''} ${masterData.father_last_name || ''}`.trim();
    resolved.polish_parent_date_of_birth = masterData.mother_dob;
    resolved.polish_parent_place_of_birth = masterData.mother_pob;
    resolved.polish_parent_date_of_marriage = masterData.father_mother_marriage_date;
    resolved.polish_parent_place_of_marriage = masterData.father_mother_marriage_place;
    resolved.polish_parent_date_of_emigration = masterData.mother_date_of_emigration;
    resolved.polish_parent_date_of_naturalization = masterData.mother_date_of_naturalization;

    // === STEP 2: Determine Polish Grandparent (maternal side) ===
    if (context.mgfPolish) {
      resolved.polish_grandparent_full_name = 
        `${masterData.mgf_first_name || ''} ${masterData.mgf_last_name || ''}`.trim();
      resolved.polish_grandparent_spouse_full_name = 
        `${masterData.mgm_first_name || ''} ${masterData.mgm_maiden_name || ''}`.trim();
      resolved.polish_grandparent_date_of_birth = masterData.mgf_dob;
      resolved.polish_grandparent_place_of_birth = masterData.mgf_pob;
      resolved.polish_grandparent_date_of_mariage = masterData.mgf_mgm_marriage_date;
      resolved.polish_grandparent_place_of_mariage = masterData.mgf_mgm_marriage_place;
      resolved.polish_grandparent_date_of_emigration = masterData.mgf_date_of_emigration;
      resolved.polish_grandparent_date_of_naturalization = masterData.mgf_date_of_naturalization;

      // === STEP 3: Great-Grandparents (MGGF/MGGM) ===
      if (context.mggfPolish) {
        resolved.great_grandfather_full_name = 
          `${masterData.mggf_first_name || ''} ${masterData.mggf_last_name || ''}`.trim();
        resolved.great_grandmother_full_name = 
          `${masterData.mggm_first_name || ''} ${masterData.mggm_maiden_name || ''}`.trim();
        resolved.great_grandfather_date_of_birth = masterData.mggf_dob;
        resolved.great_grandfather_place_of_birth = masterData.mggf_pob;
        resolved.great_grandfather_date_of_marriage = masterData.mggf_mggm_marriage_date;
        resolved.great_grandfather_place_of_marriage = masterData.mggf_mggm_marriage_place;
        resolved.great_grandfather_date_of_emigartion = masterData.mggf_date_of_emigration;
        resolved.great_grandfather_date_of_naturalization = masterData.mggf_date_of_naturalization;
      }
    }
    
  } else if (context.fatherPolish && context.motherPolish) {
    // EDGE CASE: Both parents Polish - default to father's line
    // TODO: Ask user which line to prioritize?
    console.warn('[FAMILY TREE] Both parents Polish - defaulting to father line');
    // Use father logic (same as above)
    
  } else {
    // EDGE CASE: Neither parent Polish - should not happen in valid cases
    console.error('[FAMILY TREE] No Polish parent identified');
    // Leave fields empty
  }

  // === APPLICANT DATA (always included) ===
  resolved.applicant_full_name = 
    `${masterData.applicant_first_name || ''} ${masterData.applicant_last_name || ''}`.trim();
  resolved.applicant_date_of_birth = masterData.applicant_dob;
  resolved.applicant_place_of_birth = masterData.applicant_pob;
  resolved.applicant_date_of_marriage = masterData.date_of_marriage;
  resolved.applicant_place_of_marriage = masterData.place_of_marriage;
  resolved.applicant_spouse_full_name_and_maiden_name = 
    `${masterData.spouse_first_name || ''} ${masterData.spouse_last_name || ''}`.trim();

  // === MINOR CHILDREN (max 3 for PDF) ===
  const minorCount = Math.min(masterData.minor_children_count || 0, 3);
  for (let i = 1; i <= minorCount; i++) {
    resolved[`minor_${i}_full_name`] = 
      `${masterData[`child_${i}_first_name`] || ''} ${masterData[`child_${i}_last_name`] || ''}`.trim();
    resolved[`minor_${i}_date_of_birth`] = masterData[`child_${i}_dob`];
    resolved[`minor_${i}_place_of_birth`] = masterData[`child_${i}_pob`];
  }

  return resolved;
}
```

### Solution 2: Database Migration

**Migration SQL**:
```sql
-- Add marriage date fields for all generations
ALTER TABLE master_table
ADD COLUMN IF NOT EXISTS father_mother_marriage_date DATE,
ADD COLUMN IF NOT EXISTS father_mother_marriage_place TEXT,
ADD COLUMN IF NOT EXISTS pgf_pgm_marriage_date DATE,
ADD COLUMN IF NOT EXISTS pgf_pgm_marriage_place TEXT,
ADD COLUMN IF NOT EXISTS mgf_mgm_marriage_date DATE,
ADD COLUMN IF NOT EXISTS mgf_mgm_marriage_place TEXT,
ADD COLUMN IF NOT EXISTS pggf_pggm_marriage_date DATE,
ADD COLUMN IF NOT EXISTS pggf_pggm_marriage_place TEXT,
ADD COLUMN IF NOT EXISTS mggf_mggm_marriage_date DATE,
ADD COLUMN IF NOT EXISTS mggf_mggm_marriage_place TEXT;

-- Add comments for clarity
COMMENT ON COLUMN master_table.father_mother_marriage_date IS 'Marriage date of applicant parents';
COMMENT ON COLUMN master_table.pgf_pgm_marriage_date IS 'Marriage date of paternal grandparents';
COMMENT ON COLUMN master_table.mgf_mgm_marriage_date IS 'Marriage date of maternal grandparents';
COMMENT ON COLUMN master_table.pggf_pggm_marriage_date IS 'Marriage date of paternal great-grandparents';
COMMENT ON COLUMN master_table.mggf_mggm_marriage_date IS 'Marriage date of maternal great-grandparents';
```

### Solution 3: Pre-Generation Validation

**Location**: `supabase/functions/_shared/family-tree-validator.ts` (NEW FILE)

```typescript
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    bloodlineResolved: boolean;
    polishParent: 'father' | 'mother' | 'both' | 'none';
    polishGrandparent: 'pgf' | 'mgf' | 'both' | 'none';
    childrenIncluded: number;
    childrenExcluded: number;
  };
}

export function validateFamilyTreeData(
  data: Record<string, any>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check Polish parent identification
  const fatherPolish = data.father_is_polish === true;
  const motherPolish = data.mother_is_polish === true;
  
  let polishParent: 'father' | 'mother' | 'both' | 'none';
  if (fatherPolish && motherPolish) {
    polishParent = 'both';
    warnings.push('Both parents marked as Polish - using father\'s bloodline for PDF');
  } else if (fatherPolish) {
    polishParent = 'father';
  } else if (motherPolish) {
    polishParent = 'mother';
  } else {
    polishParent = 'none';
    errors.push('No Polish parent identified - cannot generate Family Tree');
  }

  // Check applicant data
  if (!data.applicant_first_name || !data.applicant_last_name) {
    errors.push('Applicant name missing');
  }
  if (!data.applicant_dob) {
    errors.push('Applicant date of birth missing');
  }

  // Check Polish parent data completeness
  if (polishParent === 'father' || polishParent === 'both') {
    if (!data.father_first_name || !data.father_last_name) {
      errors.push('Father name missing');
    }
    if (!data.father_dob) {
      warnings.push('Father date of birth missing');
    }
    if (!data.father_mother_marriage_date) {
      warnings.push('Parents marriage date missing');
    }
  }

  if (polishParent === 'mother') {
    if (!data.mother_first_name || !data.mother_maiden_name) {
      errors.push('Mother name missing');
    }
    if (!data.mother_dob) {
      warnings.push('Mother date of birth missing');
    }
    if (!data.father_mother_marriage_date) {
      warnings.push('Parents marriage date missing');
    }
  }

  // Check Polish grandparent
  const pgfPolish = data.pgf_is_polish === true;
  const mgfPolish = data.mgf_is_polish === true;
  
  let polishGrandparent: 'pgf' | 'mgf' | 'both' | 'none';
  if (pgfPolish && mgfPolish) {
    polishGrandparent = 'both';
    warnings.push('Both grandfathers marked as Polish - using paternal line');
  } else if (pgfPolish) {
    polishGrandparent = 'pgf';
  } else if (mgfPolish) {
    polishGrandparent = 'mgf';
  } else {
    polishGrandparent = 'none';
    warnings.push('No Polish grandparent identified');
  }

  // Check children capacity
  const minorCount = data.minor_children_count || 0;
  const childrenIncluded = Math.min(minorCount, 3);
  const childrenExcluded = Math.max(0, minorCount - 3);
  
  if (childrenExcluded > 0) {
    warnings.push(
      `PDF supports max 3 children. ${childrenExcluded} children will be excluded (children ${childrenIncluded + 1}-${minorCount})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      bloodlineResolved: polishParent !== 'none',
      polishParent,
      polishGrandparent,
      childrenIncluded,
      childrenExcluded,
    },
  };
}
```

### Solution 4: Integration with fill-pdf

**Modify**: `supabase/functions/fill-pdf/index.ts` (lines ~425-448)

```typescript
// After fetching masterData from database:
if (normalizedType === 'family-tree') {
  log('family_tree_special_handling', { caseId });
  
  // STEP 1: Validate data
  const validation = validateFamilyTreeData(masterData);
  
  if (!validation.valid) {
    log('family_tree_validation_failed', { 
      errors: validation.errors,
      warnings: validation.warnings 
    });
    return j(req, { 
      code: 'VALIDATION_FAILED', 
      message: 'Family Tree data validation failed',
      errors: validation.errors,
      warnings: validation.warnings
    }, 400);
  }
  
  // Log warnings but continue
  if (validation.warnings.length > 0) {
    log('family_tree_validation_warnings', { 
      warnings: validation.warnings,
      metadata: validation.metadata
    });
  }
  
  // STEP 2: Resolve dynamic bloodline fields
  const resolvedData = resolveFamilyTreeData(masterData);
  
  // STEP 3: Override masterData with resolved values
  Object.assign(masterData, resolvedData);
  
  // STEP 4: Log what we resolved
  log('family_tree_data_resolved', {
    polishParent: validation.metadata.polishParent,
    polishGrandparent: validation.metadata.polishGrandparent,
    childrenIncluded: validation.metadata.childrenIncluded,
    fieldsResolved: Object.keys(resolvedData).length
  });
  
  // STEP 5: Use static mapping (now with resolved data)
  // The existing fillPDFFields() will use the static mapping,
  // but masterData now contains the correct resolved values
}
```

---

## ❓ VERIFICATION QUESTIONS

### Question 1: Database Schema
**Should we add the marriage date fields to master_table?**

**Options**:
A) YES - Add all 10 new fields (5 dates + 5 places)
B) NO - Store marriage dates elsewhere (e.g., separate marriages table)
C) PARTIAL - Only add fields we absolutely need (which ones?)

**Recommendation**: Option A - Add all fields to master_table for simplicity

### Question 2: Bloodline Resolution Logic
**Is the dynamic resolver logic correct for all edge cases?**

**Edge Cases to Consider**:
1. Both parents Polish → Should we ask user which line to use, or default to father?
2. Neither parent Polish → Should we prevent PDF generation entirely?
3. PGM or MGM marked as Polish → This is genealogically impossible (they're always spouses)
4. Multiple Polish grandparents → Which great-grandparents to show?

**Current Handling**:
- Both Polish → Default to father (with warning)
- Neither Polish → Return validation error
- PGM/MGM Polish → Ignored (treated as false)
- Multiple Polish GPs → Use paternal (PGF) if father Polish, maternal (MGF) if mother Polish

### Question 3: Children Overflow
**What to do when minor_children_count > 3?**

**Options**:
A) Generate PDF with first 3 children, warn user about exclusion
B) Prevent PDF generation entirely
C) Generate multiple PDFs (one per 3 children)
D) Expand PDF template to support all 10 children

**Recommendation**: Option A - Generate with warning (simplest, matches current PDF)

### Question 4: Validation Strictness
**Should validation be strict (blocking) or lenient (warnings)?**

**Current Proposal**: 
- ERRORS (blocking): No Polish parent, missing applicant name/DOB
- WARNINGS (non-blocking): Missing marriage dates, missing DOBs, children overflow

**Alternative**:
- Make marriage dates required (blocking errors)?
- Make all POB fields required?

### Question 5: Static vs Dynamic Mappings
**Should we keep static mappings or make them dynamic?**

**Current Proposal**: Keep static mappings, but pre-resolve data before filling
- Static mapping file stays simple
- Dynamic logic contained in resolver
- Easier to maintain and debug

**Alternative**: Make mappings dynamic with conditional logic?

---

## 🎯 SUCCESS CRITERIA

For this architecture to be approved, it must:

1. ✅ **Correctly map all 38 PDF fields** from master_table
2. ✅ **Handle father Polish bloodline** (father → PGF → PGGF)
3. ✅ **Handle mother Polish bloodline** (mother → MGF → MGGF)
4. ✅ **Handle edge case: both Polish** (with clear decision logic)
5. ✅ **Handle edge case: neither Polish** (validation prevents generation)
6. ✅ **Support up to 3 children** in PDF (with overflow warning)
7. ✅ **Validate required fields** before generation
8. ✅ **Log comprehensive debugging info** for troubleshooting
9. ✅ **Maintain backward compatibility** with existing fill-pdf system
10. ✅ **Be maintainable** (clear code structure, no magic numbers)

---

## 📝 VERIFICATION CHECKLIST

Please verify:

- [ ] Is the dynamic bloodline resolver logic correct?
- [ ] Are all edge cases handled properly?
- [ ] Should marriage dates be required or optional?
- [ ] Is the database migration safe and complete?
- [ ] Is the validation workflow appropriate (strict vs lenient)?
- [ ] Are there any security concerns?
- [ ] Are there any performance concerns?
- [ ] Is the logging sufficient for debugging?
- [ ] Is the error messaging clear for users?
- [ ] Is the architecture maintainable long-term?

---

## 🚀 IMPLEMENTATION ORDER

If approved, implement in this order:

1. **Database Migration** - Add marriage date fields
2. **Validator Module** - Create validation function
3. **Resolver Module** - Create bloodline resolver
4. **Update fill-pdf** - Integrate family-tree logic
5. **Update Form** - Add marriage date inputs to Family Tree form
6. **Testing** - Test all 3 bloodline scenarios + edge cases
7. **Documentation** - Update system docs

---

**VERIFICATION REQUEST**: Please review this architecture with 3 AI models (GPT-5, Claude Sonnet 4.5, Gemini 2.5 Pro) and return:
1. Approval scores (0-100) from each model
2. Critical issues or concerns
3. Recommendations for improvement
4. Go/No-Go decision for implementation
