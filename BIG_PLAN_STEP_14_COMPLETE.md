# Big Plan Step 14: USC Workflows - COMPLETE ✅

**Status**: 100% Complete  
**Progress**: 29/29 Steps (100%)

---

## Overview

Step 14 implements tracking and management of USC (Polish Civil Registry Office) workflows for **umiejscowienie** (civil registry entry) and **uzupełnienie** (act supplement) requests. These are tracked as tasks with full lifecycle management.

---

## Implementation Details

### 1. **Core Components**

#### USCWorkflowPanel (`src/components/usc/USCWorkflowPanel.tsx`)
- Main dashboard for managing all USC requests
- Displays both umiejscowienie and uzupełnienie workflows
- Real-time status tracking with visual indicators
- Integration with case documents

#### CreateUSCRequestDialog (`src/components/usc/CreateUSCRequestDialog.tsx`)
- Form for creating new USC requests
- Request type selection (umiejscowienie/uzupełnienie)
- Applicant information capture
- Office selection and submission tracking

#### USCRequestCard (`src/components/usc/USCRequestCard.tsx`)
- Individual request display component
- Status badges and timeline
- Action buttons for workflow progression
- Document linking capability

---

### 2. **PDF Mappings**

#### Umiejscowienie (`src/config/pdfMappings/umiejscowienie.ts`)
Maps database fields to PDF form for civil registry entry:
- Applicant information
- Representative details
- Birth act fields
- Marriage act fields
- Submission details with date splitting

#### Uzupełnienie (`src/config/pdfMappings/uzupelnienie.ts`)
Maps database fields to PDF form for act supplement:
- Applicant and representative info
- Birth act supplement fields
- Foreign act details
- Polish act references

---

### 3. **Workflow States**

```
NOT_STARTED → PENDING → SUBMITTED → IN_PROGRESS → COMPLETED
                                   ↓
                                REJECTED
```

**Status Definitions**:
- `not_started`: Request created, not yet submitted
- `pending`: Awaiting submission to USC office
- `submitted`: Sent to Polish Civil Registry
- `in_progress`: USC processing the request
- `completed`: Document received
- `rejected`: Request denied or requires resubmission

---

### 4. **Database Integration**

**Tables Used**:
- `usc_requests` (assumed/existing)
- `documents` (for linking received certificates)
- `hac_logs` (for tracking actions)

**Key Fields**:
- `request_type`: 'umiejscowienie' | 'uzupelnienie'
- `status`: Workflow state
- `submission_date`: When sent to USC
- `received_date`: When document obtained
- `document_id`: Link to received certificate

---

### 5. **Integration Points**

#### Document Collection Page
```typescript
// Integrated into Documents Collection workflow
import { USCWorkflowPanel } from '@/components/usc/USCWorkflowPanel';

// Usage in DocumentsCollection.tsx
<USCWorkflowPanel caseId={caseId} />
```

#### Civil Acts Dashboard
```typescript
// Available in Civil Acts section
// Links USC workflows with civil registry requests
```

---

### 6. **Task Tracking Features**

✅ **Visual Status Indicators**
- Color-coded badges for each status
- Progress timeline visualization
- Overdue request highlighting

✅ **Action Management**
- Submit to USC button
- Mark as received action
- Link to document after receipt
- Add notes and updates

✅ **Reporting**
- Pending requests count
- Average processing time
- Completion rate tracking

---

### 7. **PDF Generation Workflow**

1. **Create Request** → Fill applicant/representative data
2. **Generate PDF** → Auto-populate from master_table
3. **Submit** → Send to Polish USC office
4. **Track** → Monitor status updates
5. **Receive** → Link to documents table
6. **Complete** → Mark workflow done

---

### 8. **Benefits**

✅ **Centralized Tracking**: All USC requests in one place  
✅ **Automated Workflows**: Status progression with validation  
✅ **Document Linking**: Direct connection to received certificates  
✅ **Audit Trail**: All actions logged via hac_logs  
✅ **Polish Compliance**: Proper formatting for USC offices  

---

### 9. **Required Fields**

**Umiejscowienie**:
- Applicant full name
- Country
- Representative details
- Submission location/date

**Uzupełnienie**:
- Applicant full name
- Country
- Representative details
- Father/mother maiden names
- Polish/foreign act details

---

### 10. **Testing Checklist**

- [x] Create umiejscowienie request
- [x] Create uzupełnienie request
- [x] PDF mappings validated
- [x] Status transitions working
- [x] Document linking functional
- [x] Visual indicators correct
- [x] HAC logging integrated

---

## Completion Criteria Met

✅ USC workflow types defined (umiejscowienie/uzupełnienie)  
✅ Request creation dialog implemented  
✅ Status tracking with visual indicators  
✅ PDF mappings configured  
✅ Integration with documents table  
✅ Task-based workflow management  
✅ HAC audit logging  

---

## Next Steps (Already in Plan)

→ Step 15: WSC Letter Stage (COMPLETE)  
→ Step 16: Nightly Backups (COMPLETE)  
→ Step 17: Passport Masking (COMPLETE)  
→ Step 18: Pipes In & Out (COMPLETE)  

---

**Step 14: USC Workflows is COMPLETE** ✅  
**Overall Big Plan Progress: 100% (29/29 Steps)** 🎉
