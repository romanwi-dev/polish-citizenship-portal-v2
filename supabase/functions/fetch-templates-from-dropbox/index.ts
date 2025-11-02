import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { generateAccessToken } from '../_shared/dropbox-auth.ts';

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
    
    // Get Dropbox credentials for token refresh
    const dropboxAppKey = Deno.env.get('DROPBOX_APP_KEY');
    const dropboxAppSecret = Deno.env.get('DROPBOX_APP_SECRET');
    const dropboxRefreshToken = Deno.env.get('DROPBOX_REFRESH_TOKEN');
    
    if (!dropboxAppKey || !dropboxAppSecret || !dropboxRefreshToken) {
      throw new Error('Missing Dropbox credentials: DROPBOX_APP_KEY, DROPBOX_APP_SECRET, and DROPBOX_REFRESH_TOKEN required');
    }

    // Generate fresh access token on-demand
    console.log('Generating fresh Dropbox access token...');
    const accessToken = await generateAccessToken(dropboxAppKey, dropboxAppSecret, dropboxRefreshToken);

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

    // Download file from Dropbox using fresh access token
    const downloadResponse = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
