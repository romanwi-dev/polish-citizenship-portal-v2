import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

  try {
    const { imageBase64, documentId, documentType = 'unknown', language = 'russian', era = '1800s' }: HistoricalOCRRequest = await req.json();

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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update document status to processing
    await supabase
      .from('documents')
      .update({ ocr_status: 'processing' })
      .eq('id', documentId);

    console.log('Processing historical document with Gemini 2.5 Pro...');

    // Specialized prompt for historical Russian/Cyrillic documents
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

    // Call Lovable AI Gateway with Gemini 2.5 Pro for superior historical document processing
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro', // Pro model for complex handwriting
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
        temperature: 0.1, // Low temperature for accuracy
        max_tokens: 4000
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

    console.log('Raw AI response:', resultText);

    // Parse JSON response
    let ocrResult: HistoricalOCRResult;
    try {
      // Extract JSON from markdown code blocks if present
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

    console.log(`Historical OCR completed with ${(ocrResult.confidence.overall * 100).toFixed(0)}% confidence`);

    return new Response(
      JSON.stringify({
        success: true,
        data: ocrResult,
        needsReview: ocrResult.confidence.overall < 0.75
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Historical OCR error:', error);
    
    // Update document status to failed if we have documentId
    try {
      const { documentId } = await req.json();
      if (documentId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from('documents')
          .update({ ocr_status: 'failed' })
          .eq('id', documentId);
      }
    } catch (e) {
      console.error('Failed to update error status:', e);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
