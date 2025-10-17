import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WSCLetterOCRRequest {
  imageBase64: string;
  letterId: string;
  caseId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, letterId, caseId }: WSCLetterOCRRequest = await req.json();

    // Input validation
    const { isValidUUID, MAX_FILE_SIZE } = await import('../_shared/validation.ts');

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (imageBase64.length > MAX_FILE_SIZE * 1.5) {
      return new Response(
        JSON.stringify({ error: 'Image file too large' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidUUID(letterId) || !isValidUUID(caseId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid ID format' }),
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

    console.log('Processing WSC letter with Gemini 2.5 Flash...');

    const systemPrompt = `You are an expert at extracting structured data from Polish government correspondence, specifically letters from the Mazovian Voivodeship Office (Mazowiecki Urząd Wojewódzki) regarding Polish citizenship applications.

Extract the following information:
1. Letter date (when the letter was written)
2. Reference number (znak sprawy)
3. Response deadline (termin na odpowiedź)
4. List of required documents or additional information requested
5. Any specific instructions or conditions

Return ONLY valid JSON in this exact format:
{
  "letter_date": "DD.MM.YYYY or null",
  "reference_number": "reference number or null",
  "deadline": "DD.MM.YYYY or null",
  "required_documents": ["document 1", "document 2", ...],
  "instructions": "Any specific instructions or conditions",
  "full_text": "Complete text transcription",
  "confidence": 0.95
}`;

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
                text: 'This is a letter from the Mazovian Voivodeship Office regarding a Polish citizenship application. Please extract all relevant information.'
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

    console.log('WSC letter OCR processing completed for letter:', letterId);

    let ocrResult: any;
    try {
      const jsonMatch = resultText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || resultText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : resultText;
      ocrResult = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    // Convert dates to ISO format if present
    const parsePolishDate = (dateStr: string | null): string | null => {
      if (!dateStr) return null;
      const parts = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
      if (!parts) return null;
      return `${parts[3]}-${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    };

    const letterDate = parsePolishDate(ocrResult.letter_date);
    const deadline = parsePolishDate(ocrResult.deadline);

    // Update WSC letter with OCR results
    const { error: updateError } = await supabase
      .from('wsc_letters')
      .update({
        ocr_text: ocrResult.full_text,
        letter_date: letterDate,
        reference_number: ocrResult.reference_number,
        deadline: deadline,
        hac_reviewed: false
      })
      .eq('id', letterId);

    if (updateError) {
      console.error('Failed to update WSC letter:', updateError);
      throw updateError;
    }

    // Create tasks for required documents if any
    if (ocrResult.required_documents && ocrResult.required_documents.length > 0) {
      for (const doc of ocrResult.required_documents) {
        await supabase.from('tasks').insert({
          case_id: caseId,
          task_type: 'document_required',
          title: `WSC Required: ${doc}`,
          description: ocrResult.instructions || 'Required by Voivodeship Office',
          priority: 'high',
          due_date: deadline,
          status: 'pending'
        });
      }
    }

    console.log(`WSC letter OCR completed with ${(ocrResult.confidence * 100).toFixed(0)}% confidence`);

    return new Response(
      JSON.stringify({
        success: true,
        data: ocrResult,
        tasksCreated: ocrResult.required_documents?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('WSC letter OCR processing failed');

    return new Response(
      JSON.stringify({
        success: false,
        error: 'OCR processing failed'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
