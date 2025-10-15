import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Languages, Sparkles, User, CheckCircle, X } from "lucide-react";

interface TranslationJobDetailProps {
  jobId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TranslationJobDetail = ({ jobId, open, onOpenChange }: TranslationJobDetailProps) => {
  const [humanTranslation, setHumanTranslation] = useState("");
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ["translation-job", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translation_jobs')
        .select(`
          *,
          cases(client_name, client_code),
          documents(name, type, dropbox_path),
          sworn_translators(full_name, certification_number, email)
        `)
        .eq('id', jobId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!jobId
  });

  const aiTranslateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-translate', {
        body: {
          jobId: job?.id,
          sourceText: job?.source_text,
          sourceLanguage: job?.source_language,
          targetLanguage: job?.target_language,
          documentType: job?.documents?.type
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("AI translation completed");
      queryClient.invalidateQueries({ queryKey: ["translation-job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["translation-jobs"] });
    },
    onError: (error) => {
      toast.error("AI translation failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const updateTranslationMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('translation_jobs')
        .update(updates)
        .eq('id', jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Translation updated");
      queryClient.invalidateQueries({ queryKey: ["translation-job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["translation-jobs"] });
    }
  });

  const handleApprove = () => {
    updateTranslationMutation.mutate({
      hac_approved: true,
      hac_approved_at: new Date().toISOString(),
      status: 'certified'
    });
  };

  const handleSubmitHumanTranslation = () => {
    updateTranslationMutation.mutate({
      human_translation: humanTranslation,
      final_translation: humanTranslation,
      status: 'human_review'
    });
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Languages className="h-6 w-6" />
            Translation Job: {job?.cases?.client_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Case</p>
              <p className="font-medium">{job?.cases?.client_name} ({job?.cases?.client_code})</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Languages</p>
              <p className="font-medium">{job?.source_language} → {job?.target_language}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge>{job?.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Priority</p>
              <Badge variant="outline">{job?.priority}</Badge>
            </div>
          </div>

          {/* Translations Tabs */}
          <Tabs defaultValue="source" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="source">Source Text</TabsTrigger>
              <TabsTrigger value="ai">AI Translation</TabsTrigger>
              <TabsTrigger value="human">Human Translation</TabsTrigger>
              <TabsTrigger value="final">Final</TabsTrigger>
            </TabsList>

            <TabsContent value="source" className="space-y-4">
              <Card className="p-4">
                <Textarea
                  value={job?.source_text || ""}
                  readOnly
                  className="min-h-[300px]"
                />
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              {!job?.ai_translation ? (
                <Card className="p-6 text-center">
                  <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No AI translation yet
                  </p>
                  <Button
                    onClick={() => aiTranslateMutation.mutate()}
                    disabled={aiTranslateMutation.isPending}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {aiTranslateMutation.isPending ? "Translating..." : "Generate AI Translation"}
                  </Button>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <div className="flex-1 w-32 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2"
                          style={{ width: `${(job.ai_confidence || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {((job.ai_confidence || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <Card className="p-4">
                    <Textarea
                      value={job.ai_translation}
                      readOnly
                      className="min-h-[300px]"
                    />
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="human" className="space-y-4">
              <Card className="p-4">
                <Textarea
                  value={humanTranslation || job?.human_translation || ""}
                  onChange={(e) => setHumanTranslation(e.target.value)}
                  placeholder="Enter human translation or review AI translation..."
                  className="min-h-[300px]"
                />
              </Card>
              <Button onClick={handleSubmitHumanTranslation}>
                Save Human Translation
              </Button>
            </TabsContent>

            <TabsContent value="final" className="space-y-4">
              <Card className="p-4">
                <Textarea
                  value={job?.final_translation || job?.human_translation || job?.ai_translation || ""}
                  readOnly
                  className="min-h-[300px]"
                />
              </Card>
              {!job?.hac_approved && (
                <div className="flex gap-2">
                  <Button onClick={handleApprove} className="flex-1">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    HAC Approve
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Sworn Translator Info */}
          {job?.sworn_translators && (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{job.sworn_translators.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Cert: {job.sworn_translators.certification_number}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};