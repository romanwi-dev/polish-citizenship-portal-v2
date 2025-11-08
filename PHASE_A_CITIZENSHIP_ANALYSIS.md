# PHASE A: CITIZENSHIP APPLICATION FORM & PDF ANALYSIS

## 🎯 ANALYSIS SCOPE

**Subject**: Polish Citizenship Application (OBY Form) - 12-page legal document
**Issue**: "Haven't managed to generate any PDF template with data for a long time"
**Template**: new-CITIZENSHIP-5.pdf (Polish: "WNIOSEK O POTWIERDZENIE POSIADANIA OBYWATELSTWA POLSKIEGO")

**Comparison Context**: Same root cause as POA (just analyzed)

---

## 📊 QUICK DIAGNOSIS

### ✅ **CONFIRMED: SAME ROOT CAUSE AS POA**

The Citizenship form suffers from **IDENTICAL ISSUE** as POA:

**Problem**: `pdf-generate-v2` edge function does **direct field name matching** but:
- PDF template uses Polish field names: `imie_wniosko`, `nazwisko_wniosko`, `dzien_uro`
- Database uses English column names: `applicant_first_name`, `applicant_last_name`, `applicant_dob`
- **Mapping file exists** (`src/config/pdfMappings/citizenship.ts`) with 225+ field mappings
- **But pdf-generate-v2 IGNORES it completely**

**Result**: 0% fill rate even when data exists ❌

---

## 🔍 DATA STATUS

### Database Query Results:

**Cases with Citizenship data found**: 5 cases

| Field | Case 1 | Case 2 | Case 3 | Case 4 | Case 5 |
|-------|--------|--------|--------|--------|--------|
| First Name | MAREK | MAREK | DORA | ROMAN | ADAM |
| Last Name | SOBOLEWSKI | NULL | BOYD | KOWALSKI | ADAMEK |
| DOB | NULL | NULL | NULL | NULL | NULL |
| POB | NULL | NULL | NULL | NULL | NULL |
| Father First | NULL | NULL | NULL | NULL | NULL |
| Father Last | NULL | NULL | NULL | NULL | NULL |
| Mother First | NULL | NULL | NULL | NULL | NULL |
| Mother Last | NULL | NULL | NULL | NULL | NULL |
| Mother Maiden | NULL | NULL | NULL | NULL | NULL |

**DATA STATUS**: 
- ✅ 5/5 cases have applicant names (100%)
- ❌ 0/5 cases have complete citizenship data (0%)
- ⚠️ Missing: dates of birth, places of birth, parent data, grandparent data

**WORSE THAN POA**: Citizenship requires 4 generations of family data (~100 fields), POA only needs 4-6 fields

---

## 📄 PDF TEMPLATE ANALYSIS

### Template Structure:
- **12 pages total**
- **Page 1**: Header & applicant basic info
- **Page 2**: Applicant details (Part I)
- **Pages 3-5**: Mother's data & maternal grandparents
- **Pages 6-8**: Father's data & paternal grandparents
- **Pages 9-10**: Biographical notes (życiorysy)
- **Page 11**: Attachments checklist
- **Page 12**: Instructions (informational only)

### Field Count Estimate:
**~140 fillable form fields** across 11 pages

**Field Name Examples** (from PDF):
- `imie_wniosko` (applicant first name)
- `nazwisko_wniosko` (applicant surname)
- `dzien_uro` (birth day)
- `miesiac_uro` (birth month)
- `rok_uro` (birth year)
- `miejsce_uro` (birth place)
- `imie_matki` (mother's first name)
- `nazwisko_matki` (mother's surname)
- `imie_ojca` (father's first name)
- etc.

---

## 🏗️ CURRENT SYSTEM ARCHITECTURE

### Generation Flow (SAME AS POA):
```
User clicks "Generate PDF" in CitizenshipForm
  ↓
CitizenshipForm.tsx handleGeneratePDF() (line 80-95)
  ↓
Imports @/lib/generate-pdf
  ↓
Calls generatePdf() with templateType: 'citizenship'
  ↓
Invokes pdf-enqueue edge function
  ↓
Job queued in pdf_queue table
  ↓
Worker calls pdf-generate-v2
  ↓
pdf-generate-v2 tries to fill PDF
  ↓
FAILS: Field names don't match (imie_wniosko ≠ applicant_first_name)
  ↓
Generates BLANK PDF (0 fields filled)
```

---

## 🔬 MAPPING FILE ANALYSIS

### Frontend Mapping: `src/config/pdfMappings/citizenship.ts`

**Status**: ✅ **COMPREHENSIVE MAPPING EXISTS**

**Statistics**:
- **225+ field mappings defined**
- Covers all 12 pages (excluding page 12 which is informational)
- Includes complex mappings:
  - Concatenation: `imie_nazwisko_wniosko` → `applicant_first_name|applicant_last_name`
  - Date splitting: `dzien_uro` → `applicant_dob.day`
  - Nested objects: `miasto_zam` → `applicant_address.city`
  - Grandparent data: 4 generations mapped

**Sample Mappings**:
```typescript
'imie_wniosko': 'applicant_first_name',
'nazwisko_wniosko': 'applicant_last_name',
'dzien_uro': 'applicant_dob.day',
'miesiac_uro': 'applicant_dob.month',
'rok_uro': 'applicant_dob.year',
'miejsce_uro': 'applicant_pob',
'imie_matki': 'mother_first_name',
'nazwisko_matki': 'mother_last_name',
'nazwisko_rodowe_matki': 'mother_maiden_name',
'imie_ojca': 'father_first_name',
'nazwisko_ojca': 'father_last_name',
```

**Required Fields**: 10 critical fields defined

---

## 🎯 ROOT CAUSE CONFIRMED

### **EXACT SAME ISSUE AS POA**:

**pdf-generate-v2 code** (lines 94-111):
```typescript
for (const field of fields) {
  try {
    const fieldName = field.getName();
    if (masterData && masterData[fieldName]) {  // <-- DIRECT LOOKUP
      const textField = form.getTextField(fieldName);
      textField.setText(String(masterData[fieldName]));
      filledCount++;
    }
  } catch (e) {
    // Skip fields that can't be filled
  }
}
```

**What happens**:
1. PDF field name: `imie_wniosko`
2. Direct lookup: `masterData['imie_wniosko']`
3. Result: `undefined` (because column is `applicant_first_name`)
4. Field NOT filled ❌

**Even if we had ALL data**, fill rate would be **0%** because field names don't match!

---

## 💡 SOLUTION (SAME AS POA)

### **Implement Mapping in pdf-generate-v2**

**Required changes**:

1. **Import citizenship mapping**:
```typescript
import { CITIZENSHIP_PDF_MAP } from '../_shared/mappings/citizenship.ts';
```

2. **Get mapping for template type**:
```typescript
const getMapping = (type: string) => {
  if (type === 'citizenship') return CITIZENSHIP_PDF_MAP;
  if (type === 'poa-adult') return POA_ADULT_PDF_MAP;
  // ... etc
};
```

3. **Use mapping in field loop**:
```typescript
const mapping = getMapping(templateType);

for (const field of fields) {
  const pdfFieldName = field.getName();
  const dbColumnMapping = mapping[pdfFieldName];
  
  if (dbColumnMapping && masterData) {
    const value = resolveValue(dbColumnMapping, masterData);
    if (value) {
      textField.setText(String(value));
      filledCount++;
    }
  }
}
```

4. **Helper function for complex mappings**:
```typescript
function resolveValue(mapping: string, data: Record<string, any>): string {
  // Handle concatenation (e.g., "first_name|last_name")
  if (mapping.includes('|')) {
    const parts = mapping.split('|');
    return parts
      .map(key => data[key])
      .filter(v => v != null && v !== '')
      .map(v => String(v).trim())
      .join(' ');
  }
  
  // Handle date parts (e.g., "applicant_dob.day")
  if (mapping.includes('.')) {
    const [dateField, part] = mapping.split('.');
    const dateValue = data[dateField];
    if (dateValue) {
      const date = new Date(dateValue);
      if (part === 'day') return String(date.getDate()).padStart(2, '0');
      if (part === 'month') return String(date.getMonth() + 1).padStart(2, '0');
      if (part === 'year') return String(date.getFullYear());
    }
    return '';
  }
  
  // Simple field
  return data[mapping] ? String(data[mapping]) : '';
}
```

---

## 📋 CITIZENSHIP-SPECIFIC CHALLENGES

### Additional Complexity vs POA:

1. **4 Generations of Data** (vs POA's 1 generation)
   - Applicant
   - Parents (2)
   - Grandparents (4)
   - Great-grandparents (8) - partial data

2. **Date Splitting** (vs POA's simple dates)
   - Each date becomes 3 fields: day, month, year
   - Example: `applicant_dob` → `dzien_uro`, `miesiac_uro`, `rok_uro`

3. **Polish Field Names** (vs POA's English-ish names)
   - `imie_nazwisko_rodowe_matki` = mother's maiden name
   - `dzien_zaw_zwiazku_matki` = mother's marriage date
   - Requires careful mapping verification

4. **Nested Objects** (vs POA's flat structure)
   - `applicant_address.city`, `applicant_address.postal_code`
   - Need to handle object navigation

5. **Biographical Notes** (życiorysy)
   - Free-text fields for each person
   - May contain multi-line text

6. **Attachments Checklist**
   - 10 checkboxes for document types
   - Requires boolean to checkbox mapping

---

## 🚨 CRITICAL ISSUES

### 🔴 BLOCKING (Prevents PDF Generation):

1. **No Mapping Implementation** (Severity: CRITICAL)
   - pdf-generate-v2 ignores CITIZENSHIP_PDF_MAP
   - Same fix needed as POA
   - **Impact**: 0% fill rate

2. **Missing Date Splitting Logic** (Severity: CRITICAL)
   - Dates stored as ISO (YYYY-MM-DD)
   - PDF expects separate day/month/year fields
   - No splitting logic exists
   - **Impact**: All dates blank

3. **No Concatenation Handler** (Severity: CRITICAL)
   - Many fields need `first|last` concatenation
   - No logic to combine values
   - **Impact**: 30+ fields blank

4. **No Nested Object Support** (Severity: CRITICAL)
   - Fields like `applicant_address.city` need object navigation
   - Direct lookup fails
   - **Impact**: All address fields blank

### 🟡 HIGH (Data Quality):

5. **EMPTY DATABASE** (Severity: HIGH)
   - 0/5 cases have complete citizenship data
   - Only applicant names present
   - Missing: DOB, POB, parents, grandparents
   - **Impact**: Even with mapping fix, PDFs will be mostly blank

6. **No Form Validation** (Severity: HIGH)
   - Can submit form without required data
   - No warnings about missing critical fields
   - **Impact**: Poor user experience

### 🟢 MEDIUM (UX & Monitoring):

7. **No Error Logging** (Severity: MEDIUM)
   - Can't debug why fields don't fill
   - No visibility into fill rates
   - **Impact**: Hard to troubleshoot

---

## 🛠️ IMPLEMENTATION PLAN

### **Phase 1: Core Fix (Same as POA)**
1. ✅ Mapping exists - already done
2. ⏳ Implement mapping lookup in pdf-generate-v2
3. ⏳ Add `resolveValue()` helper with:
   - Concatenation support (`|`)
   - Date splitting support (`.day`, `.month`, `.year`)
   - Nested object support (`.` notation)
4. ⏳ Add comprehensive logging

### **Phase 2: Data Population**
1. ⏳ Create citizenship form validator
2. ⏳ Add required field warnings
3. ⏳ Improve auto-population from intake
4. ⏳ Add grandparent data collection UI

### **Phase 3: Testing**
1. ⏳ Test with sample data
2. ⏳ Verify date splitting
3. ⏳ Verify concatenation
4. ⏳ Verify nested objects
5. ⏳ Test all 11 pages

---

## 🎯 SUCCESS CRITERIA

**Phase A Complete** when:
1. ✅ Root cause identified (same as POA)
2. ✅ Mapping file verified (comprehensive, 225+ fields)
3. ✅ Template analyzed (12 pages, ~140 fields)
4. ✅ Data status assessed (empty but columns exist)
5. ✅ Solution designed (same approach as POA)

**Phase EX Complete** when:
1. ⏳ pdf-generate-v2 implements mapping
2. ⏳ Test PDF generates with >80% fill rate
3. ⏳ Date splitting works correctly
4. ⏳ Concatenation works correctly
5. ⏳ Nested objects work correctly
6. ⏳ Polish characters render correctly
7. ⏳ Validation prevents blank submissions

---

## 📊 COMPARISON: CITIZENSHIP vs POA

| Aspect | POA | Citizenship | Complexity |
|--------|-----|-------------|------------|
| **Pages** | 1-2 pages | 12 pages | 6x more |
| **Fields** | 4-14 fields | ~140 fields | 10x more |
| **Generations** | 1 (self/child) | 4 (applicant→great-grandparents) | 4x more |
| **Date Fields** | 1 (poa_date) | 20+ dates | 20x more |
| **Concatenation** | 2 fields | 30+ fields | 15x more |
| **Data Availability** | 20% complete | 0% complete | Worse |
| **Mapping Quality** | Good (14 fields) | Excellent (225 fields) | Better |
| **Root Cause** | No mapping in V2 | No mapping in V2 | **Same** |
| **Fix Complexity** | Medium | High | Harder |

---

## ⚠️ RISKS

1. **Date Format Ambiguity**
   - Need to verify if DB stores DD.MM.YYYY or ISO
   - Wrong assumption = incorrect dates in PDF

2. **Polish Characters**
   - Names like Łukasz, Zofia, Czesław
   - PDF font may not support ą, ć, ę, ł, ń, ó, ś, ź, ż

3. **Performance**
   - 140+ field mappings per PDF
   - May be slow compared to POA's 4-14 fields

4. **Data Migration**
   - Most cases have zero data
   - Need bulk data import strategy

---

## 🔄 NEXT STEPS

**User should type "B"** to verify this analysis

**Before "B"**:
- Review this analysis
- Confirm understanding
- Approve solution approach

**After "B" approval**:
- Type "EX" to implement
- Fix pdf-generate-v2 (once for all PDF types)
- Test with citizenship data
- Populate missing data

---

## 📝 KEY TAKEAWAY

**Citizenship form has the EXACT SAME root cause as POA**:
- ✅ Mapping files exist and are comprehensive
- ❌ pdf-generate-v2 doesn't use them
- 🔧 Same fix solves both problems
- 📊 But citizenship needs more complex resolvers

**GOOD NEWS**: Fixing POA mapping will also fix Citizenship (and all other PDF types)!

**ONE FIX, MULTIPLE PDFs SOLVED** ✅

---

**PHASE A COMPLETE - READY FOR PHASE B**
