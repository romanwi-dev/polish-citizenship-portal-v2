import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );

  try {
    const { documentId, dropboxPath } = await req.json();
    
    console.log(`[pdf-extract] Processing PDF: ${dropboxPath}`);

    if (!dropboxPath) {
      throw new Error('No Dropbox path provided');
    }

    // Download PDF from Dropbox
    console.log(`📥 Downloading PDF from Dropbox...`);
    const { data: downloadData, error: downloadError } = await supabase.functions.invoke(
      "dropbox-download",
      {
        body: { filePath: dropboxPath }
      }
    );

    if (downloadError) {
      throw new Error(`Dropbox download failed: ${downloadError.message}`);
    }

    if (!downloadData?.arrayBuffer) {
      throw new Error('No file data returned from Dropbox');
    }

    console.log(`✅ Downloaded ${downloadData.arrayBuffer.byteLength} bytes`);

    // Convert to base64 for Lovable AI
    const uint8Array = new Uint8Array(downloadData.arrayBuffer);
    const base64 = btoa(String.fromCharCode(...uint8Array));
    const pdfBase64 = `data:application/pdf;base64,${base64}`;

    console.log(`📄 Calling Lovable AI for PDF text extraction...`);

    // Use Lovable AI to extract text from PDF
    const response = await fetch("https://api.lovable.app/v1/ai/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY") || ""}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract all text from this PDF document. Return ONLY the extracted text, no explanations or formatting. If you detect structured data (like forms, tables, or key-value pairs), preserve that structure.`
              },
              {
                type: "image_url",
                image_url: {
                  url: pdfBase64
                }
              }
            ]
          }
        ],
        max_completion_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Lovable AI error:", errorText);
      throw new Error(`AI extraction failed: ${response.status} - ${errorText}`);
    }

    const aiResult = await response.json();
    const extractedText = aiResult.choices?.[0]?.message?.content || "";

    if (!extractedText) {
      throw new Error('No text extracted from PDF');
    }

    console.log(`✅ Extracted ${extractedText.length} characters of text`);

    return new Response(
      JSON.stringify({ 
        success: true,
        extractedText,
        documentId,
        byteLength: downloadData.arrayBuffer.byteLength
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Error in pdf-extract:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
