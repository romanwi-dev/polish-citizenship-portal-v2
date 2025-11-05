import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateAccessToken } from "../_shared/dropbox-auth.ts";
import { createSecureResponse, getSecurityHeaders } from "../_shared/security-headers.ts";

/**
 * PHASE 1 FIX: Comprehensive path normalization and validation
 * Fixes 97.4% OCR failure rate caused by path/not_found errors
 */

/**
 * Remove duplicate consecutive folder names in path
 * Example: /CASES/VIP/WESLEY/WESLEY/file.pdf -> /CASES/VIP/WESLEY/file.pdf
 */
function removeDuplicateFolders(path: string): string {
  const parts = path.split('/').filter(p => p.length > 0);
  const deduped: string[] = [];
  
  for (let i = 0; i < parts.length; i++) {
    // Keep filename (last part) always
    if (i === parts.length - 1) {
      deduped.push(parts[i]);
      break;
    }
    
    // Skip if same as next folder (duplicate)
    if (parts[i] === parts[i + 1]) {
      console.log(`  → Removing duplicate folder: ${parts[i]}`);
      continue;
    }
    
    deduped.push(parts[i]);
  }
  
  return '/' + deduped.join('/');
}

/**
 * Generate alternative path variations to try
 */
function generatePathVariations(originalPath: string): string[] {
  const variations: string[] = [];
  
  // 1. Original normalized path
  let normalized = originalPath.trim();
  if (!normalized.startsWith('/')) normalized = '/' + normalized;
  variations.push(normalized);
  
  // 2. Remove duplicate folders
  const deduplicated = removeDuplicateFolders(normalized);
  if (deduplicated !== normalized) {
    variations.push(deduplicated);
  }
  
  // 3. Try without /CASES/ prefix (in case it's nested differently)
  const withoutCases = normalized.replace(/^\/CASES\//, '/');
  if (withoutCases !== normalized && !variations.includes(withoutCases)) {
    variations.push(withoutCases);
  }
  
  // 4. Try with single /CASES/ prefix
  if (!normalized.startsWith('/CASES/')) {
    const withCases = '/CASES' + (normalized.startsWith('/') ? normalized : '/' + normalized);
    if (!variations.includes(withCases)) {
      variations.push(withCases);
    }
  }
  
  return variations;
}

/**
 * Verify path exists in Dropbox using metadata API
 */
async function verifyPathExists(path: string, accessToken: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.dropboxapi.com/2/files/get_metadata', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    });
    
    return response.ok;
  } catch (error) {
    console.error(`Verification failed for ${path}:`, error);
    return false;
  }
}

/**
 * Download file with path validation and fallback mechanisms
 */
async function downloadWithVerification(
  originalPath: string,
  accessToken: string
): Promise<{ data: ArrayBuffer; finalPath: string }> {
  
  console.log(`\n🔍 Path Resolution for: "${originalPath}"`);
  
  // Generate all path variations to try
  const pathVariations = generatePathVariations(originalPath);
  console.log(`Generated ${pathVariations.length} path variations to try:`);
  pathVariations.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
  
  // Try each variation until one succeeds
  for (let i = 0; i < pathVariations.length; i++) {
    const testPath = pathVariations[i];
    console.log(`\n📋 Attempt ${i + 1}/${pathVariations.length}: "${testPath}"`);
    
    // CRITICAL: Verify path exists before attempting download
    console.log('  → Verifying path exists...');
    const exists = await verifyPathExists(testPath, accessToken);
    
    if (!exists) {
      console.log('  ✗ Path not found in Dropbox');
      continue;
    }
    
    console.log('  ✓ Path verified, attempting download...');
    
    // Try download
    try {
      const response = await fetch('https://content.dropboxapi.com/2/files/download', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Dropbox-API-Arg': JSON.stringify({ path: testPath }),
        },
      });
      
      if (response.ok) {
        const data = await response.arrayBuffer();
        console.log(`  ✓ Download successful! (${(data.byteLength / 1024).toFixed(1)} KB)`);
        console.log(`\n✅ SUCCESS: Final working path: "${testPath}"\n`);
        return { data, finalPath: testPath };
      } else {
        const errorText = await response.text();
        console.log(`  ✗ Download failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error(`  ✗ Download error:`, error);
    }
  }
  
  // All variations failed
  throw new Error(
    `All ${pathVariations.length} path variations failed. Original: "${originalPath}". ` +
    `Tried: ${pathVariations.map(p => `"${p}"`).join(', ')}`
  );
}

serve(async (req) => {
  const origin = req.headers.get('Origin');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getSecurityHeaders(origin) });
  }

  try {
    const { dropboxPath } = await req.json();
    
    if (!dropboxPath) {
      throw new Error('Dropbox path is required');
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📥 DOWNLOAD REQUEST RECEIVED`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Original path: "${dropboxPath}"`);

    // Basic validation
    const trimmedPath = dropboxPath.trim();
    if (!trimmedPath || trimmedPath === '/' || trimmedPath === '.') {
      console.error(`❌ Invalid path: empty or root directory`);
      throw new Error('Invalid Dropbox path: path is empty or invalid');
    }

    // Validate has filename with extension
    const filename = trimmedPath.split('/').pop() || '';
    if (!filename.includes('.')) {
      console.error(`❌ Invalid path: no file extension found`);
      throw new Error('Invalid Dropbox path: missing filename or file extension');
    }

    // Get credentials
    const dropboxAppKey = Deno.env.get('DROPBOX_APP_KEY');
    const dropboxAppSecret = Deno.env.get('DROPBOX_APP_SECRET');
    const dropboxRefreshToken = Deno.env.get('DROPBOX_REFRESH_TOKEN');

    if (!dropboxAppKey || !dropboxAppSecret || !dropboxRefreshToken) {
      throw new Error('Missing Dropbox credentials');
    }

    // Generate access token
    console.log('🔑 Generating Dropbox access token...');
    const accessToken = await generateAccessToken(dropboxAppKey, dropboxAppSecret, dropboxRefreshToken);
    console.log('✓ Access token generated');
    
    // Download with comprehensive path validation and fallback
    const { data: fileData, finalPath } = await downloadWithVerification(trimmedPath, accessToken);

    
    // Extract filename and content type
    const fileName = filename;
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const contentTypeMap: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    console.log(`📦 Returning file: ${fileName} (${contentType}, ${(fileData.byteLength / 1024).toFixed(1)} KB)`);
    console.log(`${'='.repeat(80)}\n`);

    const secureHeaders = getSecurityHeaders(origin);
    return new Response(fileData, {
      headers: {
        ...secureHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'X-Dropbox-Path-Resolved': finalPath, // Include for debugging
      },
    });

  } catch (error) {
    console.error('\n❌ DOWNLOAD FAILED');
    console.error('Error:', error instanceof Error ? error.message : error);
    console.error(`${'='.repeat(80)}\n`);
    
    return createSecureResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500, origin);
  }
});