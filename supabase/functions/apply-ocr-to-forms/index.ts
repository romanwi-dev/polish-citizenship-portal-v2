import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getFieldMappings, mapOCRToMasterTable } from '../_shared/ocrFieldMapping.ts';

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, caseId, overwriteManual = false } = await req.json() as ApplyOCRRequest;

    if (!documentId || !caseId) {
      return new Response(
        JSON.stringify({ error: 'documentId and caseId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch document with OCR data
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return new Response(
        JSON.stringify({ error: 'Document not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!document.ocr_data || typeof document.ocr_data !== 'object') {
      return new Response(
        JSON.stringify({ error: 'No OCR data available for this document' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ocrData = document.ocr_data as any;
    const extractedData = ocrData.extracted_data || {};
    const personType = document.person_type || extractedData.person_type;
    const documentType = document.document_type || extractedData.document_type;

    if (!personType) {
      return new Response(
        JSON.stringify({ error: 'Person type not identified in document' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch current master table data
    const { data: masterData, error: masterError } = await supabase
      .from('master_table')
      .select('*')
      .eq('case_id', caseId)
      .single();

    if (masterError || !masterData) {
      return new Response(
        JSON.stringify({ error: 'Master table not found for case' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
        return new Response(
          JSON.stringify({ error: 'Failed to apply OCR data', details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Mark document as having data applied
    await supabase
      .from('documents')
      .update({ data_applied_to_forms: true, applied_at: new Date().toISOString(), applied_by: user.id })
      .eq('id', documentId);

    console.log(`Applied OCR data: ${appliedFields.length} fields updated, ${conflicts.length} conflicts detected`);

    return new Response(
      JSON.stringify({
        success: true,
        appliedFields: appliedFields.length,
        conflicts: conflicts.length,
        details: {
          applied: appliedFields,
          conflicts: conflicts
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in apply-ocr-to-forms:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
