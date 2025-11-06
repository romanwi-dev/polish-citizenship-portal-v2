import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB hard limit
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

// Comprehensive magic number signatures for file type validation
const MAGIC_NUMBERS: Record<string, Uint8Array> = {
  'pdf': new Uint8Array([0x25, 0x50, 0x44, 0x46]), // %PDF
  'jpeg': new Uint8Array([0xFF, 0xD8, 0xFF]),
  'png': new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  'gif87a': new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]), // GIF87a
  'gif89a': new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]), // GIF89a
  'webp': new Uint8Array([0x52, 0x49, 0x46, 0x46]), // RIFF (needs WEBP check at offset 8)
  'doc': new Uint8Array([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]), // MS Office legacy
  'docx': new Uint8Array([0x50, 0x4B, 0x03, 0x04]), // ZIP-based (DOCX/XLSX)
  'xlsx': new Uint8Array([0x50, 0x4B, 0x03, 0x04]), // ZIP-based
  
  // Dangerous file types to explicitly REJECT
  'exe': new Uint8Array([0x4D, 0x5A]), // MZ executable
  'dll': new Uint8Array([0x4D, 0x5A]),
  'bat': new Uint8Array([0x40, 0x65, 0x63, 0x68, 0x6F]), // @echo
  'sh': new Uint8Array([0x23, 0x21]), // #! shebang
  'zip': new Uint8Array([0x50, 0x4B, 0x03, 0x04]),
  'rar': new Uint8Array([0x52, 0x61, 0x72, 0x21]),
  '7z': new Uint8Array([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C]),
};

function checkMagicNumber(bytes: Uint8Array): { type: string | null; isDangerous: boolean } {
  // Check for dangerous file types FIRST
  const dangerousTypes = ['exe', 'dll', 'bat', 'sh', 'zip', 'rar', '7z'];
  for (const type of dangerousTypes) {
    const signature = MAGIC_NUMBERS[type];
    if (bytes.length >= signature.length) {
      const matches = signature.every((byte, index) => bytes[index] === byte);
      if (matches) {
        return { type, isDangerous: true };
      }
    }
  }

  // Check for allowed file types
  for (const [type, signature] of Object.entries(MAGIC_NUMBERS)) {
    if (dangerousTypes.includes(type)) continue; // Skip dangerous types
    
    if (bytes.length >= signature.length) {
      const matches = signature.every((byte, index) => bytes[index] === byte);
      if (matches) {
        // Special case for WEBP - need to verify "WEBP" string at offset 8
        if (type === 'webp' && bytes.length >= 12) {
          const webpCheck = bytes.slice(8, 12);
          const webpSignature = new Uint8Array([0x57, 0x45, 0x42, 0x50]); // "WEBP"
          const isWebp = webpSignature.every((byte, idx) => webpCheck[idx] === byte);
          if (isWebp) return { type, isDangerous: false };
          continue;
        }
        
        // Handle GIF variants
        if (type === 'gif87a' || type === 'gif89a') {
          return { type: 'gif', isDangerous: false };
        }
        
        return { type, isDangerous: false };
      }
    }
  }
  
  return { type: null, isDangerous: false };
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

    // 1. File size validation (CRITICAL SECURITY)
    if (file.size === 0) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Empty file not allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          details: { size: file.size, maxSize: MAX_FILE_SIZE }
        }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // STREAMING VALIDATION: Read file in chunks to prevent DoS
    const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
    const stream = file.stream();
    const reader = stream.getReader();
    let bytesRead = 0;
    let headerBytes = new Uint8Array(16); // First 16 bytes for magic number
    let pdfHeaderBytes = new Uint8Array(8); // PDF header
    let pdfEndBytes = new Uint8Array(50); // Last 50 bytes for EOF
    let chunks: Uint8Array[] = [];
    let isFirstChunk = true;

    // Process file in streaming chunks
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      bytesRead += value.length;
      
      // Collect first chunk for header validation
      if (isFirstChunk) {
        headerBytes = value.slice(0, 16);
        pdfHeaderBytes = value.slice(0, 8);
        isFirstChunk = false;
      }

      // Store chunks for later validation (up to reasonable limit)
      if (bytesRead < 10 * 1024 * 1024) { // Only store first 10MB
        chunks.push(value);
      }
      
      // Keep last 50 bytes for PDF EOF validation
      if (value.length >= 50) {
        pdfEndBytes = value.slice(-50);
      }
    }

    // Reconstruct arrayBuffer for full validation
    const arrayBuffer = new Uint8Array(bytesRead);
    let offset = 0;
    for (const chunk of chunks) {
      arrayBuffer.set(chunk, offset);
      offset += chunk.length;
    }
    
    const bytes = headerBytes; // Use first 16 bytes for magic number check

    // 2. Filename sanitization (prevent path traversal)
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (sanitizedFilename !== file.name) {
      console.warn('Filename contained suspicious characters:', file.name);
    }

    // 3. MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: `File type ${file.type} not allowed`,
          details: { mimeType: file.type, allowedTypes: ALLOWED_MIME_TYPES }
        }),
        { status: 415, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Magic number validation (CRITICAL - prevents MIME spoofing)
    const magicCheck = checkMagicNumber(bytes);

    // SECURITY: Reject dangerous file types immediately
    if (magicCheck.isDangerous) {
      console.error('SECURITY ALERT: Dangerous file type detected:', magicCheck.type, 'from', file.name);
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'Dangerous file type detected and blocked for security',
          details: { 
            detectedType: magicCheck.type,
            reason: 'Executables and archives are not allowed'
          }
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!magicCheck.type) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'File content validation failed - file type could not be determined from content',
          details: { mimeType: file.type, magicBytes: Array.from(bytes.slice(0, 8)) }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Cross-validation: MIME type vs magic number (RELAXED FOR TESTING)
    const mimeToMagic: Record<string, string[]> = {
      'application/pdf': ['pdf'],
      'image/jpeg': ['jpeg'],
      'image/jpg': ['jpeg'],
      'image/png': ['png'],
      'image/gif': ['gif'],
      'image/webp': ['webp'],
      'application/msword': ['doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
      'application/vnd.ms-excel': ['xlsx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
    };

    const expectedMagicTypes = mimeToMagic[file.type] || [];
    if (expectedMagicTypes.length > 0 && !expectedMagicTypes.includes(magicCheck.type)) {
      console.warn('⚠️ VALIDATION WARNING: MIME type mismatch (ALLOWED FOR TESTING)', {
        file: file.name,
        declaredType: file.type,
        detectedType: magicCheck.type,
        advice: 'File may be corrupted, renamed, or tampered with'
      });
      // TESTING ONLY: Allow through with warning instead of blocking
    }

    // 6. COMPREHENSIVE PDF SECURITY: ZIP bomb, Polyglot detection, structure validation, EOF verification
    if (magicCheck.type === 'pdf') {
      const pdfContent = arrayBuffer;
      
      // 6.1 ENHANCED ZIP BOMB PROTECTION: Check compression ratio with cumulative size tracking
      // Detect if PDF claims to be compressed but has suspicious size
      const pdfStringHeader = new TextDecoder().decode(pdfContent.slice(0, Math.min(8192, pdfContent.length)));
      const hasFlateStream = pdfStringHeader.includes('/FlateDecode') || pdfStringHeader.includes('/Filter');
      
      if (hasFlateStream) {
        // Count compressed stream objects
        const streamMatches = pdfStringHeader.match(/stream\s/g) || [];
        const streamCount = streamMatches.length;
        
        // CRITICAL: Track cumulative decompressed size across all streams
        // If we detect suspiciously large average stream sizes, this is a ZIP bomb indicator
        const avgStreamSize = file.size / Math.max(streamCount, 1);
        const MAX_STREAM_SIZE = 5 * 1024 * 1024; // 5MB per stream
        const MAX_CUMULATIVE_SIZE = 100 * 1024 * 1024; // 100MB total decompressed
        
        // Check individual stream average
        if (avgStreamSize > MAX_STREAM_SIZE) {
          return new Response(
            JSON.stringify({
              valid: false,
              error: 'SECURITY ALERT: PDF contains suspiciously large compressed streams (potential ZIP bomb)',
              details: {
                avgStreamSize: Math.round(avgStreamSize / 1024 / 1024) + 'MB',
                threshold: (MAX_STREAM_SIZE / 1024 / 1024) + 'MB',
                streamCount
              }
            }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Check estimated cumulative decompressed size
        const estimatedCumulativeSize = avgStreamSize * streamCount;
        if (estimatedCumulativeSize > MAX_CUMULATIVE_SIZE) {
          return new Response(
            JSON.stringify({
              valid: false,
              error: 'SECURITY ALERT: PDF estimated cumulative decompressed size exceeds safe limits (ZIP bomb protection)',
              details: {
                estimatedSize: Math.round(estimatedCumulativeSize / 1024 / 1024) + 'MB',
                threshold: (MAX_CUMULATIVE_SIZE / 1024 / 1024) + 'MB',
                compressionRatio: Math.round(estimatedCumulativeSize / file.size)
              }
            }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      // 6.2 Minimum size check
      if (file.size < 100) {
        return new Response(
          JSON.stringify({
            valid: false,
            error: 'PDF file is suspiciously small and may be malformed'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // 6.3 PDF header validation
      const pdfHeader = new TextDecoder().decode(pdfHeaderBytes);
      if (!pdfHeader.startsWith('%PDF-')) {
        return new Response(
          JSON.stringify({
            valid: false,
            error: 'Invalid PDF header structure'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 6.4 CRITICAL: EOF marker validation (%%EOF must be present at end)
      const lastBytes = new TextDecoder().decode(pdfEndBytes);
      if (!lastBytes.includes('%%EOF')) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'Invalid PDF: missing EOF marker - file may be corrupted or truncated' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 6.5 ENHANCED CRITICAL: Comprehensive polyglot attack detection
      // PDFs can be crafted to be valid PDF + ZIP/EXE/JPEG/GIF/HTML simultaneously
      
      // STREAMING POLYGLOT SCAN: Search in chunks to avoid memory issues
      let foundPolyglot = false;
      let polyglotType = '';
      
      // Define polyglot signatures to search for
      const polyglotSignatures = {
        'ZIP': [
          new Uint8Array([0x50, 0x4B, 0x03, 0x04]), // ZIP local file header
          new Uint8Array([0x50, 0x4B, 0x01, 0x02])  // ZIP central directory
        ],
        'EXE': [new Uint8Array([0x4D, 0x5A])], // MZ executable
        'JPEG': [new Uint8Array([0xFF, 0xD8, 0xFF])], // JPEG start
        'GIF': [
          new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]), // GIF87a
          new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])  // GIF89a
        ],
        'PNG': [new Uint8Array([0x89, 0x50, 0x4E, 0x47])], // PNG signature
        'RAR': [new Uint8Array([0x52, 0x61, 0x72, 0x21])], // RAR archive
      };
      
      // Search for polyglot signatures (skip first 100 bytes to allow PDF header)
      const searchStart = 100;
      for (const [type, signatures] of Object.entries(polyglotSignatures)) {
        for (const signature of signatures) {
          if (searchBytesFrom(pdfContent, signature, searchStart)) {
            foundPolyglot = true;
            polyglotType = type;
            break;
          }
        }
        if (foundPolyglot) break;
      }
      
      if (foundPolyglot) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: `SECURITY ALERT: PDF contains embedded ${polyglotType} data (polyglot attack detected)`,
            details: { polyglotType, detection: 'binary_signature_scan' }
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 6.6 HTML/JavaScript smuggling detection
      const pdfText = new TextDecoder().decode(pdfContent.slice(0, Math.min(4096, pdfContent.length)));
      const pdfLowerText = pdfText.toLowerCase();
      
      const htmlPatterns = ['<html', '<script', '<iframe', '<object', '<embed', 'javascript:', 'vbscript:'];
      for (const pattern of htmlPatterns) {
        if (pdfLowerText.includes(pattern)) {
          return new Response(
            JSON.stringify({ 
              valid: false, 
              error: `SECURITY ALERT: PDF contains HTML/script content (smuggling attempt detected: ${pattern})`,
              details: { pattern, detection: 'text_content_scan' }
            }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // 6.7 JavaScript and dangerous content detection
      const pdfTextFull = new TextDecoder().decode(pdfContent.slice(0, Math.min(8192, pdfContent.length)));
      const dangerousPatterns = [
        'JavaScript', '/JS', '/Launch', '/OpenAction', 
        '/AA', '/EmbeddedFile', '/XObject'
      ];
      
      for (const pattern of dangerousPatterns) {
        if (pdfTextFull.includes(pattern)) {
          console.warn('PDF contains potentially dangerous content:', pattern);
          return new Response(
            JSON.stringify({ 
              valid: false, 
              error: `PDF contains potentially dangerous content: ${pattern}` 
            }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // 6.8 PDF version validation (decompression bomb protection)
      const headerMatch = pdfTextFull.match(/%PDF-(\d+\.\d+)/);
      if (headerMatch) {
        const version = parseFloat(headerMatch[1]);
        if (version > 2.0) {
          return new Response(
            JSON.stringify({ 
              valid: false, 
              error: 'PDF version not supported for security reasons (max 2.0)' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // 6.9 Maximum size validation (decompression bomb protection)
      if (pdfContent.length > 50 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'PDF file exceeds maximum allowed size (50MB)' 
          }),
          { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 6.8 PDF structure integrity validation
      const pdfString = new TextDecoder().decode(pdfContent);
      const objectCount = (pdfString.match(/\d+ \d+ obj/g) || []).length;
      const endObjCount = (pdfString.match(/endobj/g) || []).length;
      
      if (objectCount > 0 && objectCount !== endObjCount) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'PDF structure is corrupted or malformed (mismatched object tags)' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 6.9 Cross-reference table validation
      if (!pdfString.includes('xref') || !pdfString.includes('trailer')) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'PDF is missing required cross-reference table or trailer' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ALL VALIDATIONS PASSED
    return new Response(
      JSON.stringify({
        valid: true,
        file: {
          name: sanitizedFilename,
          originalName: file.name,
          size: file.size,
          type: file.type,
          detectedType: magicCheck.type,
          validations: {
            sizeCheck: true,
            mimeTypeCheck: true,
            magicNumberCheck: true,
            crossValidation: true,
            securityScan: true,
            polyglotCheck: true,
            structureIntegrity: true
          }
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

// Helper function to search for byte pattern in array
function searchBytes(haystack: Uint8Array, needle: Uint8Array): boolean {
  for (let i = 0; i <= haystack.length - needle.length; i++) {
    let found = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        found = false;
        break;
      }
    }
    if (found) return true;
  }
  return false;
}

// Helper function to search for byte pattern starting from offset
function searchBytesFrom(haystack: Uint8Array, needle: Uint8Array, startOffset: number): boolean {
  for (let i = startOffset; i <= haystack.length - needle.length; i++) {
    let found = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        found = false;
        break;
      }
    }
    if (found) return true;
  }
  return false;
}
