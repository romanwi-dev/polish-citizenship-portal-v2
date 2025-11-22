import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getErrorMessage } from '../_shared/error-utils.ts';

const AGENT_NAME = 'dropbox_memory';

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[${AGENT_NAME}] Starting Dropbox Memory Agent cycle...`);

    // Analyze sync patterns
    const { data: syncLogs } = await supabase
      .from('hac_logs')
      .select('action_type, action_details, performed_at, case_id')
      .eq('action_type', 'dropbox_resync')
      .gte('performed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('performed_at', { ascending: false })
      .limit(100);

    // Analyze file organization patterns
    const { data: cases } = await supabase
      .from('cases')
      .select('id, case_number, dropbox_path, created_at, current_stage')
      .not('dropbox_path', 'is', null)
      .neq('dropbox_path', '')
      .order('created_at', { ascending: false })
      .limit(500);

    // Analyze document patterns
    const { data: documents } = await supabase
      .from('documents')
      .select('id, file_name, dropbox_path, category, created_at, case_id')
      .not('dropbox_path', 'is', null)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(1000);

    const insights = {
      syncPatterns: analyzeSyncPatterns(syncLogs || []),
      folderStructure: analyzeFolderStructure(cases || []),
      namingConventions: analyzeNamingConventions(documents || []),
      organizationHealth: analyzeOrganizationHealth(cases || [], documents || []),
    };

    // Update agent memory
    const memoryUpdates = [
      {
        key: 'sync_patterns',
        value: insights.syncPatterns,
      },
      {
        key: 'folder_structure',
        value: insights.folderStructure,
      },
      {
        key: 'naming_conventions',
        value: insights.namingConventions,
      },
      {
        key: 'organization_health',
        value: insights.organizationHealth,
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

    // Generate alerts for critical issues
    const alerts = [];
    if (insights.organizationHealth.orphanedCases > 10) {
      alerts.push({
        severity: 'high',
        message: `${insights.organizationHealth.orphanedCases} cases without Dropbox paths`,
        action: 'Run migration scan to fix orphaned cases',
      });
    }

    if (insights.namingConventions.inconsistencies > 20) {
      alerts.push({
        severity: 'medium',
        message: `${insights.namingConventions.inconsistencies} naming inconsistencies detected`,
        action: 'Review and standardize file naming conventions',
      });
    }

    // Log agent activity
    await supabase.from('ai_agent_activity').insert({
      agent_name: AGENT_NAME,
      activity_type: 'memory_update',
      status: 'completed',
      details: {
        insights_generated: Object.keys(insights).length,
        sync_count: insights.syncPatterns.totalSyncs || 0,
        cases_analyzed: cases?.length || 0,
        documents_analyzed: documents?.length || 0,
        alerts_generated: alerts.length,
      },
    });

    console.log(`[${AGENT_NAME}] Cycle completed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        insights,
        alerts,
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

    await supabase.from('ai_agent_activity').insert({
      agent_name: AGENT_NAME,
      activity_type: 'memory_update',
      status: 'failed',
      details: { error: getErrorMessage(error) },
    });

    return new Response(
      JSON.stringify({ success: false, error: getErrorMessage(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function analyzeSyncPatterns(logs: any[]) {
  const syncStats = {
    totalSyncs: logs.length,
    successRate: 0,
    avgInterval: 0,
    recentSyncs: [] as any[],
  };

  const successful = logs.filter(log => 
    !log.action_details?.includes('error') && !log.action_details?.includes('failed')
  );

  syncStats.successRate = logs.length > 0 
    ? Math.round((successful.length / logs.length) * 100) 
    : 100;

  // Calculate average interval between syncs
  if (logs.length > 1) {
    const intervals = [];
    for (let i = 1; i < Math.min(logs.length, 10); i++) {
      const diff = new Date(logs[i-1].performed_at).getTime() - 
                   new Date(logs[i].performed_at).getTime();
      intervals.push(diff);
    }
    syncStats.avgInterval = Math.round(
      intervals.reduce((a, b) => a + b, 0) / intervals.length / (1000 * 60)
    ); // in minutes
  }

  syncStats.recentSyncs = logs.slice(0, 5).map(log => ({
    timestamp: log.performed_at,
    details: log.action_details,
  }));

  return syncStats;
}

function analyzeFolderStructure(cases: any[]) {
  const pathPatterns: Record<string, number> = {};
  const stageDistribution: Record<string, number> = {};

  cases.forEach(c => {
    if (c.dropbox_path) {
      const pathParts = c.dropbox_path.split('/').filter(Boolean);
      const pattern = pathParts.slice(0, 2).join('/');
      pathPatterns[pattern] = (pathPatterns[pattern] || 0) + 1;
    }

    if (c.current_stage) {
      stageDistribution[c.current_stage] = (stageDistribution[c.current_stage] || 0) + 1;
    }
  });

  return {
    totalCases: cases.length,
    pathPatterns,
    stageDistribution,
    mostCommonPattern: Object.entries(pathPatterns)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'unknown',
  };
}

function analyzeNamingConventions(documents: any[]) {
  const namePatterns: Record<string, number> = {};
  const inconsistencies: string[] = [];
  const categoryStats: Record<string, number> = {};

  documents.forEach(doc => {
    if (doc.category) {
      categoryStats[doc.category] = (categoryStats[doc.category] || 0) + 1;
    }

    if (doc.file_name) {
      // Check naming pattern
      const hasDate = /\d{4}[-_]\d{2}[-_]\d{2}/.test(doc.file_name);
      const hasCategory = doc.category && doc.file_name.toLowerCase().includes(doc.category.toLowerCase());
      const pattern = `${hasDate ? 'dated' : 'undated'}_${hasCategory ? 'categorized' : 'uncategorized'}`;
      namePatterns[pattern] = (namePatterns[pattern] || 0) + 1;

      // Detect inconsistencies
      if (!hasDate && !hasCategory) {
        inconsistencies.push(doc.file_name);
      }
    }
  });

  return {
    totalDocuments: documents.length,
    namePatterns,
    categoryStats,
    inconsistencies: inconsistencies.length,
    exampleInconsistencies: inconsistencies.slice(0, 10),
  };
}

function analyzeOrganizationHealth(cases: any[], documents: any[]) {
  const orphanedCases = cases.filter(c => !c.dropbox_path || c.dropbox_path === '').length;
  const casesWithDocs = new Set(documents.map(d => d.case_id));
  const casesWithoutDocs = cases.filter(c => !casesWithDocs.has(c.id)).length;

  const health = {
    orphanedCases,
    casesWithoutDocs,
    totalCases: cases.length,
    totalDocuments: documents.length,
    avgDocsPerCase: cases.length > 0 ? Math.round(documents.length / cases.length * 10) / 10 : 0,
    healthScore: 100,
  };

  // Calculate health score
  let deductions = 0;
  if (orphanedCases > 0) deductions += Math.min(30, orphanedCases * 2);
  if (casesWithoutDocs > 5) deductions += Math.min(20, casesWithoutDocs);
  health.healthScore = Math.max(0, 100 - deductions);

  return health;
}
