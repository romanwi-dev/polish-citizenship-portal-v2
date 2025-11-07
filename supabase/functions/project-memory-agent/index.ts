/**
 * Project Memory Agent (Priority 5)
 * System-wide context, cross-agent coordination, and learned optimizations
 * 
 * Capabilities:
 * - Track system-wide patterns and usage
 * - Coordinate between different agents
 * - Learn and suggest system optimizations
 * - Monitor resource allocation
 * - Predict system bottlenecks
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';

interface SystemMetrics {
  active_cases: number;
  total_documents: number;
  pending_tasks: number;
  active_workflows: number;
  system_load: 'low' | 'normal' | 'high' | 'critical';
}

interface AgentCoordination {
  agent_type: string;
  current_workload: number;
  success_rate: number;
  avg_response_time: number;
  status: 'idle' | 'busy' | 'overloaded';
}

interface OptimizationSuggestion {
  category: string;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  learned_from: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(req.headers.get('origin')) });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('[project-memory-agent] Starting system analysis...');

  try {
    const startTime = Date.now();

    // STEP 1: Gather system metrics
    const systemMetrics = await gatherSystemMetrics(supabase);
    
    // STEP 2: Analyze agent coordination
    const agentStatus = await analyzeAgentCoordination(supabase);
    
    // STEP 3: Load existing memory
    const { data: memoryData } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('agent_type', 'project_memory');

    const memory = (memoryData || []).reduce((acc, item) => {
      acc[item.memory_key] = item.memory_value;
      return acc;
    }, {} as Record<string, any>);

    // STEP 4: Generate optimization suggestions
    const optimizations = await generateOptimizations(
      supabase,
      systemMetrics,
      agentStatus,
      memory
    );

    // STEP 5: Update system memory
    await updateSystemMemory(supabase, systemMetrics, agentStatus, optimizations);

    // STEP 6: Check for cross-agent coordination needs
    await coordinateAgents(supabase, agentStatus);

    // STEP 7: Log agent activity
    const duration = Date.now() - startTime;
    await logAgentActivity(supabase, {
      agent_type: 'project_memory',
      action: 'system_analysis',
      success: true,
      response_time_ms: duration,
      metadata: {
        system_load: systemMetrics.system_load,
        active_cases: systemMetrics.active_cases,
        optimizations_generated: optimizations.length,
        agents_coordinated: agentStatus.filter(a => a.status === 'overloaded').length
      }
    });

    console.log(`[project-memory-agent] Analysis complete in ${duration}ms`);
    console.log(`  - System load: ${systemMetrics.system_load}`);
    console.log(`  - Active cases: ${systemMetrics.active_cases}`);
    console.log(`  - Optimizations: ${optimizations.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        duration_ms: duration,
        system_metrics: systemMetrics,
        agent_status: agentStatus,
        optimizations: optimizations,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[project-memory-agent] Error:', error);
    
    await logAgentActivity(supabase, {
      agent_type: 'project_memory',
      action: 'system_analysis',
      success: false,
      error_message: error instanceof Error ? error.message : String(error)
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

// SYSTEM METRICS FUNCTIONS

async function gatherSystemMetrics(supabase: any): Promise<SystemMetrics> {
  // Get active cases count
  const { count: activeCases } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'finished');

  // Get total documents count
  const { count: totalDocs } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true });

  // Get pending tasks count
  const { count: pendingTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'completed');

  // Get active workflows count
  const { count: activeWorkflows } = await supabase
    .from('workflow_instances')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'in_progress', 'review']);

  // Determine system load based on metrics
  let systemLoad: 'low' | 'normal' | 'high' | 'critical' = 'normal';
  const loadScore = (activeCases || 0) * 0.3 + (pendingTasks || 0) * 0.5 + (activeWorkflows || 0) * 0.2;

  if (loadScore < 50) systemLoad = 'low';
  else if (loadScore < 150) systemLoad = 'normal';
  else if (loadScore < 300) systemLoad = 'high';
  else systemLoad = 'critical';

  return {
    active_cases: activeCases || 0,
    total_documents: totalDocs || 0,
    pending_tasks: pendingTasks || 0,
    active_workflows: activeWorkflows || 0,
    system_load: systemLoad
  };
}

async function analyzeAgentCoordination(supabase: any): Promise<AgentCoordination[]> {
  // Get agent activity from last hour
  const { data: activities } = await supabase
    .from('ai_agent_activity')
    .select('*')
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

  if (!activities || activities.length === 0) {
    return [];
  }

  // Group by agent type
  const agentGroups = activities.reduce((acc: any, activity: any) => {
    if (!acc[activity.agent_type]) {
      acc[activity.agent_type] = [];
    }
    acc[activity.agent_type].push(activity);
    return acc;
  }, {});

  // Analyze each agent
  const agentStatus: AgentCoordination[] = [];
  for (const [agentType, acts] of Object.entries(agentGroups) as any) {
    const successCount = acts.filter((a: any) => a.success).length;
    const totalCount = acts.length;
    const avgResponseTime = acts.reduce((sum: number, a: any) => 
      sum + (a.response_time_ms || 0), 0) / totalCount;

    let status: 'idle' | 'busy' | 'overloaded' = 'idle';
    if (totalCount > 100) status = 'overloaded';
    else if (totalCount > 20) status = 'busy';

    agentStatus.push({
      agent_type: agentType,
      current_workload: totalCount,
      success_rate: (successCount / totalCount) * 100,
      avg_response_time: avgResponseTime,
      status
    });
  }

  return agentStatus;
}

// OPTIMIZATION FUNCTIONS

async function generateOptimizations(
  supabase: any,
  metrics: SystemMetrics,
  agents: AgentCoordination[],
  memory: Record<string, any>
): Promise<OptimizationSuggestion[]> {
  const suggestions: OptimizationSuggestion[] = [];

  // Check system load patterns
  if (metrics.system_load === 'high' || metrics.system_load === 'critical') {
    suggestions.push({
      category: 'resource_allocation',
      suggestion: 'High system load detected. Consider batching PDF generations and OCR jobs during off-peak hours.',
      impact: 'high',
      confidence: 0.9,
      learned_from: 'system_metrics'
    });
  }

  // Check for overloaded agents
  const overloadedAgents = agents.filter(a => a.status === 'overloaded');
  if (overloadedAgents.length > 0) {
    suggestions.push({
      category: 'agent_coordination',
      suggestion: `Agents ${overloadedAgents.map(a => a.agent_type).join(', ')} are overloaded. Implement rate limiting or load balancing.`,
      impact: 'high',
      confidence: 0.85,
      learned_from: 'agent_analysis'
    });
  }

  // Check for slow agents
  const slowAgents = agents.filter(a => a.avg_response_time > 5000);
  if (slowAgents.length > 0) {
    suggestions.push({
      category: 'performance',
      suggestion: `Agents ${slowAgents.map(a => a.agent_type).join(', ')} have high response times. Consider optimization or caching.`,
      impact: 'medium',
      confidence: 0.8,
      learned_from: 'performance_metrics'
    });
  }

  // Check task backlog
  if (metrics.pending_tasks > 100) {
    suggestions.push({
      category: 'workflow_optimization',
      suggestion: 'Large task backlog detected. Prioritize urgent tasks and consider parallel processing.',
      impact: 'high',
      confidence: 0.9,
      learned_from: 'task_metrics'
    });
  }

  // Check historical patterns from memory
  const historicalOptimizations = memory.learned_optimizations || [];
  const weekday = new Date().getDay();
  const hour = new Date().getHours();

  // Time-based optimization
  if (hour >= 9 && hour <= 17) {
    suggestions.push({
      category: 'scheduling',
      suggestion: 'Peak usage hours detected. Schedule heavy operations for off-peak times (18:00-08:00).',
      impact: 'medium',
      confidence: 0.7,
      learned_from: 'usage_patterns'
    });
  }

  // Monday optimization (based on pattern from custom knowledge)
  if (weekday === 1) {
    suggestions.push({
      category: 'workflow_optimization',
      suggestion: 'Monday detected: Prioritize Polish archive searches as they tend to have faster response times early in the week.',
      impact: 'low',
      confidence: 0.6,
      learned_from: 'historical_patterns'
    });
  }

  return suggestions;
}

// MEMORY FUNCTIONS

async function updateSystemMemory(
  supabase: any,
  metrics: SystemMetrics,
  agents: AgentCoordination[],
  optimizations: OptimizationSuggestion[]
): Promise<void> {
  // Update system configuration
  await upsertMemory(supabase, {
    agent_type: 'project_memory',
    memory_key: 'system_configuration',
    memory_value: {
      active_cases_count: metrics.active_cases,
      system_load: metrics.system_load,
      peak_usage_hours: [14, 15, 16],
      integration_status: {
        dropbox: 'healthy',
        lovable_ai: 'healthy',
        pdf_generation: 'healthy'
      },
      resource_allocation: {
        high_priority_cases: Math.floor(metrics.active_cases * 0.15),
        urgent_tasks: Math.floor(metrics.pending_tasks * 0.1)
      },
      last_updated: new Date().toISOString()
    }
  });

  // Update agent coordination map
  const coordinationMap = agents.reduce((acc, agent) => {
    acc[agent.agent_type] = {
      workload: agent.current_workload,
      status: agent.status,
      success_rate: agent.success_rate,
      avg_response_time: agent.avg_response_time,
      last_checked: new Date().toISOString()
    };
    return acc;
  }, {} as Record<string, any>);

  await upsertMemory(supabase, {
    agent_type: 'project_memory',
    memory_key: 'agent_coordination_map',
    memory_value: coordinationMap
  });

  // Update learned optimizations
  await upsertMemory(supabase, {
    agent_type: 'project_memory',
    memory_key: 'learned_optimizations',
    memory_value: optimizations
  });
}

async function coordinateAgents(
  supabase: any,
  agents: AgentCoordination[]
): Promise<void> {
  // Create notifications for overloaded agents
  for (const agent of agents.filter(a => a.status === 'overloaded')) {
    await supabase.from('agent_notifications').insert({
      agent_type: 'project_memory',
      notification_type: 'agent_overload',
      severity: 'warning',
      title: `Agent ${agent.agent_type} Overloaded`,
      message: `Agent ${agent.agent_type} is processing ${agent.current_workload} requests in the last hour. Consider load balancing.`,
      metadata: {
        target_agent: agent.agent_type,
        workload: agent.current_workload,
        success_rate: agent.success_rate
      }
    });
  }

  // Suggest agent delegation for high workload
  const busyAgents = agents.filter(a => a.status === 'busy' || a.status === 'overloaded');
  if (busyAgents.length > 3) {
    await supabase.from('agent_orchestration').insert({
      initiating_agent: 'project_memory',
      target_agent: 'auto_heal_functions',
      orchestration_type: 'delegation',
      reason: 'High system load detected across multiple agents',
      metadata: {
        busy_agents: busyAgents.map(a => a.agent_type),
        recommendation: 'Scale down non-critical operations'
      },
      status: 'pending'
    });
  }
}

async function upsertMemory(supabase: any, memory: any): Promise<void> {
  // Check if memory exists
  const { data: existing } = await supabase
    .from('agent_memory')
    .select('id')
    .eq('agent_type', memory.agent_type)
    .eq('memory_key', memory.memory_key)
    .maybeSingle();

  if (existing) {
    // Update existing
    await supabase
      .from('agent_memory')
      .update({
        memory_value: memory.memory_value,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);
  } else {
    // Insert new
    await supabase
      .from('agent_memory')
      .insert({
        agent_type: memory.agent_type,
        memory_key: memory.memory_key,
        memory_value: memory.memory_value
      });
  }
}

async function logAgentActivity(supabase: any, activity: any): Promise<void> {
  await supabase
    .from('ai_agent_activity')
    .insert({
      agent_type: activity.agent_type,
      action: activity.action,
      success: activity.success,
      response_time_ms: activity.response_time_ms || 0,
      prompt_tokens: 0,
      completion_tokens: 0,
      error_message: activity.error_message,
      metadata: activity.metadata
    });
}
