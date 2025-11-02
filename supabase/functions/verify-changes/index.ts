import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChangeProposal {
  type: 'database' | 'edge_function' | 'frontend' | 'mixed' | 'pdf_generation_pre' | 'pdf_generation_post';
  description: string;
  impact: string;
  files: Array<{
    path: string;
    action: 'edit' | 'create' | 'delete' | 'verify';
    changes: string;
    linesAffected?: string;
  }>;
  sql?: string[];
  edgeFunctions?: Array<{
    name: string;
    changes: string;
  }>;
  pdfGeneration?: {
    templateName: string;
    totalPDFFields: number;
    mappedFields: number;
    fieldMappings: Array<{
      pdfField: string;
      dbColumn: string;
      hasValue: boolean;
      value?: any;
    }>;
    requiredFields: Array<{
      name: string;
      filled: boolean;
      value?: any;
    }>;
    dataCoverage: number;
    missingRequired: string[];
  };
  execution?: {
    success: boolean;
    totalFieldsInPDF: number;
    fieldsFilledCount: number;
    fieldsMappedCount: number;
    emptyFields: string[];
    unexpectedFields: string[];
    issues: string[];
  };
  actualFieldValues?: Record<string, any>;
  comparisonToProposal?: {
    proposedMappings: number;
    actuallyFilled: number;
    matchRate: number;
    discrepancies: string[];
  };
  reasoning: string;
  risks: string[];
  rollbackPlan: string;
}

interface VerificationResult {
  approved: boolean;
  overallScore: number;
  scores: {
    logic: { score: number; issues: string[] };
    security: { score: number; issues: string[] };
    database: { score: number; issues: string[] };
    codeQuality: { score: number; issues: string[] };
    performance: { score: number; issues: string[] };
    bestPractices: { score: number; issues: string[] };
  };
  criticalIssues: string[];
  warnings: string[];
  suggestions: string[];
  recommendation: 'approve' | 'approve_with_changes' | 'reject';
  explanation: string;
}

function getStandardVerificationPrompt(): string {
  return `You are an expert code reviewer for a Polish Citizenship Portal built with:

TECHNOLOGY STACK:
- Frontend: React + TypeScript + Vite + TanStack Query + React Hook Form
- Backend: Supabase (PostgreSQL + Edge Functions in Deno/TypeScript)
- Auth: Supabase Auth with user_roles table using has_role() function
- State Management: TanStack Query for server state, React Hook Form for forms
- UI: Radix UI + Tailwind CSS with semantic design tokens

YOUR JOB:
Review proposed code changes and evaluate across 6 dimensions:

1. LOGIC CORRECTNESS (0-10)
   - Are the changes logically sound?
   - Will they solve the stated problem?
   - Any flawed assumptions?
   - Edge cases considered?

2. SECURITY (0-10)
   - RLS policies correct and sufficient?
   - Data exposure risks?
   - Auth vulnerabilities?
   - Input sanitization?
   - SQL injection risks?

3. DATABASE SCHEMA (0-10)
   - Column types appropriate?
   - Foreign keys valid?
   - Indexes needed?
   - Migrations safe (no data loss)?
   - Naming conventions followed?

4. CODE QUALITY (0-10)
   - TypeScript types correct and complete?
   - Error handling comprehensive?
   - Code maintainable and readable?
   - Proper async/await usage?
   - Edge cases handled?

5. PERFORMANCE (0-10)
   - Query efficiency (N+1 problems)?
   - Unnecessary re-renders?
   - Proper memoization?
   - Bundle size impact?
   - Database indexes needed?

6. BEST PRACTICES (0-10)
   - Follows Supabase patterns?
   - React best practices?
   - Proper form validation?
   - Accessibility considerations?
   - Error messages user-friendly?

EVALUATION CRITERIA:
- Score each dimension 0-10 (10 = perfect)
- Identify CRITICAL issues (must fix before implementation)
- Identify WARNINGS (should fix, may cause problems)
- Provide SUGGESTIONS (nice to have, optional improvements)
- Make final recommendation: approve | approve_with_changes | reject

BE SPECIFIC:
- Reference exact file paths and line numbers when possible
- Quote problematic code snippets
- Suggest concrete fixes with code examples
- Explain WHY something is an issue, not just WHAT
- Consider the project context (Polish citizenship process)

OUTPUT FORMAT:
You MUST respond with valid JSON matching this exact structure:
{
  "approved": boolean,
  "overallScore": number (0-10),
  "scores": {
    "logic": { "score": number, "issues": string[] },
    "security": { "score": number, "issues": string[] },
    "database": { "score": number, "issues": string[] },
    "codeQuality": { "score": number, "issues": string[] },
    "performance": { "score": number, "issues": string[] },
    "bestPractices": { "score": number, "issues": string[] }
  },
  "criticalIssues": string[],
  "warnings": string[],
  "suggestions": string[],
  "recommendation": "approve" | "approve_with_changes" | "reject",
  "explanation": "Brief summary of the review"
}`;
}

function getPDFVerificationPrompt(type: 'pdf_generation_pre' | 'pdf_generation_post'): string {
  if (type === 'pdf_generation_pre') {
    return `You are evaluating a PDF GENERATION PROPOSAL for Polish citizenship documents.

CONTEXT:
- This is a PRE-GENERATION verification (before the PDF is created)
- You're reviewing the DATA READINESS and MAPPING PLAN
- The goal is to catch missing data and mapping issues BEFORE generation

EVALUATE ON THESE DIMENSIONS:

1. DATA COMPLETENESS (0-10)
   - Are all required fields available in the database?
   - Is the data coverage percentage acceptable?
   - Will missing fields cause major issues?
   - Are there critical gaps that prevent PDF generation?

2. MAPPING ACCURACY (0-10)
   - Do the database→PDF field mappings make sense?
   - Are composite fields (e.g., first_name|last_name) handled correctly?
   - Are date splits (e.g., submission_date.day) implemented properly?
   - Any obviously wrong mappings?

3. DATA QUALITY (0-10)
   - Are field values in the correct format (dates, passport numbers)?
   - Valid DD.MM.YYYY dates?
   - Proper passport number format?
   - Any data corruption or encoding issues?

4. RISK ASSESSMENT (0-10)
   - How severe are the identified risks?
   - Will the generated PDF be usable?
   - Are there show-stoppers?
   - Can issues be fixed post-generation?

5. USER EXPERIENCE (0-10)
   - Will the user need extensive manual edits after generation?
   - Is the PDF likely to be rejected by Polish authorities?
   - Are there misleading or confusing data gaps?

6. READINESS (0-10)
   - Is the data ready for PDF generation?
   - Should generation proceed or wait for more data?
   - Overall confidence in the proposal?

CRITICAL ISSUES = Data gaps that make the PDF unusable
WARNINGS = Missing optional fields or formatting concerns
SUGGESTIONS = Nice-to-have improvements

OUTPUT VALID JSON in the same format as standard verification.`;
  } else {
    return `You are evaluating a POST-GENERATION PDF INSPECTION REPORT.

CONTEXT:
- This is AFTER the PDF was generated
- You're comparing the ACTUAL GENERATED PDF to the ORIGINAL PROPOSAL
- Goal: Verify the PDF matches expectations and identify discrepancies

EVALUATE ON THESE DIMENSIONS:

1. EXECUTION ACCURACY (0-10)
   - Did the PDF generation execute as proposed?
   - Field count match expectations?
   - Any unexpected fields or missing fields?
   - Overall match rate to proposal?

2. DATA INTEGRITY (0-10)
   - Were field values correctly transferred?
   - Any data loss or corruption?
   - Format preservation (dates, special chars)?
   - Encoding issues?

3. COMPLETENESS (0-10)
   - How many proposed fields were actually filled?
   - Are critical fields present?
   - Empty field count acceptable?
   - Ready for submission?

4. QUALITY ASSURANCE (0-10)
   - Does the PDF meet quality standards?
   - Any obvious errors or problems?
   - Professional appearance?
   - Polish authority acceptance likely?

5. DISCREPANCY ANALYSIS (0-10)
   - How significant are the discrepancies from the proposal?
   - Are differences explainable and acceptable?
   - Any red flags?

6. OVERALL SUCCESS (0-10)
   - Can this PDF be used as-is?
   - Should it be regenerated?
   - Confidence in the generated document?

CRITICAL ISSUES = PDF is unusable, must regenerate
WARNINGS = Minor issues that may need manual fixes
SUGGESTIONS = Quality improvements for future generations

OUTPUT VALID JSON in the same format as standard verification.`;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proposal } = await req.json() as { proposal: ChangeProposal };

    if (!proposal) {
      return new Response(
        JSON.stringify({ error: 'Missing change proposal' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('🔍 Sending proposal to OpenAI for verification...');
    console.log('Type:', proposal.type);
    console.log('Files affected:', proposal.files.length);

    // Detect if this is a PDF generation proposal
    const isPDFProposal = proposal.type === 'pdf_generation_pre' || proposal.type === 'pdf_generation_post';

    const systemPrompt = isPDFProposal 
      ? getPDFVerificationPrompt(proposal.type as 'pdf_generation_pre' | 'pdf_generation_post')
      : getStandardVerificationPrompt();

    const userPrompt = `Review this change proposal:

TYPE: ${proposal.type}
DESCRIPTION: ${proposal.description}
IMPACT: ${proposal.impact}

FILES TO CHANGE:
${proposal.files.map(f => `
- ${f.path} (${f.action})
  Changes: ${f.changes}
  ${f.linesAffected ? `Lines: ${f.linesAffected}` : ''}
`).join('\n')}

${proposal.sql && proposal.sql.length > 0 ? `
SQL CHANGES:
${proposal.sql.map(s => `- ${s}`).join('\n')}
` : ''}

${proposal.edgeFunctions && proposal.edgeFunctions.length > 0 ? `
EDGE FUNCTIONS:
${proposal.edgeFunctions.map(ef => `
- ${ef.name}
  Changes: ${ef.changes}
`).join('\n')}
` : ''}

${proposal.pdfGeneration ? `
PDF GENERATION DETAILS:
- Template: ${proposal.pdfGeneration.templateName}
- Total PDF Fields: ${proposal.pdfGeneration.totalPDFFields}
- Mapped Fields: ${proposal.pdfGeneration.mappedFields}
- Data Coverage: ${proposal.pdfGeneration.dataCoverage}%
- Missing Required: ${proposal.pdfGeneration.missingRequired.join(', ') || 'None'}

FIELD MAPPINGS:
${proposal.pdfGeneration.fieldMappings.map(fm => 
  `- ${fm.pdfField} ← ${fm.dbColumn}: ${fm.hasValue ? `✓ "${fm.value}"` : '✗ EMPTY'}`
).join('\n')}

REQUIRED FIELDS STATUS:
${proposal.pdfGeneration.requiredFields.map(rf => 
  `- ${rf.name}: ${rf.filled ? `✓ "${rf.value}"` : '✗ MISSING'}`
).join('\n')}
` : ''}

${proposal.execution ? `
EXECUTION RESULTS:
- Success: ${proposal.execution.success ? 'YES' : 'NO'}
- Total Fields in PDF: ${proposal.execution.totalFieldsInPDF}
- Fields Filled: ${proposal.execution.fieldsFilledCount}
- Empty Fields: ${proposal.execution.emptyFields.length}
- Unexpected Fields: ${proposal.execution.unexpectedFields.length}
- Issues: ${proposal.execution.issues.join('; ') || 'None'}
` : ''}

${proposal.comparisonToProposal ? `
COMPARISON TO PROPOSAL:
- Proposed Mappings: ${proposal.comparisonToProposal.proposedMappings}
- Actually Filled: ${proposal.comparisonToProposal.actuallyFilled}
- Match Rate: ${proposal.comparisonToProposal.matchRate}%
- Discrepancies: ${proposal.comparisonToProposal.discrepancies.join('; ') || 'None'}
` : ''}

REASONING: ${proposal.reasoning}

IDENTIFIED RISKS:
${proposal.risks.map(r => `- ${r}`).join('\n')}

ROLLBACK PLAN: ${proposal.rollbackPlan}

Provide a thorough review in the specified JSON format.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_completion_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const reviewText = data.choices[0].message.content;

    console.log('✅ Received OpenAI review');

    // Parse the JSON response
    let review: VerificationResult;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = reviewText.match(/```json\n([\s\S]*?)\n```/) || reviewText.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : reviewText;
      review = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw response:', reviewText);
      
      // Fallback: Create a basic review structure
      review = {
        approved: false,
        overallScore: 5,
        scores: {
          logic: { score: 5, issues: [] },
          security: { score: 5, issues: [] },
          database: { score: 5, issues: [] },
          codeQuality: { score: 5, issues: [] },
          performance: { score: 5, issues: [] },
          bestPractices: { score: 5, issues: [] },
        },
        criticalIssues: ['Failed to parse AI review - manual review required'],
        warnings: [],
        suggestions: [],
        recommendation: 'reject',
        explanation: 'AI review parsing failed. Raw response: ' + reviewText.substring(0, 500),
      };
    }

    console.log('📊 Review summary:', {
      approved: review.approved,
      overallScore: review.overallScore,
      recommendation: review.recommendation,
      criticalIssues: review.criticalIssues.length,
      warnings: review.warnings.length,
    });

    return new Response(
      JSON.stringify({
        success: true,
        proposal,
        review,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in verify-changes function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
