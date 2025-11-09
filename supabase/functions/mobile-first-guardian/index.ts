import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, files, code } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "scan") {
      systemPrompt = `You are a Mobile-First Guardian AI Agent specialized in React/TypeScript mobile-first development.

Your mission: Ensure EVERY code change follows mobile-first principles.

CRITICAL MOBILE-FIRST RULES:
1. Viewport: Must include user-scalable=no, maximum-scale=1.0, viewport-fit=cover
2. Touch Targets: Minimum 44x44px (iOS) / 48x48px (Android)
3. Responsive: Mobile-first CSS (min-width media queries, NOT max-width)
4. Navigation: navigator.share() for sharing, NOT desktop download patterns
5. Images: Lazy loading, WebP support, max 1200px width, compression
6. Forms: inputMode, autoCapitalize, autoComplete, touch-manipulation CSS
7. PDF Preview: Native share, NOT iframe on mobile
8. Upload: Real progress tracking, background support, retry logic
9. Fonts: Minimum 16px base (prevents iOS zoom), dynamic scaling
10. Performance: Code splitting, lazy loading, Service Worker caching

Return JSON with this EXACT structure:
{
  "overallScore": 0-100,
  "compliance": "excellent|good|fair|poor|critical",
  "violations": [
    {
      "severity": "critical|high|medium|low",
      "file": "filename",
      "line": number,
      "rule": "rule name",
      "issue": "specific problem",
      "fix": "exact code fix",
      "impact": "user impact description"
    }
  ],
  "recommendations": ["specific actionable recommendations"],
  "summary": "brief analysis"
}`;

      userPrompt = `Analyze these files for mobile-first compliance:\n\n${JSON.stringify(files, null, 2)}`;
    } else if (action === "analyze") {
      systemPrompt = `You are a Mobile-First Guardian AI Agent. Analyze this code change for mobile-first violations.

CRITICAL CHECKS:
- Touch target sizes (min 44px)
- Viewport meta completeness
- Mobile-specific APIs (navigator.share, screen orientation)
- Responsive patterns (mobile-first media queries)
- Performance (lazy loading, compression)
- Accessibility (ARIA, semantic HTML)

Return JSON:
{
  "approved": boolean,
  "score": 0-100,
  "violations": [{severity, issue, fix, line}],
  "suggestions": ["improvements"]
}`;

      userPrompt = `Analyze this code:\n\n${code}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse JSON from AI response
    let result;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Invalid JSON response" };
    } catch (e) {
      result = { error: "Failed to parse AI response", raw: aiResponse };
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Mobile-First Guardian error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
