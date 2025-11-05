import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateAccessToken } from "../_shared/dropbox-auth.ts";
import { createSecureResponse, getSecurityHeaders } from "../_shared/security-headers.ts";

serve(async (req) => {
  const origin = req.headers.get('Origin');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getSecurityHeaders(origin) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const dropboxAppKey = Deno.env.get('DROPBOX_APP_KEY');
    const dropboxAppSecret = Deno.env.get('DROPBOX_APP_SECRET');
    const dropboxRefreshToken = Deno.env.get('DROPBOX_REFRESH_TOKEN');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    if (!dropboxAppKey || !dropboxAppSecret || !dropboxRefreshToken) {
      throw new Error('Missing Dropbox credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const accessToken = await generateAccessToken(dropboxAppKey, dropboxAppSecret, dropboxRefreshToken);

    console.log('Fetching documents from database...');
    
    // Get all documents with dropbox paths
    const { data: documents, error: dbError } = await supabase
      .from('documents')
      .select('id, name, dropbox_path, case_id')
      .not('dropbox_path', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log(`Checking ${documents?.length || 0} documents...`);

    const results = {
      total: documents?.length || 0,
      invalid: [] as any[],
      valid: 0,
      missing: [] as any[],
      verified: [] as any[]
    };

    for (const doc of documents || []) {
      const path = doc.dropbox_path;
      
      // Check for invalid paths
      if (!path || path === '/' || path === '.' || !path.includes('.')) {
        results.invalid.push({
          id: doc.id,
          name: doc.name,
          path: path,
          reason: 'Invalid path format (no extension or empty)'
        });
        continue;
      }

      // Try to get metadata from Dropbox
      try {
        const metadataResponse = await fetch('https://api.dropboxapi.com/2/files/get_metadata', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: path }),
        });

        if (metadataResponse.ok) {
          results.verified.push({
            id: doc.id,
            name: doc.name,
            path: path
          });
          results.valid++;
        } else {
          const error = await metadataResponse.json();
          results.missing.push({
            id: doc.id,
            name: doc.name,
            path: path,
            error: error.error_summary || 'Unknown error'
          });
        }
      } catch (error) {
        results.missing.push({
          id: doc.id,
          name: doc.name,
          path: path,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Rate limiting: wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Verification complete: ${results.valid} valid, ${results.invalid.length} invalid, ${results.missing.length} missing`);

    return createSecureResponse({
      success: true,
      results,
      summary: {
        total: results.total,
        valid: results.valid,
        invalid: results.invalid.length,
        missing: results.missing.length,
        verificationRate: `${((results.valid / results.total) * 100).toFixed(1)}%`
      }
    }, 200, origin);

  } catch (error) {
    console.error('Error verifying Dropbox paths:', error);
    return createSecureResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500, origin);
  }
});
