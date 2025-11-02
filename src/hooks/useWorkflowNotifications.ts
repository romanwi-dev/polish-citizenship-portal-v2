import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WorkflowNotification {
  id: string;
  workflow_instance_id: string;
  notification_type: string;
  severity: string;
  recipient_user_id?: string;
  recipient_email?: string;
  title: string;
  message: string;
  metadata: Record<string, any>;
  sent_at?: string;
  read_at?: string;
  sent_via_email: boolean;
  sent_via_in_app: boolean;
  sent_via_sms: boolean;
  created_at: string;
}

export const useWorkflowNotifications = (userId?: string) => {
  return useQuery({
    queryKey: ['workflow-notifications', userId],
    queryFn: async () => {
      let query = supabase
        .from('workflow_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (userId) {
        query = query.eq('recipient_user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WorkflowNotification[];
    },
  });
};

export const useUnreadNotificationsCount = (userId?: string) => {
  return useQuery({
    queryKey: ['unread-notifications-count', userId],
    queryFn: async () => {
      let query = supabase
        .from('workflow_notifications')
        .select('id', { count: 'exact', head: true })
        .is('read_at', null);

      if (userId) {
        query = query.eq('recipient_user_id', userId);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('workflow_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('workflow_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_user_id', userId)
        .is('read_at', null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
      toast.success('All notifications marked as read');
    },
  });
};

export const useCheckSLAViolations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('check_workflow_sla_violations');
      if (error) throw error;
      return data;
    },
    onSuccess: (violations: any) => {
      if (violations && violations.length > 0) {
        toast.error(`${violations.length} SLA violation(s) detected`);
      }
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['sla-violations'] });
    },
  });
};

export const useCheckSLAWarnings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('check_workflow_sla_warnings');
      if (error) throw error;
      return data;
    },
    onSuccess: (warnings: any) => {
      if (warnings && warnings.length > 0) {
        toast.warning(`${warnings.length} workflow(s) approaching deadline`);
      }
      queryClient.invalidateQueries({ queryKey: ['workflow-notifications'] });
    },
  });
};
