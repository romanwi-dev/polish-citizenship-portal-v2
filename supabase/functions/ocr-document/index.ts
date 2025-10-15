import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentOCRRequest {
  imageBase64: string;
  documentId: string;
  expectedType?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, documentId, expectedType }: DocumentOCRRequest = await req.json();

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

    console.log('Raw AI response:', resultText);

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

    return new Response(
      JSON.stringify({
        success: true,
        data: ocrResult,
        needsReview: ocrResult.confidence < 0.85
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Document OCR error:', error);
    
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
