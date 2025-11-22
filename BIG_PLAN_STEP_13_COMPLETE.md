# Step 13: USC Workflows - COMPLETE ✅

**Date:** 2025-10-18  
**Progress:** 0% → 100% = **COMPLETE** 🎉

---

## Implementation Summary

### 1. USC Request System ✅

**Database Table:** `usc_requests`

**Schema:**
```sql
CREATE TABLE usc_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id),
  request_type TEXT NOT NULL, -- 'umiejscowienie' or 'uzupelnienie'
  person_type TEXT NOT NULL, -- AP, F, M, PGF, PGM, MGF, MGM, SPOUSE
  document_type TEXT NOT NULL, -- birth, marriage, death, other
  registry_office TEXT NOT NULL,
  registry_city TEXT NOT NULL,
  registry_voivodeship TEXT,
  status TEXT DEFAULT 'draft', -- draft, letter_generated, sent, response_received, completed, rejected
  letter_generated_at TIMESTAMPTZ,
  letter_sent_at TIMESTAMPTZ,
  response_received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  application_details JSONB,
  notes TEXT,
  result_document_id UUID REFERENCES documents(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies:**
- Admins and assistants can manage all USC requests
- Clients can view their own case's USC requests (read-only)

---

### 2. USC Workflow Types ✅

**Umiejscowienie (Civil Registry Entry)**
- Purpose: Register foreign birth/marriage acts in Polish civil registry
- Use case: When person has foreign birth certificate but needs Polish act
- Process: Submit foreign docs → Registry reviews → Polish act issued
- PDF Template: `public/templates/umiejscowienie.pdf`

**Uzupełnienie (Act Supplement)**
- Purpose: Complete missing data in existing Polish civil acts
- Use case: When Polish act exists but lacks parent names or details
- Process: Submit proof docs → Registry reviews → Act updated
- PDF Template: `public/templates/uzupelnienie.pdf`

---

### 3. USC Workflow Panel ✅

**Location:** `src/components/usc/USCWorkflowPanel.tsx`

**Features:**
- List all USC requests for a case
- Status badges (draft, sent, completed, rejected)
- Count summary by status
- Create new USC request button
- Real-time updates with React Query

**UI Example:**
```
┌─────────────────────────────────────────┐
│ USC Workflows            3 requests     │
│ [+ New Request]                         │
│ ─────────────────────────────────────   │
│ 1 draft  1 sent  1 completed           │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Umiejscowienie - birth              │ │
│ │ Person: Applicant                   │ │
│ │ Registry: USC Warszawa              │ │
│ │ [Generate Letter]                   │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Uzupełnienie - birth                │ │
│ │ Person: Father                      │ │
│ │ Sent: Oct 15, 2025                  │ │
│ │ [Response Received]                 │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### 4. Create USC Request Dialog ✅

**Location:** `src/components/usc/CreateUSCRequestDialog.tsx`

**Form Fields:**
- **Request Type:** Dropdown (Umiejscowienie / Uzupełnienie)
- **Person:** Dropdown (AP, F, M, PGF, PGM, MGF, MGM, SPOUSE)
- **Document Type:** Dropdown (birth, marriage, death, other)
- **Registry Office:** Text input
- **Registry City:** Text input
- **Voivodeship:** Text input (optional)
- **Notes:** Textarea

**Validation:**
- All required fields must be filled
- Registry office and city are mandatory
- Notes are optional for additional context

**On Submit:**
- Creates new USC request in database
- Sets status to 'draft'
- Invalidates query to refresh list
- Toast notification for success/error

---

### 5. USC Request Card ✅

**Location:** `src/components/usc/USCRequestCard.tsx`

**Features:**
- Display request type and document type
- Person label (Applicant, Father, etc.)
- Registry office information
- Status badge with color coding
- Action buttons based on current status
- Timestamp tracking for each stage

**Status Workflow:**
```
draft → letter_generated → sent → response_received → completed
                                  ↘ rejected
```

**Action Buttons:**
- **Draft:** [Generate Letter] → Updates to 'letter_generated'
- **Letter Generated:** [Mark Sent] → Updates to 'sent', records date
- **Sent:** [Response Received] → Updates to 'response_received', records date
- **Response Received:** [Complete] → Updates to 'completed', records date

**Status Badge Colors:**
- Draft: Secondary (gray)
- Letter Generated: Outline (white)
- Sent: Default (blue)
- Response Received: Default (blue)
- Completed: Green
- Rejected: Red (destructive)

---

### 6. PDF Letter Generation ✅

**Templates:**
- `public/templates/umiejscowienie.pdf`
- `public/templates/uzupelnienie.pdf`

**PDF Field Mappings:**

**Umiejscowienie:** (`src/config/pdfMappings/umiejscowienie.ts`)
```typescript
{
  'imie_nazwisko_wniosko': 'applicant_first_name|applicant_last_name',
  'imie_nazwisko_pelnomocnik': 'representative_full_name',
  'miejsce_zamieszkania_pelnomocnik': 'representative_address',
  'miejscowosc_zloz': 'submission_location',
  'dzien_zloz': 'submission_date.day',
  'miesiac_zloz': 'submission_date.month',
  'rok_zloz': 'submission_date.year',
  'akt_uro': 'act_type_birth',
  'akt_malz': 'act_type_marriage',
  // ... more fields
}
```

**Uzupełnienie:** (`src/config/pdfMappings/uzupelnienie.ts`)
```typescript
{
  'imie_nazwisko_wniosko': 'applicant_first_name|applicant_last_name',
  'nazwisko_rodowe_ojca': 'father_last_name',
  'nazwisko_rodowe_matki': 'mother_maiden_name',
  'nr_aktu_urodzenia_polskiego': 'polish_birth_act_number',
  'rok_aktu_urodzenia_polskiego': 'birth_act_year',
  // ... more fields
}
```

**PDF Validation:**
Required fields tracked in `src/utils/pdfValidation.ts`:
- Applicant name
- Representative name and address
- Submission location and date

---

### 7. Integration with Documents Collection ✅

**Location:** `src/pages/admin/DocumentsCollection.tsx`

**USC Tab Features:**
- Full USC Workflow Panel integration
- Accessible via "USC" tab in Documents Collection page
- Shows all USC requests for the case
- Create new requests
- Track progress through workflow stages

**Navigation:**
```
Admin → Cases → [Case] → Documents Collection → USC Tab
```

---

### 8. Task Automation ✅

**Automatic Task Creation:**
When USC request status changes, corresponding tasks are created:

- **Letter Generated:** Task to review letter before sending
- **Sent:** Task to follow up if no response after X days
- **Response Received:** Task to review response and take action
- **Completed:** Close related tasks

**Task Types:**
- `usc_letter_review` - Review generated letter
- `usc_followup` - Follow up on sent request
- `usc_response_review` - Review received response
- `usc_complete` - Finalize and file completed request

---

## Benefits Achieved

### 1. Process Standardization ✅
- Consistent workflow for umiejscowienie and uzupełnienie
- Clear status progression
- Automated letter generation
- Template-based approach

### 2. Transparency ✅
- Clients can see USC request status
- Timestamp tracking at every stage
- Clear indication of what's needed next
- Progress visibility

### 3. Efficiency ✅
- Quick request creation (< 1 minute)
- Automated PDF generation
- Status-based action buttons
- No manual tracking needed

### 4. Compliance ✅
- All requests logged in database
- Audit trail of status changes
- Document attachments tracked
- Completion dates recorded

---

## USC Workflow Stages Explained

### Stage 1: Draft (draft)
- USC request created
- Form filled with case details
- Not yet submitted to client or registry

**Actions:** Edit details, generate letter

### Stage 2: Letter Generated (letter_generated)
- PDF letter auto-generated from template
- Ready for review
- Not yet sent

**Actions:** Review letter, mark as sent

### Stage 3: Sent (sent)
- Letter sent to registry office
- `letter_sent_at` timestamp recorded
- Awaiting registry response

**Actions:** Mark response received, set rejected if declined

### Stage 4: Response Received (response_received)
- Registry office responded
- Response document should be uploaded
- Awaiting final processing

**Actions:** Complete request, attach result document

### Stage 5: Completed (completed)
- Request successfully processed
- Polish civil act received (for umiejscowienie)
- OR Act supplement recorded (for uzupełnienie)
- `completed_at` timestamp recorded

**Result:** Polish civil act document added to case

### Alternative: Rejected (rejected)
- Registry office declined request
- Reason should be in notes
- May need to re-submit with corrections

---

## Person Type Labels

**Mapping:**
```typescript
{
  AP: 'Applicant',
  SPOUSE: 'Spouse',
  F: 'Father',
  M: 'Mother',
  PGF: 'Paternal Grandfather',
  PGM: 'Paternal Grandmother',
  MGF: 'Maternal Grandfather',
  MGM: 'Maternal Grandmother'
}
```

---

## Use Cases

### Use Case 1: Foreign Birth Certificate Registration
**Scenario:** Applicant has US birth certificate, needs Polish birth act

**Steps:**
1. Create USC request: Umiejscowienie, Person: Applicant, Type: birth
2. Fill registry office: USC in applicant's family origin city
3. Generate letter → Status: letter_generated
4. Review and send letter → Status: sent (+ date)
5. Registry responds → Status: response_received (+ date)
6. Polish birth act received → Status: completed (+ date)

**Result:** Polish birth certificate added to documents

---

### Use Case 2: Supplement Parent Names in Act
**Scenario:** Father has Polish birth act but missing parent names

**Steps:**
1. Create USC request: Uzupełnienie, Person: Father, Type: birth
2. Fill registry office: USC that issued original act
3. Generate letter with grandparent names → Status: letter_generated
4. Send with proof documents → Status: sent (+ date)
5. Registry confirms supplement → Status: response_received (+ date)
6. Updated act received → Status: completed (+ date)

**Result:** Father's birth act now includes grandparent names

---

## Testing Checklist

✅ **Create USC Request:**
- Form validates required fields
- Person dropdown shows all options
- Registry office saves correctly
- Notes field optional

✅ **Status Progression:**
- Draft → Letter Generated works
- Letter Generated → Sent records date
- Sent → Response Received records date
- Response Received → Completed records date

✅ **UI Display:**
- Status badges show correct colors
- Timestamps display when present
- Action buttons appear at right stages
- Request cards show all details

✅ **PDF Generation:**
- Umiejscowienie template populates correctly
- Uzupełnienie template populates correctly
- Required fields validated
- Date fields split (day, month, year)

✅ **Permissions:**
- Admins can create/update USC requests
- Assistants can create/update USC requests
- Clients can view but not modify
- RLS policies enforce access control

---

## Completion Criteria Met

✅ **USC Request System** - Full CRUD with status workflow  
✅ **Umiejscowienie Workflow** - Letter generation and tracking  
✅ **Uzupełnienie Workflow** - Letter generation and tracking  
✅ **PDF Templates** - Both types with field mappings  
✅ **Status Tracking** - Draft → Letter → Sent → Response → Complete  
✅ **UI Components** - Panel, dialog, cards all implemented  
✅ **Integration** - Connected to Documents Collection page  
✅ **Permissions** - RLS policies for role-based access  
✅ **Task Automation** - Auto-create tasks for follow-ups  

---

## Next Steps Recommendation

**Step 13: USC Workflows** is complete. Continue with:

**Option A:** Client Portal MVP
- Step 27: Client Dashboard
- Step 28: Consulate Kit Generator

**Option B:** Extended Services
- Step 29: Extended Family Services (if in plan)

---

**Overall Progress:** 25/29 steps = **86% Complete** 🚀

---

**Key Features Summary:**

✅ **Two Workflow Types:** Umiejscowienie & Uzupełnienie  
✅ **5-Stage Process:** Draft → Generate → Send → Response → Complete  
✅ **Auto PDF Generation:** From Polish civil registry templates  
✅ **Person Tracking:** For all family members (AP, F, M, PGF, etc.)  
✅ **Document Linking:** Connect result acts to case documents  
✅ **Status Visibility:** Clear progress indicators  
✅ **Role-Based Access:** Admin/assistant manage, clients view  

---

Last Updated: 2025-10-18
