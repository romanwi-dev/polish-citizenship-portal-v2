import { runTripleVerification } from "./utils/tripleVerification";

const phaseAAnalysis = `
# PHASE A: DEEP ANALYSIS - Forms Field Mapping & Data Population

## DOMAIN: Multi-Form Polish Citizenship Application System
- 6 interconnected forms: IntakeForm, POAForm, CitizenshipForm, FamilyTreeForm, CivilRegistryForm, MasterDataTable
- Data flow: Client Input → master_table (DB) → Edge Function → PDF Generation
- Critical business process: POA generation for legal authorization

## FINDINGS:

### 1. **Architecture Duplication - FIELD MAPPINGS** (SEVERITY: MEDIUM)
**Issue**: Three separate PDF mapping systems exist
- Location 1: \`src/utils/pdfMappings/fieldMappings.ts\` (centralized)
- Location 2: \`src/utils/pdfMappings/poaAdult.ts\` (POA-specific)
- Location 3: Edge function inline mappings in \`supabase/functions/fill-pdf/index.ts\`

**Evidence**: Code review shows duplicate field definitions across files
**Risk**: Updates must be made in 3 places → mapping drift → data loss
**Impact**: Medium (causes maintenance burden, potential inconsistencies)

### 2. **Field Naming Confusion - CHILDREN COUNT** (SEVERITY: HIGH)
**Issue**: Multiple conflicting fields for same data
- \`applicant_has_minor_children\` (boolean)
- \`applicant_number_of_children\` (integer)
- \`minor_children_count\` (integer, newly added)

**Evidence**: 
- Database query showed NULL values for \`applicant_has_minor_children\` despite \`minor_children_count\` being set
- User reported "2 POA(s) failed" error
- POA PDF expects \`applicant_has_minor_children\` field

**Root Cause**: Database migration added \`minor_children_count\` but POA logic still reads old field name
**Impact**: HIGH - Direct blocker for POA generation

### 3. **Data Flow Breaks - INTAKE → MASTER_TABLE → POA** (SEVERITY: HIGH)
**Issue**: Inconsistent field names across pipeline stages
**Pipeline Trace**:
1. IntakeForm collects: \`minor_children_count\`
2. master_table stores: \`minor_children_count\`
3. POA Form expects: \`applicant_has_minor_children\`
4. Edge function maps: \`applicant_has_minor_children\` → PDF field

**Evidence**: NULL sync confirmed in database for case 78ea6fd5-c0cd-4f15-96b1-49c6d9c4cddc
**Impact**: HIGH - POA generation fails silently

### 4. **Sanitizer Exclusion Bug** (SEVERITY: MEDIUM)
**Issue**: \`masterDataSanitizer.ts\` may exclude newly-added columns
**Location**: \`src/utils/masterDataSanitizer.ts\`
**Risk**: After DB migration adds \`minor_children_count\`, sanitizer might not include it in allowed fields
**Impact**: Data loss after form save if sanitizer strips new fields

### 5. **Edge Function Contract Mismatch** (SEVERITY: CRITICAL)
**Issue**: Frontend expects different field than edge function returns
**Evidence**:
- Frontend POA preview logic expects: \`response.data.pdfUrl\`
- Edge function \`fill-pdf\` returns: \`{ url: signedUrl }\`
- Result: Preview dialog never opens

**Root Cause**: Contract mismatch between frontend and backend
**Impact**: CRITICAL - User cannot preview POA after generation

### 6. **Undocumented \`childNum\` Behavior** (SEVERITY: LOW)
**Issue**: \`useFormManager.ts\` has auto-sync logic for \`childNum\` → child count fields
**Evidence**: Lines 156-171 in \`useFormManager.ts\` show special handling
**Documentation**: Zero comments explaining this critical business logic
**Impact**: LOW - Works but creates maintenance risk

## PROPOSED SOLUTIONS (from earlier fix attempt):

1. ✅ **Auto-Sync Logic**: Implemented in \`useFormManager\` hook to sync \`minor_children_count\` → \`applicant_has_minor_children\`
2. ✅ **Frontend Contract Fix**: Changed POA preview from \`pdfUrl\` to \`url\`
3. ✅ **Database Update**: Set proper values for test case in master_table
4. ❌ **Sanitizer Review**: NOT DONE - need to verify new columns aren't excluded
5. ❌ **Mapping Consolidation**: NOT DONE - still have 3 separate mapping files
6. ❌ **Dead Code Removal**: NOT DONE - \`fieldMappings.ts\` usage unclear

## GAPS IN ANALYSIS:

1. **No Database Schema Audit**: Did not verify ALL form fields exist in master_table columns
2. **No Edge Function Output Test**: Did not confirm \`fill-pdf\` actually returns \`url\` field
3. **No Sanitizer Verification**: Did not check if sanitizer blocks new columns
4. **No Full Pipeline Test**: Did not trace complete data flow from intake → PDF for ALL fields

## CONFIDENCE ASSESSMENT:

**Overall Confidence**: 68%

**Breakdown**:
- Field naming issue: 95% confident (verified in DB + code)
- Edge function contract: 90% confident (verified in code)
- Sanitizer bug: 60% confident (theoretical, not tested)
- Mapping duplication: 80% confident (code review only)
- Auto-sync fix: 70% confident (implemented but not tested end-to-end)

## BLOCKERS FOR PHASE EX:

✅ **READY**: Database columns exist for children count
✅ **READY**: Auto-sync logic implemented
⚠️ **NEEDS VERIFICATION**: Edge function returns \`url\` field (not tested)
⚠️ **NEEDS VERIFICATION**: Sanitizer doesn't exclude new columns
❌ **NOT READY**: Complete field mapping audit across all 6 forms
`;

const context = `
**PROJECT CONTEXT**:
- Polish citizenship application system with 6 interconnected forms
- POA generation uses Supabase edge function 'fill-pdf' which fills PDF templates
- Data flows: Client forms → master_table (PostgreSQL) → edge function → PDF generation
- User reported critical issue: "2 POA(s) failed" and "no preview dialog opens"
- Database: PostgreSQL via Supabase with RLS policies
- Frontend: React + TypeScript + React Hook Form
- PDF generation: pdf-lib library in edge function

**TECH STACK**:
- Frontend: React 18, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Supabase (PostgreSQL + Edge Functions)
- Forms: react-hook-form + zod validation
- PDF: pdf-lib (server-side generation)

**BUSINESS CRITICAL**:
- POA (Power of Attorney) must work for legal compliance
- Data accuracy is paramount for citizenship applications
- Field mapping errors can cause case rejections
`;

async function main() {
  console.log('🔬 Running Phase B Triple-Model Verification...\n');
  
  try {
    const result = await runTripleVerification(phaseAAnalysis, context);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 PHASE B VERIFICATION RESULTS');
    console.log('='.repeat(80) + '\n');
    
    console.log(`⚖️  VERDICT: ${result.verdict}`);
    console.log(`📈 AVERAGE SCORE: ${result.consensus.average_score}/100`);
    console.log(`🤝 AGREEMENT LEVEL: ${result.consensus.agreement_level}`);
    console.log(`✅ UNANIMOUS APPROVAL: ${result.consensus.unanimous_approval ? 'YES' : 'NO'}`);
    console.log(`🎯 ALL SCORES > 80: ${result.consensus.all_scores_above_80 ? 'YES' : 'NO'}\n`);
    
    console.log('━'.repeat(80));
    console.log('🤖 GPT-5 VERIFICATION');
    console.log('━'.repeat(80));
    console.log(`Score: ${result.gpt5.overall_score}/100`);
    console.log(`Recommendation: ${result.gpt5.recommendation.toUpperCase()}`);
    console.log(`Confidence: ${result.gpt5.confidence_level.toUpperCase()}`);
    console.log(`\nReasoning:\n${result.gpt5.reasoning}\n`);
    
    if (result.gpt5.missed_issues.length > 0) {
      console.log('⚠️  Missed Issues:');
      result.gpt5.missed_issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
      console.log('');
    }
    
    if (result.gpt5.incorrect_assumptions.length > 0) {
      console.log('❌ Incorrect Assumptions:');
      result.gpt5.incorrect_assumptions.forEach((assumption, i) => {
        console.log(`  ${i + 1}. ${assumption}`);
      });
      console.log('');
    }
    
    console.log('━'.repeat(80));
    console.log('🔮 GEMINI 2.5 PRO VERIFICATION');
    console.log('━'.repeat(80));
    console.log(`Score: ${result.gemini.overall_score}/100`);
    console.log(`Recommendation: ${result.gemini.recommendation.toUpperCase()}`);
    console.log(`Confidence: ${result.gemini.confidence_level.toUpperCase()}`);
    console.log(`\nReasoning:\n${result.gemini.reasoning}\n`);
    
    if (result.gemini.missed_issues.length > 0) {
      console.log('⚠️  Missed Issues:');
      result.gemini.missed_issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
      console.log('');
    }
    
    if (result.gemini.incorrect_assumptions.length > 0) {
      console.log('❌ Incorrect Assumptions:');
      result.gemini.incorrect_assumptions.forEach((assumption, i) => {
        console.log(`  ${i + 1}. ${assumption}`);
      });
      console.log('');
    }
    
    console.log('='.repeat(80));
    console.log('🎯 FINAL VERDICT');
    console.log('='.repeat(80));
    
    if (result.verdict === 'PROCEED_TO_EX') {
      console.log('✅ APPROVED: Proceed to Phase EX (Implementation)');
      console.log('   All models scored above 80% and recommend approval.');
    } else {
      console.log('⚠️  REVISIONS REQUIRED: Return to Phase A');
      console.log('   Models identified critical gaps requiring deeper analysis.');
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as runVerificationTest };
