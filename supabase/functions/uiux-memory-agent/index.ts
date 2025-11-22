import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getErrorMessage } from '../_shared/error-utils.ts';

const AGENT_NAME = 'uiux_memory';

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[${AGENT_NAME}] Starting UI/UX Memory Agent cycle...`);

    // Analyze user interactions and form usage patterns
    const { data: formInteractions } = await supabase
      .from('hac_logs')
      .select('action_type, action_details, performed_at, case_id')
      .in('action_type', ['form_filled', 'form_validated', 'form_error', 'ui_interaction'])
      .gte('performed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('performed_at', { ascending: false })
      .limit(500);

    // Analyze component usage patterns
    const { data: componentUsage } = await supabase
      .from('hac_logs')
      .select('action_type, action_details, performed_at')
      .like('action_type', '%_component_%')
      .gte('performed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(300);

    // Analyze error patterns in UI
    const { data: uiErrors } = await supabase
      .from('hac_logs')
      .select('action_type, action_details, performed_at')
      .or('action_type.eq.validation_error,action_type.eq.form_error,action_type.eq.ui_error')
      .gte('performed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(200);

    const insights = {
      formUsagePatterns: analyzeFormPatterns(formInteractions || []),
      componentPatterns: analyzeComponentUsage(componentUsage || []),
      errorPatterns: analyzeUIErrors(uiErrors || []),
      designRecommendations: generateDesignRecommendations(formInteractions || [], uiErrors || []),
    };

    // Update agent memory
    const memoryUpdates = [
      {
        key: 'form_usage_patterns',
        value: insights.formUsagePatterns,
      },
      {
        key: 'component_patterns',
        value: insights.componentPatterns,
      },
      {
        key: 'ui_error_patterns',
        value: insights.errorPatterns,
      },
      {
        key: 'design_recommendations',
        value: insights.designRecommendations,
      },
      {
        key: 'workflow_card_standards',
        value: {
          standard: 'Translation Workflow',
          specifications: {
            cardHeight: '520px',
            layoutProportions: '42-16-42',
            spacing: {
              headerMargin: 'mb-24',
              cardMargin: 'mb-16'
            },
            contentLayout: 'flex-col with justify-center',
            animations: 'vertical (y: 50) with -100px viewport margin',
            timelineDot: 'w-8 h-8 with shadow-[0_0_20px_rgba(59,130,246,0.3)] glow effect',
            typography: {
              title: 'text-2xl md:text-3xl centered',
              description: 'text-xs centered with px-4'
            }
          },
          standardizedWorkflows: [
            'TranslationWorkflowCards',
            'PassportWorkflowCards',
            'CivilActsWorkflowCards',
            'CitizenshipWorkflowCards',
            'ArchivesWorkflowCards',
            'ExtendedServicesWorkflowCards'
          ],
          lastStandardized: new Date().toISOString(),
          consistency: '100%'
        }
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
        form_patterns: insights.formUsagePatterns.totalInteractions || 0,
        error_count: insights.errorPatterns.totalErrors || 0,
        recommendations: insights.designRecommendations.length || 0,
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

function analyzeFormPatterns(interactions: any[]) {
  const formStats: Record<string, any> = {};
  
  interactions.forEach(log => {
    const formType = extractFormType(log.action_details);
    if (!formStats[formType]) {
      formStats[formType] = {
        uses: 0,
        errors: 0,
        avgFillTime: [],
        commonFields: {},
      };
    }
    formStats[formType].uses++;
    
    if (log.action_type === 'form_error') {
      formStats[formType].errors++;
    }
  });

  return {
    totalInteractions: interactions.length,
    byFormType: formStats,
    mostUsedForm: Object.keys(formStats).sort((a, b) => 
      formStats[b].uses - formStats[a].uses
    )[0] || 'unknown',
  };
}

function analyzeComponentUsage(usage: any[]) {
  const componentStats: Record<string, number> = {};
  
  usage.forEach(log => {
    const component = log.action_type || 'unknown';
    componentStats[component] = (componentStats[component] || 0) + 1;
  });

  return {
    totalUsages: usage.length,
    byComponent: componentStats,
    topComponents: Object.entries(componentStats)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([name, count]) => ({ name, count })),
  };
}

function analyzeUIErrors(errors: any[]) {
  const errorTypes: Record<string, any> = {};
  
  errors.forEach(log => {
    const errorType = log.action_type || 'unknown_error';
    if (!errorTypes[errorType]) {
      errorTypes[errorType] = {
        count: 0,
        examples: [],
      };
    }
    errorTypes[errorType].count++;
    if (errorTypes[errorType].examples.length < 3) {
      errorTypes[errorType].examples.push(log.action_details);
    }
  });

  return {
    totalErrors: errors.length,
    byType: errorTypes,
    criticalErrors: Object.entries(errorTypes)
      .filter(([, data]: [string, any]) => data.count > 5)
      .map(([type, data]) => ({ type, ...data })),
  };
}

function generateDesignRecommendations(interactions: any[], errors: any[]) {
  const recommendations = [];

  // High error rate recommendation
  if (errors.length > 50) {
    recommendations.push({
      priority: 'high',
      area: 'validation',
      recommendation: 'Consider improving form validation UI with clearer error messages',
      reason: `${errors.length} errors detected in the past week`,
    });
  }

  // Form complexity recommendation
  const formTypes = new Set(interactions.map(i => extractFormType(i.action_details)));
  if (formTypes.size > 5) {
    recommendations.push({
      priority: 'medium',
      area: 'forms',
      recommendation: 'Consider creating a unified form component library',
      reason: `${formTypes.size} different form types detected`,
    });
  }

  return recommendations;
}

function extractFormType(details: string): string {
  if (!details) return 'unknown';
  const match = details.match(/form[_-]?(\w+)/i);
  return match ? match[1] : 'unknown';
}
