import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { generateAccessToken } from "../_shared/dropbox-auth.ts";
import { createSecureResponse, getSecurityHeaders } from "../_shared/security-headers.ts";

/**
 * Secure edge function that downloads from Dropbox and encodes to base64
 * Eliminates client-side token exposure by handling all auth server-side
 */

interface DownloadRequest {
  dropboxPath: string;
  documentId?: string;
  caseId?: string;
  returnUrl?: boolean; // Return signed Dropbox URL instead of base64
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
    const { dropboxPath, documentId, caseId, returnUrl }: DownloadRequest = await req.json();
    
    if (!dropboxPath) {
      return createSecureResponse({ error: 'dropboxPath is required' }, 400, origin);
    }

    // If returnUrl is requested, generate temporary link instead
    if (returnUrl) {
      const dropboxAppKey = Deno.env.get('DROPBOX_APP_KEY');
      const dropboxAppSecret = Deno.env.get('DROPBOX_APP_SECRET');
      const dropboxRefreshToken = Deno.env.get('DROPBOX_REFRESH_TOKEN');

      if (!dropboxAppKey || !dropboxAppSecret || !dropboxRefreshToken) {
        console.error('Missing Dropbox credentials');
        return createSecureResponse({ error: 'Server configuration error' }, 500, origin);
      }

      const accessToken = await generateAccessToken(dropboxAppKey, dropboxAppSecret, dropboxRefreshToken);

      // Normalize Dropbox path
      let normalizedPath = dropboxPath;
      if (!normalizedPath.startsWith('/')) {
        normalizedPath = '/' + normalizedPath;
      }
      if (!normalizedPath.startsWith('/CASES/')) {
        normalizedPath = '/CASES' + normalizedPath;
      }

      // Get temporary link from Dropbox
      const linkResponse = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: normalizedPath }),
      });

      if (!linkResponse.ok) {
        const errorText = await linkResponse.text();
        console.error('Dropbox temp link error:', errorText);
        return createSecureResponse(
          { error: `Failed to get temp link: ${linkResponse.status}` },
          linkResponse.status,
          origin
        );
      }

      const linkData = await linkResponse.json();
      
      console.log(`[download-and-encode] Temp link generated for: ${normalizedPath}`);

      return createSecureResponse({
        success: true,
        signedUrl: linkData.link,
        fileName: dropboxPath.split('/').pop() || 'document',
      }, 200, origin);
    }

    // Validate user has access to this case
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

    // Get Dropbox credentials (server-side only)
    const dropboxAppKey = Deno.env.get('DROPBOX_APP_KEY');
    const dropboxAppSecret = Deno.env.get('DROPBOX_APP_SECRET');
    const dropboxRefreshToken = Deno.env.get('DROPBOX_REFRESH_TOKEN');

    if (!dropboxAppKey || !dropboxAppSecret || !dropboxRefreshToken) {
      console.error('Missing Dropbox credentials');
      return createSecureResponse({ error: 'Server configuration error' }, 500, origin);
    }

    const accessToken = await generateAccessToken(dropboxAppKey, dropboxAppSecret, dropboxRefreshToken);

    console.log(`[download-and-encode] Downloading: ${normalizedPath}`);

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

    // Get file metadata first
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

    // Validate file format for OCR-able files
    const ocrFormats = ['pdf', 'jpg', 'jpeg', 'png', 'gif'];
    if (!ocrFormats.includes(ext)) {
      console.warn(`[download-and-encode] Unsupported format: ${ext}`);
      return createSecureResponse({
        error: `Unsupported file format: ${ext}. Supported: ${ocrFormats.join(', ')}`,
      }, 400, origin);
    }

    // Download and validate size
    const fileData = await response.arrayBuffer();
    const fileSizeBytes = fileData.byteLength;
    const fileSizeMB = fileSizeBytes / (1024 * 1024);
    
    // Reject files over 5MB (AI service limit)
    if (fileSizeMB > 5) {
      console.error(`[download-and-encode] File too large: ${fileSizeMB.toFixed(2)}MB (max 5MB)`);
      return createSecureResponse({
        error: `File too large: ${fileSizeMB.toFixed(2)}MB. Maximum size is 5MB.`,
        fileName,
        size: fileSizeBytes,
      }, 413, origin);
    }

    // Convert to base64 with proper data URL prefix
    const uint8Array = new Uint8Array(fileData);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Data = btoa(binaryString);
    
    // Add proper data URL prefix for AI service
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    console.log(`[download-and-encode] Success: ${fileName} (${fileSizeMB.toFixed(2)}MB, ${mimeType})`);

    return createSecureResponse({
      success: true,
      base64: dataUrl, // Return full data URL with prefix
      fileName,
      mimeType,
      size: fileSizeBytes,
    }, 200, origin);

  } catch (error) {
    console.error('Error in download-and-encode:', error);
    return createSecureResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500, origin);
  }
});
