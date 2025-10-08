import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bot, Volume2, VolumeX, Loader2, HelpCircle, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Auto-generate guidance when field changes
  useEffect(() => {
    if (currentField && autoSpeak) {
      getGuidance(null);
    }
  }, [currentField]);

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

      // Auto-play audio if enabled
      if (autoSpeak) {
        await speakGuidance(guidanceText);
      }

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

  const speakGuidance = async (text: string) => {
    try {
      setIsPlayingAudio(true);

      const { data: audioData, error: audioError } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text,
          voice: 'EXAVITQu4vr4xnSDxMaL' // Sarah - warm, clear female voice
        }
      });

      if (audioError) throw audioError;

      // Create audio element and play
      const audio = new Audio(`data:audio/mpeg;base64,${audioData.audioContent}`);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlayingAudio(false);
      };

      await audio.play();

    } catch (error: any) {
      console.error('Audio error:', error);
      setIsPlayingAudio(false);
      toast({
        title: "Audio Error",
        description: "Could not play audio, but guidance is shown below.",
        variant: "destructive",
      });
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
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

  const quickQuestions = [
    "What is this form for?",
    "What do I need to prepare?",
    "Can I skip fields I don't know?",
    "How long does this take?",
  ];

  if (compact) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="w-96 shadow-2xl border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">AI Guide</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoSpeak(!autoSpeak)}
                className="h-8 w-8 p-0"
              >
                {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {guidance && (
              <Alert className="bg-primary/5 border-primary/20">
                <Sparkles className="h-4 w-4" />
                <AlertDescription className="text-sm mt-2">
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
                className="resize-none text-sm"
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
                className="shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <HelpCircle className="h-4 w-4" />
                )}
              </Button>
            </div>

            {isPlayingAudio && (
              <Button
                onClick={stopAudio}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <VolumeX className="h-4 w-4 mr-2" />
                Stop Audio
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle>AI Form Guide</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Auto-speak</span>
            <Button
              variant={autoSpeak ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoSpeak(!autoSpeak)}
              className="h-8"
            >
              {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
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

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={handleAskQuestion}
            disabled={isLoading || !question.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting Answer...
              </>
            ) : (
              <>
                <HelpCircle className="mr-2 h-4 w-4" />
                Ask Guide
              </>
            )}
          </Button>

          {isPlayingAudio && (
            <Button
              onClick={stopAudio}
              variant="outline"
            >
              <VolumeX className="h-4 w-4 mr-2" />
              Stop Audio
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
