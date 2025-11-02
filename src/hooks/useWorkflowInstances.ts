import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WorkflowInstance {
  id: string;
  workflow_type: string;
  case_id: string;
  source_table: string;
  source_id: string;
  current_stage: string;
  status: string;
  assigned_to?: string;
  assigned_at?: string;
  deadline?: string;
  sla_violated: boolean;
  priority: string;
  metadata: Record<string, any>;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface UseWorkflowInstancesOptions {
  caseId?: string;
  workflowType?: string;
  status?: string;
  assignedTo?: string;
}

export const useWorkflowInstances = (options: UseWorkflowInstancesOptions = {}) => {
  return useQuery({
    queryKey: ['workflow-instances', options],
    queryFn: async () => {
      let query = supabase
        .from('workflow_instances')
        .select('*')
        .order('created_at', { ascending: false });

      if (options.caseId) {
        query = query.eq('case_id', options.caseId);
      }

      if (options.workflowType) {
        query = query.eq('workflow_type', options.workflowType);
      }

      if (options.status) {
        query = query.eq('status', options.status as any);
      }

      if (options.assignedTo) {
        query = query.eq('assigned_to', options.assignedTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as WorkflowInstance[];
    },
  });
};

export const useWorkflowInstance = (id: string) => {
  return useQuery({
    queryKey: ['workflow-instance', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_instances')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as WorkflowInstance;
    },
    enabled: !!id,
  });
};
