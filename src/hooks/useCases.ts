import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CaseData {
  id: string;
  client_name: string;
  client_code: string | null;
  country: string | null;
  status: string;
  generation: string | null;
  is_vip: boolean | null;
  start_date: string | null;
  progress: number | null;
  dropbox_path: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  processing_mode: string;
  client_score: number;
  document_count: number;
  task_count: number;
  completed_task_count: number;
}

export const useCases = () => {
  return useQuery({
    queryKey: ["cases"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_cases_with_counts");
      
      if (error) {
        console.error("Error loading cases:", error);
        throw error;
      }
      
      // Deduplicate by ID in case the RPC returns duplicates
      const uniqueData = Array.from(
        new Map((data || []).map((item: CaseData) => [item.id, item])).values()
      );
      
      return uniqueData as CaseData[];
    },
    staleTime: 0, // Always refetch to ensure fresh data
    refetchOnWindowFocus: false, // Prevent automatic refetch on focus
    refetchOnMount: true,
  });
};

export const useUpdateCaseStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ caseId, status }: { caseId: string; status: string }) => {
      const { error } = await supabase
        .from("cases")
        .update({ status: status as any })
        .eq("id", caseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Case status updated");
    },
    onError: (error: any) => {
      toast.error(`Failed to update case: ${error.message}`);
    },
  });
};

export const useUpdateCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ caseId, updates }: { caseId: string; updates: any }) => {
      const { error } = await supabase
        .from("cases")
        .update(updates)
        .eq("id", caseId);
      
      if (error) throw error;
    },
    onSuccess: async () => {
      // Cancel any outgoing queries
      await queryClient.cancelQueries({ queryKey: ["cases"] });
      // Remove the old cache completely
      queryClient.removeQueries({ queryKey: ["cases"] });
      // Refetch fresh data
      await queryClient.refetchQueries({ queryKey: ["cases"] });
      toast.success("Case updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update case: ${error.message}`);
    },
  });
};

export const useDeleteCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (caseId: string) => {
      const { error } = await supabase
        .from("cases")
        .delete()
        .eq("id", caseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Case deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete case: ${error.message}`);
    },
  });
};
