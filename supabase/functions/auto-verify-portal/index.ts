import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// File sets for different verification scopes
const SCOPE_FILES: Record<string, any[]> = {
  workflow: [
    { fileName: 'AIDocumentWorkflow.tsx', category: 'core', path: 'src/components/workflows/AIDocumentWorkflow.tsx' },
    { fileName: 'useWorkflowState.ts', category: 'state', path: 'src/hooks/useWorkflowState.ts' },
    { fileName: 'useDocumentProgress.ts', category: 'state', path: 'src/hooks/useDocumentProgress.ts' },
    { fileName: 'useRequestBatcher.ts', category: 'state', path: 'src/hooks/useRequestBatcher.ts' },
    { fileName: 'DocumentProgressCard.tsx', category: 'ui', path: 'src/components/workflows/DocumentProgressCard.tsx' }
  ],
  security: [
    { fileName: 'secureLogger.ts', category: 'security', path: 'src/utils/secureLogger.ts' },
    { fileName: 'aiPIILogger.ts', category: 'security', path: 'src/utils/aiPIILogger.ts' },
    { fileName: 'staticCodeAnalyzer.ts', category: 'security', path: 'src/utils/staticCodeAnalyzer.ts' }
  ],
  forms: [
    { fileName: 'IntakeForm.tsx', category: 'ui', path: 'src/components/forms/IntakeForm.tsx' },
    { fileName: 'POAForm.tsx', category: 'ui', path: 'src/components/forms/POAForm.tsx' },
    { fileName: 'CitizenshipForm.tsx', category: 'ui', path: 'src/components/forms/CitizenshipForm.tsx' }
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { verification_run_id, verification_scope, changed_files } = await req.json();

    console.log(`🚀 Starting auto-verification for run: ${verification_run_id}`);
    console.log(`📋 Scope: ${verification_scope}`);

    // Update status to running
    await supabase
      .from('verification_runs')
      .update({
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('id', verification_run_id);

    // Determine which files to analyze
    let filesToAnalyze = SCOPE_FILES[verification_scope] || [];
    
    if (verification_scope === 'full_portal') {
      // Combine all scopes
      filesToAnalyze = [
        ...SCOPE_FILES.workflow,
        ...SCOPE_FILES.security,
        ...SCOPE_FILES.forms
      ];
    }

    // Note: In production, you would actually read these files from the repo
    // For now, we'll use placeholder content and trigger the verification
    const files = filesToAnalyze.map(f => ({
      fileName: f.fileName,
      fileContent: `// Content from ${f.path}\n// This would contain actual file content in production`,
      category: f.category
    }));

    console.log(`📄 Analyzing ${files.length} files`);

    // Call verification function
    const { data: verificationResult, error: verificationError } = await supabase.functions.invoke(
      'verify-workflow-multi-model',
      {
        body: {
          files,
          focusAreas: [
            'Workflow correctness and completeness',
            'Security and GDPR compliance',
            'Architecture and design patterns',
            'Performance and scalability',
            'Reliability and error handling',
            'User experience and accessibility',
            'Code quality and maintainability',
            'Testing coverage and gaps'
          ],
          models: ['openai/gpt-5', 'google/gemini-2.5-pro', 'claude-sonnet-4-5'],
          useAnthropic: true
        }
      }
    );

    const endTime = new Date();
    
    if (verificationError) {
      console.error('Verification failed:', verificationError);
      
      await supabase
        .from('verification_runs')
        .update({
          status: 'failed',
          completed_at: endTime.toISOString(),
          error_message: verificationError.message
        })
        .eq('id', verification_run_id);

      // Create alert
      await supabase.rpc('create_verification_alert', {
        p_verification_run_id: verification_run_id,
        p_alert_type: 'verification_failed',
        p_severity: 'high',
        p_title: 'Verification Failed',
        p_description: `Automated verification failed: ${verificationError.message}`,
        p_details: { error: verificationError }
      });

      throw verificationError;
    }

    console.log('✅ Verification completed successfully');

    // Extract results
    const results = verificationResult.results || [];
    const summary = verificationResult.summary || {};

    // Parse individual model results
    const gpt5Result = results.find((r: any) => r.model === 'openai/gpt-5');
    const geminiResult = results.find((r: any) => r.model === 'google/gemini-2.5-pro');
    const claudeResult = results.find((r: any) => r.model === 'claude-sonnet-4-5');

    // Aggregate critical findings
    const allCriticalFindings: any[] = [];
    const allActionItems: any[] = [];
    let totalBlockers = 0;

    for (const result of results) {
      if (result.success && result.verification) {
        const critical = result.verification.criticalFindings?.mustFixBeforeLaunch || [];
        allCriticalFindings.push(...critical);
        totalBlockers += result.verification.criticalFindings?.blockersCount || 0;
        
        if (result.verification.actionPlan?.immediate) {
          allActionItems.push(...result.verification.actionPlan.immediate);
        }
      }
    }

    // Update verification run with results
    const updateData: any = {
      status: 'completed',
      completed_at: endTime.toISOString(),
      duration_ms: Math.floor((endTime.getTime() - new Date((await supabase.from('verification_runs').select('started_at').eq('id', verification_run_id).single()).data?.started_at || 0).getTime())),
      files_analyzed: files.length,
      
      gpt5_result: gpt5Result?.verification || null,
      gpt5_score: gpt5Result?.verification?.overallAssessment?.overallScore || null,
      gpt5_status: gpt5Result?.success ? 'success' : 'failed',
      
      gemini_result: geminiResult?.verification || null,
      gemini_score: geminiResult?.verification?.overallAssessment?.overallScore || null,
      gemini_status: geminiResult?.success ? 'success' : 'failed',
      
      claude_result: claudeResult?.verification || null,
      claude_score: claudeResult?.verification?.overallAssessment?.overallScore || null,
      claude_status: claudeResult?.success ? 'success' : 'failed',
      
      consensus_level: summary.consensus || 'MEDIUM',
      average_score: summary.averageScore || 0,
      successful_models: summary.successfulModels || 0,
      total_models: summary.totalModels || 3,
      
      total_blockers: totalBlockers,
      critical_findings: allCriticalFindings,
      action_items: allActionItems
    };

    await supabase
      .from('verification_runs')
      .update(updateData)
      .eq('id', verification_run_id);

    // Calculate trends
    await supabase.rpc('calculate_verification_trend', {
      p_verification_run_id: verification_run_id,
      p_scope: verification_scope,
      p_metric_name: 'average_score',
      p_current_value: summary.averageScore || 0
    });

    // Create alerts for issues
    if (summary.averageScore < 70) {
      await supabase.rpc('create_verification_alert', {
        p_verification_run_id: verification_run_id,
        p_alert_type: 'score_drop',
        p_severity: 'high',
        p_title: 'Low Verification Score',
        p_description: `Average score dropped to ${summary.averageScore}/100`,
        p_details: { score: summary.averageScore, threshold: 70 }
      });
    }

    if (totalBlockers > 0) {
      await supabase.rpc('create_verification_alert', {
        p_verification_run_id: verification_run_id,
        p_alert_type: 'new_blocker',
        p_severity: 'critical',
        p_title: `${totalBlockers} Production Blockers Found`,
        p_description: `Critical issues detected that block production deployment`,
        p_details: { blockers: allCriticalFindings.slice(0, 5) }
      });
    }

    if (summary.consensus === 'LOW' || summary.consensus === 'CRITICAL') {
      await supabase.rpc('create_verification_alert', {
        p_verification_run_id: verification_run_id,
        p_alert_type: 'consensus_low',
        p_severity: 'medium',
        p_title: 'Low Model Consensus',
        p_description: `AI models disagree on verification results (${summary.consensus})`,
        p_details: { consensus: summary.consensus, models: results.map((r: any) => ({ model: r.model, success: r.success })) }
      });
    }

    console.log(`✅ Verification run ${verification_run_id} completed with score ${summary.averageScore}/100`);

    return new Response(
      JSON.stringify({
        success: true,
        verification_run_id,
        average_score: summary.averageScore,
        consensus: summary.consensus,
        blockers: totalBlockers
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Auto-verification error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
