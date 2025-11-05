import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateAccessToken } from "../_shared/dropbox-auth.ts";
import { createSecureResponse, getSecurityHeaders } from "../_shared/security-headers.ts";

interface FixResult {
  id: string;
  name: string;
  oldPath: string;
  newPath?: string;
  status: 'fixed' | 'not_found' | 'error';
  error?: string;
}

serve(async (req) => {
  const origin = req.headers.get('Origin');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getSecurityHeaders(origin) });
  }

  try {
    const { documentIds } = await req.json();
    
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      throw new Error('Document IDs array is required');
    }

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

    console.log(`Attempting to fix ${documentIds.length} documents...`);

    // Get documents from database
    const { data: documents, error: dbError } = await supabase
      .from('documents')
      .select('id, name, dropbox_path, case_id')
      .in('id', documentIds);

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    const results: FixResult[] = [];
    let fixed = 0;
    let notFound = 0;
    let errors = 0;

    for (const doc of documents || []) {
      try {
        console.log(`Searching for: ${doc.name}`);
        
        // Search Dropbox for the file by name
        const searchResponse = await fetch('https://api.dropboxapi.com/2/files/search_v2', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: doc.name,
            options: {
              path: '/CASES',
              max_results: 5,
              file_status: 'active',
              filename_only: true
            }
          }),
        });

        if (!searchResponse.ok) {
          throw new Error(`Dropbox search failed: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();
        const matches = searchData.matches || [];

        if (matches.length === 0) {
          results.push({
            id: doc.id,
            name: doc.name,
            oldPath: doc.dropbox_path,
            status: 'not_found',
            error: 'No matching files found in Dropbox'
          });
          notFound++;
        } else {
          // Take the first match (best match)
          const newPath = matches[0].metadata.metadata.path_display;
          
          // Update the database
          const { error: updateError } = await supabase
            .from('documents')
            .update({ 
              dropbox_path: newPath,
              ocr_status: 'pending' // Reset OCR status for re-processing
            })
            .eq('id', doc.id);

          if (updateError) {
            throw new Error(`Failed to update database: ${updateError.message}`);
          }

          results.push({
            id: doc.id,
            name: doc.name,
            oldPath: doc.dropbox_path,
            newPath: newPath,
            status: 'fixed'
          });
          fixed++;
          
          console.log(`Fixed: ${doc.name} -> ${newPath}`);
        }
      } catch (error) {
        results.push({
          id: doc.id,
          name: doc.name,
          oldPath: doc.dropbox_path,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        errors++;
        console.error(`Error fixing ${doc.name}:`, error);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    console.log(`Fix complete: ${fixed} fixed, ${notFound} not found, ${errors} errors`);

    return createSecureResponse({
      success: true,
      results,
      summary: {
        total: documentIds.length,
        fixed,
        notFound,
        errors,
        fixRate: `${((fixed / documentIds.length) * 100).toFixed(1)}%`
      }
    }, 200, origin);

  } catch (error) {
    console.error('Error fixing Dropbox paths:', error);
    return createSecureResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500, origin);
  }
});
