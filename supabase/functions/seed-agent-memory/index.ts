import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[Seed] Starting knowledge extraction...');

    // Read all markdown files from docs/
    const docsPath = './docs';
    const mdFiles: { name: string; content: string }[] = [];
    
    try {
      for await (const entry of Deno.readDir(docsPath)) {
        if (entry.isFile && entry.name.endsWith('.md')) {
          const content = await Deno.readTextFile(`${docsPath}/${entry.name}`);
          mdFiles.push({ name: entry.name, content });
          console.log(`[Seed] Loaded ${entry.name} (${content.length} chars)`);
        }
      }
    } catch (error) {
      console.error('[Seed] Error reading docs:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to read documentation files' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (mdFiles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No markdown files found in docs/' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Seed] Found ${mdFiles.length} markdown files`);

    // Prepare AI prompt for knowledge extraction
    const systemPrompt = `You are a knowledge extraction AI. Analyze the provided documentation and extract:

1. **Project Decisions**: Architectural choices, design patterns, technology selections
2. **Agent Memory**: Implementation patterns, best practices, lessons learned
3. **Workflow Rules**: Automation rules, stage transitions, conditional logic

Return a JSON object with this structure:
{
  "project_decisions": [
    {
      "decision_type": "architecture|design|technology|process",
      "title": "Brief title",
      "description": "What was decided",
      "rationale": "Why this decision was made",
      "impact_area": "Which part of system this affects",
      "alternatives_considered": ["Other options that were evaluated"],
      "tags": ["relevant", "keywords"]
    }
  ],
  "agent_memory": [
    {
      "agent_type": "ocr|pdf|dropbox|translation|general",
      "task_type": "The task category",
      "context": "Implementation context",
      "outcome": "success|failure",
      "learnings": "Key takeaways and patterns",
      "tags": ["relevant", "keywords"]
    }
  ],
  "workflow_rules": [
    {
      "workflow_type": "documents|translations|archives|usc|passport",
      "rule_name": "Descriptive name",
      "condition": "When this rule applies",
      "action": "What should happen",
      "priority": "high|medium|low",
      "tags": ["relevant", "keywords"]
    }
  ]
}

Extract concrete, actionable knowledge. Focus on decisions, patterns, and rules that agents can use.`;

    const userPrompt = mdFiles.map(f => 
      `=== ${f.name} ===\n${f.content}\n\n`
    ).join('');

    console.log('[Seed] Calling Lovable AI for extraction...');

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[Seed] AI API error:', aiResponse.status, errorText);
      throw new Error(`AI extraction failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const extractedKnowledge = JSON.parse(aiData.choices[0].message.content);

    console.log('[Seed] Extracted knowledge:', {
      decisions: extractedKnowledge.project_decisions?.length || 0,
      memories: extractedKnowledge.agent_memory?.length || 0,
      rules: extractedKnowledge.workflow_rules?.length || 0,
    });

    // Insert project decisions
    let decisionsInserted = 0;
    if (extractedKnowledge.project_decisions?.length > 0) {
      const { data, error } = await supabase
        .from('project_decisions')
        .insert(
          extractedKnowledge.project_decisions.map((d: any) => ({
            decision_type: d.decision_type,
            title: d.title,
            description: d.description,
            rationale: d.rationale,
            impact_area: d.impact_area,
            alternatives_considered: d.alternatives_considered || [],
            tags: d.tags || [],
          }))
        );
      
      if (error) {
        console.error('[Seed] Error inserting decisions:', error);
      } else {
        decisionsInserted = extractedKnowledge.project_decisions.length;
        console.log(`[Seed] Inserted ${decisionsInserted} project decisions`);
      }
    }

    // Insert agent memory
    let memoriesInserted = 0;
    if (extractedKnowledge.agent_memory?.length > 0) {
      const { data, error } = await supabase
        .from('agent_memory')
        .insert(
          extractedKnowledge.agent_memory.map((m: any) => ({
            agent_type: m.agent_type,
            task_type: m.task_type,
            context: m.context,
            outcome: m.outcome,
            learnings: m.learnings,
            tags: m.tags || [],
          }))
        );
      
      if (error) {
        console.error('[Seed] Error inserting memories:', error);
      } else {
        memoriesInserted = extractedKnowledge.agent_memory.length;
        console.log(`[Seed] Inserted ${memoriesInserted} agent memories`);
      }
    }

    // Insert workflow rules
    let rulesInserted = 0;
    if (extractedKnowledge.workflow_rules?.length > 0) {
      const { data, error } = await supabase
        .from('workflow_rules')
        .insert(
          extractedKnowledge.workflow_rules.map((r: any) => ({
            workflow_type: r.workflow_type,
            rule_name: r.rule_name,
            condition: r.condition,
            action: r.action,
            priority: r.priority || 'medium',
            tags: r.tags || [],
            is_active: true,
          }))
        );
      
      if (error) {
        console.error('[Seed] Error inserting rules:', error);
      } else {
        rulesInserted = extractedKnowledge.workflow_rules.length;
        console.log(`[Seed] Inserted ${rulesInserted} workflow rules`);
      }
    }

    const summary = {
      success: true,
      files_processed: mdFiles.length,
      knowledge_extracted: {
        project_decisions: decisionsInserted,
        agent_memory: memoriesInserted,
        workflow_rules: rulesInserted,
      },
      total_entries: decisionsInserted + memoriesInserted + rulesInserted,
    };

    console.log('[Seed] Seeding complete:', summary);

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Seed] Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
