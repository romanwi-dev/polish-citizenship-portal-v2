import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  getFieldMapping, 
  getRequiredFields, 
  isValidTemplate,
  normalizeTemplateType 
} from '../_shared/pdf-field-maps.ts';
import { 
  PDFErrorCode, 
  createPDFError, 
  logPDFError, 
  getUserMessage 
} from '../_shared/pdf-errors.ts';
import { 
  retryStorageUpload, 
  retryTemplateFetch, 
  retrySignedUrl 
} from '../_shared/pdf-retry.ts';
import { getPooledAdminClient } from '../_shared/connection-pool.ts';
import { templateCache } from '../_shared/template-cache-v2.ts';
import { fillFieldsInParallel } from '../_shared/parallel-field-filler.ts';
import { performanceTracker } from '../_shared/performance-tracker.ts';
import { validateFamilyTreeData } from '../_shared/family-tree-validator.ts';
import { resolveFamilyTreeData } from '../_shared/family-tree-resolver.ts';

// DEPLOYMENT VERSION: 2024-11-05-V4-MODULAR
// Uses shared modules for field mappings, errors, and retry logic

// ===== CORS & Security Utilities =====
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-admin-token',
};

function j(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function log(event: string, extra: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), event, deployment: 'v2-fixed-paths', ...extra }));
}

// ===== Input Validation =====
function sanitizeCaseId(raw: unknown): string | null {
  const s = String(raw ?? '');
  return /^[A-Za-z0-9_-]{1,64}$/.test(s) ? s : null;
}

// Template validation now handled by shared module

const TTL = Number(Deno.env.get('SIGNED_URL_TTL_SECONDS') ?? '2700');

// PHASE B: Using enhanced template cache v2 with versioning and LRU

// Field mappings now imported from shared module

// ===== Formatting Utilities =====
const formatDate = (date: string | null | undefined): string => {
  if (!date) return '';
  try {
    if (typeof date === 'string' && /^\d{2}\.\d{2}\.\d{4}$/.test(date)) return date;
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      const [year, month, day] = date.split('T')[0].split('-');
      return `${day}.${month}.${year}`;
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    if (year < 1800 || year > 2030) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}.${year}`;
  } catch {
    return '';
  }
};

const formatAddress = (address: any): string => {
  if (!address) return '';
  if (typeof address === 'string') return address.trim();
  if (typeof address === 'object') {
    const parts = [address.street, address.city, address.state, address.postal_code || address.zip, address.country]
      .filter(Boolean).map(part => String(part).trim());
    return parts.join(', ');
  }
  return '';
};

const formatArray = (arr: any[] | null | undefined): string => {
  if (!arr || !Array.isArray(arr)) return '';
  return arr.filter(Boolean).map(item => String(item).trim()).join(', ');
};

const formatBoolean = (value: any): string => {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  const stringValue = String(value).toLowerCase().trim();
  if (['true', 'yes', '1', 'y', 'tak', 'checked'].includes(stringValue)) return 'Yes';
  if (['false', 'no', '0', 'n', 'nie', 'unchecked'].includes(stringValue)) return 'No';
  return 'No';
};

const getNestedValue = (obj: any, path: string): any => {
  if (!obj || !path) return undefined;
  if (!path.includes('.')) return obj[path];
  const keys = path.split('.');
  if (keys.length === 2 && ['day', 'month', 'year'].includes(keys[1])) {
    const dateValue = obj[keys[0]];
    if (dateValue) {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        switch (keys[1]) {
          case 'day': return date.getDate().toString().padStart(2, '0');
          case 'month': return (date.getMonth() + 1).toString().padStart(2, '0');
          case 'year': return date.getFullYear().toString();
        }
      }
    }
    return undefined;
  }
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }
  return current;
};

const formatFieldValue = (value: any, fieldName: string): string => {
  if (value === null || value === undefined) return '';
  const datePatterns = ['_date', '_dob', '_at', 'DOB', 'Date', 'birth', 'marriage', 'emigration', 'naturalization'];
  const addressPatterns = ['address', 'miejsce_zamieszkania'];
  const arrayPatterns = ['citizenships', 'names', 'languages'];
  const boolPatterns = ['is_', 'has_', 'included', 'zal'];
  const isDateField = datePatterns.some(pattern => fieldName.toLowerCase().includes(pattern.toLowerCase()));
  if (isDateField) return formatDate(value);
  const isAddressField = addressPatterns.some(pattern => fieldName.toLowerCase().includes(pattern.toLowerCase()));
  if (isAddressField) return formatAddress(value).toUpperCase(); // UPPERCASE for addresses
  const isArrayField = arrayPatterns.some(pattern => fieldName.toLowerCase().includes(pattern.toLowerCase()));
  if (isArrayField && Array.isArray(value)) return formatArray(value).toUpperCase(); // UPPERCASE for arrays
  const isBoolField = boolPatterns.some(pattern => fieldName.toLowerCase().startsWith(pattern.toLowerCase()));
  if (isBoolField) return formatBoolean(value);
  // CRITICAL: Convert all text to UPPERCASE for consistency with official documents
  return String(value).toUpperCase();
};

interface FillResult {
  totalFields: number;
  filledCount: number;
  emptyFields: string[];
  errors: Array<{ field: string; error: string }>;
}

function fillPDFFields(form: any, data: any, fieldMap: Record<string, string>): FillResult {
  const allFields = form.getFields();
  const result: FillResult = { totalFields: allFields.length, filledCount: 0, emptyFields: [], errors: [] };
  
  // Log all available PDF field names for debugging
  const pdfFieldNames = allFields.map((f: any) => f.getName());
  log('available_pdf_fields', { fields: pdfFieldNames });
  
  Object.entries(fieldMap).forEach(([pdfFieldName, dataPath]) => {
    try {
      let value: any;
      if (dataPath.includes('|')) {
        const parts = dataPath.split('|').map(p => getNestedValue(data, p) || '').filter(Boolean);
        value = parts.join(' ');
      } else {
        value = getNestedValue(data, dataPath);
      }
      
      log('attempting_fill', { pdfFieldName, dataPath, value, hasValue: value !== undefined && value !== null && value !== '' });
      
      if (value === undefined || value === null || value === '') {
        result.emptyFields.push(pdfFieldName);
        log('empty_field_skipped', { pdfFieldName, dataPath });
        return;
      }
      
      const formattedValue = formatFieldValue(value, pdfFieldName);
      if (!formattedValue) {
        result.emptyFields.push(pdfFieldName);
        return;
      }
      
      const field = form.getField(pdfFieldName);
      if (!field) {
        result.errors.push({ field: pdfFieldName, error: 'Field not found in PDF' });
        return;
      }
      
      // Detect field type using multiple methods
      const fieldType = field.constructor.name;
      const acroFieldType = field.acroField?.dict?.get('FT')?.encodedName || '';
      
      // PDFTextField - match various text field indicators
      const isTextField = fieldType === 'PDFTextField' || 
                         acroFieldType === '/Tx' || 
                         acroFieldType === 'Tx' ||
                         acroFieldType === 't' ||
                         acroFieldType.includes('Tx');
      
      const isCheckBox = fieldType === 'PDFCheckBox' || 
                        acroFieldType === '/Btn' || 
                        acroFieldType === 'Btn';
      
      const isDropdown = fieldType === 'PDFDropdown' || 
                        acroFieldType === '/Ch' || 
                        acroFieldType === 'Ch';
      
      if (isTextField) {
        try {
          // Set text in UPPERCASE
          const uppercaseValue = formattedValue.toUpperCase();
          field.setText(uppercaseValue);
          
          // Enable bold appearance if available
          try {
            field.enableBoldFont?.();
          } catch {
            // Bold not supported on this field, continue anyway
          }
          
          result.filledCount++;
          log('text_field_filled', { field: pdfFieldName, value: uppercaseValue });
        } catch (e) {
          const errMsg = (e as Error)?.message || String(e);
          result.errors.push({ field: pdfFieldName, error: `Text field set failed: ${errMsg}` });
        }
      } else if (isCheckBox) {
        const isChecked = formatBoolean(value) === 'Yes';
        if (isChecked) {
          field.check();
        } else {
          field.uncheck();
        }
        result.filledCount++;
      } else if (isDropdown) {
        try {
          field.select(formattedValue);
          result.filledCount++;
        } catch (e) {
          const errMsg = (e as Error)?.message || String(e);
          result.errors.push({ field: pdfFieldName, error: `Dropdown select failed: ${errMsg}` });
        }
      } else {
        // Try setText as fallback for unknown field types
        try {
          const uppercaseValue = formattedValue.toUpperCase();
          field.setText(uppercaseValue);
          
          // Try to enable bold if available
          try {
            field.enableBoldFont?.();
          } catch {
            // Bold not supported, continue anyway
          }
          
          result.filledCount++;
          log('fallback_text_success', { field: pdfFieldName, fieldType, acroFieldType });
        } catch (e) {
          result.errors.push({ field: pdfFieldName, error: `Unsupported field type: ${fieldType} (acro: ${acroFieldType})` });
        }
      }
    } catch (error) {
      result.errors.push({ field: pdfFieldName, error: String((error as Error)?.message ?? error) });
    }
  });
  
  return result;
}

// ===== Main Handler =====
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { caseId: rawCaseId, templateType, flatten = false, mode, childNum } = body ?? {};

    // Secure diagnostics
    if (mode === 'diagnose') {
      const token = req.headers.get('x-admin-token');
      if (token !== Deno.env.get('INTERNAL_ADMIN_TOKEN')) {
        return j(req, { ok: false, error: 'unauthorized' }, 401);
      }
      
      const diagnostics: any = {
        ok: true,
        hasSecrets: true,
        uploadOk: false,
        signOk: false,
        timestamp: new Date().toISOString()
      };
      
      try {
        // Check secrets
        const url = Deno.env.get('SUPABASE_URL');
        const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const anon = Deno.env.get('SUPABASE_ANON_KEY');
        diagnostics.hasSecrets = !!(url && key && anon);
        
        if (!diagnostics.hasSecrets) {
          diagnostics.ok = false;
          diagnostics.diagError = 'Missing required environment variables';
          return j(req, diagnostics, 200);
        }
        
        // Test storage upload
        const admin = createClient(url!, key!);
        const path = `diagnostics/${Date.now()}.txt`;
        const up = await admin.storage.from('generated-pdfs')
          .upload(path, new TextEncoder().encode('ok'), { contentType: 'text/plain', upsert: true });
        
        if (up.error) {
          log('diag_upload_fail', { err: up.error.message });
          diagnostics.ok = false;
          diagnostics.uploadOk = false;
          diagnostics.diagError = `Upload failed: ${up.error.message}`;
          return j(req, diagnostics, 200);
        }
        
        diagnostics.uploadOk = true;
        
        // Test signed URL generation
        const sign = await admin.storage.from('generated-pdfs').createSignedUrl(path, 60);
        
        if (sign.error) {
          log('diag_sign_fail', { err: sign.error.message });
          diagnostics.ok = false;
          diagnostics.signOk = false;
          diagnostics.diagError = `Signing failed: ${sign.error.message}`;
          return j(req, diagnostics, 200);
        }
        
        diagnostics.signOk = true;
        log('diagnostics_pass', { timestamp: diagnostics.timestamp });
        return j(req, diagnostics, 200);
        
      } catch (e) {
        const errMsg = String((e as Error)?.message ?? e);
        log('diag_exception', { err: errMsg });
        diagnostics.ok = false;
        diagnostics.diagError = `Exception: ${errMsg}`;
        return j(req, diagnostics, 200);
      }
    }

    // Validate inputs
    const caseId = sanitizeCaseId(rawCaseId);
    if (!caseId) {
      const error = createPDFError(PDFErrorCode.INVALID_CASE_ID, 'Invalid caseId format');
      logPDFError(error);
      return j(req, { code: error.code, message: error.message }, 400);
    }
    
    if (!isValidTemplate(String(templateType))) {
      const error = createPDFError(PDFErrorCode.INVALID_TEMPLATE_TYPE, 'Invalid template type', { templateType });
      logPDFError(error);
      return j(req, { code: error.code, message: error.message }, 400);
    }

    // PHASE B: Use pooled admin client for 2x performance boost
    const admin = getPooledAdminClient();

    log('fill_pdf_request', { caseId, templateType });
    
    // Simple case existence check with service role (bypasses RLS)
    const { data: c, error: caseErr } = await admin.from('cases').select('id').eq('id', caseId).maybeSingle();
    if (caseErr || !c) {
      log('case_not_found', { caseId, err: caseErr?.message });
      return j(req, { code: 'CASE_NOT_FOUND', message: 'Case not found' }, 404);
    }

    // DEV MODE: Skip cache if DEV_NO_CACHE=1
    const devNoCache = Deno.env.get('DEV_NO_CACHE') === '1';
    const nocacheParam = req.url.includes('nocache=1');
    
    // CRITICAL FIX: Always regenerate POA and Family Tree PDFs to ensure fresh data
    // These forms are frequently updated and must reflect current data
    const isPOA = templateType.startsWith('poa-');
    const isFamilyTree = templateType === 'family-tree';
    const skipCache = devNoCache || nocacheParam || isPOA || isFamilyTree;
    
    let path: string = '';
    let shouldGenerateNew = true;

    if (!skipCache) {
      // Check for recent artifact (within 1 hour) - only for non-POA templates
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recent } = await admin.from('generated_documents')
        .select('path, created_at')
        .eq('case_id', caseId)
        .eq('template_type', templateType)
        .gte('created_at', oneHourAgo)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      shouldGenerateNew = !recent?.path;
      if (!shouldGenerateNew) {
        path = recent!.path;
        log('reuse_artifact', { caseId, templateType, path });
      }
    } else {
      const reason = devNoCache ? 'DEV_NO_CACHE=1' : (nocacheParam ? 'nocache=1' : (isPOA ? 'POA_ALWAYS_FRESH' : 'FAMILY_TREE_ALWAYS_FRESH'));
      log('cache_disabled', { reason });
    }

    if (shouldGenerateNew) {
      log('gen_start', { caseId, templateType });

      // Fetch case data with service role
      const { data: masterData, error: fetchError } = await admin.from('master_table').select('*').eq('case_id', caseId).single();
      if (fetchError || !masterData) {
        log('data_fetch_fail', { caseId, err: fetchError?.message });
        return j(req, { code: 'DATA_FETCH_FAIL', message: 'Failed to fetch case data' }, 500);
      }

      log('data_retrieved', { caseId });

      // Template mapping - Using shared module
      const normalizedType = normalizeTemplateType(templateType);
      let fieldMap = getFieldMapping(normalizedType);
      
      if (!fieldMap) {
        const error = createPDFError(PDFErrorCode.TEMPLATE_NOT_FOUND, 'Template configuration not found', { templateType });
        logPDFError(error);
        return j(req, { code: error.code, message: error.message }, 404);
      }
      
      // FAMILY TREE: Validate and resolve dynamic bloodline data
      let resolvedFamilyData: any = null;
      if (normalizedType === 'family-tree') {
        log('family_tree_validation_start', { caseId });
        
        // Validate family tree data completeness
        const validation = validateFamilyTreeData(masterData);
        
        log('family_tree_validation_result', {
          caseId,
          isValid: validation.isValid,
          bloodline: validation.bloodline,
          completeness: validation.dataCompleteness,
          errors: validation.errors,
          warnings: validation.warnings,
          missingFields: validation.missingRequired.length
        });
        
        // Return validation errors if critical issues found
        if (!validation.isValid) {
          const error = createPDFError(
            PDFErrorCode.VALIDATION_FAILED,
            'Family Tree validation failed: ' + validation.errors.join(', '),
            {
              validation: validation.errors,
              bloodline: validation.bloodline,
              completeness: validation.dataCompleteness
            }
          );
          logPDFError(error);
          return j(req, {
            code: error.code,
            message: error.message,
            validation: {
              errors: validation.errors,
              warnings: validation.warnings,
              bloodline: validation.bloodline,
              completeness: validation.dataCompleteness,
              missingRequired: validation.missingRequired
            }
          }, 400);
        }
        
        // Log warnings for user awareness
        if (validation.warnings.length > 0) {
          log('family_tree_warnings', {
            caseId,
            warnings: validation.warnings
          });
        }
        
        // Resolve dynamic bloodline data
        resolvedFamilyData = resolveFamilyTreeData(masterData);
        
        log('family_tree_resolved', {
          caseId,
          bloodline: validation.bloodline,
          resolvedFields: Object.keys(resolvedFamilyData).length
        });
      }
      
      // Handle child-specific mapping for minor POAs
      if (normalizedType === 'poa-minor' && childNum) {
        log('mapping_minor_child', { childNum });
        // Create child-specific data object
        const childSpecificData = {
          ...masterData,
          minor_given_names: masterData[`child_${childNum}_first_name`],
          minor_surname: masterData[`child_${childNum}_last_name`],
          minor_dob: masterData[`child_${childNum}_dob`],
        };
        // Override masterData for this child
        Object.assign(masterData, childSpecificData);
      }
      
      // Template path mapping (PDF filenames)
      const templatePaths: Record<string, string> = {
        'citizenship': 'citizenship.pdf',
        'family-tree': 'family-tree.pdf',
        'uzupelnienie': 'umiejscowienie.pdf',
        'poa-adult': 'poa-adult.pdf',
        'poa-minor': 'poa-minor.pdf',
        'poa-spouses': 'poa-spouses.pdf',
      };
      
      const pdfTemplatePath = templatePaths[normalizedType];
      if (!pdfTemplatePath) {
        const error = createPDFError(PDFErrorCode.TEMPLATE_NOT_FOUND, 'Template file path not found', { templateType: normalizedType });
        logPDFError(error);
        return j(req, { code: error.code, message: error.message }, 404);
      }

      log('template_load_v5', { pdfTemplatePath, deployment: 'V5-PHASE-B', templateType: normalizedType, timestamp: Date.now() });

      // PHASE B: Use enhanced template cache v2 with versioning
      const templateVersion = '1.0.0'; // Could be loaded from metadata
      let templateBytes: Uint8Array | null = templateCache.get(pdfTemplatePath, templateVersion);
      
      const cacheTimer = performanceTracker.start('template_cache', { path: pdfTemplatePath });
      
      if (templateBytes) {
        log('template_cache_hit_v2', { pdfTemplatePath, version: templateVersion });
        performanceTracker.end(cacheTimer, 'template_cache', { hit: true });
      } else {
        log('template_cache_miss_v2', { pdfTemplatePath });
        
        // Use retry logic for template download
        const templateData = await performanceTracker.track('template_download', async () => {
          return await retryTemplateFetch(async () => {
            const { data, error: downloadError } = await admin.storage.from('pdf-templates').download(pdfTemplatePath);
            if (downloadError || !data) {
              const error = createPDFError(PDFErrorCode.TEMPLATE_LOAD_FAILED, 'Failed to download template', { 
                path: pdfTemplatePath, 
                error: downloadError?.message 
              });
              throw new Error(error.message);
            }
            return data;
          });
        }, { path: pdfTemplatePath });
        
        const arrayBuffer = await templateData.arrayBuffer();
        templateBytes = new Uint8Array(arrayBuffer);
        templateCache.set(pdfTemplatePath, templateBytes, templateVersion);
        performanceTracker.end(cacheTimer, 'template_cache', { hit: false });
        log('template_cached_v2', { pdfTemplatePath, size: templateBytes.byteLength });
      }

      // Load PDF
      const PDFDocument = (await import('https://esm.sh/pdf-lib@1.17.1')).PDFDocument;
      const pdfDoc = await PDFDocument.load(templateBytes);
      const form = pdfDoc.getForm();
      log('pdf_loaded', { caseId, templateType });

      // FAMILY TREE: Use resolved dynamic data instead of raw masterData
      const dataToFill = normalizedType === 'family-tree' && resolvedFamilyData 
        ? resolvedFamilyData 
        : masterData;

      // PHASE B: Fill PDF using parallel field filler (batches of 20)
      const fillTimer = performanceTracker.start('field_filling', { fieldCount: Object.keys(fieldMap).length });
      const result = await fillFieldsInParallel(
        form,
        dataToFill,
        fieldMap,
        formatFieldValue,
        getNestedValue,
        20 // batch size
      );
      performanceTracker.end(fillTimer, 'field_filling', { filledCount: result.filledCount });
      log('fields_filled_v2', { caseId, templateType, filled: result.filledCount, total: result.totalFields, errors: result.errors.length, parallel: true });
      if (result.errors.length > 0) console.warn('[fill-pdf-v5] Field filling errors:', result.errors);

      // CRITICAL FIX: Don't update field appearances with StandardFonts
      // Polish characters (Ń, Ł, etc.) are not supported by WinAnsi encoding
      // The PDF template already has fonts that support these characters
      // Updating appearances overwrites them and causes encoding errors
      
      // Flatten and save (flatten only if explicitly requested for final PDFs)
      if (flatten) {
        form.flatten();
        log('pdf_flattened', { caseId, templateType });
      }
      const filledPdfBytes = await pdfDoc.save();

      // Upload with retry logic
      const filename = `${templateType}-${Date.now()}.pdf`;
      path = `${caseId}/${filename}`;
      log('upload_start', { caseId, path, bytes: filledPdfBytes.byteLength });
      
      try {
        await retryStorageUpload(async () => {
          const { error: uploadError } = await admin.storage.from('generated-pdfs')
            .upload(path, filledPdfBytes, { contentType: 'application/pdf', upsert: true });
          if (uploadError) {
            const error = createPDFError(PDFErrorCode.STORAGE_UPLOAD_FAILED, 'Storage upload failed', {
              path,
              error: uploadError.message
            });
            throw new Error(error.message);
          }
        });
      } catch (error) {
        const pdfError = createPDFError(PDFErrorCode.STORAGE_UPLOAD_FAILED, 'Upload failed after retries', {
          path,
          error: error instanceof Error ? error.message : String(error)
        });
        logPDFError(pdfError);
        return j(req, { code: pdfError.code, message: pdfError.message }, 500);
      }

      // Audit (no user ID since this is a public endpoint)
      await admin.from('generated_documents').insert({ 
        case_id: caseId, 
        template_type: templateType, 
        path, 
        created_by: null 
      });
      log('gen_ok', { caseId, templateType, path, bytes: filledPdfBytes.byteLength, filled: result.filledCount, total: result.totalFields });
    }

    // Signed URL with retry logic
    let signedUrl: string;
    try {
      const sign = await retrySignedUrl(async () => {
        const result = await admin.storage.from('generated-pdfs')
          .createSignedUrl(path, TTL, { download: path.split('/').pop() ?? 'document.pdf' });
        if (result.error || !result.data?.signedUrl) {
          const error = createPDFError(PDFErrorCode.SIGNED_URL_FAILED, 'Signed URL generation failed', {
            path,
            error: result.error?.message
          });
          throw new Error(error.message);
        }
        return result.data.signedUrl;
      });
      signedUrl = sign;
    } catch (error) {
      const pdfError = createPDFError(PDFErrorCode.SIGNED_URL_FAILED, 'Signed URL generation failed after retries', {
        path,
        error: error instanceof Error ? error.message : String(error)
      });
      logPDFError(pdfError);
      return j(req, { code: pdfError.code, message: pdfError.message }, 500);
    }

    log('fill_pdf_success', { caseId, templateType, path, signedUrl: signedUrl.substring(0, 50) + '...' });
    return j(req, { url: signedUrl, filename: path.split('/').pop(), templateType, caseId }, 200);
  } catch (e) {
    log('exception', { err: String((e as Error)?.message ?? e) });
    return j(req, { code: 'INTERNAL', message: 'Internal error' }, 500);
  }
});
