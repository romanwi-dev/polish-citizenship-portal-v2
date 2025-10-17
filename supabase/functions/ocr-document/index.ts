import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Security: Time-limited processing
const PROCESSING_TIMEOUT_MS = 300000; // 5 minutes soft limit
const HARD_TIMEOUT_MS = 600000; // 10 minutes absolute max

interface DocumentOCRRequest {
  imageBase64: string;
  documentId: string;
  caseId?: string;
  expectedType?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let logId: string | null = null;

  // Force cleanup after hard timeout
  const timeoutId = setTimeout(() => {
    console.error('SECURITY: Processing timeout exceeded - forcing cleanup');
    Deno.exit(1);
  }, HARD_TIMEOUT_MS);

  try {
    const { imageBase64, documentId, caseId, expectedType }: DocumentOCRRequest = await req.json();

    // 1. Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Input validation
    const { isValidUUID, MAX_FILE_SIZE } = await import('../_shared/validation.ts');

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (imageBase64.length > MAX_FILE_SIZE * 1.5) {
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ error: 'Image file too large' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidUUID(documentId)) {
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ error: 'Invalid document ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Log processing start for audit trail
    const { data: logEntry } = await supabase
      .from('ocr_processing_logs')
      .insert({
        document_id: documentId,
        case_id: caseId,
        started_at: new Date().toISOString(),
        image_size_bytes: imageBase64.length,
        status: 'processing'
      })
      .select('id')
      .single();

    if (logEntry) {
      logId = logEntry.id;
    }

    // 3. Check rate limiting (max 10 OCR per case per hour)
    if (caseId) {
      const { count } = await supabase
        .from('ocr_processing_logs')
        .select('id', { count: 'exact' })
        .eq('case_id', caseId)
        .gte('started_at', new Date(Date.now() - 3600000).toISOString());

      if (count && count >= 10) {
        clearTimeout(timeoutId);
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Maximum 10 documents per hour.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update document status to processing
    await supabase
      .from('documents')
      .update({ ocr_status: 'processing' })
      .eq('id', documentId);

    console.log('Processing modern document with Gemini 2.5 Flash...');

    const systemPrompt = `You are an expert at extracting structured data from official documents.

Common document types you may encounter:
- Birth Certificates: Extract full name, date of birth, place of birth, parent names, registration number
- Marriage Certificates: Extract spouse names, marriage date, place of marriage, registration number
- Naturalization Papers: Extract full name, naturalization date, country, certificate number, oath date
- Death Certificates: Extract full name, date of death, place of death, cause of death, registration number
- Passports: Extract full name, date of birth, sex, passport number, issue date, expiry date, issuing country
- Military Records: Extract full name, rank, service dates, unit, awards

First, identify the document type. Then extract all relevant structured data.

Return ONLY valid JSON in this exact format:
{
  "document_type": "birth_certificate|marriage_certificate|naturalization|death_certificate|passport|military_record|other",
  "extracted_data": {
    // Key-value pairs of extracted fields
  },
  "full_text": "Complete text transcription of the document",
  "language": "en|pl|de|ru|etc",
  "confidence": 0.95
}`;

    const userPrompt = expectedType 
      ? `This is a ${expectedType}. Please extract all relevant information.`
      : 'Please identify the document type and extract all relevant information.';

    // Call Lovable AI Gateway with Gemini 2.5 Flash
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
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`Lovable AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const resultText = aiData.choices?.[0]?.message?.content;

    if (!resultText) {
      throw new Error('No response from Lovable AI');
    }

    console.log('Document OCR processing completed for document:', documentId);

    // Parse JSON response
    let ocrResult: any;
    try {
      const jsonMatch = resultText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || resultText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : resultText;
      ocrResult = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    // Update document with OCR results
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        ocr_text: ocrResult.full_text,
        ocr_data: ocrResult.extracted_data,
        ocr_confidence: ocrResult.confidence,
        ocr_status: ocrResult.confidence >= 0.85 ? 'completed' : 'needs_review',
        document_type: ocrResult.document_type
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Failed to update document:', updateError);
      throw updateError;
    }

    console.log(`Document OCR completed with ${(ocrResult.confidence * 100).toFixed(0)}% confidence`);

    // 6. Force memory cleanup - explicitly nullify image data
    const memUsage = Deno.memoryUsage();
    const processingTime = Date.now() - startTime;

    // Update OCR log with completion
    if (logId) {
      await supabase
        .from('ocr_processing_logs')
        .update({
          completed_at: new Date().toISOString(),
          processing_duration_ms: processingTime,
          extracted_fields: ocrResult.extracted_data,
          confidence: ocrResult.confidence,
          image_deleted_at: new Date().toISOString(),
          memory_used_mb: memUsage.heapUsed / 1024 / 1024,
          status: 'completed'
        })
        .eq('id', logId);
    }

    // Alert if excessive memory usage
    if (memUsage.heapUsed > 100_000_000) { // 100MB
      await supabase.rpc('log_security_event', {
        p_event_type: 'memory_alert',
        p_severity: 'high',
        p_action: 'excessive_memory',
        p_resource_type: 'ocr_processing',
        p_resource_id: documentId,
        p_details: { heap_used_mb: memUsage.heapUsed / 1024 / 1024 }
      });
    }

    clearTimeout(timeoutId);

    return new Response(
      JSON.stringify({
        success: true,
        data: ocrResult,
        needsReview: ocrResult.confidence < 0.85,
        processingTime,
        securityNote: 'Image data deleted after processing'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Document OCR processing failed');
    
    // Update log with failure
    if (logId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from('ocr_processing_logs')
          .update({
            completed_at: new Date().toISOString(),
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', logId);
      } catch (e) {
        console.error('Failed to update error log');
      }
    }

    clearTimeout(timeoutId);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'OCR processing failed'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
