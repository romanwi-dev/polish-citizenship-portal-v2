import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, prompt, action } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch comprehensive case data
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select(`
        *,
        intake_data(*),
        master_table(*),
        documents(*),
        tasks(*),
        poa(*),
        oby_forms(*),
        wsc_letters(*)
      `)
      .eq('id', caseId)
      .single();

    if (caseError) throw caseError;

    // Build context for AI
    const context = buildAgentContext(caseData, action);
    
    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: getSystemPrompt(action)
          },
          {
            role: 'user',
            content: `Case Context:\n${JSON.stringify(context, null, 2)}\n\nUser Request: ${prompt}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const agentResponse = aiData.choices[0].message.content;

    // Log agent interaction
    await supabase.from('hac_logs').insert({
      case_id: caseId,
      performed_by: req.headers.get('x-user-id'),
      action_type: 'ai_agent_interaction',
      action_details: `Action: ${action}, Prompt: ${prompt}`,
      metadata: { response: agentResponse }
    });

    return new Response(
      JSON.stringify({ 
        response: agentResponse,
        context: context,
        action: action 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('AI Agent error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildAgentContext(caseData: any, action: string) {
  const context: any = {
    client_name: caseData.client_name,
    client_code: caseData.client_code,
    status: caseData.status,
    current_stage: caseData.current_stage,
    processing_mode: caseData.processing_mode,
    country: caseData.country,
  };

  // Add relevant data based on action
  if (action === 'eligibility_analysis' || action === 'comprehensive') {
    context.intake = caseData.intake_data?.[0] || null;
    context.ancestry_line = caseData.intake_data?.[0]?.ancestry_line;
    context.master_data = caseData.master_table?.[0] || null;
  }

  if (action === 'document_check' || action === 'comprehensive') {
    context.documents = caseData.documents?.map((d: any) => ({
      name: d.name,
      type: d.type,
      category: d.category,
      person_type: d.person_type,
      is_verified: d.is_verified,
      needs_translation: d.needs_translation,
      is_translated: d.is_translated
    })) || [];
    context.document_count = caseData.documents?.length || 0;
  }

  if (action === 'task_suggest' || action === 'comprehensive') {
    context.tasks = caseData.tasks?.map((t: any) => ({
      title: t.title,
      status: t.status,
      task_type: t.task_type,
      priority: t.priority,
      due_date: t.due_date
    })) || [];
    context.pending_tasks = caseData.tasks?.filter((t: any) => t.status === 'pending').length || 0;
  }

  if (action === 'wsc_strategy' || action === 'comprehensive') {
    context.wsc_letters = caseData.wsc_letters?.map((w: any) => ({
      letter_date: w.letter_date,
      deadline: w.deadline,
      reference_number: w.reference_number,
      strategy: w.strategy,
      hac_reviewed: w.hac_reviewed
    })) || [];
  }

  if (action === 'form_populate' || action === 'comprehensive') {
    context.poa = caseData.poa?.[0] || null;
    context.oby_forms = caseData.oby_forms?.[0] || null;
  }

  context.kpi = {
    tasks_total: caseData.kpi_tasks_total,
    tasks_completed: caseData.kpi_tasks_completed,
    docs_percentage: caseData.kpi_docs_percentage,
    poa_approved: caseData.poa_approved,
    oby_filed: caseData.oby_filed,
    wsc_received: caseData.wsc_received,
    decision_received: caseData.decision_received
  };

  return context;
}

function getSystemPrompt(action: string): string {
  const basePrompt = `You are an AI agent specialized in Polish citizenship by descent applications. You help HAC (Head Attorney Coach) manage cases efficiently.

Polish Citizenship Process Stages:
1. Lead → First Contact → Citizenship Test → Family Tree → Eligibility Call
2. Terms & Pricing → Advance Payment → Opening Account
3. POA (Power of Attorney) → Master Form → Application Filing
4. Local Documents → Polish Documents → Translations → Filing
5. Civil Acts → Initial Response → WSC Letter → Push Schemes
6. Citizenship Decision → Polish Passport → Extended Services

Key Person Types: AP (Applicant), F (Father), M (Mother), PGF/PGM (Paternal Grandparents), MGF/MGM (Maternal Grandparents)
Document Categories: birth_cert, marriage_cert, naturalization, passport, military_record, archive_doc
Ancestry Lines: paternal, maternal

Your responses should be:
- Concise and actionable
- Based on actual case data provided
- Specific with dates, names, and document references
- Professional and accurate`;

  const actionPrompts: Record<string, string> = {
    eligibility_analysis: `${basePrompt}

TASK: Analyze eligibility for Polish citizenship by descent.
- Check ancestry line (must have Polish ancestor)
- Verify critical dates (emigration, naturalization)
- Identify missing family data
- Assess likelihood of success (High/Medium/Low)
- Estimate timeline (months)
- List required documents`,

    document_check: `${basePrompt}

TASK: Review document completeness and requirements.
- List all uploaded documents
- Identify missing required documents by person type
- Flag documents needing translation
- Check verification status
- Prioritize critical missing documents`,

    task_suggest: `${basePrompt}

TASK: Suggest next actionable tasks based on current stage.
- Review current stage and pending tasks
- Suggest 3-5 specific next steps
- Assign priority (high/medium/low)
- Provide reasoning for each task
- Consider deadlines and dependencies`,

    wsc_strategy: `${basePrompt}

TASK: Analyze WSC (Voivodeship Office) letter and suggest strategy.
- Extract key requirements from letter
- Identify deadline and urgency
- Recommend strategy: PUSH (aggressive), NUDGE (moderate), or SIT-DOWN (detailed meeting)
- List specific actions to take
- Draft response points`,

    form_populate: `${basePrompt}

TASK: Generate form data and identify auto-population opportunities.
- Review intake and master data
- Suggest fields that can be auto-populated
- Identify missing critical fields
- Flag inconsistencies between data sources
- Provide clean, formatted values for forms`,

    comprehensive: `${basePrompt}

TASK: Comprehensive case analysis covering all aspects.
- Eligibility assessment
- Document completeness
- Current stage progress
- Critical next steps
- Risks and blockers
- Timeline estimate
- Recommendations for HAC`
  };

  return actionPrompts[action] || actionPrompts.comprehensive;
}
