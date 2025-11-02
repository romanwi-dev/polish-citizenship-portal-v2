# ZERO-FAIL PROTOCOL v1.0
## Meta-Protocol for All Development Work

---

## Purpose

**ZERO-FAIL** is the master protocol that ensures:
- ✅ Zero bugs in deployment
- ✅ Zero iterations needed
- ✅ Zero guessing or assumptions
- ✅ 100% success rate on first attempt

It acts as a **classifier and router** to two specialized protocols:
- **TRUE-FIX** → For debugging broken systems
- **NO-RUSH** → For building new features

---

## Decision Tree

```
User Request Received
        ↓
Is something BROKEN?
        ↓
    YES → Route to TRUE-FIX Protocol (9-phase debugging)
        ↓
    Fix reveals missing feature?
        ↓
    YES → Route to NO-RUSH Protocol (9-phase build)
        ↓
    DONE ✓

User Request Received
        ↓
Is something BROKEN?
        ↓
    NO → Building something NEW?
        ↓
    YES → Route to NO-RUSH Protocol (9-phase build)
        ↓
    DONE ✓
```

---

## Protocol Routing Logic

### **Route to TRUE-FIX when:**
- ❌ System is broken/failing
- ❌ Feature exists but doesn't work
- ❌ Errors in logs/console
- ❌ Data corruption/inconsistency
- ❌ Performance degradation
- ❌ User reports "it's not working"

**Examples:**
- "The OCR worker is failing"
- "Translation assignments aren't being created"
- "Dashboard KPIs show wrong values"
- "Users can't upload documents"

### **Route to NO-RUSH when:**
- ✨ Building new feature
- ✨ Adding new table/schema
- ✨ Creating new UI component
- ✨ Implementing new workflow
- ✨ Adding new integration
- ✨ User asks to "add" or "create"

**Examples:**
- "Add spouse section to intake form"
- "Create translation workflow"
- "Build WSC letter stage"
- "Add partner API endpoint"

### **Hybrid Scenarios (Sequential)**

When a bug fix reveals a missing feature:

```
Step 1: TRUE-FIX (repair broken system)
        ↓
Step 2: NO-RUSH (build missing capability)
```

**Example:**
```
User: "Fix the translation system"
AI: Investigates → Finds bug in assignment logic
AI: Runs TRUE-FIX → Repairs assignment logic
AI: Discovers no monitoring dashboard exists
AI: Runs NO-RUSH → Builds monitoring dashboard
```

---

## Invocation

### **Explicit**
```
User: "Run ZERO-FAIL on [task]"
AI: Classifies request → Routes to appropriate protocol
```

### **Implicit (Automatic)**
```
User: "The OCR isn't working"
AI: Detects broken system → Automatically runs TRUE-FIX

User: "Add WSC letter stage"
AI: Detects new feature → Automatically runs NO-RUSH
```

---

## Core Principles (Shared by Both Protocols)

1. **UNDERSTAND FIRST**
   - Never code before investigation
   - Read all relevant context
   - Map all dependencies

2. **RESEARCH BEFORE DECIDING**
   - Check documentation
   - Review similar implementations
   - Identify best practices

3. **VALIDATE ASSUMPTIONS**
   - Dry-run changes
   - Test constraints
   - Verify rollback plans

4. **DESIGN BEFORE BUILDING**
   - Create architecture diagrams
   - Define migration sequences
   - List edge cases

5. **IMPLEMENT WITH PROOF**
   - Log every change
   - Test after each step
   - Verify success metrics

6. **CONFIRM DEPLOYMENT**
   - End-to-end testing
   - Performance checks
   - Security audits

7. **DOCUMENT EVERYTHING**
   - System architecture
   - Troubleshooting guides
   - Monitoring dashboards

---

## Success Metrics

### **Zero Bugs**
- No errors in deployment
- No rollbacks needed
- No hotfixes required

### **Zero Iterations**
- First implementation works
- No revisions needed
- No "try again" cycles

### **Zero Guessing**
- All assumptions validated
- All constraints tested
- All dependencies mapped

### **100% Success Rate**
- Every deployment succeeds
- Every test passes
- Every user flow works

---

## Protocol References

- **TRUE-FIX Protocol** → See `docs/TRUE_FIX_PROTOCOL.md`
- **NO-RUSH Protocol** → See `docs/NO_RUSH_V2_PROTOCOL.md`

---

## Quick Reference

| Scenario | Protocol | Phases |
|----------|----------|--------|
| Bug/Error/Failure | TRUE-FIX | 9 (Symptom → Root Cause → Deploy → Verify → Prevent) |
| New Feature/Build | NO-RUSH | 9 (Pre-Analysis → Design → Implement → Test → Document) |
| Hybrid (Fix + Build) | TRUE-FIX → NO-RUSH | Sequential application |

---

## Enforcement

### **Hard Rules**
1. ❌ NO coding before classification
2. ❌ NO skipping protocol phases
3. ❌ NO rushing to implementation
4. ❌ NO deploying without verification

### **Consequences of Violation**
- 🚫 Stop immediately
- 🚫 Return to Phase 0
- 🚫 Re-run classification
- 🚫 Document what was missed

---

## Time Investment vs Traditional Approach

| Approach | Investigation | Implementation | Debugging | Total | Success Rate |
|----------|--------------|----------------|-----------|-------|--------------|
| **Traditional** | 10 min | 30 min | 120 min | **160 min** | 60% |
| **ZERO-FAIL** | 40 min | 30 min | 0 min | **70 min** | 100% |

**ROI:** 56% time reduction + 40% higher success rate

---

## Example Workflows

### **Example 1: Pure Debug**
```
User: "OCR worker is failing"
ZERO-FAIL: Detects broken system → Routes to TRUE-FIX
TRUE-FIX Phases:
  0. Symptom Collection
  1. Investigation
  2. Root Cause Analysis
  3. Solution Design
  4. Fix Implementation
  5. Deployment
  6. Verification
  7. Prevention
  8. Documentation
Result: Worker fixed, monitoring added, no recurrence
```

### **Example 2: Pure Build**
```
User: "Add spouse intake fields"
ZERO-FAIL: Detects new feature → Routes to NO-RUSH
NO-RUSH Phases:
  0. Pre-Analysis
  1. Analysis
  2. Consultation
  3. Double-Check
  4. Find-Solution
  5. Fix (Design)
  6. Implement
  7. Confirm
  8. Documentation
Result: Fields added, validated, deployed, documented
```

### **Example 3: Hybrid**
```
User: "Fix translation workflow"
ZERO-FAIL: Investigates → Finds bug + missing feature

Phase 1: TRUE-FIX
  - Symptom: Assignments not created
  - Root Cause: Missing foreign key constraint
  - Fix: Add constraint + backfill data
  - Result: Assignments now created correctly

Phase 2: NO-RUSH
  - Discovery: No monitoring dashboard exists
  - Design: Translation progress tracker
  - Build: Dashboard with KPIs
  - Result: Team can now track translation status

Total Result: Workflow fixed + monitoring added
```

---

## Success Criteria

Before marking ZERO-FAIL complete, verify:

- ✅ Correct protocol was selected (TRUE-FIX or NO-RUSH)
- ✅ All phases of selected protocol completed
- ✅ Verification tests passed
- ✅ Documentation updated
- ✅ Monitoring in place
- ✅ Team notified of changes
- ✅ No errors in logs
- ✅ No performance degradation
- ✅ No security vulnerabilities introduced

---

**ZERO-FAIL = ZERO shortcuts. Every phase matters.**
