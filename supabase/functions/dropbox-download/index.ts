import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { generateAccessToken } from "../_shared/dropbox-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Allow service role key for internal edge function calls (e.g., ocr-worker)
    const isServiceKey = token === supabaseKey;
    
    if (!isServiceKey) {
      // For user requests, verify JWT
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log('Internal service call authenticated');
    }

    const { file_path } = await req.json();

    if (!file_path) {
      return new Response(
        JSON.stringify({ error: 'Missing file_path parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Downloading file from Dropbox: ${file_path}`);

    const dropboxAppKey = Deno.env.get('DROPBOX_APP_KEY');
    const dropboxAppSecret = Deno.env.get('DROPBOX_APP_SECRET');
    const dropboxRefreshToken = Deno.env.get('DROPBOX_REFRESH_TOKEN');

    if (!dropboxAppKey || !dropboxAppSecret || !dropboxRefreshToken) {
      throw new Error('Missing Dropbox credentials: DROPBOX_APP_KEY, DROPBOX_APP_SECRET, and DROPBOX_REFRESH_TOKEN required');
    }

    // Generate fresh access token on-demand
    const accessToken = await generateAccessToken(dropboxAppKey, dropboxAppSecret, dropboxRefreshToken);

    // Download file from Dropbox (no retry needed - token is always valid)
    const downloadResponse = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({ path: file_path }),
      },
    });

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text();
      console.error(`Dropbox download failed: ${downloadResponse.status} ${errorText}`);
      
      return new Response(
        JSON.stringify({
          error: 'Failed to download file from Dropbox',
          details: errorText,
          status: downloadResponse.status,
        }),
        {
          status: downloadResponse.status === 404 ? 404 : 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get file data
    const fileData = await downloadResponse.arrayBuffer();
    
    // Get metadata from response headers
    const dropboxMetadata = downloadResponse.headers.get('Dropbox-API-Result');
    let fileName = 'download';
    let mimeType = 'application/octet-stream';

    if (dropboxMetadata) {
      try {
        const metadata = JSON.parse(dropboxMetadata);
        fileName = metadata.name || fileName;
        
        // Determine MIME type based on file extension
        const ext = fileName.split('.').pop()?.toLowerCase();
        const mimeTypes: Record<string, string> = {
          'pdf': 'application/pdf',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'xls': 'application/vnd.ms-excel',
          'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'txt': 'text/plain',
        };
        mimeType = mimeTypes[ext || ''] || mimeType;
      } catch (e) {
        console.error('Error parsing Dropbox metadata:', e);
      }
    }

    console.log(`Successfully downloaded file: ${fileName} (${fileData.byteLength} bytes)`);

    // Return file with appropriate headers for download
    return new Response(fileData, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileData.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Error in dropbox-download function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
