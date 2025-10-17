import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const dropboxRefreshToken = Deno.env.get('DROPBOX_REFRESH_TOKEN');
    const dropboxAppKey = Deno.env.get('DROPBOX_APP_KEY');
    const dropboxAppSecret = Deno.env.get('DROPBOX_APP_SECRET');
    const dropboxAccessToken = Deno.env.get('DROPBOX_ACCESS_TOKEN');

    const diagnostics = {
      ok: true,
      same: true,
      checks: [] as any[],
      timestamp: new Date().toISOString()
    };

    // Check 1: Secrets configured
    const secretsCheck = {
      name: 'Secrets Configuration',
      status: 'pass',
      details: {} as any
    };

    if (!dropboxRefreshToken) {
      secretsCheck.status = 'fail';
      secretsCheck.details.refresh_token = 'Missing';
      diagnostics.ok = false;
    } else {
      secretsCheck.details.refresh_token = 'Configured';
    }

    if (!dropboxAppKey) {
      secretsCheck.status = 'fail';
      secretsCheck.details.app_key = 'Missing';
      diagnostics.ok = false;
    } else {
      secretsCheck.details.app_key = 'Configured';
    }

    if (!dropboxAppSecret) {
      secretsCheck.status = 'fail';
      secretsCheck.details.app_secret = 'Missing';
      diagnostics.ok = false;
    } else {
      secretsCheck.details.app_secret = 'Configured';
    }

    if (!dropboxAccessToken) {
      secretsCheck.status = 'warn';
      secretsCheck.details.access_token = 'Missing (will be auto-generated)';
    } else {
      secretsCheck.details.access_token = 'Configured';
    }

    diagnostics.checks.push(secretsCheck);

    // Check 2: Test Dropbox API connection
    if (dropboxAccessToken) {
      const connectionCheck = {
        name: 'Dropbox API Connection',
        status: 'pass',
        details: {} as any
      };

      try {
        const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${dropboxAccessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          connectionCheck.details.account_id = data.account_id;
          connectionCheck.details.email = data.email;
          connectionCheck.details.name = data.name?.display_name;
        } else {
          connectionCheck.status = 'fail';
          connectionCheck.details.error = `HTTP ${response.status}`;
          diagnostics.ok = false;
        }
      } catch (error: any) {
        connectionCheck.status = 'fail';
        connectionCheck.details.error = error.message;
        diagnostics.ok = false;
      }

      diagnostics.checks.push(connectionCheck);
    }

    // Check 3: Database sync status
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const dbCheck = {
      name: 'Database Sync Status',
      status: 'pass',
      details: {} as any
    };

    try {
      const { data: cases, error } = await supabase
        .from('cases')
        .select('id, dropbox_path, last_synced_at')
        .not('dropbox_path', 'is', null)
        .limit(10);

      if (error) throw error;

      dbCheck.details.total_cases_with_dropbox = cases?.length || 0;
      dbCheck.details.recently_synced = cases?.filter(c => {
        if (!c.last_synced_at) return false;
        const lastSync = new Date(c.last_synced_at);
        const hoursSince = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
        return hoursSince < 24;
      }).length || 0;

      // Check if all paths are consistent
      const pathsMatch = cases?.every(c => c.dropbox_path && c.dropbox_path.startsWith('/CASES/'));
      if (!pathsMatch) {
        dbCheck.status = 'warn';
        dbCheck.details.warning = 'Some paths may not follow naming convention';
        diagnostics.same = false;
      }
    } catch (error: any) {
      dbCheck.status = 'fail';
      dbCheck.details.error = error.message;
      diagnostics.ok = false;
    }

    diagnostics.checks.push(dbCheck);

    // Check 4: Sync logs
    const logsCheck = {
      name: 'Recent Sync Logs',
      status: 'pass',
      details: {} as any
    };

    try {
      const { data: logs, error } = await supabase
        .from('sync_logs')
        .select('*')
        .eq('sync_type', 'dropbox')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      logsCheck.details.recent_syncs = logs?.length || 0;
      logsCheck.details.last_sync = logs?.[0]?.created_at || 'Never';
      logsCheck.details.last_status = logs?.[0]?.status || 'Unknown';

      const failedRecently = logs?.some(l => l.status === 'error');
      if (failedRecently) {
        logsCheck.status = 'warn';
        logsCheck.details.warning = 'Recent sync failures detected';
      }
    } catch (error: any) {
      logsCheck.status = 'warn';
      logsCheck.details.warning = error.message;
    }

    diagnostics.checks.push(logsCheck);

    return new Response(
      JSON.stringify(diagnostics, null, 2),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error: any) {
    console.error('Diagnostics error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        same: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
