import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { file_path } = await req.json();

    if (!file_path) {
      return new Response(
        JSON.stringify({ error: 'Missing file_path parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Downloading file from Dropbox: ${file_path}`);

    let dropboxToken = Deno.env.get('DROPBOX_ACCESS_TOKEN');
    if (!dropboxToken) {
      throw new Error('DROPBOX_ACCESS_TOKEN not configured');
    }

    // Download file from Dropbox with retry logic
    let downloadResponse: Response | null = null;
    let lastError = '';
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        downloadResponse = await fetch('https://content.dropboxapi.com/2/files/download', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${dropboxToken}`,
            'Dropbox-API-Arg': JSON.stringify({ path: file_path }),
          },
        });

        if (downloadResponse.ok) {
          break; // Success
        }

        // Handle token refresh on 401
        if (downloadResponse.status === 401 && attempt < 3) {
          console.log('Token expired, attempting refresh...');
          const refreshToken = Deno.env.get('DROPBOX_REFRESH_TOKEN');
          const appKey = Deno.env.get('DROPBOX_APP_KEY');
          const appSecret = Deno.env.get('DROPBOX_APP_SECRET');
          
          if (refreshToken && appKey && appSecret) {
            const tokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: appKey,
                client_secret: appSecret,
              }),
            });
            
            if (tokenResponse.ok) {
              const tokenData = await tokenResponse.json();
              dropboxToken = tokenData.access_token;
              console.log('Token refreshed successfully');
              continue; // Retry with new token
            }
          }
        }

        lastError = await downloadResponse.text();
        console.error(`Dropbox download attempt ${attempt}/3 failed:`, downloadResponse.status, lastError);

        // Exponential backoff for retries (1s, 2s)
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Network error';
        console.error(`Dropbox download attempt ${attempt}/3 error:`, lastError);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    if (!downloadResponse || !downloadResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to download file from Dropbox after 3 attempts', 
          details: lastError,
          status: downloadResponse?.status || 500
        }),
        { status: downloadResponse?.status || 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
