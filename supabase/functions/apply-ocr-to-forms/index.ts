import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getFieldMappings, mapOCRToMasterTable } from '../_shared/ocrFieldMapping.ts';
import { createSecureResponse, getSecurityHeaders } from '../_shared/security-headers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApplyOCRRequest {
  documentId: string;
  caseId: string;
  overwriteManual?: boolean; // If false, only fill empty fields
}

interface AppliedField {
  fieldName: string;
  value: any;
  confidence: number;
  wasEmpty: boolean;
  conflict: boolean;
}

serve(async (req) => {
  const origin = req.headers.get('Origin');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getSecurityHeaders(origin) });
  }

  try {
    const { documentId, caseId, overwriteManual = false } = await req.json() as ApplyOCRRequest;

    if (!documentId || !caseId) {
      return createSecureResponse({ error: 'documentId and caseId are required' }, 400, origin);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createSecureResponse({ error: 'Missing authorization header' }, 401, origin);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401, origin);
    }

    // Fetch document with OCR data
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return createSecureResponse({ error: 'Document not found' }, 404, origin);
    }

    if (!document.ocr_data || typeof document.ocr_data !== 'object') {
      return createSecureResponse({ error: 'No OCR data available for this document' }, 400, origin);
    }

    const ocrData = document.ocr_data as any;
    const extractedData = ocrData.extracted_data || {};
    const personType = document.person_type || extractedData.person_type;
    const documentType = document.document_type || extractedData.document_type;

    if (!personType) {
      return createSecureResponse({ error: 'Person type not identified in document' }, 400, origin);
    }

    // Fetch current master table data
    const { data: masterData, error: masterError } = await supabase
      .from('master_table')
      .select('*')
      .eq('case_id', caseId)
      .single();

    if (masterError || !masterData) {
      return createSecureResponse({ error: 'Master table not found for case' }, 404, origin);
    }

    // Use shared mapping logic
    const mappedData = mapOCRToMasterTable(extractedData, personType as any, documentType as any);
    
    const appliedFields: AppliedField[] = [];
    const conflicts: AppliedField[] = [];
    const updates: Record<string, any> = {};

    // Apply mapped data to master table
    for (const [masterField, ocrValue] of Object.entries(mappedData)) {
      const currentValue = masterData[masterField];
      const isEmpty = currentValue === null || currentValue === undefined || currentValue === '';
      const hasConflict = !isEmpty && currentValue !== ocrValue;

      const field: AppliedField = {
        fieldName: masterField,
        value: ocrValue,
        confidence: ocrData.confidence?.overall || 0,
        wasEmpty: isEmpty,
        conflict: hasConflict
      };

      if (hasConflict && !overwriteManual) {
        conflicts.push(field);
        // Create conflict record for review
        await supabase.from('ocr_conflicts').insert({
          case_id: caseId,
          document_id: documentId,
          field_name: masterField,
          ocr_value: String(ocrValue),
          manual_value: String(currentValue),
          ocr_confidence: ocrData.confidence?.overall || 0,
          status: 'pending'
        });
      } else if (isEmpty || overwriteManual) {
        updates[masterField] = ocrValue;
        appliedFields.push(field);
        
        // Record field source
        await supabase.from('form_field_sources').insert({
          case_id: caseId,
          field_name: masterField,
          source_type: 'ocr',
          source_document_id: documentId,
          value: String(ocrValue),
          confidence: ocrData.confidence?.overall || 0,
          applied_by: user.id
        });
      }
    }

    // Update master table if we have changes
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('master_table')
        .update(updates)
        .eq('case_id', caseId);

      if (updateError) {
        console.error('Failed to update master table:', updateError);
        return createSecureResponse(
          { error: 'Failed to apply OCR data', details: updateError.message },
          500,
          origin
        );
      }
    }

    // Mark document as having data applied
    await supabase
      .from('documents')
      .update({ data_applied_to_forms: true, applied_at: new Date().toISOString(), applied_by: user.id })
      .eq('id', documentId);

    console.log(`Applied OCR data: ${appliedFields.length} fields updated, ${conflicts.length} conflicts detected`);

    return createSecureResponse({
      success: true,
      appliedFields: appliedFields.length,
      conflicts: conflicts.length,
      details: {
        applied: appliedFields,
        conflicts: conflicts
      }
    }, 200, origin);

  } catch (error) {
    console.error('Error in apply-ocr-to-forms:', error);
    return createSecureResponse(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      500,
      origin
    );
  }
});
