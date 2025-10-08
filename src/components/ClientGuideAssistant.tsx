import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bot, Loader2, Sparkles, Minimize2, X, Mic, MicOff, Volume2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useConversation } from '@11labs/react';

interface ClientGuideAssistantProps {
  formType: 'intake' | 'master' | 'poa' | 'citizenship' | 'civil_registry' | 'family_tree';
  currentField?: string;
  context?: any;
  compact?: boolean;
}

export const ClientGuideAssistant = ({ 
  formType, 
  currentField, 
  context,
  compact = false 
}: ClientGuideAssistantProps) => {
  const [question, setQuestion] = useState("");
  const [guidance, setGuidance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  // ElevenLabs conversation hook with Aria voice
  const conversation = useConversation({
    onConnect: () => {
      console.log('Voice connected');
      toast({
        title: "Voice Ready",
        description: "You can now speak with your assistant",
      });
    },
    onDisconnect: () => {
      console.log('Voice disconnected');
    },
    onMessage: (message) => {
      console.log('Voice message:', message);
      if (message.message?.role === 'assistant' && message.message?.content) {
        setGuidance(message.message.content);
      }
    },
    onError: (error) => {
      console.error('Voice error:', error);
      toast({
        title: "Voice Error",
        description: "Something went wrong with the voice assistant",
        variant: "destructive",
      });
    },
    overrides: {
      agent: {
        prompt: {
          prompt: `You are a form-filling voice assistant for Polish citizenship applications. 
          
CRITICAL RULES:
- Answer in 5-8 words maximum
- Tell exactly what to enter
- Give one example
- Speak slowly and clearly
- No background explanations

Current form: ${formType}
Current field: ${currentField || 'none'}

When user asks about a field, respond ONLY:
"Enter [what]. Example: [example]"

Keep it ultra-brief and helpful.`,
        },
        firstMessage: "Hi! Ask me about any form field.",
        language: "en",
      },
      tts: {
        voiceId: "9BWtsMINqrJLrRacOk9x", // Aria - premium ASMR-like female voice
      },
    },
  });

  const getGuidance = async (userQuestion: string | null) => {
    setIsLoading(true);
    setGuidance("");

    try {
      const { data: guideData, error: guideError } = await supabase.functions.invoke('client-guide-agent', {
        body: { 
          formType,
          currentField,
          userQuestion,
          context
        }
      });

      if (guideError) throw guideError;

      const guidanceText = guideData.guidance;
      setGuidance(guidanceText);

    } catch (error: any) {
      console.error('Guide error:', error);
      toast({
        title: "Error",
        description: "Failed to get guidance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    await getGuidance(question);
    setQuestion("");
  };

  const startVoiceChat = async () => {
    try {
      setIsLoading(true);
      
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL from our edge function
      // Note: You need to create an agent in ElevenLabs UI first and use that agent ID
      const { data, error } = await supabase.functions.invoke('elevenlabs-signed-url', {
        body: { 
          agentId: 'your-agent-id-here', // Replace with your ElevenLabs agent ID
        }
      });

      if (error) throw error;

      await conversation.startSession({ 
        signedUrl: data.signedUrl 
      });

    } catch (error: any) {
      console.error('Voice error:', error);
      toast({
        title: "Voice Error",
        description: error.message || "Failed to start voice chat",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopVoiceChat = async () => {
    await conversation.endSession();
  };

  const quickQuestions = [
    "What is this form for?",
    "What do I need to prepare?",
    "Can I skip fields I don't know?",
    "How long does this take?",
  ];

  if (compact) {
    // Hidden state - sleek floating button
    if (!isVisible) {
      return (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsVisible(true)}
            size="lg"
            className="rounded-full h-16 w-16 shadow-2xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-110"
          >
            <Bot className="h-8 w-8 text-white" />
          </Button>
        </div>
      );
    }

    // Minimized state - elegant header bar
    if (isMinimized) {
      return (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <Card className="w-80 shadow-2xl border-primary/30 bg-gradient-to-br from-background to-primary/5 backdrop-blur-sm rounded-2xl">
            <CardHeader className="pb-3 cursor-pointer hover:bg-primary/5 transition-colors rounded-t-2xl" onClick={() => setIsMinimized(false)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bot className="h-6 w-6 text-primary" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <CardTitle className="text-base font-light text-foreground/90">
                    AI Guide
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVisible(false);
                  }}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      );
    }

    // Full expanded state - beautiful, modern design
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-scale-in">
        <Card className="w-96 shadow-2xl border-primary/30 bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/20 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                  <Bot className="h-6 w-6 text-primary relative z-10" />
                  {conversation.isSpeaking && (
                    <Volume2 className="h-3 w-3 text-green-500 absolute -bottom-1 -right-1 animate-pulse" />
                  )}
                </div>
                <CardTitle className="text-base font-light text-foreground/90">
                  AI Form Assistant
                </CardTitle>
              </div>
              <div className="flex items-center gap-1">
                {conversation.status !== "connected" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startVoiceChat}
                    disabled={isLoading}
                    className="h-8 w-8 p-0 hover:bg-green-500/10"
                    title="Start voice chat"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4 text-green-500" />}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={stopVoiceChat}
                    className="h-8 w-8 p-0 hover:bg-red-500/10"
                    title="Stop voice chat"
                  >
                    <MicOff className="h-4 w-4 text-red-500" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="h-8 w-8 p-0 hover:bg-primary/10"
                  title="Minimize"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {guidance && (
              <Alert className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm mt-2 leading-relaxed font-light text-foreground/90">
                  {guidance}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask me anything..."
                rows={2}
                className="resize-none text-sm bg-background/50 border-primary/20 focus:border-primary/40"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAskQuestion();
                  }
                }}
              />
              <Button 
                onClick={handleAskQuestion}
                disabled={isLoading}
                size="sm"
                className="shrink-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {!isLoading && "Ask"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle>AI Form Guide</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Guidance Display */}
        {guidance && (
          <Alert className="bg-primary/5 border-primary/20">
            <Sparkles className="h-4 w-4" />
            <AlertDescription className="whitespace-pre-wrap mt-2">
              {guidance}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Questions */}
        <div>
          <label className="text-sm font-medium mb-2 block">Quick Questions</label>
          <div className="grid grid-cols-2 gap-2">
            {quickQuestions.map((q, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-xs justify-start h-auto py-2"
                onClick={() => {
                  setQuestion(q);
                  getGuidance(q);
                }}
                disabled={isLoading}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Question */}
        <div>
          <label className="text-sm font-medium mb-2 block">Ask Your Question</label>
          <div className="flex gap-2">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              rows={3}
              className="resize-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAskQuestion();
                }
              }}
            />
          </div>
        </div>

        {/* Ask Button */}
        <Button 
          onClick={handleAskQuestion}
          disabled={isLoading || !question.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting Answer...
            </>
          ) : (
            "Ask Guide"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
