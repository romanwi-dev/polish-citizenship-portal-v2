import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Magic number signatures for file type validation
const MAGIC_NUMBERS: Record<string, Uint8Array> = {
  'pdf': new Uint8Array([0x25, 0x50, 0x44, 0x46]), // %PDF
  'jpeg': new Uint8Array([0xFF, 0xD8, 0xFF]),
  'png': new Uint8Array([0x89, 0x50, 0x4E, 0x47]),
  'gif': new Uint8Array([0x47, 0x49, 0x46]),
  'webp': new Uint8Array([0x52, 0x49, 0x46, 0x46]),
};

function checkMagicNumber(bytes: Uint8Array): string | null {
  for (const [type, signature] of Object.entries(MAGIC_NUMBERS)) {
    if (bytes.length >= signature.length) {
      const matches = signature.every((byte, index) => bytes[index] === byte);
      if (matches) return type;
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ valid: false, error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Size validation
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          details: { size: file.size, maxSize: MAX_FILE_SIZE }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: `File type ${file.type} not allowed`,
          details: { mimeType: file.type, allowedTypes: ALLOWED_MIME_TYPES }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Magic number validation (first 8 bytes)
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer.slice(0, 8));
    const detectedType = checkMagicNumber(bytes);

    if (!detectedType) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'File content does not match expected format (magic number validation failed)',
          details: { mimeType: file.type, magicBytes: Array.from(bytes.slice(0, 4)) }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Cross-check MIME type with magic number
    const mimeToMagic: Record<string, string> = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpeg',
      'image/jpg': 'jpeg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
    };

    const expectedMagic = mimeToMagic[file.type];
    if (expectedMagic && expectedMagic !== detectedType) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'File extension does not match file content',
          details: { 
            declaredType: file.type, 
            detectedType,
            advice: 'File may be corrupted or renamed'
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // All validations passed
    return new Response(
      JSON.stringify({
        valid: true,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          detectedType
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown validation error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
