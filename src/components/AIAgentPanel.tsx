import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bot, Sparkles, FileText, CheckCircle2, TrendingUp, Mail, Zap, Shield, Search, Languages, PenTool, Palette } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const { toast } = useToast();

  const agentActions = [
    { value: "comprehensive", label: "Comprehensive Analysis", icon: Sparkles },
    { value: "eligibility_analysis", label: "Eligibility Check", icon: CheckCircle2 },
    { value: "document_check", label: "Document Review", icon: FileText },
    { value: "task_suggest", label: "Task Suggestions", icon: Zap },
    { value: "wsc_strategy", label: "WSC Letter Strategy", icon: Mail },
    { value: "form_populate", label: "Form Auto-Population", icon: TrendingUp },
    { value: "security_audit", label: "Security Audit", icon: Shield },
    { value: "researcher", label: "Research & Analysis", icon: Search },
    { value: "translator", label: "Translation Agent", icon: Languages },
    { value: "writer", label: "Content Writer", icon: PenTool },
    { value: "designer", label: "UI/UX Designer", icon: Palette },
  ];

  const defaultQuickPrompts = [
    "Analyze this case and tell me if the client is eligible",
    "What documents are we missing?",
    "What should I do next?",
    "Review the WSC letter and suggest a strategy",
    "Check if all required forms are complete",
    "Estimate timeline to citizenship decision"
  ];

  const quickPrompts = customQuickPrompts || defaultQuickPrompts;

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    // Validate caseId for non-security-audit actions
    if (action !== 'security_audit' && !caseId) {
      toast({
        title: "Error",
        description: "Please select a case first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('ai-agent', {
        body: { 
          caseId, 
          prompt,
          action 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'x-user-id': session.user.id
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data || !data.response) {
        throw new Error('Invalid response from AI agent');
      }

      setResponse(data.response);
      toast({
        title: "Analysis Complete",
        description: "AI agent has analyzed the case",
      });
    } catch (error: any) {
      console.error('AI Agent error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send a request to the Edge Function",
        variant: "destructive",
      });
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
            Automated analysis and task automation for case management
          </p>
        </div>
      </div>

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
        onClick={handleSubmit} 
        disabled={isLoading}
        className="w-full h-12 sm:h-14 text-base sm:text-lg"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Run AI Agent
          </>
        )}
      </Button>

      {/* Response */}
      {response && (
        <Alert className="bg-primary/5 border-primary/20 border-2 p-4 sm:p-6">
          <Bot className="h-5 w-5" />
          <AlertDescription className="whitespace-pre-wrap text-base sm:text-lg mt-3 leading-relaxed">
            {response}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
