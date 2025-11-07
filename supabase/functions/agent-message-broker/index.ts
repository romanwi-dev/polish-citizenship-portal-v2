/**
 * Agent Message Broker
 * Central coordination service for agent-to-agent communication
 * Processes message queue and facilitates workflow coordination
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[agent-message-broker] Starting message processing cycle...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const stats = {
      messages_processed: 0,
      workflows_triggered: 0,
      coordination_actions: 0,
      alerts_sent: 0,
      errors: 0,
    };

    // Get all pending messages
    const { data: messages, error } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('agent_type', 'agent_messenger')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('[agent-message-broker] Failed to fetch messages:', error);
      throw error;
    }

    // Process messages by priority
    const pendingMessages = messages
      ?.map((m: any) => ({ ...m.data, db_id: m.id }))
      .filter((msg: any) => msg.status === 'pending') || [];

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    pendingMessages.sort((a: any, b: any) => 
      priorityOrder[a.priority as keyof typeof priorityOrder] - 
      priorityOrder[b.priority as keyof typeof priorityOrder]
    );

    for (const message of pendingMessages) {
      try {
        await processMessage(supabase, message, stats);
        stats.messages_processed++;

        // Mark as delivered
        await supabase
          .from('agent_memory')
          .update({
            data: {
              ...message,
              status: 'delivered',
              delivered_at: new Date().toISOString(),
            },
          })
          .eq('id', message.db_id);
      } catch (error) {
        console.error(`[agent-message-broker] Error processing message ${message.db_id}:`, error);
        stats.errors++;

        // Mark as failed
        await supabase
          .from('agent_memory')
          .update({
            data: {
              ...message,
              status: 'failed',
              error_message: String(error),
            },
          })
          .eq('id', message.db_id);
      }
    }

    // Log broker activity
    await supabase.from('ai_agent_activity').insert({
      agent_type: 'agent_message_broker',
      activity_type: 'message_processing',
      case_id: null,
      metadata: stats,
      status: stats.errors > 0 ? 'completed_with_errors' : 'success',
    });

    console.log('[agent-message-broker] Processing complete:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[agent-message-broker] Error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function processMessage(supabase: any, message: any, stats: any) {
  console.log(`[agent-message-broker] Processing ${message.message_type} message from ${message.from_agent} to ${message.to_agent}`);

  switch (message.message_type) {
    case 'trigger':
      await handleWorkflowTrigger(supabase, message);
      stats.workflows_triggered++;
      break;

    case 'alert':
      await handleAlert(supabase, message);
      stats.alerts_sent++;
      break;

    case 'coordination':
      await handleCoordination(supabase, message);
      stats.coordination_actions++;
      break;

    case 'request':
      await handleRequest(supabase, message);
      break;

    case 'insight':
      await handleInsight(supabase, message);
      break;

    case 'response':
      await handleResponse(supabase, message);
      break;
  }
}

async function handleWorkflowTrigger(supabase: any, message: any) {
  const { action, parameters, reason } = message.body;

  console.log(`[agent-message-broker] Triggering workflow: ${action} on ${message.to_agent}`);

  // Invoke the target agent/function
  try {
    const { error } = await supabase.functions.invoke(message.to_agent, {
      body: {
        triggered_by: message.from_agent,
        action,
        parameters,
        reason,
        case_id: message.metadata?.case_id,
        priority: message.priority,
      },
    });

    if (error) {
      console.error(`[agent-message-broker] Failed to trigger ${message.to_agent}:`, error);
    } else {
      console.log(`[agent-message-broker] Successfully triggered ${message.to_agent}`);
    }
  } catch (error) {
    console.error(`[agent-message-broker] Error invoking ${message.to_agent}:`, error);
  }

  // Log the trigger
  await supabase.from('hac_logs').insert({
    case_id: message.metadata?.case_id,
    action_type: 'agent_workflow_trigger',
    action_description: `${message.from_agent} triggered ${action} on ${message.to_agent}: ${reason}`,
    field_changed: 'workflow_state',
    new_value: action,
  });
}

async function handleAlert(supabase: any, message: any) {
  console.log(`[agent-message-broker] Broadcasting alert: ${message.subject}`);

  // Send notification to admins
  const { data: adminRole } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin')
    .limit(1)
    .single();

  if (adminRole?.user_id) {
    await supabase.from('workflow_notifications').insert({
      notification_type: 'agent_alert',
      severity: message.priority === 'critical' ? 'critical' : 'warning',
      recipient_user_id: adminRole.user_id,
      title: message.subject,
      message: `Alert from ${message.from_agent}: ${JSON.stringify(message.body).substring(0, 200)}`,
      metadata: {
        from_agent: message.from_agent,
        alert_type: message.metadata?.alert_type,
        case_id: message.metadata?.case_id,
        full_body: message.body,
      },
      sent_at: new Date().toISOString(),
    });
  }
}

async function handleCoordination(supabase: any, message: any) {
  console.log(`[agent-message-broker] Coordinating action: ${message.subject}`);

  // Log coordination activity
  await supabase.from('hac_logs').insert({
    case_id: message.metadata?.case_id,
    action_type: 'agent_coordination',
    action_description: `${message.from_agent} coordinating with ${message.metadata?.participating_agents?.join(', ')}: ${message.subject}`,
    field_changed: 'coordination_state',
    new_value: message.metadata?.coordination_type,
  });
}

async function handleRequest(supabase: any, message: any) {
  console.log(`[agent-message-broker] Processing assistance request: ${message.subject}`);

  // Try to invoke the target agent
  try {
    const { data, error } = await supabase.functions.invoke(message.to_agent, {
      body: {
        request_type: message.metadata?.request_type,
        request_data: message.body,
        from_agent: message.from_agent,
        case_id: message.metadata?.case_id,
        correlation_id: message.metadata?.correlation_id,
      },
    });

    if (!error && data) {
      // Send automatic response
      await supabase.from('agent_memory').insert({
        agent_type: 'agent_messenger',
        memory_key: `msg_${Date.now()}_response`,
        data: {
          from_agent: message.to_agent,
          to_agent: message.from_agent,
          message_type: 'response',
          priority: 'high',
          subject: 'Response to your request',
          body: { success: true, data },
          metadata: {
            reply_to: message.db_id,
            correlation_id: message.metadata?.correlation_id,
          },
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error(`[agent-message-broker] Error handling request:`, error);
  }
}

async function handleInsight(supabase: any, message: any) {
  console.log(`[agent-message-broker] Sharing insight: ${message.subject}`);

  // Store insight for target agent to retrieve
  if (message.to_agent !== 'broadcast') {
    await supabase.from('agent_memory').insert({
      agent_type: message.to_agent,
      memory_key: `insight_${message.metadata?.insight_type}_${Date.now()}`,
      data: {
        from_agent: message.from_agent,
        insight_type: message.metadata?.insight_type,
        insight_data: message.body,
        case_id: message.metadata?.case_id,
        shared_at: new Date().toISOString(),
      },
    });
  }
}

async function handleResponse(supabase: any, message: any) {
  console.log(`[agent-message-broker] Delivering response to ${message.to_agent}`);
  // Response is delivered via the message queue, target agent will poll for it
}
