import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { generateAccessToken } from "../_shared/dropbox-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sanitize Dropbox path for special characters and format issues
function sanitizeDropboxPath(path: string): string {
  let sanitized = path.trim();
  
  // Handle special characters
  sanitized = sanitized.replace(/'/g, "'"); // Smart quotes to straight
  sanitized = sanitized.replace(/"/g, '"'); // Smart quotes to straight
  sanitized = sanitized.replace(/'/g, "'"); // Another smart quote variant
  
  // Ensure leading slash
  if (!sanitized.startsWith('/')) {
    sanitized = '/' + sanitized;
  }
  
  // Remove double slashes
  sanitized = sanitized.replace(/\/\//g, '/');
  
  return sanitized;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`[dropbox-download-${requestId}] Request received`);

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

    const body = await req.json();
    const rawFilePath = body.file_path || body.dropboxPath; // Support both parameter names
    
    if (!rawFilePath) {
      console.error(`[dropbox-download-${requestId}] ❌ No file path provided`);
      return new Response(
        JSON.stringify({ error: 'Missing file_path or dropboxPath parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Sanitize the path
    const filePath = sanitizeDropboxPath(rawFilePath);
    console.log(`[dropbox-download-${requestId}] Original path: ${rawFilePath}`);
    if (filePath !== rawFilePath) {
      console.log(`[dropbox-download-${requestId}] Sanitized path: ${filePath}`);
    }

    const dropboxAppKey = Deno.env.get('DROPBOX_APP_KEY');
    const dropboxAppSecret = Deno.env.get('DROPBOX_APP_SECRET');
    const dropboxRefreshToken = Deno.env.get('DROPBOX_REFRESH_TOKEN');

    if (!dropboxAppKey || !dropboxAppSecret || !dropboxRefreshToken) {
      throw new Error('Missing Dropbox credentials: DROPBOX_APP_KEY, DROPBOX_APP_SECRET, and DROPBOX_REFRESH_TOKEN required');
    }

    // Generate fresh access token on-demand
    console.log(`[dropbox-download-${requestId}] Generating Dropbox access token...`);
    const accessToken = await generateAccessToken(dropboxAppKey, dropboxAppSecret, dropboxRefreshToken);
    console.log(`[dropbox-download-${requestId}] ✅ Access token generated`);

    // Download file from Dropbox (no retry needed - token is always valid)
    console.log(`[dropbox-download-${requestId}] Downloading from Dropbox API...`);
    const downloadResponse = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({ path: filePath }),
      },
    });

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text();
      console.error(`[dropbox-download-${requestId}] ❌ Dropbox API error: ${downloadResponse.status}`);
      console.error(`[dropbox-download-${requestId}] Original path: ${rawFilePath}`);
      console.error(`[dropbox-download-${requestId}] Sanitized path: ${filePath}`);
      console.error(`[dropbox-download-${requestId}] Error details: ${errorText}`);
      
      // Provide detailed error for path issues
      const errorDetails = downloadResponse.status === 404 
        ? `File not found at path: ${filePath}. Original path: ${rawFilePath}`
        : errorText;
      
      return new Response(
        JSON.stringify({
          error: 'Failed to download file from Dropbox',
          details: errorDetails,
          status: downloadResponse.status,
          originalPath: rawFilePath,
          sanitizedPath: filePath,
          pathMismatch: rawFilePath !== filePath,
        }),
        {
          status: downloadResponse.status === 404 ? 404 : 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log(`[dropbox-download-${requestId}] ✅ File downloaded successfully`);

    // Get file data
    const fileData = await downloadResponse.arrayBuffer();
    console.log(`[dropbox-download-${requestId}] File size: ${fileData.byteLength} bytes`);
    
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`[dropbox-download-${requestId}] ❌ Fatal error:`, errorMessage);
    console.error(`[dropbox-download-${requestId}] Stack:`, error instanceof Error ? error.stack : 'No stack');
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        requestId,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
