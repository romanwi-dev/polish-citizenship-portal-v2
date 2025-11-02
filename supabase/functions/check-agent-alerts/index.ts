// Check Agent Alerts - Notification triggers for AI Agent System
// Runs via cron to detect timeouts, failures, and high-usage scenarios

import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async () => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('[check-agent-alerts] Starting alert check...');

  const results = {
    approval_timeouts: 0,
    tool_failures: 0,
    long_running: 0,
    high_token_usage: 0,
    total_notifications: 0
  };

  try {
    // 1. Check for approval timeouts (pending > 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: timedOutApprovals } = await supabase
      .from('agent_approvals')
      .select('*')
      .eq('status', 'pending')
      .lt('requested_at', fiveMinutesAgo);

    if (timedOutApprovals && timedOutApprovals.length > 0) {
      console.log(`[check-agent-alerts] Found ${timedOutApprovals.length} timed-out approvals`);
      
      for (const approval of timedOutApprovals) {
        // Get admin users
        const { data: admins } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');

        // Create notifications for each admin
        if (admins) {
          for (const admin of admins) {
            await supabase.from('agent_notifications').insert({
              notification_type: 'approval_timeout',
              conversation_id: approval.conversation_id,
              recipient_user_id: admin.user_id,
              title: 'AI Agent Approval Timeout',
              message: `Tool "${approval.tool_name}" has been pending approval for over 5 minutes (Risk: ${approval.risk_level})`,
              severity: approval.risk_level === 'critical' || approval.risk_level === 'high' ? 'error' : 'warning',
              read: false
            });
            results.total_notifications++;
          }
        }
        results.approval_timeouts++;
      }
    }

    // 2. Check for recent tool failures (last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const { data: failedActivity } = await supabase
      .from('ai_agent_activity')
      .select('*')
      .eq('success', false)
      .gte('created_at', tenMinutesAgo)
      .limit(50);

    if (failedActivity && failedActivity.length > 0) {
      console.log(`[check-agent-alerts] Found ${failedActivity.length} recent failures`);
      
      // Group by case and notify
      const failuresByCaseUser = new Map<string, typeof failedActivity>();
      
      for (const activity of failedActivity) {
        const key = `${activity.case_id}_${activity.user_id}`;
        if (!failuresByCaseUser.has(key)) {
          failuresByCaseUser.set(key, []);
        }
        failuresByCaseUser.get(key)!.push(activity);
      }

      for (const [key, failures] of failuresByCaseUser) {
        const firstFailure = failures[0];
        
        await supabase.from('agent_notifications').insert({
          notification_type: 'tool_failed',
          conversation_id: firstFailure.conversation_id,
          recipient_user_id: firstFailure.user_id,
          title: 'AI Agent Tool Failures',
          message: `${failures.length} tool(s) failed in the last 10 minutes for case ${firstFailure.case_id}. Check logs for details.`,
          severity: 'error',
          read: false
        });
        results.total_notifications++;
        results.tool_failures += failures.length;
      }
    }

    // 3. Check for long-running conversations (processing > 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    
    const { data: longRunning } = await supabase
      .from('ai_conversations')
      .select('*')
      .in('status', ['processing', 'tools_executing'])
      .lt('updated_at', twoMinutesAgo);

    if (longRunning && longRunning.length > 0) {
      console.log(`[check-agent-alerts] Found ${longRunning.length} long-running conversations`);
      
      for (const conv of longRunning) {
        // Get the user who initiated (from activity log)
        const { data: activity } = await supabase
          .from('ai_agent_activity')
          .select('user_id')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (activity?.user_id) {
          await supabase.from('agent_notifications').insert({
            notification_type: 'long_running_agent',
            conversation_id: conv.id,
            recipient_user_id: activity.user_id,
            title: 'AI Agent Taking Longer Than Expected',
            message: `Agent "${conv.agent_type}" has been processing for over 2 minutes. It may have stalled.`,
            severity: 'warning',
            read: false
          });
          results.total_notifications++;
        }
        results.long_running++;
      }
    }

    // 4. Check for high token usage (last hour > 50k tokens per case)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: highTokenCases } = await supabase
      .rpc('get_high_token_usage_cases', { 
        since_timestamp: oneHourAgo,
        token_threshold: 50000 
      })
      .limit(10);

    if (highTokenCases && highTokenCases.length > 0) {
      console.log(`[check-agent-alerts] Found ${highTokenCases.length} high token usage cases`);
      
      for (const caseData of highTokenCases) {
        // Get admins for notification
        const { data: admins } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');

        if (admins) {
          for (const admin of admins) {
            await supabase.from('agent_notifications').insert({
              notification_type: 'high_token_usage',
              conversation_id: null,
              recipient_user_id: admin.user_id,
              title: 'High Token Usage Alert',
              message: `Case ${caseData.case_id} has used ${caseData.total_tokens} tokens in the last hour.`,
              severity: 'info',
              read: false
            });
            results.total_notifications++;
          }
        }
        results.high_token_usage++;
      }
    }

    console.log('[check-agent-alerts] Alert check complete:', results);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        timestamp: new Date().toISOString(),
        ...results 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[check-agent-alerts] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        partial_results: results
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
