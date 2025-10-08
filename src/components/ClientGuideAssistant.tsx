import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bot, Loader2, Sparkles, Minimize2, X, Volume2, VolumeX, Mic, MicOff } from "lucide-react";
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
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

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
        description: "Failed to get guidance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playVoice = (text: string) => {
    try {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      setIsPlaying(true);
      console.log('🎤 [MOBILE SPEECH] Starting:', text.substring(0, 30));

      // Use browser's built-in speech synthesis (works on iOS/Android)
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      // Try to use a female voice if available
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Karen') ||
        voice.name.includes('Google US English')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        console.log('🎵 Using voice:', femaleVoice.name);
      }

      utterance.onstart = () => {
        console.log('▶️ [MOBILE SPEECH] Started playing');
      };

      utterance.onend = () => {
        console.log('✅ [MOBILE SPEECH] Finished');
        setIsPlaying(false);
      };

      utterance.onerror = (event) => {
        console.error('❌ [MOBILE SPEECH] Error:', event.error);
        setIsPlaying(false);
        toast({
          title: "Speech Error",
          description: "Could not speak text",
          variant: "destructive",
        });
      };

      // Speak immediately (works on mobile in button click context)
      window.speechSynthesis.speak(utterance);
      console.log('✅ [MOBILE SPEECH] Speech queued');

    } catch (error: any) {
      console.error('💥 [MOBILE SPEECH] Error:', error);
      setIsPlaying(false);
      toast({
        title: "Voice Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const stopVoice = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording...",
        description: "Speak your question now",
      });
    } catch (error: any) {
      console.error('Recording error:', error);
      toast({
        title: "Microphone Error",
        description: "Couldn't access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      const base64Audio = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });

      // Transcribe with Whisper
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      });

      if (error) throw error;

      const transcribedText = data.text;
      setQuestion(transcribedText);
      
      // Auto-submit the transcribed question
      await getGuidance(transcribedText);
      setQuestion("");

    } catch (error: any) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription Error",
        description: "Couldn't understand audio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                  {isPlaying && (
                    <Volume2 className="h-3 w-3 text-green-500 absolute -bottom-1 -right-1 animate-pulse" />
                  )}
                </div>
                <CardTitle className="text-base font-light text-foreground/90">
                  AI Voice Assistant
                </CardTitle>
              </div>
              <div className="flex items-center gap-1">
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
              <div className="space-y-2">
                <Alert className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 shadow-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-base mt-2 leading-relaxed font-medium text-foreground">
                    {guidance}
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => playVoice(guidance)}
                  disabled={isPlaying}
                  size="sm"
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold shadow-lg text-base py-6"
                >
                  {isPlaying ? (
                    <>
                      <VolumeX className="h-6 w-6 mr-2 animate-pulse" />
                      Speaking...
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-6 w-6 mr-2" />
                      🔊 TAP TO HEAR
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex gap-2">
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type or speak your question..."
                  rows={2}
                  className="resize-none text-sm bg-background/50 border-primary/20 focus:border-primary/40"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAskQuestion();
                    }
                  }}
                />
                <div className="flex flex-col gap-1">
                  <Button 
                    onClick={handleAskQuestion}
                    disabled={isLoading || !question.trim()}
                    size="sm"
                    className="shrink-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {!isLoading && "Ask"}
                  </Button>
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isLoading}
                    size="sm"
                    variant={isRecording ? "destructive" : "outline"}
                    className="shrink-0"
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {isRecording && (
                <div className="text-xs text-center text-red-500 animate-pulse">
                  🔴 Recording... Click mic to stop
                </div>
              )}
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
