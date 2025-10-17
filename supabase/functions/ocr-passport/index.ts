import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

  try {
    const { imageBase64, caseId } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing passport OCR for case:", caseId);

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
        console.error("Error updating intake data:", updateError);
      } else {
        console.log("Intake data updated successfully");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: passportData,
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
