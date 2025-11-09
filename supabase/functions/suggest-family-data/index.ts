import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FamilyMember {
  type: string;
  firstName?: string;
  lastName?: string;
  maidenName?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  dateOfMarriage?: string;
  placeOfMarriage?: string;
  dateOfEmigration?: string;
  dateOfNaturalization?: string;
}

interface SuggestionRequest {
  familyData: FamilyMember[];
  targetPerson: string;
  missingFields: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { familyData, targetPerson, missingFields }: SuggestionRequest = await req.json();

    console.log('Generating AI suggestions for:', targetPerson);
    console.log('Missing fields:', missingFields);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from existing family data
    const familyContext = familyData
      .filter(m => m.firstName && m.lastName)
      .map(m => {
        const info = [`${m.type}: ${m.firstName} ${m.lastName}`];
        if (m.maidenName) info.push(`(maiden: ${m.maidenName})`);
        if (m.dateOfBirth) info.push(`born ${m.dateOfBirth}`);
        if (m.placeOfBirth) info.push(`in ${m.placeOfBirth}`);
        if (m.dateOfMarriage) info.push(`married ${m.dateOfMarriage}`);
        if (m.dateOfEmigration) info.push(`emigrated ${m.dateOfEmigration}`);
        return info.join(' ');
      })
      .join('\n');

    // Create AI prompt for suggestions
    const systemPrompt = `You are an expert in Polish genealogy and citizenship law. You help fill in missing family data for Polish citizenship applications based on:
1. Historical naming patterns in Poland
2. Geographic patterns (common birthplaces, migration routes)
3. Temporal patterns (typical age at marriage, emigration periods)
4. Polish naming conventions (patronymic patterns, common surnames)
5. Historical context (major emigration waves, Polish territories)

CRITICAL INSTRUCTIONS:
- Only suggest data that is highly probable based on patterns
- Mark confidence level for each suggestion (high/medium/low)
- If there's not enough data for a confident suggestion, return null for that field
- Use realistic Polish dates (format: YYYY-MM-DD)
- Consider Polish historical context (partitions, WWI, WWII, emigration waves)
- Common Polish emigration destinations: USA, Canada, Australia, UK, Germany
- Typical patterns: surnames pass paternally, maiden names from mother's side
- Age patterns: marriage typically 20-30s, emigration often in 20s-40s`;

    const userPrompt = `Based on this existing family data:

${familyContext}

Suggest values for these missing fields for ${targetPerson}:
${missingFields.join(', ')}

Provide realistic suggestions based on:
- Family surname patterns
- Geographic patterns (Poland, emigration destinations)
- Historical emigration periods (1880s-1920s peak, 1945-1989, post-1989)
- Typical age gaps between generations (25-30 years)
- Polish naming conventions

Return ONLY a JSON object with this exact structure (no markdown, no extra text):
{
  "suggestions": {
    "field_name": {
      "value": "suggested_value",
      "confidence": "high|medium|low",
      "reasoning": "brief explanation"
    }
  }
}`;

    console.log('Calling Lovable AI...');
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log('AI Response:', content);

    // Parse AI response
    let suggestions;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      suggestions = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error("Failed to parse AI suggestions");
    }

    console.log('Suggestions generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        suggestions: suggestions.suggestions || {},
        targetPerson,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in suggest-family-data:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
