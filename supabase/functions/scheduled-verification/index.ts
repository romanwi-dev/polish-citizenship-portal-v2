import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('⏰ Scheduled verification triggered');

    // Check if there's been a recent verification (within last 6 hours)
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    
    const { data: recentRuns } = await supabase
      .from('verification_runs')
      .select('id, created_at, verification_scope')
      .gte('created_at', sixHoursAgo)
      .eq('trigger_type', 'scheduled')
      .limit(1);

    if (recentRuns && recentRuns.length > 0) {
      console.log('⏭️ Skipping - verification already run recently');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Skipped - recent verification exists',
          last_run: recentRuns[0].created_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create scheduled verification run
    const { data: verificationRun, error: insertError } = await supabase
      .from('verification_runs')
      .insert({
        trigger_type: 'scheduled',
        trigger_metadata: {
          cron_time: new Date().toISOString(),
          schedule: 'every_6_hours'
        },
        verification_scope: 'full_portal',
        status: 'pending',
        branch: 'main'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create verification run:', insertError);
      throw insertError;
    }

    console.log(`✅ Scheduled verification run created: ${verificationRun.id}`);

    // Trigger async verification
    const functionUrl = `${supabaseUrl}/functions/v1/auto-verify-portal`;
    
    // Fire and forget - trigger verification asynchronously
    fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        verification_run_id: verificationRun.id,
        verification_scope: 'full_portal',
        changed_files: []
      })
    }).catch(err => {
      console.error('Failed to trigger auto-verification:', err);
    });

    return new Response(
      JSON.stringify({
        success: true,
        verification_run_id: verificationRun.id,
        message: 'Scheduled verification triggered'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scheduled verification error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
