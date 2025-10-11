import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MigrationChange {
  case_id: string;
  client_name: string;
  current_path: string;
  proposed_path: string;
  reason: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { dryRun = true, undo } = await req.json();

    console.log(`Migration scan started - dryRun: ${dryRun}, undo: ${undo}`);

    // Handle undo operation
    if (undo) {
      console.log(`Attempting to undo migration: ${undo}`);
      
      const { data: migrationLog, error: logError } = await supabase
        .from('migration_logs')
        .select('*')
        .eq('id', undo)
        .eq('can_undo', true)
        .is('undone_at', null)
        .single();

      if (logError || !migrationLog) {
        throw new Error('Migration not found or cannot be undone');
      }

      const changes = migrationLog.changes_made as MigrationChange[];
      
      // Reverse the changes
      for (const change of changes) {
        const { error: updateError } = await supabase
          .from('cases')
          .update({ dropbox_path: change.current_path })
          .eq('id', change.case_id);

        if (updateError) {
          console.error(`Failed to undo change for case ${change.case_id}:`, updateError);
        }
      }

      // Mark as undone
      const { error: undoError } = await supabase
        .from('migration_logs')
        .update({
          undone_at: new Date().toISOString(),
          undone_by: req.headers.get('authorization')?.split(' ')[1] // Get user from JWT
        })
        .eq('id', undo);

      if (undoError) {
        console.error('Failed to mark migration as undone:', undoError);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Migration undone successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all cases
    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .select('id, client_name, client_code, country, dropbox_path');

    if (casesError) {
      throw casesError;
    }

    console.log(`Found ${cases?.length || 0} cases to analyze`);

    const changes: MigrationChange[] = [];

    // Analyze each case for naming inconsistencies
    for (const caseItem of cases || []) {
      // Generate expected path based on hybrid naming scheme
      const sanitizedName = caseItem.client_name
        ?.replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50) || 'Unknown';

      const expectedPath = `/CASES/${caseItem.client_code || 'UNKNOWN'}_${sanitizedName}/`;

      // Check if current path matches expected
      if (caseItem.dropbox_path !== expectedPath) {
        changes.push({
          case_id: caseItem.id,
          client_name: caseItem.client_name || 'Unknown',
          current_path: caseItem.dropbox_path || 'Not set',
          proposed_path: expectedPath,
          reason: caseItem.dropbox_path 
            ? 'Path does not follow hybrid naming convention'
            : 'Path not set in database'
        });
      }
    }

    console.log(`Found ${changes.length} changes needed`);

    // If dry run, just return the plan
    if (dryRun) {
      return new Response(
        JSON.stringify({
          total_cases: cases?.length || 0,
          affected_cases: changes.length,
          changes
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Execute the migration
    console.log('Executing migration...');
    
    const migrationId = crypto.randomUUID();
    const executedBy = req.headers.get('authorization')?.split(' ')[1]; // Get user from JWT

    // Apply changes to database
    for (const change of changes) {
      const { error: updateError } = await supabase
        .from('cases')
        .update({ dropbox_path: change.proposed_path })
        .eq('id', change.case_id);

      if (updateError) {
        console.error(`Failed to update case ${change.case_id}:`, updateError);
      }
    }

    // Log the migration
    const { error: logError } = await supabase
      .from('migration_logs')
      .insert({
        id: migrationId,
        migration_type: 'dropbox_path_normalization',
        executed_by: executedBy,
        status: 'completed',
        changes_made: changes,
        can_undo: true,
        metadata: {
          total_cases: cases?.length || 0,
          affected_cases: changes.length
        }
      });

    if (logError) {
      console.error('Failed to log migration:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        migration_id: migrationId,
        changes_applied: changes.length,
        message: 'Migration completed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Migration scan error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
