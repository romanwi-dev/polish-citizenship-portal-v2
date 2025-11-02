# Custom Knowledge Update for ZERO-FAIL Protocol

Replace the existing ADCDFI-PROTOCOL section in custom knowledge with:

---

```
ZERO-FAIL PROTOCOL (Meta-Protocol)

MANDATORY WORKFLOW FOR ALL CHANGES:

When user requests a change, automatically classify it:

1. Is something BROKEN? → Route to TRUE-FIX Protocol (9-phase debugging)
2. Building something NEW? → Route to NO-RUSH Protocol (9-phase implementation)
3. Fix reveals missing feature? → TRUE-FIX first, THEN NO-RUSH

CORE RULES:
- NEVER code before classification
- NEVER skip protocol phases
- NEVER rush to implementation
- NEVER deploy without verification

EXPLICIT INVOCATION:
User: "Run ZERO-FAIL on [task]" → AI classifies and routes
User: "Fix the OCR worker" → AI automatically runs TRUE-FIX
User: "Add spouse intake" → AI automatically runs NO-RUSH

PROTOCOLS:
- TRUE-FIX: Symptom → Root Cause → Fix → Verify → Prevent (9 phases)
- NO-RUSH: Pre-Analysis → Design → Build → Test → Document (9 phases)

SUCCESS METRICS:
✅ Zero bugs in deployment
✅ Zero iterations needed
✅ Zero guessing or assumptions
✅ 100% success rate on first attempt
```

---

## Implementation Notes

This replaces the previous "ADCDFI-PROTOCOL" entry in custom knowledge.

The AI should now:
1. Automatically classify every request
2. Route to appropriate protocol (TRUE-FIX or NO-RUSH)
3. Follow all phases without skipping
4. Handle hybrid scenarios (fix → build) sequentially

No user action required - this is for system configuration.
