import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssignTranslatorRequest {
  requestId: string;
  translatorId: string;
  estimatedDays?: number;
  deadline?: string;
  estimatedCostPln?: number;
  internalNotes?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      requestId,
      translatorId,
      estimatedDays,
      deadline,
      estimatedCostPln,
      internalNotes
    }: AssignTranslatorRequest = await req.json();

    if (!requestId || !translatorId) {
      return new Response(
        JSON.stringify({ error: 'requestId and translatorId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update translation request with assignment
    const { data: updatedRequest, error: updateError } = await supabase
      .from('translation_requests')
      .update({
        assigned_translator_id: translatorId,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
        estimated_days: estimatedDays,
        deadline: deadline,
        estimated_cost_pln: estimatedCostPln,
        internal_notes: internalNotes,
      })
      .eq('id', requestId)
      .select(`
        *,
        documents (
          name,
          ai_generated_name,
          person_type,
          type
        ),
        cases (
          client_name,
          client_code
        ),
        sworn_translators (
          full_name,
          email
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating translation request:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to assign translator', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Translation request assigned:', {
      requestId,
      translatorId,
      translator: updatedRequest.sworn_translators?.full_name
    });

    return new Response(
      JSON.stringify({
        success: true,
        request: updatedRequest,
        message: `Assigned to ${updatedRequest.sworn_translators?.full_name}`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
