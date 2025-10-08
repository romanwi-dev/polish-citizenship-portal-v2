import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bot, Sparkles, FileText, CheckCircle2, TrendingUp, Mail, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIAgentPanelProps {
  caseId: string;
}

export const AIAgentPanel = ({ caseId }: AIAgentPanelProps) => {
  const [prompt, setPrompt] = useState("");
  const [action, setAction] = useState("comprehensive");
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
  ];

  const quickPrompts = [
    "Analyze this case and tell me if the client is eligible",
    "What documents are we missing?",
    "What should I do next?",
    "Review the WSC letter and suggest a strategy",
    "Check if all required forms are complete",
    "Estimate timeline to citizenship decision"
  ];

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('ai-agent', {
        body: { 
          caseId, 
          prompt,
          action 
        },
        headers: {
          'x-user-id': user?.id
        }
      });

      if (error) throw error;

      setResponse(data.response);
      toast({
        title: "Analysis Complete",
        description: "AI agent has analyzed the case",
      });
    } catch (error: any) {
      console.error('AI Agent error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle>AI Case Agent</CardTitle>
        </div>
        <CardDescription>
          Automated analysis and task automation for case management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Type Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">Agent Action</label>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {agentActions.map((act) => {
                const Icon = act.icon;
                return (
                  <SelectItem key={act.value} value={act.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {act.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Prompts */}
        <div>
          <label className="text-sm font-medium mb-2 block">Quick Prompts</label>
          <div className="grid grid-cols-2 gap-2">
            {quickPrompts.map((qp, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-xs justify-start h-auto py-2"
                onClick={() => setPrompt(qp)}
              >
                {qp}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Prompt */}
        <div>
          <label className="text-sm font-medium mb-2 block">Custom Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask the AI agent anything about this case..."
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Run AI Agent
            </>
          )}
        </Button>

        {/* Response */}
        {response && (
          <Alert className="bg-primary/5 border-primary/20">
            <Bot className="h-4 w-4" />
            <AlertDescription className="whitespace-pre-wrap text-sm mt-2">
              {response}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
