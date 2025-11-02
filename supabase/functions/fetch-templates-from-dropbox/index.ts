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

    // Map template types to Dropbox paths (all templates now in /POA folder)
    const dropboxPaths: Record<string, string> = {
      'poa-adult': '/POA/new-POA-adult.pdf',
      'poa-minor': '/POA/new-POA-minor.pdf',
      'poa-spouses': '/POA/new-POA-spouses.pdf',
      'family-tree': '/POA/new-FAMILY_TREE.pdf',
      'citizenship': '/POA/new-CITIZENSHIP.pdf',
      'transcription': '/POA/new-TRANSCRIPTION.pdf',
    };

    const dropboxPath = dropboxPaths[templateType];
    if (!dropboxPath) {
      throw new Error(`Unknown template type: ${templateType}`);
    }

    console.log(`Fetching ${templateType} from Dropbox: ${dropboxPath}`);

    // DEBUG: List files in /POA folder to verify structure
    console.log('DEBUG: Listing files in /POA/ folder...');
    try {
      const listResponse = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: '/POA' }),
      });
      
      if (listResponse.ok) {
        const listData = await listResponse.json();
        console.log('Files in /POA/:', JSON.stringify(listData.entries.map((e: any) => ({ name: e.name, path: e.path_display })), null, 2));
      } else {
        console.log('Failed to list /POA/ folder:', await listResponse.text());
      }
    } catch (listError) {
      console.log('Error listing /POA/ folder:', listError);
    }


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
