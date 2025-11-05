import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealingAction {
  functionName: string;
  action: string;
  result: 'success' | 'failed';
  details: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Auto-heal: Starting health check and recovery process...');

    // Get latest health report
    const { data: healthCheck } = await supabase
      .from('edge_function_health')
      .select('*')
      .order('check_timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!healthCheck || !healthCheck.health_report) {
      // Run health check first
      await fetch(`${supabaseUrl}/functions/v1/health-monitor`, {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });

      return new Response(
        JSON.stringify({ message: 'Health check initiated, retry in 1 minute' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const healingActions: HealingAction[] = [];
    const healthReport = healthCheck.health_report as any[];

    // Identify functions that need healing
    const downFunctions = healthReport.filter((f: any) => f.status === 'down');
    const degradedFunctions = healthReport.filter((f: any) => f.status === 'degraded');

    console.log(`Found ${downFunctions.length} down functions and ${degradedFunctions.length} degraded functions`);

    // Auto-healing strategies
    for (const func of downFunctions) {
      console.log(`Auto-healing: ${func.functionName}`);

      // Strategy 1: Clear error state and retry
      if (func.functionName.includes('ocr')) {
        // Reset failed OCR documents to queued
        const { data: failedDocs } = await supabase
          .from('documents')
          .select('id')
          .eq('ocr_status', 'failed')
          .lte('ocr_retry_count', 1) // Only retry documents with low retry count
          .limit(10);

        if (failedDocs && failedDocs.length > 0) {
          await supabase
            .from('documents')
            .update({ 
              ocr_status: 'queued',
              ocr_retry_count: 0,
            })
            .in('id', failedDocs.map(d => d.id));

          healingActions.push({
            functionName: func.functionName,
            action: 'reset_failed_ocr_documents',
            result: 'success',
            details: `Reset ${failedDocs.length} failed OCR documents to queued`,
          });
        }
      }

      // Strategy 2: Clear rate limiting if applicable
      if (func.lastError?.includes('rate limit')) {
        await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
        healingActions.push({
          functionName: func.functionName,
          action: 'wait_for_rate_limit_reset',
          result: 'success',
          details: 'Waited for rate limit cooldown',
        });
      }

      // Strategy 3: Restart worker if stuck
      if (func.functionName.includes('worker')) {
        try {
          await fetch(`${supabaseUrl}/functions/v1/${func.functionName}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'health_check' }),
          });

          healingActions.push({
            functionName: func.functionName,
            action: 'restart_worker',
            result: 'success',
            details: 'Worker restarted successfully',
          });
        } catch (error) {
          healingActions.push({
            functionName: func.functionName,
            action: 'restart_worker',
            result: 'failed',
            details: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    // Log healing actions
    await supabase.from('edge_function_healing_log').insert(
      healingActions.map(action => ({
        function_name: action.functionName,
        healing_action: action.action,
        result: action.result,
        details: action.details,
        performed_at: new Date().toISOString(),
      }))
    );

    // Send alert if critical functions are still down
    const criticalFunctionsDown = downFunctions.filter((f: any) => 
      f.functionName.includes('ocr') || 
      f.functionName.includes('dropbox') ||
      f.functionName.includes('generate-poa')
    );

    if (criticalFunctionsDown.length > 0) {
      console.error('CRITICAL ALERT: Essential functions are down!');
      console.error(criticalFunctionsDown);
      
      // TODO: Send notification to admin
    }

    return new Response(
      JSON.stringify({
        success: true,
        healingActions,
        downFunctions: downFunctions.length,
        degradedFunctions: degradedFunctions.length,
        criticalAlerts: criticalFunctionsDown.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Auto-heal error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
