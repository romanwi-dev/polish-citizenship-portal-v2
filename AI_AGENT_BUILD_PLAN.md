# 🤖 AI AGENT STEP-BY-STEP BUILD SEQUENCE

**Polish Citizenship Portal - Complete Implementation Guide**

---

## 📋 OVERVIEW

This document provides the exact sequence for building the AI Agent system for the Polish Citizenship Portal. Follow each step in order, completing and verifying before moving to the next.

---

## ✅ PART 1: FOUNDATION (Steps 1-3)

### Step 1: QA Harness ✅ COMPLETE
**Status:** ✅ Implemented  
**Location:** `/admin/qa-harness`  
**Edge Function:** `dropbox-diag`

**What was built:**
- ✅ QA Harness UI at `/admin/qa-harness`
- ✅ Dropbox diagnostics edge function
- ✅ Automated tests for:
  - Database connection
  - Authentication state
  - Master table schema
  - RLS policies
  - Edge functions availability
  - Dropbox integration

**How to verify:**
1. Navigate to `/admin/qa-harness`
2. Click "Run All Tests"
3. All tests should pass (green) ✅

**Next steps if issues:**
- Red database test → Check Supabase connection
- Red auth test → User needs to log in
- Red RLS test → Review RLS policies
- Red Dropbox test → Configure Dropbox secrets

---

### Step 2: Dropbox Migration Scan
**Status:** 🔄 PENDING  
**Dependencies:** Step 1 must pass

**What to build:**
1. **Migration Scanner UI** (`/admin/dropbox-migration`)
   - Scan `/CASES` folder structure
   - Detect naming inconsistencies
   - Show proposed changes (dry-run mode)
   - Approval mechanism before execution

2. **Edge Function: `dropbox-migration-scan`**
   ```typescript
   // Input: { dryRun: boolean, caseIds?: string[] }
   // Output: { 
   //   plan: MigrationPlan[], 
   //   totalCases: number,
   //   affectedCases: number 
   // }
   ```

3. **Migration Logic:**
   - Scan Dropbox `/CASES` folder
   - Compare with database `cases.dropbox_path`
   - Identify:
     - Missing database entries
     - Incorrect naming (not following convention)
     - Orphaned Dropbox folders
   - Generate rename/move plan

4. **Undo Capability:**
   - Store migration history in `migration_logs` table
   - Allow rollback of last migration

**Verification:**
- Dry-run shows correct plan ✅
- Test on 1-2 cases first ✅
- Undo restores original state ✅

---

### Step 3: Hybrid Naming Scheme
**Status:** 🔄 PENDING  
**Dependencies:** Step 2 complete

**What to build:**
1. **Update Case Creation Flow:**
   - Modify `cases` table trigger or application logic
   - Generate `dropbox_path` as `/CASES/{client_code}_{client_name}/`
   - Example: `/CASES/USA123_John_Doe/`

2. **Naming Convention Rules:**
   ```
   Format: /CASES/{country_code}{number}_{sanitized_name}/
   
   Examples:
   - /CASES/USA001_John_Smith/
   - /CASES/POL042_Anna_Kowalska/
   - /CASES/GBR015_David_Jones/
   ```

3. **Sanitization:**
   - Remove special characters
   - Replace spaces with underscores
   - Limit length to 100 characters

4. **Update Existing Cases:**
   - Run migration to rename existing folders
   - Update `dropbox_path` in database

**Verification:**
- New cases auto-generate correct paths ✅
- Case cards display both codes properly ✅
- Dropbox folders match database ✅

---

## 🎯 PART 2: CASE ORGANIZATION (Steps 4-6)

### Step 4: Dashboard KPI Strip
**Status:** 🔄 PENDING  
**Dependencies:** Step 3 complete

**What to build:**
1. **KPI Calculation Logic:**
   - Update `CaseCard.tsx` component
   - Add real-time KPI calculations:
     ```typescript
     interface CaseKPIs {
       intake_completed: boolean;
       poa_approved: boolean;
       oby_filed: boolean;
       wsc_received: boolean;
       decision_received: boolean;
       tasks_completed: number;
       tasks_total: number;
       docs_percentage: number;
     }
     ```

2. **Visual KPI Strip:**
   - Compact horizontal bar below case name
   - Color-coded indicators:
     - 🟢 Green: Complete
     - 🟡 Yellow: In progress
     - ⭕ Gray: Not started
   - Example: `✅ Intake | ✅ POA | 🟡 OBY | ⭕ WSC | ⭕ Decision`

3. **Database Updates:**
   - Add KPI fields to `cases` table (already exist):
     - `intake_completed`
     - `poa_approved`
     - `oby_filed`
     - `wsc_received`
     - `decision_received`
     - `kpi_tasks_completed`
     - `kpi_tasks_total`
     - `kpi_docs_percentage`

**Verification:**
- KPIs display on all case cards ✅
- Values update in real-time ✅
- Clicking KPI navigates to relevant section ✅

---

### Step 5: Universal Intake Wizard
**Status:** 🔄 PENDING  
**Dependencies:** Forms Excellence Plan complete

**What to build:**
1. **Client-Facing Intake Form:**
   - Public URL: `/intake/{case_id}/{magic_token}`
   - Multi-step wizard (7 steps):
     1. Personal Info
     2. Address & Contact
     3. Parents Info
     4. Grandparents Info
     5. Spouse & Children
     6. Documents Upload
     7. Review & Submit

2. **Features:**
   - EN/PL language toggle
   - Auto-save every 30 seconds
   - "I don't know" option for uncertain fields
   - Passport OCR upload → auto-fill
   - Progress bar
   - Email confirmation on submit

3. **OCR Integration:**
   - Use existing `ocr-passport` edge function
   - Extract and map fields:
     - Name, DOB, Sex, Passport #, Issue/Expiry dates

4. **Database:**
   - Save to `intake_data` table (already exists)
   - Link to `master_table` via `case_id`

**Verification:**
- Clients can access via magic link ✅
- OCR correctly fills passport fields ✅
- Auto-save works without page refresh ✅
- Data appears in admin view ✅

---

### Step 6: POA Generation & E-Sign
**Status:** 🔄 PENDING  
**Dependencies:** Step 5 complete

**What to build:**
1. **POA Workflow:**
   ```
   Intake → Auto-generate POA → Client e-sign → HAC approve → Valid
   ```

2. **Auto-Generate POA:**
   - Use existing `fill-pdf` edge function
   - Map intake data to POA template
   - Generate PDF automatically when intake complete

3. **E-Signature Component:**
   - Canvas-based signature capture
   - Save signature as image
   - Embed in PDF
   - Store in `poa` table with `client_signed = true`

4. **HAC Approval:**
   - Admin view at `/admin/cases/{id}/poa`
   - Review button → sets `hac_approved = true`
   - Upload to Dropbox automatically
   - Update case KPI

**Verification:**
- POA auto-generates from intake ✅
- Client can sign via link ✅
- HAC can approve/reject ✅
- Approved POA updates KPI ✅

---

## 📄 PART 3: APPLICATION GENERATION (Steps 7-9)

### Step 7: OBY Draft Generation
**Status:** 🔄 PENDING  
**Dependencies:** Step 6 complete

**What to build:**
1. **OBY Form Structure:**
   - ~140 fields (already in `master_table`)
   - Auto-populate from intake data
   - Fields mapped via `fieldMappings.ts`

2. **Draft Creation:**
   - Button: "Generate OBY Draft"
   - Creates record in `oby_forms` table
   - Status: `draft`
   - Pre-fills all available data

3. **HAC Review Flow:**
   - Admin edits draft at `/admin/cases/{id}/citizenship`
   - "Approve for Filing" button
   - Sets `hac_approved = true`, `status = 'ready_to_file'`

4. **Filed Status:**
   - "Mark as Filed" button
   - Sets `status = 'filed'`, `filed_date = now()`
   - Updates case `oby_filed` KPI

**Verification:**
- Draft auto-fills from intake ✅
- HAC can review and edit ✅
- Filed status updates case timeline ✅

---

### Step 8: Documents Engine
**Status:** 🔄 PENDING  
**Dependencies:** All forms complete

**What to build:**
1. **Doc Radar System:**
   - Track required documents per person:
     - AP (Applicant): birth cert, passport, naturalization
     - F (Father): birth cert, marriage, naturalization
     - M (Mother): birth cert, marriage, naturalization
     - PGF, PGM, MGF, MGM (Grandparents): birth, marriage

2. **Document Tracking:**
   ```typescript
   interface DocumentStatus {
     person: 'AP' | 'F' | 'M' | 'PGF' | 'PGM' | 'MGF' | 'MGM';
     type: 'birth' | 'marriage' | 'naturalization' | 'passport';
     status: 'missing' | 'uploaded' | 'verified' | 'translated';
     required: boolean;
   }
   ```

3. **Translation Flags:**
   - Auto-detect document language
   - If not Polish → flag for translation
   - Create task for translator
   - Track translation status

4. **Archive Request Generator:**
   - Generate Polish-language letters
   - Templates for:
     - Umiejscowienie (locating records)
     - Uzupełnienie (supplementary request)
   - Auto-fill with case data

**Verification:**
- Missing docs show as tasks ✅
- Translation tasks auto-create ✅
- Archive letters generate correctly ✅
- Doc % updates on case card ✅

---

### Step 9: WSC Letter Stage
**Status:** 🔄 PENDING  
**Dependencies:** Step 7 complete

**What to build:**
1. **Timeline Extension:**
   - Add "WSC Letter" stage between OBY and Authority Review
   - Visual timeline component update

2. **WSC Letter Upload:**
   - UI at `/admin/cases/{id}/wsc`
   - Upload PDF
   - OCR to extract:
     - Letter date
     - Reference number
     - Deadline date
   - Store in `wsc_letters` table

3. **HAC Review:**
   - Review extracted data
   - Set strategy: `PUSH` | `NUDGE` | `SITDOWN`
   - Add notes

4. **Strategy Buttons:**
   - PUSH: Aggressive response
   - NUDGE: Gentle follow-up
   - SIT-DOWN: Schedule meeting
   - Each creates HAC log entry

5. **KPI Update:**
   - Case card shows "WSC: Received" chip
   - Deadline countdown

**Verification:**
- WSC upload works ✅
- OCR extracts dates correctly ✅
- Strategy selection logs to HAC ✅
- Timeline shows WSC stage ✅

---

## 🔌 PART 4: INTEGRATIONS (Steps 10-12)

### Step 10: Partner API
**Status:** 🔄 PENDING  
**Dependencies:** Step 5 complete

**What to build:**
1. **REST API Endpoints:**
   ```
   POST /api/partner/intake
   GET /api/partner/status/{case_id}
   GET /api/partner/cases
   ```

2. **Authentication:**
   - API key-based auth
   - Store partner keys in `partner_credentials` table
   - Rate limiting

3. **Intake Submission:**
   ```typescript
   POST /api/partner/intake
   {
     "partner_id": "xyz",
     "api_key": "...",
     "client_data": { /* intake fields */ }
   }
   // Response: { case_id, status, magic_link }
   ```

4. **Status Endpoint:**
   ```typescript
   GET /api/partner/status/{case_id}
   // Response: { 
   //   stage, 
   //   intake_complete, 
   //   poa_signed, 
   //   oby_filed,
   //   estimated_completion 
   // }
   ```

**Verification:**
- Partner can submit intake via API ✅
- Case created in system ✅
- Status endpoint returns accurate data ✅

---

### Step 11: Typeform Integration
**Status:** 🔄 PENDING  
**Dependencies:** Step 5 complete

**What to build:**
1. **Typeform Webhook Handler:**
   - Edge function: `typeform-webhook`
   - Receives Typeform submissions
   - Maps Typeform fields to intake fields

2. **Auto-Create Lead:**
   - Create case with status `lead`
   - Client code: `LEAD-{incremental_id}`
   - Create intake_data record

3. **Field Mapping:**
   ```typescript
   const TYPEFORM_MAP = {
     'question_abc123': 'applicant_first_name',
     'question_def456': 'applicant_email',
     // etc.
   }
   ```

4. **Notification:**
   - Send email to admin
   - Show in dashboard with "NEW LEAD" badge

**Verification:**
- Typeform submission creates case ✅
- Fields map correctly ✅
- Admin receives notification ✅

---

### Step 12: Manual Case Creation
**Status:** ✅ ALREADY EXISTS  
**Location:** `/admin/cases`

**Current functionality:**
- "New Client" button
- Form with basic fields
- Creates case in database

**Enhancements needed:**
- Auto-generate client code
- Auto-create Dropbox folder
- Send welcome email to client
- Create magic link for intake

---

## 🛡️ PART 5: OVERSIGHT & SECURITY (Steps 13-17)

### Step 13: HAC Logging
**Status:** ✅ PARTIALLY COMPLETE  
**Table:** `hac_logs` exists

**What to enhance:**
1. **Auto-log all major actions:**
   - POA approval
   - OBY approval
   - WSC strategy selection
   - Document verification
   - Case status changes

2. **Log Viewer:**
   - UI at `/admin/cases/{id}/logs`
   - Chronological timeline
   - Filter by action type
   - Export to CSV

**Verification:**
- All actions log automatically ✅
- Logs display in admin UI ✅
- Audit trail is complete ✅

---

### Step 14: System Checks Console
**Status:** 🔄 PENDING  
**Dependencies:** Step 1 complete

**What to build:**
1. **Health Dashboard** (`/admin/system`)
   - Database health
   - Edge function status
   - Dropbox sync status
   - Real-time error monitoring

2. **QA Checks:**
   - Run QA harness on demand
   - View historical results
   - Set up alerts for failures

3. **Security Scanner:**
   - RLS policy checker
   - Exposed data detector
   - Password breach checker

4. **Performance Metrics:**
   - Average response times
   - Database query performance
   - Edge function execution times

**Verification:**
- All systems show green ✅
- Alerts trigger for issues ✅
- Performance within acceptable range ✅

---

### Step 15: Nightly Backups
**Status:** 🔄 PENDING  
**Dependencies:** Dropbox integration

**What to build:**
1. **Backup Edge Function:**
   - Runs via cron (nightly at 2 AM UTC)
   - Creates zip of `/CASES` folder
   - Includes manifest JSON with metadata

2. **Backup Storage:**
   - Store in `/BACKUPS/{YYYY-MM-DD}/`
   - Keep last 30 days
   - Auto-delete older backups

3. **Manifest Structure:**
   ```json
   {
     "timestamp": "2025-01-15T02:00:00Z",
     "total_cases": 150,
     "total_size_mb": 2048,
     "case_ids": ["uuid1", "uuid2", ...],
     "integrity_hash": "sha256..."
   }
   ```

4. **Restore Function:**
   - Select backup date
   - Restore specific cases or all
   - Verify integrity before restore

**Verification:**
- Backup runs automatically ✅
- Manifest is accurate ✅
- Restore works correctly ✅

---

### Step 16: Data Masking
**Status:** 🔄 PENDING  
**Priority:** HIGH (Security)

**What to build:**
1. **Passport Number Masking:**
   - UI shows: `***********1234` (last 4 digits)
   - Full number only in:
     - POA PDF
     - Citizenship application PDF
   - Database stores full number (encrypted)

2. **Role-Based Access:**
   - Admin: sees full numbers
   - Assistant: sees masked
   - Client: sees own full number only

3. **Logging:**
   - Don't log full passport numbers
   - Mask in error messages
   - Mask in HAC logs

**Verification:**
- Passport numbers masked in UI ✅
- Full numbers in PDFs ✅
- No full numbers in logs ✅

---

### Step 17: Role Management
**Status:** ✅ ALREADY EXISTS  
**Table:** `user_roles` exists

**Current roles:**
- `admin`: Full access
- `assistant`: Limited access
- `client`: Own case only

**Enhancements needed:**
1. **Permission Matrix:**
   ```
   Feature          | Admin | Assistant | Client
   -----------------+-------+-----------+--------
   View all cases   |  ✅   |    ✅     |   ❌
   Edit cases       |  ✅   |    ✅     |   ❌
   Delete cases     |  ✅   |    ❌     |   ❌
   Approve POA      |  ✅   |    ❌     |   ❌
   Approve OBY      |  ✅   |    ❌     |   ❌
   View own case    |  ✅   |    ✅     |   ✅
   Upload docs      |  ✅   |    ✅     |   ✅
   ```

2. **UI Updates:**
   - Hide features based on role
   - Show "Permission denied" for unauthorized actions

**Verification:**
- Roles enforce correctly ✅
- UI respects permissions ✅
- RLS policies match roles ✅

---

## 👤 PART 6: CLIENT PORTAL (Steps 18-20)

### Step 18: Magic Link Login
**Status:** 🔄 PENDING  
**Dependencies:** Client portal access table exists

**What to build:**
1. **Magic Link Generation:**
   - Generate token on case creation
   - Store in `client_portal_access` table
   - Send via email

2. **Login Flow:**
   - Client clicks link: `/client/login/{token}`
   - Verify token validity
   - Create session
   - Redirect to dashboard

3. **Token Management:**
   - Expires after 30 days
   - Can regenerate
   - Track login count and last login

**Verification:**
- Link works for clients ✅
- Invalid tokens rejected ✅
- Session persists correctly ✅

---

### Step 19: Client Dashboard
**Status:** 🔄 PENDING  
**Dependencies:** Step 18 complete

**What to build:**
1. **Dashboard Layout** (`/client/dashboard`)
   - Welcome message
   - Stage timeline (simplified, no internal details)
   - Document checklist
   - Upload box
   - Message channel
   - Signed POA download

2. **Features:**
   - No technical jargon
   - Simple progress indicators
   - Clear next steps
   - Help tooltips

3. **Components:**
   ```
   - StageTimeline (client version)
   - DocumentChecklist
   - FileUploadBox
   - MessageChannel
   - SignedDocuments
   ```

**Verification:**
- Client sees their case only ✅
- Timeline is accurate ✅
- Uploads work ✅
- Messages send/receive ✅

---

### Step 20: Consulate Kit Generator
**Status:** 🔄 PENDING  
**Dependencies:** Decision received

**What to build:**
1. **Trigger:**
   - When `decision_received = true`
   - Auto-generate consulate kit

2. **Kit Contents:**
   - Checklist for passport application:
     - ✅ Polish citizenship decision
     - ✅ Birth certificate
     - ✅ Photos (specific requirements)
     - ✅ Application form
     - ✅ Fee payment proof
   - Appointment booking instructions
   - Consulate contact info

3. **Delivery:**
   - PDF generation
   - Email to client
   - Available in client portal
   - Downloadable

**Verification:**
- Kit generates automatically ✅
- All info is accurate ✅
- Client receives email ✅
- PDF is complete ✅

---

## 🧪 PART 7: FINAL TESTING (Steps 21-31)

### Step 21-28: End-to-End Case Flows
**Status:** 🔄 PENDING  
**Dependencies:** All previous steps

**Test Cases:**

1. **Lead → Decision (Full Flow)**
   - Create lead from Typeform
   - Complete intake
   - Generate & sign POA
   - HAC approve POA
   - Generate OBY draft
   - HAC approve OBY
   - File OBY
   - Receive WSC letter
   - Set strategy
   - Receive decision
   - Generate consulate kit

2. **Partner API Flow**
   - Submit via API
   - Verify case creation
   - Check status endpoint
   - Complete workflow

3. **Manual Creation Flow**
   - Create via admin panel
   - Assign to client
   - Send magic link
   - Client completes intake

4. **Document Flow**
   - Upload documents
   - Flag for translation
   - Verify documents
   - Update percentage

5. **Multi-role Test**
   - Admin actions
   - Assistant actions
   - Client actions
   - Permission boundaries

---

### Step 29: KPI & Docs Verification
**Status:** 🔄 PENDING

**Verify:**
- All KPIs calculate correctly
- Real-time updates work
- Document percentage accurate
- Tasks count properly

---

### Step 30: Multi-source Case Creation
**Status:** 🔄 PENDING

**Test all sources:**
1. Dropbox scan → auto-create
2. Manual admin form
3. Typeform webhook
4. Partner API

**Verify:**
- All sources create valid cases
- Client codes follow convention
- Dropbox folders created
- KPIs initialized

---

### Step 31: WSC Full Lifecycle
**Status:** 🔄 PENDING

**Test:**
1. Upload WSC letter
2. OCR extraction
3. HAC review
4. Strategy selection
5. Deadline tracking
6. Timeline update
7. Export evidence bundle

**Verify:**
- Each step works
- Data flows correctly
- Logs are created
- Case updates properly

---

## 📊 SUCCESS CRITERIA

Before marking the project **COMPLETE**, verify:

- [ ] QA Harness: All tests pass
- [ ] 5 real cases processed successfully
- [ ] All intake sources working
- [ ] WSC workflow complete
- [ ] Client portal accessible
- [ ] Partner API functional
- [ ] Backups running
- [ ] Security: No exposed data
- [ ] Roles enforce correctly
- [ ] All PDFs generate
- [ ] All KPIs accurate
- [ ] Documentation complete

---

## 🎓 NEXT STEPS AFTER COMPLETION

1. **User Training:**
   - Admin panel walkthrough
   - Client portal guide
   - Troubleshooting manual

2. **Monitoring Setup:**
   - Error tracking
   - Performance monitoring
   - Usage analytics

3. **Future Enhancements:**
   - Multi-language support (beyond EN/PL)
   - Mobile app
   - Advanced analytics
   - AI document analysis
   - Automated WSC response generation

---

## 🐛 TROUBLESHOOTING

**Common Issues:**

1. **QA Tests Failing:**
   - Check Supabase connection
   - Verify user is logged in
   - Review RLS policies
   - Check Dropbox credentials

2. **PDFs Not Generating:**
   - Verify fill-pdf edge function deployed
   - Check field mappings
   - Review PDF template compatibility

3. **Real-time Not Working:**
   - Verify Supabase realtime enabled
   - Check channel subscriptions
   - Review RLS policies for SELECT

4. **Dropbox Sync Issues:**
   - Refresh tokens expired
   - Path naming conflicts
   - Permission issues

---

**END OF BUILD PLAN**

*This document will be updated as each step is completed.*
