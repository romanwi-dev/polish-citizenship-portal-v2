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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const caseId = formData.get('caseId') as string;

    if (!file || !caseId) {
      throw new Error('Missing file or caseId');
    }

    console.log(`Processing upload for case ${caseId}: ${file.name}`);

    // Get case details including Dropbox path
    const { data: caseData, error: caseError } = await supabaseClient
      .from('cases')
      .select('id, client_name, dropbox_path')
      .eq('id', caseId)
      .single();

    if (caseError) throw caseError;

    const dropboxPath = caseData.dropbox_path || `/CASES/${caseId}`;
    const dropboxFilePath = `${dropboxPath}/${file.name}`;

    console.log(`Uploading to Dropbox: ${dropboxFilePath}`);

    // Get Dropbox access token
    const dropboxAccessToken = Deno.env.get('DROPBOX_ACCESS_TOKEN');
    if (!dropboxAccessToken) {
      throw new Error('Dropbox access token not configured');
    }

    // Read file as ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

    // Upload to Dropbox
    const dropboxResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${dropboxAccessToken}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: dropboxFilePath,
          mode: 'add',
          autorename: true,
          mute: false,
        }),
      },
      body: fileBuffer,
    });

    if (!dropboxResponse.ok) {
      const errorText = await dropboxResponse.text();
      console.error('Dropbox upload error:', errorText);
      throw new Error(`Dropbox upload failed: ${errorText}`);
    }

    const dropboxResult = await dropboxResponse.json();
    console.log('Dropbox upload successful:', dropboxResult);

    // Also upload to Supabase Storage as backup
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const storagePath = `${caseId}/${fileName}`;

    const { error: storageError } = await supabaseClient.storage
      .from('documents')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (storageError) {
      console.error('Supabase storage error:', storageError);
      // Continue anyway since Dropbox upload succeeded
    }

    // Create document record
    const { data: document, error: dbError } = await supabaseClient
      .from('documents')
      .insert({
        case_id: caseId,
        name: file.name,
        dropbox_path: dropboxResult.path_display,
        file_extension: fileExt,
        file_size: file.size,
        ocr_status: 'pending',
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Log the upload action
    await supabaseClient
      .from('hac_logs')
      .insert({
        case_id: caseId,
        action_type: 'document_upload',
        action_description: `Document uploaded to Dropbox: ${file.name}`,
        field_changed: 'dropbox_path',
        new_value: dropboxResult.path_display,
      });

    return new Response(
      JSON.stringify({
        success: true,
        document,
        dropbox_path: dropboxResult.path_display,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
