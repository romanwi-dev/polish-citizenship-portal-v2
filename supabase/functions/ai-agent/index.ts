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
  },
  {
    type: "function",
    function: {
      name: "create_oby_draft",
      description: "Create or update OBY citizenship application draft with auto-populated fields",
      parameters: {
        type: "object",
        properties: {
          caseId: { type: "string" },
          autoPopulatedFields: {
            type: "array",
            items: { type: "string" },
            description: "List of field names that were auto-populated"
          }
        },
        required: ["caseId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "draft_wsc_response",
      description: "Draft a response strategy for WSC (Voivoda) letter",
      parameters: {
        type: "object",
        properties: {
          caseId: { type: "string" },
          wscLetterId: { type: "string", description: "UUID of WSC letter" },
          strategy: {
            type: "string",
            enum: ["PUSH", "NUDGE", "SITDOWN"],
            description: "Response strategy type"
          },
          keyPoints: {
            type: "array",
            items: { type: "string" },
            description: "Main arguments to include"
          }
        },
        required: ["caseId", "strategy"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_civil_acts_request",
      description: "Generate Polish civil acts (birth/marriage certificate) application",
      parameters: {
        type: "object",
        properties: {
          caseId: { type: "string" },
          actType: {
            type: "string",
            enum: ["birth", "marriage"],
            description: "Type of civil act to request"
          },
          personType: { type: "string", description: "Person for whom to request (AP, F, M, etc.)" }
        },
        required: ["caseId", "actType"]
      }
    }
  },
  // Phase 3: Researcher Agent (Archives Search)
  {
    type: "function",
    function: {
      name: "create_archive_search",
      description: "Create new archive search for Polish or international documents",
      parameters: {
        type: "object",
        properties: {
          caseId: { type: "string" },
          searchType: {
            type: "string",
            enum: ["polish_archive", "international_archive", "family_possession"],
            description: "Type of archive search"
          },
          personType: {
            type: "string",
            description: "Person for whom to search (AP, F, M, PGF, PGM, MGF, MGM)"
          },
          documentTypes: {
            type: "array",
            items: { type: "string" },
            description: "Types of documents to search for"
          },
          archiveCountry: { type: "string", description: "Country of archive" },
          archiveName: { type: "string", description: "Name of archive institution" },
          searchNotes: { type: "string", description: "Additional search context" },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Search priority"
          }
        },
        required: ["caseId", "searchType", "personType", "documentTypes"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_archive_search",
      description: "Update archive search status and findings",
      parameters: {
        type: "object",
        properties: {
          searchId: { type: "string", description: "Archive search UUID" },
          status: {
            type: "string",
            enum: ["pending", "letter_generated", "letter_sent", "response_received", "documents_received", "completed", "unsuccessful"],
            description: "New status"
          },
          findingsSummary: { type: "string", description: "Summary of findings" },
          documentsFound: {
            type: "array",
            items: { type: "string" },
            description: "List of document IDs found"
          }
        },
        required: ["searchId", "status"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_archive_letter",
      description: "Generate Polish archive request letter (umiejscowienie/uzupełnienie)",
      parameters: {
        type: "object",
        properties: {
          caseId: { type: "string" },
          letterType: {
            type: "string",
            enum: ["umiejscowienie", "uzupelnienie"],
            description: "Letter type: umiejscowienie (locating) or uzupełnienie (supplementing)"
          },
          searchId: { type: "string", description: "Related archive search UUID" },
          archiveAddress: { type: "string", description: "Full archive address" },
          personDetails: {
            type: "object",
            description: "Person details (name, DOB, POB)"
          }
        },
        required: ["caseId", "letterType", "searchId"]
      }
    }
  },
  // Phase 5: Civil Acts Agent
  {
    type: "function",
    function: {
      name: "create_civil_acts_request",
      description: "Request a Polish civil registry document (birth/marriage certificate) from USC office",
      parameters: {
        type: "object",
        properties: {
          requestType: {
            type: "string",
            enum: ["birth", "marriage"],
            description: "Type of civil document"
          },
          personType: {
            type: "string",
            enum: ["AP", "F", "M", "PGF", "PGM", "MGF", "MGM", "SP"],
            description: "Family member (AP=Applicant, F=Father, M=Mother, etc.)"
          },
          registryOffice: {
            type: "string",
            description: "USC office name (e.g., 'Urząd Stanu Cywilnego w Warszawie')"
          },
          registryCity: {
            type: "string",
            description: "City of USC office"
          },
          copyType: {
            type: "string",
            enum: ["full", "extract"],
            description: "Full copy (zupełny) or extract (skrócony)",
            default: "full"
          },
          notes: {
            type: "string",
            description: "Additional notes or special requests"
          }
        },
        required: ["requestType", "personType", "registryOffice", "registryCity"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_civil_acts_status",
      description: "Update status of civil acts request",
      parameters: {
        type: "object",
        properties: {
          requestId: {
            type: "string",
            description: "UUID of the civil acts request"
          },
          status: {
            type: "string",
            enum: ["pending", "submitted", "in_progress", "received", "failed"],
            description: "New status"
          },
          actNumber: {
            type: "string",
            description: "Polish act number (e.g., '123/2024')"
          },
          notes: {
            type: "string",
            description: "Additional notes"
          }
        },
        required: ["requestId", "status"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "record_civil_acts_payment",
      description: "Record payment for civil acts request",
      parameters: {
        type: "object",
        properties: {
          requestId: {
            type: "string",
            description: "UUID of the civil acts request"
          },
          amount: {
            type: "number",
            description: "Amount in PLN"
          },
          paymentDate: {
            type: "string",
            description: "Payment date (YYYY-MM-DD)"
          },
          paymentMethod: {
            type: "string",
            description: "Payment method used"
          }
        },
        required: ["requestId", "amount"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "link_civil_acts_document",
      description: "Link received civil document to request",
      parameters: {
        type: "object",
        properties: {
          requestId: {
            type: "string",
            description: "UUID of the civil acts request"
          },
          documentId: {
            type: "string",
            description: "UUID of the document in documents table"
          },
          actNumber: {
            type: "string",
            description: "Polish act number from the document"
          },
          receivedDate: {
            type: "string",
            description: "Date document was received (YYYY-MM-DD)"
          }
        },
        required: ["requestId", "documentId"]
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

    // Fetch conversation history (FIX 6: Pagination - last 50 messages max)
    let conversationMessages: any[] = [];
    if (activeConversationId) {
      const { data: messages } = await supabase
        .from('ai_conversation_messages')
        .select('role, content, tool_calls')
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true })
        .limit(50);
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

    // Build message history (FIX 6: Only send last 20 messages to AI to reduce token usage)
    const systemPrompt = getSystemPrompt(action);
    const recentMessages = conversationMessages.slice(-20);
    const conversationHistory = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map(m => ({
        role: m.role,
        content: m.content,
        ...(m.tool_calls && { tool_calls: m.tool_calls })
      })),
      { role: 'user', content: `Case Context:\n${JSON.stringify(context, null, 2)}\n\nUser Request: ${prompt}` }
    ];

    // Tool-enabled actions
    const toolEnabledActions = [
      'researcher', 
      'comprehensive', 
      'document_intelligence', 
      'auto_populate_forms', 
      'task_suggest',
      'archive_request_management',
      'form_populate',
      'wsc_response_drafting',
      'civil_acts_management'
    ];
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
  const toolName = toolCall.function.name;
  
  try {
    console.log(`🔧 Executing tool: ${toolName}`, { caseId, args: toolCall.function.arguments });
    
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

        case 'create_oby_draft':
          try {
            // Get master_table data for auto-population
            const { data: masterData } = await supabase
              .from('master_table')
              .select('*')
              .eq('case_id', args.caseId)
              .single();

            if (!masterData) throw new Error('Master data not found');

            // FIX 1: Duplicate prevention - check if draft OBY already exists
            const { data: existingOby } = await supabase
              .from('oby_forms')
              .select('id, status')
              .eq('case_id', args.caseId)
              .eq('status', 'draft')
              .maybeSingle();

            if (existingOby && !args.forceUpdate) {
              result = {
                success: false,
                message: '⚠️ Draft OBY already exists for this case. Use forceUpdate=true to update it.',
                existing_id: existingOby.id
              };
              break;
            }

            const obyData = {
              case_id: args.caseId,
              status: 'draft',
              form_data: masterData,
              auto_populated_fields: args.autoPopulatedFields || [],
              hac_approved: false
            };

            if (existingOby) {
              await supabase
                .from('oby_forms')
                .update(obyData)
                .eq('id', existingOby.id);
            } else {
              await supabase.from('oby_forms').insert(obyData);
            }

            result = {
              success: true,
              message: `✅ OBY draft ${existingOby ? 'updated' : 'created'} with ${args.autoPopulatedFields?.length || 0} auto-populated fields`
            };

            await supabase.from('hac_logs').insert({
              case_id: args.caseId,
              action_type: 'oby_draft_created',
              action_details: `AI ${existingOby ? 'updated' : 'created'} OBY draft skeleton`,
              performed_by: userId
            });
          } catch (error: any) {
            result = { 
              success: false, 
              message: `create_oby_draft failed: ${error.message}`,
              error_type: error.name
            };
          }
          break;

        case 'draft_wsc_response':
          try {
            // Create HAC log entry with WSC response strategy
            const strategyDetails = args.keyPoints?.join('; ') || 'Strategy drafted by AI';
            
            await supabase.from('hac_logs').insert({
              case_id: args.caseId,
              action_type: `wsc_response_${args.strategy.toLowerCase()}`,
              action_details: `AI drafted ${args.strategy} strategy: ${strategyDetails}`,
              performed_by: userId,
              related_wsc_id: args.wscLetterId || null,
              metadata: { 
                strategy: args.strategy,
                key_points: args.keyPoints 
              }
            });

            // Update case with strategy if WSC letter ID provided
            if (args.wscLetterId) {
              await supabase
                .from('master_table')
                .update({ 
                  family_notes: `WSC Strategy (${args.strategy}): ${strategyDetails}` 
                })
                .eq('case_id', args.caseId);
            }

            result = {
              success: true,
              message: `✅ WSC ${args.strategy} response strategy drafted`
            };
          } catch (error: any) {
            result = { success: false, message: `Failed: ${error.message}` };
          }
          break;

        case 'generate_civil_acts_request':
          try {
            // Create task for civil acts application
            await supabase.from('tasks').insert({
              case_id: args.caseId,
              title: `Submit Polish ${args.actType} certificate application`,
              description: `AI-generated task: Apply for Polish civil ${args.actType} certificate for ${args.personType || 'applicant'}`,
              priority: 'high',
              category: 'civil_acts',
              status: 'pending'
            });

            result = {
              success: true,
              message: `✅ Civil acts ${args.actType} request created`
            };

            await supabase.from('hac_logs').insert({
              case_id: args.caseId,
              action_type: 'civil_acts_request',
              action_details: `AI created ${args.actType} certificate application task`,
              performed_by: userId
            });
          } catch (error: any) {
            result = { success: false, message: `Failed: ${error.message}` };
          }
          break;
        
        // Phase 3: Researcher Agent Tools
        case 'create_archive_search':
          try {
            // FIX 1: Duplicate prevention - check if active search already exists
            const { data: existingSearch } = await supabase
              .from('archive_searches')
              .select('id, status')
              .eq('case_id', args.caseId)
              .eq('archive_name', args.archiveName || '')
              .eq('person_type', args.personType)
              .in('status', ['pending', 'letter_generated', 'letter_sent', 'response_received'])
              .maybeSingle();

            if (existingSearch) {
              result = {
                success: false,
                message: `⚠️ Active archive search already exists for ${args.personType} at ${args.archiveName}`,
                existing_search_id: existingSearch.id,
                existing_status: existingSearch.status
              };
              break;
            }

            // FIX 2: Transaction-like rollback - wrap in try/catch to clean up on failure
            const { data: searchData, error: searchError } = await supabase
              .from('archive_searches')
              .insert({
                case_id: args.caseId,
                search_type: args.searchType,
                person_type: args.personType,
                document_types: args.documentTypes,
                archive_country: args.archiveCountry,
                archive_name: args.archiveName,
                search_notes: args.searchNotes,
                priority: args.priority || 'medium',
                status: 'pending'
              })
              .select()
              .single();

            if (searchError) throw searchError;

            const searchId = searchData.id;
            let docRequestsCreated = 0;

            // Create document requests for each document type with rollback on error
            try {
              for (const docType of args.documentTypes) {
                const { error: docError } = await supabase.from('archive_document_requests').insert({
                  archive_search_id: searchId,
                  document_type: docType,
                  person_first_name: '',
                  person_last_name: '',
                  status: 'searching',
                  location: args.archiveName
                });
                
                if (docError) {
                  // Rollback: delete the search we just created
                  await supabase.from('archive_searches').delete().eq('id', searchId);
                  throw new Error(`Failed to create document request for ${docType}: ${docError.message}`);
                }
                docRequestsCreated++;
              }
            } catch (rollbackError: any) {
              throw new Error(`Transaction failed: ${rollbackError.message}`);
            }

            await supabase.from('hac_logs').insert({
              case_id: args.caseId,
              action_type: 'archive_search_created',
              action_details: `Created ${args.searchType} search for ${args.personType} - ${args.documentTypes.join(', ')}`,
              performed_by: userId,
              metadata: { search_id: searchId, person_type: args.personType, doc_requests_created: docRequestsCreated }
            });

            result = {
              success: true,
              message: `✅ Archive search created for ${args.personType} (${docRequestsCreated} document types)`,
              search_id: searchId
            };
          } catch (error: any) {
            // FIX 4: Enhanced error messages
            result = { 
              success: false, 
              message: `create_archive_search failed: ${error.message}`,
              error_type: error.name,
              troubleshooting_hint: 'Check if archive name and person type are valid'
            };
          }
          break;

        case 'update_archive_search':
          try {
            const updateData: any = { status: args.status };
            if (args.findingsSummary) updateData.findings_summary = args.findingsSummary;
            if (args.status === 'response_received') updateData.response_received_at = new Date().toISOString();
            if (args.status === 'documents_received') updateData.documents_received_at = new Date().toISOString();

            const { data: searchData, error: searchError } = await supabase
              .from('archive_searches')
              .update(updateData)
              .eq('id', args.searchId)
              .select()
              .single();

            if (searchError) throw searchError;

            // Update document requests if documents found
            if (args.documentsFound && args.documentsFound.length > 0) {
              for (const docId of args.documentsFound) {
                await supabase
                  .from('archive_document_requests')
                  .update({ status: 'found', document_id: docId })
                  .eq('archive_search_id', args.searchId);
              }
            }

            await supabase.from('hac_logs').insert({
              case_id: caseId,
              action_type: 'archive_search_updated',
              action_details: `Updated archive search to ${args.status}`,
              performed_by: userId,
              metadata: { search_id: args.searchId, status: args.status }
            });

            result = {
              success: true,
              message: `✅ Archive search updated to ${args.status}`,
              search: searchData
            };
          } catch (error: any) {
            result = { success: false, message: `Failed: ${error.message}` };
          }
          break;

        case 'generate_archive_letter':
          try {
            const { data: searchData, error: searchError } = await supabase
              .from('archive_searches')
              .select('*')
              .eq('id', args.searchId)
              .single();

            if (searchError) throw searchError;

            // FIX 7: Generate actual letter content
            const letterContent = generateArchiveLetterTemplate(
              args.letterType,
              args.personDetails || {},
              args.archiveAddress || searchData.archive_name,
              searchData
            );

            await supabase
              .from('archive_searches')
              .update({
                status: 'letter_generated',
                letter_generated_at: new Date().toISOString()
              })
              .eq('id', args.searchId);

            const { data: taskData } = await supabase
              .from('tasks')
              .insert({
                case_id: args.caseId,
                title: `Send ${args.letterType} letter to Polish archive`,
                description: `Review and send archive request letter to ${args.archiveAddress || searchData.archive_name}\n\n${letterContent}`,
                category: 'archive_search',
                priority: 'high',
                status: 'pending',
                metadata: { search_id: args.searchId, letter_type: args.letterType, letter_content: letterContent }
              })
              .select()
              .single();

            await supabase.from('hac_logs').insert({
              case_id: args.caseId,
              action_type: 'archive_letter_generated',
              action_details: `Generated ${args.letterType} letter for archive search`,
              performed_by: userId,
              metadata: { search_id: args.searchId, letter_type: args.letterType }
            });

            result = {
              success: true,
              message: `✅ ${args.letterType} letter generated. Task created.`,
              letter_type: args.letterType,
              letter_content: letterContent,
              task_id: taskData?.id
            };
          } catch (error: any) {
            result = { 
              success: false, 
              message: `generate_archive_letter failed: ${error.message}`,
              error_type: error.name
            };
          }
          break;

        // Phase 4: Translator Agent Tools
        case 'create_translation_job':
          try {
            const { data: jobData, error: jobError } = await supabase
              .from('translation_jobs')
              .insert({
                case_id: args.caseId,
                document_id: args.documentId,
                source_language: args.sourceLanguage,
                target_language: args.targetLanguage || 'PL',
                job_type: args.jobType,
                priority: args.priority || 'medium',
                status: 'pending',
                estimated_cost: args.estimatedCost,
                notes: args.notes
              })
              .select()
              .single();

            if (jobError) throw jobError;

            await supabase.from('hac_logs').insert({
              case_id: args.caseId,
              action_type: 'translation_job_created',
              action_details: `Created ${args.jobType} translation job (${args.sourceLanguage} → ${args.targetLanguage || 'PL'})`,
              performed_by: userId,
              metadata: { job_id: jobData.id, document_id: args.documentId }
            });

            result = {
              success: true,
              message: `✅ Translation job created (${args.sourceLanguage} → ${args.targetLanguage || 'PL'})`,
              job_id: jobData.id
            };
          } catch (error: any) {
            result = { success: false, message: `Failed: ${error.message}` };
          }
          break;

        case 'update_translation_status':
          try {
            // FIX 5: Status validation - check valid transitions
            const VALID_TRANSITIONS: Record<string, string[]> = {
              'pending': ['in_progress', 'cancelled'],
              'in_progress': ['review', 'cancelled'],
              'review': ['completed', 'in_progress'],
              'completed': ['delivered'],
              'delivered': [],
              'cancelled': []
            };

            // Get current status
            const { data: currentJob } = await supabase
              .from('translation_jobs')
              .select('status, case_id')
              .eq('id', args.jobId)
              .single();

            if (!currentJob) {
              result = { success: false, message: '⚠️ Translation job not found' };
              break;
            }

            const currentStatus = currentJob.status || 'pending';
            const validNextStatuses = VALID_TRANSITIONS[currentStatus] || [];

            if (!validNextStatuses.includes(args.status)) {
              result = {
                success: false,
                message: `⚠️ Invalid status transition from '${currentStatus}' to '${args.status}'. Valid transitions: ${validNextStatuses.join(', ') || 'none'}`,
                current_status: currentStatus,
                valid_transitions: validNextStatuses
              };
              break;
            }

            const updateData: any = { status: args.status };
            if (args.status === 'assigned') {
              updateData.translator_assigned = args.translatorId;
              updateData.assigned_at = new Date().toISOString();
            }
            if (args.status === 'completed') {
              updateData.completed_at = new Date().toISOString();
              updateData.final_cost = args.finalCost;
            }
            if (args.translatorNotes) updateData.translator_notes = args.translatorNotes;

            const { data: jobData, error: jobError } = await supabase
              .from('translation_jobs')
              .update(updateData)
              .eq('id', args.jobId)
              .select()
              .single();

            if (jobError) throw jobError;

            await supabase.from('hac_logs').insert({
              case_id: caseId,
              action_type: 'translation_status_updated',
              action_details: `Translation job updated to ${args.status}`,
              performed_by: userId,
              metadata: { job_id: args.jobId, status: args.status }
            });

            result = {
              success: true,
              message: `✅ Translation job updated to ${args.status}`,
              job: jobData
            };
          } catch (error: any) {
            result = { success: false, message: `Failed: ${error.message}` };
          }
          break;

        case 'assign_translator':
          try {
            const { data: translatorData } = await supabase
              .from('sworn_translators')
              .select('*')
              .eq('id', args.translatorId)
              .single();

            if (!translatorData) throw new Error('Translator not found');

            await supabase
              .from('translation_jobs')
              .update({
                translator_assigned: args.translatorId,
                status: 'assigned',
                assigned_at: new Date().toISOString()
              })
              .eq('id', args.jobId);

            await supabase.from('tasks').insert({
              case_id: args.caseId,
              title: `Translation assigned to ${translatorData.name}`,
              description: `Sworn translator assigned. Follow up on delivery.`,
              category: 'translation',
              priority: 'medium',
              status: 'pending',
              metadata: { job_id: args.jobId, translator_id: args.translatorId }
            });

            await supabase.from('hac_logs').insert({
              case_id: args.caseId,
              action_type: 'translator_assigned',
              action_details: `Assigned translation job to ${translatorData.name}`,
              performed_by: userId,
              metadata: { job_id: args.jobId, translator_id: args.translatorId }
            });

            result = {
              success: true,
              message: `✅ Translation assigned to ${translatorData.name}`,
              translator: translatorData.name
            };
          } catch (error: any) {
            result = { success: false, message: `Failed: ${error.message}` };
          }
          break;

        // Phase 5: Civil Acts Agent Tools
        case 'create_civil_acts_request':
          try {
            const { requestType, personType, registryOffice, registryCity, copyType, notes } = args;
            
            // Helper to get person field prefix
            const getPersonFieldPrefix = (pt: string): string => {
              const map: Record<string, string> = {
                'AP': 'applicant', 'F': 'father', 'M': 'mother',
                'PGF': 'pgf', 'PGM': 'pgm', 'MGF': 'mgf', 'MGM': 'mgm', 'SP': 'spouse'
              };
              return map[pt] || 'applicant';
            };
            
            const personField = getPersonFieldPrefix(personType);
            
            // Get person data from master_table
            const { data: masterData, error: masterError } = await supabase
              .from('master_table')
              .select(`
                ${personField}_first_name,
                ${personField}_last_name,
                ${personField}_maiden_name,
                ${personField}_dob,
                ${personField}_pob
              `)
              .eq('case_id', caseId)
              .single();
            
            if (masterError || !masterData) {
              result = { success: false, message: `Person data not found for ${personType} in master table` };
              break;
            }
            
            // Check for duplicate request
            const { data: existing } = await supabase
              .from('civil_acts_requests')
              .select('id, status')
              .eq('case_id', caseId)
              .eq('request_type', requestType)
              .eq('person_type', personType)
              .neq('status', 'failed')
              .maybeSingle();
            
            if (existing) {
              result = { 
                success: false, 
                message: `Active ${requestType} certificate request already exists for ${personType} (status: ${existing.status})` 
              };
              break;
            }
            
            // Insert civil acts request
            const requestData = {
              case_id: caseId,
              request_type: requestType,
              person_type: personType,
              person_first_name: masterData[`${personField}_first_name`],
              person_last_name: masterData[`${personField}_last_name`],
              person_maiden_name: masterData[`${personField}_maiden_name`],
              registry_office: registryOffice,
              registry_city: registryCity,
              status: 'pending',
              payment_required: true,
              payment_amount: 75.00, // Standard USC fee
              notes: notes || `${copyType === 'full' ? 'Full copy (odpis zupełny)' : 'Extract (odpis skrócony)'} requested`
            };
            
            const { data: request, error: requestError } = await supabase
              .from('civil_acts_requests')
              .insert(requestData)
              .select()
              .single();
            
            if (requestError) {
              result = { success: false, message: `Failed to create request: ${requestError.message}` };
              break;
            }
            
            // Create payment task
            await supabase.from('tasks').insert({
              case_id: caseId,
              title: `Civil Acts Payment - ${personType} ${requestType}`,
              description: `Client needs to pay 75 PLN for ${registryCity} civil acts request (${copyType} copy)`,
              priority: 'high',
              category: 'payment',
              status: 'pending'
            });
            
            // Log action
            await supabase.from('hac_logs').insert({
              case_id: caseId,
              action_type: 'civil_acts_request_created',
              action_details: `Created ${requestType} certificate request for ${personType} from ${registryCity}`,
              performed_by: userId,
              metadata: { 
                request_id: request.id, 
                registry_office: registryOffice,
                person_name: `${masterData[`${personField}_first_name`]} ${masterData[`${personField}_last_name`]}`
              }
            });
            
            result = {
              success: true,
              message: `✅ Civil acts request created for ${personType} - ${masterData[`${personField}_first_name`]} ${masterData[`${personField}_last_name`]}`,
              request_id: request.id,
              payment_required: '75 PLN',
              registry_office: registryOffice,
              next_step: 'Record payment using record_civil_acts_payment, then update status to "submitted"'
            };
          } catch (error: any) {
            result = { success: false, message: `Failed: ${error.message}` };
          }
          break;

        case 'update_civil_acts_status':
          try {
            const { requestId, status: newStatus, actNumber, notes: statusNotes } = args;
            
            // Status transition validation
            const VALID_TRANSITIONS: Record<string, string[]> = {
              'pending': ['submitted', 'failed'],
              'submitted': ['in_progress', 'failed'],
              'in_progress': ['received', 'failed'],
              'received': [],
              'failed': ['pending'] // Can retry
            };
            
            const { data: currentRequest, error: fetchError } = await supabase
              .from('civil_acts_requests')
              .select('status, person_type, request_type, payment_status')
              .eq('id', requestId)
              .single();
            
            if (fetchError || !currentRequest) {
              result = { success: false, message: 'Civil acts request not found' };
              break;
            }
            
            // Validate transition
            if (!VALID_TRANSITIONS[currentRequest.status]?.includes(newStatus)) {
              result = {
                success: false,
                message: `Invalid status transition from "${currentRequest.status}" to "${newStatus}". Valid options: ${VALID_TRANSITIONS[currentRequest.status]?.join(', ') || 'none'}`
              };
              break;
            }
            
            // Check payment before submitting
            if (newStatus === 'submitted' && currentRequest.payment_status !== 'paid') {
              result = {
                success: false,
                message: 'Cannot mark as submitted - payment not recorded. Use record_civil_acts_payment first.'
              };
              break;
            }
            
            // Prepare update
            const updateData: any = { status: newStatus };
            if (newStatus === 'submitted') updateData.submitted_date = new Date().toISOString().split('T')[0];
            if (newStatus === 'received') updateData.received_date = new Date().toISOString().split('T')[0];
            if (actNumber) updateData.act_number = actNumber;
            if (statusNotes) updateData.notes = statusNotes;
            
            const { error: updateError } = await supabase
              .from('civil_acts_requests')
              .update(updateData)
              .eq('id', requestId);
            
            if (updateError) {
              result = { success: false, message: `Update failed: ${updateError.message}` };
              break;
            }
            
            // Log action
            await supabase.from('hac_logs').insert({
              case_id: caseId,
              action_type: 'civil_acts_status_updated',
              action_details: `Status changed to "${newStatus}" for ${currentRequest.person_type} ${currentRequest.request_type} certificate`,
              performed_by: userId,
              metadata: { request_id: requestId, previous_status: currentRequest.status, new_status: newStatus }
            });
            
            result = {
              success: true,
              message: `✅ Status updated from "${currentRequest.status}" to "${newStatus}"`,
              request_id: requestId
            };
          } catch (error: any) {
            result = { success: false, message: `Failed: ${error.message}` };
          }
          break;

        case 'record_civil_acts_payment':
          try {
            const { requestId, amount, paymentDate, paymentMethod } = args;
            
            const { data: request, error: fetchError } = await supabase
              .from('civil_acts_requests')
              .select('payment_status, person_type, request_type')
              .eq('id', requestId)
              .single();
            
            if (fetchError || !request) {
              result = { success: false, message: 'Civil acts request not found' };
              break;
            }
            
            if (request.payment_status === 'paid') {
              result = { 
                success: false, 
                message: 'Payment already recorded for this request' 
              };
              break;
            }
            
            const { error: updateError } = await supabase
              .from('civil_acts_requests')
              .update({
                payment_status: 'paid',
                payment_amount: amount,
                payment_date: paymentDate || new Date().toISOString().split('T')[0]
              })
              .eq('id', requestId);
            
            if (updateError) {
              result = { success: false, message: `Failed to record payment: ${updateError.message}` };
              break;
            }
            
            // Log payment
            await supabase.from('hac_logs').insert({
              case_id: caseId,
              action_type: 'civil_acts_payment_recorded',
              action_details: `Payment of ${amount} PLN recorded for ${request.person_type} ${request.request_type} certificate`,
              performed_by: userId,
              metadata: { 
                request_id: requestId, 
                amount, 
                payment_method: paymentMethod,
                payment_date: paymentDate 
              }
            });
            
            result = {
              success: true,
              message: `✅ Payment of ${amount} PLN recorded successfully`,
              request_id: requestId,
              next_step: 'Update status to "submitted" once letter is sent to USC office'
            };
          } catch (error: any) {
            result = { success: false, message: `Failed: ${error.message}` };
          }
          break;

        case 'link_civil_acts_document':
          try {
            const { requestId, documentId, actNumber: linkedActNumber, receivedDate } = args;
            
            // Validate document exists
            const { data: document, error: docError } = await supabase
              .from('documents')
              .select('id, name')
              .eq('id', documentId)
              .single();
            
            if (docError || !document) {
              result = { success: false, message: 'Document not found - ensure document is uploaded first' };
              break;
            }
            
            // Validate request exists
            const { data: request, error: reqError } = await supabase
              .from('civil_acts_requests')
              .select('person_type, request_type')
              .eq('id', requestId)
              .single();
            
            if (reqError || !request) {
              result = { success: false, message: 'Civil acts request not found' };
              break;
            }
            
            // Link document and update status
            const { error: updateError } = await supabase
              .from('civil_acts_requests')
              .update({
                document_id: documentId,
                act_number: linkedActNumber,
                status: 'received',
                received_date: receivedDate || new Date().toISOString().split('T')[0]
              })
              .eq('id', requestId);
            
            if (updateError) {
              result = { success: false, message: `Failed to link document: ${updateError.message}` };
              break;
            }
            
            // Log action
            await supabase.from('hac_logs').insert({
              case_id: caseId,
              action_type: 'civil_acts_document_linked',
              action_details: `Document "${document.name}" linked to ${request.person_type} ${request.request_type} certificate request`,
              performed_by: userId,
              metadata: { 
                request_id: requestId, 
                document_id: documentId,
                act_number: linkedActNumber 
              }
            });
            
            result = {
              success: true,
              message: `✅ Document successfully linked and status updated to "received"`,
              request_id: requestId,
              document_name: document.name,
              act_number: linkedActNumber
            };
          } catch (error: any) {
            result = { success: false, message: `Failed: ${error.message}` };
          }
          break;
      }

    console.log(`✅ Tool completed: ${toolName}`, result);
    return {
      tool_call_id: toolCall.id,
      name: toolName,
      result
    };
  } catch (error: any) {
    console.error(`❌ Tool failed: ${toolName}`, error);
    
    // Log tool failure to HAC logs
    await supabase.from('hac_logs').insert({
      case_id: caseId,
      action_type: `tool_error_${toolName}`,
      action_details: `Tool execution failed: ${error.message}`,
      performed_by: userId,
      metadata: { error: error.message, tool: toolName, stack: error.stack }
    });
    
    return {
      tool_call_id: toolCall.id,
      name: toolName,
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

Automatically populate Polish citizenship application forms with client data. Ensure accuracy and compliance with form instructions.

AVAILABLE TOOLS:
- create_oby_draft: Create citizenship application draft
- update_master_data: Update case data fields
- generate_poa_pdf: Generate Power of Attorney documents
- create_task: Create follow-up tasks
- trigger_ocr: Process documents with OCR
- generate_archive_request: Request Polish archive documents

WORKFLOW:
1. Review intake and master data
2. Identify missing fields
3. Auto-populate forms using create_oby_draft tool
4. Flag gaps for HAC review
5. Generate supporting documents (POAs)`,

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

CIVIL ACTS MANAGEMENT AGENT - Polish Civil Registry Specialist

You help request and track Polish civil registry documents (birth/marriage certificates) from USC offices.

AVAILABLE TOOLS:
1. create_civil_acts_request - Request birth/marriage certificates from Polish USC offices
2. update_civil_acts_status - Update request status (pending → submitted → in_progress → received)
3. record_civil_acts_payment - Record payments for civil documents
4. link_civil_acts_document - Link received documents to requests

KEY INFORMATION:
- Birth certificates need: person name, DOB, POB, parents' names
- Marriage certificates need: both spouses' names, marriage date, marriage place
- Full copy (odpis zupełny) is preferred for citizenship applications
- Standard fee: 50-100 PLN per document
- Processing time: 2-4 weeks from Polish USC offices
- Person types: AP=Applicant, F=Father, M=Mother, PGF=Paternal Grandfather, PGM=Paternal Grandmother, MGF=Maternal Grandfather, MGM=Maternal Grandmother, SP=Spouse

WORKFLOW:
1. Check master_table for person data before creating requests
2. Create civil acts request (automatically creates payment task)
3. Record payment when received (cannot submit without payment)
4. Update status to 'submitted' once letter sent to USC
5. Track progress (submitted → in_progress → received)
6. Link document when received

IMPORTANT:
- Always check master_table for complete person data first
- Cannot mark as 'submitted' without payment recorded
- Duplicate requests are prevented automatically`,

    wsc_response_drafting: `${basePrompt}

WSC RESPONSE DRAFTING AGENT

Draft strategic responses to WSC (Voivoda) letters based on case specifics and legal requirements.

AVAILABLE TOOLS:
- draft_wsc_response: Create strategy entries for WSC letters
- create_task: Create follow-up tasks
- update_master_data: Update case data

STRATEGIES:
- PUSH: Aggressive legal arguments, cite precedents
- NUDGE: Diplomatic inquiry, request clarification
- SITDOWN: Schedule in-person meeting

WORKFLOW:
1. Analyze WSC letter requirements
2. Select appropriate strategy
3. Draft key arguments
4. Create follow-up tasks`,

    researcher: `${basePrompt}

RESEARCHER AGENT - Archive Search Specialist

EXPERTISE: Conduct comprehensive archive searches for Polish and international documents.

ARCHIVES KNOWLEDGE:
- Polish State Archives (Archiwum Państwowe)
- Civil Registry Offices (USC)
- International archives (Ellis Island, JewishGen, etc.)
- Church records and parish archives
- Military archives

AVAILABLE TOOLS:
- create_archive_search: Create new archive search
- update_archive_search: Update search status/findings
- generate_archive_letter: Generate Polish archive letters
- create_task: Create research tasks

RESEARCH PROCESS:
1. Analyze family history and ancestry line
2. Identify potential archive sources
3. Prioritize searches based on document importance
4. Generate targeted search requests
5. Track and document findings

Provide detailed research plans with specific archive names, locations, and search strategies.`,

    archive_request_management: `${basePrompt}

ARCHIVE REQUEST MANAGEMENT AGENT

Generate and manage Polish archive document requests for missing birth/marriage/death certificates.

AVAILABLE TOOLS:
- create_archive_search: Create new archive searches
- update_archive_search: Update search status and findings
- generate_archive_letter: Generate Polish archive request letters
- create_task: Create follow-up tasks
- trigger_ocr: Process historical documents

POLISH ARCHIVES PROTOCOL:
- Umiejscowienie: Use when you don't know which registry office has the document
- Uzupełnienie: Use when you know the registry but need the document

WORKFLOW:
1. Identify missing documents from case data
2. Determine appropriate Polish archive (city/voivodeship)
3. Create archive search with document types
4. Generate formal request letter in Polish
5. Track response times and update status
6. Create follow-up tasks for document processing`,

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

// FIX 7: Archive letter template generator
function generateArchiveLetterTemplate(
  letterType: string,
  personDetails: any,
  archiveAddress: string,
  searchData: any
): string {
  const today = new Date().toLocaleDateString('pl-PL');
  
  if (letterType === 'umiejscowienie') {
    return `
Szanowni Państwo,

${archiveAddress}

Data: ${today}

Dotyczy: Wniosek o umiejscowienie aktu stanu cywilnego

W imieniu klienta ${personDetails.firstName || '[Imię]'} ${personDetails.lastName || '[Nazwisko]'}, 
proszę o pomoc w zlokalizowaniu następujących dokumentów:

Osoba: ${personDetails.firstName || '[Imię]'} ${personDetails.lastName || '[Nazwisko]'}
Data urodzenia: ${personDetails.dob || '[DD.MM.YYYY]'}
Miejsce urodzenia: ${personDetails.pob || '[Miasto]'}

Poszukiwane dokumenty:
${(searchData.document_types || []).map((dt: string) => `- ${dt}`).join('\n')}

Dokumenty są potrzebne do postępowania o potwierdzenie obywatelstwa polskiego 
na podstawie art. 4 ustawy o obywatelstwie polskim.

Proszę o informację, czy powyższe akty znajdują się w Państwa archiwum, 
oraz o wskazanie trybu ich uzyskania.

Z poważaniem,
Heritage and Citizenship Bureau
Biuro Obywatelstwa i Dziedzictwa
  `.trim();
  } else if (letterType === 'uzupelnienie') {
    return `
Szanowni Państwo,

${archiveAddress}

Data: ${today}

Dotyczy: Wniosek o wydanie odpisu aktu stanu cywilnego

W imieniu klienta ${personDetails.firstName || '[Imię]'} ${personDetails.lastName || '[Nazwisko]'}, 
proszę o wydanie odpisów następujących aktów stanu cywilnego:

Osoba: ${personDetails.firstName || '[Imię]'} ${personDetails.lastName || '[Nazwisko]'}
Data urodzenia: ${personDetails.dob || '[DD.MM.YYYY]'}
Miejsce urodzenia: ${personDetails.pob || '[Miasto]'}

Wnioskowane odpisy:
${(searchData.document_types || []).map((dt: string) => `- ${dt}`).join('\n')}

Odpisy są potrzebne do postępowania o potwierdzenie posiadania obywatelstwa polskiego.

Proszę o informację o trybie i kosztach wydania odpisów oraz o podanie numeru konta 
do opłaty skarbowej.

Z poważaniem,
Heritage and Citizenship Bureau
Biuro Obywatelstwa i Dziedzictwa
  `.trim();
  }
  
  return `Archive request letter for ${letterType}`;
}

// FIX 4: Error troubleshooting hints
function getErrorHint(toolName: string, error: any): string {
  const hints: Record<string, string> = {
    'create_oby_draft': 'Ensure master_table has data for this case. Check if draft already exists.',
    'create_archive_search': 'Verify archive name and person type are valid. Check for duplicate searches.',
    'update_archive_search': 'Confirm search ID exists. Verify status transition is valid.',
    'generate_archive_letter': 'Ensure search ID exists and has required person details.',
    'create_translation_job': 'Verify document exists and languages are valid codes.',
    'update_translation_status': 'Check status transition rules. Ensure job ID is valid.',
    'assign_translator': 'Verify translator and job IDs exist. Check translator workload.',
    'generate_poa_pdf': 'Ensure case has complete intake data for POA generation.',
    'create_task': 'Verify case ID exists and required fields are provided.',
    'update_master_data': 'Check field names match master_table schema.',
  };
  
  const hint = hints[toolName] || 'Check tool parameters and database constraints.';
  
  if (error.message?.includes('not found')) {
    return `${hint} The referenced resource does not exist in the database.`;
  } else if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
    return `${hint} A similar record already exists - check for duplicates.`;
  } else if (error.message?.includes('foreign key')) {
    return `${hint} Referenced ID does not exist - verify all foreign keys.`;
  }
  
  return hint;
}
