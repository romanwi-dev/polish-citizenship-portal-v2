import { runTripleVerification } from './utils/tripleVerification';

const phaseAAnalysis = `
# PHASE A ANALYSIS: Mobile Client Card Editing Failures

## DOMAIN: Mobile Form Persistence & Input Handling
## TOTAL ISSUES: 5 Critical

---

## CRITICAL ISSUE #1: Save Failure Due to State Reset Race Condition
**Location**: \`src/components/EditCaseDialog.tsx\` lines 78-96

**Root Cause**: The \`useEffect\` hook that loads form data runs on every \`caseData.id\` change. When a user saves, the save operation triggers a React Query cache update, which causes \`caseData\` to re-render with the new data from the server. This triggers the \`useEffect\` again DURING the save operation, potentially wiping out user edits that haven't been persisted yet.

**Evidence**:
\`\`\`typescript
useEffect(() => {
  if (caseData) {
    setFormData({
      id: caseData.id,
      status: caseData.status || '',
      // ... 15+ other fields
    });
  }
}, [caseData]); // Runs on EVERY caseData change
\`\`\`

**Impact**: On mobile, async save operations are slower due to network latency. The \`caseData\` object updates mid-save, resetting \`formData\` state and wiping user edits.

**Fix**: Add explicit dependency tracking to prevent state reset during saves:
\`\`\`typescript
const [isSaving, setIsSaving] = useState(false);

useEffect(() => {
  if (caseData && !isSaving) {
    setFormData({ ...fields });
  }
}, [caseData, isSaving]);
\`\`\`

---

## CRITICAL ISSUE #2: Dialog Scroll Conflict with Mobile Keyboard
**Location**: \`src/components/ui/dialog.tsx\` lines 30-40

**Root Cause**: Dialog content uses \`overflow-y-auto\` which creates a scrollable container. On mobile, when the virtual keyboard appears, the browser tries to scroll the focused input into view, but the dialog's scroll container interferes with the native keyboard positioning logic.

**Evidence**:
\`\`\`typescript
<DialogPrimitive.Content
  className="... overflow-y-auto ..." // Conflicts with mobile keyboard
/>
\`\`\`

**Impact**: When user taps an input field:
1. Keyboard appears
2. Browser tries to scroll input into view
3. Dialog's \`overflow-y-auto\` captures the scroll
4. Input remains obscured by keyboard
5. User cannot see what they're typing

**Fix**: Use mobile-specific scroll handling:
\`\`\`typescript
className={cn(
  "... md:overflow-y-auto", // Desktop only
  "max-md:h-full max-md:overflow-visible" // Mobile: no scroll container
)}
\`\`\`

---

## CRITICAL ISSUE #3: Input Focus Prevention on Mobile
**Location**: \`src/components/ui/textarea.tsx\` lines 100-103

**Root Cause**: The \`onFocus\` handler calls \`e.preventDefault()\` and \`focus({ preventScroll: true })\`, which explicitly blocks the browser's default focus behavior. On mobile, this prevents the virtual keyboard from appearing properly.

**Evidence**:
\`\`\`typescript
onFocus={(e) => {
  e.preventDefault(); // BLOCKS mobile keyboard trigger
  setIsFocused(true);
  e.target.focus({ preventScroll: true }); // BLOCKS scroll-to-input
  onFocus?.(e);
}}
\`\`\`

**Impact**: 
- Virtual keyboard may not appear
- Input field doesn't scroll into view
- Cursor appears but typing is disabled
- User taps repeatedly, confused

**Fix**: Remove preventDefault and use conditional preventScroll:
\`\`\`typescript
onFocus={(e) => {
  setIsFocused(true);
  const isMobile = window.innerWidth < 768;
  if (!isMobile) {
    e.target.focus({ preventScroll: true });
  }
  onFocus?.(e);
}}
\`\`\`

---

## CRITICAL ISSUE #4: Missing Touch Event Handling
**Location**: \`src/components/EditCaseDialog.tsx\` (entire component)

**Root Cause**: No explicit \`touch-action\` CSS or pointer event handling for mobile. Radix Dialog may intercept pointer events, causing input fields to lose focus unexpectedly.

**Evidence**: No \`touchAction\`, \`WebkitTouchCallout\`, or mobile-specific event handlers in dialog or input fields.

**Impact**:
- Touch events might be intercepted by dialog overlay
- Scrolling might trigger dialog dismiss
- Input fields might lose focus on touch

**Fix**: Add explicit touch handling:
\`\`\`typescript
<Input
  style={{
    touchAction: 'manipulation',
    WebkitUserSelect: 'text',
    userSelect: 'text'
  }}
/>
\`\`\`

---

## CRITICAL ISSUE #5: Form Submission Before State Completion
**Location**: \`src/components/EditCaseDialog.tsx\` lines 107-117

**Root Cause**: The \`handleSave\` function immediately calls \`mutate(formData)\` without ensuring all pending state updates have completed. On mobile, React state batching can delay updates, causing stale data to be saved.

**Evidence**:
\`\`\`typescript
const handleSave = async () => {
  mutate(formData); // Might have stale data
};
\`\`\`

**Impact**: User edits a field → taps Save → React hasn't flushed state yet → old data gets saved.

**Fix**: Use \`flushSync\` or add state confirmation:
\`\`\`typescript
const handleSave = async () => {
  // Wait for next tick to ensure state is flushed
  await new Promise(resolve => setTimeout(resolve, 0));
  mutate(formData);
};
\`\`\`

---

## PROPOSED SOLUTION ARCHITECTURE

### 1. State Management Fix
- Add \`isSaving\` flag to prevent state resets
- Use \`useRef\` to track form data independently
- Add debouncing to prevent rapid state updates

### 2. Mobile Input Handling
- Remove \`preventDefault()\` from mobile focus handlers
- Add \`touchAction: 'manipulation'\` to all inputs
- Use \`position: fixed\` for dialog on mobile
- Disable dialog scroll container on mobile

### 3. Form Save Flow
- Add pre-save state validation
- Use \`flushSync\` for critical state updates
- Add optimistic updates with rollback
- Implement save confirmation toast

### 4. Testing Strategy
- Test on iOS Safari and Android Chrome
- Verify keyboard appearance and scroll behavior
- Test rapid typing and field switching
- Verify save persistence after navigation

---

## SEVERITY ASSESSMENT
- **Critical Priority**: All 5 issues block core functionality
- **User Impact**: HIGH - Users cannot edit client data on mobile
- **Business Impact**: HIGH - 60%+ of users are mobile
- **Technical Debt**: MEDIUM - Requires architectural changes

## ESTIMATED COMPLEXITY
- **Development**: 4-6 hours
- **Testing**: 2-3 hours
- **Risk Level**: LOW (isolated to EditCaseDialog component)
`;

const context = `
## PROJECT CONTEXT
**Tech Stack**: React 18.3.1, TypeScript, Vite, Tailwind, Radix UI, TanStack Query, Supabase
**Target Platform**: Mobile-first (iOS Safari, Android Chrome)
**Critical Path**: Client onboarding requires mobile data entry
**Business Priority**: URGENT - Blocking 60% of user workflow

## EXISTING ARCHITECTURE
- Form state managed via React useState
- Data persistence via TanStack Query + Supabase
- Dialog component from Radix UI
- Custom Input/Textarea components with glow effects

## CONSTRAINTS
- Cannot change Radix Dialog primitive behavior
- Must maintain existing form validation
- Must preserve auto-save functionality
- Must work offline (pending saves)

## SUCCESS CRITERIA
1. Save button persists all edits on mobile
2. Keyboard appears and stays visible when typing
3. Input fields remain focused while typing
4. No data loss on rapid edits
5. Works on iOS Safari 15+ and Chrome Android 90+
`;

async function main() {
  console.log('='.repeat(80));
  console.log('PHASE B: TRIPLE-MODEL VERIFICATION');
  console.log('Testing: Mobile Client Card Edit Failures');
  console.log('='.repeat(80));
  console.log('');

  try {
    const result = await runTripleVerification(phaseAAnalysis, context);

    console.log('');
    console.log('='.repeat(80));
    console.log('📊 VERIFICATION RESULTS');
    console.log('='.repeat(80));
    console.log('');

    // GPT-5 Results
    console.log('🤖 OpenAI GPT-5');
    console.log('─'.repeat(80));
    console.log(`Score: ${result.gpt5.overall_score}/100`);
    console.log(`Confidence: ${result.gpt5.confidence_level}`);
    console.log(`Recommendation: ${result.gpt5.recommendation.toUpperCase()}`);
    console.log(`Reasoning: ${result.gpt5.reasoning}`);
    console.log('');
    if (result.gpt5.missed_issues.length > 0) {
      console.log('Missed Issues:');
      result.gpt5.missed_issues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
      console.log('');
    }
    if (result.gpt5.incorrect_assumptions.length > 0) {
      console.log('Incorrect Assumptions:');
      result.gpt5.incorrect_assumptions.forEach((assumption, i) => console.log(`  ${i + 1}. ${assumption}`));
      console.log('');
    }

    // Gemini Results
    console.log('🧠 Google Gemini 2.5 Pro');
    console.log('─'.repeat(80));
    console.log(`Score: ${result.gemini.overall_score}/100`);
    console.log(`Confidence: ${result.gemini.confidence_level}`);
    console.log(`Recommendation: ${result.gemini.recommendation.toUpperCase()}`);
    console.log(`Reasoning: ${result.gemini.reasoning}`);
    console.log('');
    if (result.gemini.missed_issues.length > 0) {
      console.log('Missed Issues:');
      result.gemini.missed_issues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
      console.log('');
    }
    if (result.gemini.incorrect_assumptions.length > 0) {
      console.log('Incorrect Assumptions:');
      result.gemini.incorrect_assumptions.forEach((assumption, i) => console.log(`  ${i + 1}. ${assumption}`));
      console.log('');
    }

    // Claude Results (if available)
    if (result.claude) {
      console.log('🎭 Claude Sonnet 4.5');
      console.log('─'.repeat(80));
      console.log(`Score: ${result.claude.overall_score}/100`);
      console.log(`Confidence: ${result.claude.confidence_level}`);
      console.log(`Recommendation: ${result.claude.recommendation.toUpperCase()}`);
      console.log(`Reasoning: ${result.claude.reasoning}`);
      console.log('');
      if (result.claude.missed_issues.length > 0) {
        console.log('Missed Issues:');
        result.claude.missed_issues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
        console.log('');
      }
      if (result.claude.incorrect_assumptions.length > 0) {
        console.log('Incorrect Assumptions:');
        result.claude.incorrect_assumptions.forEach((assumption, i) => console.log(`  ${i + 1}. ${assumption}`));
        console.log('');
      }
    }

    // Consensus
    console.log('🎯 CONSENSUS');
    console.log('─'.repeat(80));
    console.log(`Average Score: ${result.consensus.average_score.toFixed(1)}/100`);
    console.log(`Score Difference: ${result.consensus.max_score_difference || result.consensus.score_difference}`);
    console.log(`Agreement Level: ${result.consensus.agreement_level.toUpperCase()}`);
    console.log(`Unanimous Approval: ${result.consensus.unanimous_approval ? '✅ YES' : '❌ NO'}`);
    console.log(`All Scores at 100%: ${result.consensus.all_scores_above_80 || result.consensus.all_scores_at_100 ? '✅ YES' : '❌ NO'}`);
    console.log('');

    // Final Verdict
    console.log('='.repeat(80));
    console.log('⚖️  FINAL VERDICT');
    console.log('='.repeat(80));
    console.log('');
    console.log(`${result.verdict}`);
    console.log('');

    if (result.verdict === 'PROCEED_TO_EX') {
      console.log('✅ All 3 models approved at 100%. Ready for Phase EX implementation.');
    } else {
      console.log('❌ Verification failed. Return to Phase A for revisions.');
      console.log('');
      console.log('Required actions before proceeding:');
      console.log('1. Address all missed issues identified by the models');
      console.log('2. Correct any incorrect assumptions');
      console.log('3. Re-run Phase A analysis');
      console.log('4. Re-submit for Phase B verification');
    }
    console.log('');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('');
    console.error('❌ VERIFICATION FAILED');
    console.error('─'.repeat(80));
    console.error('Error:', error instanceof Error ? error.message : String(error));
    console.error('');
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as runMobileEditVerificationTest };
