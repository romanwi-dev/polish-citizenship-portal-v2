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
  sort_order: number | null;
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
      
      return data as CaseData[];
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: true,
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
      
      // Log case access for audit trail
      try {
        await supabase.rpc('log_security_event', {
          p_event_type: 'case_update',
          p_severity: 'info',
          p_action: 'UPDATE',
          p_resource_type: 'case',
          p_resource_id: caseId,
          p_details: { fields_updated: Object.keys(updates) },
          p_success: true,
        });
      } catch (err) {
        // Audit logging failed (non-critical)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
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
      // Log deletion attempt for audit trail
      try {
        await supabase.rpc('log_security_event', {
          p_event_type: 'case_delete',
          p_severity: 'warning',
          p_action: 'DELETE',
          p_resource_type: 'case',
          p_resource_id: caseId,
          p_details: {},
          p_success: true,
        });
      } catch (err) {
        // Audit logging failed (non-critical)
      }
      
      const { error } = await supabase
        .from("cases")
        .delete()
        .eq("id", caseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Case deleted successfully (all related data cascaded)");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete case: ${error.message}`);
    },
  });
};
