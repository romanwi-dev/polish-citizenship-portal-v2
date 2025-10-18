// AI Agent Edge Function v1.0.2 - Health check + deployment fix (2025-10-18)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getSecureCorsHeaders, handleCorsPreflight, createSecureCorsResponse, createSecureErrorResponse } from '../_shared/cors.ts';
import { AIAgentRequestSchema, validateInput } from '../_shared/inputValidation.ts';

serve(async (req) => {
  // Health check endpoint
  if (req.url.endsWith('/health')) {
    console.log('Health check requested');
    return createSecureCorsResponse(req, { 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: '1.0.2',
      deployment: 'verified'
    });
  }

  console.log('=== AI AGENT REQUEST RECEIVED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Origin:', req.headers.get('origin'));
  console.log('Auth Header:', req.headers.get('authorization') ? 'JWT Present ✓' : 'NO JWT ✗');
  console.log('Content-Type:', req.headers.get('content-type'));
  
  // Handle CORS preflight
  const preflightResponse = handleCorsPreflight(req);
  if (preflightResponse) return preflightResponse;

  try {
    const body = await req.json();
    console.log('Request Body Keys:', Object.keys(body));
    
    // Validate input using Zod schema
    const validation = validateInput(AIAgentRequestSchema, body);
    
    if (!validation.success) {
      console.error('Validation failed:', validation.details);
      return createSecureErrorResponse(
        req,
        `Invalid input: ${JSON.stringify(validation.details)}`,
        400
      );
    }
    
    const { caseId, prompt, action } = validation.data;
    
    console.log('📋 Parsed Request:');
    console.log('  Case ID:', caseId || 'NOT PROVIDED');
    console.log('  Action:', action);
    console.log('  Prompt Length:', prompt?.length || 0);
    console.log('  Prompt Preview:', prompt?.substring(0, 100) + '...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return createSecureErrorResponse(req, 'Server configuration error', 500);
    }
    
    if (!lovableApiKey) {
      console.error('Missing LOVABLE_API_KEY');
      return createSecureErrorResponse(req, 'AI service not configured', 500);
    }
    
    console.log('Initializing Supabase client');
    const supabase = createClient(supabaseUrl, supabaseKey);

    let caseData = null;
    let context = {};

    // Security audit doesn't need case data - it's system-wide
    if (action === 'security_audit') {
      context = buildAgentContext(null, action);
    } else {
      // Fetch comprehensive case data for other actions
      const { data, error: caseError } = await supabase
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

      if (caseError) {
        console.error('Database error fetching case:', caseError);
        console.error('Error details:', JSON.stringify(caseError));
        throw new Error(`Failed to fetch case data: ${caseError.message}`);
      }
      
      if (!data) {
        throw new Error(`Case not found with ID: ${caseId}`);
      }
      
      caseData = data;
      
      // Build context for AI
      context = buildAgentContext(caseData, action);
    }
    
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
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const agentResponse = aiData.choices[0].message.content;

    // Log agent interaction (skip for security audits)
    if (action !== 'security_audit' && caseId) {
      await supabase.from('hac_logs').insert({
        case_id: caseId,
        performed_by: req.headers.get('x-user-id'),
        action_type: 'ai_agent_interaction',
        action_details: `Action: ${action}, Prompt: ${prompt}`,
        metadata: { response: agentResponse }
      });
    }

    return createSecureCorsResponse(
      req,
      { 
        response: agentResponse,
        context: context,
        action: action 
      }
    );

  } catch (error: any) {
    console.error('AI Agent error:', error);
    console.error('Error stack:', error.stack);
    return createSecureErrorResponse(
      req,
      error.message || 'Unknown error occurred',
      500
    );
  }
});

function buildAgentContext(caseData: any, action: string) {
  // Security audit context (system-wide, not case-specific)
  if (action === 'security_audit') {
    return {
      system_audit: true,
      tables_with_rls: [
        'cases', 'intake_data', 'master_table', 'documents', 'tasks',
        'poa', 'oby_forms', 'hac_logs', 'messages',
        'user_roles', 'client_portal_access', 'archive_searches'
      ],
      sensitive_tables: ['master_table', 'intake_data', 'poa', 'documents'],
      edge_functions: [
        'ai-agent', 'generate-poa', 'fill-pdf', 'ocr-passport',
        'ocr-document', 'ocr-wsc-letter', 'dropbox-sync', 'ai-translate'
      ],
      description: 'System-wide security audit of Polish citizenship portal'
    };
  }

  // For all other actions, caseData is required
  if (!caseData) {
    throw new Error('Case data is required for this action');
  }

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
    researcher: `${basePrompt}

RESEARCHER AGENT MODE

You conduct in-depth research with multiple sources, cross-verification, and structured reports for Polish citizenship cases.

Research Areas:
- Polish citizenship law and regulations
- Historical context (pre-1920, interwar, WWII, communist era, modern Poland)
- Archive locations and document availability
- Legal precedents and case law
- Regional variations in documentation

Method:
1. Break down complex topics into research questions
2. Find authoritative sources (Polish government sites, legal databases, historical archives)
3. Cross-verify information from multiple sources
4. Synthesize information into structured reports

Output Format:
📊 EXECUTIVE SUMMARY
🔍 KEY FINDINGS (with citations)
📚 SOURCES (reliability assessment)
💡 RECOMMENDATIONS
⚠️ POTENTIAL CHALLENGES

Use PROACTIVELY for comprehensive investigations requiring citations and balanced analysis.`,

    translator: `${basePrompt}

TRANSLATOR AGENT MODE

You are a specialized translation agent for Polish citizenship documents.

Languages: Polish, English, Spanish, Portuguese, Hebrew, Russian, Ukrainian, German, French

Translation Expertise:
- Legal terminology and official documents
- Historical documents with archaic language
- Maintain legal accuracy and proper formatting
- Preserve all legal terms and official language

Tasks:
1. Review and improve AI-generated translations
2. Identify documents needing sworn translation
3. Flag ambiguities or unclear passages
4. Create glossaries of key terms
5. Suggest translation strategies for complex documents

Output Format:
📄 TRANSLATED TEXT
📊 CONFIDENCE SCORE (0-100%)
📝 TRANSLATOR NOTES
📚 GLOSSARY (key terms)
⚠️ RECOMMENDATIONS (for sworn translator)

Remember: All translations will be reviewed by certified Polish sworn translators.`,

    writer: `${basePrompt}

WRITER AGENT MODE

You create clear, professional content for Polish citizenship services.

Content Types:
- Client emails and letters
- Archive request letters (Polish)
- WSC response strategies
- Process explanations for clients
- Internal case notes and summaries
- FAQ content and guides

Tone & Style:
- Professional yet approachable for clients
- Formal and proper for Polish authorities
- Clear and jargon-free for explanations
- Empathetic when addressing concerns
- Precise when stating requirements

Best Practices:
- Use appropriate Polish letter formatting conventions
- Include all necessary legal references
- Follow salutations and closings properly
- Maintain consistent terminology
- Proofread for grammar and clarity

Output Format:
✍️ DRAFTED CONTENT
🎯 PURPOSE & AUDIENCE
📋 KEY POINTS COVERED
✅ REVIEW CHECKLIST

Use PROACTIVELY for drafting any written communications.`,

    designer: `${basePrompt}

DESIGNER AGENT MODE

You are a UI/UX design specialist for the Polish citizenship portal.

Design Expertise:
- Modern design principles and accessibility standards
- User research and user experience optimization
- Wireframing and prototyping concepts
- Design system consistency
- Information architecture

Focus Areas:
- Client portal interface improvements
- Form design and usability
- Document visualization and organization
- Case timeline presentation
- Mobile responsiveness
- Accessibility (WCAG compliance)

Design Process:
1. Analyze current UI/UX pain points
2. Suggest design improvements with rationale
3. Consider user personas (clients, HAC staff, assistants)
4. Propose component designs
5. Recommend color, typography, spacing improvements

Output Format:
🎨 DESIGN RECOMMENDATIONS (with mockup descriptions)
🔄 USER FLOW IMPROVEMENTS
♿ ACCESSIBILITY CONSIDERATIONS
💻 IMPLEMENTATION SUGGESTIONS
🎯 DESIGN SYSTEM TOKENS

Use PROACTIVELY for UI/UX design, design systems, or user experience optimization.`,

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
- Recommendations for HAC`,

    security_audit: `You are a security auditor AI specialized in Supabase applications and OWASP best practices.

TASK: Perform comprehensive security audit of the Polish citizenship application system.

Focus Areas:

1. Row Level Security (RLS) Policies
   - Verify all tables have RLS enabled
   - Check policy logic for data leaks
   - Ensure user_id filtering with auth.uid()
   - Verify has_role() function usage
   - Check for policy bypass vulnerabilities

2. Authentication & Authorization
   - Review auth flows (no anonymous signups)
   - Check JWT token handling in edge functions
   - Verify role-based access control (admin/assistant/client)
   - Check client portal access controls

3. Data Protection (CRITICAL)
   - Identify exposed PII (passport numbers, addresses, personal data)
   - Verify data masking implementation
   - Check encryption for sensitive fields
   - Verify documents table security

4. OWASP Top 10 Compliance
   - SQL injection prevention
   - XSS vulnerabilities
   - CSRF protection
   - Security misconfiguration
   - Sensitive data exposure

5. Edge Function Security
   - Input validation (Zod schemas)
   - CORS configuration
   - Error handling (no data leaks)
   - API key exposure
   - JWT token verification

Output Format:
🔴 CRITICAL ISSUES (must fix immediately)
🟡 MEDIUM ISSUES (fix before production)
🟢 LOW ISSUES (nice to have)
✅ COMPLIANCE STATUS
📋 RECOMMENDATIONS

Be specific: cite table names, function names, provide actionable fixes with code examples.`
  };

  return actionPrompts[action] || actionPrompts.comprehensive;
}
