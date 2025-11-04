import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, dropboxPath } = await req.json();
    
    if (!dropboxPath) {
      throw new Error('Dropbox path is required');
    }

    const DROPBOX_ACCESS_TOKEN = Deno.env.get('DROPBOX_ACCESS_TOKEN');
    if (!DROPBOX_ACCESS_TOKEN) {
      throw new Error('Dropbox access token not configured');
    }

    console.log(`Fetching files from Dropbox path: ${dropboxPath}`);

    // List files in the Dropbox folder
    const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DROPBOX_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: dropboxPath,
        recursive: false,
        include_deleted: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dropbox API error:', errorText);
      throw new Error(`Dropbox API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Filter only files (not folders)
    const files = data.entries.filter((entry: any) => entry['.tag'] === 'file');

    // Sync with database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get existing documents for this case
    const { data: existingDocs } = await supabase
      .from('documents')
      .select('dropbox_file_id, dropbox_path')
      .eq('case_id', caseId);

    const existingFileIds = new Set(existingDocs?.map(d => d.dropbox_file_id) || []);

    // Insert new documents
    const newDocuments = files
      .filter((file: any) => !existingFileIds.has(file.id))
      .map((file: any) => ({
        case_id: caseId,
        name: file.name,
        type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        dropbox_path: file.path_display,
        dropbox_file_id: file.id,
        file_size: file.size,
        ocr_status: 'pending',
      }));

    if (newDocuments.length > 0) {
      const { error: insertError } = await supabase
        .from('documents')
        .insert(newDocuments);

      if (insertError) {
        console.error('Error inserting documents:', insertError);
      } else {
        console.log(`Synced ${newDocuments.length} new documents from Dropbox`);
      }
    }

    // Return all files
    return new Response(
      JSON.stringify({
        success: true,
        files: files.map((file: any) => ({
          id: file.id,
          name: file.name,
          path: file.path_display,
          size: file.size,
          modified: file.server_modified,
        })),
        synced: newDocuments.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error listing Dropbox documents:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});