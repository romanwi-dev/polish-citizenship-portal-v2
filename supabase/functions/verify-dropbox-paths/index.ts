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
      verified: [] as any[],
      duplicates: [] as any[]
    };

    // Phase 3: Detect duplicate paths
    const pathMap = new Map<string, any[]>();
    for (const doc of documents || []) {
      if (doc.dropbox_path) {
        const normalized = doc.dropbox_path.toLowerCase().trim();
        if (!pathMap.has(normalized)) {
          pathMap.set(normalized, []);
        }
        pathMap.get(normalized)!.push(doc);
      }
    }

    // Extract duplicates
    for (const [path, docs] of pathMap.entries()) {
      if (docs.length > 1) {
        results.duplicates.push({
          path: path,
          count: docs.length,
          documents: docs.map(d => ({ id: d.id, name: d.name, case_id: d.case_id }))
        });
      }
    }

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

      // Check for suspicious patterns
      if (path.includes('//') || path.includes('\\')) {
        results.invalid.push({
          id: doc.id,
          name: doc.name,
          path: path,
          reason: 'Path contains invalid characters (double slashes or backslashes)'
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

    console.log(`✅ Phase 3 Verification complete:`);
    console.log(`  • Valid: ${results.valid}`);
    console.log(`  • Invalid: ${results.invalid.length}`);
    console.log(`  • Missing: ${results.missing.length}`);
    console.log(`  • Duplicates: ${results.duplicates.length} (${results.duplicates.reduce((sum, d) => sum + d.count, 0)} total docs)`);

    return createSecureResponse({
      success: true,
      results,
      summary: {
        total: results.total,
        valid: results.valid,
        invalid: results.invalid.length,
        missing: results.missing.length,
        duplicates: results.duplicates.length,
        duplicateDocCount: results.duplicates.reduce((sum: number, d: any) => sum + d.count, 0),
        verificationRate: `${((results.valid / results.total) * 100).toFixed(1)}%`,
        integrityScore: `${(((results.valid - results.duplicates.reduce((sum: number, d: any) => sum + d.count - 1, 0)) / results.total) * 100).toFixed(1)}%`
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
