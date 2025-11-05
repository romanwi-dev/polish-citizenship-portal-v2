import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { generateAccessToken } from "../_shared/dropbox-auth.ts";
import { createSecureResponse, getSecurityHeaders } from "../_shared/security-headers.ts";

/**
 * Downloads file from Dropbox and returns it directly as blob/stream
 */

interface DownloadRequest {
  dropboxPath: string;
  caseId?: string;
}

serve(async (req) => {
  const origin = req.headers.get('Origin');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getSecurityHeaders(origin) });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createSecureResponse({ error: 'Missing authorization header' }, 401, origin);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return createSecureResponse({ error: 'Unauthorized' }, 401, origin);
    }

    // Parse request
    const { dropboxPath, caseId }: DownloadRequest = await req.json();
    
    if (!dropboxPath) {
      return createSecureResponse({ error: 'dropboxPath is required' }, 400, origin);
    }

    // Validate user has access to this case if provided
    if (caseId) {
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('id')
        .eq('id', caseId)
        .single();
      
      if (caseError || !caseData) {
        console.error('Case access error:', caseError);
        return createSecureResponse({ error: 'Access denied to case' }, 403, origin);
      }
    }

    // Normalize Dropbox path
    let normalizedPath = dropboxPath;
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = '/' + normalizedPath;
    }
    if (!normalizedPath.startsWith('/CASES/')) {
      normalizedPath = '/CASES' + normalizedPath;
    }

    // Get Dropbox credentials
    const dropboxAppKey = Deno.env.get('DROPBOX_APP_KEY');
    const dropboxAppSecret = Deno.env.get('DROPBOX_APP_SECRET');
    const dropboxRefreshToken = Deno.env.get('DROPBOX_REFRESH_TOKEN');

    if (!dropboxAppKey || !dropboxAppSecret || !dropboxRefreshToken) {
      console.error('Missing Dropbox credentials');
      return createSecureResponse({ error: 'Server configuration error' }, 500, origin);
    }

    const accessToken = await generateAccessToken(dropboxAppKey, dropboxAppSecret, dropboxRefreshToken);

    console.log(`[download-dropbox-file] Downloading: ${normalizedPath}`);

    // Download from Dropbox
    const response = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({ path: normalizedPath }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dropbox download error:', errorText);
      return createSecureResponse(
        { error: `Dropbox download failed: ${response.status}` },
        response.status,
        origin
      );
    }

    // Get file metadata from response headers
    const fileName = dropboxPath.split('/').pop() || 'document';
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    
    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    // Stream the file back to client
    const fileData = await response.arrayBuffer();
    
    console.log(`[download-dropbox-file] Success: ${fileName} (${fileData.byteLength} bytes)`);

    return new Response(fileData, {
      headers: {
        ...getSecurityHeaders(origin),
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('Error in download-dropbox-file:', error);
    return createSecureResponse({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500, origin);
  }
});
