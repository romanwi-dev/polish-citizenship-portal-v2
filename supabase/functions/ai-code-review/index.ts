import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FileToReview {
  fileName: string;
  fileContent: string;
  priority: 'critical' | 'high' | 'medium';
}

interface BatchCodeReviewRequest {
  files: FileToReview[];
}

interface FileReview {
  fileName: string;
  overallScore: number;
  blockers: string[];
  criticalIssues: Array<{
    severity: 'CRITICAL' | 'HIGH';
    title: string;
    fix: string;
  }>;
  summary: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { files } = await req.json() as BatchCodeReviewRequest;
    
    console.log(`Starting batch code review for ${files.length} files`);

    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build a compact file summary for the AI
    const filesContext = files.map((f, idx) => 
      `--- FILE ${idx + 1}: ${f.fileName} (${f.priority}) ---\n${f.fileContent.substring(0, 8000)}\n`
    ).join('\n');

    const systemPrompt = `You are a senior code reviewer for a Polish Citizenship portal. Review ${files.length} files in one pass.

Focus ONLY on:
1. CRITICAL security issues (PII leaks, exposed secrets, RLS gaps)
2. Production blockers (crashes, data loss, broken auth)
3. Major performance issues (memory leaks, infinite loops)

For each file, return:
- overallScore (0-100)
- blockers (array of strings, only CRITICAL issues that block production)
- criticalIssues (max 3, only CRITICAL/HIGH severity)
- summary (1 sentence)

CRITICAL: Return ONLY valid JSON with properly escaped strings:
- Use \\n for newlines in strings
- Use \\\\ for backslashes
- Use \\" for quotes within strings
- Keep code snippets short and avoid complex escaping

{
  "reviews": [
    {
      "fileName": "exact-file-name.tsx",
      "overallScore": 85,
      "blockers": ["Critical issue preventing deployment"],
      "criticalIssues": [
        {"severity": "CRITICAL", "title": "Issue", "fix": "How to fix"}
      ],
      "summary": "Brief file assessment"
    }
  ]
}`;

    const userPrompt = `Review these ${files.length} files for production readiness:\n\n${filesContext}\n\nFocus on critical issues only. Be concise.`;

    // Call Lovable AI with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout
    
    let reviewResult;
    
    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: "json_object" }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API error:', response.status, errorText);
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        if (response.status === 402) {
          throw new Error('AI credits exhausted. Please add credits to your Lovable workspace.');
        }
        
        throw new Error(`AI API error: ${response.status} - ${errorText}`);
      }

      const aiResponse = await response.json();
      
      if (!aiResponse.choices?.[0]?.message?.content) {
        console.error('Invalid AI response structure:', aiResponse);
        throw new Error('Invalid response from AI - no content returned');
      }

      // Robust JSON parsing with error recovery
      const rawContent = aiResponse.choices[0].message.content;
      
      try {
        reviewResult = JSON.parse(rawContent);
      } catch (parseError) {
        console.error('JSON parse error, attempting recovery:', parseError);
        
        // Try to fix common JSON escaping issues
        let cleanedContent = rawContent;
        
        // Fix unescaped backslashes in strings (common in code snippets)
        cleanedContent = cleanedContent.replace(/\\([^"\\\/bfnrtu])/g, '\\\\$1');
        
        // Fix unescaped quotes in strings
        cleanedContent = cleanedContent.replace(/([^\\])"([^"]*)"([^:])/g, '$1\\"$2\\"$3');
        
        try {
          reviewResult = JSON.parse(cleanedContent);
          console.log('✓ JSON recovered after cleaning');
        } catch (secondError) {
          // Last resort: try to extract JSON from markdown code blocks
          const jsonMatch = cleanedContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
          if (jsonMatch) {
            reviewResult = JSON.parse(jsonMatch[1]);
            console.log('✓ JSON extracted from code block');
          } else {
            console.error('Failed to parse or recover JSON:', {
              original: rawContent.substring(0, 500),
              cleaned: cleanedContent.substring(0, 500)
            });
            throw new Error(`Invalid JSON from AI: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
          }
        }
      }
      
      // Validate response structure
      if (!reviewResult.reviews || !Array.isArray(reviewResult.reviews)) {
        console.error('Invalid review result structure:', reviewResult);
        throw new Error('AI returned invalid review structure');
      }
      
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Request timeout - file too large or AI took too long');
      }
      throw fetchError;
    }

    const avgScore = Math.round(
      reviewResult.reviews.reduce((sum: number, r: FileReview) => sum + r.overallScore, 0) / reviewResult.reviews.length
    );
    const totalBlockers = reviewResult.reviews.reduce((sum: number, r: FileReview) => sum + r.blockers.length, 0);

    console.log(`✓ Batch review complete: ${reviewResult.reviews.length} files, avg ${avgScore}/100, ${totalBlockers} blockers`);

    return new Response(
      JSON.stringify({
        success: true,
        reviews: reviewResult.reviews,
        summary: {
          filesReviewed: reviewResult.reviews.length,
          averageScore: avgScore,
          totalBlockers
        },
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Code review error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
