import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { dryRun = true } = await req.json();

    console.log(`[cleanup-orphan-cases] Starting ${dryRun ? 'dry run' : 'execution'}...`);

    // Find all cases that don't have valid dropbox_path from the 7 categories
    const { data: orphanCases, error: queryError } = await supabase
      .from('cases')
      .select('id, client_name, client_code, dropbox_path, status, created_at')
      .or(
        `dropbox_path.is.null,` +
        `and(` +
          `dropbox_path.not.like./CASES/POTENTIAL/%,` +
          `dropbox_path.not.like./CASES/VIP+/%,` +
          `dropbox_path.not.like./CASES/VIP/%,` +
          `dropbox_path.not.like./CASES/CITIZENS-X/%,` +
          `dropbox_path.not.like./CASES/GLOBAL-P/%,` +
          `dropbox_path.not.like./CASES/FOURTH/%,` +
          `dropbox_path.not.like./CASES/FIFTH/%` +
        `)`
      )
      .order('created_at', { ascending: false });

    if (queryError) {
      throw new Error(`Failed to query orphan cases: ${queryError.message}`);
    }

    const orphanCount = orphanCases?.length || 0;
    console.log(`[cleanup-orphan-cases] Found ${orphanCount} orphan cases`);

    // Dry run mode - return preview
    if (dryRun) {
      return new Response(
        JSON.stringify({
          success: true,
          mode: 'dry_run',
          orphan_count: orphanCount,
          cases_to_delete: orphanCases?.map(c => ({
            id: c.id,
            name: c.client_name,
            code: c.client_code,
            dropbox_path: c.dropbox_path,
            status: c.status,
            created_at: c.created_at
          })) || [],
          message: `Preview: ${orphanCount} cases would be deleted`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Execution mode - delete orphan cases
    if (orphanCount === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          mode: 'execution',
          deleted_count: 0,
          message: 'No orphan cases to delete'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const caseIds = orphanCases!.map(c => c.id);
    
    console.log(`[cleanup-orphan-cases] Deleting ${orphanCount} orphan cases...`);

    // Delete cases (CASCADE will handle related data)
    const { error: deleteError } = await supabase
      .from('cases')
      .delete()
      .in('id', caseIds);

    if (deleteError) {
      throw new Error(`Failed to delete orphan cases: ${deleteError.message}`);
    }

    console.log(`[cleanup-orphan-cases] Successfully deleted ${orphanCount} orphan cases`);

    // Log to security audit logs
    await supabase.from('security_audit_logs').insert({
      event_type: 'database_cleanup',
      severity: 'info',
      action: 'cleanup_orphan_cases',
      details: {
        deleted_count: orphanCount,
        case_ids: caseIds,
        deleted_cases: orphanCases?.map(c => ({
          id: c.id,
          name: c.client_name,
          code: c.client_code,
          dropbox_path: c.dropbox_path
        }))
      },
      success: true
    });

    return new Response(
      JSON.stringify({
        success: true,
        mode: 'execution',
        deleted_count: orphanCount,
        deleted_cases: orphanCases?.map(c => ({
          id: c.id,
          name: c.client_name,
          code: c.client_code
        })),
        message: `Successfully deleted ${orphanCount} orphan cases`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[cleanup-orphan-cases] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
