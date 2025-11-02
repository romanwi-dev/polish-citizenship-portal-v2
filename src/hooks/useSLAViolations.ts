import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SLAViolation {
  id: string;
  workflow_instance_id: string;
  violation_type: string;
  stage?: string;
  expected_completion?: string;
  actual_completion?: string;
  delay_hours?: number;
  escalated: boolean;
  escalated_to?: string;
  escalated_at?: string;
  resolved: boolean;
  resolved_at?: string;
  resolution_notes?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export const useSLAViolations = (options?: {
  resolved?: boolean;
  workflowType?: string;
}) => {
  return useQuery({
    queryKey: ['sla-violations', options],
    queryFn: async () => {
      let query = supabase
        .from('workflow_sla_violations')
        .select(`
          *,
          workflow_instances!inner(
            workflow_type,
            case_id,
            current_stage,
            cases(client_name, client_code)
          )
        `)
        .order('created_at', { ascending: false });

      if (options?.resolved !== undefined) {
        query = query.eq('resolved', options.resolved);
      }

      if (options?.workflowType) {
        query = query.eq('workflow_instances.workflow_type', options.workflowType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });
};

export const useActiveSLAViolations = () => {
  return useSLAViolations({ resolved: false });
};
