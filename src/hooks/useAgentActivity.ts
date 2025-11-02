import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AgentActivityFilters {
  caseId?: string;
  agentType?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
}

export interface AgentActivity {
  id: string;
  conversation_id: string;
  case_id: string;
  agent_type: string;
  user_id: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  response_time_ms: number;
  tools_executed: number;
  tools_failed: number;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

export const useAgentActivity = (filters: AgentActivityFilters = {}) => {
  return useQuery({
    queryKey: ['agent-activity', filters],
    queryFn: async () => {
      let query = supabase
        .from('ai_agent_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(filters.limit || 100);

      if (filters.caseId) {
        query = query.eq('case_id', filters.caseId);
      }

      if (filters.agentType) {
        query = query.eq('agent_type', filters.agentType);
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AgentActivity[];
    },
  });
};

export const useAgentMetrics = (period: 'day' | 'week' | 'month' = 'week') => {
  return useQuery({
    queryKey: ['agent-metrics', period],
    queryFn: async () => {
      const now = new Date();
      const periodStart = new Date();
      
      if (period === 'day') {
        periodStart.setDate(now.getDate() - 1);
      } else if (period === 'week') {
        periodStart.setDate(now.getDate() - 7);
      } else {
        periodStart.setMonth(now.getMonth() - 1);
      }

      const { data, error } = await supabase
        .from('ai_agent_metrics')
        .select('*')
        .gte('period_start', periodStart.toISOString())
        .order('period_start', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
