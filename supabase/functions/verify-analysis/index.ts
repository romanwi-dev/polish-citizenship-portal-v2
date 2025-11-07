import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysis } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const verificationPrompt = `You are a senior software architect conducting a critical code review for a production Polish citizenship application system.

ANALYSIS TO VERIFY:
${analysis}

VERIFICATION CRITERIA (Score each 0-100%):
1. **Accuracy**: Are the identified issues real and correctly diagnosed?
2. **Completeness**: Are all major issues caught? Any false positives?
3. **Solution Quality**: Is the restoration plan technically sound?
4. **Risk Assessment**: Are risks and mitigations properly identified?
5. **Implementation Plan**: Is the plan clear, actionable, and safe?

STRICT REQUIREMENTS:
- You MUST score 100% on ALL criteria to approve
- Any score below 100% = REJECTION
- Provide specific reasons for any deduction
- Suggest improvements if rejecting

Return JSON:
{
  "model": "YOUR_MODEL_NAME",
  "scores": {
    "accuracy": 0-100,
    "completeness": 0-100,
    "solution_quality": 0-100,
    "risk_assessment": 0-100,
    "implementation_plan": 0-100
  },
  "overall_score": 0-100,
  "approved": true/false,
  "feedback": "detailed reasoning",
  "improvements": ["specific suggestions if rejected"]
}`;

    const models = [
      { name: "openai/gpt-5", label: "GPT-5" },
      { name: "claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
      { name: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" }
    ];

    const results = [];

    for (const model of models) {
      console.log(`Verifying with ${model.label}...`);
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model.name,
          messages: [
            { 
              role: "system", 
              content: "You are a senior software architect specializing in React, TypeScript, and form validation systems. You provide brutally honest technical reviews." 
            },
            { role: "user", content: verificationPrompt }
          ],
          temperature: 0.1, // Low temperature for consistency
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${model.label} verification failed: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error(`No response from ${model.label}`);
      }

      const verification = JSON.parse(content);
      verification.model = model.label;
      results.push(verification);
      
      console.log(`${model.label} Score: ${verification.overall_score}%`);
    }

    // Calculate consensus
    const allApproved = results.every(r => r.approved && r.overall_score === 100);
    const avgScore = results.reduce((sum, r) => sum + r.overall_score, 0) / results.length;

    return new Response(
      JSON.stringify({
        success: true,
        consensus: allApproved,
        average_score: avgScore,
        verifications: results,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
