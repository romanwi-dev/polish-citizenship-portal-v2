/**
 * Agent Health Monitor
 * Monitors all AI agents for schedule adherence, failure rates, and anomalies
 * Provides auto-recovery and admin notifications
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentSchedule {
  name: string;
  type: string;
  schedule_minutes: number; // How often it should run
  critical: boolean;
}

// Define all monitored agents and their schedules
const MONITORED_AGENTS: AgentSchedule[] = [
  { name: 'edge-function-agent', type: 'edge_function_monitor', schedule_minutes: 5, critical: true },
  { name: 'project-memory-agent', type: 'project_analysis', schedule_minutes: 10, critical: true },
  { name: 'pdf-generation-agent', type: 'pdf_monitor', schedule_minutes: 30, critical: true },
  { name: 'subagent-supervisor', type: 'agent_coordination', schedule_minutes: 15, critical: true },
  { name: 'workflow-memory-agent', type: 'workflow_analysis', schedule_minutes: 20, critical: false },
  { name: 'uiux-memory-agent', type: 'ui_analysis', schedule_minutes: 25, critical: false },
  { name: 'dropbox-memory-agent', type: 'dropbox_sync_analysis', schedule_minutes: 20, critical: false },
  { name: 'forms-memory-agent', type: 'form_analysis', schedule_minutes: 30, critical: false },
  { name: 'ai-documents-memory-agent', type: 'document_workflow_analysis', schedule_minutes: 20, critical: false },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[agent-health-monitor] Starting health monitoring cycle...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const healthReport = {
      timestamp: new Date().toISOString(),
      agents_checked: 0,
      agents_healthy: 0,
      agents_warning: 0,
      agents_failed: 0,
      recovery_attempts: 0,
      notifications_sent: 0,
      details: [] as any[],
    };

    // Get admin user for notifications
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    const adminUserId = adminRole?.user_id;

    for (const agent of MONITORED_AGENTS) {
      healthReport.agents_checked++;

      // Check last run time
      const { data: lastRun } = await supabase
        .from('agent_memory')
        .select('created_at, data')
        .eq('agent_type', agent.type)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const now = new Date();
      const expectedInterval = agent.schedule_minutes * 60 * 1000;
      const maxDelay = expectedInterval * 2; // Allow 2x the schedule as tolerance

      let status = 'healthy';
      let issue = '';
      let needsRecovery = false;

      if (!lastRun) {
        status = 'failed';
        issue = 'Agent has never run';
        needsRecovery = true;
      } else {
        const lastRunTime = new Date(lastRun.created_at);
        const timeSinceLastRun = now.getTime() - lastRunTime.getTime();

        if (timeSinceLastRun > maxDelay) {
          status = agent.critical ? 'failed' : 'warning';
          issue = `Agent hasn't run in ${Math.round(timeSinceLastRun / 60000)} minutes (expected every ${agent.schedule_minutes} minutes)`;
          needsRecovery = true;
        }

        // Check for failure patterns in recent runs
        const { data: recentRuns } = await supabase
          .from('agent_memory')
          .select('data')
          .eq('agent_type', agent.type)
          .order('created_at', { ascending: false })
          .limit(10);

        if (recentRuns && recentRuns.length >= 3) {
          const errors = recentRuns.filter(run => run.data?.error || run.data?.status === 'error');
          const errorRate = errors.length / recentRuns.length;

          if (errorRate > 0.5) {
            status = 'failed';
            issue = issue ? `${issue}; High error rate: ${(errorRate * 100).toFixed(0)}%` : `High error rate: ${(errorRate * 100).toFixed(0)}%`;
            needsRecovery = true;
          } else if (errorRate > 0.3) {
            status = status === 'healthy' ? 'warning' : status;
            issue = issue ? `${issue}; Elevated error rate: ${(errorRate * 100).toFixed(0)}%` : `Elevated error rate: ${(errorRate * 100).toFixed(0)}%`;
          }
        }

        // Check for anomalous results (e.g., data size changes)
        if (recentRuns && recentRuns.length >= 5) {
          const dataSizes = recentRuns.map(run => JSON.stringify(run.data || {}).length);
          const avgSize = dataSizes.reduce((a, b) => a + b, 0) / dataSizes.length;
          const latestSize = dataSizes[0];

          if (latestSize < avgSize * 0.3) {
            status = status === 'healthy' ? 'warning' : status;
            issue = issue ? `${issue}; Anomalous data size (${latestSize} vs avg ${Math.round(avgSize)})` : `Anomalous data size`;
          }
        }
      }

      if (status === 'healthy') {
        healthReport.agents_healthy++;
      } else if (status === 'warning') {
        healthReport.agents_warning++;
      } else {
        healthReport.agents_failed++;
      }

      healthReport.details.push({
        agent: agent.name,
        status,
        issue,
        critical: agent.critical,
        last_run: lastRun?.created_at || null,
      });

      // Attempt recovery for failed agents
      if (needsRecovery) {
        console.log(`[agent-health-monitor] Attempting recovery for ${agent.name}...`);

        try {
          // Trigger the agent function
          const { error } = await supabase.functions.invoke(agent.name, {
            body: { triggered_by: 'health_monitor', recovery_attempt: true }
          });

          if (!error) {
            healthReport.recovery_attempts++;
            console.log(`[agent-health-monitor] Recovery triggered for ${agent.name}`);

            // Log successful recovery attempt
            await supabase.from('hac_logs').insert({
              action_type: 'agent_recovery',
              action_description: `Auto-recovery triggered for ${agent.name}`,
              field_changed: 'agent_status',
              old_value: status,
              new_value: 'recovery_triggered',
            });
          } else {
            console.error(`[agent-health-monitor] Recovery failed for ${agent.name}:`, error);
          }
        } catch (error) {
          console.error(`[agent-health-monitor] Recovery error for ${agent.name}:`, error);
        }

        // Send notification for critical failures
        if (agent.critical && status === 'failed' && adminUserId) {
          try {
            await supabase.from('workflow_notifications').insert({
              notification_type: 'agent_failure',
              severity: 'critical',
              recipient_user_id: adminUserId,
              title: `Critical Agent Failure: ${agent.name}`,
              message: `Agent ${agent.name} has failed. Issue: ${issue}. Recovery attempt initiated.`,
              metadata: {
                agent_name: agent.name,
                agent_type: agent.type,
                issue,
                status,
                recovery_attempted: true,
              },
              sent_at: new Date().toISOString(),
            });

            healthReport.notifications_sent++;
          } catch (error) {
            console.error('[agent-health-monitor] Failed to send notification:', error);
          }
        }
      }
    }

    // Store health report
    await supabase.from('agent_memory').insert({
      agent_type: 'agent_health_monitor',
      memory_key: `health_report_${Date.now()}`,
      data: healthReport,
    });

    // Log activity
    await supabase.from('ai_agent_activity').insert({
      agent_type: 'agent_health_monitor',
      activity_type: 'health_check',
      case_id: null,
      metadata: {
        agents_checked: healthReport.agents_checked,
        agents_healthy: healthReport.agents_healthy,
        agents_warning: healthReport.agents_warning,
        agents_failed: healthReport.agents_failed,
        recovery_attempts: healthReport.recovery_attempts,
      },
      status: healthReport.agents_failed > 0 ? 'completed_with_issues' : 'success',
    });

    console.log('[agent-health-monitor] Health check complete:', {
      checked: healthReport.agents_checked,
      healthy: healthReport.agents_healthy,
      warning: healthReport.agents_warning,
      failed: healthReport.agents_failed,
      recoveries: healthReport.recovery_attempts,
      notifications: healthReport.notifications_sent,
    });

    return new Response(JSON.stringify(healthReport), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[agent-health-monitor] Error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
