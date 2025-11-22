/**
 * Edge Function Monitoring Agent
 * PRIORITY 1: Intelligent monitoring, crash analysis, and auto-healing
 * 
 * Capabilities:
 * - Real-time crash detection and pattern analysis
 * - Intelligent auto-healing with context-aware fixes
 * - Predictive monitoring (detect degradation before crashes)
 * - Agent memory for learning and optimization
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';

interface FunctionHealthMetrics {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  error_rate: number;
  avg_response_time: number;
  success_rate: number;
  total_calls: number;
  errors: number;
  last_error?: string;
}

interface CrashPattern {
  function_name: string;
  crash_count_24h: number;
  crash_pattern: string;
  root_cause: string;
  recommended_action: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AgentMemory {
  agent_type: string;
  memory_key: string;
  memory_value: any;
  expires_at?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(req.headers.get('origin')) });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('[edge-function-agent] Starting intelligent monitoring cycle...');

  try {
    const startTime = Date.now();

    // STEP 1: Get current health status from health-monitor
    const { data: healthData, error: healthError } = await supabase
      .from('edge_function_health')
      .select('*')
      .order('check_timestamp', { ascending: false })
      .limit(1)
      .single();

    if (healthError && healthError.code !== 'PGRST116') {
      console.error('[edge-function-agent] Failed to fetch health data:', healthError);
      throw healthError;
    }

    // STEP 2: Get crash states from last 24 hours
    const { data: crashStates, error: crashError } = await supabase
      .from('crash_states')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (crashError) {
      console.error('[edge-function-agent] Failed to fetch crash states:', crashError);
    }

    // STEP 3: Load agent memory for baselines and patterns
    const { data: memoryData, error: memoryError } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('agent_type', 'edge_function_monitor');

    if (memoryError) {
      console.error('[edge-function-agent] Failed to load agent memory:', memoryError);
    }

    const memory = (memoryData || []).reduce((acc, item) => {
      acc[item.memory_key] = item.memory_value;
      return acc;
    }, {} as Record<string, any>);

    // STEP 4: Analyze crash patterns
    const crashPatterns = analyzeCrashPatterns(crashStates || [], healthData?.functions || []);
    
    // STEP 5: Detect anomalies and degradation
    const anomalies = detectAnomalies(healthData?.functions || [], memory.function_baselines || {});

    // STEP 6: Update agent memory with new patterns
    await updateAgentMemory(supabase, crashPatterns, anomalies, healthData?.functions || []);

    // STEP 7: Trigger auto-healing for critical issues
    const healingActions = await triggerAutoHealing(supabase, crashPatterns, anomalies);

    // STEP 8: Create approvals for risky operations
    await createHealingApprovals(supabase, crashPatterns.filter(p => p.severity === 'critical'));

    // STEP 9: Log agent activity
    const duration = Date.now() - startTime;
    await logAgentActivity(supabase, {
      agent_type: 'edge_function_monitor',
      action: 'health_monitoring_cycle',
      success: true,
      response_time_ms: duration,
      metadata: {
        crash_patterns_detected: crashPatterns.length,
        anomalies_detected: anomalies.length,
        healing_actions_triggered: healingActions.length,
        health_score: healthData?.system_health || 'unknown'
      }
    });

    console.log(`[edge-function-agent] Monitoring cycle complete in ${duration}ms`);
    console.log(`  - Crash patterns: ${crashPatterns.length}`);
    console.log(`  - Anomalies: ${anomalies.length}`);
    console.log(`  - Healing actions: ${healingActions.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        duration_ms: duration,
        analysis: {
          crash_patterns: crashPatterns,
          anomalies: anomalies,
          healing_actions: healingActions
        },
        system_health: healthData?.system_health || 'unknown',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[edge-function-agent] Fatal error:', error);
    
    // Log failed activity
    await logAgentActivity(supabase, {
      agent_type: 'edge_function_monitor',
      action: 'health_monitoring_cycle',
      success: false,
      error_message: error instanceof Error ? error.message : String(error),
      metadata: { error_type: 'fatal_error' }
    });

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }),
      {
        status: 500,
        headers: { ...corsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' }
      }
    );
  }
});

// ANALYSIS FUNCTIONS

function analyzeCrashPatterns(crashStates: any[], functions: FunctionHealthMetrics[]): CrashPattern[] {
  const patterns: CrashPattern[] = [];
  
  // Group crashes by session
  const crashesBySession = crashStates.reduce((acc, crash) => {
    const sessionId = crash.session_id;
    if (!acc[sessionId]) acc[sessionId] = [];
    acc[sessionId].push(crash);
    return acc;
  }, {} as Record<string, any[]>);

  // Analyze each session's crash pattern
  for (const [sessionId, crashes] of Object.entries(crashesBySession)) {
    const crashesArray = crashes as any[];
    if (crashesArray.length >= 3) {
      const firstCrash = crashesArray[crashesArray.length - 1];
      const lastCrash = crashesArray[0];
      const timeSpan = new Date(lastCrash.created_at).getTime() - new Date(firstCrash.created_at).getTime();
      const crashRate = crashesArray.length / (timeSpan / (60 * 1000)); // crashes per minute

      let pattern = 'unknown';
      let rootCause = 'unknown';
      let recommendedAction = 'manual_investigation_required';
      let severity = 'medium';

      // Boot-loop pattern
      if (crashRate > 0.5) {
        pattern = 'rapid_boot_shutdown_cycle';
        rootCause = 'possible_memory_leak_or_infinite_loop';
        recommendedAction = 'review_initialization_code_add_memory_guards';
        severity = 'critical';
      }
      // Intermittent crashes
      else if (crashesArray.length >= 5 && crashRate < 0.1) {
        pattern = 'intermittent_crashes';
        rootCause = 'race_condition_or_external_dependency_failure';
        recommendedAction = 'add_retry_logic_and_error_boundaries';
        severity = 'high';
      }
      // Progressive degradation
      else if (crashesArray.length >= 3) {
        pattern = 'progressive_degradation';
        rootCause = 'resource_exhaustion_or_memory_leak';
        recommendedAction = 'implement_resource_cleanup_and_monitoring';
        severity = 'high';
      }

      patterns.push({
        function_name: `session_${sessionId}`,
        crash_count_24h: crashesArray.length,
        crash_pattern: pattern,
        root_cause: rootCause,
        recommended_action: recommendedAction,
        severity,
        affected_users: 1,
        firstSeen: firstCrash.created_at,
        lastSeen: lastCrash.created_at,
      });
    }
  }

  // Analyze function health metrics
  for (const func of functions) {
    if (func.status === 'down') {
      patterns.push({
        function_name: func.name,
        crash_count_24h: func.errors,
        crash_pattern: 'function_down',
        root_cause: func.last_error || 'unknown_error',
        recommended_action: 'trigger_auto_heal_or_manual_review',
        severity: 'critical'
      });
    } else if (func.status === 'degraded') {
      patterns.push({
        function_name: func.name,
        crash_count_24h: func.errors,
        crash_pattern: 'performance_degradation',
        root_cause: `high_error_rate_${(func.error_rate * 100).toFixed(1)}%`,
        recommended_action: 'optimize_function_or_scale_resources',
        severity: 'high'
      });
    }
  }

  return patterns;
}

function detectAnomalies(
  currentFunctions: FunctionHealthMetrics[], 
  baselines: Record<string, any>
): any[] {
  const anomalies: any[] = [];

  for (const func of currentFunctions) {
    const baseline = baselines[func.name];
    if (!baseline) continue;

    // Response time anomaly (>50% increase)
    if (func.avg_response_time > baseline.avg_response_time * 1.5) {
      anomalies.push({
        type: 'response_time_anomaly',
        function_name: func.name,
        current_value: func.avg_response_time,
        baseline_value: baseline.avg_response_time,
        deviation_percent: ((func.avg_response_time / baseline.avg_response_time - 1) * 100).toFixed(1),
        severity: 'medium'
      });
    }

    // Error rate anomaly (>20% increase)
    if (func.error_rate > baseline.error_rate * 1.2) {
      anomalies.push({
        type: 'error_rate_anomaly',
        function_name: func.name,
        current_value: func.error_rate,
        baseline_value: baseline.error_rate,
        deviation_percent: ((func.error_rate / baseline.error_rate - 1) * 100).toFixed(1),
        severity: 'high'
      });
    }
  }

  return anomalies;
}

// HEALING FUNCTIONS

async function triggerAutoHealing(
  supabase: any, 
  crashPatterns: CrashPattern[], 
  anomalies: any[]
): Promise<any[]> {
  const healingActions: any[] = [];

  // Trigger auto-heal for critical crashes
  const criticalPatterns = crashPatterns.filter(p => p.severity === 'critical');
  
  if (criticalPatterns.length > 0) {
    console.log(`[edge-function-agent] Triggering auto-heal for ${criticalPatterns.length} critical issues`);
    
    try {
      const { data, error } = await supabase.functions.invoke('auto-heal-functions', {
        body: { 
          trigger: 'edge_function_agent',
          critical_functions: criticalPatterns.map(p => p.function_name)
        }
      });

      if (error) {
        console.error('[edge-function-agent] Auto-heal trigger failed:', error);
      } else {
        healingActions.push({
          action: 'auto_heal_triggered',
          target_functions: criticalPatterns.map(p => p.function_name),
          result: data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('[edge-function-agent] Auto-heal invocation error:', error);
    }
  }

  return healingActions;
}

async function createHealingApprovals(
  supabase: any,
  criticalPatterns: CrashPattern[]
): Promise<void> {
  for (const pattern of criticalPatterns) {
    // Create agent approval for risky healing operations
    const { error } = await supabase
      .from('agent_approvals')
      .insert({
        agent_type: 'edge_function_monitor',
        tool_name: 'auto_heal_critical_function',
        tool_arguments: {
          function_name: pattern.function_name,
          crash_pattern: pattern.crash_pattern,
          root_cause: pattern.root_cause,
          recommended_action: pattern.recommended_action
        },
        risk_level: 'high',
        reason: `Critical crash pattern detected: ${pattern.crash_pattern}`,
        status: 'pending'
      });

    if (error) {
      console.error('[edge-function-agent] Failed to create approval:', error);
    }
  }
}

// MEMORY FUNCTIONS

async function updateAgentMemory(
  supabase: any,
  crashPatterns: CrashPattern[],
  anomalies: any[],
  currentFunctions: FunctionHealthMetrics[]
): Promise<void> {
  // Update crash patterns memory
  const crashPatternsMemory = crashPatterns.reduce((acc, pattern) => {
    acc[pattern.function_name] = {
      last_detected: new Date().toISOString(),
      pattern: pattern.crash_pattern,
      severity: pattern.severity,
      crash_count_24h: pattern.crash_count_24h,
      root_cause: pattern.root_cause,
      recommended_action: pattern.recommended_action
    };
    return acc;
  }, {} as Record<string, any>);

  await upsertMemory(supabase, {
    agent_type: 'edge_function_monitor',
    memory_key: 'crash_patterns',
    memory_value: crashPatternsMemory
  });

  // Update function baselines (exponential moving average)
  const { data: existingBaselines } = await supabase
    .from('agent_memory')
    .select('memory_value')
    .eq('agent_type', 'edge_function_monitor')
    .eq('memory_key', 'function_baselines')
    .single();

  const baselines = existingBaselines?.memory_value || {};
  const alpha = 0.1; // smoothing factor

  for (const func of currentFunctions) {
    const existing = baselines[func.name] || {
      avg_response_time: func.avg_response_time,
      error_rate: func.error_rate,
      success_rate: func.success_rate
    };

    baselines[func.name] = {
      avg_response_time: alpha * func.avg_response_time + (1 - alpha) * existing.avg_response_time,
      error_rate: alpha * func.error_rate + (1 - alpha) * existing.error_rate,
      success_rate: alpha * func.success_rate + (1 - alpha) * existing.success_rate,
      last_updated: new Date().toISOString()
    };
  }

  await upsertMemory(supabase, {
    agent_type: 'edge_function_monitor',
    memory_key: 'function_baselines',
    memory_value: baselines
  });

  // Update anomalies history
  await upsertMemory(supabase, {
    agent_type: 'edge_function_monitor',
    memory_key: 'recent_anomalies',
    memory_value: anomalies,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h expiry
  });
}

async function upsertMemory(supabase: any, memory: AgentMemory): Promise<void> {
  const { error } = await supabase
    .from('agent_memory')
    .upsert({
      agent_type: memory.agent_type,
      memory_key: memory.memory_key,
      memory_value: memory.memory_value,
      expires_at: memory.expires_at,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'agent_type,memory_key'
    });

  if (error) {
    console.error('[edge-function-agent] Failed to upsert memory:', error);
  }
}

async function logAgentActivity(supabase: any, activity: any): Promise<void> {
  const { error } = await supabase
    .from('ai_agent_activity')
    .insert({
      agent_type: activity.agent_type,
      action: activity.action,
      success: activity.success,
      response_time_ms: activity.response_time_ms,
      prompt_tokens: 0,
      completion_tokens: 0,
      error_message: activity.error_message,
      metadata: activity.metadata
    });

  if (error) {
    console.error('[edge-function-agent] Failed to log activity:', error);
  }
}
