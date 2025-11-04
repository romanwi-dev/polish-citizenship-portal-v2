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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { dryRun = true, categories = [] } = await req.json();

    console.log(`🗑️  ${dryRun ? 'DRY RUN' : 'DELETING'} archived categories:`, categories);

    // Validate categories start with ###
    const invalidCategories = categories.filter((cat: string) => !cat.startsWith('###'));
    if (invalidCategories.length > 0) {
      throw new Error(`Invalid categories (must start with ###): ${invalidCategories.join(', ')}`);
    }

    // Build query for archived cases
    const pathPatterns = categories.map((cat: string) => `dropbox_path.like./CASES/${cat}/%`);
    
    // Fetch cases to delete
    const { data: casesToDelete, error: fetchError } = await supabase
      .from('cases')
      .select('id, client_name, client_code, dropbox_path')
      .or(pathPatterns.join(','));

    if (fetchError) {
      throw new Error(`Failed to fetch cases: ${fetchError.message}`);
    }

    const caseIds = casesToDelete?.map(c => c.id) || [];

    // Count related records
    const { count: documentsCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .in('case_id', caseIds);

    const { count: tasksCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .in('case_id', caseIds);

    const preview = {
      cases: casesToDelete?.length || 0,
      documents: documentsCount || 0,
      tasks: tasksCount || 0,
      caseIds: caseIds,
      affectedCases: casesToDelete || []
    };

    if (dryRun) {
      console.log('📋 Dry run preview:', preview);
      return new Response(
        JSON.stringify({
          success: true,
          dryRun: true,
          preview
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Execute deletion in correct order (respect foreign keys)
    console.log('🗑️  Deleting documents...');
    const { error: docsError } = await supabase
      .from('documents')
      .delete()
      .in('case_id', caseIds);

    if (docsError) throw new Error(`Failed to delete documents: ${docsError.message}`);

    console.log('🗑️  Deleting tasks...');
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .in('case_id', caseIds);

    if (tasksError) throw new Error(`Failed to delete tasks: ${tasksError.message}`);

    console.log('🗑️  Deleting OBY forms...');
    await supabase.from('oby_forms').delete().in('case_id', caseIds);

    console.log('🗑️  Deleting archive searches...');
    await supabase.from('archive_searches').delete().in('case_id', caseIds);

    console.log('🗑️  Deleting workflow instances...');
    await supabase.from('workflow_instances').delete().in('case_id', caseIds);

    console.log('🗑️  Deleting cases...');
    const { error: casesError } = await supabase
      .from('cases')
      .delete()
      .in('id', caseIds);

    if (casesError) throw new Error(`Failed to delete cases: ${casesError.message}`);

    // Log to audit
    await supabase.from('security_audit_logs').insert({
      event_type: 'data_deletion',
      severity: 'critical',
      action: 'delete_archived_categories',
      details: {
        categories,
        cases_deleted: preview.cases,
        documents_deleted: preview.documents,
        tasks_deleted: preview.tasks
      },
      success: true
    });

    console.log('✅ Deletion complete!');

    return new Response(
      JSON.stringify({
        success: true,
        deleted: preview
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Deletion error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
