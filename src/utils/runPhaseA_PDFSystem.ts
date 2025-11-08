import { supabase } from "@/integrations/supabase/client";

/**
 * PHASE A: COMPREHENSIVE PDF GENERATION SYSTEM ANALYSIS
 * A→B→EX Protocol - Deepest Analysis Mode
 * 
 * Domain: PDF Generation for ALL Forms
 * Scope: Complete system including preview, generation, editing, templates
 */

export async function runPhaseA_PDFSystem() {
  console.log('🔍 PHASE A: Starting deepest PDF system analysis...');

  const analysis = {
    agent_name: 'pdf-generation-master-agent',
    domain: 'pdf-generation-all-forms',
    proposed_changes: `
## COMPREHENSIVE PDF GENERATION SYSTEM OVERHAUL

### ALL FORMS COVERED:
1. POA Adult (poa-adult)
2. POA Minor (poa-minor) 
3. POA Spouses (poa-spouses)
4. Citizenship Application (citizenship)
5. Family Tree (family-tree)
6. Civil Registry Transcription (new-TRANSCRIPTION) - 3 pages
7. Umiejscowienie (civil registry entry)
8. Uzupełnienie (birth certificate supplementation)

### CRITICAL REQUIREMENTS:
✅ Preview MUST work for all forms
✅ Templates MUST generate successfully
✅ Editing MUST work in preview AND after download
✅ All field mappings MUST be complete
✅ No table mismatches (pdf_queue vs pdf_generation_queue)
✅ Worker scheduler MUST invoke pdf-worker
✅ Frontend/backend communication MUST be synchronized
    `,
    context: {
      current_issues: [
        'Table mismatch: pdf_queue vs pdf_generation_queue',
        'PDF preview not showing (pdf-preview function has no logs)',
        'Worker never invoked (no scheduler setup)',
        'Frontend polls wrong table',
        'new-TRANSCRIPTION template just added (3 pages)',
        'Missing field mappings for new template',
        'Incomplete data flow from master_table to PDFs'
      ],
      existing_infrastructure: {
        edge_functions: [
          'pdf-generate-v2 (synchronous)',
          'pdf-enqueue (writes to pdf_generation_queue)',
          'pdf-preview (broken - no logs)',
          'pdf-worker (never invoked)',
          'fill-pdf (low-level)'
        ],
        components: [
          'PDFGenerateButton',
          'PDFPreviewDialog', 
          'PDFGenerationButtons',
          'FormButtonsRow',
          'usePDFGeneration hook',
          'generate-pdf.ts library'
        ],
        tables: [
          'pdf_queue (old)',
          'pdf_generation_queue (new, missing metadata column)',
          'master_table (data source)',
          'documents',
          'cases'
        ],
        templates: [
          '/pdf-templates/POA-Adult.pdf',
          '/pdf-templates/POA-Minor.pdf',
          '/pdf-templates/POA-Spouses.pdf',
          '/pdf-templates/citizenship.pdf',
          '/pdf-templates/family-tree.pdf',
          '/pdf-templates/new-TRANSCRIPTION.pdf (NEW - 3 pages)',
          '/pdf-templates/umiejscowienie.pdf',
          '/pdf-templates/uzupelnienie.pdf'
        ]
      },
      forms_data_structure: {
        poa: 'poa table',
        citizenship: 'oby_forms table',
        family_tree: 'family_tree table',
        civil_registry: 'civil_registry table',
        master_data: 'master_table (central hub)'
      }
    }
  };

  // CRITICAL ISSUES IDENTIFIED
  const criticalIssues = [
    'TABLE_MISMATCH: Frontend polls pdf_queue, backend writes to pdf_generation_queue',
    'PREVIEW_BROKEN: pdf-preview has zero logs, not being called or failing silently',
    'WORKER_NEVER_RUNS: No pg_cron job or manual invocation for pdf-worker',
    'NEW_TEMPLATE_UNMAPPED: new-TRANSCRIPTION.pdf has no field mappings',
    'QUEUE_INCOMPLETE: pdf_generation_queue missing metadata column',
    'DATA_FLOW_GAPS: master_table → form tables → PDF mappings incomplete',
    'EDIT_AFTER_DOWNLOAD: No clear workflow for editing downloaded PDFs',
    'FLATTEN_INCONSISTENCY: Some calls flatten=true, others false, unclear strategy'
  ];

  // ROOT CAUSE ANALYSIS
  const rootCause = `
## ROOT CAUSE: ARCHITECTURAL FRAGMENTATION

**Problem**: PDF generation system was built incrementally without unified design.

**Evidence**:
1. Dual queue tables created but never unified
2. Worker function exists but no scheduler configured  
3. Preview function exists but not integrated into flow
4. New templates added without updating mappings
5. Frontend/backend use different table names
6. No single source of truth for field→PDF mappings

**Impact**: 
- PDFs don't generate (jobs stuck in queue)
- Previews don't work (function not called)
- New templates fail (no mappings)
- Edit workflows broken (no roundtrip)
- Developer confusion (multiple paths to same goal)
  `;

  // PROPOSED SOLUTION
  const proposedSolution = `
## SOLUTION: UNIFIED PDF GENERATION ARCHITECTURE

### PHASE 1: INFRASTRUCTURE FIX (Critical)
1. **Unify Queue Tables**
   - Drop pdf_queue (old)
   - Add metadata column to pdf_generation_queue
   - Update frontend to poll pdf_generation_queue
   
2. **Enable Worker**
   - Create pg_cron job to invoke pdf-worker every 1 minute
   - OR: Make pdf-enqueue invoke pdf-worker directly
   - OR: Revert to synchronous pdf-generate-v2 (simplest)

3. **Fix Preview**
   - Update PDFPreviewDialog to call pdf-preview correctly
   - Ensure pdf-preview returns { url, templateType, data }
   - Add error logging to pdf-preview function

### PHASE 2: TEMPLATE MAPPINGS (Critical)
4. **new-TRANSCRIPTION Field Mappings**
   - Map all fields from Civil Registry form
   - Support 3-page structure (page 1/2 identical, page 3 different)
   - Add to pdf-field-maps.ts shared module

5. **Complete All Form Mappings**
   - POA Adult: citizenship_fieldMappings
   - POA Minor: (create minor_fieldMappings)
   - POA Spouses: (create spouses_fieldMappings)
   - Family Tree: familyTreeFieldMappings  
   - Citizenship: citizenship_fieldMappings
   - Transcription: (create transcription_fieldMappings)
   - Umiejscowienie: (create umiejscowienie_fieldMappings)
   - Uzupełnienie: (create uzupelnienie_fieldMappings)

### PHASE 3: EDIT WORKFLOWS (High)
6. **Preview Editing**
   - Keep PDFPreviewDialog editable (already has field editing)
   - On save, regenerate PDF with updated data
   - Persist changes to master_table

7. **Post-Download Editing**
   - Users download PDF → edit externally
   - Re-upload to /uploads
   - OCR to extract changes
   - Update master_table
   - Mark document as "edited_version"

### PHASE 4: DATA FLOW (High)  
8. **Master Table Integration**
   - Ensure ALL forms write to master_table
   - pdf-generate-v2 reads ONLY from master_table
   - No direct table reads (poa, oby_forms, etc.)
   - Single source of truth

### PHASE 5: AGENT LEARNING (Medium)
9. **Store Proven Patterns**
   - Document successful PDF generation flows
   - Store field mapping patterns
   - Record template → data mappings
   - Enable auto-fix for common issues

### PHASE 6: TESTING (Critical)
10. **End-to-End Tests**
    - Generate PDF for each template
    - Verify preview works
    - Test field coverage
    - Validate download
    - Confirm editing flow
  `;

  // DEPENDENCIES & EDGE CASES
  const dependencies = [
    'Dropbox API (for template fetching)',
    'pdf-lib library (for field filling)',
    'Lovable AI (for field extraction)',
    'master_table schema (must include all form fields)',
    'Storage bucket (for PDF output)'
  ];

  const edgeCases = [
    'Empty fields: How to handle missing data?',
    'Multi-page templates: Loop correctly?',
    'Checkbox fields: Boolean → PDF checkbox mapping',
    'Date formats: DD.MM.YYYY validation',
    'Non-Latin characters: UTF-8 encoding in PDFs',
    'Large files: Memory limits in edge functions',
    'Concurrent generation: Lock mechanisms needed?',
    'Failed generation: Retry logic & error recovery'
  ];

  // ROLLBACK PLAN
  const rollbackPlan = `
## ROLLBACK STRATEGY

If Phase EX fails:
1. Revert to current broken state (snapshot database)
2. Keep new-TRANSCRIPTION.pdf in templates (harmless)
3. Remove new edge function code
4. Restore original table structure

Safe exit point: After each phase completes.
  `;

  // Store Phase A in database
  try {
    const { data: phaseARecord, error } = await (supabase as any)
      .from('phase_a_analyses')
      .insert({
        agent_name: analysis.agent_name,
        domain: analysis.domain,
        proposed_changes: analysis.proposed_changes,
        context: analysis.context,
        analysis_result: {
          criticalIssues,
          rootCause,
          proposedSolution,
          dependencies,
          edgeCases,
          rollbackPlan,
          timestamp: new Date().toISOString()
        },
        total_issues: criticalIssues.length,
        critical_issues: criticalIssues,
        warnings: edgeCases,
        root_cause: rootCause,
        proposed_solution: proposedSolution,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Phase A analysis stored:', phaseARecord.id);
    
    return {
      success: true,
      phase_a_id: phaseARecord.id,
      analysis: phaseARecord,
      summary: {
        domain: analysis.domain,
        totalIssues: criticalIssues.length,
        criticalIssues: criticalIssues.slice(0, 5),
        rootCause: 'Architectural fragmentation from incremental development',
        proposedSolution: 'Unified PDF generation architecture with 6 phases',
        readyForPhaseB: true
      }
    };

  } catch (error: any) {
    console.error('❌ Phase A storage failed:', error);
    return {
      success: false,
      error: error.message,
      analysis: {
        domain: analysis.domain,
        criticalIssues,
        rootCause,
        proposedSolution
      }
    };
  }
}
