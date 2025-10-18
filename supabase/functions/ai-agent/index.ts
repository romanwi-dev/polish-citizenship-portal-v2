// AI Agent Edge Function v2.0.0 - Phase 1: Streaming + Tool Calling + Conversations + Document Intelligence
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getSecureCorsHeaders, handleCorsPreflight, createSecureCorsResponse, createSecureErrorResponse } from '../_shared/cors.ts';
import { AIAgentRequestSchema, validateInput } from '../_shared/inputValidation.ts';

// Tool definitions for AI agent
const AGENT_TOOLS = [
  {
    type: "function",
    function: {
      name: "generate_poa_pdf",
      description: "Generate a POA (Power of Attorney) PDF for a client. Use when client data is complete.",
      parameters: {
        type: "object",
        properties: {
          caseId: { type: "string", description: "Case UUID" },
          poaType: { 
            type: "string", 
            enum: ["adult", "minor", "spouses"],
            description: "Type of POA to generate"
          },
          reason: { type: "string", description: "Why this POA is needed" }
        },
        required: ["caseId", "poaType"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Create a task for HAC, client, or partner to complete",
      parameters: {
        type: "object",
        properties: {
          caseId: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          category: { type: "string" },
          dueDate: { type: "string", description: "ISO date string" }
        },
        required: ["caseId", "title", "priority"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "trigger_ocr",
      description: "Trigger OCR processing on a document to extract text and data",
      parameters: {
        type: "object",
        properties: {
          documentId: { type: "string" },
          expectedType: { type: "string" }
        },
        required: ["documentId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_master_data",
      description: "Update fields in master_table for a case",
      parameters: {
        type: "object",
        properties: {
          caseId: { type: "string" },
          fields: { type: "object" },
          reason: { type: "string" }
        },
        required: ["caseId", "fields"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_archive_request",
      description: "Generate a Polish archive request letter for missing documents",
      parameters: {
        type: "object",
        properties: {
          caseId: { type: "string" },
          personType: { 
            type: "string", 
            enum: ["AP", "F", "M", "PGF", "PGM", "MGF", "MGM"],
            description: "Person whose documents are needed"
          },
          documentTypes: { 
            type: "array",
            items: { type: "string" },
            description: "Types of documents needed (birth, marriage, etc.)"
          },
          archiveLocation: { type: "string", description: "Polish archive to contact" }
        },
        required: ["caseId", "personType", "documentTypes"]
      }
    }
  }
];

serve(async (req) => {
  // Health check
  if (req.url.endsWith('/health')) {
    return createSecureCorsResponse(req, { status: 'healthy', version: '2.0.0' });
  }

  const preflightResponse = handleCorsPreflight(req);
  if (preflightResponse) return preflightResponse;

  try {
    const body = await req.json();
    const validation = validateInput(AIAgentRequestSchema, body);
    
    if (!validation.success) {
      return createSecureErrorResponse(req, `Invalid input: ${JSON.stringify(validation.details)}`, 400);
    }
    
    const { caseId, prompt, action, conversationId, stream = false } = validation.data;
    const userId = req.headers.get('x-user-id') || 'system';
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get or create conversation
    let activeConversationId = conversationId;
    let isNewConversation = false;
    if (!activeConversationId && caseId) {
      const { data: newConv } = await supabase
        .from('ai_conversations')
        .insert({ case_id: caseId, agent_type: action })
        .select()
        .single();
      activeConversationId = newConv?.id;
      isNewConversation = true;
    }

    // Fetch conversation history
    let conversationMessages: any[] = [];
    if (activeConversationId) {
      const { data: messages } = await supabase
        .from('ai_conversation_messages')
        .select('role, content, tool_calls')
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true })
        .limit(20);
      conversationMessages = messages || [];
    }

    // Fetch case data
    let caseData = null;
    let context = {};

    if (action === 'security_audit') {
      context = buildAgentContext(null, action);
    } else if (caseId) {
      const { data, error: caseError } = await supabase
        .from('cases')
        .select(`*, intake_data(*), master_table(*), documents(*), tasks(*), poa(*), oby_forms(*), wsc_letters(*)`)
        .eq('id', caseId)
        .single();

      if (caseError) throw new Error(`Failed to fetch case: ${caseError.message}`);
      caseData = data;
      context = buildAgentContext(caseData, action);
    }

    // Build message history
    const systemPrompt = getSystemPrompt(action);
    const conversationHistory = [
      { role: 'system', content: systemPrompt },
      ...conversationMessages.map(m => ({
        role: m.role,
        content: m.content,
        ...(m.tool_calls && { tool_calls: m.tool_calls })
      })),
      { role: 'user', content: `Case Context:\n${JSON.stringify(context, null, 2)}\n\nUser Request: ${prompt}` }
    ];

    // Tool-enabled actions
    const toolEnabledActions = ['researcher', 'comprehensive', 'document_intelligence', 'auto_populate_forms', 'task_suggest'];
    const includeTools = toolEnabledActions.includes(action);

    const aiRequestBody: any = {
      model: 'google/gemini-2.5-flash',
      messages: conversationHistory,
      stream
    };

    if (includeTools) {
      aiRequestBody.tools = AGENT_TOOLS;
      aiRequestBody.tool_choice = 'auto';
    }

    // Handle streaming response
    if (stream) {
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiRequestBody),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI Gateway error: ${aiResponse.status}`);
      }

      const streamResponse = new ReadableStream({
        async start(controller) {
          // Send conversationId immediately if it's a new conversation
          if (isNewConversation && activeConversationId) {
            controller.enqueue(`data: ${JSON.stringify({ conversationId: activeConversationId })}\n\n`);
          }

          const reader = aiResponse.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let fullContent = '';
          let toolCalls: any[] = [];

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (!line.trim() || line.startsWith(':')) continue;
                if (!line.startsWith('data: ')) continue;

                const data = line.slice(6).trim();
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta;
                  
                  if (delta?.content) {
                    fullContent += delta.content;
                    controller.enqueue(`data: ${JSON.stringify({ delta: delta.content })}\n\n`);
                  }

                  if (delta?.tool_calls) {
                    toolCalls.push(...delta.tool_calls);
                  }
                } catch {}
              }
            }

            // Save messages
            if (activeConversationId) {
              await supabase.from('ai_conversation_messages').insert([
                { conversation_id: activeConversationId, role: 'user', content: prompt },
                { 
                  conversation_id: activeConversationId, 
                  role: 'assistant', 
                  content: fullContent,
                  tool_calls: toolCalls.length > 0 ? toolCalls : null
                }
              ]);
            }

            // Execute tools in parallel
            if (toolCalls.length > 0 && caseId) {
              const toolResults = await executeToolsParallel(toolCalls, caseId, supabase, userId);
              controller.enqueue(`data: ${JSON.stringify({ toolResults })}\n\n`);
            }

            controller.enqueue('data: [DONE]\n\n');
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });

      return new Response(streamResponse, {
        headers: {
          ...getSecureCorsHeaders(req),
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });
    }

    // Non-streaming response
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aiRequestBody),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const responseContent = data.choices[0].message.content;
    const toolCalls = data.choices[0].message.tool_calls;

    // Save messages
    if (activeConversationId) {
      await supabase.from('ai_conversation_messages').insert([
        { conversation_id: activeConversationId, role: 'user', content: prompt },
        { 
          conversation_id: activeConversationId, 
          role: 'assistant', 
          content: responseContent,
          tool_calls: toolCalls || null
        }
      ]);
    }

    // Execute tools in parallel
    let toolResults: any[] = [];
    if (toolCalls && toolCalls.length > 0 && caseId) {
      toolResults = await executeToolsParallel(toolCalls, caseId, supabase, userId);
    }

    // Log interaction
    if (caseId) {
      await supabase.from('hac_logs').insert({
        case_id: caseId,
        action_type: `ai_agent_${action}`,
        action_details: prompt,
        performed_by: userId,
        metadata: {
          response_preview: responseContent.substring(0, 500),
          conversation_id: activeConversationId,
          tools_used: toolCalls?.length || 0
        }
      });
    }

    return createSecureCorsResponse(req, { 
      response: responseContent, 
      conversationId: activeConversationId,
      toolResults 
    });

  } catch (error: any) {
    console.error('AI Agent error:', error);
    return createSecureErrorResponse(req, error.message || 'Unknown error', 500);
  }
});

// Parallel tool execution function
async function executeToolsParallel(toolCalls: any[], caseId: string, supabase: any, userId: string): Promise<any[]> {
  return await Promise.all(
    toolCalls.map(toolCall => executeSingleTool(toolCall, caseId, supabase, userId))
  );
}

// Single tool execution function
async function executeSingleTool(toolCall: any, caseId: string, supabase: any, userId: string): Promise<any> {
  try {
    const args = JSON.parse(toolCall.function.arguments);
    let result: any = { success: false, message: 'Unknown tool' };

    switch (toolCall.function.name) {
        case 'generate_poa_pdf':
          try {
            const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate-poa', {
              body: { caseId: args.caseId, poaType: args.poaType }
            });

            if (pdfError) throw pdfError;

            result = {
              success: true,
              message: `✅ POA (${args.poaType}) generated`,
              pdfUrl: pdfData?.pdfUrl
            };

            await supabase.from('hac_logs').insert({
              case_id: args.caseId,
              action_type: 'poa_generated',
              action_details: `AI auto-generated ${args.poaType} POA: ${args.reason || ''}`,
              performed_by: userId
            });
          } catch (error: any) {
            result = { success: false, message: `Failed: ${error.message}` };
          }
          break;

        case 'create_task':
          try {
            await supabase.from('tasks').insert({
              case_id: args.caseId,
              title: args.title,
              description: args.description || '',
              priority: args.priority,
              category: args.category || 'general',
              due_date: args.dueDate || null,
              status: 'pending'
            });

            result = { success: true, message: `✅ Task created: ${args.title}` };
          } catch (error: any) {
            result = { success: false, message: `Failed: ${error.message}` };
          }
          break;

        case 'trigger_ocr':
          try {
            await supabase.functions.invoke('ocr-document', {
              body: { documentId: args.documentId, expectedType: args.expectedType }
            });

            result = { success: true, message: `✅ OCR triggered` };
          } catch (error: any) {
            result = { success: false, message: `Failed: ${error.message}` };
          }
          break;

        case 'update_master_data':
          try {
            await supabase.from('master_table').update(args.fields).eq('case_id', args.caseId);

            result = {
              success: true,
              message: `✅ Updated ${Object.keys(args.fields).length} fields`
            };

            await supabase.from('hac_logs').insert({
              case_id: args.caseId,
              action_type: 'master_data_updated',
              action_details: `AI updated: ${Object.keys(args.fields).join(', ')}. ${args.reason || ''}`,
              performed_by: userId,
              metadata: { updated_fields: args.fields }
            });
          } catch (error: any) {
            result = { success: false, message: `Failed: ${error.message}` };
          }
          break;

        case 'generate_archive_request':
          try {
            // Create archive search record
            await supabase.from('archive_searches').insert({
              case_id: args.caseId,
              person_type: args.personType,
              document_types: args.documentTypes,
              archive_name: args.archiveLocation || 'To be determined',
              search_type: 'international',
              status: 'pending',
              priority: 'medium'
            });

            result = {
              success: true,
              message: `✅ Archive request created for ${args.personType}: ${args.documentTypes.join(', ')}`
            };

            await supabase.from('hac_logs').insert({
              case_id: args.caseId,
              action_type: 'archive_request_created',
              action_details: `AI created archive request for ${args.personType} documents`,
              performed_by: userId
            });
          } catch (error: any) {
            result = { success: false, message: `Failed: ${error.message}` };
          }
          break;
      }

    return {
      tool_call_id: toolCall.id,
      name: toolCall.function.name,
      result
    };
  } catch (error: any) {
    return {
      tool_call_id: toolCall.id,
      name: toolCall.function.name,
      result: { success: false, message: error.message }
    };
  }
}

function buildAgentContext(caseData: any, action: string) {
  if (action === 'security_audit') {
    return {
      system_audit: true,
      tables_with_rls: ['cases', 'intake_data', 'master_table', 'documents', 'tasks'],
      sensitive_tables: ['master_table', 'intake_data', 'poa', 'documents'],
      edge_functions: ['ai-agent', 'generate-poa', 'fill-pdf', 'ocr-passport']
    };
  }

  if (!caseData) throw new Error('Case data required');

  const context: any = {
    client_name: caseData.client_name,
    client_code: caseData.client_code,
    status: caseData.status,
    current_stage: caseData.current_stage,
    processing_mode: caseData.processing_mode,
    country: caseData.country,
  };

  if (['eligibility_analysis', 'comprehensive', 'auto_populate_forms'].includes(action)) {
    context.intake = caseData.intake_data?.[0] || null;
    context.master_data = caseData.master_table?.[0] || null;
  }

  if (['document_check', 'comprehensive', 'document_intelligence'].includes(action)) {
    context.documents = caseData.documents?.map((d: any) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      category: d.category,
      person_type: d.person_type,
      is_verified: d.is_verified,
      needs_translation: d.needs_translation,
      ocr_data: d.ocr_data
    })) || [];
  }

  if (['task_suggest', 'comprehensive'].includes(action)) {
    context.tasks = caseData.tasks?.map((t: any) => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      due_date: t.due_date
    })) || [];
  }

  if (['wsc_strategy', 'comprehensive'].includes(action)) {
    context.wsc_letters = caseData.wsc_letters?.map((w: any) => ({
      letter_date: w.letter_date,
      deadline: w.deadline,
      reference_number: w.reference_number,
      strategy: w.strategy
    })) || [];
  }

  context.kpi = {
    tasks_total: caseData.kpi_tasks_total,
    tasks_completed: caseData.kpi_tasks_completed,
    docs_percentage: caseData.kpi_docs_percentage,
    poa_approved: caseData.poa_approved
  };

  return context;
}

function getSystemPrompt(action: string): string {
  const basePrompt = `You are an AI agent for Polish citizenship applications. You help manage cases efficiently.

When tools are available, use them proactively:
- Generate POA PDFs when data is complete
- Create tasks for follow-ups
- Trigger OCR for documents
- Update master data when extracting info

Always explain what you're doing with tools.`;

  const actionPrompts: Record<string, string> = {
    researcher: `${basePrompt}

RESEARCHER AGENT

Conduct thorough research on Polish citizenship laws, historical records, and genealogical data. Provide detailed reports with supporting evidence.`,

    translator: `${basePrompt}

TRANSLATOR AGENT

Translate documents and communications between Polish and other languages. Ensure accuracy and cultural relevance.`,

    writer: `${basePrompt}

WRITER AGENT

Compose letters, reports, and other documents related to Polish citizenship applications. Maintain a professional and persuasive tone.`,

    designer: `${basePrompt}

DESIGN AGENT

Create visually appealing presentations and infographics to communicate complex information about Polish citizenship.`,
    
    document_check: `${basePrompt}

DOCUMENT CHECK AGENT

Review client-provided documents for completeness, accuracy, and relevance to Polish citizenship requirements. Identify missing or problematic items.`,

    task_suggest: `${basePrompt}

TASK SUGGESTION AGENT

Suggest tasks for case managers, clients, or partners to advance Polish citizenship applications. Prioritize tasks based on urgency and impact.`,

    wsc_strategy: `${basePrompt}

WSC STRATEGY AGENT

Develop strategies for obtaining confirmation of Polish citizenship from the WSC (Voivodeship Office). Consider legal precedents and individual case factors.`,

    form_populate: `${basePrompt}

FORM POPULATION AGENT

Automatically populate Polish citizenship application forms with client data. Ensure accuracy and compliance with form instructions.`,

    comprehensive: `${basePrompt}

COMPREHENSIVE AGENT

Provide end-to-end support for Polish citizenship applications. Integrate research, translation, writing, design, document review, task suggestion, and WSC strategy.`,

    security_audit: `You are a security auditor for a Polish citizenship application platform.

OBJECTIVE:
Identify potential security vulnerabilities and risks in the system.

SCOPE:
- Review access controls and permissions
- Analyze data handling and storage practices
- Evaluate the security of edge functions and APIs
- Assess the risk of unauthorized access or data breaches

REPORT FORMAT:
- Summary of findings
- List of vulnerabilities with severity ratings (High, Medium, Low)
- Recommendations for remediation

CONTEXT:
- Tables with RLS enabled: [tables_with_rls]
- Sensitive tables: [sensitive_tables]
- Edge functions: [edge_functions]

Focus on RLS policies, data encryption, and input validation.`,
    
    civil_acts_management: `${basePrompt}

CIVIL ACTS MANAGEMENT AGENT

Manage and process civil acts (birth, marriage, death certificates) required for Polish citizenship applications. Ensure proper documentation and authentication.`,

    translation_workflow: `${basePrompt}

TRANSLATION WORKFLOW AGENT

Streamline the translation process for Polish citizenship documents. Coordinate with translators, review translations for accuracy, and manage translation costs.`,

    analytics_report: `${basePrompt}

ANALYTICS REPORT AGENT

Generate reports on key metrics related to Polish citizenship applications. Track application progress, identify bottlenecks, and measure team performance.`,
    
    document_intelligence: `${basePrompt}

DOCUMENT INTELLIGENCE AGENT

Analyze uploaded documents:
1. Document type identification
2. Completeness check
3. Quality assessment
4. Translation requirements
5. OCR accuracy validation
6. Next steps

Output Format:
📄 DOCUMENT TYPE: [type]
✅ COMPLETENESS: [%]
🔍 QUALITY: [excellent/good/poor]
🌐 LANGUAGE: [lang] - Translation: [yes/no]
📊 OCR CONFIDENCE: [%]
⚠️ ISSUES: [list]
🎯 NEXT STEPS:
  1. [action]
  2. [action]

Use tools to create tasks or trigger OCR.`,

    auto_populate_forms: `${basePrompt}

FORM AUTO-POPULATION AGENT

Intelligently populate forms using:
1. Master table data
2. OCR extracted data
3. Logical inference
4. Polish legal requirements

Output Format:
📋 FORM: [name]
📊 COMPLETION: [%]
✅ POPULATED: [count] fields
⚠️ MISSING: [list with reasons]
🔍 CONFIDENCE: [%]

💡 RECOMMENDATIONS:
- HAC review needed: [list]
- Missing docs: [list]
- Data concerns: [list]

Use update_master_data tool and create_task for HAC review.`,

    eligibility_analysis: `${basePrompt}

Analyze Polish citizenship eligibility by descent.
- Check ancestry line
- Verify critical dates
- Identify missing data
- Assess success likelihood
- Estimate timeline
- List required documents`,
  };

  return actionPrompts[action] || basePrompt;
}
