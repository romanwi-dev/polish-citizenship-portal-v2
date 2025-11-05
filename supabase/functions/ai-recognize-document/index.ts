import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * AI Document Recognition and Standardization
 * 
 * This function:
 * 1. Analyzes OCR text to identify document type
 * 2. Determines person type (applicant, father, mother, etc.)
 * 3. Generates standardized file name
 * 4. Suggests standardized Dropbox path
 */

interface RecognitionRequest {
  documentId: string;
  caseId: string;
  ocrText?: string;
  currentFileName?: string;
}

interface DocumentRecognition {
  documentType: string;
  personType: string;
  confidence: number;
  suggestedFileName: string;
  suggestedDropboxPath: string;
  description: string;
}

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

// Standard document types
const DOCUMENT_TYPES = [
  'Birth Certificate',
  'Marriage Certificate',
  'Death Certificate',
  'Passport',
  'National ID',
  'Naturalization Certificate',
  'Citizenship Certificate',
  'Military Record',
  'School Record',
  'Work Permit',
  'Residence Permit',
  'Divorce Certificate',
  'Court Order',
  'Name Change Document',
  'Apostille',
  'Translation',
  'Other'
];

// Standard person types
const PERSON_TYPES = [
  'AP', // Applicant
  'F',  // Father
  'M',  // Mother
  'PGF', // Paternal Grandfather
  'PGM', // Paternal Grandmother
  'MGF', // Maternal Grandfather
  'MGM', // Maternal Grandmother
  'SP', // Spouse
  'CH', // Child
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, caseId, ocrText, currentFileName }: RecognitionRequest = await req.json();

    if (!documentId || !caseId) {
      return new Response(
        JSON.stringify({ error: 'documentId and caseId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get document and case data
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('name, ocr_text, dropbox_path')
      .eq('id', documentId)
      .single();

    if (docError) throw docError;

    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('client_name, dropbox_path')
      .eq('id', caseId)
      .single();

    if (caseError) throw caseError;

    const textToAnalyze = ocrText || document.ocr_text || '';
    const fileName = currentFileName || document.name || '';

    console.log(`[ai-recognize-document] Analyzing: ${fileName}`);

    // Call Lovable AI to recognize document
    const aiPrompt = `Analyze this document and identify:

1. **Document Type**: What kind of document is this? Choose from: ${DOCUMENT_TYPES.join(', ')}
2. **Person Type**: Who does this document belong to? Choose from:
   - AP (Applicant)
   - F (Father)
   - M (Mother)
   - PGF (Paternal Grandfather)
   - PGM (Paternal Grandmother)
   - MGF (Maternal Grandfather)
   - MGM (Maternal Grandmother)
   - SP (Spouse)
   - CH (Child)
3. **Full Name**: Extract the full name from the document
4. **Date**: Extract any relevant date (birth date, issue date, etc.)
5. **Country**: Country of issuance

**Current file name:** ${fileName}

**OCR Text:**
${textToAnalyze.substring(0, 3000)}

**Instructions:**
- Be precise and confident in your analysis
- If you're unsure, use the file name as a hint
- Return your analysis in JSON format`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a document recognition AI specialized in identifying Polish citizenship application documents. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'identify_document',
            description: 'Identify document type, person, and extract key information',
            parameters: {
              type: 'object',
              properties: {
                documentType: {
                  type: 'string',
                  enum: DOCUMENT_TYPES,
                  description: 'Type of document'
                },
                personType: {
                  type: 'string',
                  enum: PERSON_TYPES,
                  description: 'Person this document belongs to'
                },
                fullName: {
                  type: 'string',
                  description: 'Full name from document'
                },
                date: {
                  type: 'string',
                  description: 'Relevant date (DD.MM.YYYY format)'
                },
                country: {
                  type: 'string',
                  description: 'Country of issuance'
                },
                confidence: {
                  type: 'number',
                  description: 'Confidence score 0-100'
                },
                description: {
                  type: 'string',
                  description: 'Brief description of the document'
                }
              },
              required: ['documentType', 'personType', 'confidence', 'description'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'identify_document' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[ai-recognize-document] AI error:', errorText);
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const recognition = JSON.parse(toolCall.function.arguments);

    console.log('[ai-recognize-document] Recognition:', recognition);

    // Generate standardized file name
    // Format: [DOCUMENT_TYPE] - [PERSON_TYPE] - [NAME] - [DATE].ext
    const ext = fileName.split('.').pop() || 'pdf';
    const name = recognition.fullName || caseData.client_name || 'UNKNOWN';
    const date = recognition.date ? ` - ${recognition.date}` : '';
    
    const suggestedFileName = `${recognition.documentType} - ${recognition.personType} - ${name}${date}.${ext}`;

    // Generate standardized Dropbox path
    // Format: /CASES/[TIER]/[CLIENT_NAME]/DOCUMENTS/[PERSON_TYPE]/[DOCUMENT_TYPE]/
    const tier = caseData.dropbox_path?.split('/')[2] || 'STANDARD';
    const clientName = caseData.client_name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const suggestedPath = `/CASES/${tier}/${clientName}/DOCUMENTS/${recognition.personType}/${recognition.documentType}`;

    const result: DocumentRecognition = {
      documentType: recognition.documentType,
      personType: recognition.personType,
      confidence: recognition.confidence,
      suggestedFileName,
      suggestedDropboxPath: suggestedPath,
      description: recognition.description
    };

    // Update document in database
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        document_type: recognition.documentType,
        person_type: recognition.personType,
        ai_classification_confidence: recognition.confidence,
        ai_classification_result: recognition,
        name: suggestedFileName, // Update to standardized name
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('[ai-recognize-document] Update error:', updateError);
    }

    console.log(`[ai-recognize-document] Success: ${suggestedFileName}`);

    return new Response(
      JSON.stringify({
        success: true,
        recognition: result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[ai-recognize-document] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
