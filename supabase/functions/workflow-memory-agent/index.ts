import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getErrorMessage } from '../_shared/error-utils.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WorkflowStageMetrics {
  stageName: string;
  avgDurationDays: number;
  minDurationDays: number;
  maxDurationDays: number;
  casesInStage: number;
  successRate: number;
  commonIssues: string[];
  isBottleneck: boolean;
}

interface WorkflowPattern {
  patternType: string;
  successRate: number;
  avgCompletionTime: number;
  frequency: number;
  recommendation: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("🔄 Workflows Memory Agent: Starting analysis...");

    // 1. ANALYZE WORKFLOW STAGE PERFORMANCE
    const stageMetrics = await analyzeWorkflowStages(supabase);
    
    // 2. IDENTIFY BOTTLENECKS
    const bottlenecks = identifyBottlenecks(stageMetrics);
    
    // 3. DETECT SUCCESSFUL PATTERNS
    const successPatterns = await detectSuccessPatterns(supabase);
    
    // 4. ANALYZE TRANSITION PATTERNS
    const transitionAnalysis = await analyzeTransitions(supabase);
    
    // 5. UPDATE WORKFLOW MEMORY
    await updateWorkflowMemory(supabase, stageMetrics, bottlenecks, successPatterns);
    
    // 6. GENERATE OPTIMIZATION RECOMMENDATIONS
    const optimizations = generateOptimizations(stageMetrics, bottlenecks, successPatterns);
    
    // 7. LOG AGENT ACTIVITY
    await logWorkflowActivity(supabase, stageMetrics, optimizations);

    console.log("✅ Workflows Memory Agent: Analysis complete");

    return new Response(
      JSON.stringify({
        success: true,
        stageMetrics,
        bottlenecks,
        successPatterns,
        transitionAnalysis,
        optimizations,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Workflows Memory Agent error:", error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function analyzeWorkflowStages(supabase: any): Promise<WorkflowStageMetrics[]> {
  console.log("📊 Analyzing workflow stages...");

  // Get all workflow instances
  const { data: workflows, error } = await supabase
    .from("workflow_instances")
    .select("*")
    .gte("created_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()); // Last 90 days

  if (error) {
    console.error("Error fetching workflows:", error);
    return [];
  }

  // Group by current_stage
  const stageGroups: Record<string, any[]> = {};
  workflows?.forEach((workflow: any) => {
    const stage = workflow.current_stage;
    if (!stageGroups[stage]) stageGroups[stage] = [];
    stageGroups[stage].push(workflow);
  });

  const metrics: WorkflowStageMetrics[] = [];

  for (const [stageName, stageWorkflows] of Object.entries(stageGroups)) {
    // Calculate duration for workflows in this stage
    const durations = stageWorkflows
      .map((w: any) => {
        const start = new Date(w.updated_at);
        const now = new Date();
        return (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24); // days
      })
      .filter((d: number) => d > 0);

    const avgDuration = durations.length > 0 
      ? durations.reduce((a: number, b: number) => a + b, 0) / durations.length 
      : 0;
    const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

    // Calculate success rate (completed vs failed)
    const completed = stageWorkflows.filter((w: any) => w.status === "completed").length;
    const failed = stageWorkflows.filter((w: any) => w.status === "failed").length;
    const successRate = (stageWorkflows.length > 0) 
      ? (completed / (completed + failed || 1)) * 100 
      : 0;

    // Get common issues from workflow errors
    const { data: errors } = await supabase
      .from("workflow_errors")
      .select("error_message")
      .in("workflow_run_id", stageWorkflows.map((w: any) => w.id))
      .limit(5);

    const commonIssues: string[] = errors && Array.isArray(errors)
      ? [...new Set(errors.map((e: any) => String(e.error_message).substring(0, 100)))]
      : [];

    // Determine if this is a bottleneck
    const isBottleneck = avgDuration > 30 || stageWorkflows.length > 20;

    metrics.push({
      stageName,
      avgDurationDays: Math.round(avgDuration * 10) / 10,
      minDurationDays: Math.round(minDuration * 10) / 10,
      maxDurationDays: Math.round(maxDuration * 10) / 10,
      casesInStage: stageWorkflows.length,
      successRate: Math.round(successRate),
      commonIssues,
      isBottleneck,
    });
  }

  return metrics.sort((a, b) => b.casesInStage - a.casesInStage);
}

function identifyBottlenecks(metrics: WorkflowStageMetrics[]) {
  console.log("🚧 Identifying bottlenecks...");

  return metrics
    .filter((m) => m.isBottleneck)
    .map((m) => ({
      stage: m.stageName,
      severity: m.avgDurationDays > 60 ? "critical" : m.avgDurationDays > 30 ? "high" : "medium",
      casesAffected: m.casesInStage,
      avgDelay: m.avgDurationDays,
      recommendation: generateBottleneckRecommendation(m),
    }))
    .sort((a, b) => b.casesAffected - a.casesAffected);
}

function generateBottleneckRecommendation(metric: WorkflowStageMetrics): string {
  if (metric.commonIssues.length > 0) {
    return `Address common issue: "${metric.commonIssues[0].substring(0, 50)}..." affecting ${metric.casesInStage} cases`;
  }
  
  if (metric.casesInStage > 20) {
    return `High volume in ${metric.stageName} (${metric.casesInStage} cases). Consider adding automation or resources.`;
  }

  if (metric.avgDurationDays > 60) {
    return `Extremely long duration (${metric.avgDurationDays} days avg). Review process for inefficiencies.`;
  }

  return `Monitor ${metric.stageName} stage for continued delays.`;
}

async function detectSuccessPatterns(supabase: any): Promise<WorkflowPattern[]> {
  console.log("✅ Detecting success patterns...");

  const patterns: WorkflowPattern[] = [];

  // Analyze completed workflows
  const { data: completedWorkflows, error } = await supabase
    .from("workflow_instances")
    .select("*")
    .eq("status", "completed")
    .gte("completed_at", new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

  if (error || !completedWorkflows) return patterns;

  // Group by workflow_type
  const typeGroups: Record<string, any[]> = {};
  completedWorkflows.forEach((w: any) => {
    if (!typeGroups[w.workflow_type]) typeGroups[w.workflow_type] = [];
    typeGroups[w.workflow_type].push(w);
  });

  for (const [type, workflows] of Object.entries(typeGroups)) {
    const durations = workflows.map((w: any) => {
      const start = new Date(w.started_at);
      const end = new Date(w.completed_at);
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24); // days
    });

    const avgCompletion = durations.reduce((a, b) => a + b, 0) / durations.length;
    
    // Find fast-track cases (completed in < 50% of avg time)
    const fastTrack = workflows.filter((w: any) => {
      const start = new Date(w.started_at);
      const end = new Date(w.completed_at);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      return duration < avgCompletion * 0.5;
    });

    if (fastTrack.length > 0) {
      patterns.push({
        patternType: `fast_track_${type}`,
        successRate: 100,
        avgCompletionTime: Math.round(avgCompletion * 0.5),
        frequency: fastTrack.length,
        recommendation: `${fastTrack.length} cases completed ${type} workflow in half the average time. Analyze their common characteristics.`,
      });
    }

    // Detect patterns based on priority
    const highPriority = workflows.filter((w: any) => w.priority === "high");
    if (highPriority.length > 0) {
      const hpDurations = highPriority.map((w: any) => {
        const start = new Date(w.started_at);
        const end = new Date(w.completed_at);
        return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      });
      const hpAvg = hpDurations.reduce((a, b) => a + b, 0) / hpDurations.length;

      patterns.push({
        patternType: `priority_${type}`,
        successRate: 100,
        avgCompletionTime: Math.round(hpAvg),
        frequency: highPriority.length,
        recommendation: `High-priority ${type} cases complete in ${Math.round(hpAvg)} days on average. Consider prioritization strategy.`,
      });
    }
  }

  return patterns;
}

async function analyzeTransitions(supabase: any) {
  console.log("🔄 Analyzing workflow transitions...");

  const { data: transitions, error } = await supabase
    .from("workflow_stage_transitions")
    .select("*")
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error || !transitions) {
    return { totalTransitions: 0, avgTransitionTime: 0, commonPaths: [] };
  }

  // Calculate average transition time
  const avgTransitionTime = transitions.length > 0
    ? transitions.reduce((sum: number, t: any) => sum + (t.duration_seconds || 0), 0) / transitions.length
    : 0;

  // Find common transition paths
  const pathCounts: Record<string, number> = {};
  transitions.forEach((t: any) => {
    const path = `${t.from_stage} → ${t.to_stage}`;
    pathCounts[path] = (pathCounts[path] || 0) + 1;
  });

  const commonPaths = Object.entries(pathCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, count]) => ({ path, count }));

  return {
    totalTransitions: transitions.length,
    avgTransitionTime: Math.round(avgTransitionTime / 60), // convert to minutes
    commonPaths,
  };
}

async function updateWorkflowMemory(
  supabase: any,
  stageMetrics: WorkflowStageMetrics[],
  bottlenecks: any[],
  successPatterns: WorkflowPattern[]
) {
  console.log("💾 Updating workflow memory...");

  // Update stage performance memory
  await supabase
    .from("agent_memory")
    .upsert({
      agent_type: "workflow_orchestrator",
      memory_key: "stage_performance",
      memory_value: {
        stages: stageMetrics.reduce((acc, m) => {
          acc[m.stageName] = {
            avgDurationDays: m.avgDurationDays,
            casesInStage: m.casesInStage,
            successRate: m.successRate,
            isBottleneck: m.isBottleneck,
          };
          return acc;
        }, {} as Record<string, any>),
        lastUpdated: new Date().toISOString(),
      },
      expires_at: null,
    });

  // Update bottleneck memory
  await supabase
    .from("agent_memory")
    .upsert({
      agent_type: "workflow_orchestrator",
      memory_key: "bottlenecks",
      memory_value: {
        currentBottlenecks: bottlenecks,
        bottleneckCount: bottlenecks.length,
        criticalBottlenecks: bottlenecks.filter((b: any) => b.severity === "critical").length,
        lastAnalyzed: new Date().toISOString(),
      },
      expires_at: null,
    });

  // Update success patterns memory
  await supabase
    .from("agent_memory")
    .upsert({
      agent_type: "workflow_orchestrator",
      memory_key: "success_patterns",
      memory_value: {
        patterns: successPatterns,
        totalPatterns: successPatterns.length,
        lastAnalyzed: new Date().toISOString(),
      },
      expires_at: null,
    });
}

function generateOptimizations(
  stageMetrics: WorkflowStageMetrics[],
  bottlenecks: any[],
  successPatterns: WorkflowPattern[]
): string[] {
  const optimizations: string[] = [];

  // Bottleneck optimizations
  bottlenecks.forEach((bottleneck) => {
    if (bottleneck.severity === "critical") {
      optimizations.push(
        `🚨 CRITICAL: ${bottleneck.stage} has ${bottleneck.casesAffected} cases with ${bottleneck.avgDelay} day avg delay. ${bottleneck.recommendation}`
      );
    } else if (bottleneck.severity === "high") {
      optimizations.push(
        `⚠️ ${bottleneck.stage} bottleneck affecting ${bottleneck.casesAffected} cases. ${bottleneck.recommendation}`
      );
    }
  });

  // Stage-specific optimizations
  stageMetrics.forEach((metric) => {
    if (metric.successRate < 70) {
      optimizations.push(
        `📉 Low success rate in ${metric.stageName} (${metric.successRate}%). Review common issues and improve validation.`
      );
    }

    if (metric.maxDurationDays > metric.avgDurationDays * 3) {
      optimizations.push(
        `⏱️ High variance in ${metric.stageName}: Some cases take ${metric.maxDurationDays} days vs ${metric.avgDurationDays} avg. Investigate outliers.`
      );
    }
  });

  // Pattern-based optimizations
  successPatterns.forEach((pattern) => {
    if (pattern.frequency > 5) {
      optimizations.push(
        `✨ Success pattern detected: ${pattern.recommendation}`
      );
    }
  });

  // General workflow optimizations
  const totalCases = stageMetrics.reduce((sum, m) => sum + m.casesInStage, 0);
  if (totalCases > 100) {
    optimizations.push(
      `📊 High case volume (${totalCases} active workflows). Consider implementing automated routing and prioritization.`
    );
  }

  return optimizations;
}

async function logWorkflowActivity(
  supabase: any,
  stageMetrics: WorkflowStageMetrics[],
  optimizations: string[]
) {
  const totalCases = stageMetrics.reduce((sum, m) => sum + m.casesInStage, 0);
  const bottleneckStages = stageMetrics.filter((m) => m.isBottleneck).length;
  const avgSuccessRate = stageMetrics.length > 0
    ? stageMetrics.reduce((sum, m) => sum + m.successRate, 0) / stageMetrics.length
    : 0;

  await supabase.from("ai_agent_activity").insert({
    agent_type: "workflow_orchestrator",
    case_id: "00000000-0000-0000-0000-000000000000",
    user_id: "00000000-0000-0000-0000-000000000000",
    prompt: "Analyze workflow patterns, identify bottlenecks, and optimize case processing",
    completion: `Analyzed ${stageMetrics.length} workflow stages across ${totalCases} active cases. Identified ${bottleneckStages} bottlenecks. Average success rate: ${avgSuccessRate.toFixed(1)}%. Generated ${optimizations.length} optimization recommendations.`,
    success: true,
    response_time_ms: 0,
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
    model_used: "workflow_analyzer",
    tools_executed: 4,
    tools_failed: 0,
    metadata: {
      stageMetrics,
      optimizations,
      analysisType: "workflow_memory",
    },
  });
}
