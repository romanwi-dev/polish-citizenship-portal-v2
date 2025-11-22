import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubagentMetrics {
  agentType: string;
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  totalTokens: number;
  toolsExecuted: number;
  toolsFailed: number;
  memoryEntries: number;
  lastActive: string;
  status: "healthy" | "degraded" | "failing" | "inactive";
}

const MONITORED_SUBAGENTS = ["translator", "researcher", "designer", "writer"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("🔍 Subagent Supervisor: Starting monitoring cycle...");

    // 1. ANALYZE EACH SUBAGENT'S PERFORMANCE
    const subagentMetrics = await analyzeSubagentPerformance(supabase);
    
    // 2. CHECK SUBAGENT MEMORY HEALTH
    const memoryHealth = await checkSubagentMemory(supabase);
    
    // 3. DETECT COORDINATION ISSUES
    const coordinationIssues = await detectCoordinationIssues(supabase);
    
    // 4. ANALYZE TOOL USAGE PATTERNS
    const toolPatterns = await analyzeToolUsage(supabase);
    
    // 5. UPDATE SUPERVISOR MEMORY
    await updateSupervisorMemory(supabase, subagentMetrics, memoryHealth, coordinationIssues);
    
    // 6. GENERATE SUPERVISION RECOMMENDATIONS
    const recommendations = generateRecommendations(subagentMetrics, coordinationIssues, toolPatterns);
    
    // 7. CREATE ALERTS FOR CRITICAL ISSUES
    const alerts = await createAlertsForIssues(supabase, subagentMetrics, coordinationIssues);
    
    // 8. LOG SUPERVISOR ACTIVITY
    await logSupervisorActivity(supabase, subagentMetrics, recommendations, alerts);

    console.log("✅ Subagent Supervisor: Monitoring complete");

    return new Response(
      JSON.stringify({
        success: true,
        subagentMetrics,
        memoryHealth,
        coordinationIssues,
        toolPatterns,
        recommendations,
        alerts,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Subagent Supervisor error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function analyzeSubagentPerformance(supabase: any): Promise<SubagentMetrics[]> {
  console.log("📊 Analyzing subagent performance...");

  const metrics: SubagentMetrics[] = [];
  const lookbackPeriod = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  for (const agentType of MONITORED_SUBAGENTS) {
    // Get activity data for this subagent
    const { data: activities, error } = await supabase
      .from("ai_agent_activity")
      .select("*")
      .eq("agent_type", agentType)
      .gte("created_at", lookbackPeriod);

    if (error) {
      console.error(`Error fetching ${agentType} activity:`, error);
      continue;
    }

    if (!activities || activities.length === 0) {
      metrics.push({
        agentType,
        totalRequests: 0,
        successRate: 0,
        avgResponseTime: 0,
        totalTokens: 0,
        toolsExecuted: 0,
        toolsFailed: 0,
        memoryEntries: 0,
        lastActive: "never",
        status: "inactive",
      });
      continue;
    }

    const totalRequests = activities.length;
    const successCount = activities.filter((a: any) => a.success).length;
    const successRate = (successCount / totalRequests) * 100;
    const avgResponseTime = activities.reduce((sum: number, a: any) => sum + a.response_time_ms, 0) / totalRequests;
    const totalTokens = activities.reduce((sum: number, a: any) => sum + (a.prompt_tokens + a.completion_tokens), 0);
    const toolsExecuted = activities.reduce((sum: number, a: any) => sum + a.tools_executed, 0);
    const toolsFailed = activities.reduce((sum: number, a: any) => sum + a.tools_failed, 0);
    const lastActive = activities[0].created_at;

    // Check memory entries
    const { data: memoryData } = await supabase
      .from("agent_memory")
      .select("*", { count: "exact", head: true })
      .eq("agent_type", agentType);

    const memoryEntries = memoryData ? 0 : 0; // Count would be in the count header

    // Determine health status
    let status: "healthy" | "degraded" | "failing" | "inactive" = "healthy";
    if (successRate < 50) status = "failing";
    else if (successRate < 80) status = "degraded";
    else if (Date.now() - new Date(lastActive).getTime() > 24 * 60 * 60 * 1000) status = "inactive";

    metrics.push({
      agentType,
      totalRequests,
      successRate,
      avgResponseTime: Math.round(avgResponseTime),
      totalTokens,
      toolsExecuted,
      toolsFailed,
      memoryEntries,
      lastActive,
      status,
    });
  }

  return metrics;
}

async function checkSubagentMemory(supabase: any) {
  console.log("💾 Checking subagent memory health...");

  const memoryHealth: Record<string, any> = {};

  for (const agentType of MONITORED_SUBAGENTS) {
    const { data: memory, error } = await supabase
      .from("agent_memory")
      .select("*")
      .eq("agent_type", agentType);

    if (error) {
      console.error(`Error fetching ${agentType} memory:`, error);
      continue;
    }

    memoryHealth[agentType] = {
      totalEntries: memory?.length || 0,
      memoryKeys: memory?.map((m: any) => m.memory_key) || [],
      oldestEntry: memory && memory.length > 0 
        ? memory.reduce((oldest: any, m: any) => 
            new Date(m.created_at) < new Date(oldest.created_at) ? m : oldest
          ).created_at
        : null,
      newestEntry: memory && memory.length > 0
        ? memory.reduce((newest: any, m: any) =>
            new Date(m.created_at) > new Date(newest.created_at) ? m : newest
          ).created_at
        : null,
    };
  }

  return memoryHealth;
}

async function detectCoordinationIssues(supabase: any) {
  console.log("🔗 Detecting coordination issues...");

  const issues: Array<{
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    affectedAgents: string[];
  }> = [];

  // Check for agents working on the same case simultaneously
  const { data: recentActivity, error } = await supabase
    .from("ai_agent_activity")
    .select("case_id, agent_type, created_at")
    .in("agent_type", MONITORED_SUBAGENTS)
    .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching coordination data:", error);
    return issues;
  }

  // Group by case_id and detect overlaps
  const caseGroups: Record<string, any[]> = {};
  recentActivity?.forEach((activity: any) => {
    if (!caseGroups[activity.case_id]) {
      caseGroups[activity.case_id] = [];
    }
    caseGroups[activity.case_id].push(activity);
  });

  for (const [caseId, activities] of Object.entries(caseGroups)) {
    if (activities.length > 1) {
      const agents = [...new Set(activities.map((a: any) => a.agent_type))];
      
      // Check if multiple agents worked within 5 minutes
      const timestamps = activities.map((a: any) => new Date(a.created_at).getTime());
      const minTime = Math.min(...timestamps);
      const maxTime = Math.max(...timestamps);
      const timeSpan = (maxTime - minTime) / 1000 / 60; // in minutes

      if (timeSpan < 5 && agents.length > 1) {
        issues.push({
          type: "concurrent_execution",
          severity: "medium",
          description: `Multiple agents (${agents.join(", ")}) working on case ${caseId.substring(0, 8)} simultaneously within ${timeSpan.toFixed(1)} minutes`,
          affectedAgents: agents,
        });
      }
    }
  }

  // Check for missing expected agent handoffs
  // (e.g., researcher should often precede writer)
  const expectedSequences = [
    { from: "researcher", to: "writer", reason: "Research should inform writing" },
    { from: "translator", to: "designer", reason: "Translation should precede design for multilingual content" },
  ];

  for (const sequence of expectedSequences) {
    const fromActivities = recentActivity?.filter((a: any) => a.agent_type === sequence.from) || [];
    const toActivities = recentActivity?.filter((a: any) => a.agent_type === sequence.to) || [];

    if (toActivities.length > fromActivities.length * 2) {
      issues.push({
        type: "missing_handoff",
        severity: "low",
        description: `${sequence.to} is running frequently without ${sequence.from} preparation. ${sequence.reason}`,
        affectedAgents: [sequence.from, sequence.to],
      });
    }
  }

  return issues;
}

async function analyzeToolUsage(supabase: any) {
  console.log("🔧 Analyzing tool usage patterns...");

  const toolPatterns: Record<string, any> = {};

  for (const agentType of MONITORED_SUBAGENTS) {
    const { data: activities, error } = await supabase
      .from("ai_agent_activity")
      .select("tools_executed, tools_failed, metadata")
      .eq("agent_type", agentType)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (error || !activities) continue;

    const totalToolCalls = activities.reduce((sum: number, a: any) => sum + a.tools_executed, 0);
    const failedToolCalls = activities.reduce((sum: number, a: any) => sum + a.tools_failed, 0);
    const toolSuccessRate = totalToolCalls > 0 ? ((totalToolCalls - failedToolCalls) / totalToolCalls) * 100 : 0;

    toolPatterns[agentType] = {
      totalToolCalls,
      failedToolCalls,
      toolSuccessRate: Math.round(toolSuccessRate),
      avgToolsPerRequest: activities.length > 0 ? totalToolCalls / activities.length : 0,
    };
  }

  return toolPatterns;
}

async function updateSupervisorMemory(
  supabase: any,
  metrics: SubagentMetrics[],
  memoryHealth: any,
  coordinationIssues: any[]
) {
  console.log("💾 Updating supervisor memory...");

  // Update subagent performance memory
  await supabase
    .from("agent_memory")
    .upsert({
      agent_type: "subagent_supervisor",
      memory_key: "subagent_performance",
      memory_value: {
        metrics: metrics.reduce((acc, m) => {
          acc[m.agentType] = {
            totalRequests: m.totalRequests,
            successRate: m.successRate,
            avgResponseTime: m.avgResponseTime,
            status: m.status,
            lastActive: m.lastActive,
          };
          return acc;
        }, {} as Record<string, any>),
        lastUpdated: new Date().toISOString(),
      },
      expires_at: null,
    });

  // Update coordination patterns memory
  await supabase
    .from("agent_memory")
    .upsert({
      agent_type: "subagent_supervisor",
      memory_key: "coordination_patterns",
      memory_value: {
        recentIssues: coordinationIssues,
        issueCount: coordinationIssues.length,
        criticalIssues: coordinationIssues.filter((i: any) => i.severity === "critical").length,
        memoryHealth,
        lastAnalyzed: new Date().toISOString(),
      },
      expires_at: null,
    });
}

function generateRecommendations(
  metrics: SubagentMetrics[],
  coordinationIssues: any[],
  toolPatterns: Record<string, any>
): string[] {
  const recommendations: string[] = [];

  // Performance recommendations
  metrics.forEach((metric) => {
    if (metric.status === "failing") {
      recommendations.push(
        `🚨 CRITICAL: ${metric.agentType} agent is failing (${metric.successRate.toFixed(1)}% success rate). Investigate recent errors and tool failures.`
      );
    } else if (metric.status === "degraded") {
      recommendations.push(
        `⚠️ ${metric.agentType} agent performance is degraded (${metric.successRate.toFixed(1)}% success rate). Review error logs and optimize prompts.`
      );
    } else if (metric.status === "inactive") {
      recommendations.push(
        `💤 ${metric.agentType} agent has been inactive since ${metric.lastActive}. Verify agent is being invoked correctly.`
      );
    }

    if (metric.avgResponseTime > 5000) {
      recommendations.push(
        `⏱️ ${metric.agentType} agent has slow response time (${metric.avgResponseTime}ms avg). Consider optimizing tool usage or model selection.`
      );
    }

    if (metric.toolsFailed > metric.toolsExecuted * 0.1) {
      recommendations.push(
        `🔧 ${metric.agentType} agent has high tool failure rate (${metric.toolsFailed}/${metric.toolsExecuted}). Review tool configurations.`
      );
    }
  });

  // Coordination recommendations
  coordinationIssues.forEach((issue) => {
    if (issue.severity === "critical" || issue.severity === "high") {
      recommendations.push(`🔗 ${issue.description}`);
    }
  });

  // Tool usage recommendations
  Object.entries(toolPatterns).forEach(([agent, pattern]: [string, any]) => {
    if (pattern.toolSuccessRate < 80) {
      recommendations.push(
        `🔧 ${agent} tool success rate is low (${pattern.toolSuccessRate}%). Investigate failing tools and improve error handling.`
      );
    }
  });

  return recommendations;
}

async function createAlertsForIssues(
  supabase: any,
  metrics: SubagentMetrics[],
  coordinationIssues: any[]
) {
  console.log("🚨 Creating alerts for critical issues...");

  const alerts: string[] = [];

  for (const metric of metrics) {
    if (metric.status === "failing") {
      // Create notification for admin
      await supabase.from("agent_notifications").insert({
        agent_type: "subagent_supervisor",
        notification_type: "subagent_failure",
        severity: "critical",
        title: `${metric.agentType} Agent Failing`,
        message: `The ${metric.agentType} agent has a ${metric.successRate.toFixed(1)}% success rate with ${metric.toolsFailed} tool failures.`,
        metadata: { metric },
        read: false,
      });

      alerts.push(`${metric.agentType}_failure`);
    }
  }

  for (const issue of coordinationIssues) {
    if (issue.severity === "critical") {
      await supabase.from("agent_notifications").insert({
        agent_type: "subagent_supervisor",
        notification_type: "coordination_issue",
        severity: "high",
        title: "Agent Coordination Issue Detected",
        message: issue.description,
        metadata: { issue },
        read: false,
      });

      alerts.push("coordination_critical");
    }
  }

  return alerts;
}

async function logSupervisorActivity(
  supabase: any,
  metrics: SubagentMetrics[],
  recommendations: string[],
  alerts: string[]
) {
  const healthyAgents = metrics.filter((m) => m.status === "healthy").length;
  const degradedAgents = metrics.filter((m) => m.status === "degraded").length;
  const failingAgents = metrics.filter((m) => m.status === "failing").length;
  const inactiveAgents = metrics.filter((m) => m.status === "inactive").length;

  await supabase.from("ai_agent_activity").insert({
    agent_type: "subagent_supervisor",
    case_id: "00000000-0000-0000-0000-000000000000",
    user_id: "00000000-0000-0000-0000-000000000000",
    prompt: "Monitor and supervise all subagents (translator, researcher, designer, writer)",
    completion: `Monitored ${metrics.length} subagents. Status: ${healthyAgents} healthy, ${degradedAgents} degraded, ${failingAgents} failing, ${inactiveAgents} inactive. Generated ${recommendations.length} recommendations and ${alerts.length} alerts.`,
    success: true,
    response_time_ms: 0,
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
    model_used: "supervisor_engine",
    tools_executed: 5,
    tools_failed: 0,
    metadata: {
      metrics,
      recommendations,
      alerts,
      supervisorType: "subagent_monitoring",
    },
  });
}
