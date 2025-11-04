import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateAccessToken } from "../_shared/dropbox-auth.ts";
import { createSecureResponse, getSecurityHeaders } from "../_shared/security-headers.ts";

serve(async (req) => {
  const origin = req.headers.get('Origin');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getSecurityHeaders(origin) });
  }

  try {
    const { dropboxPath } = await req.json();
    
    if (!dropboxPath) {
      throw new Error('Dropbox path is required');
    }

    // Normalize path: add /CASES/ prefix if missing
    let normalizedPath = dropboxPath;
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = '/' + normalizedPath;
    }
    if (!normalizedPath.startsWith('/CASES/')) {
      normalizedPath = '/CASES' + normalizedPath;
    }

    const dropboxAppKey = Deno.env.get('DROPBOX_APP_KEY');
    const dropboxAppSecret = Deno.env.get('DROPBOX_APP_SECRET');
    const dropboxRefreshToken = Deno.env.get('DROPBOX_REFRESH_TOKEN');

    if (!dropboxAppKey || !dropboxAppSecret || !dropboxRefreshToken) {
      throw new Error('Missing Dropbox credentials: DROPBOX_APP_KEY, DROPBOX_APP_SECRET, and DROPBOX_REFRESH_TOKEN required');
    }

    const accessToken = await generateAccessToken(dropboxAppKey, dropboxAppSecret, dropboxRefreshToken);
    
    console.log(`Downloading file from Dropbox: ${normalizedPath} (original: ${dropboxPath})`);

    // Download file from Dropbox
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
      throw new Error(`Dropbox download error: ${response.status}`);
    }

    const fileData = await response.arrayBuffer();
    const fileName = dropboxPath.split('/').pop() || 'document';
    
    // Get content type from file extension
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const contentTypeMap: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    const secureHeaders = getSecurityHeaders(origin);
    return new Response(fileData, {
      headers: {
        ...secureHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('Error downloading Dropbox file:', error);
    return createSecureResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500, origin);
  }
});