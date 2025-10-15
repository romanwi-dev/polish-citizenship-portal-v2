import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Languages, FileText } from "lucide-react";
import { toast } from "sonner";

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
      </CardHeader>
      <CardContent>
        {!documents || documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>All documents translated!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.person_type} - {doc.type}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => markTranslatedMutation.mutate(doc.id)}
                  disabled={markTranslatedMutation.isPending}
                >
                  Mark Translated
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
