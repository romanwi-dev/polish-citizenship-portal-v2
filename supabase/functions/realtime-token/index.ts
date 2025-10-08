import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { formType } = await req.json();

    // Create system instructions based on form type
    const instructions = getInstructions(formType);

    // Request an ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "coral",
        instructions
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI error:", error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Session created successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getInstructions(formType: string): string {
  const baseInstructions = "You are a helpful Polish citizenship application assistant. Speak naturally and warmly. Keep your responses concise and to the point. ";
  
  const formInstructions: Record<string, string> = {
    intake: "Help users understand initial intake questions about their eligibility for Polish citizenship.",
    master: "Guide users through the comprehensive Master Data Form with all details needed for their citizenship application.",
    poa: "Explain Power of Attorney requirements and help users understand what they're authorizing.",
    citizenship: "Assist with the formal Polish citizenship application form.",
    civil_registry: "Help with civil registry applications and documentation.",
    family_tree: "Guide users in documenting their family tree for citizenship purposes."
  };

  return baseInstructions + (formInstructions[formType] || formInstructions.intake);
}
