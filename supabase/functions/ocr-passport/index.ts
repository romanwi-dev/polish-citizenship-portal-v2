import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROCESSING_TIMEOUT_MS = 300000; // 5 minutes max
const HARD_TIMEOUT_MS = 600000; // 10 minutes absolute max

// Force cleanup after hard timeout
setTimeout(() => {
  console.error('SECURITY: Processing timeout exceeded - forcing cleanup');
  Deno.exit(1);
}, HARD_TIMEOUT_MS);

interface PassportData {
  applicantFirstName: string;
  applicantLastName: string;
  applicantDateOfBirth: string;
  applicantPlaceOfBirth: string;
  applicantDocumentNumber: string;
  applicantNationality: string;
  documentIssueDate: string;
  documentExpiryDate: string;
  sex: "M" | "F";
}


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let imageBase64: string | null = null;
  
  try {
    // 1. Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageBase64: img, caseId, personType = 'AP', documentType = 'passport' } = await req.json();
    imageBase64 = img;
    
    // Input validation
    const { isValidUUID, MAX_FILE_SIZE } = await import('../_shared/validation.ts');
    const { isPassportValid, isPassportExpiringSoon } = await import('../_shared/dateUtils.ts');
    const { validateDocumentType, mustValidatePassportExpiry, VALIDATION_ERRORS } = await import('../_shared/validationRules.ts');
    
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic size check on base64 string
    if (imageBase64.length > MAX_FILE_SIZE * 1.5) { // Base64 is ~1.37x larger
      return new Response(
        JSON.stringify({ error: "Image file too large" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (caseId && !isValidUUID(caseId)) {
      return new Response(
        JSON.stringify({ error: "Invalid case ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Call Lovable AI for OCR extraction using vision model
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a passport OCR expert. Extract all visible information from the passport image and return it as JSON.
            
Format dates as DD.MM.YYYY (Polish format).
Return uppercase for names.
Extract ALL visible fields.

Return JSON with these exact fields:
{
  "applicantFirstName": "string",
  "applicantLastName": "string", 
  "applicantDateOfBirth": "DD.MM.YYYY",
  "applicantPlaceOfBirth": "string",
  "applicantDocumentNumber": "string",
  "applicantNationality": "string",
  "documentIssueDate": "DD.MM.YYYY",
  "documentExpiryDate": "DD.MM.YYYY",
  "sex": "M or F"
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all passport information from this image"
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_passport_data",
              description: "Extract structured passport information",
              parameters: {
                type: "object",
                properties: {
                  applicantFirstName: { type: "string" },
                  applicantLastName: { type: "string" },
                  applicantDateOfBirth: { type: "string" },
                  applicantPlaceOfBirth: { type: "string" },
                  applicantDocumentNumber: { type: "string" },
                  applicantNationality: { type: "string" },
                  documentIssueDate: { type: "string" },
                  documentExpiryDate: { type: "string" },
                  sex: { type: "string", enum: ["M", "F"] }
                },
                required: [
                  "applicantFirstName",
                  "applicantLastName",
                  "applicantDateOfBirth",
                  "applicantDocumentNumber",
                  "sex"
                ]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_passport_data" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error(`AI extraction failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("OCR processing completed for case:", caseId);

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const passportData: PassportData = JSON.parse(toolCall.function.arguments);

    // Validate document type for person type
    const docTypeValidation = validateDocumentType(personType as any, documentType as any);
    if (!docTypeValidation.valid) {
      return new Response(
        JSON.stringify({ 
          error: docTypeValidation.error,
          errorType: 'INVALID_DOCUMENT_TYPE'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate passport expiry for adults
    const warnings: string[] = [];
    if (mustValidatePassportExpiry(personType as any, documentType as any)) {
      const validation = isPassportValid(passportData.documentExpiryDate);
      
      if (!validation.valid) {
        return new Response(
          JSON.stringify({ 
            error: VALIDATION_ERRORS.EXPIRED_PASSPORT(personType, passportData.documentExpiryDate),
            errorType: 'EXPIRED_PASSPORT',
            expiryDate: passportData.documentExpiryDate
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check if expiring soon (within 6 months)
      if (validation.daysUntilExpiry !== undefined && validation.daysUntilExpiry <= 180) {
        const warningMsg = VALIDATION_ERRORS.EXPIRES_SOON(
          passportData.documentExpiryDate,
          validation.daysUntilExpiry
        );
        warnings.push(warningMsg);
        console.warn(warningMsg);
      }
    }

    // Update intake_data if caseId provided
    if (caseId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: updateError } = await supabase
        .from("intake_data")
        .update({
          first_name: passportData.applicantFirstName,
          last_name: passportData.applicantLastName,
          date_of_birth: passportData.applicantDateOfBirth,
          place_of_birth: passportData.applicantPlaceOfBirth,
          passport_number: passportData.applicantDocumentNumber,
          passport_issue_date: passportData.documentIssueDate,
          passport_expiry_date: passportData.documentExpiryDate,
          sex: passportData.sex,
          updated_at: new Date().toISOString(),
        })
        .eq("case_id", caseId);

      if (updateError) {
        console.error("Error updating intake data:", updateError.message);
      } else {
        console.log("Intake data updated successfully for case:", caseId);
      }
    }

    // Force garbage collection
    imageBase64 = null;
    const memUsage = Deno.memoryUsage();
    const processingTime = Date.now() - startTime;

    console.log(`Passport OCR completed in ${processingTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        data: passportData,
        processingTime,
        securityNote: 'Image data deleted after processing',
        warnings,
        validation: {
          personType,
          documentType,
          isPassportValid: mustValidatePassportExpiry(personType as any, documentType as any) 
            ? isPassportValid(passportData.documentExpiryDate).valid 
            : true,
          expiryDate: passportData.documentExpiryDate
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("OCR processing failed");
    return new Response(
      JSON.stringify({
        error: "OCR processing failed",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
