# What's Left from the Big Plan

## ✅ COMPLETED (Steps 1-6 Foundation)

### Step 1: QA Harness ✅
- QA Harness UI at `/admin/qa-harness`
- Dropbox diagnostics working

### Forms Excellence ✅ (Just Finished!)
- All 6 forms migrated to `useFormManager`
- Auto-save, validation, real-time sync active
- Build passing, security clean

---

## 🔄 REMAINING WORK (Steps 2-31)

### 🏗️ HIGH PRIORITY (Foundation)

#### Step 2: Dropbox Migration Scan ⏳
- Build `/admin/dropbox-migration` UI
- Scan `/CASES` folder for naming issues
- Dry-run mode + approval system
- Undo capability

#### Step 3: Hybrid Naming Scheme ⏳
- Format: `/CASES/{country_code}{number}_{client_name}/`
- Example: `USA001_John_Smith`
- Auto-generate on case creation

#### Step 4: Dashboard KPI Strip ⏳
- Real-time KPI calculations
- Visual indicators on case cards
- Track: Intake, POA, OBY, WSC, Decision

---

### 📋 MEDIUM PRIORITY (Core Features)

#### Step 5: Universal Intake Wizard ⏳
- Client-facing intake form
- Multi-step wizard (7 steps)
- EN/PL toggle
- Auto-save
- Passport OCR → auto-fill
- "I don't know" options

#### Step 6: POA Generation & E-Sign ⏳
- Auto-generate POA from intake
- Canvas signature capture
- HAC approval workflow
- Auto-upload to Dropbox

#### Step 7: OBY Draft Generation ⏳
- ~140 fields auto-populated
- HAC review & approval
- "Mark as Filed" workflow

#### Step 8: Documents Engine ⏳
- Doc Radar (track missing docs)
- Translation flags
- Archive request letters (PL)
- USC workflows (umiejscowienie/uzupełnienie)

#### Step 9: WSC Letter Stage ⏳
- Upload WSC letter
- OCR date/ref/deadline
- Strategy buttons (PUSH/NUDGE/SITDOWN)
- Timeline extension

---

### 🔌 INTEGRATIONS

#### Step 10: Partner API ⏳
- REST endpoints (POST intake, GET status)
- API key authentication
- Rate limiting

#### Step 11: Typeform Integration ⏳
- Webhook handler
- Auto-create `LEAD-{id}` cases
- Field mapping

#### Step 12: Manual Case Creation ✅
- Already exists at `/admin/cases`
- Needs: Auto-generate code, create Dropbox folder

---

### 🛡️ OVERSIGHT & SECURITY

#### Step 13: Enhanced HAC Logging ⏳
- Auto-log all major actions
- Log viewer UI
- Export to CSV

#### Step 14: System Checks Console ⏳
- Health dashboard
- Real-time error monitoring
- Security scanner
- Performance metrics

#### Step 15: Nightly Backups ⏳
- Cron job (2 AM UTC)
- Zip `/CASES` folder
- Keep last 30 days
- Restore capability

#### Step 16: Data Masking ⏳ HIGH PRIORITY
- Mask passport numbers in UI
- Role-based access
- No sensitive data in logs

#### Step 17: Role Management ✅
- Roles exist (admin/assistant/client)
- Needs: Permission matrix enforcement

---

### 👤 CLIENT PORTAL

#### Step 18: Magic Link Login ⏳
- Token generation
- Email delivery
- Session management

#### Step 19: Client Dashboard ⏳
- Simplified timeline
- Document checklist
- Upload box
- Message channel
- Download signed POA

#### Step 20: Consulate Kit Generator ⏳
- Auto-generate when decision received
- Passport checklist
- Appointment instructions

---

### 🧪 FINAL TESTING (Steps 21-31)

#### Step 21-28: E2E Case Flows ⏳
- Lead → Decision (full journey)
- Partner API flow
- Manual creation flow
- Document flow
- Multi-role testing

#### Step 29: KPI Verification ⏳
- Run 5 real cases
- Verify calculations

#### Step 30: Multi-source Creation ⏳
- Test Dropbox/Manual/Typeform/API

#### Step 31: WSC Full Lifecycle ⏳
- Upload → OCR → Strategy → Export

---

## 📊 PROGRESS SUMMARY

**Completed:** 2/31 steps (~6%)  
- ✅ Step 1: QA Harness
- ✅ Forms Excellence (Steps 1-6 internal)

**Remaining:** 29 steps

---

## 🎯 RECOMMENDED NEXT STEPS

### Immediate (2-3 hours)
1. **Step 2:** Dropbox Migration Scan
2. **Step 3:** Hybrid Naming Scheme
3. **Step 4:** Dashboard KPI Strip

### Short-term (1-2 days)
4. **Step 5:** Universal Intake Wizard
5. **Step 8:** Documents Engine
6. **Step 16:** Data Masking (Security)

### Medium-term (1 week)
7. **Steps 6-7:** POA & OBY workflows
8. **Steps 10-11:** API integrations
9. **Steps 18-19:** Client portal

### Final (2-3 days)
10. **Steps 21-31:** E2E testing & verification

---

## ⏱️ ESTIMATED TIME

**Total Remaining:** ~60-80 hours  
**With focused work:** 2-3 weeks  

---

Last Updated: 2025-10-13
