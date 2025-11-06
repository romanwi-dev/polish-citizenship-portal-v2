import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTranslationCounts = () => {
  return useQuery({
    queryKey: ['translation-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translation_requests')
        .select('status');
      
      if (error) throw error;
      
      return {
        pending: data?.filter(t => t.status === 'pending').length || 0,
        in_progress: data?.filter(t => t.status === 'in_progress').length || 0,
        quality_check: data?.filter(t => t.status === 'quality_check').length || 0,
        completed: data?.filter(t => t.status === 'completed').length || 0,
      };
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
};

export const useCitizenshipCounts = () => {
  return useQuery({
    queryKey: ['citizenship-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_instances')
        .select('current_stage')
        .eq('workflow_type', 'citizenship');
      
      if (error) throw error;
      
      return {
        preparing: data?.filter(w => w.current_stage === 'preparing').length || 0,
        submitted: data?.filter(w => w.current_stage === 'submitted').length || 0,
        schemes: data?.filter(w => w.current_stage === 'schemes').length || 0,
        decision: data?.filter(w => w.current_stage === 'decision').length || 0,
      };
    },
    refetchInterval: 5000,
  });
};

export const useCivilActsCounts = () => {
  return useQuery({
    queryKey: ['civil-acts-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usc_requests')
        .select('status');
      
      if (error) throw error;
      
      return {
        pending: data?.filter(u => u.status === 'draft' || u.status === 'pending').length || 0,
        in_progress: data?.filter(u => u.status === 'letter_sent').length || 0,
        awaiting: data?.filter(u => u.status === 'response_received').length || 0,
        completed: data?.filter(u => u.status === 'completed').length || 0,
      };
    },
    refetchInterval: 5000,
  });
};

export const useArchivesCounts = () => {
  return useQuery({
    queryKey: ['archives-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('archive_searches')
        .select('status');
      
      if (error) throw error;
      
      return {
        pending: data?.filter(a => a.status === 'pending').length || 0,
        submitted: data?.filter(a => a.status === 'letter_sent').length || 0,
        received: data?.filter(a => a.status === 'documents_received').length || 0,
        completed: data?.filter(a => a.status === 'completed').length || 0,
      };
    },
    refetchInterval: 5000,
  });
};

export const usePassportCounts = () => {
  return useQuery({
    queryKey: ['passport-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('passport_applications')
        .select('status');
      
      if (error) throw error;
      
      return {
        preparing: data?.filter(p => p.status === 'preparing').length || 0,
        scheduled: data?.filter(p => p.status === 'appointment_scheduled').length || 0,
        submitted: data?.filter(p => p.status === 'submitted').length || 0,
        issued: data?.filter(p => p.status === 'issued').length || 0,
      };
    },
    refetchInterval: 5000,
  });
};
