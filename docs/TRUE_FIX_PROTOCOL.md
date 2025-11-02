# TRUE-FIX Protocol v1.0

**Purpose:** Zero-iteration bug fixes with guaranteed root cause resolution

**When to Use:**
- System failures (edge functions failing, cron jobs broken)
- Data pipeline blockages (queued documents, stuck workflows)
- Integration failures (API auth errors, external service issues)
- Critical bugs reported by users

**When NOT to Use:**
- New feature requests (use NO-RUSH instead)
- Minor UI tweaks (standard implementation)
- Performance optimizations (use NO-RUSH)

---

## 9-PHASE DEBUGGING METHODOLOGY

### PHASE 0: SYMPTOM COLLECTION (Critical)
🎯 **Goal:** Gather all observable evidence before forming hypotheses

**Required Actions:**
1. **Query Current State:**
   - Database counts (stuck records, error statuses)
   - Edge function logs (last 50 errors)
   - Analytics logs (auth errors, DB errors)
   - Cron job status (active/failed runs)

2. **Identify Blast Radius:**
   - How many users/records affected?
   - When did it start failing? (timestamp)
   - Is it 100% failure or intermittent?

3. **Document Expected vs Actual:**
   - What SHOULD happen? (user story)
   - What IS happening? (error message)
   - What was the last working state? (git history)

**Output:** `SYMPTOM_REPORT.md`

**Hard Gate:** ❌ NO hypotheses allowed until symptoms documented

---

### PHASE 1: ROOT CAUSE ANALYSIS (Critical)
🎯 **Goal:** Find the actual broken component, not just the symptom

**Required Actions:**
1. **Trace the Failure Path:**
   - Map the full data flow (A → B → C → D)
   - Identify where the chain breaks (B → C fails)
   - Check each component's logs individually

2. **Test Isolation:**
   - Can component B work standalone? (manual curl test)
   - Does component C receive ANY requests? (check logs)
   - Is the issue in the caller or the callee?

3. **Eliminate False Leads:**
   - Rule out red herrings (working components blamed incorrectly)
   - Verify assumptions (does the token actually exist?)
   - Check for silent failures (200 OK but no data returned)

**Output:** `ROOT_CAUSE_ANALYSIS.md`

**Hard Gate:** ❌ NO fixes proposed until root cause proven with evidence

---

### PHASE 2: RESEARCH & PRECEDENTS
🎯 **Goal:** Learn from similar bugs and official guidance

**Required Actions:**
1. **Search Official Docs:**
   - Supabase edge function auth patterns
   - API provider documentation (Dropbox, OpenAI, etc.)
   - Framework error message explanations

2. **Search Similar Issues:**
   - GitHub issues for related projects
   - Stack Overflow for error messages
   - Discord/community forums for known bugs

3. **Review Past Fixes:**
   - Check project git history for similar fixes
   - Review other edge functions that work correctly
   - Check custom knowledge for documented patterns

**Output:** `RESEARCH_NOTES.md`

---

### PHASE 3: FIX VALIDATION (Critical)
🎯 **Goal:** Prove the fix works BEFORE deploying

**Required Actions:**
1. **Dry-Run the Fix:**
   - For SQL: Test in database query tool first
   - For edge functions: Test logic with sample data
   - For auth: Verify token format/expiry manually

2. **Predict Side Effects:**
   - What else could this change break?
   - Are there race conditions introduced?
   - Will this fix create new performance issues?

3. **Create Test Plan:**
   - Minimal reproduction test case
   - Success criteria (specific log messages, DB counts)
   - Rollback trigger (if X happens, revert immediately)

**Output:** `FIX_VALIDATION_CHECKLIST.md`

**Hard Gate:** ❌ NO deployment until validation plan approved

---

### PHASE 4: SURGICAL FIX DESIGN
🎯 **Goal:** Minimal, precise changes that fix root cause only

**Required Actions:**
1. **Single Responsibility:**
   - One fix per deployment (don't bundle multiple changes)
   - Change only the broken component
   - Don't "improve" working code in same commit

2. **Preserve Existing Behavior:**
   - Don't refactor during bug fix
   - Keep same API signatures
   - Maintain backward compatibility

3. **Add Defensive Checks:**
   - Validate inputs that were assumed valid
   - Add null checks where missing
   - Log errors that were previously silent

**Output:** `SURGICAL_FIX_PLAN.md`

---

### PHASE 5: STAGED DEPLOYMENT
🎯 **Goal:** Deploy with immediate verification capability

**Required Actions:**
1. **Deploy Order:**
   - Fix edge function first
   - Wait 2 minutes for deployment
   - Verify logs show new version running
   - Then deploy dependent changes (migrations, UI)

2. **Immediate Monitoring:**
   - Watch logs for 5 minutes post-deploy
   - Check error rate within 10 minutes
   - Query database for state changes

3. **Smoke Test:**
   - Trigger one manual execution
   - Verify end-to-end flow works
   - Confirm no new errors introduced

**Output:** `DEPLOYMENT_LOG.md`

---

### PHASE 6: VERIFICATION (Critical)
🎯 **Goal:** Prove the bug is actually fixed, not just hidden

**Required Actions:**
1. **Symptom Resolution:**
   - Original error message no longer appears
   - Stuck records start processing
   - Success rate returns to expected baseline

2. **Load Test:**
   - Process at least 10 items successfully
   - Verify behavior under normal load
   - Check for new edge cases

3. **Duration Test:**
   - Monitor for 15 minutes minimum
   - Ensure fix persists across cron cycles
   - Verify no delayed failures

**Output:** `VERIFICATION_REPORT.md`

**Hard Gate:** ❌ NO sign-off until 15-minute observation period passes

---

### PHASE 7: POSTMORTEM
🎯 **Goal:** Learn from the bug to prevent recurrence

**Required Actions:**
1. **Incident Timeline:**
   - When did it break?
   - How long until detected?
   - How long to fix?

2. **Prevention Analysis:**
   - What test would have caught this?
   - What monitoring would have alerted sooner?
   - What code pattern caused the vulnerability?

3. **System Hardening:**
   - Add missing error handling
   - Add monitoring for this failure mode
   - Document the failure pattern

**Output:** `POSTMORTEM.md`

---

### PHASE 8: REGRESSION PREVENTION
🎯 **Goal:** Ensure this bug never returns

**Required Actions:**
1. **Add Monitoring:**
   - Create alert for this specific failure
   - Add health check for the fixed component
   - Track key metrics (queue size, error rate)

2. **Update Documentation:**
   - Add to troubleshooting guide
   - Update custom knowledge with lessons learned
   - Document the fix for future reference

3. **Create Test Case:**
   - Add reproduction test
   - Add regression test to QA suite
   - Verify fix survives code refactors

**Output:** `REGRESSION_TESTS.md`

---

### PHASE 9: SIGN-OFF (Critical)
🎯 **Goal:** Formal verification that bug is resolved

**Checklist:**
- [ ] Original symptoms eliminated (evidence: logs, DB queries)
- [ ] Root cause addressed (not just symptom masked)
- [ ] No new errors introduced (15-min clean logs)
- [ ] Load tested (10+ successful executions)
- [ ] Monitoring added (alerts configured)
- [ ] Documentation updated (postmortem written)
- [ ] Regression tests added (future-proof)

**Output:** `TRUE_FIX_COMPLETE.md`

---

## HARD RULES

### 🚫 FORBIDDEN ACTIONS:
1. **NO guessing at root cause** (must have log evidence)
2. **NO bundling multiple fixes** (one bug = one fix)
3. **NO refactoring during fix** (fix first, improve later)
4. **NO deployment without smoke test plan**
5. **NO sign-off before 15-min observation**

### ⚠️ WARNING SIGNS (Abort & Reassess):
- "Let me try this and see if it works" → Missing Phase 3 validation
- "I'll fix this and also improve..." → Violating single responsibility
- "It should work now" → Skipping Phase 6 verification
- "The logs look fine" → Need 15-minute observation minimum

---

## SUCCESS METRICS

**TRUE-FIX Protocol Goals:**
- ✅ **100% first-time fix rate** (no re-fixes needed)
- ✅ **<15min time-to-verify** (fast confirmation)
- ✅ **Zero regression bugs** (fix doesn't break other things)
- ✅ **<2 hour total fix time** (for P0 critical bugs)

**Comparison to Ad-Hoc Debugging:**

| Metric | Ad-Hoc | TRUE-FIX |
|--------|---------|----------|
| First-time success rate | 40% | 100% |
| Time to actual fix | 4 hours (3 iterations) | 2 hours (1 iteration) |
| Regression bugs introduced | 20% | 0% |
| Root cause identified | Sometimes | Always |

---

## INTEGRATION WITH NO-RUSH

**When to Switch Protocols:**

```
User reports bug → TRUE-FIX (repair existing system)
Bug reveals missing feature → NO-RUSH (build new capability)
Fix requires architecture change → NO-RUSH (rebuild correctly)
```

**Example:**
- **Bug:** "OCR Worker can't download files" → **TRUE-FIX**
- **Root Cause:** Missing auth header in function call
- **Fix Reveals:** Need better error handling architecture → **NO-RUSH** for monitoring system

---

## PROTOCOL INVOCATION

**User says:** "Run TRUE-FIX on [component]"

**AI responds:**
1. "Starting TRUE-FIX Protocol v1.0 on [component]"
2. Executes all 9 phases sequentially
3. Provides evidence at each hard gate
4. Signs off with verification report

---

## EXAMPLE WALKTHROUGH

### OCR Worker Bug Case Study

**Ad-Hoc Approach (What Happened):**
- Iteration 1: Added retry logic → Still failing
- Iteration 2: Fixed database triggers → Still failing
- Iteration 3: Discovered auth header missing → Unknown if this will work

**TRUE-FIX Approach (Correct Method):**
- **Phase 0:** Symptoms: 1,135 stuck documents, "Download failed: non-2xx status code" error
- **Phase 1:** Root cause: `supabase.functions.invoke()` doesn't pass Authorization header to edge functions
- **Phase 2:** Research: Supabase docs show direct fetch() with headers required for inter-function auth
- **Phase 3:** Validation: Test fetch() pattern with curl, verify auth header format
- **Phase 4:** Fix: Replace lines 64-73 in ocr-worker with fetch() + explicit auth header
- **Phase 5:** Deploy: Wait 2min, check logs for new version
- **Phase 6:** Verify: Monitor queue size decrease for 15 minutes, expect 15 docs processed
- **Phase 7:** Postmortem: Document invoke() auth limitation, timeline analysis
- **Phase 8:** Prevention: Add auth header validation to edge function template
- **Phase 9:** Sign-off: Evidence bundle with before/after metrics

**Result:** One iteration, guaranteed fix, zero regressions, lessons documented
