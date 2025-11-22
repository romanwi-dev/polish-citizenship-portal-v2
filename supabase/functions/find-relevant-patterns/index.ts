import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { 
      domain,
      problem_keywords,
      agent_name = 'pdf-generation-agent',
      limit = 5
    } = await req.json();

    console.log('🔍 Finding relevant patterns:', { domain, problem_keywords, agent_name });

    // Build query
    let query = supabaseClient
      .from('proven_patterns')
      .select('*')
      .eq('agent_name', agent_name);

    // Filter by domain if provided
    if (domain) {
      query = query.eq('domain', domain);
    }

    // Order by effectiveness and usage
    query = query
      .order('effectiveness_score', { ascending: false })
      .order('usage_count', { ascending: false })
      .limit(limit);

    const { data: patterns, error } = await query;

    if (error) throw new Error(`Failed to fetch patterns: ${error.message}`);

    // Score patterns by relevance to problem keywords
    const scoredPatterns = patterns.map(pattern => {
      let relevanceScore = pattern.effectiveness_score;

      if (problem_keywords && problem_keywords.length > 0) {
        const problemText = `${pattern.problem_description} ${pattern.solution_approach} ${pattern.tags?.join(' ')}`.toLowerCase();
        
        const keywordMatches = problem_keywords.filter((keyword: string) => 
          problemText.includes(keyword.toLowerCase())
        ).length;

        // Boost score based on keyword matches
        relevanceScore += (keywordMatches / problem_keywords.length) * 0.5;
      }

      return {
        ...pattern,
        relevance_score: Math.min(relevanceScore, 1.0)
      };
    });

    // Sort by relevance score
    scoredPatterns.sort((a, b) => b.relevance_score - a.relevance_score);

    // Increment usage count for top patterns (async, don't wait)
    if (scoredPatterns.length > 0) {
      const topPatternIds = scoredPatterns.slice(0, 3).map(p => p.id);
      
      supabaseClient
        .from('proven_patterns')
        .update({ 
          usage_count: supabaseClient.rpc('increment', { x: 1 }),
          last_used_at: new Date().toISOString()
        })
        .in('id', topPatternIds)
        .then(() => console.log('📊 Updated usage count for top patterns'));
    }

    console.log(`✅ Found ${scoredPatterns.length} relevant patterns`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        patterns: scoredPatterns,
        count: scoredPatterns.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error finding patterns:', error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
