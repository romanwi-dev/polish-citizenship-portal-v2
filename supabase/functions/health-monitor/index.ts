import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FunctionHealth {
  functionName: string;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
  errorRate: number;
  avgResponseTime: number;
  lastError?: string;
  successRate: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query edge function logs for the past hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: edgeLogs } = await supabase
      .from('function_edge_logs')
      .select('*')
      .gte('timestamp', oneHourAgo)
      .order('timestamp', { ascending: false });

    if (!edgeLogs) {
      return new Response(
        JSON.stringify({ error: 'No logs available' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group logs by function
    const functionStats = new Map<string, {
      totalCalls: number;
      errors: number;
      totalResponseTime: number;
      lastError?: string;
      lastErrorTime?: string;
    }>();

    edgeLogs.forEach((log: any) => {
      const functionId = log.metadata?.[0]?.function_id;
      const statusCode = log.metadata?.[0]?.response?.[0]?.status_code;
      const executionTime = log.metadata?.[0]?.execution_time_ms || 0;

      if (!functionId) return;

      if (!functionStats.has(functionId)) {
        functionStats.set(functionId, {
          totalCalls: 0,
          errors: 0,
          totalResponseTime: 0,
        });
      }

      const stats = functionStats.get(functionId)!;
      stats.totalCalls++;
      stats.totalResponseTime += executionTime;

      if (statusCode && statusCode >= 400) {
        stats.errors++;
        stats.lastError = log.event_message;
        stats.lastErrorTime = log.timestamp;
      }
    });

    // Calculate health metrics
    const healthReport: FunctionHealth[] = [];

    for (const [functionId, stats] of functionStats.entries()) {
      const errorRate = stats.errors / stats.totalCalls;
      const avgResponseTime = stats.totalResponseTime / stats.totalCalls;
      const successRate = 1 - errorRate;

      let status: 'healthy' | 'degraded' | 'down';
      if (errorRate > 0.5) {
        status = 'down';
      } else if (errorRate > 0.2 || avgResponseTime > 5000) {
        status = 'degraded';
      } else {
        status = 'healthy';
      }

      healthReport.push({
        functionName: functionId,
        status,
        lastCheck: new Date().toISOString(),
        errorRate: errorRate * 100,
        avgResponseTime,
        successRate: successRate * 100,
        lastError: stats.lastError,
      });
    }

    // Sort by status (down first, then degraded, then healthy)
    healthReport.sort((a, b) => {
      const statusOrder = { down: 0, degraded: 1, healthy: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    // Calculate overall system health
    const totalFunctions = healthReport.length;
    const healthyFunctions = healthReport.filter(f => f.status === 'healthy').length;
    const degradedFunctions = healthReport.filter(f => f.status === 'degraded').length;
    const downFunctions = healthReport.filter(f => f.status === 'down').length;

    const systemHealth = {
      overallStatus: downFunctions > 0 ? 'critical' : degradedFunctions > 3 ? 'degraded' : 'healthy',
      totalFunctions,
      healthyFunctions,
      degradedFunctions,
      downFunctions,
      healthPercentage: (healthyFunctions / totalFunctions) * 100,
      timestamp: new Date().toISOString(),
    };

    // Store health check results
    await supabase.from('edge_function_health').insert({
      check_timestamp: new Date().toISOString(),
      overall_status: systemHealth.overallStatus,
      total_functions: totalFunctions,
      healthy_count: healthyFunctions,
      degraded_count: degradedFunctions,
      down_count: downFunctions,
      health_report: healthReport,
    });

    return new Response(
      JSON.stringify({
        systemHealth,
        functions: healthReport,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Health monitor error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
