/**
 * ZERO-FAIL PROTOCOL: Comprehensive Workflow Diagnostics
 * Identifies and reports all failure points in the Documents Workflow
 */

import { supabase } from "@/integrations/supabase/client";

export interface DiagnosticResult {
  category: 'critical' | 'warning' | 'info';
  component: string;
  issue: string;
  fix: string;
  status: 'pass' | 'fail' | 'degraded';
}

export async function runWorkflowDiagnostics(caseId: string): Promise<{
  overallStatus: 'healthy' | 'degraded' | 'critical';
  results: DiagnosticResult[];
  summary: string;
}> {
  const results: DiagnosticResult[] = [];

  // 1. Check document statuses
  const { data: docs, error: docsError } = await supabase
    .from('documents')
    .select('id, name, ocr_status, ai_detected_type, dropbox_path')
    .eq('case_id', caseId);

  if (docsError) {
    results.push({
      category: 'critical',
      component: 'Database Query',
      issue: `Failed to fetch documents: ${docsError.message}`,
      fix: 'Check database connection and RLS policies',
      status: 'fail'
    });
  } else if (docs) {
    const failedOCR = docs.filter(d => d.ocr_status === 'failed');
    const pendingOCR = docs.filter(d => !d.ocr_status || d.ocr_status === 'pending');
    const unclassified = docs.filter(d => !d.ai_detected_type);
    const missingPath = docs.filter(d => !d.dropbox_path);

    if (failedOCR.length > 0) {
      results.push({
        category: 'critical',
        component: 'OCR Processing',
        issue: `${failedOCR.length} documents failed OCR: ${failedOCR.map(d => d.name).join(', ')}`,
        fix: 'Queue documents for retry: UPDATE documents SET ocr_status = \'queued\', ocr_retry_count = 0',
        status: 'fail'
      });
    }

    if (pendingOCR.length > 0) {
      results.push({
        category: 'warning',
        component: 'OCR Processing',
        issue: `${pendingOCR.length} documents pending OCR processing`,
        fix: 'Start workflow to queue documents for OCR',
        status: 'degraded'
      });
    }

    if (unclassified.length > 0) {
      results.push({
        category: 'warning',
        component: 'AI Classification',
        issue: `${unclassified.length} documents not yet classified`,
        fix: 'Run AI classification step in workflow',
        status: 'degraded'
      });
    }

    if (missingPath.length > 0) {
      results.push({
        category: 'critical',
        component: 'Dropbox Integration',
        issue: `${missingPath.length} documents missing dropbox_path`,
        fix: 'Re-sync with Dropbox or manually set paths',
        status: 'fail'
      });
    }
  }

  // 2. Check workflow run status
  const { data: workflowRuns } = await supabase
    .from('workflow_runs')
    .select('id, status, last_error, workflow_type')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (workflowRuns) {
    const failed = workflowRuns.filter(w => w.status === 'failed');
    if (failed.length > 0) {
      results.push({
        category: 'critical',
        component: 'Workflow Execution',
        issue: `${failed.length} workflow runs failed. Latest error: ${failed[0].last_error || 'Unknown'}`,
        fix: 'Check workflow logs and retry with fixed issues',
        status: 'fail'
      });
    }
  }

  // 3. Check edge function availability
  const edgeFunctionTests = [
    { name: 'download-and-encode', endpoint: 'download-and-encode' },
    { name: 'ai-classify-document', endpoint: 'ai-classify-document' },
    { name: 'ocr-worker', endpoint: 'ocr-worker' },
    { name: 'apply-ocr-to-forms', endpoint: 'apply-ocr-to-forms' }
  ];

  for (const func of edgeFunctionTests) {
    try {
      // Quick health check (will fail gracefully if function has issues)
      const { error } = await supabase.functions.invoke(func.endpoint, {
        body: { healthCheck: true }
      });
      
      if (error) {
        results.push({
          category: 'warning',
          component: `Edge Function: ${func.name}`,
          issue: `Function exists but returned error: ${error.message}`,
          fix: 'Check edge function logs and configuration',
          status: 'degraded'
        });
      } else {
        results.push({
          category: 'info',
          component: `Edge Function: ${func.name}`,
          issue: 'Function is operational',
          fix: 'No action needed',
          status: 'pass'
        });
      }
    } catch (e) {
      results.push({
        category: 'critical',
        component: `Edge Function: ${func.name}`,
        issue: `Function not accessible or misconfigured`,
        fix: 'Deploy edge function and check secrets',
        status: 'fail'
      });
    }
  }

  // 4. Determine overall status
  const criticalIssues = results.filter(r => r.category === 'critical' && r.status === 'fail');
  const warnings = results.filter(r => r.category === 'warning');

  let overallStatus: 'healthy' | 'degraded' | 'critical';
  if (criticalIssues.length > 0) {
    overallStatus = 'critical';
  } else if (warnings.length > 0) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'healthy';
  }

  const summary = `Workflow Status: ${overallStatus.toUpperCase()} - ${criticalIssues.length} critical issues, ${warnings.length} warnings, ${results.filter(r => r.status === 'pass').length} components healthy`;

  return {
    overallStatus,
    results,
    summary
  };
}

/**
 * Auto-fix common workflow issues
 */
export async function autoFixWorkflowIssues(caseId: string): Promise<{
  applied: string[];
  failed: string[];
}> {
  const applied: string[] = [];
  const failed: string[] = [];

  try {
    // Fix 1: Re-queue failed OCR documents
    const { data: requeued, error: requeueError } = await supabase
      .from('documents')
      .update({ 
        ocr_status: 'queued',
        ocr_retry_count: 0 
      })
      .eq('case_id', caseId)
      .in('ocr_status', ['failed', 'error'])
      .select('id');

    if (requeueError) {
      failed.push(`Failed to requeue OCR documents: ${requeueError.message}`);
    } else if (requeued && requeued.length > 0) {
      applied.push(`Re-queued ${requeued.length} failed OCR documents`);
    }

    // Fix 2: Reset stuck workflow runs
    const { data: resetRuns, error: resetError } = await supabase
      .from('workflow_runs')
      .update({ status: 'paused' })
      .eq('case_id', caseId)
      .eq('status', 'running')
      .lt('updated_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Older than 30 minutes
      .select('id');

    if (resetError) {
      failed.push(`Failed to reset stuck workflows: ${resetError.message}`);
    } else if (resetRuns && resetRuns.length > 0) {
      applied.push(`Reset ${resetRuns.length} stuck workflow runs to paused`);
    }

  } catch (e) {
    failed.push(`Auto-fix error: ${e instanceof Error ? e.message : 'Unknown'}`);
  }

  return { applied, failed };
}
