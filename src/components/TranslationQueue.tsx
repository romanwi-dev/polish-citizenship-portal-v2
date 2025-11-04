import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Languages, FileText, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { TranslationTaskBadge } from "@/components/docs/TranslationTaskBadge";

interface Document {
  id: string;
  name: string;
  person_type: string;
  type: string;
  file_extension: string;
  is_translated: boolean;
  translation_required: boolean;
  case_id: string;
}

export const TranslationQueue = ({ caseId }: { caseId: string }) => {
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["translation-queue", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("case_id", caseId)
        .eq("translation_required", true)
        .eq("is_translated", false);
      
      if (error) throw error;
      return data;
    },
  });

  const markTranslatedMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from("documents")
        .update({ is_translated: true, translation_required: false })
        .eq("id", documentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Document marked as translated");
      queryClient.invalidateQueries({ queryKey: ["translation-queue", caseId] });
      queryClient.invalidateQueries({ queryKey: ["documents", caseId] });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="w-5 h-5" />
          Translation Queue
          <Badge variant="secondary">{documents?.length || 0}</Badge>
        </CardTitle>
        {documents && documents.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Documents requiring translation to Polish
          </p>
        )}
      </CardHeader>
      <CardContent>
        {!documents || documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="font-medium">All documents translated!</p>
            <p className="text-xs mt-2">No pending translation tasks</p>
          </div>
        ) : (
          <>
            {documents.length > 5 && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>{documents.length} documents</strong> need translation. High priority for case processing.
                </p>
              </div>
            )}
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-start justify-between p-3 bg-muted rounded-lg border border-border"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-1">{doc.name}</p>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {doc.person_type && (
                          <Badge variant="outline" className="text-xs">
                            {doc.person_type}
                          </Badge>
                        )}
                        {doc.type && (
                          <Badge variant="secondary" className="text-xs">
                            {doc.type}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Translation task automatically created
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => markTranslatedMutation.mutate(doc.id)}
                    disabled={markTranslatedMutation.isPending}
                    className="shrink-0"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Translated
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
