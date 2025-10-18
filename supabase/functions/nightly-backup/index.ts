import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BackupManifest {
  backup_date: string;
  total_cases: number;
  total_files: number;
  total_size_mb: number;
  dropbox_sync_status: string;
  cases_included: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting nightly backup...');

    // 1. Get all active cases
    const { data: cases, error: casesError } = await supabaseClient
      .from('cases')
      .select('id, client_code, client_name, dropbox_path')
      .not('status', 'in', '(\"failed\",\"finished\")');

    if (casesError) throw casesError;

    console.log(`Found ${cases?.length || 0} active cases`);

    // 2. Invoke Dropbox sync to create backup
    const backupDate = new Date().toISOString().split('T')[0];
    const backupPath = `/BACKUPS/${backupDate}_backup.zip`;

    const { data: dropboxResult, error: dropboxError } = await supabaseClient.functions.invoke(
      'dropbox-sync',
      {
        body: {
          action: 'create_backup',
          backup_path: backupPath,
          cases: cases || []
        }
      }
    );

    if (dropboxError) {
      console.error('Dropbox backup error:', dropboxError);
      throw dropboxError;
    }

    console.log('Dropbox backup created:', dropboxResult);

    // 3. Create manifest
    const manifest: BackupManifest = {
      backup_date: new Date().toISOString(),
      total_cases: cases?.length || 0,
      total_files: dropboxResult?.file_count || 0,
      total_size_mb: dropboxResult?.total_size_mb || 0,
      dropbox_sync_status: dropboxResult?.status || 'ok',
      cases_included: cases?.map(c => c.client_code || c.client_name) || []
    };

    // 4. Log backup to database
    const { error: logError } = await supabaseClient
      .from('backup_logs')
      .insert({
        backup_date: new Date().toISOString(),
        backup_path: backupPath,
        total_cases: manifest.total_cases,
        total_files: manifest.total_files,
        total_size_mb: manifest.total_size_mb,
        status: 'completed',
        error_message: null
      });

    if (logError) {
      console.error('Failed to log backup:', logError);
    }

    // 5. Clean up old backups (keep 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error: cleanupError } = await supabaseClient
      .from('backup_logs')
      .delete()
      .lt('backup_date', thirtyDaysAgo.toISOString());

    if (cleanupError) {
      console.error('Failed to cleanup old backups:', cleanupError);
    }

    console.log('Backup completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        manifest,
        backup_path: backupPath
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Backup failed:', error);

    // Log failure to database
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabaseClient
        .from('backup_logs')
        .insert({
          backup_date: new Date().toISOString(),
          backup_path: '/BACKUPS/failed',
          total_cases: 0,
          total_files: 0,
          total_size_mb: 0,
          status: 'failed',
          error_message: error.message || 'Unknown error'
        });
    } catch (logErr) {
      console.error('Failed to log backup failure:', logErr);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
