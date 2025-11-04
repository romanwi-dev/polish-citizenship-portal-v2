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

    console.log('📦 Starting export of archived categories...');

    const archivedCategories = ['###FINISHED', '###FAILED', '###ON HOLD', '###BAD CASES', '###OTHER'];

    // Fetch all archived cases with related data
    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .select('*, documents(*), tasks(*), oby_forms(*), archive_searches(*)')
      .or(archivedCategories.map(cat => `dropbox_path.like./CASES/${cat}/%`).join(','));

    if (casesError) {
      throw new Error(`Failed to fetch archived cases: ${casesError.message}`);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backup = {
      exported_at: timestamp,
      total_cases: cases?.length || 0,
      total_documents: cases?.reduce((sum, c) => sum + (c.documents?.length || 0), 0) || 0,
      categories: archivedCategories,
      cases: cases || []
    };

    console.log(`✅ Exported ${backup.total_cases} cases and ${backup.total_documents} documents`);

    // Log to audit
    await supabase.from('security_audit_logs').insert({
      event_type: 'data_export',
      severity: 'info',
      action: 'export_archived_categories',
      details: {
        total_cases: backup.total_cases,
        total_documents: backup.total_documents,
        categories: archivedCategories
      },
      success: true
    });

    return new Response(
      JSON.stringify({
        success: true,
        backup,
        filename: `archived-categories-backup-${timestamp}.json`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
