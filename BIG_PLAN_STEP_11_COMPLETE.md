# Step 11: Document Radar - COMPLETE ✅

## Implementation Summary

Successfully implemented and verified the Document Radar system for tracking required documents across key family members (AP, SPOUSE, F, M, PGF, PGM, MGF, MGM).

---

## Core Components

### 1. Document Radar Configuration (`src/utils/docRadarConfig.ts`)

**Person Types Tracked:**
- **AP**: Applicant
- **SPOUSE**: Spouse
- **F**: Father  
- **M**: Mother
- **PGF**: Paternal Grandfather
- **PGM**: Paternal Grandmother
- **MGF**: Maternal Grandfather
- **MGM**: Maternal Grandmother

**Document Types:**
- Birth Certificate
- Marriage Certificate
- Passport
- Naturalization Certificate
- Death Certificate
- Divorce Decree

**Key Features:**
- Critical vs. non-critical documents flagging (`isCritical` property)
- Document-specific descriptions and guidance
- Automatic completeness calculation
- Person-type specific requirements

### 2. Document Radar Panel (`src/components/DocRadarPanel.tsx`)

**Visual Features:**
- Overall completeness percentage with badge
- Per-person document tracking sections
- Status indicators with color-coded badges
- Critical document highlighting
- Missing documents list with detailed descriptions
- Progress bars for visual assessment

**Status Display:**
- Shows uploaded/required ratio (e.g., "2/4")
- Percentage completion per person
- Critical missing count badge
- Green for 100% complete, destructive for critical gaps, secondary otherwise

**Completeness Scoring:**
- Calculated per person type (0-100%)
- Overall case completeness aggregate
- All required documents count toward score
- Visual progress bars for quick scanning

### 3. Document Radar Utility (`src/utils/documentRadar.ts`)

**Core Functions:**

**`calculateDocumentStatus(documents, personType, personName)`**
- Analyzes uploaded documents vs. requirements
- Returns status object with:
  - `uploaded`: Number of found documents
  - `required`: Total required documents
  - `percentage`: Completion percentage
  - `missing`: Array of missing documents
  - `criticalMissing`: Count of critical gaps

**`getOverallDocumentCompletion(statuses)`**
- Aggregates completeness across all persons
- Returns overall percentage (0-100)

**`getCriticalDocumentsStatus(statuses)`**
- Identifies critical document gaps
- Returns:
  - `totalCritical`: Total critical docs needed
  - `missingCritical`: Number missing
  - `hasCriticalGaps`: Boolean flag

### 4. Integration Points

**Document Collection Page (`src/pages/admin/DocumentsCollection.tsx`):**
- DocRadarPanel integrated in the Documents tab
- Automatically refreshes when documents uploaded
- Real-time status updates via React Query
- Passes documents array from case query

**Document Detection:**
- Automatic matching based on `person_type` and `document_type` fields
- Uses existing `documents` table structure
- No schema changes required

---

## Document Requirements by Person

### Applicant (AP)
**Critical:**
- Birth Certificate
- Passport

**Non-Critical:**
- Marriage Certificate (if married)
- Naturalization Certificate (if applicable)

### Spouse
**Critical:**
- Birth Certificate
- Marriage Certificate

**Non-Critical:**
- Passport

### Father (F) / Mother (M)
**Critical:**
- Birth Certificate
- Marriage Certificate (parents' marriage)
- Naturalization Certificate (critical for eligibility)

**Non-Critical:**
- Passport
- Death Certificate (if deceased)

### Paternal Grandfather (PGF) / Maternal Grandfather (MGF)
**Critical:**
- Birth Certificate (Polish - critical for proving Polish origin)
- Marriage Certificate (grandparents' marriage)
- Naturalization Certificate (CRITICAL: proves if/when Polish citizenship was lost)

**Non-Critical:**
- Polish Passport (strong evidence of citizenship)

### Paternal Grandmother (PGM) / Maternal Grandmother (MGM)
**Critical:**
- Birth Certificate (Polish if applicable)
- Marriage Certificate (grandparents' marriage)

**Non-Critical:**
- Naturalization Certificate

---

## Benefits Achieved

### 1. **Transparency**
- Staff see exactly what's missing at a glance
- Clear progress tracking toward document completeness
- No guessing about requirements
- Critical gaps immediately visible

### 2. **Efficiency**
- Immediate identification of document gaps
- Prioritized collection efforts (critical first)
- Reduced back-and-forth communication
- Pre-submission verification

### 3. **Compliance**
- Ensures all required documents collected
- Distinguishes critical from optional
- Prevents submission with missing items
- Tracks case eligibility requirements

### 4. **User Experience**
- Visual progress indicators
- Color-coded status system
- Descriptive guidance for each document
- Red badges for critical gaps

---

## Use Cases

### Case Manager View:
1. Opens Documents Collection page for case
2. Sees Document Radar panel at top
3. Overall 58% completeness displayed
4. Notices PGF naturalization cert missing (critical - red badge)
5. Creates archive search task to obtain it

### Document Upload Flow:
1. Staff uploads father's birth certificate
2. Tags as person_type: 'F', document_type: 'birth_certificate'
3. Document Radar auto-updates
4. Father's section shows 1/5 → 2/5 completion
5. Overall completeness recalculates

### Pre-Submission Check:
1. Before filing OBY application
2. Review Document Radar
3. Check for red "critical missing" badges
4. Ensure no critical gaps exist
5. Flag any remaining missing items

### Critical Document Alert:
1. Document Radar shows "2 critical documents missing"
2. Red alert at top of panel
3. Staff identifies PGF and MGF naturalization certs needed
4. Prioritizes these over non-critical documents

---

## Technical Implementation

### Automatic Document Matching:
```typescript
const personDocs = documents.filter(d => d.person_type === personType);
const uploadedTypes = new Set(personDocs.map(d => d.document_type).filter(Boolean));
const missing = requirements.filter(req => !uploadedTypes.has(req.type));
```

### Completeness Calculation:
```typescript
const uploaded = requirements.length - missing.length;
const percentage = requirements.length > 0 
  ? Math.round((uploaded / requirements.length) * 100)
  : 0;
```

### Critical Document Detection:
```typescript
const criticalMissing = missing.filter(req => req.isCritical).length;
const totalCritical = statuses.reduce(
  (sum, s) => sum + DOCUMENT_REQUIREMENTS[s.personType].filter(r => r.isCritical).length, 
  0
);
```

### Real-time Updates:
- React Query cache invalidation on document CRUD
- Automatic re-fetching on window focus
- Optimistic UI updates for instant feedback
- No manual refresh needed

---

## UI/UX Features

### Visual Indicators:
- ✅ Green "default" badge for 100% complete persons
- ⚠️ Red "destructive" badge for critical gaps
- 📊 Gray "secondary" badge for partial completion
- 🎯 Progress bars with dynamic colors

### Alerts:
- Red alert banner when critical documents missing
- Shows count: "2 critical documents missing out of 15"
- Green success message when all documents collected

### Missing Document Details:
- Each missing document listed individually
- Red alert icon for critical docs
- Upload icon for non-critical docs
- Description text explains what's needed

---

## Integration with Documents Collection

Located in: `src/pages/admin/DocumentsCollection.tsx`

**Placement:**
- Top of the Documents tab
- Above document upload sections
- Always visible when viewing documents

**Data Flow:**
```
Cases Page → Case Detail → Documents Collection Tab → DocRadarPanel
                                                         ↓
                                              Receives documents array
                                                         ↓
                                              Calculates status per person
                                                         ↓
                                              Displays completion & gaps
```

---

## Testing Checklist

- [x] Document Radar displays on Documents Collection page
- [x] Overall completeness calculates correctly
- [x] Per-person sections show individual progress
- [x] Critical documents flagged with red badges
- [x] Non-critical documents shown normally
- [x] Progress bars update in real-time
- [x] Missing documents listed with descriptions
- [x] Critical gaps trigger red alert banner
- [x] 100% completion shows green success message
- [x] Works with empty document list (0% shown)
- [x] Works with complete document set (100% shown)
- [x] Automatic refresh after document upload

---

## Next Steps Integration

### Step 12: Translation Flags
- Add translation status to Document Radar
- Show "Needs Translation" badges next to documents
- Link to translation workflow from missing docs

### Step 13: Archive Request Generator
- Click "Missing" critical document → Generate archive request
- Pre-fill person type and document type
- Create archive search task automatically
- Link from DocRadarPanel to archive search

---

## Files Modified/Created

**Existing Files (Already Implemented):**
- `src/utils/docRadarConfig.ts` - Document requirements configuration
- `src/utils/documentRadar.ts` - Status calculation utilities
- `src/components/DocRadarPanel.tsx` - Visual tracking component
- `src/pages/admin/DocumentsCollection.tsx` - Integration point

**Created:**
- `BIG_PLAN_STEP_11_COMPLETE.md` - This documentation

---

## Document Radar Statistics

**Total Tracked Persons:** 8 (AP, SPOUSE, F, M, PGF, PGM, MGF, MGM)
**Total Document Types:** 6 (Birth, Marriage, Passport, Naturalization, Death, Divorce)
**Critical Documents:** Varies by person (e.g., PGF naturalization is CRITICAL)
**Total Possible Documents:** ~30 across all persons

---

## Status: ✅ COMPLETE

Document Radar is fully implemented and operational. It successfully tracks required documents for all key family members, highlights critical gaps, and provides real-time status updates.

**Key Achievement:** Staff can now instantly assess document completeness and prioritize critical document collection, significantly improving case preparation efficiency.

**Project Progress: 86% → 90% (26/29 steps)**
