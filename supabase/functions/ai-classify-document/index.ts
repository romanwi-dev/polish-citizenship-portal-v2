import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClassificationRequest {
  documentId: string;
  caseId: string;
  imageBase64: string;
}

interface ClassificationResult {
  document_type: string;
  person_type: string;
  person_full_name: string;
  confidence: number;
  reasoning: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, caseId, imageBase64 }: ClassificationRequest = await req.json();

    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Get family context from master_table
    const { data: masterData } = await supabase
      .from('master_table')
      .select('*')
      .eq('case_id', caseId)
      .single();

    // Build context about family members
    const familyContext = masterData ? `
Family Members in this case:
- Applicant (AP): ${masterData.applicant_first_name || '?'} ${masterData.applicant_last_name || '?'}
- Father (F): ${masterData.father_first_name || '?'} ${masterData.father_last_name || '?'}
- Mother (M): ${masterData.mother_first_name || '?'} ${masterData.mother_maiden_name || '?'}
- Paternal Grandfather (PGF): ${masterData.pgf_first_name || '?'} ${masterData.pgf_last_name || '?'}
- Paternal Grandmother (PGM): ${masterData.pgm_first_name || '?'} ${masterData.pgm_maiden_name || '?'}
- Maternal Grandfather (MGF): ${masterData.mgf_first_name || '?'} ${masterData.mgf_last_name || '?'}
- Maternal Grandmother (MGM): ${masterData.mgm_first_name || '?'} ${masterData.mgm_maiden_name || '?'}
- Spouse (SPOUSE): ${masterData.spouse_first_name || '?'} ${masterData.spouse_last_name || '?'}
` : 'No family data available yet.';

    const systemPrompt = `You are an expert at classifying family documents for Polish citizenship cases.

Your task: Identify BOTH the document type AND whose document this is.

${familyContext}

DOCUMENT TYPES:
- birth_certificate: Birth certificates (Akt urodzenia)
- marriage_certificate: Marriage certificates (Akt małżeństwa)
- death_certificate: Death certificates (Akt zgonu)
- naturalization: Naturalization papers (Certificate of Naturalization)
- passport: Passport (any country)
- military_record: Military service records
- other: Other documents

PERSON TYPES:
- AP: Applicant (the person applying for Polish citizenship)
- SPOUSE: Applicant's spouse
- F: Father of applicant
- M: Mother of applicant
- PGF: Paternal Grandfather (father's father)
- PGM: Paternal Grandmother (father's mother)
- MGF: Maternal Grandfather (mother's father)
- MGM: Maternal Grandmother (mother's mother)

CLASSIFICATION LOGIC:
1. First, identify the document type from headers, seals, format
2. Extract the main person's name from the document
3. If the document is a birth certificate, the "child" is the person
4. If marriage certificate, there are two people (determine which one matches family members)
5. Match the extracted name against known family members above
6. Consider dates: PGF/PGM born ~1880-1930, F/M born ~1920-1970, AP born ~1950-2000
7. Use gender indicators: male→F/PGF/MGF, female→M/PGM/MGM/SPOUSE
8. For uncertain matches, prefer higher confidence on document type, lower on person type

Return ONLY valid JSON:
{
  "document_type": "birth_certificate",
  "person_type": "PGF",
  "person_full_name": "Jan Kowalski",
  "confidence": 0.92,
  "reasoning": "This is a birth certificate showing male born in 1895. Name matches Paternal Grandfather in family tree."
}`;

    console.log(`Classifying document ${documentId.substring(0, 8)} for case ${caseId}...`);

    // Call Lovable AI with Gemini 2.5 Flash
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
                text: 'Please classify this document and identify whose document it is.'
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
        temperature: 0.2,
        max_tokens: 500
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI classification error:', aiResponse.status, errorText);
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const resultText = aiData.choices?.[0]?.message?.content;

    if (!resultText) {
      throw new Error('No response from AI');
    }

    // Parse JSON response
    let classification: ClassificationResult;
    try {
      const jsonMatch = resultText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || resultText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : resultText;
      classification = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    // Update document with classification
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        ai_detected_type: classification.document_type,
        ai_detected_person: classification.person_type,
        detection_confidence: classification.confidence,
        person_type: classification.person_type, // Auto-set person_type from AI
        document_type: classification.document_type, // Auto-set document_type from AI
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Failed to update document:', updateError);
      throw updateError;
    }

    console.log(`Classification complete: ${classification.document_type} for ${classification.person_type} (${(classification.confidence * 100).toFixed(0)}% confident)`);

    return new Response(
      JSON.stringify({
        success: true,
        classification,
        needsReview: classification.confidence < 0.85
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Document classification failed:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Classification failed'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
