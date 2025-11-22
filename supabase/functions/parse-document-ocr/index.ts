import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getErrorMessage } from "../_shared/error-utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;

    if (!file) {
      throw new Error('No file provided');
    }

    console.log('Processing document:', {
      name: file.name,
      type: file.type,
      size: file.size,
      documentType
    });

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isPDF = file.type === 'application/pdf' || fileExtension === 'pdf';
    const isOfficeDoc = ['doc', 'docx', 'odt'].includes(fileExtension || '');

    if (!isPDF && !isOfficeDoc) {
      throw new Error('Unsupported file type. Please upload PDF or Office document.');
    }

    // For now, we'll extract text using a simple approach
    // In production, you'd use a proper PDF/document parsing library
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    let extractedText = '';
    
    if (isPDF) {
      // Simple PDF text extraction (this is a basic implementation)
      // For production, consider using pdf-parse or similar library
      const decoder = new TextDecoder('utf-8');
      extractedText = decoder.decode(uint8Array);
      
      // Clean up PDF binary data - extract readable text
      extractedText = extractedText
        .replace(/[^\x20-\x7E\n\r]/g, ' ') // Remove non-printable chars
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    } else {
      // For Office docs, convert to text
      const decoder = new TextDecoder('utf-8');
      extractedText = decoder.decode(uint8Array);
      extractedText = extractedText
        .replace(/[^\x20-\x7E\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    if (!extractedText || extractedText.length < 10) {
      throw new Error('No readable text content found in document. Please try uploading an image or different format.');
    }

    console.log('Extracted text length:', extractedText.length);

    // Parse extracted text with AI
    const personType = formData.get('personType') as string || 'AP';
    const structuredData = await extractStructuredData(extractedText, documentType, personType);

    console.log('Structured data extracted successfully');

    // Return in same format as OCR endpoints
    return new Response(
      JSON.stringify({
        success: true,
        extracted_data: structuredData,
        confidence: structuredData.confidence || 0.85,
        document_type: documentType,
        text_length: extractedText.length,
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in parse-document-ocr:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: getErrorMessage(error) 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function extractStructuredData(
  text: string, 
  documentType: string,
  personType: string = 'AP'
): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY not configured');
  }
  
  const { isPassportValid } = await import('../_shared/dateUtils.ts');
  const { validateDocumentType, mustValidatePassportExpiry, VALIDATION_ERRORS } = await import('../_shared/validationRules.ts');

  const systemPrompt = documentType === 'passport' 
    ? `You are a passport data extraction expert. Extract structured information from the provided passport document text.
Return ONLY valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "first_name": "string",
  "last_name": "string", 
  "middle_name": "string or null",
  "date_of_birth": "YYYY-MM-DD",
  "place_of_birth": "string",
  "passport_number": "string",
  "issue_date": "YYYY-MM-DD",
  "expiry_date": "YYYY-MM-DD",
  "nationality": "string",
  "sex": "Male or Female",
  "confidence": 0.85
}
Only include fields you can confidently extract. Use null for missing fields.`
    : `You are a birth certificate data extraction expert. Extract structured information from the provided birth certificate text.
Return ONLY valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "first_name": "string",
  "last_name": "string",
  "middle_name": "string or null", 
  "date_of_birth": "YYYY-MM-DD",
  "place_of_birth": "string",
  "city_of_birth": "string",
  "country_of_birth": "string",
  "father_first_name": "string or null",
  "father_last_name": "string or null",
  "mother_first_name": "string or null",
  "mother_last_name": "string or null",
  "mother_maiden_name": "string or null",
  "sex": "Male or Female",
  "confidence": 0.85
}
Only include fields you can confidently extract. Use null for missing fields.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Extract structured data from this ${documentType} document text:\n\n${text.substring(0, 4000)}` }
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('AI rate limit exceeded. Please try again later.');
    }
    if (response.status === 402) {
      throw new Error('AI credits exhausted. Please add funds to continue.');
    }
    const errorText = await response.text();
    console.error('AI API error:', response.status, errorText);
    throw new Error('AI extraction failed');
  }

  const aiResponse = await response.json();
  const content = aiResponse.choices[0].message.content;
  
  // Clean up response - remove markdown code blocks if present
  const cleanContent = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  const extractedData = JSON.parse(cleanContent);
  
  // Validate document type for person type (only for passports)
  if (documentType === 'passport') {
    const docTypeValidation = validateDocumentType(personType as any, 'passport');
    if (!docTypeValidation.valid) {
      throw new Error(docTypeValidation.error);
    }

    // Validate passport expiry for adults
    if (mustValidatePassportExpiry(personType as any, 'passport') && extractedData.expiry_date) {
      const validation = isPassportValid(extractedData.expiry_date);
      
      if (!validation.valid) {
        throw new Error(VALIDATION_ERRORS.EXPIRED_PASSPORT(personType, extractedData.expiry_date));
      }
      
      // Add warning if expiring soon
      if (validation.daysUntilExpiry !== undefined && validation.daysUntilExpiry <= 180) {
        extractedData.warning = VALIDATION_ERRORS.EXPIRES_SOON(
          extractedData.expiry_date,
          validation.daysUntilExpiry
        );
      }
    }
  }
  
  return extractedData;
}

