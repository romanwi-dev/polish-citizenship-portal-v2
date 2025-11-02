import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Security: Time-limited processing
const PROCESSING_TIMEOUT_MS = 240000; // 4 minutes
const HARD_TIMEOUT_MS = 300000; // 5 minutes absolute max

interface UniversalOCRRequest {
  imageBase64: string;
  documentId: string;
  caseId: string;
  documentType?: string;
  personType?: string;
}

interface UniversalOCRResult {
  // Original text
  original_text: string;
  detected_language: string;
  detected_era: string;
  detected_script: string;
  
  // Translations
  translations: {
    modern_russian?: string;
    polish: string;
    english: string;
  };
  
  // Extracted structured data
  extracted_data: {
    document_type: string;
    person_type: string;
    person_full_name: string;
    date_of_birth?: string;
    place_of_birth?: string;
    father_name?: string;
    mother_maiden_name?: string;
    date_of_event?: string;
    place_of_event?: string;
    additional_fields: Record<string, any>;
  };
  
  // Calendar conversion
  calendar_system: 'julian' | 'gregorian' | 'mixed' | 'unknown';
  dates_converted?: {
    julian?: string;
    gregorian?: string;
  };
  
  // Document metadata
  document_naming: {
    suggested_filename: string;
    person_type: string;
    document_type: string;
    key_identifiers: string[];
  };
  
  description: {
    summary: string;
    full_description: string;
    archival_significance: 'high' | 'medium' | 'low';
    legal_validity: string;
    tags: string[];
  };
  
  folder_organization: {
    category: string;
    subfolder: string;
    full_path: string;
  };
  
  confidence: {
    overall: number;
    ocr: number;
    translation_polish: number;
    translation_english: number;
    data_extraction: number;
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

    const requestData: UniversalOCRRequest = await req.json();
    imageBase64 = requestData.imageBase64;
    const { documentId, caseId, documentType, personType } = requestData;

    if (!imageBase64 || !documentId || !caseId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: imageBase64, documentId, and caseId' }),
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

    // Get family context from master_table for better person identification
    const { data: masterData } = await supabase
      .from('master_table')
      .select('*')
      .eq('case_id', caseId)
      .single();

    const familyContext = masterData ? `
Family Members in this case:
- Applicant (AP): ${masterData.applicant_first_name || '?'} ${masterData.applicant_last_name || '?'} (DOB: ${masterData.applicant_dob || 'unknown'})
- Father (F): ${masterData.father_first_name || '?'} ${masterData.father_last_name || '?'} (DOB: ${masterData.father_dob || 'unknown'})
- Mother (M): ${masterData.mother_first_name || '?'} ${masterData.mother_maiden_name || '?'} (DOB: ${masterData.mother_dob || 'unknown'})
- Paternal Grandfather (PGF): ${masterData.pgf_first_name || '?'} ${masterData.pgf_last_name || '?'} (DOB: ${masterData.pgf_dob || 'unknown'})
- Paternal Grandmother (PGM): ${masterData.pgm_first_name || '?'} ${masterData.pgm_maiden_name || '?'} (DOB: ${masterData.pgm_dob || 'unknown'})
- Maternal Grandfather (MGF): ${masterData.mgf_first_name || '?'} ${masterData.mgf_last_name || '?'} (DOB: ${masterData.mgf_dob || 'unknown'})
- Maternal Grandmother (MGM): ${masterData.mgm_first_name || '?'} ${masterData.mgm_maiden_name || '?'} (DOB: ${masterData.mgm_dob || 'unknown'})
- Spouse (SPOUSE): ${masterData.spouse_first_name || '?'} ${masterData.spouse_last_name || '?'}
` : 'No family data available yet.';

    // Create processing log
    const { data: logData } = await supabase
      .from('ocr_processing_logs')
      .insert({
        document_id: documentId,
        ocr_type: 'universal',
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

    console.log(`Processing universal OCR with Gemini 2.5 Pro (Log ID: ${logId})...`);

    const systemPrompt = `You are an expert paleographer, archivist, and multilingual translator specializing in Eastern European historical documents (1800-2025) for Polish citizenship cases.

${familyContext}

DOCUMENT ERAS YOU MUST RECOGNIZE:
- Pre-1918 Russian Empire: Old Cyrillic (ѣ, і, ѳ, ѵ), Julian calendar, Imperial Russian stamps
- 1918-1939 Polish II Republic: Polish, some Ukrainian/Belarusian
- 1939-1945 German occupation: German, Gothic script (Fraktur)
- 1945-1991 Communist Poland: Polish, Russian influences
- Modern (1991+): Standard Polish/English/other languages

LANGUAGES AND SCRIPTS YOU MUST HANDLE:
- Polish (all eras, modern and old spelling)
- Russian: Modern Cyrillic + Old orthography (ѣ, і, ѳ, ѵ)
- German: Standard + Fraktur/Gothic script
- Yiddish: Hebrew alphabet
- Ukrainian, Belarusian
- English, Spanish, French, Hebrew
- Mixed/multilingual documents

DOCUMENT TYPES:
- birth_certificate: Birth certificates (Akt urodzenia, Свидѣтельство о рожденіи)
- marriage_certificate: Marriage certificates
- death_certificate: Death certificates
- naturalization: Naturalization papers
- passport: Passport (any country)
- military_record: Military service records
- census: Census records
- church_record: Church metrical books
- civil_registry: Civil registry documents
- other: Other official documents

PERSON TYPES (based on family tree):
- AP: Applicant (the person applying for citizenship)
- SPOUSE: Applicant's spouse
- F: Father of applicant
- M: Mother of applicant
- PGF: Paternal Grandfather (father's father)
- PGM: Paternal Grandmother (father's mother)
- MGF: Maternal Grandfather (mother's father)
- MGM: Maternal Grandmother (mother's mother)

YOUR TASK:
1. **Identify document era and script** (pre-1918, communist, modern, etc.)
2. **Detect language(s)** - may be multilingual
3. **Transcribe original text EXACTLY** - preserve old letters like ѣ, і, ѳ, ѵ for historical accuracy
4. **Translate to**:
   - Modern Russian (if original is Old Russian/pre-1918)
   - Polish (always)
   - English (always)
5. **Extract structured data**: Names, dates, places, parent names, etc.
6. **Convert Julian → Gregorian dates** if needed (Julian calendar was 13 days behind in 1900s)
7. **Identify person type** by matching extracted name/DOB against family tree above
8. **Generate descriptive filename** following pattern: {PERSON}_{DOCTYPE}_{NAME}_{DATE}_{LOCATION}_Original.pdf
9. **Provide full description** for client understanding
10. **Determine folder organization** based on document type and person
11. **Assess archival significance**: high (critical for case), medium (supporting), low (informational)
12. **Assess legal validity**: valid_as_is, requires_apostille, requires_certified_translation, or requires_both

FOLDER CATEGORIES:
- 01_family_docs: Birth/marriage/death certs for family members
- 02_archive_documents: Documents from Polish/Russian/Ukrainian archives
- 03_local_documents: Documents from client's current country (USA, Canada, etc.)
- 04_translations: Translated versions of non-Polish docs
- 05_generated_forms: POAs, applications, etc.
- 06_government_correspondence: Letters from Polish government

SUBFOLDER PATHS (for family docs):
- AP_applicant/originals/
- SPOUSE/originals/
- F_father/originals/
- M_mother/originals/
- PGF_paternal_grandfather/originals/
- PGM_paternal_grandmother/originals/
- MGF_maternal_grandfather/originals/
- MGM_maternal_grandmother/originals/

CRITICAL RULES:
- If handwritten, note it in description
- If faded/damaged, note condition
- If stamps/seals present, describe them
- Match person by name AND approximate birth year (PGF ~1880-1930, F ~1920-1970, AP ~1950-2000)
- For uncertain person identification, use context clues: male→F/PGF/MGF, female→M/PGM/MGM

Return ONLY valid JSON in this EXACT format:
{
  "original_text": "Full transcription preserving original spelling and old letters...",
  "detected_language": "OLD_RUSSIAN" | "POLISH" | "GERMAN" | "ENGLISH" | "YIDDISH" | "MIXED" | etc.,
  "detected_era": "pre_1918" | "interwar_1918_1939" | "ww2_1939_1945" | "communist_1945_1991" | "modern_1991_plus",
  "detected_script": "old_cyrillic" | "modern_cyrillic" | "latin" | "fraktur" | "hebrew" | "mixed",
  
  "translations": {
    "modern_russian": "Modern Russian translation (null if not applicable)",
    "polish": "Polish translation...",
    "english": "English translation..."
  },
  
  "extracted_data": {
    "document_type": "birth_certificate",
    "person_type": "PGF",
    "person_full_name": "Jan Kowalski",
    "date_of_birth": "1920-03-15",
    "place_of_birth": "Warsaw, Poland",
    "father_name": "Piotr Kowalski",
    "mother_maiden_name": "Anna Nowak",
    "date_of_event": "1920-03-15",
    "place_of_event": "Warsaw",
    "additional_fields": {
      "registry_office": "Imperial Russian Civil Registry",
      "document_number": "123/1920",
      "any_other_relevant_data": "..."
    }
  },
  
  "calendar_system": "julian" | "gregorian" | "mixed" | "unknown",
  "dates_converted": {
    "julian": "03.03.1920",
    "gregorian": "15.03.1920"
  },
  
  "document_naming": {
    "suggested_filename": "PGF_Birth_Cert_Jan_Kowalski_1920-03-15_Warsaw_Original.pdf",
    "person_type": "PGF",
    "document_type": "birth_certificate",
    "key_identifiers": ["Jan Kowalski", "1920", "Warsaw"]
  },
  
  "description": {
    "summary": "PGF Jan Kowalski birth cert (1920, Warsaw)",
    "full_description": "Birth certificate for Jan Kowalski, born 15 March 1920 in Warsaw, Poland. Document issued by the Imperial Russian Civil Registry Office in Old Cyrillic script. Father: Piotr Kowalski, Mother: Anna Nowak (maiden). Document is handwritten in black ink on yellowed paper with official stamps. This is the original document, not a copy.",
    "archival_significance": "high",
    "legal_validity": "requires_certified_translation",
    "tags": ["birth_certificate", "old_russian", "handwritten", "original", "PGF", "warsaw", "1920", "imperial_russia"]
  },
  
  "folder_organization": {
    "category": "01_family_docs",
    "subfolder": "PGF_paternal_grandfather/originals/",
    "full_path": "01_family_docs/PGF_paternal_grandfather/originals/"
  },
  
  "confidence": {
    "overall": 0.92,
    "ocr": 0.95,
    "translation_polish": 0.90,
    "translation_english": 0.90,
    "data_extraction": 0.88
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
                text: `Please analyze this document. ${documentType ? `Expected type: ${documentType}.` : ''} ${personType ? `Expected person: ${personType}.` : ''} Extract all information, translate to Polish and English, and provide complete metadata.`
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
        max_tokens: 6000
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

    let ocrResult: UniversalOCRResult;
    try {
      const jsonMatch = resultText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || resultText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : resultText;
      ocrResult = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    // Update document with comprehensive OCR results
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        ocr_text: ocrResult.original_text,
        ocr_data: ocrResult,
        ocr_confidence: ocrResult.confidence.overall,
        ocr_status: ocrResult.confidence.overall >= 0.75 ? 'completed' : 'needs_review',
        language: ocrResult.detected_language,
        document_type: ocrResult.extracted_data.document_type,
        person_type: ocrResult.extracted_data.person_type,
        
        // Translation fields
        translated_text_polish: ocrResult.translations.polish,
        translated_text_english: ocrResult.translations.english,
        translation_confidence: (ocrResult.confidence.translation_polish + ocrResult.confidence.translation_english) / 2,
        
        // Naming and description
        ai_generated_name: ocrResult.document_naming.suggested_filename,
        name_confidence: ocrResult.confidence.overall,
        ai_description: ocrResult.description.full_description,
        ai_summary: ocrResult.description.summary,
        document_tags: ocrResult.description.tags,
        archival_significance: ocrResult.description.archival_significance,
        legal_validity: ocrResult.description.legal_validity,
        
        // Folder organization
        folder_category: ocrResult.folder_organization.category,
        subfolder_path: ocrResult.folder_organization.subfolder,
        
        // AI detection fields
        ai_detected_type: ocrResult.extracted_data.document_type,
        ai_detected_person: ocrResult.extracted_data.person_type,
        detection_confidence: ocrResult.confidence.data_extraction
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Failed to update document:', updateError);
      throw updateError;
    }

    // Check if translation is needed (non-Polish documents)
    const needsTranslation = ocrResult.detected_language !== 'POLISH' && 
                            ocrResult.detected_language !== 'UNKNOWN';
    
    if (needsTranslation) {
      // Create translation request with correct schema fields
      const { error: translationError } = await supabase
        .from('translation_requests')
        .insert({
          document_id: documentId,
          case_id: caseId,
          source_language: ocrResult.detected_language,
          target_language: 'PL',
          status: 'pending',
          priority: 'medium',
          internal_notes: `AI translation available (confidence: ${ocrResult.confidence.translation_polish.toFixed(2)})`
        });
      
      if (translationError) {
        console.error('Failed to create translation request:', translationError);
        // Don't fail the whole operation, just log the error
      }
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
          detected_language: ocrResult.detected_language,
          detected_era: ocrResult.detected_era,
          confidence: ocrResult.confidence.overall,
          extracted_fields: ocrResult,
          image_size_bytes: imageSizeBytes,
          image_deleted_at: new Date().toISOString()
        })
        .eq('id', logId);
    }

    console.log(`Universal OCR completed: ${ocrResult.extracted_data.document_type} for ${ocrResult.extracted_data.person_type} with ${(ocrResult.confidence.overall * 100).toFixed(0)}% confidence in ${processingDuration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        data: ocrResult,
        needsReview: ocrResult.confidence.overall < 0.75,
        needsSwornTranslation: needsTranslation && ocrResult.description.legal_validity.includes('certified_translation'),
        processingTime: processingDuration
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const processingDuration = Date.now() - startTime;
    console.error('Universal OCR error:', error);
    
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
