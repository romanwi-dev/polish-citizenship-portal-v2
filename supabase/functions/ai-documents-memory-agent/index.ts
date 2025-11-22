import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getErrorMessage } from '../_shared/error-utils.ts';

const AGENT_NAME = 'ai_documents_memory';

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[${AGENT_NAME}] Starting AI Documents Memory Agent cycle...`);

    // Analyze document classification patterns
    const { data: documents } = await supabase
      .from('documents')
      .select('id, category, file_extension, ocr_status, ocr_confidence, created_at, case_id')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(1000);

    // Analyze OCR performance
    const { data: ocrLogs } = await supabase
      .from('hac_logs')
      .select('action_type, action_details, performed_at, case_id')
      .like('action_type', '%ocr%')
      .gte('performed_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .limit(500);

    // Analyze translation workflows
    const { data: translations } = await supabase
      .from('translation_requests')
      .select('id, source_language, target_language, status, created_at, completed_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(300);

    // Analyze workflow instances
    const { data: workflows } = await supabase
      .from('workflow_instances')
      .select('workflow_type, current_stage, status, started_at, completed_at')
      .eq('workflow_type', 'ai_documents')
      .gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(500);

    const insights = {
      classificationPatterns: analyzeClassification(documents || []),
      ocrPerformance: analyzeOCRPerformance(documents || [], ocrLogs || []),
      translationMetrics: analyzeTranslations(translations || []),
      workflowEfficiency: analyzeWorkflows(workflows || []),
      documentCategories: analyzeCategories(documents || []),
    };

    // Update agent memory
    const memoryUpdates = [
      {
        key: 'classification_patterns',
        value: insights.classificationPatterns,
      },
      {
        key: 'ocr_performance',
        value: insights.ocrPerformance,
      },
      {
        key: 'translation_metrics',
        value: insights.translationMetrics,
      },
      {
        key: 'workflow_efficiency',
        value: insights.workflowEfficiency,
      },
      {
        key: 'document_categories',
        value: insights.documentCategories,
      },
    ];

    for (const update of memoryUpdates) {
      await supabase
        .from('agent_memory')
        .upsert({
          agent_type: AGENT_NAME,
          memory_key: update.key,
          memory_value: update.value,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'agent_type,memory_key' });
    }

    // Log agent activity
    await supabase.from('ai_agent_activity').insert({
      agent_name: AGENT_NAME,
      activity_type: 'memory_update',
      status: 'completed',
      details: {
        insights_generated: Object.keys(insights).length,
        documents_analyzed: documents?.length || 0,
        ocr_logs: ocrLogs?.length || 0,
        translations: translations?.length || 0,
        workflows: workflows?.length || 0,
      },
    });

    console.log(`[${AGENT_NAME}] Cycle completed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        insights,
        timestamp: new Date().toISOString(),
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${AGENT_NAME}] Error:`, error);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const errorMsg = getErrorMessage(error);
    await supabase.from('ai_agent_activity').insert({
      agent_name: AGENT_NAME,
      activity_type: 'memory_update',
      status: 'failed',
      details: { error: errorMsg },
    });

    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function analyzeClassification(documents: any[]) {
  const analysis = {
    totalDocuments: documents.length,
    byCategory: {} as Record<string, number>,
    byExtension: {} as Record<string, number>,
    categorizedVsUncategorized: {
      categorized: 0,
      uncategorized: 0,
    },
    avgConfidence: 0,
  };

  let totalConfidence = 0;
  let confidenceCount = 0;

  documents.forEach(doc => {
    if (doc.category) {
      analysis.byCategory[doc.category] = (analysis.byCategory[doc.category] || 0) + 1;
      analysis.categorizedVsUncategorized.categorized++;
    } else {
      analysis.categorizedVsUncategorized.uncategorized++;
    }

    if (doc.file_extension) {
      analysis.byExtension[doc.file_extension] = (analysis.byExtension[doc.file_extension] || 0) + 1;
    }

    if (doc.ocr_confidence) {
      totalConfidence += doc.ocr_confidence;
      confidenceCount++;
    }
  });

  if (confidenceCount > 0) {
    analysis.avgConfidence = Math.round(totalConfidence / confidenceCount);
  }

  return analysis;
}

function analyzeOCRPerformance(documents: any[], logs: any[]) {
  const performance = {
    totalProcessed: 0,
    byStatus: {
      completed: 0,
      pending: 0,
      failed: 0,
      queued: 0,
    },
    successRate: 0,
    avgConfidence: 0,
    recentFailures: [] as any[],
  };

  documents.forEach(doc => {
    if (doc.ocr_status) {
      performance.totalProcessed++;
      const status = doc.ocr_status as keyof typeof performance.byStatus;
      if (status in performance.byStatus) {
        performance.byStatus[status]++;
      }
    }
  });

  if (performance.totalProcessed > 0) {
    performance.successRate = Math.round(
      (performance.byStatus.completed / performance.totalProcessed) * 100
    );
  }

  // Extract failures from logs
  const failures = logs.filter(log => 
    log.action_type.includes('error') || log.action_type.includes('failed')
  );

  performance.recentFailures = failures.slice(0, 10).map(log => ({
    type: log.action_type,
    details: log.action_details,
    timestamp: log.performed_at,
  }));

  return performance;
}

function analyzeTranslations(translations: any[]) {
  const metrics = {
    totalTranslations: translations.length,
    byLanguagePair: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    avgCompletionTime: 0,
    completionRate: 0,
  };

  let totalCompletionTime = 0;
  let completedCount = 0;

  translations.forEach(trans => {
    const pair = `${trans.source_language}-${trans.target_language}`;
    metrics.byLanguagePair[pair] = (metrics.byLanguagePair[pair] || 0) + 1;

    if (trans.status) {
      metrics.byStatus[trans.status] = (metrics.byStatus[trans.status] || 0) + 1;
    }

    if (trans.status === 'completed' && trans.created_at && trans.completed_at) {
      const duration = new Date(trans.completed_at).getTime() - new Date(trans.created_at).getTime();
      totalCompletionTime += duration;
      completedCount++;
    }
  });

  if (completedCount > 0) {
    metrics.avgCompletionTime = Math.round(totalCompletionTime / completedCount / (1000 * 60 * 60)); // hours
    metrics.completionRate = Math.round((completedCount / translations.length) * 100);
  }

  return metrics;
}

function analyzeWorkflows(workflows: any[]) {
  const efficiency = {
    totalWorkflows: workflows.length,
    byStage: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    avgDuration: 0,
    completionRate: 0,
  };

  let totalDuration = 0;
  let completedCount = 0;

  workflows.forEach(workflow => {
    if (workflow.current_stage) {
      efficiency.byStage[workflow.current_stage] = (efficiency.byStage[workflow.current_stage] || 0) + 1;
    }

    if (workflow.status) {
      efficiency.byStatus[workflow.status] = (efficiency.byStatus[workflow.status] || 0) + 1;
    }

    if (workflow.status === 'completed' && workflow.started_at && workflow.completed_at) {
      const duration = new Date(workflow.completed_at).getTime() - new Date(workflow.started_at).getTime();
      totalDuration += duration;
      completedCount++;
    }
  });

  if (completedCount > 0) {
    efficiency.avgDuration = Math.round(totalDuration / completedCount / (1000 * 60 * 60)); // hours
    efficiency.completionRate = Math.round((completedCount / workflows.length) * 100);
  }

  return efficiency;
}

function analyzeCategories(documents: any[]) {
  const categories = {
    topCategories: [] as any[],
    categoryStats: {} as Record<string, any>,
    uncategorizedCount: 0,
  };

  const categoryMap = new Map<string, any>();

  documents.forEach(doc => {
    if (doc.category) {
      if (!categoryMap.has(doc.category)) {
        categoryMap.set(doc.category, {
          count: 0,
          avgConfidence: 0,
          totalConfidence: 0,
          ocrSuccess: 0,
          ocrTotal: 0,
        });
      }

      const stats = categoryMap.get(doc.category);
      stats.count++;

      if (doc.ocr_confidence) {
        stats.totalConfidence += doc.ocr_confidence;
      }

      if (doc.ocr_status) {
        stats.ocrTotal++;
        if (doc.ocr_status === 'completed') {
          stats.ocrSuccess++;
        }
      }
    } else {
      categories.uncategorizedCount++;
    }
  });

  // Calculate averages and build top categories
  categoryMap.forEach((stats, category) => {
    if (stats.ocrTotal > 0) {
      stats.avgConfidence = Math.round(stats.totalConfidence / stats.ocrTotal);
      stats.ocrSuccessRate = Math.round((stats.ocrSuccess / stats.ocrTotal) * 100);
    }
    categories.categoryStats[category] = stats;
  });

  categories.topCategories = Object.entries(categories.categoryStats)
    .sort(([, a], [, b]) => (b as any).count - (a as any).count)
    .slice(0, 10)
    .map(([category, stats]) => ({ category, ...stats }));

  return categories;
}
