import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bot, Sparkles, FileText, CheckCircle2, TrendingUp, Mail, Zap, Shield, Search, Languages, PenTool, Palette, User, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

interface AIAgentPanelProps {
  caseId: string;
  defaultAction?: string;
  showActionSelector?: boolean;
  customQuickPrompts?: string[];
}

export const AIAgentPanel = ({ caseId, defaultAction, showActionSelector = true, customQuickPrompts }: AIAgentPanelProps) => {
  const [prompt, setPrompt] = useState("");
  const [action, setAction] = useState(defaultAction || "comprehensive");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [toolResults, setToolResults] = useState<any[]>([]);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const agentActions = [
    { value: "comprehensive", label: "Comprehensive Analysis", icon: Sparkles },
    { value: "eligibility_analysis", label: "Eligibility Check", icon: CheckCircle2 },
    { value: "document_check", label: "Document Review", icon: FileText },
    { value: "document_intelligence", label: "Document Intelligence", icon: FileText },
    { value: "task_suggest", label: "Task Suggestions", icon: Zap },
    { value: "wsc_strategy", label: "WSC Letter Strategy", icon: Mail },
    { value: "form_populate", label: "Form Auto-Population", icon: TrendingUp },
    { value: "auto_populate_forms", label: "Auto-Populate Forms", icon: TrendingUp },
    { value: "security_audit", label: "Security Audit", icon: Shield },
    { value: "researcher", label: "Research & Analysis", icon: Search },
    { value: "translator", label: "Translation Agent", icon: Languages },
    { value: "writer", label: "Content Writer", icon: PenTool },
    { value: "designer", label: "UI/UX Designer", icon: Palette },
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversation history on mount
  useEffect(() => {
    const loadConversation = async () => {
      if (!caseId) return;

      try {
        // Check if conversation exists for this case and action
        const { data: existingConv } = await supabase
          .from('ai_conversations')
          .select('id')
          .eq('case_id', caseId)
          .eq('agent_type', action)
          .single();

        if (existingConv) {
          setConversationId(existingConv.id);
          
          // Load messages
          const { data: msgs } = await supabase
            .from('ai_conversation_messages')
            .select('role, content, created_at')
            .eq('conversation_id', existingConv.id)
            .order('created_at', { ascending: true })
            .limit(20);

          if (msgs) {
            setMessages(msgs as ConversationMessage[]);
          }
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    };

    loadConversation();
  }, [caseId, action]);

  const defaultQuickPrompts = [
    "Analyze this case and tell me if the client is eligible",
    "What documents are we missing?",
    "What should I do next?",
    "Review the WSC letter and suggest a strategy",
    "Check if all required forms are complete",
    "Estimate timeline to citizenship decision"
  ];

  const quickPrompts = customQuickPrompts || defaultQuickPrompts;

  const handleStreamingSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    if (action !== 'security_audit' && !caseId) {
      toast({
        title: "Error",
        description: "Please select a case first",
        variant: "destructive",
      });
      return;
    }

    if (caseId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(caseId)) {
        toast({
          title: "Invalid Case ID",
          description: "Please navigate to this page from a case detail page",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    setResponse("");
    setToolResults([]);

    // Add user message to UI immediately
    const userMessage: ConversationMessage = {
      role: 'user',
      content: prompt,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setPrompt(""); // Clear input

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Build EventSource URL with query params
      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-agent`);
      url.searchParams.set('stream', 'true');

      const requestBody = {
        caseId,
        prompt: userMessage.content,
        action,
        conversationId,
        stream: true
      };

      // Use fetch with streaming
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';
      let assistantContent = '';
      let receivedConversationId = conversationId;
      let receivedToolResults: any[] = [];

      // Create assistant message placeholder
      const assistantMsg: ConversationMessage = {
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            
            if (parsed.delta) {
              assistantContent += parsed.delta;
              // Update the last message (assistant) with new content
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: assistantContent
                };
                return updated;
              });
            }

            // Handle conversationId from streaming or non-streaming
            if (parsed.conversationId) {
              if (!receivedConversationId) {
                receivedConversationId = parsed.conversationId;
                setConversationId(parsed.conversationId);
              }
            }

            if (parsed.toolResults) {
              receivedToolResults = parsed.toolResults;
              setToolResults(parsed.toolResults);
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }

      // Final update
      setResponse(assistantContent);
      
      if (receivedToolResults.length > 0) {
        toast({
          title: "AI Actions Completed",
          description: `${receivedToolResults.length} tool(s) executed successfully`,
        });
      }

    } catch (error: any) {
      console.error('Streaming error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to stream response",
        variant: "destructive",
      });
      
      // Remove the assistant message placeholder if error
      setMessages(prev => prev.filter(m => m.role !== 'assistant' || m.content !== ''));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-3 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">AI Case Agent</h2>
          <p className="text-base sm:text-lg mt-1 text-muted-foreground">
            Automated analysis, task automation & streaming responses
          </p>
        </div>
      </div>

      {/* Conversation History */}
      {messages.length > 0 && (
        <Card className="border-2">
          <ScrollArea className="h-[400px] p-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex-shrink-0">
                      {msg.role === 'user' ? (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                          <Bot className="h-4 w-4 text-secondary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <Badge variant={msg.role === 'user' ? 'default' : 'secondary'}>
                        {msg.role === 'user' ? 'You' : 'AI Agent'}
                      </Badge>
                      <div className={`p-3 rounded-lg ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Tool Results */}
      {toolResults.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">AI Actions Executed:</label>
          <div className="space-y-2">
            {toolResults.map((result, idx) => (
              <Alert key={idx} className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm">
                  {result.message || JSON.stringify(result)}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Action Type Selector */}
      {showActionSelector && (
        <div className="space-y-3">
          <label className="text-lg sm:text-xl font-normal text-foreground/95 block">Agent Action</label>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="h-12 sm:h-14 text-base sm:text-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {agentActions.map((act) => {
                const Icon = act.icon;
                return (
                  <SelectItem key={act.value} value={act.value} className="text-base sm:text-lg py-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {act.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Quick Prompts */}
      <div className="space-y-3">
        <label className="text-lg sm:text-xl font-normal text-foreground/95 block">Quick Prompts</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickPrompts.map((qp, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="lg"
              className="text-sm sm:text-base justify-start h-auto py-3 sm:py-4 px-4 border-2 hover-glow"
              onClick={() => setPrompt(qp)}
            >
              {qp}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Prompt */}
      <div className="space-y-3">
        <label className="text-lg sm:text-xl font-normal text-foreground/95 block">Custom Prompt</label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask the AI agent anything about this case..."
          rows={4}
          className="resize-none text-base sm:text-lg min-h-[120px] border-2"
        />
      </div>

      {/* Submit Button */}
      <Button 
        onClick={handleStreamingSubmit} 
        disabled={isLoading}
        className="w-full h-12 sm:h-14 text-base sm:text-lg"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Send Message (Streaming)
          </>
        )}
      </Button>
    </div>
  );
};
