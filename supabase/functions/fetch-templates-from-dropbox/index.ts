import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateType } = await req.json();
    
    const DROPBOX_ACCESS_TOKEN = Deno.env.get('DROPBOX_ACCESS_TOKEN');
    if (!DROPBOX_ACCESS_TOKEN) {
      throw new Error('Dropbox access token not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Map template types to Dropbox paths
    const dropboxPaths: Record<string, string> = {
      'poa-adult': '/# POA/new-POA-adult-8.pdf',
      'poa-minor': '/# POA/new-POA-minor-7.pdf',
      'poa-spouses': '/# POA/new-POA-spuses-8.pdf',
      'family-tree': '/# WORK/new-FAMILY_TREE-7.pdf',
      'citizenship': '/# WORK/new-CITIZENSHIP-2.pdf',
      'transcription': '/# WORK/new-TRANSCRIPTION.pdf',
    };

    const dropboxPath = dropboxPaths[templateType];
    if (!dropboxPath) {
      throw new Error(`Unknown template type: ${templateType}`);
    }

    console.log(`Fetching ${templateType} from Dropbox: ${dropboxPath}`);

    // Download file from Dropbox
    const downloadResponse = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DROPBOX_ACCESS_TOKEN}`,
        'Dropbox-API-Arg': JSON.stringify({ path: dropboxPath }),
      },
    });

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text();
      throw new Error(`Dropbox download failed: ${errorText}`);
    }

    const fileBlob = await downloadResponse.blob();
    const arrayBuffer = await fileBlob.arrayBuffer();

    // Upload to Supabase Storage
    const filename = `${templateType}.pdf`;
    const { error: uploadError } = await supabaseClient.storage
      .from('pdf-templates')
      .upload(filename, arrayBuffer, {
        upsert: true,
        contentType: 'application/pdf',
      });

    if (uploadError) {
      throw uploadError;
    }

    console.log(`Successfully uploaded ${filename} to storage`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        filename,
        message: `${templateType} uploaded from Dropbox` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
