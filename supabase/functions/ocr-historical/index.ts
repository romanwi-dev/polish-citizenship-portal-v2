import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Security: Time-limited processing
const PROCESSING_TIMEOUT_MS = 240000; // 4 minutes
const HARD_TIMEOUT_MS = 300000; // 5 minutes absolute max

interface HistoricalOCRRequest {
  imageBase64: string;
  documentId: string;
  documentType?: string;
  language?: string;
  era?: string;
}

interface HistoricalOCRResult {
  original_text: string;
  modern_russian?: string;
  polish?: string;
  english: string;
  names: string[];
  dates: Array<{
    text: string;
    type: 'julian' | 'gregorian' | 'unknown';
    modern?: string;
  }>;
  places: string[];
  document_type: string;
  confidence: {
    overall: number;
    text: number;
    names: number;
    dates: number;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let imageBase64: string | null = null;
  let logId: string | null = null;

  try {
    // Validate authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('Security: Unauthenticated OCR request blocked');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData: HistoricalOCRRequest = await req.json();
    imageBase64 = requestData.imageBase64;
    const { documentId, documentType = 'unknown', language = 'russian', era = '1800s' } = requestData;

    if (!imageBase64 || !documentId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: imageBase64 and documentId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create processing log
    const { data: logData } = await supabase
      .from('ocr_processing_logs')
      .insert({
        document_id: documentId,
        status: 'processing',
        image_size_bytes: imageBase64.length,
        started_at: new Date().toISOString()
      })
      .select('id')
      .single();

    logId = logData?.id || null;

    // Update document status to processing
    await supabase
      .from('documents')
      .update({ ocr_status: 'processing' })
      .eq('id', documentId);

    console.log(`Processing historical document with Gemini 2.5 Pro (Log ID: ${logId})...`);
    console.log(`NOTE: This function is DEPRECATED. Use ocr-universal for all new documents.`);

    const systemPrompt = `You are an expert paleographer and historian specializing in 19th and early 20th-century Russian archival documents written in pre-1918 Cyrillic script.

These documents may contain:
- Old Cyrillic letters like ѣ (yat), і (i decimal), ѳ (fita), ѵ (izhitsa)
- Cursive handwriting styles from ${era}
- Faded or damaged paper
- Mixed Russian, Polish, German, or Yiddish text
- Julian calendar dates (which differ from Gregorian by 12-13 days)
- Old place names and administrative divisions

Your task is to:
1. Transcribe the full text preserving original spelling and old letters
2. Translate to modern Russian (if original is old Russian)
3. Translate to Polish
4. Translate to English
5. Extract all personal names mentioned
6. Extract all dates (note calendar type)
7. Extract all place names
8. Identify the document type (birth record, marriage record, death record, census, military record, etc.)
9. Provide confidence scores for each extraction

Return ONLY valid JSON in this exact format:
{
  "original_text": "Full transcription in original Cyrillic...",
  "modern_russian": "Modern Russian translation (null if not applicable)",
  "polish": "Polish translation...",
  "english": "English translation...",
  "names": ["Name 1", "Name 2", ...],
  "dates": [
    {"text": "original date text", "type": "julian|gregorian|unknown", "modern": "DD.MM.YYYY if converted"}
  ],
  "places": ["Place 1", "Place 2", ...],
  "document_type": "type of document",
  "confidence": {
    "overall": 0.85,
    "text": 0.88,
    "names": 0.90,
    "dates": 0.82
  }
}`;

    // Security: Timeout enforcement
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Processing timeout exceeded')), PROCESSING_TIMEOUT_MS)
    );

    const processingPromise = fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
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
                text: `This is a historical ${language} document from the ${era}. Document type: ${documentType}. Please transcribe, translate, and extract structured data.`
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
        max_tokens: 4000
      }),
    });

    const aiResponse = await Promise.race([processingPromise, timeoutPromise]) as Response;

    // Security: Clear image data from memory immediately after AI processing
    const imageSizeBytes = imageBase64.length;
    imageBase64 = null;

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

    console.log('Raw AI response received');

    let ocrResult: HistoricalOCRResult;
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
        ocr_text: ocrResult.original_text,
        ocr_data: ocrResult,
        ocr_confidence: ocrResult.confidence.overall,
        ocr_status: ocrResult.confidence.overall >= 0.75 ? 'completed' : 'needs_review',
        document_type: ocrResult.document_type
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Failed to update document:', updateError);
      throw updateError;
    }

    const processingDuration = Date.now() - startTime;

    // Update processing log with success
    if (logId) {
      await supabase
        .from('ocr_processing_logs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          processing_duration_ms: processingDuration,
          confidence: ocrResult.confidence.overall,
          extracted_fields: ocrResult,
          image_size_bytes: imageSizeBytes,
          image_deleted_at: new Date().toISOString()
        })
        .eq('id', logId);
    }

    console.log(`Historical OCR completed with ${(ocrResult.confidence.overall * 100).toFixed(0)}% confidence in ${processingDuration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        data: ocrResult,
        needsReview: ocrResult.confidence.overall < 0.75,
        processingTime: processingDuration
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const processingDuration = Date.now() - startTime;
    console.error('Historical OCR error:', error);
    
    // Security: Clear image data on error
    imageBase64 = null;

    // Update processing log with failure
    if (logId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase
        .from('ocr_processing_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          processing_duration_ms: processingDuration,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          image_deleted_at: new Date().toISOString()
        })
        .eq('id', logId);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } finally {
    // Security: Final cleanup - ensure image data is cleared
    imageBase64 = null;
  }
});
