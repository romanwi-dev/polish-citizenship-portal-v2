import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { withRetry, RETRY_CONFIGS } from '../_shared/pdf-retry.ts';
import { performanceTracker } from '../_shared/performance-tracker.ts';
import { logEdgeFunctionCall } from '../_shared/monitoring.ts';
import { validateFile } from '../_shared/validation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let caseId = 'unknown';

  try {
    await logEdgeFunctionCall('upload-to-dropbox', 'start');
    console.log('[upload-to-dropbox] 🚀 Starting upload request');

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
    caseId = formData.get('caseId') as string;

    if (!file || !caseId) {
      console.error('[upload-to-dropbox] ❌ Missing file or caseId');
      throw new Error('Missing file or caseId');
    }

    // SECURITY: Re-validate file to prevent TOCTOU race condition
    // Files are validated client-side and in validate-file-upload, but we MUST re-validate here
    // to prevent an attacker from swapping the file between validation and upload
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      console.error('[upload-to-dropbox] ❌ File validation failed:', fileValidation.error);
      await logEdgeFunctionCall('upload-to-dropbox', 'error', {
        duration_ms: Date.now() - startTime,
        error_message: `File validation failed: ${fileValidation.error}`,
        case_id: caseId
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: fileValidation.error,
          errorCode: 'INVALID_FILE'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log(`[upload-to-dropbox] 📄 Processing upload for case ${caseId}: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);

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

    // Upload to Dropbox with retry logic and timeout
    console.log(`[upload-to-dropbox] ☁️ Uploading to Dropbox: ${dropboxFilePath}`);
    
    const dropboxResult = await performanceTracker.track('dropbox_upload', async () => {
      return await withRetry(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        try {
          const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
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
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('[upload-to-dropbox] ❌ Dropbox API error:', response.status, errorText);
            throw new Error(`Dropbox upload failed: ${response.status} - ${errorText}`);
          }

          return await response.json();
        } catch (error) {
          clearTimeout(timeoutId);
          if (error.name === 'AbortError') {
            console.error('[upload-to-dropbox] ⏱️ Dropbox upload timeout after 30s');
            throw new Error('Dropbox upload timeout after 30 seconds');
          }
          throw error;
        }
      }, RETRY_CONFIGS.STORAGE_UPLOAD, 'dropbox_upload');
    });

    console.log(`[upload-to-dropbox] ✅ Dropbox upload successful:`, dropboxResult.path_display);

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

    const totalDuration = Date.now() - startTime;
    await logEdgeFunctionCall('upload-to-dropbox', 'success', { duration_ms: totalDuration, case_id: caseId });
    
    console.log(`[upload-to-dropbox] ✨ Upload complete in ${totalDuration}ms`);
    console.log(`[upload-to-dropbox] Performance stats:`, performanceTracker.getReport());

    return new Response(
      JSON.stringify({
        success: true,
        document,
        dropbox_path: dropboxResult.path_display,
        performance: {
          total_duration_ms: totalDuration,
          stats: performanceTracker.getStats('dropbox_upload')
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await logEdgeFunctionCall('upload-to-dropbox', 'error', {
      duration_ms: totalDuration,
      error_message: errorMessage,
      case_id: caseId
    });

    console.error('[upload-to-dropbox] ❌ Upload error:', errorMessage);
    console.error('[upload-to-dropbox] Error details:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        duration_ms: totalDuration
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
