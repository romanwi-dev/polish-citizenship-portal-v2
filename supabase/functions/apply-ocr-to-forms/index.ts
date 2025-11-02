import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch document with OCR data
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, name, person_type, document_type, ocr_data, ocr_confidence, ai_detected_person')
      .eq('id', documentId)
      .eq('case_id', caseId)
      .single();

    if (docError || !document) {
      return new Response(
        JSON.stringify({ error: 'Document not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!document.ocr_data || Object.keys(document.ocr_data).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No OCR data available for this document' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch current master_table data
    const { data: masterData, error: masterError } = await supabase
      .from('master_table')
      .select('*')
      .eq('case_id', caseId)
      .single();

    if (masterError || !masterData) {
      return new Response(
        JSON.stringify({ error: 'Master table data not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get field mappings based on document type and person type
    const personType = document.ai_detected_person || document.person_type || 'AP';
    const ocrData = document.ocr_data as Record<string, any>;
    
    // Map OCR fields to master_table fields
    const fieldsToUpdate: Record<string, any> = {};
    const appliedFields: AppliedField[] = [];
    const conflicts: Array<{ field: string; ocrValue: any; currentValue: any }> = [];
    
    // Field mapping logic based on person type
    const fieldMappings = getFieldMappings(personType, document.document_type);
    
    for (const [ocrField, masterField] of Object.entries(fieldMappings)) {
      const ocrValue = ocrData[ocrField];
      const currentValue = masterData[masterField];
      
      if (!ocrValue) continue;
      
      const isEmpty = !currentValue || currentValue === '' || currentValue === null;
      const shouldUpdate = overwriteManual || isEmpty;
      
      if (shouldUpdate) {
        fieldsToUpdate[masterField] = ocrValue;
        appliedFields.push({
          fieldName: masterField,
          value: ocrValue,
          confidence: document.ocr_confidence || 0,
          wasEmpty: isEmpty,
          conflict: !isEmpty && currentValue !== ocrValue
        });
      } else if (!isEmpty && currentValue !== ocrValue) {
        conflicts.push({
          field: masterField,
          ocrValue,
          currentValue
        });
      }
    }

    // Update master_table if there are fields to update
    if (Object.keys(fieldsToUpdate).length > 0) {
      const { error: updateError } = await supabase
        .from('master_table')
        .update({
          ...fieldsToUpdate,
          updated_at: new Date().toISOString()
        })
        .eq('case_id', caseId);

      if (updateError) {
        console.error('Error updating master_table:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update master table' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create field source records
      const fieldSourceRecords = appliedFields.map(field => ({
        case_id: caseId,
        field_name: field.fieldName,
        source_type: 'ocr' as const,
        source_document_id: documentId,
        confidence: field.confidence,
        locked: true,
        applied_by: user.id,
        metadata: {
          person_type: personType,
          document_type: document.document_type,
          document_name: document.name,
          was_empty: field.wasEmpty,
          had_conflict: field.conflict
        }
      }));

      const { error: sourceError } = await supabase
        .from('form_field_sources')
        .insert(fieldSourceRecords);

      if (sourceError) {
        console.error('Error creating field sources:', sourceError);
      }
    }

    // Mark document as applied
    await supabase
      .from('documents')
      .update({
        data_applied_to_forms: true,
        applied_at: new Date().toISOString(),
        applied_by: user.id
      })
      .eq('id', documentId);

    return new Response(
      JSON.stringify({
        success: true,
        applied_count: appliedFields.length,
        conflict_count: conflicts.length,
        applied_fields: appliedFields,
        conflicts,
        message: `Applied ${appliedFields.length} field(s) to Master Data Table${conflicts.length > 0 ? `, ${conflicts.length} conflict(s) detected` : ''}`
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

// Field mapping based on person type and document type
function getFieldMappings(personType: string, documentType: string | null): Record<string, string> {
  const prefix = personType.toLowerCase();
  
  // Common name fields
  const nameFields: Record<string, string> = {
    'first_name': `${prefix}_first_name`,
    'last_name': `${prefix}_last_name`,
    'maiden_name': `${prefix}_maiden_name`,
    'date_of_birth': `${prefix}_dob`,
    'place_of_birth': `${prefix}_place_of_birth`,
    'sex': `${prefix}_sex`,
  };

  // Document-specific mappings
  if (documentType?.toLowerCase().includes('birth')) {
    return {
      ...nameFields,
      'birth_date': `${prefix}_dob`,
      'birth_place': `${prefix}_place_of_birth`,
      'city': `${prefix}_birth_city`,
      'country': `${prefix}_birth_country`,
    };
  }

  if (documentType?.toLowerCase().includes('marriage')) {
    return {
      'spouse_first_name': 'spouse_first_name',
      'spouse_last_name': 'spouse_last_name',
      'marriage_date': 'date_of_marriage',
      'marriage_place': 'place_of_marriage',
    };
  }

  if (documentType?.toLowerCase().includes('passport')) {
    return {
      'passport_number': `${prefix}_passport_number`,
      'issue_date': `${prefix}_passport_issue_date`,
      'expiry_date': `${prefix}_passport_expiry_date`,
      'issuing_country': `${prefix}_passport_issuing_country`,
      ...nameFields,
    };
  }

  // Default mapping for other document types
  return nameFields;
}