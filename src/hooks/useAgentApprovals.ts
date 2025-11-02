import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AgentApproval {
  id: string;
  conversation_id: string;
  tool_name: string;
  tool_arguments: Record<string, any>;
  ai_explanation: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'auto_approved';
  requested_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  auto_approve_after: string | null;
}

export const useAgentApprovals = (status?: string) => {
  return useQuery({
    queryKey: ['agent-approvals', status],
    queryFn: async () => {
      let query = supabase
        .from('agent_approvals')
        .select('*')
        .order('requested_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AgentApproval[];
    },
  });
};

export const useApproveAgentTool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ approvalId, reviewNotes }: { approvalId: string; reviewNotes?: string }) => {
      const { data, error } = await supabase
        .from('agent_approvals')
        .update({
          status: 'approved',
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes || null,
        })
        .eq('id', approvalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Tool approved and will execute');
      queryClient.invalidateQueries({ queryKey: ['agent-approvals'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });
};

export const useRejectAgentTool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ approvalId, reviewNotes }: { approvalId: string; reviewNotes?: string }) => {
      const { data, error } = await supabase
        .from('agent_approvals')
        .update({
          status: 'rejected',
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes || null,
        })
        .eq('id', approvalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Tool rejected');
      queryClient.invalidateQueries({ queryKey: ['agent-approvals'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject: ${error.message}`);
    },
  });
};
