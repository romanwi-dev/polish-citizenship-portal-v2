import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrchestratorRequest {
  task: string; // 'pdf_generate', 'ocr_process', 'translate', 'form_fill', 'security_scan', 'dropbox_sync'
  caseId: string;
  context?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface AgentMemory {
  agent_type: string;
  case_id: string;
  memory_key: string;
  memory_value: any;
  context_window?: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { task, caseId, context = {}, priority = 'medium' }: OrchestratorRequest = await req.json();

    console.log(`🎯 AI Orchestrator received task: ${task} for case ${caseId}`);

    // Load agent memory and project decisions
    const { data: memory } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: decisions } = await supabase
      .from('project_decisions')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    const { data: rules } = await supabase
      .from('workflow_rules')
      .select('*')
      .eq('workflow_type', task)
      .eq('is_active', true)
      .order('priority', { ascending: true });

    // Build enriched context from memory
    const enrichedContext = {
      ...context,
      agentMemory: memory || [],
      projectDecisions: decisions || [],
      workflowRules: rules || [],
      orchestratedAt: new Date().toISOString(),
      priority
    };

    // Route to appropriate agent based on task
    let agentFunction: string;
    let agentType: string;

    switch (task) {
      case 'pdf_generate':
        agentFunction = 'pdf-worker';
        agentType = 'pdf_generator';
        break;
      case 'ocr_process':
        agentFunction = 'ocr-universal';
        agentType = 'ocr_processor';
        break;
      case 'translate':
        agentFunction = 'translation-workflow';
        agentType = 'translation';
        break;
      case 'form_fill':
        agentFunction = 'apply-ocr-to-forms';
        agentType = 'form_filler';
        break;
      case 'security_scan':
        agentFunction = 'security-scan';
        agentType = 'security';
        break;
      case 'dropbox_sync':
        agentFunction = 'dropbox-sync';
        agentType = 'dropbox_sync';
        break;
      default:
        throw new Error(`Unknown task: ${task}`);
    }

    console.log(`🤖 Routing to agent: ${agentType} (${agentFunction})`);

    // Check if there's a crash state for recovery
    const { data: crashState } = await supabase
      .from('crash_states')
      .select('*')
      .eq('case_id', caseId)
      .eq('agent_type', agentType)
      .is('recovered_at', null)
      .single();

    if (crashState) {
      console.log(`🔄 Found crash state for ${agentType}, attempting recovery...`);
      enrichedContext.recoverFromCrash = true;
      enrichedContext.crashState = crashState;
    }

    // Execute the agent function
    const { data: agentResult, error: agentError } = await supabase.functions.invoke(
      agentFunction,
      {
        body: enrichedContext
      }
    );

    if (agentError) {
      console.error(`❌ Agent ${agentType} failed:`, agentError);

      // Store agent memory about the failure
      await supabase.from('agent_memory').insert({
        agent_type: agentType,
        case_id: caseId,
        memory_key: 'last_execution_failed',
        memory_value: {
          error: agentError.message,
          task,
          context: enrichedContext,
          timestamp: new Date().toISOString()
        }
      });

      // Create crash state if not exists
      await supabase.from('crash_states').upsert({
        case_id: caseId,
        agent_type: agentType,
        crash_data: {
          error: agentError.message,
          task,
          context: enrichedContext
        },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

      throw agentError;
    }

    console.log(`✅ Agent ${agentType} completed successfully`);

    // Store successful execution in agent memory
    await supabase.from('agent_memory').insert({
      agent_type: agentType,
      case_id: caseId,
      memory_key: 'last_execution_success',
      memory_value: {
        task,
        result: agentResult,
        timestamp: new Date().toISOString()
      },
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    });

    // Mark crash state as recovered if it exists
    if (crashState) {
      await supabase
        .from('crash_states')
        .update({ recovered_at: new Date().toISOString() })
        .eq('id', crashState.id);
    }

    // Update workflow rule success count
    if (rules && rules.length > 0) {
      for (const rule of rules) {
        await supabase
          .from('workflow_rules')
          .update({
            success_count: rule.success_count + 1,
            last_executed_at: new Date().toISOString()
          })
          .eq('id', rule.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        agent: agentType,
        task,
        result: agentResult,
        memoryStored: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ AI Orchestrator error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
