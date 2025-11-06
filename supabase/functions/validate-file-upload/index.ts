import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_EXTENSIONS = [
  'pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp',
  'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'txt', 'md', 'csv', 'json', 'xml'
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    console.log(`[validate-file-upload] Validating file: ${file?.name || 'unknown'}`);

    if (!file) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'No file provided',
          errorCode: 'NO_FILE'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate file has content
    if (file.size === 0) {
      console.warn(`[validate-file-upload] Empty file rejected: ${file.name}`);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'File is empty',
          errorCode: 'EMPTY_FILE',
          fileName: file.name
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      console.warn(`[validate-file-upload] File too large: ${file.name} (${sizeMB}MB)`);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: `File size exceeds 20MB limit (${sizeMB}MB)`,
          errorCode: 'FILE_TOO_LARGE',
          fileName: file.name,
          fileSize: file.size
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate file extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      console.warn(`[validate-file-upload] Invalid extension: ${ext} for file ${file.name}`);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: `File type .${ext} not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
          errorCode: 'INVALID_EXTENSION',
          fileName: file.name,
          extension: ext
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[validate-file-upload] ✅ File validated: ${file.name} (${(file.size / 1024).toFixed(2)}KB) in ${duration}ms`);

    return new Response(
      JSON.stringify({ 
        valid: true, 
        fileName: file.name,
        fileSize: file.size,
        extension: ext,
        validationDuration: duration
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[validate-file-upload] ❌ Error:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: error instanceof Error ? error.message : 'Validation failed',
        errorCode: 'VALIDATION_ERROR',
        validationDuration: duration
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
