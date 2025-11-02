import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConflictData {
  id: string;
  field_name: string;
  ocr_value: string | null;
  manual_value: string | null;
  ocr_confidence: number | null;
  document_id: string;
  status: string;
}

export function useOCRConflictDetection(caseId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: conflicts, isLoading } = useQuery({
    queryKey: ['ocr-conflicts', caseId],
    queryFn: async () => {
      if (!caseId) return [];

      const { data, error } = await supabase
        .from('ocr_conflicts')
        .select(`
          *,
          documents (
            name,
            person_type,
            type
          )
        `)
        .eq('case_id', caseId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ConflictData[];
    },
    enabled: !!caseId
  });

  const resolveConflict = useMutation({
    mutationFn: async ({
      conflictId,
      resolution,
      notes
    }: {
      conflictId: string;
      resolution: 'ocr' | 'manual' | 'ignore';
      notes?: string;
    }) => {
      const status = resolution === 'ocr' ? 'resolved_ocr' : 
                     resolution === 'manual' ? 'resolved_manual' : 'ignored';

      const { error } = await supabase
        .from('ocr_conflicts')
        .update({
          status,
          resolved_by: (await supabase.auth.getUser()).data.user?.id,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes
        })
        .eq('id', conflictId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Conflict resolved");
      queryClient.invalidateQueries({ queryKey: ['ocr-conflicts', caseId] });
    },
    onError: (error: any) => {
      toast.error("Failed to resolve conflict: " + error.message);
    }
  });

  return {
    conflicts: conflicts || [],
    conflictCount: conflicts?.length || 0,
    isLoading,
    resolveConflict: resolveConflict.mutate,
    isResolving: resolveConflict.isPending
  };
}
