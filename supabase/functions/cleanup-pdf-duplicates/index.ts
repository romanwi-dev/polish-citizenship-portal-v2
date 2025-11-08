import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Delete the 5KB HTML duplicate files
    const duplicateFiles = [
      'CITIZENSHIP.pdf',
      'FAMILY-TREE.pdf',
      'TRANSCRIPTION.pdf'
    ];

    const results = [];
    
    for (const filename of duplicateFiles) {
      const { error } = await supabase.storage
        .from('pdf-templates')
        .remove([filename]);
      
      results.push({
        file: filename,
        success: !error,
        error: error?.message
      });
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
