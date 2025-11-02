import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AgentNotification {
  id: string;
  notification_type: 'approval_pending' | 'approval_timeout' | 'tool_failed' | 'long_running_agent' | 'high_token_usage';
  conversation_id: string | null;
  recipient_user_id: string | null;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  read: boolean;
  read_at: string | null;
  created_at: string;
}

export const useAgentNotifications = (unreadOnly = false) => {
  return useQuery({
    queryKey: ['agent-notifications', unreadOnly],
    queryFn: async () => {
      let query = supabase
        .from('agent_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('read', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AgentNotification[];
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('agent_notifications')
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-notifications'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark as read: ${error.message}`);
    },
  });
};
